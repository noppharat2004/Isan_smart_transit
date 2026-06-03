import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimiter';
import { revalidatePath } from 'next/cache';
import { addScheduleUpdate } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  console.log('Upload API called');
  
  // Rate limiting: 5 uploads per IP per hour
  const ip = getClientIp(request);
  const rateLimitResult = rateLimit(ip, 5, 60 * 60 * 1000);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded. Please try again later.',
        resetTime: rateLimitResult.resetTime 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
  }

  try {
    const body = await request.json();
    console.log('Upload API - Request received');
    console.log('Upload API - Body keys:', Object.keys(body));
    console.log('Upload API - Image size:', body.image ? body.image.length : 0);
    
    const { status, statusNote, location, image, companyName, vehicleType, origin, destination, phoneNumbers } = body;

    // Validate required fields
    if (!companyName || !origin || !destination) {
      console.log('Validation failed: missing required fields');
      console.log('companyName:', companyName);
      console.log('origin:', origin);
      console.log('destination:', destination);
      return NextResponse.json(
        { error: 'Missing required fields: companyName, origin, and destination' },
        { status: 400 }
      );
    }

    // Check image size (Vercel has 4.5MB body limit)
    if (image && image.length > 4 * 1024 * 1024) {
      console.log('Image too large:', image.length);
      return NextResponse.json(
        { error: 'Image size too large. Please use a smaller image.' },
        { status: 413 }
      );
    }

    // Save to data store (automatically tries Supabase first, then falls back to in-memory)
    // Map status to match Supabase enum values
    const mappedStatus = status === 'available' ? 'active' : 
                        status === 'seasonal' ? 'active' : 
                        status || 'active';
    
    const newUpdate = await addScheduleUpdate({
      route_id: null, // Will be matched later or left null
      route_name: `${origin} - ${destination}`, // Auto-generated from origin and destination
      company_name: companyName, // ชื่อบริษัททัวร์
      vehicle_type: vehicleType, // ประเภทรถ
      origin: origin, // ต้นทาง
      destination: destination, // ปลายทาง
      status: mappedStatus, // ใช้ค่าที่แปลงแล้ว
      status_note: statusNote, // รายละเอียดเพิ่มเติมเกี่ยวกับสถานะ
      phone_numbers: phoneNumbers || [], // เบอร์โทรติดต่อ
      lat: location?.lat,
      lng: location?.lng,
      image_url: image,
    });
    
    console.log('New update added:', newUpdate);

    // Revalidate pages to show new update immediately
    try {
      revalidatePath('/th', 'page');
      revalidatePath('/en', 'page');
      revalidatePath('/th/routes/[id]', 'page');
      revalidatePath('/en/routes/[id]', 'page');
      console.log('Pages revalidated successfully');
    } catch (revalidateError) {
      console.error('Revalidation failed:', revalidateError);
      // Continue anyway - revalidation failure shouldn't break upload
    }

    return NextResponse.json({
      success: true,
      data: newUpdate,
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      }
    });
  } catch (error) {
    console.error('Upload API - Error occurred:', error);
    console.error('Upload API - Error type:', typeof error);
    console.error('Upload API - Error details:', error instanceof Error ? error.message : String(error));
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('body too large') || error.message.includes('PayloadTooLargeError')) {
        return NextResponse.json(
          { error: 'Request body too large', details: 'Image size exceeds limits. Please use smaller images.' },
          { status: 413 }
        );
      }
      
      return NextResponse.json(
        { error: 'Upload failed', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Upload failed', details: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
