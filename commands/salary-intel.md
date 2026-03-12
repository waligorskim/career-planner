---
description: Comp benchmarking report for a role, level, and market
allowed-tools: Read, WebSearch
argument-hint: [role title] [location or remote] [company stage optional]
---

You are generating a compensation intelligence report. The goal is actionable market data: what the role actually pays in the target market, broken down by component, with source quality indicated. This report will be used before entering any negotiation or evaluating any offer.

## Step 1: Parse the request

From `$ARGUMENTS`, extract:
- Role title (standardise variants: "Head of Product" / "VP Product" / "Director of Product")
- Location (city, country, or remote)
- Company stage if provided (startup Series A–C, scale-up, enterprise)
- Seniority signals if provided

If the argument is blank, ask for role title and location before proceeding.

## Step 2: Load target criteria

Read `target-criteria.md` from the workspace. Note:
- Stated comp floor
- Company stage preferences
- Location / remote preference

This contextualises the benchmark — you're not benchmarking in the abstract, you're benchmarking against what Mateusz is actually targeting.

## Step 3: Research — run all queries in parallel where possible

Run the following searches:

**Primary data sources:**
- `"[role title]" salary [location] 2025 2026 site:glassdoor.com`
- `"[role title]" total compensation [location] site:levels.fyi`
- `[role title] [country] average salary [year]` — LinkedIn Salary, Payscale, local job boards
- `[role title] Poland Warsaw salary 2025` (local market reference even if targeting internationally)
- `H1B [role title] salary disclosure [year]` (for US market context or US-headquartered companies)

**Equity data:**
- `[company stage] startup equity [role level] typical 2025`
- `VP/Head/Director equity grant [Series A/B/C] benchmark`

**Poland/EU specific:**
- `[role title] Pracuj.pl salary` or `No Fluff Jobs [role title]`
- `EU pay transparency directive [role title] range`

## Step 4: Synthesise

For each component, report: low / median / high from available data.

Flag confidence: **High** (multiple sources agree), **Medium** (1–2 sources, some variation), **Low** (single source or outdated).

## Step 5: Output

---

## Salary Intelligence — [Role Title] | [Location] | [Date]

### Base Salary

| Market | Low | Median | High | Confidence |
|--------|-----|--------|------|-----------|
| [Location / market] | €X | €X | €X | High/Med/Low |
| Poland (local ref) | PLN X | PLN X | PLN X | High/Med/Low |

*Sources: [list with dates]*

### Equity (if startup/scale-up)

| Stage | Typical grant | Vesting | Notes |
|-------|--------------|---------|-------|
| Series A | X–X% | 4yr/1yr cliff | — |
| Series B | X–X% | 4yr/1yr cliff | — |
| Series C+ | 0.0X–0.X% | — | Often options → RSUs |

### Total Comp Estimate

| Scenario | Base | Bonus | Equity (annualised) | Total |
|----------|------|-------|---------------------|-------|
| Conservative | — | — | — | — |
| Mid-market | — | — | — | — |
| Top-of-market | — | — | — | — |

### vs. Target Criteria

- **Comp floor from target-criteria.md:** [X]
- **Mid-market benchmark vs. floor:** [above / below / at] by [amount]
- **Recommendation:** [If an offer comes in at €X, here's how to read it]

### Data Gaps

[Any components where data was thin or unavailable — and what to ask directly in the process]

---
