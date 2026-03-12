# Career Agent — Feature Opportunity Map

**Purpose:** Ranked capability inventory for an autonomous career agent. Designed for use by a follow-up web-crawling agent to research tooling, existing implementations, and integration methods per feature.

**Ranking logic:**
- **Ease** = implementation complexity given current GenAI + tooling landscape (1 = hardest, 5 = easiest)
- **Impact** = effect on actual hiring outcome or career trajectory (1–5)
- **$$$** = financial value created: time saved × seniority rate + opportunity uplift ($ to $$$$$)
- **Composite** = (Ease × 0.35) + (Impact × 0.65) — impact-weighted

---

## Master Feature Table

| # | Feature | Category | Ease | Impact | $$$ | Composite | Tooling Required | Web Research Needed |
|---|---------|----------|------|--------|-----|-----------|-----------------|---------------------|
| 1 | **Tailored CV variant generator** | Application | 5 | 5 | $$$$$ | 5.0 | LLM + achievement library | Existing impl: Simpkins, Resume.io, Rezi |
| 2 | **JD fit assessor (go/no-go)** | Screening | 5 | 5 | $$$$$ | 5.0 | LLM + criteria file | OpenAI job matching research, ATS scoring methods |
| 3 | **Cover note generator (150 words)** | Application | 5 | 4 | $$$$ | 4.35 | LLM + achievement library | CoverDoc, Kickresume AI — benchmark quality |
| 4 | **Interview question predictor** | Interview Prep | 5 | 4 | $$$$ | 4.35 | LLM + JD + company research | Glassdoor interview Q scraping, Interview Warmup (Google) |
| 5 | **STAR story generator from achievements** | Interview Prep | 5 | 4 | $$$$ | 4.35 | LLM + achievement library | Structured interview frameworks, STAR-L methodology |
| 6 | **Salary benchmarking report** | Negotiation | 4 | 5 | $$$$$ | 4.65 | WebSearch + LLM synthesis | Levels.fyi, Glassdoor, Payscale, LinkedIn Salary — all scrapable? |
| 7 | **Company deep-dive brief** | Research | 4 | 4 | $$$$ | 4.0 | WebSearch + LLM | Crunchbase, LinkedIn, G2, Glassdoor, Pitchbook — access methods |
| 8 | **Recruiter/interviewer profile brief** | Interview Prep | 4 | 4 | $$$$ | 4.0 | WebSearch + LinkedIn scrape | LinkedIn public profiles, Twitter, personal blogs |
| 9 | **JD red flag scanner** | Screening | 5 | 3 | $$$ | 3.7 | LLM only (pattern library) | Research: toxic JD language patterns, Glassdoor correlation studies |
| 10 | **Negotiation email drafter** | Negotiation | 5 | 5 | $$$$$ | 5.0 | LLM + comp data | Negotiation research, 10% rule, comp band studies |
| 11 | **LinkedIn headline + About rewriter** | LinkedIn | 5 | 4 | $$$$ | 4.35 | LLM + profile snapshot | LinkedIn SEO research, keyword density studies, A/B tests |
| 12 | **Weekly job scan + scored shortlist** | Discovery | 4 | 4 | $$$$ | 4.0 | WebSearch + criteria matching | LinkedIn Jobs, Indeed, Glassdoor, Pracuj.pl — scrape legality & methods |
| 13 | **Connection request personaliser** | Outreach | 5 | 3 | $$$ | 3.7 | LLM + target profile | LinkedIn char limits, acceptance rate research, warm vs cold |
| 14 | **Post-interview thank-you note** | Application | 5 | 3 | $$$ | 3.7 | LLM + interview notes | Research: does it actually move needle? Hiring manager surveys |
| 15 | **Mock interview simulator (text)** | Interview Prep | 4 | 4 | $$$$ | 4.0 | LLM + JD + company context | Pramp, Interviewing.io, Big Interview — feature benchmarking |
| 16 | **Follow-up email sequence** | Application | 5 | 3 | $$$ | 3.7 | LLM + application tracker | Optimal follow-up timing research, ghosting rate data |
| 17 | **Hidden job market miner** | Discovery | 3 | 5 | $$$$$ | 4.3 | WebSearch + LinkedIn scrape | "We're hiring" posts, company blogs, team expansion signals |
| 18 | **Warm intro request drafter** | Outreach | 5 | 4 | $$$$ | 4.35 | LLM + mutual connection data | Referral hire rate research (30–50% vs cold apps) |
| 19 | **Company culture & red flag report** | Research | 3 | 4 | $$$$ | 3.65 | WebSearch + Glassdoor scrape | Glassdoor scraping methods, Blind, Levels.fyi culture scores |
| 20 | **Offer comparison matrix** | Negotiation | 5 | 4 | $$$$$ | 4.35 | LLM + structured inputs | Total comp calculators, RSU vesting models, equity dilution tools |
| 21 | **Compensation band estimator per company** | Research | 3 | 5 | $$$$$ | 4.3 | WebSearch + Levels.fyi scrape | H1B salary disclosures, EU pay transparency directive, Levels.fyi |
| 22 | **LinkedIn Experience section rewriter** | LinkedIn | 5 | 3 | $$$ | 3.7 | LLM + career-facts.md | LinkedIn keyword research, ATS-passing profile studies |
| 23 | **Cold outreach to hiring managers** | Outreach | 4 | 4 | $$$$ | 4.0 | LLM + LinkedIn data | Cold email open rates, hiring manager response behaviour |
| 24 | **Application tracker + pipeline status** | Tracking | 4 | 2 | $$ | 2.7 | LLM + structured log | ATS comparison research, notion/sheets integration options |
| 25 | **LinkedIn post drafter (thought leadership)** | LinkedIn | 5 | 3 | $$$ | 3.7 | LLM + career narrative | Viral post format research, hook patterns, posting frequency studies |
| 26 | **Market skill gap analysis** | Career Dev | 3 | 4 | $$$$ | 3.65 | WebSearch + JD corpus analysis | Trending skills in target job market, O*NET, LinkedIn Skills data |
| 27 | **Company news alert + outreach trigger** | Outreach | 3 | 4 | $$$$ | 3.65 | WebSearch + news API | Google Alerts alternatives, funding news scraping, Crunchbase API |
| 28 | **Rejection response (keep door open)** | Application | 5 | 2 | $$ | 3.05 | LLM only | Research: boomerang hire rates, recruiter memory span |
| 29 | **Alumni network activation message** | Outreach | 5 | 3 | $$$ | 3.7 | LLM + university/company alumni data | LinkedIn alumni filter access, SWPS/Euro-net network mapping |
| 30 | **Recruiter InMail response generator** | Outreach | 5 | 3 | $$$ | 3.7 | LLM + criteria file | Recruiter messaging best practices, acceptance-to-call conversion |
| 31 | **Competitor talent mapping** | Intelligence | 2 | 3 | $$$ | 2.65 | LinkedIn scrape + LLM | Who's hiring what at direct competitors; signal for market demand |
| 32 | **Interviewer research brief (pre-call)** | Interview Prep | 3 | 4 | $$$$ | 3.65 | WebSearch + LinkedIn scrape | Public profile depth, podcast appearances, published work |
| 33 | **Reference preparation guide** | Application | 5 | 2 | $$ | 3.05 | LLM + career-facts.md | What references actually check, typical question formats |
| 34 | **Job posting trend analysis (target market)** | Intelligence | 3 | 3 | $$$ | 3.0 | WebSearch + JD corpus | Skill frequency analysis across 100+ JDs in target role type |
| 35 | **LinkedIn Skills section optimiser** | LinkedIn | 5 | 2 | $$ | 3.05 | LLM + endorsement data | LinkedIn Skills algorithm research, search ranking correlation |
| 36 | **Equity / compensation explainer** | Negotiation | 5 | 4 | $$$$$ | 4.35 | LLM + comp structure data | RSU vs options vs BSPCE (EU), vesting cliff models, dilution scenarios |
| 37 | **Personal brand positioning statement** | Strategy | 5 | 3 | $$$ | 3.7 | LLM + career-facts.md | Positioning research, "top of mind" employer recall studies |
| 38 | **ATS keyword optimiser for CVs** | Application | 4 | 4 | $$$$ | 4.0 | LLM + JD keyword extraction | ATS vendor research (Workday, Greenhouse, Lever), parsing behaviour |

