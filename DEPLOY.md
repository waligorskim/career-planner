# Deploy — GCP Cloud Run Jobs

This guide enables an AI agent with terminal access to deploy the Polish Job Crawler to Google Cloud Platform. No codebase knowledge required — just follow the steps.

## Overview

The crawler runs as a **scheduled container job** every 6 hours. It scrapes 3 Polish job boards, scores matches with Claude AI, and sends alerts via Telegram.

```
┌─────────────────┐     triggers      ┌──────────────────────────┐
│ Cloud Scheduler  │ ───────────────→  │    Cloud Run Job         │
│ (every 6 hours)  │                   │    (Node 22 container)   │
└─────────────────┘                   │                          │
                                       │  1. Download jobs.db     │
                                       │     from GCS             │
                                       │  2. Scrape job boards    │
                                       │  3. Score with Claude AI │
                                       │  4. Send Telegram alerts │
                                       │  5. Upload jobs.db       │
                                       │     back to GCS          │
                                       └──────────┬───────────────┘
                                                  │
                           ┌──────────────────────┼──────────────────────┐
                           │                      │                      │
                    ┌──────▼──────┐   ┌───────────▼──────┐   ┌──────────▼──────┐
                    │ GCS Bucket   │   │ Anthropic API    │   │ Telegram API    │
                    │ (jobs.db)    │   │ (scoring)        │   │ (notifications) │
                    └─────────────┘   └──────────────────┘   └─────────────────┘
```

**Cost:** ~$2-4/month (Cloud Run ~$0.50, GCS ~$0.01, Anthropic ~$1-3, Scheduler free)

---

## Prerequisites

Before deploying, you need:

1. **`gcloud` CLI** installed and authenticated
   ```bash
   # Install: https://cloud.google.com/sdk/docs/install
   gcloud auth login
   gcloud auth application-default login
   ```

2. **A GCP project** with billing enabled
   ```bash
   # Create one if needed:
   gcloud projects create my-job-crawler --name="Job Crawler"
   gcloud billing accounts list  # find your billing account ID
   gcloud billing projects link my-job-crawler --billing-account=<BILLING_ACCOUNT_ID>
   ```

3. **Three secret values** (the user must provide these):

   | Secret | How to get it |
   |--------|---------------|
   | `ANTHROPIC_API_KEY` | Create at https://console.anthropic.com/settings/keys |
   | `TELEGRAM_BOT_TOKEN` | Message `@BotFather` on Telegram → `/newbot` → copy token |
   | `TELEGRAM_CHAT_ID` | Message `@userinfobot` on Telegram → copy your chat ID |

4. **Docker is NOT needed locally** — Cloud Build handles container builds in the cloud.

---

## Quick Deploy

Run these commands sequentially. Replace the three `<placeholder>` values.

```bash
# 1. Set your GCP project (replace with your actual project ID)
export GCP_PROJECT=<your-gcp-project-id>
export GCP_REGION=europe-central2  # Warsaw — closest to Polish job boards

# 2. Run the one-time setup script (creates all GCP resources + builds container)
cd crawler
bash deploy/setup-gcp.sh

# 3. Add your secret values (replace placeholders with actual values)
echo -n '<your-anthropic-api-key>' | gcloud secrets versions add ANTHROPIC_API_KEY --data-file=-
echo -n '<your-telegram-bot-token>' | gcloud secrets versions add TELEGRAM_BOT_TOKEN --data-file=-
echo -n '<your-telegram-chat-id>' | gcloud secrets versions add TELEGRAM_CHAT_ID --data-file=-

# 4. Test with a manual run
gcloud run jobs execute job-crawler --region=europe-central2

# 5. Watch the logs
gcloud run jobs executions list --job=job-crawler --region=europe-central2
```

After step 2, Cloud Scheduler is already configured — the crawler will automatically run every 6 hours at 00:00, 06:00, 12:00, 18:00 Warsaw time.

---

## What `setup-gcp.sh` Does

The setup script automates 7 steps. If you need to run any step individually (e.g., the script fails partway through), here's what each one does:

