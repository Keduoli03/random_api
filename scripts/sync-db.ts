import { config } from 'dotenv';
import path from 'path';

// Load env vars from .env.local if present, otherwise .env
config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

import { syncImages } from '../lib/image-sync';

async function main() {
  console.log('Starting image sync...');
  try {
    const stats = await syncImages();
    console.log('Sync completed successfully.');
    console.log(`Added: ${stats.added}`);
    console.log(`Deleted: ${stats.deleted}`);
    console.log(`Total: ${stats.total}`);
    process.exit(0);
  } catch (error) {
    console.error('Error during image sync:', error);
    process.exit(1);
  }
}

main();
