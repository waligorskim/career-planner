# Polish Job Board Library — LLM Reference

> **Purpose:** This document is a technical reference for an LLM building or extending job scrapers for the Polish market. It contains API endpoints, data formats, scraping strategies, and browser verification steps for each board. The consuming LLM has access to a Chrome browser extension and should use the verification steps to confirm details are still current before writing code.

---

## Table of Contents

1. [JustJoin.it](#1-justjoinit) ✅ implemented
2. [NoFluffJobs](#2-nofluffjobs) ✅ implemented
3. [Bulldogjob.pl](#3-bulldogjobpl) ✅ implemented
4. [Pracuj.pl](#4-pracujpl)
5. [theprotocol.it](#5-theprotocolit)
6. [RocketJobs.pl](#6-rocketjobspl)
7. [LinkedIn Jobs](#7-linkedin-jobs)
8. [Google Jobs / SerpAPI](#8-google-jobs--serpapi)
9. [Welcome to the Jungle](#9-welcome-to-the-jungle)
10. [Solid.jobs](#10-solidjobs)
11. [Indeed Poland](#11-indeed-poland)
12. [Startup.jobs](#12-startupjobs)
13. [Glassdoor Poland](#13-glassdoor-poland)
14. [Common Patterns](#common-patterns)
15. [Adding a New Scraper](#adding-a-new-scraper)

---

## Corporate Group Map

Understanding which boards share infrastructure helps predict APIs and anti-scraping:

```
Just Join IT sp. z o.o.
├── JustJoin.it          (IT jobs)
├── RocketJobs.pl        (non-IT jobs)
└── hellohr              (HR platform)

Grupa Pracuj S.A.
├── Pracuj.pl            (general job board, largest in PL)
├── theprotocol.it       (IT/tech focused)
├── eRecruiter           (ATS platform)
└── Robota.ua            (Ukraine market)
```

---

## 1. JustJoin.it

| Field | Value |
|-------|-------|
| **URL** | https://justjoin.it |
| **Market position** | Largest Polish IT job board (~15k active listings) |
| **Approach** | HTML scraping via Next.js `__NEXT_DATA__` extraction |
| **Existing implementation** | `crawler/src/scrapers/justjoin.ts` |

### API Status

The historical public API at `https://justjoin.it/api/offers` was **shut down on November 17, 2023** and returns 404. There is a newer internal API at `https://api.justjoin.it/v2/user-panel/offers` which our current scraper targets — it may or may not still be accessible.

### Current Scraper Strategy

Our implementation uses `https://api.justjoin.it/v2/user-panel/offers` with these parameters:

```
GET https://api.justjoin.it/v2/user-panel/offers?
  slug=warszawa
  &categories[]=management
  &categories[]=data
  &categories[]=artificial-intelligence
  &categories[]=product-management
  &experienceLevel[]=senior
  &experienceLevel[]=c-level
  &sortBy=published
  &orderBy=DESC
  &perPage=50
  &page=1
```

Headers:
```
User-Agent: <browser UA>
Accept: application/json
Version: 2
```

### Alternative Strategy: `__NEXT_DATA__` Extraction

JustJoin.it is a Next.js app. Every server-rendered page embeds a `<script id="__NEXT_DATA__">` tag containing the full page data as JSON. This is more reliable than the API.

**Target URLs:**
```
https://justjoin.it/warszawa/ai
https://justjoin.it/warszawa/data
https://justjoin.it/warszawa/management
https://justjoin.it/warszawa/product-management
https://justjoin.it/all-locations/ai/experience-level_senior.c-level
```

**Extraction:**
```typescript
const html = await fetch(url).then(r => r.text());
const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
const data = JSON.parse(match[1]);
// Navigate data.props.pageProps to find job listings
```

### Response Data Fields

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | Unique job ID, used in URL |
| `title` | string | Job title |
| `companyName` | string | |
| `city` | string | |
| `workplaceType` | string | "remote", "hybrid", "office" |
| `employmentTypes` | array | Each has `from`, `to`, `currency`, `type` (b2b/uop) |
| `requiredSkills` | string[] | Capped at 3 in list view, full in detail |
| `publishedAt` | string | ISO date |
| `body` | string | Job description (may only be in detail view) |

### URL Patterns for Filtered Searches

```
https://justjoin.it/{city}/{category}
https://justjoin.it/{city}/{category}/experience-level_{level}
https://justjoin.it/{city}/{category}/with-salary_{min}-{max}-pln

Cities: warszawa, krakow, wroclaw, gdansk, poznan, all-locations
Categories: ai, data, management, product-management, devops, testing, ux
Levels: junior, mid, senior, c-level
```

### Known Open-Source Scrapers

- `RSKriegs/justjoinit_ETL` — Python ETL pipeline
- `kacperdev0/justjoinitDataGatherer` — Data collector
- Apify: `piotrv1001/just-join-it-scraper`, `stealth_mode/justjoin-jobs-search-scraper`

### 🔍 Browser Verification Steps

1. **Open** `https://justjoin.it/warszawa/ai` in browser
2. **View page source** (Ctrl+U) — search for `__NEXT_DATA__` to confirm the data is embedded in SSR HTML
3. **Open DevTools → Network tab** → refresh page → filter by `XHR/Fetch` → look for API calls to `api.justjoin.it` to find current internal endpoints
4. **Test the v2 API**: open `https://api.justjoin.it/v2/user-panel/offers?slug=warszawa&perPage=5` directly — check if it returns JSON or errors
5. **Check** `https://justjoin.it/robots.txt` for crawling restrictions

---

## 2. NoFluffJobs

| Field | Value |
|-------|-------|
| **URL** | https://nofluffjobs.com |
| **Market position** | Major PL IT board, mandatory salary transparency |
| **Approach** | Internal REST API (no auth required) |
| **Existing implementation** | `crawler/src/scrapers/nofluffjobs.ts` |

### API Endpoints

**Search postings:**
```
POST https://nofluffjobs.com/api/posting/search
Content-Type: application/json

{
  "page": 1,
  "criteriaSearch": {
    "requirement": ["ai", "data-science", "business-intelligence"],
    "employment": ["b2b", "permanent"],
    "salary": { "from": 20000, "currency": "PLN", "period": "month" }
  }
}
```

Also supports GET with criteria string:
```
GET https://nofluffjobs.com/api/search/posting?criteria=salary>pln20000m+seniority=senior,expert
```

Query parameters: `Limit`, `Offset`, `SalaryCurrency`, `SalaryPeriod`, `Region`.

**Get posting details:**
```
GET https://nofluffjobs.com/api/posting/{postingId}
```

### Response Data Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique posting ID |
| `name` / `title` | string | Job title |
| `url` | string | URL slug for the posting |
| `salary.from` | number | Minimum salary (mandatory on NoFluff) |
| `salary.to` | number | Maximum salary |
| `salary.currency` | string | PLN, EUR, USD, etc. |
| `salary.type` | string | "month", "year", "hour" |
| `location.places` | array | `[{ city, url }]` |
| `company.name` | string | |
| `posted` | number | Unix timestamp |
| `category` | string | e.g., "project-manager", "artificial-intelligence" |
| `seniority` | string[] | e.g., ["senior", "expert"] |
| `technology` | string[] | Required tech stack |

Detail endpoint additionally returns:
- `requirements.description` — full job description HTML
- `body` — alternative description field
- `methodology` — agile/scrum/kanban info
- `teamSize` — team information
- `perks` — benefits list
- `contractType` — employment type details

### URL Patterns

```
https://nofluffjobs.com/pl/jobs?criteria=
  salary>pln{amount}m          — salary floor (monthly)
  seniority={level}            — junior,mid,senior,expert
  category={cat}               — artificial-intelligence, business-intelligence, project-manager
  city={city}                  — warszawa, krakow, remote
  keyword={word}               — free text search
  jobPosition='{title}'        — exact title match

Example:
https://nofluffjobs.com/pl/?criteria=salary%3Epln20000m%20seniority%3Dsenior%20category%3Dartificial-intelligence
```

### Known Open-Source Scrapers

- `necsord/go-nofluffjobs` — Go client (best documented, models the full API response)
- `oskar-j/nofluffapi` — Python
- `hidalgopl/no_fluff_crawler` — Python crawler
- `alebelcor/gigs-adapter-nofluffjobs` — Node.js adapter
- Apify: `memo23/nofluffjobs-cheerio-scraper`

### 🔍 Browser Verification Steps

1. **Open** `https://nofluffjobs.com/pl/praca-it/warszawa?criteria=salary%3Epln20000m` in browser
2. **Open DevTools → Network tab** → refresh → filter XHR → look for requests to `/api/posting/search` or `/api/search/posting` — inspect the request payload and response
3. **Test API directly**: open `https://nofluffjobs.com/api/search/posting?criteria=salary%3Epln20000m&limit=5` — should return JSON
4. **Test detail endpoint**: take any posting ID from search results, open `https://nofluffjobs.com/api/posting/{id}` — inspect full data structure
5. **Check** `https://nofluffjobs.com/robots.txt`

---

## 3. Bulldogjob.pl

| Field | Value |
|-------|-------|
| **URL** | https://bulldogjob.pl |
| **Market position** | Mid-senior PL tech roles, curated, good signal-to-noise |
| **Approach** | HTML scraping with Cheerio |
| **Existing implementation** | `crawler/src/scrapers/bulldogjob.ts` |

### Scraping Strategy

No API exists. HTML scraping using category/city URL patterns.

**Target URLs:**
```
https://bulldogjob.pl/companies/jobs/s/role,ai/city,Warszawa
https://bulldogjob.pl/companies/jobs/s/role,management/city,Warszawa
https://bulldogjob.pl/companies/jobs/s/role,data/city,Warszawa
https://bulldogjob.pl/companies/jobs/s/role,product-management/city,Warszawa
```

**Sitemap** (useful for full URL discovery):
```
https://bulldogjob.com/sitemap.en.xml.gz
```

### HTML Selectors (current implementation)

Job cards: `[data-testid="job-item"], .job-item, article.job, .job-card, .offer-card`
Title: `h2, h3, .job-title, [data-testid="job-title"]`
Company: `.company-name, [data-testid="company-name"], .employer`
Link: `a[href*="/companies/jobs/"]`
Salary: `.salary, [data-testid="salary"], .money`
Location: `.location, [data-testid="location"], .city`
Skills: `.skill, .tag, .tech-tag, [data-testid="skill"]`

**Fallback:** If primary selectors yield 0 results, scan all `a[href*="/companies/jobs/"]` links and filter out navigation (`/s/` paths).

### robots.txt

```
Disallow: /withSalary,true
Disallow: /salaryBrackets
Disallow: /auth
Disallow: /page
Disallow: /feeds
Disallow: /account
```

Job listing pages (`/companies/jobs/s/...`) are **allowed**.

### Available Data Fields

title, company, location, salary range, contract type, seniority, tech stack (tags)

### 🔍 Browser Verification Steps

1. **Open** `https://bulldogjob.pl/companies/jobs/s/role,ai/city,Warszawa` in browser
2. **Right-click a job card → Inspect** — note the actual CSS class names and structure. The selectors in our scraper may need updating if the DOM has changed.
3. **View page source** (Ctrl+U) — confirm the content is server-rendered (not client-side JS). If you see job data in the raw HTML, Cheerio will work. If not, Playwright is needed.
4. **Check Network tab** for any XHR/Fetch calls that might indicate a hidden JSON API
5. **Check** `https://bulldogjob.pl/robots.txt`
6. **Try the sitemap**: download `https://bulldogjob.com/sitemap.en.xml.gz` and inspect for job URLs

---

## 4. Pracuj.pl

| Field | Value |
|-------|-------|
| **URL** | https://www.pracuj.pl |
| **Market position** | Largest Polish job board overall (all sectors, not just IT) |
| **Approach** | Playwright (JS-heavy) + internal API discovery |
| **Status** | Not yet implemented |

### Known Technical Details

Pracuj.pl is heavily JavaScript-rendered. Direct HTML fetching returns minimal content — a headless browser is required.

**Search URL patterns:**
```
https://www.pracuj.pl/praca?ss=head+of+ai&wp=warszawa&sal=20000
https://www.pracuj.pl/praca/dyrektor-it;kw?pn=1
https://www.pracuj.pl/praca?ss={query}&wp={city}&sal={min_salary}&pn={page}

Parameters:
  ss    — search query (URL-encoded)
  wp    — city (warszawa, krakow, etc.)
  sal   — minimum salary
  pn    — page number (pagination)
  et    — employment type
  tc    — contract type
```

### Internal API

Pracuj.pl makes XHR calls during page load that return structured JSON. These are not publicly documented but can be discovered via DevTools.

**Likely patterns** (confirm via browser):
```
GET https://www.pracuj.pl/api/offers?...
GET https://massachusetts.pracuj.pl/api/...
```

### Available Data Fields

title, company, location, salary (when disclosed), contract type, work mode (remote/hybrid/office), seniority, full description, benefits

### Anti-Scraping

- JS-heavy rendering (Playwright required)
- May use bot detection (Cloudflare or custom)
- Less aggressive than LinkedIn per community reports

### Known Open-Source Scrapers

- `jerryntom/pracuj.pl-scraping` — Selenium, exports to .xlsx
- `Taali1/Pracuj.pl-scraper` — Python
- Apify: `trev0n/pracuj-pl-scraper`, `stealth_mode/pracuj-jobs-search-scraper`, `scrapestorm/pracuj-pl-jobs-scraper`

### 🔍 Browser Verification Steps

1. **Open** `https://www.pracuj.pl/praca?ss=head+of+ai&wp=warszawa` in browser
2. **View page source** (Ctrl+U) — check if job data is in the HTML or only loaded via JS. This determines Cheerio vs Playwright.
3. **Open DevTools → Network tab** → refresh → filter by `XHR/Fetch` → **look for JSON API calls**. These are the key endpoints to use directly.
4. **Copy the API request** as cURL (right-click → Copy as cURL) — inspect headers required (cookies, tokens, etc.)
5. **Test pagination**: navigate to page 2 (`?pn=2`) and check if the API call changes
6. **Check** `https://www.pracuj.pl/robots.txt`
7. **Check for rate limiting**: make a few rapid requests via DevTools console using `fetch()` and observe if you get 429 responses

---

## 5. theprotocol.it

| Field | Value |
|-------|-------|
| **URL** | https://theprotocol.it |
| **Market position** | IT/tech focused, part of Grupa Pracuj (sister site of Pracuj.pl) |
| **Approach** | Playwright (returns 403 on direct fetch) |
| **Status** | Not yet implemented |

### Known Technical Details

theprotocol.it returns **403 Forbidden** even on `robots.txt`, indicating aggressive bot protection. Shares infrastructure with Pracuj.pl (same corporate group).

**Search URL patterns:**
```
https://theprotocol.it/filtry/warszawa;wp?specialization=management
https://theprotocol.it/filtry/warszawa;wp?specialization=data,ai&experience=senior
```

### Filters Available

- Specialization (management, data, ai, devops, etc.)
- Technologies
- Tools
- Salary range
- Location
- Remote/hybrid/office
- Experience level

### Available Data Fields

title, specialization, technologies, salary (when disclosed), project description, company profile, location, remote options

### Anti-Scraping

- Returns 403 on direct HTTP requests
- Likely Cloudflare or similar WAF
- Requires headless browser with realistic fingerprinting
- May need cookie/session handling

### 🔍 Browser Verification Steps

1. **Open** `https://theprotocol.it/filtry/warszawa;wp?specialization=management` in browser
2. **Open DevTools → Network tab** → refresh → **look for JSON API calls** — this is the most valuable discovery. The frontend likely fetches from an internal API.
3. **Copy any API requests as cURL** — test if they work without browser cookies
4. **Check** if the site shows a Cloudflare challenge page (interstitial "checking your browser")
5. **Inspect page source** for Next.js / SPA indicators
6. **Try** `https://theprotocol.it/robots.txt` from the browser (may work in browser but not from code)

---

## 6. RocketJobs.pl

| Field | Value |
|-------|-------|
| **URL** | https://rocketjobs.pl |
| **Market position** | Non-IT senior roles at tech companies. Same company as JustJoin.it. |
| **Approach** | HTML scraping, likely Next.js (`__NEXT_DATA__`) |
| **Status** | Not yet implemented |

### Known Technical Details

RocketJobs is operated by Just Join IT sp. z o.o. (same as JustJoin.it). It likely shares the same tech stack (Next.js) and may have similar internal API patterns.

**Search URL patterns:**
```
https://rocketjobs.pl/warszawa
https://rocketjobs.pl/warszawa/zarzadzanie
https://rocketjobs.pl/warszawa/marketing
https://rocketjobs.pl/wszystkie-lokalizacje
```

### Why It Matters

RocketJobs covers non-IT senior roles that JustJoin.it misses:
- Head of Product (non-tech companies)
- Director of Digital / Marketing
- COO, CFO at tech companies
- Management / leadership at scale-ups

### Known Open-Source Scrapers

- `baranouskiart/jobboard-crawler` — Python, multi-board including RocketJobs

### 🔍 Browser Verification Steps

1. **Open** `https://rocketjobs.pl/warszawa/zarzadzanie` in browser
2. **View page source** — search for `__NEXT_DATA__` to confirm Next.js SSR
3. **If found:** Parse the JSON inside `__NEXT_DATA__` — this will contain all job listings without needing API calls
4. **Open DevTools → Network tab** → look for API calls to `api.rocketjobs.pl` or similar
5. **Compare** the API structure to JustJoin.it — they may share the same backend
6. **Check** `https://rocketjobs.pl/robots.txt`

---

## 7. LinkedIn Jobs

| Field | Value |
|-------|-------|
| **URL** | https://www.linkedin.com/jobs |
| **Market position** | Best for VP/Director roles at international companies with PL offices |
| **Approach** | JobSpy library (recommended) or Google Alerts RSS (zero-code fallback) |
| **Status** | Not yet implemented |

### Why LinkedIn Is Hard

- No public job search API
- Internal Voyager API changes every 4-8 weeks
- Aggressive bot detection: CAPTCHAs, fingerprinting, session validation
- Rate limits kick in around page 10 without proxies
- Requires residential proxy rotation for any scale

### Recommended: JobSpy Library

[`speedyapply/JobSpy`](https://github.com/speedyapply/JobSpy) (2.9K GitHub stars) handles LinkedIn scraping with anti-detection built in.

```bash
pip install python-jobspy
```

```python
from jobspy import scrape_jobs

jobs = scrape_jobs(
    site_name=["linkedin"],
    search_term="Head of AI",
    location="Poland",
    results_wanted=50,
    country_indeed="Poland",
)
```

**Integration approach:** Run JobSpy as a Python subprocess from the Node.js crawler, output to JSON, then ingest.

### Alternative: Google Alerts RSS (Zero-Code)

Set up Google Alerts for:
```
"Head of AI" Warsaw site:linkedin.com/jobs
"Director of Data" Poland site:linkedin.com/jobs
"VP Product" Warsaw site:linkedin.com/jobs
```

Deliver as RSS feed → parse in Node.js.

### Search URL Patterns (for manual browsing)

```
https://www.linkedin.com/jobs/search/?keywords=Head+of+AI&location=Warsaw&f_TPR=r604800
https://www.linkedin.com/jobs/search/?keywords=Director+of+Data&location=Poland&f_E=5,6

Parameters:
  keywords  — search terms
  location  — city or country
  f_TPR     — time posted (r86400=24h, r604800=7d, r2592000=30d)
  f_E       — experience level (5=Director, 6=Executive)
  f_SB2     — salary range
```

### Known Open-Source Scrapers

- `speedyapply/JobSpy` — Python, 2.9K stars. Supports LinkedIn, Indeed, Glassdoor, Google Jobs.
- `linkedin-jobs-scraper` — Headless browser, supports anonymous scraping
- Apify: `fantastic-jobs/advanced-linkedin-job-search-api`

### 🔍 Browser Verification Steps

1. **Open** `https://www.linkedin.com/jobs/search/?keywords=Head+of+AI&location=Warsaw&f_E=5` (while logged in)
2. **Open DevTools → Network tab** → look for requests to `voyager` or `api.linkedin.com` — note the endpoints but be aware they change frequently
3. **Test without login**: open `https://www.linkedin.com/jobs/search/?keywords=Head+of+AI&location=Warsaw` in incognito — LinkedIn shows some results without auth
4. **Check result count** to gauge how many relevant PL listings exist

---

## 8. Google Jobs / SerpAPI

| Field | Value |
|-------|-------|
| **URL** | Via SerpAPI: https://serpapi.com |
| **Market position** | Meta-aggregator — pulls from Pracuj.pl, NoFluff, JustJoin, LinkedIn, Indeed, company sites |
| **Approach** | SerpAPI REST endpoint |
| **Status** | Not yet implemented |

### API Details

```
GET https://serpapi.com/search?
  engine=google_jobs
  &q=Head+of+AI
  &location=Warsaw,+Masovian+Voivodeship,+Poland
  &gl=pl
  &hl=pl
  &api_key={SERPAPI_KEY}
```

**Pagination:** Use `next_page_token` from response. 10 results per page.

**Free tier:** 100 searches/month (enough for daily checks of ~3 queries).

### Response Data Fields

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Job title |
| `company_name` | string | |
| `location` | string | |
| `description` | string | Full description |
| `apply_options` | array | Direct URLs to original postings on source boards |
| `detected_extensions.posted_at` | string | "2 days ago", etc. |
| `detected_extensions.salary` | string | When available |
| `detected_extensions.schedule_type` | string | Full-time, etc. |

### Why It's Valuable

Google Jobs aggregates listings from many boards, including:
- Pracuj.pl (hard to scrape directly)
- Company career pages (impossible to monitor individually)
- Smaller boards you might miss

The `apply_options` field gives you direct URLs to the original postings.

### Query Examples for the Target Profile

```
q=Head+of+AI+Warsaw
q=Director+of+Data+Poland
q="Dyrektor+IT"+Warszawa
q="VP+Product"+Poland
q="Chief+Data+Officer"+Warsaw
```

### 🔍 Browser Verification Steps

1. **Open** `https://www.google.com/search?q=Head+of+AI+Warsaw&ibp=htl;jobs` in browser — this is the Google Jobs interface
2. **Check** that results include PL job boards (Pracuj, NoFluff, etc.)
3. **Test SerpAPI**: if you have a key, try `https://serpapi.com/search.json?engine=google_jobs&q=Head+of+AI&location=Warsaw,+Poland&api_key=YOUR_KEY` directly
4. **Inspect the `apply_options`** to see which source boards are represented

---

## 9. Welcome to the Jungle

| Field | Value |
|-------|-------|
| **URL** | https://www.welcometothejungle.com |
| **Market position** | Growing in PL, popular with scale-ups and international companies |
| **Approach** | Official public embed API (no auth for public listings) |
| **Status** | Not yet implemented |

### API Details

**Official documentation:** https://developers.welcomekit.co/

**Public embed endpoint (no auth required):**
```
GET https://www.welcomekit.co/api/v1/embed?organization_reference={org_ref}
```

This returns all published jobs for a specific company. To scrape broadly, you need to discover organization references first.

**Full API (requires auth token):**
- Jobs endpoint
- Candidates endpoint
- Employer branding
- Analytics

Auth token must be requested via Welcome to the Jungle help portal.

### Response Data Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `reference` | string | Unique job reference |
| `name` | string | Job title |
| `slug` | string | URL slug |
| `description` | string | HTML |
| `profile` | string | Candidate profile requirements (HTML) |
| `recruitment_process` | string | Process description (HTML) |
| `salary.min` | number | |
| `salary.max` | number | |
| `salary.currency` | string | |
| `salary.period` | string | |
| `created_at` | string | ISO date |
| `start_date` | string | |
| `office.address` | string | |
| `office.city` | string | |
| `office.country_code` | string | |
| `department.name` | string | |
| `contract_type` | string | |

### Search URL Patterns

```
https://www.welcometothejungle.com/en/jobs?query=Head+of+AI&refinementList%5Boffices.country_code%5D%5B%5D=PL
https://www.welcometothejungle.com/en/jobs?query=Director&page=1&aroundLatLng=52.23,21.01
```

### Known Open-Source Scrapers

- `benech17/webscraping-welcome-to-the-jungle` — Python notebook
- Apify: `clearpath/welcome-to-the-jungle-jobs-api`, `saswave/welcome-to-the-jungle-scraper`

### 🔍 Browser Verification Steps

1. **Open** `https://www.welcometothejungle.com/en/jobs?query=Head+of&refinementList%5Boffices.country_code%5D%5B%5D=PL` in browser
2. **Open DevTools → Network tab** → look for Algolia or internal API calls — WTTJ typically uses Algolia for search
3. **Check if Algolia keys are exposed** in the page source or network requests (they often are for public search)
4. **Test the embed API**: find any PL company on WTTJ, note their `organization_reference`, then open `https://www.welcomekit.co/api/v1/embed?organization_reference={ref}` directly
5. **Check** `https://www.welcometothejungle.com/robots.txt`

---

## 10. Solid.jobs

| Field | Value |
|-------|-------|
| **URL** | https://solid.jobs |
| **Market position** | Niche Polish IT board, good for mid-senior roles |
| **Approach** | HTML scraping (check for SPA/API first) |
| **Status** | Not yet implemented |

### Known Technical Details

No public API has been discovered. No community scrapers exist. The site is relatively small and may not have heavy anti-scraping measures.

**Search URL patterns:**
```
https://solid.jobs/offers/it;c=warszawa
https://solid.jobs/offers/it;c=warszawa;t=ai
https://solid.jobs/offers/it;t=management
```

### 🔍 Browser Verification Steps

1. **Open** `https://solid.jobs/offers/it;c=warszawa` in browser
2. **View page source** — check if server-rendered or SPA
3. **Open DevTools → Network tab** → look for JSON API calls (XHR/Fetch)
4. **If SPA**: look for `__NEXT_DATA__`, `__NUXT__`, or `window.__INITIAL_STATE__` in the HTML source
5. **Inspect job card HTML** — note CSS selectors for title, company, salary, skills
6. **Check** `https://solid.jobs/robots.txt`
7. **Check** if there's an RSS feed (`/feed`, `/rss`, or linked in `<head>`)

---

## 11. Indeed Poland

| Field | Value |
|-------|-------|
| **URL** | https://pl.indeed.com |
| **Market position** | Global board with PL presence, less IT-focused than JustJoin/NoFluff |
| **Approach** | JobSpy library (recommended) |
| **Status** | Not yet implemented |

### Known Technical Details

The official Indeed Publisher Jobs API is **deprecated**. An undocumented internal JSON API exists but is not stable.

### Anti-Scraping

Indeed is one of the most aggressive boards:
- Active bot detection
- IP throttling
- CAPTCHAs
- Frequent DOM changes

### Recommended: JobSpy Library

```python
from jobspy import scrape_jobs

jobs = scrape_jobs(
    site_name=["indeed"],
    search_term="Head of AI",
    location="Warsaw, Poland",
    results_wanted=50,
    country_indeed="Poland",
)
```

### Search URL Patterns

```
https://pl.indeed.com/jobs?q=Head+of+AI&l=Warszawa&salary=20000
https://pl.indeed.com/jobs?q=Director+of+Data&l=Polska&fromage=7

Parameters:
  q        — search query
  l        — location
  salary   — minimum salary
  fromage  — days since posting (1, 3, 7, 14)
  start    — pagination offset (0, 10, 20, ...)
```

### Known Open-Source Scrapers

- `speedyapply/JobSpy` — multi-board, handles Indeed well
- Apify: `misceres/indeed-scraper`
- Paid: HasData, ScrapingBee, ScrapFly

### 🔍 Browser Verification Steps

1. **Open** `https://pl.indeed.com/jobs?q=Head+of+AI&l=Warszawa` in browser
2. **Open DevTools → Network tab** → look for JSON API calls
3. **Check** if results load via SSR or client-side rendering
4. **Test rate limiting**: try a few rapid requests via DevTools console
5. **Check** `https://pl.indeed.com/robots.txt`

---

## 12. Startup.jobs

| Field | Value |
|-------|-------|
| **URL** | https://startup.jobs |
| **Market position** | International startup job board, some PL listings |
| **Approach** | HTML scraping |
| **Status** | Not yet implemented |

### Known Technical Details

No public API exists for startup.jobs (the English-language site). A separate Czech site (StartupJobs.cz) has an API at `https://api.startupjobs.cz/company/offers` but this is a different service.

**Search URL patterns:**
```
https://startup.jobs/s?q=Head+of+AI&l=Warsaw
https://startup.jobs/s?q=Director+of+Data&l=Poland
```

### 🔍 Browser Verification Steps

1. **Open** `https://startup.jobs/s?q=AI&l=Poland` in browser
2. **Check** if there are any PL listings at all (may be too few to justify a scraper)
3. **View page source / Network tab** — check for API or server-rendered content
4. **Check** `https://startup.jobs/robots.txt`

---

## 13. Glassdoor Poland

| Field | Value |
|-------|-------|
| **URL** | https://www.glassdoor.com |
| **Market position** | Job listings + company reviews + salary data |
| **Approach** | JobSpy library |
| **Status** | Not yet implemented |

### Known Technical Details

Glassdoor has strong anti-scraping (similar to LinkedIn). The main value is salary data and company reviews, not just listings.

### Recommended: JobSpy Library

```python
from jobspy import scrape_jobs

jobs = scrape_jobs(
    site_name=["glassdoor"],
    search_term="Head of AI",
    location="Warsaw, Poland",
    results_wanted=50,
)
```

### Search URL Patterns

```
https://www.glassdoor.com/Job/warsaw-head-of-ai-jobs-SRCH_IL.0,6_IC3093896_KO7,17.htm
```

### 🔍 Browser Verification Steps

1. **Open** `https://www.glassdoor.com/Job/warsaw-head-of-ai-jobs-SRCH_IL.0,6_IC3093896_KO7,17.htm` in browser
2. **Check** if PL listings exist in meaningful volume
3. **Note** the company review and salary data available alongside listings — this is unique value

---

## Common Patterns

### Job Data Interface

All scrapers must output jobs conforming to this interface (defined in `crawler/src/config.ts`):

```typescript
interface Job {
  id: string;            // Format: "{source}:{slug}" e.g., "justjoin:abc123"
  source: string;        // Board name: "justjoin.it", "nofluffjobs.com", etc.
  title: string;
  company: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;  // "PLN", "EUR", "USD"
  salaryPeriod: string | null;    // "month", "year", "hour"
  url: string;                    // Full URL to original posting
  description: string;
  skills: string[];
  publishedAt: string;            // ISO 8601
  scrapedAt: string;              // ISO 8601
}
```

### Shared Scraping Patterns

**Request delay:** 2000ms between requests (configurable in `CONFIG.requestDelayMs`)

**User-Agent:** Browser-like UA string (configurable in `CONFIG.userAgent`)

**Deduplication:** Job ID format is `{source}:{unique_slug}`. SQLite `INSERT OR IGNORE` handles dedup.

**Error handling:** Each scraper catches errors per-request and continues. One failed search doesn't stop the whole scraper.

**Map pattern:** Use a `Map<string, Job>` to deduplicate within a single scraper run before returning.

### When to Use Cheerio vs Playwright

| Signal | Use Cheerio | Use Playwright |
|--------|-------------|----------------|
| Job data visible in page source (Ctrl+U) | ✅ | |
| `__NEXT_DATA__` or `__NUXT__` in source | ✅ | |
| Page source is empty/minimal HTML | | ✅ |
| Site returns 403 on fetch | | ✅ |
| Site shows Cloudflare challenge | | ✅ |
| JSON API discovered in Network tab | ✅ (use fetch) | |

---

## Adding a New Scraper

### Step-by-Step

1. **Create file:** `crawler/src/scrapers/{boardname}.ts`

2. **Implement the scrape function:**
```typescript
import { Job, CONFIG } from '../config.js';

export async function scrape{BoardName}(): Promise<Job[]> {
  console.log('[{BoardName}] Starting crawl...');
  const allJobs: Map<string, Job> = new Map();

  // ... fetch and parse jobs ...

  const jobs = Array.from(allJobs.values());
  console.log(`[{BoardName}] Found ${jobs.length} unique jobs`);
  return jobs;
}
```

3. **Register in orchestrator:** Edit `crawler/src/index.ts`:
```typescript
import { scrape{BoardName} } from './scrapers/{boardname}.js';

// Add to the scrapers array in crawl():
const scrapers = [
  // ... existing scrapers ...
  { name: '{BoardName}', fn: scrape{BoardName} },
];
```

4. **Test:** Run `npm run crawl` and verify the new source appears in output.

### Verification Checklist for New Scrapers

- [ ] Returns valid `Job[]` conforming to the interface
- [ ] Uses `{source}:{slug}` ID format for deduplication
- [ ] Respects `CONFIG.requestDelayMs` between requests
- [ ] Handles errors gracefully (logs and continues, doesn't crash)
- [ ] Uses `Map<string, Job>` for internal dedup
- [ ] Extracts salary when available
- [ ] Sets `source` field to the board's domain name
- [ ] Tested with `npm run crawl` (appears in output, jobs stored in DB)