---

## Summary: Top 10 to Build First

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | Tailored CV variant generator | Highest composite, already partially built, direct hiring impact |
| 2 | JD fit assessor (go/no-go) | Already built; filters noise before any effort is spent |
| 3 | Negotiation email drafter | Highest $$$ per use; single email can be worth €10–30k |
| 4 | Salary benchmarking report | Informs every negotiation; scrapable data sources exist |
| 5 | LinkedIn headline + About rewriter | One-time, permanent impact on inbound recruiter volume |
| 6 | Warm intro request drafter | Referrals convert 5–10× vs cold applications |
| 7 | Company deep-dive brief | Pre-application and pre-interview, used constantly |
| 8 | Hidden job market miner | Surfaces roles before they hit boards; zero competition |
| 9 | STAR story generator | High-leverage interview prep, scales across all roles |
| 10 | Offer comparison matrix | High $$$ moment; LLM can structure complex trade-offs clearly |

---

## Tooling Requirements Summary (for web-crawling agent)

### Data Sources to Research Access Methods For

| Source | Data available | Access method to research | Legality notes |
|--------|---------------|--------------------------|---------------|
| LinkedIn Jobs | Job postings, company data, profiles | Unofficial API, Proxycurl API, ScrapeIn | ToS restricts scraping; paid APIs exist |
| Glassdoor | Salaries, reviews, interview questions | Unofficial scraping, RapidAPI wrappers | Login-gated; CAPTCHAs |
| Levels.fyi | Comp data by company/role/level | Public scraping, unofficial API | Public data, scrapable |
| H1B Salary Disclosures | US employer salary filings | DOL public database, FLCDS | Fully public |
| Crunchbase | Funding rounds, company stage, team | Official API (limited free), scraping | Paid API for full access |
| Indeed | Job postings | Indeed Publisher API, scraping | Publisher API available |
| Pracuj.pl (Poland) | Polish market jobs | Scraping, no public API | Research needed |
| Google Alerts / News | Company news triggers | Google News RSS, NewsAPI | RSS is fully open |
| EU Pay Transparency | Salary ranges (2026+ mandate) | Research directive rollout status | New regulation — research current state |
| Twitter/X | Hiring signals, founder posts | API (heavily restricted post-2023) | Paid tier only for useful volume |

### GenAI Methods to Research

| Method | Use case | Research angle |
|--------|----------|---------------|
| Structured extraction | JD → skills/requirements parsing | Prompt patterns for consistent JSON output |
| RAG over fact base | Contextual CV generation | Vector DB vs prompt-stuffing for personal docs at this scale |
| Few-shot framing | Cover notes in specific voice | How many examples needed to maintain tone consistency |
| Agentic web research | Company deep-dives | Multi-step research chains, source triangulation |
| Criteria-based scoring | Job fit scoring | Rubric design for consistent go/no-go output |
| Multi-doc synthesis | Offer comparison | Structured comparison across variable input formats |

---

*Generated: March 2026 | For follow-up research by web-crawling agent*
