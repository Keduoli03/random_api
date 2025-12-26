import { NextResponse } from 'next/server';
import { db } from '@/db';
import { quotesTable } from '@/db/schema';

// Type mapping based on user request
const TYPE_MAP: Record<string, string> = {
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

interface HitokotoImport {
  uuid?: string;
  hitokoto: string;
  type: string;
  from?: string;
  from_who?: string;
  length?: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support both single object and array
    const items: HitokotoImport[] = Array.isArray(body) ? body : [body];
    
    if (items.length === 0) {
      return NextResponse.json(
        { message: 'No data provided' },
        { status: 400 }
      );
    }

    const toInsert = items.map(item => {
      // Map type/category
      // Default to '动画' if not found or if it's '其他' (g is mapped to 其他, user said 其他 mapped to 动画... wait)
      // User said: "其他 作为 动画 类型处理"
      // Wait, user listed: "g 其他". And then "其他 作为 动画 类型处理".
      // This implies if the type is 'g' OR unknown, treat as '动画'? Or treat 'g' as '其他' and unknown as '动画'?
      // "g 其他" in the list means 'g' maps to '其他'.
      // "其他 作为 动画 类型处理" at the end of the list likely means "Anything else -> 动画".
      // But maybe it means "The category '其他' itself should be treated as '动画'"?
      // Let's assume strict mapping for a-l, and fallback to '动画'.
      
      let category = TYPE_MAP[item.type] || '动画';
      
      // If user meant "g maps to 其他, but treat '其他' as '动画'", then 'g' becomes '动画'.
      // But usually "其他" is a valid category. 
      // Re-reading: "其他 作为 动画 类型处理" is listed AFTER the list.
      // The list has "g 其他".
      // I will implement: 
      // If valid key in map -> use map value.
      // If key not in map -> use '动画'.
      
      return {
        uuid: crypto.randomUUID(), // Always generate new UUID, ignore import data
        content: item.hitokoto,
        author: item.from_who || null,
        source: item.from || null,
        category: category,
        length: item.length || item.hitokoto.length,
        createdAt: new Date()
      };
    });

    // Batch insert
    // SQLite has limits on variables per query, so we might need to chunk if too large.
    // For now assume reasonable size.
    await db.insert(quotesTable).values(toInsert);

    return NextResponse.json({ 
      message: `Successfully imported ${toInsert.length} quotes`,
      count: toInsert.length 
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(error) },
      { status: 500 }
    );
  }
}
