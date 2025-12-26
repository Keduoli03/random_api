import { NextResponse } from 'next/server';
import { syncImages } from '@/lib/image-sync';

export async function POST() {
  try {
    const stats = await syncImages();

    return NextResponse.json({ 
      message: 'Sync completed', 
      stats
    });
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json(
      { message: 'Sync failed', error: String(err) },
      { status: 500 }
    );
  }
}
