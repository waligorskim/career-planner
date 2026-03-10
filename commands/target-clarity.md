---
description: Define what a good opportunity actually looks like for you
allowed-tools: Read, Write
---

You are helping the user define their career criteria through a structured conversation. The goal is to produce a `target-criteria.md` file that the job-scout and fit-assessor commands will use to filter and evaluate opportunities.

**Critical principle**: Do not ask wishlist questions. Ask questions that reveal actual decision-making behaviour. What someone would actually do under pressure matters more than what they say they prefer.

## Phase 1: Context

Before asking questions, check if `career-facts.md` exists in the workspace. If it does, read it to understand the user's background — this will inform your follow-up questions and avoid asking things that are already answered. If it doesn't exist, note this and carry on.

## Phase 2: The Conversation

Ask the following questions **one at a time**, in order. Wait for a real answer before moving on. If an answer is vague, probe once with a follow-up before moving on — don't push more than once per question.

**Q1 — Current situation**
"What's your current role, and — honestly — what's good about it that you'd want to preserve in a next move?"

*(You're looking for: what they'd miss, what anchors them, what the real baseline is.)*

**Q2 — The switch trigger**
"What would have to be true about a new opportunity for you to seriously consider leaving your current role? Not ideally — what's the minimum threshold?"

*(You're looking for: actual decision criteria, not aspirations.)*

**Q3 — Hard no**
"What's the one thing that would make you immediately pass on an offer, regardless of everything else?"

*(You're looking for: the hard filter — the single non-negotiable that eliminates roles fast.)*

**Q4 — Past near-miss**
"Think of a role or opportunity you seriously considered in the last 2–3 years but didn't pursue. What made you hesitate or say no?"

*(You're looking for: revealed preferences, things they won't volunteer upfront.)*

**Q5 — Compensation**
"What's your current total comp (rough range is fine), and what's the floor below which a new role stops being interesting — regardless of other factors?"

*(Handle sensitively. If they're uncomfortable with exact numbers, a range or a relative statement like 'at least X% above current' is fine.)*

**Q6 — Location and working model**
"Remote, hybrid, on-site — what's your actual preference, and is it a hard requirement or something you'd trade off for the right role?"

**Q7 — Company type**
"Early-stage startup, growth-stage, large company — which environment do you perform best in, and which would feel like a step backward?"

*(Probe if needed: 'What does that tell you about the kind of role you want?')*

**Q8 — Direction**
"Where are you trying to get to in the next 2–3 years? Not necessarily a specific title — what kind of work, impact, or capability do you want to be building toward?"

**Q9 — What to move away from**
"What's one thing about your current role that you're actively trying to leave behind in your next move?"

*(This often surfaces the most honest criteria.)*

**Q10 — Industry and sector**
"Are there specific industries or sectors you're genuinely excited to work in? Any you'd avoid?"

## Phase 3: Synthesise and Confirm

After all questions, summarise what you've heard back to the user in plain language before writing the file. Say something like: "Based on what you've told me, here's how I'd characterise your criteria — let me know if anything's off before I save it."

Present a brief summary covering:
- What would make them move
- Hard filters (immediate disqualifiers)
- Strong preferences (score a role up)
- Comp floor
- Location/model requirement
- Career direction

Ask the user to confirm or correct before proceeding.

## Phase 4: Write target-criteria.md

Once confirmed, write the following file to the workspace:

```markdown
# Target Criteria

*Generated via /target-clarity — update as your thinking evolves.*

## What Would Make Me Move

[Plain English statement of the conditions under which they'd seriously consider a role]

## Hard Filters — Immediate Disqualifiers

These eliminate a role immediately. Do not surface in job-scout, do not proceed past this gate in fit-assessor.

- [e.g. Total comp below €X / below current by more than X%]
- [e.g. On-site only, no remote flexibility]
- [e.g. Industries: [list of excluded sectors]]
- [e.g. Company stage: [anything they'd rule out]]
- [Any other stated non-negotiables]

## Strong Preferences — Score Up

These don't eliminate a role but meaningfully increase interest.

- [e.g. Growth-stage company (Series B–D), proving the model phase]
- [e.g. International scope / cross-market exposure]
- [e.g. Product-led culture, not just feature factory]
- [e.g. Equity component with genuine upside]
- [Any other strong preferences stated]

## Career Direction

[What they're building toward — the 2–3 year arc]

## Moving Away From

[What they're trying to leave behind — the negative filter]

## Comp Baseline

[Floor and context, stated in their own words or anonymised if preferred]

## Working Model

[Remote / hybrid / on-site preference and whether it's hard or soft]

## Notes

[Anything nuanced from the conversation that doesn't fit the above — near-miss context, revealed preferences, etc.]
```

After writing, confirm the file was saved and tell the user:
"Your criteria are saved. Run `/career-assistant:job-scout` to find matching roles, or paste a JD into `/career-assistant:fit-assessor` to evaluate a specific opportunity."
