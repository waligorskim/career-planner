# Development Roadmap — Polish Job Crawler

## Current State (Phase 1 — MVP) ✅

Shipped and functional. Located in `crawler/`.

| Component | Status | Implementation |
|-----------|--------|----------------|
| JustJoin.it scraper | ✅ | REST API, category + keyword search (`src/scrapers/justjoin.ts`) |
| NoFluffJobs scraper | ✅ | REST API, 6 search criteria (`src/scrapers/nofluffjobs.ts`) |
| Bulldogjob.pl scraper | ✅ | HTML scraping with Cheerio (`src/scrapers/bulldogjob.ts`) |
| SQLite storage | ✅ | Dedup, scoring history, status tracking (`src/storage/sqlite.ts`) |
| AI scoring | ✅ | Claude Haiku, 0-100 score + verdict (`src/scoring/relevance.ts`) |
| Telegram notifications | ✅ | Instant alerts (75+), daily digest (50+) (`src/notifications/telegram.ts`) |
| GitHub Actions cron | ✅ | Every 6 hours, DB cached across runs (`.github/workflows/crawl.yml`) |
| Keyword fallback scorer | ✅ | Works when Anthropic API is unavailable |

**Stack:** TypeScript, Cheerio, better-sqlite3, Anthropic SDK, Telegram Bot API, GitHub Actions.

---

## Phase 2: Expand Sources

**Goal:** Triple the coverage by adding high-value Polish job boards and meta-sources.

| # | Task | Priority | Effort | Dependencies | Notes |
|---|------|----------|--------|-------------|-------|
| 2.1 | **theprotocol.it scraper** | HIGH | 1 day | Playwright | Sister site of Pracuj.pl. Returns 403 on direct fetch — needs headless browser. Inspect network tab for internal JSON API. See JOB-BOARD-LIBRARY.md. |
| 2.2 | **Pracuj.pl scraper** | HIGH | 1-2 days | Playwright | Largest PL board. JS-heavy rendering. Internal XHR endpoints exist — discover via DevTools network tab. Pagination via `?pn=`. |
| 2.3 | **LinkedIn Jobs integration** | HIGH | 1 day | JobSpy library or proxies | Use `python-jobspy` (2.9K GitHub stars) as subprocess, or Google Alerts RSS as low-effort alternative. Direct API scraping requires residential proxies. |
| 2.4 | **Google Jobs via SerpAPI** | MEDIUM | 0.5 days | SerpAPI key ($0) | Meta-aggregator — catches listings from Pracuj, NoFluff, JustJoin, LinkedIn in one call. 100 free searches/month. `location="Warsaw,Masovian Voivodeship,Poland"`. |
| 2.5 | **RocketJobs.pl scraper** | MEDIUM | 0.5 days | None | Same company as JustJoin.it. Likely Next.js — try `__NEXT_DATA__` extraction first. Covers non-IT senior roles (Head of Product, Director of Digital). |
| 2.6 | **Solid.jobs scraper** | LOW | 0.5 days | None | Smaller PL board. HTML scraping, check for `__NEXT_DATA__` or internal XHR. |
| 2.7 | **Welcome to the Jungle (PL)** | LOW | 0.5 days | None | Has official public embed API (`welcomekit.co/api/v1/embed`). Good for scale-ups. |
| 2.8 | **Indeed Poland** | LOW | 0.5 days | JobSpy library | Use JobSpy targeting `pl.indeed.com`. Aggressive anti-scraping — don't bother building custom. |
| 2.9 | **Company career page monitors** | MEDIUM | 1-2 days | None | RSS/Atom feeds or HTML diffing for: Allegro, Docplanner, Booksy, Brainly, CD Projekt, LPP/Silky Coders. |
| 2.10 | **Add Playwright to pipeline** | HIGH | 0.5 days | npm install | Required by 2.1, 2.2. Add `playwright` dep, create shared browser pool utility. |

**Phase 2 total effort:** ~7-9 days
**Recommended order:** 2.10 → 2.1 → 2.2 → 2.4 → 2.3 → 2.5 → 2.9 → rest

---

## Phase 3: Dashboard & Tracking

**Goal:** Replace raw Telegram alerts with a browsable interface for reviewing, filtering, and tracking applications.

| # | Task | Priority | Effort | Dependencies | Notes |
|---|------|----------|--------|-------------|-------|
| 3.1 | **Streamlit dashboard** | HIGH | 1-2 days | Python + SQLite | Read-only view: filter by score, source, date, salary. Sort by relevance. Link to original posting. Fastest to ship. |
| 3.2 | **Application status workflow** | HIGH | 0.5 days | 3.1 | Add status transitions in UI: New → Interested → Applied → Interview → Offer → Rejected. Store in existing `status` column. |
| 3.3 | **Notes & tagging** | MEDIUM | 0.5 days | 3.1 | Free-text notes per job (existing `notes` column). Custom tags for categorisation. |
| 3.4 | **Salary analytics** | MEDIUM | 0.5 days | 3.1 | Charts: salary distribution by source, salary trends over time, median by role type. |
| 3.5 | **Weekly trend report** | LOW | 0.5 days | 3.1 | Auto-generated: new roles this week, top matches, market pulse. Send via Telegram or email. |
| 3.6 | **Migrate to Next.js** | LOW | 2-3 days | Node.js | If Streamlit feels limiting. Full-stack with API routes, better UX, deploy to Vercel. |

