#!/usr/bin/env bash
# Rebuild and redeploy the crawler to Cloud Run Jobs.
#
# Usage:
#   export GCP_PROJECT=your-project-id
#   bash deploy/deploy.sh
set -euo pipefail

PROJECT="${GCP_PROJECT:?Set GCP_PROJECT}"
REGION="${GCP_REGION:-europe-central2}"
JOB_NAME="job-crawler"
REPO_NAME="job-crawler"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO_NAME}/${JOB_NAME}:latest"

echo "[deploy] Building image..."
gcloud builds submit \
  --tag="${IMAGE}" \
  --region="${REGION}" \
  ../

echo "[deploy] Updating Cloud Run Job..."
gcloud run jobs update "${JOB_NAME}" \
  --image="${IMAGE}" \
  --region="${REGION}"

echo "[deploy] Done. Run manually with:"
echo "  gcloud run jobs execute ${JOB_NAME} --region=${REGION}"
