---
description: Rewrite a LinkedIn profile section for a target role type
allowed-tools: Read, Write
argument-hint: [section: headline | about | experience] [target role type]
---

You are rewriting a specific section of Mateusz Waligórski's LinkedIn profile. The goal is not to make it sound impressive — it already is. The goal is to make it **findable** by the right recruiters and **compelling** to the right hiring managers for a specific target role type.

LinkedIn is primarily a search and signal engine. Every word choice is also a keyword choice.

## Step 1: Parse the request

From `$ARGUMENTS`, identify:
- **Section**: headline, about, or a specific experience entry (e.g. "Displate Head of Analytics")
- **Target role type**: what kind of roles should this attract? (e.g. "VP Product at AI-native scale-up", "Head of AI Product at marketplace", "CPO early-stage")

If either is missing, ask before proceeding.

## Step 2: Load context

Read `career-facts.md` and `achievement-library.md` from the workspace.

Also read `target-criteria.md` if present — career direction shapes which keywords to prioritise.

## Step 3: Apply section-specific logic

### Headline (220 characters max)

Rules:
- Lead with the role you WANT, not the role you HAVE
- Include 2–3 high-value keywords for recruiter search
- Make it human — avoid pipe-separated lists of titles
- One concrete differentiator (the Gemini case study, the 300-person division, the 16 years) — pick one
- Current employer name (boosts SEO on LinkedIn)

Bad: `Entrepreneur in Residence @ Displate | Co-Founder | AI Advisory | Angel Investor`
Good: `AI Product & Analytics Leader | Deployed Gemini at scale → 750% growth | EiR @ Displate | Co-Founder SwipePads`

Generate 3 variants ranked by search optimisation vs. human appeal trade-off.

### About Section (2,600 characters max)

Structure:
- **Hook (2 sentences):** The clearest possible statement of who he is and what he does that nobody else does. Not a timeline.
- **The arc (2–3 sentences):** The through-line of the career — what connects UX → analytics → gov → NFT → AI. Make the pattern legible.
- **The proof point (2–3 sentences):** One specific, metric-backed achievement. The Gemini project is the strongest for most target roles.
- **What he's building toward (1–2 sentences):** Direction, not desperation. Written as possibility, not need.
- **Call to action (1 sentence):** What kind of conversation is worth having. Specific.

Tone: Mateusz's voice — casual, direct, no corporate filler. First person. No "results-driven professional."

### Experience Entry

For a specific role entry, rewrite the description to:
- Lead with scope (what the role was, at what scale)
- Include 3–4 bullet achievements from achievement-library.md, emphasis-matched to target role type
- Use keywords naturally — integrate them into achievement bullets, not as a keyword dump
- Keep bullets to 1–2 lines each; no walls of text

## Step 4: Output

Present the rewritten section clearly formatted.

For **headline**: present 3 variants with brief rationale for each.

For **about** and **experience**: present one version with inline notes where keyword choices were deliberate:

> *[Keyword note: "multimodal AI deployment" — high search volume for AI product roles in 2025–2026]*

End with: *"Review before updating. Check that all metrics are ones you can speak to in an interview."*
