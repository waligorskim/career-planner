---
description: Generate a tailored CV variant and cover note for a specific role
allowed-tools: Read, Write, WebFetch
argument-hint: [paste JD text, or provide a URL]
---

You are generating tailored application materials for a specific role. The output must be grounded entirely in the user's actual background — never invent or embellish. Your job is intelligent selection and reframing, not fabrication.

The two outputs are:
1. A tailored CV variant in clean Markdown
2. A short cover note (~150 words) — human, specific, not a cover letter essay

## Step 1: Get the JD

If `$ARGUMENTS` contains a URL, fetch the page with WebFetch and extract the job description text.

If `$ARGUMENTS` contains pasted JD text, use it directly.

If no argument was provided, ask the user to paste the JD or provide a URL.

## Step 2: Load the fact base

Read from the workspace:
- `career-facts.md` — background, timeline, verified metrics, nevers
- `achievement-library.md` — pre-written bullets grouped by role and emphasis

If either file doesn't exist, stop and tell the user clearly which file is missing and how to create it (run `/career-assistant:setup` to get the templates).

## Step 3: Analyse the JD for emphasis

Extract from the JD:
- The 3–5 most important requirements (what they keep repeating or list first)
- The dominant emphasis: is this role primarily about **leadership**, **commercial outcomes**, **technical depth**, **scale/operations**, or **strategy/influence**?
- Key phrases and terminology the hiring team uses — these inform language choices
- Any specific technologies, methodologies, or frameworks mentioned

## Step 4: Select achievements

From `achievement-library.md`, select the bullets that best match the emphasis areas identified in Step 3.

Rules:
- Only select bullets from roles/experiences that are in `career-facts.md` — never invent or interpolate
- For each major role, lead with the bullets that match the JD's dominant emphasis
- Maximum 4–5 bullets per role in the CV — prioritise ruthlessly
- If the same achievement has multiple framings in the library, pick the one that uses language closest to the JD
- Never exaggerate scope or metrics — if the library says "contributed to," don't upgrade it to "led"

## Step 5: Write the tailored CV

Structure:

```
# [Full Name]
[Email] | [LinkedIn URL] | [Location / Remote-friendly]

## Professional Summary

[3–4 sentences. Lead with the most relevant thing about them for this specific role.
Draw from career-facts.md — timeline, scope, key metrics.
Use language from the JD where it honestly reflects their background.
No generic filler like "results-driven professional".]

## Experience

### [Title] — [Company] ([Start] – [End/Present])
[One-line description of what the company does and their scope]
- [Selected bullet from achievement library — emphasis-matched]
- [Selected bullet]
- [Selected bullet]
- [Selected bullet if warranted]

### [Title] — [Company] ([Start] – [End])
[One-line scope description]
- [Selected bullets]

*(Include all roles from career-facts.md timeline, with fewer bullets for earlier roles)*

## Education

[Degree, Institution, Year — from career-facts.md]

## Skills & Tools *(only if relevant to this role)*

[Only include if the JD specifically asks for listed skills/tools that are in career-facts.md]
```

Formatting rules:
- Clean Markdown only — no fancy formatting
- No tables, no columns, no icons
- Date formats consistent throughout
- Consistent tense: past for past roles, present for current
- No "References available on request"

## Step 6: Write the cover note

150 words maximum. Structure:

**Para 1 (2–3 sentences):** Why this specific role, at this specific company. Not "I am excited to apply." Reference something specific about the company or role that's actually in the JD.

**Para 2 (3–4 sentences):** The one thing about your background most relevant to their biggest challenge. Pick the single most important match from Step 4 and make it concrete — cite a metric or a specific outcome.

**Para 3 (1–2 sentences):** Clean close. Express interest in a conversation. No desperation, no grovelling.

Do not use:
- "I am writing to express my interest in..."
- "I believe I would be a great fit because..."
- "Please find attached my CV"
- Any sentence longer than 25 words

## Step 7: Save outputs

Save the CV to the workspace as:
`cv-[company-name-kebab-case].md`

Save the cover note to the workspace as:
`cover-note-[company-name-kebab-case].md`

Confirm both files are saved, then tell the user:

"Your tailored CV and cover note are saved. A few things to check before you send:
1. Verify every metric in the CV is one you can speak to in an interview
2. Read the cover note out loud — if it sounds like it was written by a robot, it needs a human pass
3. Double-check the company name spelling and any specific product/team names"
