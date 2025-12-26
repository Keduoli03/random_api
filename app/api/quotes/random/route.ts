import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quotesTable } from '@/db/schema';
import { sql, and, gte, lte, eq } from 'drizzle-orm';
import { incrementStat } from '@/lib/stats';

// Mapping from 'c' parameter to DB category values
const categoryMap: Record<string, string> = {
  'a': '动画',
  'b': '漫画',
  'c': '游戏',
  'd': '文学',
  'e': '原创',
  'f': '来自网络',
  'g': '其他',
  'h': '影视',
  'i': '诗词',
  'j': '网易云',
  'k': '哲学',
  'l': '抖机灵'
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const c = searchParams.get('c'); // Category
    const minLength = searchParams.get('min_length');
    const maxLength = searchParams.get('max_length');

    // Record stats asynchronously
    incrementStat('quotes_viewed');
    incrementStat('total_api_calls');

    // Build conditions
    const conditions = [];

    if (c && categoryMap[c]) {
      conditions.push(eq(quotesTable.category, categoryMap[c]));
    }

    if (minLength) {
      const min = parseInt(minLength);
      if (!isNaN(min)) {
        conditions.push(gte(quotesTable.length, min));
      }
    }

    if (maxLength) {
      const max = parseInt(maxLength);
      if (!isNaN(max)) {
        conditions.push(lte(quotesTable.length, max));
      }
    }

    // Get a random quote using SQLite's RANDOM()
    const query = db
      .select()
      .from(quotesTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const randomQuote = await query;

    if (randomQuote.length === 0) {
      return NextResponse.json(
        { message: 'No quotes found matching criteria' },
        { status: 404 }
      );
    }

    return NextResponse.json(randomQuote[0]);
  } catch (error) {
    console.error('Error fetching random quote:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
