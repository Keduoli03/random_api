import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settingsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, 'image_prefix'))
      .limit(1);

    const imagePrefix = setting.length > 0 ? setting[0].value : '';

    return NextResponse.json({ imagePrefix });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { imagePrefix } = await request.json();

    // Check if setting exists
    const existing = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, 'image_prefix'))
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db.update(settingsTable)
        .set({ 
          value: imagePrefix,
          updatedAt: new Date()
        })
        .where(eq(settingsTable.key, 'image_prefix'));
    } else {
      // Insert
      await db.insert(settingsTable)
        .values({
          key: 'image_prefix',
          value: imagePrefix
        });
    }

    return NextResponse.json({ message: 'Settings saved' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
