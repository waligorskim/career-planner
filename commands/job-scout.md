---
description: Search for relevant roles and surface only the signal
allowed-tools: Read, Write, WebSearch
argument-hint: [optional: focus keyword or company name]
---

You are running a targeted job search on behalf of a passive job seeker. Your job is to surface high-quality signal — not volume. A shortlist of 3–8 genuinely relevant roles is a success. Returning 20 mediocre matches is a failure.

## Step 1: Load the criteria

Read `target-criteria.md` from the workspace.

If the file doesn't exist, stop and tell the user:
"You need to define your criteria first. Run `/career-assistant:target-clarity` — it takes about 10 minutes and makes every job search dramatically more useful."

If the file exists, extract:
- Hard filters (these are used to discard roles — zero exceptions)
- Role types / title variants to search for
- Company type and stage preferences
- Industry inclusions and exclusions
- Location/remote requirements
- Career direction (used to assess trajectory fit)

Also read `career-facts.md` if it exists, to understand the user's actual background and seniority level.

## Step 2: Build search queries

Based on the criteria, construct 4–6 targeted search queries. Vary them across:
- Different title variants for the same type of role (e.g. "Head of Product" vs "VP Product" vs "Director of Product")
- Company type signals (e.g. "Series B startup", "scale-up", "growth stage")
- Industry terms if relevant
- Location or remote-friendly signals if needed

If the user passed an argument (`$ARGUMENTS`), treat it as an additional focus constraint — e.g. a specific company name, sector, or role type to prioritise.

Example query formats:
- `[Title] [seniority] [city OR remote] [industry] job 2025`
- `[Title] [company stage] [industry] hiring`
- `site:linkedin.com/jobs [Title] [location] [company type]`
- `[Title] [industry] [city] "remote" OR "hybrid" job opening`

## Step 3: Run searches

Execute each query using WebSearch. For each result page, extract:
- Role title
- Company name
- Location / remote status
- Brief description or visible summary
- Link

## Step 4: Apply hard filters

For each result, check it against the hard filters in target-criteria.md. If a role fails ANY hard filter, discard it silently. Do not include disqualified roles in the output.

If a result lacks enough information to check a hard filter (e.g. comp is unknown), do not discard it — flag it as "comp unconfirmed" in the output.

## Step 5: Score passing roles

For roles that pass the hard filters, score them 1–5 against the strong preferences:
- 5 = Matches multiple strong preferences, strong trajectory fit
- 3 = Neutral on most preferences, nothing concerning
- 1 = Passes filters but misses most preferences

## Step 6: Output the shortlist

Present results in a clean table followed by brief notes per role. Format:

---

## Job Scout — [Date]

**Search parameters:** [Brief summary of what you searched for]
**Total results reviewed:** [N]
**Passed hard filters:** [N]
**Surfaced for review:** [N]

---

| # | Role | Company | Location | Score | Link |
|---|------|---------|----------|-------|------|
| 1 | ... | ... | Remote/Hybrid/On-site | ★★★★★ | [Link] |
| 2 | ... | ... | ... | ★★★☆☆ | [Link] |
...

### Notes per role

**1. [Role] @ [Company]**
- Why it passed: [1–2 sentences on what matches the criteria]
- Watch out for: [any amber flags — unclear comp, stage mismatch, etc.]
- Comp signal: [Confirmed / Unconfirmed / Estimated at €X–Y based on role/stage/location]

*(repeat for each role)*

---

**Next step:** For any role that looks interesting, paste the job description into `/career-assistant:fit-assessor` for a full go/no-go analysis.

---

After outputting, offer to run the search again with adjusted parameters if the shortlist is thin or off-target.
