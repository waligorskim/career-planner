---
description: Generate STAR stories from your achievement library for a competency
allowed-tools: Read
argument-hint: [competency or interview question] [optional: role context]
---

You are generating structured STAR interview stories for Mateusz Waligórski. These are not generic — every story is drawn from his actual achievement library and career facts, then shaped into interview-ready format with coaching notes on delivery.

STAR = Situation → Task → Action → Result. But the version that works in senior interviews is STAR-P: the Perspective section, which shows what he learned or would do differently. Include it for each story.

## Step 1: Parse the request

From `$ARGUMENTS`:
- **Competency or question**: e.g. "leading through ambiguity", "driving cross-functional alignment", "delivering AI product impact", "managing a large team through change"
- **Role context** (optional): if targeting a specific type of role, note it — this shapes which achievements to emphasise

## Step 2: Load the fact base

Read `achievement-library.md` and `career-facts.md`.

Identify the 3 strongest achievement entries that map to the stated competency. Prioritise:
1. Recency (last 3–4 years weighted higher)
2. Metric strength (verified figures from career-facts.md)
3. Narrative clarity (does the story have a clear before/after?)
4. Uniqueness (avoid using the Gemini story for every competency — vary sources)

## Step 3: Generate stories

For each of the 3 selected achievements, write a STAR-P story:

**Situation (2–3 sentences):** Set the context. What was the environment? What were the stakes? Keep it tight — interviewers want the story, not the history lesson.

**Task (1–2 sentences):** What was specifically your responsibility? Be precise about ownership — what were YOU accountable for, not the team.

**Action (3–5 sentences):** What did you do, specifically? This is the longest part. Concrete decisions, not "I worked closely with stakeholders." Name the hard call, the pivot, the thing that made the difference.

**Result (2–3 sentences):** What happened? Use the exact metric from career-facts.md if one applies. Scope the result accurately (per the nevers and nuances in career-facts.md).

**Perspective (1–2 sentences):** What would you do differently, or what did this teach you? Senior candidates who can reflect on their own work are more credible, not less.

**Delivery notes:** 2–3 bullet coaching notes:
- Estimated speaking time (aim for 2.5–3 minutes per story)
- Where the interviewers usually lean in — what to slow down on
- What to watch out for (over-explaining the tech, downplaying team contributions, etc.)

## Step 4: Output

---

## STAR Stories — [Competency]

*Prepared for: [role context if provided]*
*Source: achievement-library.md + career-facts.md*

---

### Story 1 — [Source role/achievement, e.g. "Displate / Gemini Deployment"]

**Competency fit:** [Why this story maps to the stated competency]

**SITUATION**
[Text]

**TASK**
[Text]

**ACTION**
[Text]

**RESULT**
[Text]

**PERSPECTIVE**
[Text]

**Delivery notes:**
- ⏱ ~2.5 minutes at a measured pace
- Slow down on: [specific moment]
- Watch out for: [specific pitfall]

---

### Story 2 — [Source]

[Same structure]

---

### Story 3 — [Source]

[Same structure]

---

**Usage guidance:** Use Story 1 as your primary. Story 2 if they ask for another example. Story 3 as a backup or for a different angle on the same competency. Never use two stories from the same role back-to-back.
