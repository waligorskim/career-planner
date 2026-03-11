/**
 * Sync jobs.db to/from Google Cloud Storage.
 * Usage:
 *   npx tsx deploy/gcs-sync.ts download   # GCS -> local
 *   npx tsx deploy/gcs-sync.ts upload     # local -> GCS
 *
 * Env: GCS_BUCKET (required)
 * Auth: Uses Application Default Credentials (automatic on Cloud Run)
 */
import { Storage } from '@google-cloud/storage';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'jobs.db');
const BUCKET = process.env.GCS_BUCKET;

if (!BUCKET) {
  console.error('GCS_BUCKET env var is required');
  process.exit(1);
}

const storage = new Storage();
const bucket = storage.bucket(BUCKET);
const file = bucket.file('jobs.db');

const command = process.argv[2];

if (command === 'download') {
  const [exists] = await file.exists();
  if (!exists) {
    console.log('[gcs-sync] No database in GCS yet');
    process.exit(1);
  }
  await file.download({ destination: DB_PATH });
  console.log(`[gcs-sync] Downloaded to ${DB_PATH}`);
} else if (command === 'upload') {
  if (!existsSync(DB_PATH)) {
    console.error(`[gcs-sync] ${DB_PATH} not found, nothing to upload`);
    process.exit(1);
  }
  // Checkpoint WAL before uploading (merge WAL into main file)
  const walPath = `${DB_PATH}-wal`;
  if (existsSync(walPath)) {
    const Database = (await import('better-sqlite3')).default;
    const db = new Database(DB_PATH);
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();
    console.log('[gcs-sync] WAL checkpointed');
  }
  await bucket.upload(DB_PATH, { destination: 'jobs.db' });
  console.log(`[gcs-sync] Uploaded to gs://${BUCKET}/jobs.db`);
} else {
  console.error('Usage: gcs-sync.ts [download|upload]');
  process.exit(1);
}
