---
description: Deep-dive company research brief before applying or interviewing
allowed-tools: Read, WebSearch, WebFetch
argument-hint: [company name] [optional: role you're targeting]
---

You are generating a company intelligence brief for Mateusz Waligórski. This brief is used before deciding whether to apply, before a first call, or before an interview. The goal is not a Wikipedia summary — it's actionable intelligence: what kind of company is this really, what are the risks, and what questions should he go in asking.

Lead with the verdict. Don't bury the lede in background.

## Step 1: Parse the request

From `$ARGUMENTS`:
- Company name
- Role being targeted (if provided — this shapes which parts of the brief to emphasise)

## Step 2: Load context

Read `target-criteria.md` to understand what Mateusz is looking for. This shapes the red flag assessment — what counts as a problem depends on his criteria.

## Step 3: Research

Run searches across these dimensions:

**Company fundamentals:**
- `[company name] funding round 2024 2025` (stage, investors, burn rate signals)
- `[company name] revenue employees 2025` (size and growth trajectory)
- `[company name] product` — what do they actually make, who's the customer

**Culture & leadership:**
- `[company name] CEO founder background`
- `[company name] Glassdoor reviews` (overall rating, management score, recent reviews)
- `[company name] layoffs 2023 2024 2025` (restructuring history)
- `[company name] LinkedIn` — team size, turnover signals, tenure patterns

**Recent news:**
- `[company name] news 2025 2026` — product launches, partnerships, leadership changes, controversies
- `[company name] site:techcrunch.com OR site:bloomberg.com` for signal-heavy coverage

**Product & market:**
- `[company name] competitors alternatives` — who they're up against
- `[company name] product reviews G2 Capterra` (if B2B SaaS)
- `[company name] customer case study` — who's buying and why

**If role is provided, also search:**
- `[company name] [role title] team structure` — how is the function organised
- `[company name] analytics/product/AI` — how mature is the relevant capability

## Step 4: Synthesise

Assess against Mateusz's criteria from target-criteria.md:
- Does the company stage match his preferences?
- Are there culture red flags that conflict with his stated must-haves?
- Is the product direction aligned with where he's building toward?

## Step 5: Output

---

## Company Brief — [Company Name]

**Brief prepared:** [Date] | **For role:** [Role if specified]

### Verdict

[2–3 sentences: is this worth pursuing, and why or why not. Lead with this.]

### Company at a Glance

| Dimension | Detail |
|-----------|--------|
| **Founded** | — |
| **Stage / Funding** | — |
| **Headcount** | — |
| **HQ / Remote policy** | — |
| **Revenue / ARR** | — (if available) |
| **Key investors** | — |
| **Business model** | — |

### Product & Market

[What they build, who they sell to, why anyone buys it. 3–5 sentences. Skip this if it's obvious.]

### Culture Signals

**Glassdoor:** [Overall rating X/5 — what reviewers praise, what they flag]
**Leadership:** [CEO/founder background — operator or investor? Technical or commercial?]
**Tenure signals:** [Average tenure from LinkedIn? Churn in key roles?]
**Layoff history:** [Any since 2022? How handled?]

### Recent News

- [Date] — [What happened and why it matters]
- [Date] — [What happened and why it matters]

### Red Flags

[Honest list. Empty if none. Don't manufacture concern where there isn't any.]

### Green Flags

[What looks genuinely good about this opportunity, specific to Mateusz's situation]

### Questions to Investigate

[3–5 specific questions to ask in a first call or interview — things public research can't answer]

### Fit vs. Criteria Check

| Criterion | Status | Notes |
|-----------|--------|-------|
| Company stage | ✅ / ⚠️ / ❌ | — |
| Culture signals | ✅ / ⚠️ / ❌ | — |
| Career direction fit | ✅ / ⚠️ / ❌ | — |
| Comp likelihood | ✅ / ⚠️ / ❌ | — |

---
