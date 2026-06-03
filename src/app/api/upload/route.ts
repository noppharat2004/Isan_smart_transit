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
    console.log('Upload request body:', body);
    
    const { status, statusNote, location, image, companyName, vehicleType, origin, destination, phoneNumbers } = body;

    // Validate required fields
    if (!companyName || !origin || !destination) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: companyName, origin, and destination' },
        { status: 400 }
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
    revalidatePath('/th', 'page');
    revalidatePath('/en', 'page');
    revalidatePath('/th/routes/[id]', 'page');
    revalidatePath('/en/routes/[id]', 'page');
    
    console.log('Pages revalidated');

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
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
