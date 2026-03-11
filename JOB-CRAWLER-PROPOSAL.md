# Job Crawler Proposal — Polish Market Monitor for Mateusz Waligórski

## Target Profile Summary

**Seniority:** Director / Head / VP / C-level
**Domains:** AI/ML, Data & Analytics, Product, Digital Transformation, UX at scale
**Location:** Warsaw (hybrid/remote OK)
**Salary floor:** 20,000+ PLN/month (net, B2B) — realistically targeting 30k–50k+ PLN
**Languages:** Polish market, but English-language postings too (international companies with PL offices)

---

## 1. Target Job Boards & Data Sources

### Tier 1 — Structured APIs / RSS (easiest to crawl)

| Source | Method | Coverage | Notes |
|--------|--------|----------|-------|
| **JustJoin.it** | Public REST API (`api.justjoin.it/v2/user-panel/offers`) | Best PL tech job board, ~15k listings | Has salary ranges, structured filters. API is undocumented but stable and returns JSON. |
| **NoFluffJobs.com** | Public REST API (`nofluffjobs.com/api/`) | PL-focused, salary transparency mandatory | Every listing has salary brackets — great for filtering. API returns JSON with full job details. |
| **Bulldogjob.pl** | HTML scraping (no public API) | Mid-senior PL tech roles | Smaller board but curated, good signal-to-noise for senior roles. |
| **Pracuj.pl** | HTML scraping + their mobile API | Largest PL job board overall | Noisy for senior tech roles but has enterprise/corporate director postings others miss. |
| **LinkedIn Jobs** | LinkedIn API (limited) or scraping via cookies | Global + PL | Best for VP/Director roles at international companies. Rate-limited; consider manual RSS via Google Alerts as alternative. |

### Tier 2 — Supplementary Sources

| Source | Method | Why |
|--------|--------|-----|
| **Startup.jobs** | RSS/API | International startups hiring in PL |
| **Protocol.it** (justjoin sister) | Same API as JustJoin | C-level and board-level roles |
| **Rocket Jobs** (rocketjobs.pl) | HTML scraping | Non-tech roles at tech companies (good for Head of Product, Director of Digital) |
| **theprotocol.it** | API (justjoin ecosystem) | Specifically senior/management roles |
| **Google Jobs aggregator** | SerpAPI or custom Google scraping | Catches postings from company career pages not on boards |
| **Welcome to the Jungle** (PL) | API/scraping | Growing in PL, good for scale-ups |

### Tier 3 — Direct Company Career Pages

Monitor career pages of companies likely to hire your profile:
- **Big Tech PL offices:** Google, Microsoft, Amazon, Meta (Warsaw/Kraków)
- **PL scale-ups:** Allegro, CD Projekt, Docplanner, Booksy, Brainly, Packhelp
- **Consulting/Digital:** Accenture, Deloitte Digital, McKinsey Digital, BCG Gamma
- **E-commerce:** Zalando (PL), LPP/Silky Coders, Empik, Modivo
- **FinTech:** Revolut (PL), N26, ING Tech PL, mBank
- **AI-native companies:** Any new entrants (tracked via Crunchbase/dealroom.io alerts)

---

## 2. Search Queries & Keyword Strategy

### Primary Keywords (title-level)
```
"Head of AI" OR "Director of AI" OR "VP AI" OR "Chief AI Officer"
"Head of Data" OR "Director of Data" OR "VP Data" OR "Chief Data Officer"
"Head of Analytics" OR "Director of Analytics" OR "VP Analytics"
"Head of Product" OR "Director of Product" OR "VP Product" OR "CPO"
"Head of Digital" OR "Director of Digital" OR "Chief Digital Officer"
"Head of UX" OR "Director of UX" OR "VP Design"
"CTO" OR "VP Engineering" (when AI/data-focused)
"Entrepreneur in Residence" OR "EIR"
"AI Lead" OR "AI Program Director"
"Digital Transformation Director"
```

### Secondary Keywords (description-level, broader net)
```
"AI strategy" AND ("director" OR "head" OR "lead" OR "VP")
"machine learning" AND ("director" OR "head" OR "manager")
"data-driven" AND ("director" OR "head" OR "VP")
"Gemini" OR "LLM" OR "generative AI" AND ("head" OR "lead" OR "director")
"product analytics" AND "senior"
```

