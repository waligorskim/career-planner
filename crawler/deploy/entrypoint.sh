#!/usr/bin/env bash
# Cloud Run Job entrypoint: sync SQLite DB from/to GCS around each crawl run.
# Uses the @google-cloud/storage SDK via a small helper script.
set -euo pipefail

DB_PATH="/app/data/jobs.db"

echo "[deploy] Downloading database from GCS..."
npx tsx deploy/gcs-sync.ts download || echo "[deploy] No existing database, starting fresh"

echo "[deploy] Running crawler..."
npx tsx src/index.ts
EXIT_CODE=$?

echo "[deploy] Uploading database to GCS..."
npx tsx deploy/gcs-sync.ts upload

echo "[deploy] Done (exit code: ${EXIT_CODE})"
exit ${EXIT_CODE}
