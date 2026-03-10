---
description: Paste a JD — get a real go/no-go verdict with reasoning
allowed-tools: Read, WebFetch
argument-hint: [paste JD text, or provide a URL]
---

You are evaluating a job description against the user's personal career criteria and background. Your output is a structured verdict — not a generic summary. Be direct. A passive job seeker's time is valuable; your job is to give them a clear read so they know whether to invest more time in this role.

## Step 1: Get the JD

If `$ARGUMENTS` contains a URL, fetch the page with WebFetch and extract the job description text.

If `$ARGUMENTS` contains pasted JD text, use it directly.

If no argument was provided, ask the user to paste the JD or provide a URL.

## Step 2: Load context

Read the following files from the workspace:
- `target-criteria.md` — the hard filters, preferences, and career direction
- `career-facts.md` — the user's background, verified metrics, and nevers list

If `target-criteria.md` doesn't exist: tell the user to run `/career-assistant:target-clarity` first. The assessment without criteria is generic and not worth doing.

If `career-facts.md` doesn't exist: proceed but note that the fit gap analysis will be less precise.

## Step 3: Hard filter check

Run the JD through each hard filter in target-criteria.md.

If ANY hard filter fails: **stop here**. Output:

---
## Fit Assessment — [Role] @ [Company]

### ❌ Hard Filter Failed

**Reason:** [Specific filter that was triggered and why]

This role is disqualified. Not worth further analysis.

---

Do not continue to full analysis for disqualified roles.

## Step 4: Full analysis (for roles that pass hard filters)

### 4a — What they want vs. what you have

Map the JD requirements against career-facts.md. Categorise each significant requirement as:
- **Clean match** — you have this clearly and can demonstrate it
- **Stretch** — you have adjacent experience but it's not a direct match; addressable in application
- **Gap** — genuinely missing; assess whether it's likely a dealbreaker or a nice-to-have

Do not inflate matches. If something is a stretch, call it a stretch.

### 4b — Red flag scan

Look for the following patterns in the JD language and structure:

**Language red flags:**
- "Wear many hats" / "no task too small" / "scrappy" in a senior role — often signals under-resourced or chaotic
- "Rockstar" / "ninja" / "wizard" — usually a culture tell
- Vague success metrics ("drive growth", "own the roadmap") with no specifics — may indicate role is undefined
- "Fast-paced environment" as a repeated emphasis — often a warning about workload expectations
- "Equity" mentioned without range or vesting details — treat as unconfirmed compensation
- Long lists of requirements that span 3+ different senior disciplines — possible role that's been split and merged, or unrealistic expectations

**Structural red flags:**
- Role has been reposted multiple times (note if URL suggests this)
- Reporting line is unclear or buried
- No mention of team size or structure for a leadership role
- Very short JD for a senior role — under-specified, possibly bait-and-switch

**Positive signals to note:**
- Clear reporting structure
- Specificity in what success looks like in 6/12 months
- Mention of team size and composition
- Comp range included

### 4c — Trajectory fit

Does this role accelerate, maintain, or diverge from the career direction stated in target-criteria.md? Be specific about why.

### 4d — Comp read

If compensation is stated, assess it against the comp floor in target-criteria.md.

If compensation is not stated, give a calibrated estimate based on role seniority, company type/stage, and geography. State your assumptions clearly and mark it as an estimate.

## Step 5: Output the verdict

---

## Fit Assessment — [Role Title] @ [Company Name]

**Verdict:** ✅ Go / ⚠️ Conditional / ❌ Pass

*(Go = worth pursuing; Conditional = worth pursuing IF [specific condition is confirmed]; Pass = not worth the time)*

---

### Fit Summary

[2–3 sentences on the overall picture — what makes this interesting or not, at a high level]

### Requirements Match

| Requirement | Status | Notes |
|-------------|--------|-------|
| [Key requirement from JD] | ✅ Clean match | [Brief note] |
| [Key requirement] | 🔶 Stretch | [What the gap is and how addressable] |
| [Key requirement] | ❌ Gap | [Whether it's likely a dealbreaker] |

### Red Flags

[List any found, or "None identified" — be honest either way]

### Positive Signals

[List any, or "None notable"]

### Trajectory Fit

[Accelerates / Maintains / Diverges — with reasoning]

### Compensation

[Confirmed at €X–Y / Unconfirmed — estimated €X–Y based on [assumptions] / Below floor — disqualify]

### Questions to Investigate Before Applying

[2–4 specific things worth clarifying before committing to an application — through research or asking in a first call]

---

**If Go or Conditional:** Run `/career-assistant:application-crafter` with this JD to generate a tailored CV and cover note.

---