| Step | What it does | Manual command |
|------|-------------|----------------|
| 1/7 | Enable GCP APIs (Cloud Run, Scheduler, Artifact Registry, Storage, Secret Manager) | `gcloud services enable run.googleapis.com cloudscheduler.googleapis.com artifactregistry.googleapis.com storage.googleapis.com secretmanager.googleapis.com` |
| 2/7 | Create Artifact Registry Docker repository | `gcloud artifacts repositories create job-crawler --repository-format=docker --location=$GCP_REGION` |
| 3/7 | Create versioned GCS bucket for SQLite persistence | `gcloud storage buckets create gs://${GCP_PROJECT}-job-crawler-db --location=$GCP_REGION --uniform-bucket-level-access` |
| 4/7 | Create service account with Storage + Secret Manager roles | `gcloud iam service-accounts create job-crawler` + IAM bindings |
| 5/7 | Create empty secrets (values added separately) | `gcloud secrets create ANTHROPIC_API_KEY` (etc.) |
| 6/7 | Build Docker image via Cloud Build | `gcloud builds submit --tag=$IMAGE ../` |
| 7/7 | Create Cloud Run Job + Cloud Scheduler trigger | `gcloud run jobs create job-crawler ...` + `gcloud scheduler jobs create http ...` |

All steps are idempotent — safe to re-run if something fails.

---

## Architecture Details

### Container (Dockerfile)

- **Base image:** `node:22-slim`
- **Build tools:** `python3 make g++` (required for `better-sqlite3` native compilation)
- **Image size:** ~200MB
- **Location:** `crawler/Dockerfile`

### Entrypoint Flow (deploy/entrypoint.sh)

The container doesn't run `src/index.ts` directly. Instead, Cloud Run overrides the command to run `deploy/entrypoint.sh`, which:

1. Downloads `jobs.db` from GCS bucket (or starts fresh if none exists)
2. Runs `npx tsx src/index.ts` (the actual crawler)
3. Checkpoints SQLite WAL (merges write-ahead log into main DB file)
4. Uploads `jobs.db` back to GCS

### GCS Sync (deploy/gcs-sync.ts)

TypeScript helper using `@google-cloud/storage` SDK. Authentication is automatic on Cloud Run via Application Default Credentials — no API keys needed for GCS access.

### Secrets

Stored in GCP Secret Manager, injected as environment variables by Cloud Run:
- `ANTHROPIC_API_KEY` → used by `src/scoring/relevance.ts`
- `TELEGRAM_BOT_TOKEN` → used by `src/notifications/telegram.ts`
- `TELEGRAM_CHAT_ID` → used by `src/notifications/telegram.ts`

### Resource Limits

- **Timeout:** 900 seconds (15 minutes) — typical crawl takes 5-15 minutes
- **Memory:** 512 Mi
- **CPU:** 1 vCPU
- **Max retries:** 1

---

## Operational Commands

### Run manually
```bash
gcloud run jobs execute job-crawler --region=europe-central2
```

### View execution history
```bash
gcloud run jobs executions list --job=job-crawler --region=europe-central2
```

### View logs for latest execution
```bash
gcloud logging read \
  "resource.type=cloud_run_job AND resource.labels.job_name=job-crawler" \
  --limit=100 \
  --format="table(timestamp,textPayload)"
```

### Download database locally (for inspection or backup)
```bash
gcloud storage cp gs://<GCP_PROJECT>-job-crawler-db/jobs.db ./jobs-backup.db

# Query it locally:
sqlite3 ./jobs-backup.db "SELECT score, title, company FROM jobs WHERE score >= 75 ORDER BY score DESC;"
```

### Redeploy after code changes
```bash
cd crawler
export GCP_PROJECT=<your-project-id>
bash deploy/deploy.sh
```

### Change schedule
```bash
# Run every 4 hours instead of 6:
gcloud scheduler jobs update http job-crawler-trigger \
  --location=europe-central2 \
  --schedule="0 */4 * * *"

# Pause the schedule:
gcloud scheduler jobs pause job-crawler-trigger --location=europe-central2

# Resume:
gcloud scheduler jobs resume job-crawler-trigger --location=europe-central2
```

### Update a secret
```bash
echo -n 'new-api-key-value' | gcloud secrets versions add ANTHROPIC_API_KEY --data-file=-
# No redeploy needed — Cloud Run reads `:latest` version on each run
```

