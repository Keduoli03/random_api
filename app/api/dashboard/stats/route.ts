import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quotesTable, imagesTable, statisticsTable } from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const quotesCountResult = await db.select({ count: sql<number>`count(*)` }).from(quotesTable);
    const quotesCount = quotesCountResult[0].count;

    // Fetch usage stats and image counts from statistics table
    const stats = await db.select().from(statisticsTable);
    const usage = {
      total: 0,
      quotes: 0,
      images: 0,
      images_h: 0,
      images_v: 0
    };

    const imagesCount = {
      h: 0,
      v: 0,
      total: 0
    };

    stats.forEach(stat => {
      // Usage stats
      if (stat.key === 'total_api_calls') usage.total = stat.value;
      if (stat.key === 'quotes_viewed') usage.quotes = stat.value;
      if (stat.key === 'images_viewed') usage.images = stat.value;
      if (stat.key === 'images_viewed_h') usage.images_h = stat.value;
      if (stat.key === 'images_viewed_v') usage.images_v = stat.value;
      
      // Image inventory counts
      if (stat.key === 'total_images') imagesCount.total = stat.value;
      if (stat.key === 'total_images_h') imagesCount.h = stat.value;
      if (stat.key === 'total_images_v') imagesCount.v = stat.value;
    });

    return NextResponse.json({
      quotes: quotesCount,
      images: imagesCount,
      usage
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
