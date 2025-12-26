import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quotesTable } from '@/db/schema';
import { count, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await db.select({ count: count() }).from(quotesTable);
    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const quotes = await db
      .select()
      .from(quotesTable)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(quotesTable.id));

    return NextResponse.json({
      data: quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, author, category } = body;

    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    const newQuote = await db
      .insert(quotesTable)
      .values({
        content,
        author,
        category,
      })
      .returning();

    return NextResponse.json(newQuote[0], { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
