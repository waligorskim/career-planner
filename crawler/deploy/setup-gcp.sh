#!/usr/bin/env bash
# One-time GCP setup for the job crawler Cloud Run Job.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - A GCP project created
#
# Usage:
#   export GCP_PROJECT=your-project-id
#   export GCP_REGION=europe-central2        # Warsaw
#   bash deploy/setup-gcp.sh
set -euo pipefail

PROJECT="${GCP_PROJECT:?Set GCP_PROJECT}"
REGION="${GCP_REGION:-europe-central2}"
BUCKET="${GCP_BUCKET:-${PROJECT}-job-crawler-db}"
SERVICE_ACCOUNT="job-crawler@${PROJECT}.iam.gserviceaccount.com"
JOB_NAME="job-crawler"
REPO_NAME="job-crawler"

echo "=== GCP Job Crawler Setup ==="
echo "Project:  ${PROJECT}"
echo "Region:   ${REGION}"
echo "Bucket:   ${BUCKET}"
echo ""

# Set project
gcloud config set project "${PROJECT}"

# 1. Enable required APIs
echo "[1/7] Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudscheduler.googleapis.com \
  artifactregistry.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com

# 2. Create Artifact Registry repo for Docker images
echo "[2/7] Creating Artifact Registry repository..."
gcloud artifacts repositories create "${REPO_NAME}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Job crawler container images" \
  2>/dev/null || echo "  (already exists)"

# 3. Create GCS bucket for SQLite persistence
echo "[3/7] Creating GCS bucket..."
gcloud storage buckets create "gs://${BUCKET}" \
  --location="${REGION}" \
  --uniform-bucket-level-access \
  2>/dev/null || echo "  (already exists)"

# Set lifecycle: delete old versions after 30 days (optional cleanup)
cat > /tmp/lifecycle.json <<'EOF'
{
  "rule": [
    {
      "action": { "type": "Delete" },
      "condition": { "age": 30, "isLive": false }
    }
  ]
}
EOF
gcloud storage buckets update "gs://${BUCKET}" --lifecycle-file=/tmp/lifecycle.json

# Enable versioning so we never lose the DB
gcloud storage buckets update "gs://${BUCKET}" --versioning

# 4. Create service account
echo "[4/7] Creating service account..."
gcloud iam service-accounts create job-crawler \
  --display-name="Job Crawler" \
  2>/dev/null || echo "  (already exists)"

# Grant permissions: GCS read/write + Secret Manager access
gcloud projects add-iam-policy-binding "${PROJECT}" \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/storage.objectUser" \
  --quiet

gcloud projects add-iam-policy-binding "${PROJECT}" \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

# 5. Create secrets
echo "[5/7] Creating secrets (you'll need to add values)..."
for SECRET in ANTHROPIC_API_KEY TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID; do
  gcloud secrets create "${SECRET}" \
    --replication-policy="automatic" \
    2>/dev/null || echo "  ${SECRET} already exists"
done

echo ""
echo "  *** Add secret values with: ***"
echo "  echo -n 'your-key' | gcloud secrets versions add ANTHROPIC_API_KEY --data-file=-"
echo "  echo -n 'your-token' | gcloud secrets versions add TELEGRAM_BOT_TOKEN --data-file=-"
echo "  echo -n 'your-chat-id' | gcloud secrets versions add TELEGRAM_CHAT_ID --data-file=-"
echo ""

# 6. Build and push container image
echo "[6/7] Building container image..."
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO_NAME}/${JOB_NAME}:latest"

gcloud builds submit \
  --tag="${IMAGE}" \
  --region="${REGION}" \
  ../

echo "  Image: ${IMAGE}"

# 7. Create Cloud Run Job
echo "[7/7] Creating Cloud Run Job..."
gcloud run jobs create "${JOB_NAME}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --service-account="${SERVICE_ACCOUNT}" \
  --task-timeout=900 \
  --max-retries=1 \
  --memory=512Mi \
  --cpu=1 \
  --set-env-vars="GCS_BUCKET=${BUCKET}" \
  --set-secrets="ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,TELEGRAM_BOT_TOKEN=TELEGRAM_BOT_TOKEN:latest,TELEGRAM_CHAT_ID=TELEGRAM_CHAT_ID:latest" \
  --command="bash" \
  --args="deploy/entrypoint.sh" \
  2>/dev/null || \
gcloud run jobs update "${JOB_NAME}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --service-account="${SERVICE_ACCOUNT}" \
  --task-timeout=900 \
  --max-retries=1 \
  --memory=512Mi \
  --cpu=1 \
  --set-env-vars="GCS_BUCKET=${BUCKET}" \
  --set-secrets="ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,TELEGRAM_BOT_TOKEN=TELEGRAM_BOT_TOKEN:latest,TELEGRAM_CHAT_ID=TELEGRAM_CHAT_ID:latest" \
  --command="bash" \
  --args="deploy/entrypoint.sh"

# Create Cloud Scheduler trigger (every 6 hours)
echo ""
echo "[Bonus] Creating Cloud Scheduler trigger..."
gcloud scheduler jobs create http "${JOB_NAME}-trigger" \
  --location="${REGION}" \
  --schedule="0 0,6,12,18 * * *" \
  --time-zone="Europe/Warsaw" \
  --uri="https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT}/jobs/${JOB_NAME}:run" \
  --http-method=POST \
  --oauth-service-account-email="${SERVICE_ACCOUNT}" \
  2>/dev/null || echo "  Scheduler job already exists (update manually if needed)"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Test manually:  gcloud run jobs execute ${JOB_NAME} --region=${REGION}"
echo "View logs:      gcloud run jobs executions list --job=${JOB_NAME} --region=${REGION}"
echo "View DB:        gcloud storage cp gs://${BUCKET}/jobs.db ./jobs-backup.db"
