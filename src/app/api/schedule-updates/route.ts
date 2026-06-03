import { NextResponse } from 'next/server';
import { getScheduleUpdates } from '@/lib/dataStore';

export async function GET() {
  try {
    const updates = await getScheduleUpdates();
    
    return NextResponse.json({
      success: true,
      data: updates,
    });
  } catch (error) {
    console.error('Failed to fetch schedule updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule updates' },
      { status: 500 }
    );
  }
}
