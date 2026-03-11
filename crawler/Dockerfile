FROM node:22-slim

# better-sqlite3 needs build tools for native compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and deploy scripts
COPY tsconfig.json ./
COPY src/ src/
COPY deploy/ deploy/
COPY profile-summary.txt ./

# Ensure data directory exists
RUN mkdir -p data

# Default: run directly (override with entrypoint.sh for GCS sync)
CMD ["npx", "tsx", "src/index.ts"]
