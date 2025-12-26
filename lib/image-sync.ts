import fs from 'fs';
import path from 'path';
import { db } from '@/db';
import { imagesTable, statisticsTable } from '@/db/schema';
import { inArray, sql } from 'drizzle-orm';
import sizeOf from 'image-size';

export async function syncImages() {
  const dataDir = path.join(process.cwd(), 'app', 'data', 'Image');
  
  if (!fs.existsSync(dataDir)) {
      console.warn('Image directory not found, skipping sync.');
      return { added: 0, deleted: 0, total: 0 };
  }

  // Scan root (flat) and h/v subdirectories for backward compatibility
  const dirsToScan = [
      { path: dataDir, prefix: '' },
      { path: path.join(dataDir, 'h'), prefix: 'h/' },
      { path: path.join(dataDir, 'v'), prefix: 'v/' }
  ];

  const diskImages: {
      filename: string;
      orientation: 'h' | 'v';
      path: string;
      fullKey: string;
  }[] = [];

  for (const dir of dirsToScan) {
      if (!fs.existsSync(dir.path)) continue;
      
      const files = fs.readdirSync(dir.path);
      for (const file of files) {
          if (file.startsWith('.')) continue;
          const filePath = path.join(dir.path, file);
          
          try {
              if (fs.statSync(filePath).isDirectory()) continue;
              
              const buffer = fs.readFileSync(filePath);
              const dimensions = sizeOf(buffer);
              if (dimensions && dimensions.width && dimensions.height) {
                  const orientation = dimensions.height > dimensions.width ? 'v' : 'h';
                  
                  // Path logic:
                  // Flat: /api/images/filename.jpg
                  // Subdir: /api/images/h/filename.jpg
                  const apiPath = dir.prefix 
                      ? `/api/images/${dir.prefix}${file}`
                      : `/api/images/${file}`;
                  
                  // Key for deduplication (path is unique enough)
                  diskImages.push({
                      filename: file,
                      orientation,
                      path: apiPath,
                      fullKey: apiPath
                  });
              }
          } catch (e) {
              // Ignore non-images
          }
      }
  }

  // DB Sync
  const dbImages = await db.select().from(imagesTable);
  const dbImagePaths = new Set(dbImages.map(img => img.path));
  const diskImagePaths = new Set(diskImages.map(img => img.path));

  const toAdd = diskImages.filter(img => !dbImagePaths.has(img.path));
  const toDelete = dbImages.filter(img => !diskImagePaths.has(img.path));

  if (toAdd.length > 0 || toDelete.length > 0) {
      await db.transaction(async (tx) => {
          if (toAdd.length > 0) {
              await tx.insert(imagesTable).values(toAdd.map(img => ({
                  filename: img.filename,
                  orientation: img.orientation,
                  path: img.path
              })));
          }
          if (toDelete.length > 0) {
              await tx.delete(imagesTable).where(inArray(imagesTable.id, toDelete.map(img => img.id)));
          }
      });
  }

  // Calculate and update image counts
  const total = diskImages.length;
  const hCount = diskImages.filter(img => img.orientation === 'h').length;
  const vCount = diskImages.filter(img => img.orientation === 'v').length;

  const statsToUpdate = [
      { key: 'total_images', value: total },
      { key: 'total_images_h', value: hCount },
      { key: 'total_images_v', value: vCount }
  ];

  for (const stat of statsToUpdate) {
      await db.insert(statisticsTable)
          .values({ key: stat.key, value: stat.value })
          .onConflictDoUpdate({
              target: statisticsTable.key,
              set: { 
                  value: stat.value,
                  updatedAt: new Date()
              }
          });
  }

  return { added: toAdd.length, deleted: toDelete.length, total: diskImages.length };
}
