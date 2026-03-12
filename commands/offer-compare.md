---
description: Structured comparison of 2–3 offers with recommendation
allowed-tools: Read, WebSearch
argument-hint: [describe offer 1] vs [offer 2] [vs offer 3 optional]
---

You are building an offer comparison matrix for Mateusz Waligórski. The goal is a clear-headed, structured view of competing options — not to confirm what he already wants to do, but to surface trade-offs he might not have explicitly considered. You end with a recommendation, but you show your working.

## Step 1: Get the offer details

Parse `$ARGUMENTS` for each offer. For each, extract:
- Company name and role title
- Base salary
- Bonus (target % or fixed)
- Equity (type, amount, vesting schedule, cliff)
- Benefits (pension/retirement, health, learning budget, etc.)
- Location / remote policy
- Company stage and funding
- Reporting line and team size
- Start date

If critical fields are missing for any offer, list what's missing and ask before proceeding. A comparison with missing data leads to a bad decision.

## Step 2: Load context

Read `target-criteria.md` from workspace:
- What's the comp floor?
- What career direction is he building toward?
- What are the hard filters?
- What are the strong preferences?

## Step 3: Research where needed

For any offer where equity value is ambiguous (startup options vs. RSUs), run:
- `[company name] valuation 2024 2025`
- `[company name] funding round investors`

Use this to estimate equity value range conservatively.

If comp data is needed for context: run `salary-intel`-style search for any role where the offer seems off-market.

## Step 4: Build the comparison

### 4a — Total Compensation (annual, fully loaded)

Calculate for each offer:
- Base
- Expected bonus (at target %)
- Equity annualised (at current valuation for RSUs; at realistic exit multiple for options — always conservative)
- Key benefits with monetary value (e.g. health insurance, pension match, learning budget)
- **Total comp (conservative)** and **Total comp (optimistic)**

### 4b — Non-Financial Factors

Score each offer 1–5 against:
- Career trajectory fit (does this accelerate, maintain, or diverge from stated direction?)
- Company stage fit (vs. his stated preference)
- Role scope (does it expand or contract his current remit?)
- Team quality signals (what can be inferred about the people?)
- Culture fit (vs. stated preferences and must-haves)
- Risk profile (stability of company, likelihood of role lasting 2+ years)
- Learning rate (what new capability does this build?)

### 4c — Downside scenarios

For each offer, what's the realistic bad outcome?
- Company fails / role is eliminated in 18 months — what does he walk away with?
- Role underdelivers on scope — how trapped is he?
- Comp doesn't grow — what's the opportunity cost vs. other offers?

## Step 5: Output

---

## Offer Comparison — [Date]

### Total Compensation Summary

| Component | [Company A] | [Company B] | [Company C] |
|-----------|------------|------------|------------|
| Base | €X | €X | €X |
| Bonus (target) | €X | €X | €X |
| Equity (annualised, conservative) | €X | €X | €X |
| Benefits value | €X | €X | €X |
| **Total (conservative)** | **€X** | **€X** | **€X** |
| **Total (optimistic)** | **€X** | **€X** | **€X** |

### Non-Financial Score

| Factor | [A] | [B] | [C] | Weight |
|--------|-----|-----|-----|--------|
| Career trajectory | /5 | /5 | /5 | High |
| Stage fit | /5 | /5 | /5 | Medium |
| Role scope | /5 | /5 | /5 | High |
| Culture fit | /5 | /5 | /5 | Medium |
| Risk profile | /5 | /5 | /5 | Medium |
| Learning rate | /5 | /5 | /5 | Medium |
| **Weighted total** | **/X** | **/X** | **/X** | — |

### Downside Scenarios

**[Company A]:** [What happens if it goes wrong]
**[Company B]:** [What happens if it goes wrong]
**[Company C if present]:** [What happens if it goes wrong]

### The Trade-off in Plain Language

[2–3 sentences stating the core tension between the offers — what you gain and what you give up with each choice. No jargon.]

### Recommendation

**[Company X]** — [Why. One clear paragraph. State the reasoning, not just the conclusion.]

*This recommendation is based on stated criteria in target-criteria.md. If your priorities have shifted, the recommendation may change — flag what matters most and I'll re-run the analysis.*

---

End with: *"Review all equity assumptions carefully — these are estimates based on available public data. For options, treat the equity value as speculative unless there's a credible near-term liquidity event."*
