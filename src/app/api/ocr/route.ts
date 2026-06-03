import { NextRequest, NextResponse } from 'next/server';
import vision from '@google-cloud/vision';
import { rateLimit, getClientIp } from '@/lib/rateLimiter';

// Initialize Google Cloud Vision client
let client: any = null;

try {
  client = new vision.ImageAnnotatorClient();
} catch (error) {
  console.warn('Google Cloud Vision client initialization failed, using fallback mode:', error);
}

export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per IP per hour
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
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // If Google Cloud Vision is not available, use mock data
    if (!client) {
      console.log('Using mock OCR data (Google Cloud Vision not available)');
      const mockData = {
        routeName: 'Khon Kaen - Prathai',
        departureTime: '14:00',
      };
      
      return NextResponse.json({
        success: true,
        data: mockData,
        rawText: 'Mock OCR result',
        fallback: true,
      }, {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      });
    }

    // Convert image to buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Perform text detection using Google Cloud Vision
    // DOCUMENT_TEXT_DETECTION is better for Thai language and schedule signs
    const [result] = await client.documentTextDetection({
      image: { content: buffer },
    });

    const fullTextAnnotation = result.fullTextAnnotation;
    const text = fullTextAnnotation?.text || '';

    // Parse OCR text to extract route name and time
    const extractedData = parseOCRText(text);

    return NextResponse.json({
      success: true,
      data: extractedData,
      rawText: text,
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      }
    });
  } catch (error) {
    console.error('OCR failed:', error);
    
    // Check if it's a quota/rate limit error
    if (error instanceof Error && error.message.includes('Quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Fallback to mock data on error
    console.log('OCR failed, using mock data as fallback');
    const mockData = {
      routeName: 'Khon Kaen - Prathai',
      departureTime: '14:00',
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      rawText: 'Mock OCR result (fallback)',
      fallback: true,
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      }
    });
  }
}

function parseOCRText(text: string) {
  // Improved parsing logic for Thai and English
  const lines = text.split('\n').filter(line => line.trim());
  
  // Try to find time pattern (HH:MM or H:MM)
  const timeMatch = text.match(/\d{1,2}:\d{2}/);
  const departureTime = timeMatch ? timeMatch[0] : '';
  
  // Use first non-empty line as route name
  // Filter out common non-route text
  const routeName = lines.find(line => 
    line.length > 3 && 
    !line.match(/^\d+$/) && 
    !line.toLowerCase().includes('time') &&
    !line.toLowerCase().includes('schedule')
  ) || lines[0] || '';
  
  return { routeName, departureTime };
}
