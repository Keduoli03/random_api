import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { incrementStat } from '@/lib/stats';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Record stats asynchronously
    incrementStat('images_viewed');
    incrementStat('total_api_calls');

    // Await params as it is a Promise in Next.js 15+
    const resolvedParams = await params;
    const filePathComponents = resolvedParams.path;
    
    // Construct the absolute path to the file
    // Assumes images are stored in app/data/Image/
    const filePath = path.join(process.cwd(), 'app', 'data', 'Image', ...filePathComponents);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = mime.getType(filePath) || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