**Phase 3 total effort:** ~3-5 days (Streamlit path) or ~6-8 days (Next.js path)

---

## Phase 4: Intelligence Layer

**Goal:** Go beyond matching — help with the full application lifecycle.

| # | Task | Priority | Effort | Dependencies | Notes |
|---|------|----------|--------|-------------|-------|
| 4.1 | **Auto cover letter drafts** | HIGH | 1 day | Claude API | Generate tailored cover letter for each 75+ match, referencing specific profile achievements that map to job requirements. Store as draft, send via Telegram for review. |
| 4.2 | **Company research briefs** | HIGH | 1 day | Web search API | For each strong match: company size, funding, tech stack, recent news, Glassdoor rating, growth trajectory. Attach to job notification. |
| 4.3 | **Interview prep packets** | MEDIUM | 1 day | 4.2 + Claude API | When status changes to "Interview": generate likely questions, talking points mapped to job requirements, company-specific prep. |
| 4.4 | **Salary negotiation data** | MEDIUM | 0.5 days | Phase 3 DB | Aggregate salary data from all scraped jobs in same role/seniority to provide negotiation range context. |
| 4.5 | **Duplicate company detection** | LOW | 0.5 days | None | Flag when same company posts similar roles across multiple boards (signals urgency/multiple openings). |
| 4.6 | **Network matching** | LOW | 1 day | LinkedIn data | Cross-reference job companies with LinkedIn connections — flag "you know someone at this company". |

**Phase 4 total effort:** ~5-6 days

---

## Phase 5: Operational Hardening

**Goal:** Make the crawler reliable, monitorable, and resilient to anti-scraping changes.

| # | Task | Priority | Effort | Dependencies | Notes |
|---|------|----------|--------|-------------|-------|
| 5.1 | **Scraper health monitoring** | HIGH | 0.5 days | None | Track success/failure rates per source. Alert via Telegram when a scraper returns 0 jobs for 2+ consecutive runs. |
| 5.2 | **Proxy rotation** | MEDIUM | 0.5 days | Proxy service | Required for LinkedIn, Indeed, potentially Pracuj.pl. Use residential proxy pool (BrightData, Oxylabs, or free proxy lists). |
| 5.3 | **Request fingerprinting** | MEDIUM | 0.5 days | None | Rotate User-Agent strings, add realistic headers (Accept-Language, Referer), randomise request timing. |
| 5.4 | **Playwright browser pool** | MEDIUM | 0.5 days | Phase 2.10 | Shared browser instance management — launch once, reuse across scrapers, handle crashes gracefully. |
| 5.5 | **Retry with exponential backoff** | LOW | 0.5 days | None | Currently scrapers fail silently on network errors. Add retry logic (3 attempts, 2s/4s/8s backoff). |
| 5.6 | **Structured logging** | LOW | 0.5 days | None | Replace console.log with structured JSON logging. Makes debugging easier in GitHub Actions. |
| 5.7 | **Selector auto-repair alerts** | LOW | 1 day | 5.1 | When HTML scrapers return 0 results, capture the raw HTML and flag for manual selector review. |
| 5.8 | **Self-hosted runner** | LOW | 1 day | VPS/Railway | Move off GitHub Actions free tier if hitting limits. Railway.app ($5/mo) or small VPS. |

**Phase 5 total effort:** ~5-6 days

---

## Summary Timeline

| Phase | Focus | Effort | Cumulative |
|-------|-------|--------|------------|
| 1 ✅ | MVP (3 boards, scoring, Telegram) | Done | Done |
| 2 | Expand to 10+ sources | ~8 days | ~8 days |
| 3 | Dashboard & application tracking | ~4 days | ~12 days |
| 4 | Intelligence (cover letters, research) | ~5 days | ~17 days |
| 5 | Hardening & monitoring | ~5 days | ~22 days |

Phases 2-5 can overlap — e.g., start Phase 3 dashboard while Phase 2 scrapers are being built.

---

## Quick Wins (Can Do Anytime)

- [ ] Add Google Alerts RSS for "Head of AI Warsaw" — zero code, 5 minutes
- [ ] Set up SerpAPI free tier — 100 searches/month covers daily checks
- [ ] Create Telegram channel (not just DM) for sharing alerts with trusted contacts
- [ ] Add `npm run report` script that prints DB stats + top unactioned matches
