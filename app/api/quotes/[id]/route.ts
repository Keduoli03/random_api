import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quotesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quoteId = parseInt(id);
    
    if (isNaN(quoteId)) {
      return NextResponse.json(
        { message: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, author, category } = body;

    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    const updatedQuote = await db
      .update(quotesTable)
      .set({
        content,
        author,
        category,
      })
      .where(eq(quotesTable.id, quoteId))
      .returning();

    if (updatedQuote.length === 0) {
      return NextResponse.json(
        { message: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedQuote[0]);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quoteId = parseInt(id);

    if (isNaN(quoteId)) {
      return NextResponse.json(
        { message: 'Invalid ID' },
        { status: 400 }
      );
    }

    const deletedQuote = await db
      .delete(quotesTable)
      .where(eq(quotesTable.id, quoteId))
      .returning();

    if (deletedQuote.length === 0) {
      return NextResponse.json(
        { message: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
