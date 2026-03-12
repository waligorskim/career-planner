---
description: Draft a negotiation email grounded in market data
allowed-tools: Read, Write, WebSearch
argument-hint: [paste offer details: role, company, base, equity, benefits]
---

You are drafting a salary negotiation email for Mateusz Waligórski. Your job is to produce an email that is firm without being combative, grounded in data without being robotic, and specific without being demanding. A well-written negotiation email is worth €10–30k. Take it seriously.

## Step 1: Get the offer details

Parse `$ARGUMENTS` for:
- Company name and role title
- Offered base salary / total comp
- Equity (type, amount, vesting)
- Benefits, bonus structure
- Start date or deadline pressure

If key details are missing (especially the comp number), ask for them before proceeding.

## Step 2: Load context

Read `career-facts.md` and `target-criteria.md` from the workspace.

Extract:
- Current comp baseline (from target-criteria.md)
- Target floor and ceiling
- Most relevant achievement metrics for leverage (from career-facts.md verified metrics)

## Step 3: Research market rates

Run 2–3 WebSearch queries:
- `[role title] salary [city/remote] [company stage] 2025 2026`
- `[role title] total compensation Poland/EU [seniority level]`
- `[company name] salary [role title] Glassdoor Levels.fyi`

Extract: base salary ranges, equity norms for company stage, total comp benchmarks. Note source and confidence level for each data point.

## Step 4: Assess negotiation position

Determine:
- **Gap**: difference between offer and target
- **Leverage**: what makes Mateusz's position strong (competing interest? specific achievement that directly maps to their problem? market data?)
- **Primary ask**: base increase, equity top-up, signing bonus, or combination
- **Fallback**: what's the minimum acceptable outcome

## Step 5: Draft the email

Structure (250–400 words total):

**Opening (1 sentence):** Express genuine interest in the role and the company. Not enthusiasm — interest. Make it sound like you mean it.

**Pivot (1–2 sentences):** "That said, I'd like to discuss the compensation package." No apology. No hedging.

**Anchor (2–3 sentences):** State the target number or range. Ground it in one of:
- Market data (cite source)
- A specific achievement that directly creates the value they're hiring for
- Competing options (only if true and appropriate — never bluff)

**Specific ask (1–2 sentences):** What specifically are you requesting? Be precise: "I'd like to propose a base of €X" not "I was hoping for something a bit higher."

**Flexibility signal (1 sentence):** One place you have genuine flexibility (start date, vesting schedule, title) — shows good faith without undermining the ask.

**Close (1 sentence):** Offer a call to discuss. Not "I look forward to your response." Something like: "Happy to jump on a call this week if that would help move things forward."

**Tone rules:**
- Never apologise for negotiating
- Never use "I was just wondering" or "I don't want to be difficult"
- Never open with "Thank you so much for the offer"
- Never close with "I completely understand if this isn't possible"
- Be direct. Hiring managers respect it.

## Step 6: Output

Present:
1. The email draft
2. A brief negotiation rationale (3–5 bullets): why this ask is defensible, what market data supports it, what leverage points exist
3. A "what if they say no" section: two counter-positions Mateusz could take

End with: *"Review before sending. Flag any comp figures or facts that need adjusting before I finalise."*