### Delete everything (teardown)
```bash
PROJECT=<your-project-id>
REGION=europe-central2
BUCKET="${PROJECT}-job-crawler-db"

# Download DB backup first!
gcloud storage cp "gs://${BUCKET}/jobs.db" ./jobs-final-backup.db

# Delete resources
gcloud scheduler jobs delete job-crawler-trigger --location=${REGION} --quiet
gcloud run jobs delete job-crawler --region=${REGION} --quiet
gcloud storage rm -r "gs://${BUCKET}" --quiet
gcloud artifacts repositories delete job-crawler --location=${REGION} --quiet
gcloud secrets delete ANTHROPIC_API_KEY --quiet
gcloud secrets delete TELEGRAM_BOT_TOKEN --quiet
gcloud secrets delete TELEGRAM_CHAT_ID --quiet
gcloud iam service-accounts delete "job-crawler@${PROJECT}.iam.gserviceaccount.com" --quiet
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key for Claude-based job scoring |
| `TELEGRAM_BOT_TOKEN` | Yes | — | Telegram bot token for sending notifications |
| `TELEGRAM_CHAT_ID` | Yes | — | Telegram chat/user ID to receive alerts |
| `GCS_BUCKET` | Yes (set by setup script) | `${PROJECT}-job-crawler-db` | GCS bucket name for SQLite persistence |
| `SCORING_MODEL` | No | `claude-haiku-4-5-20251001` | Override the Claude model used for scoring |
| `ALERT_THRESHOLD` | No | `75` | Minimum score (0-100) for instant Telegram alerts |
| `DIGEST_THRESHOLD` | No | `50` | Minimum score for inclusion in digest notifications |

To add optional env vars to the Cloud Run Job:
```bash
gcloud run jobs update job-crawler \
  --region=europe-central2 \
  --set-env-vars="SCORING_MODEL=claude-haiku-4-5-20251001,ALERT_THRESHOLD=80"
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `PERMISSION_DENIED` on GCS | Service account missing Storage role | `gcloud projects add-iam-policy-binding $PROJECT --member="serviceAccount:job-crawler@$PROJECT.iam.gserviceaccount.com" --role="roles/storage.objectUser"` |
| `better-sqlite3` build fails during Docker build | Missing build tools | Ensure Dockerfile has `apt-get install -y python3 make g++` |
| Job execution times out | Crawl taking >15min | Increase timeout: `gcloud run jobs update job-crawler --task-timeout=1800 --region=europe-central2` |
| `Secret not found` error | Secret name mismatch or not created | Verify with `gcloud secrets list` and ensure names match exactly: `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| 0 jobs scraped | Job board changed API/HTML structure | Check logs for HTTP errors. Scrapers may need selector/endpoint updates in `src/scrapers/` |
| `DEADLINE_EXCEEDED` on Cloud Build | Slow Docker build | Add `--timeout=1200` to `gcloud builds submit` in `setup-gcp.sh` |
| Telegram notifications not arriving | Bot not started or wrong chat ID | Message your bot on Telegram first (`/start`). Verify chat ID with `@userinfobot` |
| GCS sync fails on first run | No database exists yet | Expected — entrypoint handles this gracefully and starts fresh |

---

## File Map

| File | Purpose |
|------|---------|
| `crawler/Dockerfile` | Container image definition (Node 22 + native build tools) |
| `crawler/.dockerignore` | Excludes `node_modules/`, `data/`, `.env`, setup scripts from image |
| `crawler/deploy/setup-gcp.sh` | One-time GCP infrastructure setup (run once) |
| `crawler/deploy/deploy.sh` | Rebuild and redeploy after code changes |
| `crawler/deploy/entrypoint.sh` | Container entrypoint: GCS download → crawl → GCS upload |
| `crawler/deploy/gcs-sync.ts` | TypeScript helper for GCS upload/download of `jobs.db` |
| `crawler/.env.example` | Template showing all environment variables |
| `crawler/.github/workflows/crawl.yml` | GitHub Actions alternative (if not using GCP) |

---

## Alternative: GitHub Actions (Already Configured)

If you prefer GitHub Actions over GCP, the crawler already has a working workflow at `crawler/.github/workflows/crawl.yml`. Just add secrets to your GitHub repository settings:

1. Go to **Settings → Secrets and variables → Actions**
2. Add: `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
3. The workflow runs automatically every 6 hours via cron

The GitHub Actions approach is simpler but has weaker database persistence (uses action cache). GCP is recommended for production use.
