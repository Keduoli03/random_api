import { db } from '@/db';
import { statisticsTable } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function incrementStat(key: string) {
  try {
    await db.insert(statisticsTable)
      .values({ key, value: 1 })
      .onConflictDoUpdate({
        target: statisticsTable.key,
        set: { 
          value: sql`${statisticsTable.value} + 1`,
          updatedAt: new Date()
        }
      });
  } catch (error) {
    console.error(`Error incrementing stat ${key}:`, error);
  }
}
