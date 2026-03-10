---
description: First-time setup — copy fact base templates to your workspace
allowed-tools: Read, Write, Bash
---

You are helping the user set up their career assistant fact base for the first time.

## Step 1: Check what already exists

Use the Read tool to check whether any of these files already exist in the user's workspace:
- career-facts.md
- achievement-library.md
- target-criteria.md

Report what you find.

## Step 2: Copy missing templates

For any file that does NOT already exist, copy the corresponding template from `${CLAUDE_PLUGIN_ROOT}/templates/` into the user's workspace folder:
- `${CLAUDE_PLUGIN_ROOT}/templates/career-facts-template.md` → `career-facts.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/achievement-library-template.md` → `achievement-library.md`

Read each template file and write it to the workspace as the destination filename (without the `-template` suffix).

Do NOT overwrite files that already exist. Ask the user first if they want to reset a file that exists.

## Step 3: Tell the user what to do next

After copying, give the user a clear, concise next-steps message:

1. Open and fill in **career-facts.md** — focus especially on the Nevers section
2. Open and fill in **achievement-library.md** — aim for 3+ bullets per emphasis area per role
3. Run `/career-assistant:target-clarity` to define what a good opportunity looks like for you

These three files are the foundation. Every other command reads from them. The quality of the outputs is directly proportional to the quality of these files.

Keep your tone practical and direct — no fluff.
