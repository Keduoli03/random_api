import { NextResponse } from 'next/server';
import { db } from '@/db';
import { imagesTable, settingsTable } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import { incrementStat } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Record stats asynchronously
    incrementStat('images_viewed');
    incrementStat('total_api_calls');

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get random image
    let query = db.select().from(imagesTable).$dynamic();

    if (type === 'h' || type === 'v') {
      query = query.where(eq(imagesTable.orientation, type));
    }

    const randomImage = await query
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (randomImage.length === 0) {
      return NextResponse.json(
        { message: 'No images found' },
        { status: 404 }
      );
    }

    const image = randomImage[0];
    
    // Record orientation specific stats
    if (image.orientation === 'h') {
      incrementStat('images_viewed_h');
    } else if (image.orientation === 'v') {
      incrementStat('images_viewed_v');
    }

    const { protocol, host } = new URL(request.url);
    
    // Determine base URL: use IMAGE_PREFIX from DB settings if set
    // Otherwise fallback to current host
    const setting = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, 'image_prefix'))
      .limit(1);
    
    const imagePrefix = setting.length > 0 ? setting[0].value : null;
    
    // Prepare paths
    // DB stores path as /api/images/...
    // User requested to remove /api from the output URL (e.g. for CDN or clean paths)
    const rawPath = image.path;
    const pathWithoutApi = rawPath.startsWith('/api') ? rawPath.replace('/api', '') : rawPath;

    // Construct URL for JSON response (follows user preference to remove /api)
    let displayUrl: string;
    if (imagePrefix) {
      const cleanPrefix = imagePrefix.replace(/\/$/, '');
      const cleanPath = pathWithoutApi.startsWith('/') ? pathWithoutApi : `/${pathWithoutApi}`;
      displayUrl = `${cleanPrefix}${cleanPath}`;
    } else {
      // If no prefix, still remove /api as requested for the JSON output
      displayUrl = `${protocol}//${host}${pathWithoutApi}`;
    }

    // Check for return format
    const returnFormat = searchParams.get('return');
    if (returnFormat === 'path' || returnFormat === 'json') {
       return NextResponse.json({
         url: displayUrl,
         width: type === 'h' ? 1920 : 1080,
         height: type === 'h' ? 1080 : 1920,
         type: image.orientation
       });
    }

    // Redirect to the actual image URL
    // For redirect, if we are local (no prefix), we MUST use the valid path (with /api)
    // If we have a prefix (CDN), we assume the CDN handles the path without /api (or as configured)
    let redirectUrl: string;
    if (imagePrefix) {
        redirectUrl = displayUrl;
    } else {
        redirectUrl = `${protocol}//${host}${rawPath}`;
    }

    return NextResponse.redirect(redirectUrl, { status: 307 });
  } catch (error) {
    console.error('Error fetching random image:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