### Polish-Language Keywords
```
"Dyrektor IT" OR "Dyrektor ds. Cyfrowych" OR "Dyrektor Danych"
"Kierownik Działu AI" OR "Szef Działu Analityki"
"Wicedyrektor" OR "Zastępca Dyrektora"
"Lider AI" OR "Lider Danych"
"Dyrektor Produktu" OR "Head of Product"
```

### Salary Filter
- NoFluffJobs: `salary>pln20000m` (monthly) — but realistically set to `salary>pln25000m`
- JustJoin.it: filter `salaryFrom=20000&salaryCurrency=pln`
- Bulldogjob: no salary API filter, post-process in code

---

## 3. Proposed Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (cron)                   │
│              Runs every 4-6 hours via GitHub Actions     │
│                  or local cron / Railway.app             │
├─────────┬──────────┬──────────┬──────────┬──────────────┤
│ JustJoin│ NoFluff  │ Bulldog  │ Pracuj   │ LinkedIn/    │
│ .it API │ Jobs API │ .pl      │ .pl      │ Google Jobs  │
│ adapter │ adapter  │ scraper  │ scraper  │ adapter      │
├─────────┴──────────┴──────────┴──────────┴──────────────┤
│                 NORMALISATION LAYER                      │
│  → Deduplicate  → Normalise titles  → Extract salary    │
│  → Tag with categories (AI/Data/Product/UX/Digital)     │
├─────────────────────────────────────────────────────────┤
│                  AI RELEVANCE SCORER                     │
│  Claude API / local LLM scores each job 0-100 against   │
│  your profile (FULL-PROFESSIONAL-PROFILE.md as context)  │
│  Returns: score, match_reasons[], missing_skills[]       │
├─────────────────────────────────────────────────────────┤
│                    DATA STORE                            │
│         SQLite (jobs.db) or JSON flat files              │
│  Tracks: seen, score, applied, notes, date_found        │
├──────────────────┬──────────────────────────────────────┤
│   NOTIFICATION   │          DASHBOARD (optional)        │
│  → Telegram bot  │   → Simple HTML or Streamlit app     │
│  → Email digest  │   → Filter by score, date, source    │
│  → Slack webhook │   → Mark as "interested" / "skip"    │
└──────────────────┴──────────────────────────────────────┘
```

---

## 4. Implementation Plan

### Phase 1 — MVP (1-2 days of work)
**Goal:** Get relevant jobs flowing into a Telegram channel daily.

```
crawler/
├── package.json
├── src/
│   ├── index.ts                 # Orchestrator / entry point
│   ├── config.ts                # Keywords, salary thresholds, profile summary
│   ├── scrapers/
│   │   ├── justjoin.ts          # JustJoin.it API client
│   │   ├── nofluffjobs.ts       # NoFluffJobs API client
│   │   └── bulldogjob.ts        # Bulldogjob.pl HTML scraper
│   ├── scoring/
│   │   └── relevance.ts         # Claude API scoring (job vs profile)
│   ├── storage/
│   │   └── sqlite.ts            # SQLite for dedup + history
│   └── notifications/
│       └── telegram.ts          # Telegram Bot API notifications
├── profile-summary.txt          # Condensed profile for scoring prompt
└── .github/
    └── workflows/
        └── crawl.yml            # GitHub Actions cron (every 6h)
```

**Stack:**
- **Runtime:** Node.js 20+ (TypeScript) — consistent with your existing `generate_profile.js`
- **Scraping:** `cheerio` for HTML parsing, native `fetch` for APIs
- **AI Scoring:** Anthropic Claude API (`claude-haiku-4-5-20251001` for cost efficiency, ~$0.01/job)
- **Storage:** `better-sqlite3` (zero-config, single file)
- **Notifications:** Telegram Bot API (free, instant, mobile)
- **Scheduling:** GitHub Actions cron (free for public repos, 6h interval)

### Phase 2 — Enhanced Sources (+ 1-2 days)
- Add Pracuj.pl scraper (requires cookie handling / Playwright)
- Add LinkedIn Jobs via unofficial API or Google Alerts RSS
- Add direct company career page monitors (Allegro, Docplanner, etc.)
- Add theprotocol.it support

### Phase 3 — Dashboard & Analytics (+ 1-2 days)
- Streamlit or simple Next.js dashboard
- Track application status per job
- Weekly trend report (new roles, salary trends)
- Automatic cover letter draft generation via Claude

---

## 5. AI Scoring Prompt Design

The scorer sends each job to Claude with this prompt pattern:

```
You are a job-matching assistant. Score how well this job matches the candidate profile.

CANDIDATE PROFILE:
- 16+ years in analytics, UX, product, and AI
- Led 300-person IT division at Polish state enterprise (PWPW)
- Led AI deployment at Displate (Gemini integration, 750% sales growth, Google case study)
- Head of Analytics, Head of NFT, Head of UX background
- Co-Founder of AI mobile startup (SwipePads)
- Community builder (People That Count, WAW, MeasureCamp)
- Based in Warsaw, Poland
- Target: Director/Head/VP level, 25k+ PLN/month
- Domains: AI/ML strategy, Data & Analytics, Product, Digital Transformation

JOB POSTING:
{title}
{company}
{salary_range}
{description}

Return JSON:
{
  "score": 0-100,
  "match_reasons": ["reason1", "reason2"],
  "gaps": ["gap1"],  // skills the candidate may lack
  "verdict": "strong_match" | "possible_match" | "weak_match" | "no_match"
}
```

**Scoring thresholds:**
- **80-100:** Immediate Telegram alert + auto-save
- **60-79:** Daily digest email
- **40-59:** Weekly summary
- **<40:** Silently stored, not notified

---

## 6. Specific API Endpoints & Scraping Strategies

### JustJoin.it
```typescript
// Public API — no auth needed
const url = 'https://api.justjoin.it/v2/user-panel/offers?' + new URLSearchParams({
  slug: 'warszawa',
  'title[]': 'Director of Data',
  'title[]': 'Head of AI',
  orderBy: 'DESC',
  sortBy: 'published',
  perPage: '50',
});
// Returns JSON with: title, company, salary, skills, description, published_at
```

### NoFluffJobs
```typescript
// Public API
const url = 'https://nofluffjobs.com/api/posting?' + new URLSearchParams({
  'salaryCurrency': 'PLN',
  'salaryFrom': '20000',
  'salaryKind': 'month',
  'category': 'project-manager,business-intelligence,artificial-intelligence',
  'seniority': 'senior,expert',
});
// Returns JSON with: id, title, salary, company, posted, category, seniority
```

### Bulldogjob.pl
```typescript
// No API — HTML scraping with Cheerio
// Target URLs:
// https://bulldogjob.pl/companies/jobs/s/role,ai/city,Warszawa
// https://bulldogjob.pl/companies/jobs/s/role,management/city,Warszawa
// https://bulldogjob.pl/companies/jobs/s/role,data/city,Warszawa
// Parse: job cards with .job-item selector → title, company, salary, link
```

---

## 7. Cost Estimate

| Component | Monthly Cost |
|-----------|-------------|
| GitHub Actions (cron 4x/day) | Free (public repo) or ~$0 (private, well within free tier) |
| Claude Haiku scoring (~200 jobs/day) | ~$3–5/month |
| Telegram Bot | Free |
| SQLite storage | Free (local file) |
| Domain for dashboard (optional) | ~$10/year |
| Railway.app hosting (optional) | Free tier or ~$5/month |
| **Total** | **~$5–10/month** |

---

## 8. Anti-Detection & Rate Limiting

- **Respectful crawling:** 2-5 second delays between requests
- **User-Agent rotation:** Mimic standard browsers
- **robots.txt compliance:** Check and respect for each domain
- **API-first approach:** Use official/semi-official APIs wherever possible (JustJoin, NoFluff) — no scraping needed
- **Caching:** Don't re-fetch job details already in DB
- **Error handling:** Exponential backoff on 429/5xx responses

---

## 9. Quick-Start: What You Need

1. **Telegram Bot Token** — Message @BotFather on Telegram, create a bot, get the token
2. **Anthropic API Key** — For Claude-based job scoring (you likely have this already)
3. **GitHub repo** — To host the crawler + GitHub Actions for free cron
4. **(Optional) Proxy or VPN** — Only if Pracuj.pl or LinkedIn block cloud IPs

---

## 10. Alternative: Low-Code / No-Code Approach

If you want results faster with less engineering:

| Tool | Use Case | Cost |
|------|----------|------|
| **Apify** | Pre-built scrapers for JustJoin, NoFluff, LinkedIn | ~$50/month |
| **n8n (self-hosted)** | Workflow automation: scrape → score → notify | Free |
| **Make.com (Integromat)** | Same as n8n but hosted | ~$10/month |
| **Google Alerts** | "Head of AI" + "Warsaw" email alerts | Free |
| **RSS + Feedly** | Monitor NoFluffJobs RSS by category | Free |

A hybrid approach works well: Google Alerts + RSS for broad coverage, custom crawler for JustJoin/NoFluff APIs with AI scoring.
