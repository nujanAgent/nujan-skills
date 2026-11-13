# Skill format

A NuJan skill is a folder. Its name is the skill's name: lowercase letters, digits and single hyphens, at most 64
characters, as in `trip-planner`. A skill cannot take the name of one that ships with NuJan; the review screen says
so before anything is installed.

```
skills/
  trip-planner/
    SKILL.md        required: frontmatter, then the instructions
    skill.json      NuJan's settings: when the skill fires and which tools it may use
    script.js       only in a scripted skill (tier 2)
    references/     optional text files that add to the instructions
```

`SKILL.md` follows the open [Agent Skills specification](https://agentskills.io/specification), so the same folder can
be loaded by other agents that read that format. `skill.json` holds what the specification has no field for; other
agents ignore it. A skill that has no `skill.json` still installs in NuJan: NuJan makes one from the frontmatter, with
no tools, that fires when a message names the skill, as in "use the trip planner". The person installing it sees that
before anything is saved.

## SKILL.md

### Frontmatter

`SKILL.md` opens with a YAML block between two `---` lines:

```yaml
---
name: trip-planner
description: "Plans a trip day by day with a map link for every place. Use when someone asks for an itinerary or things to do somewhere."
license: Apache-2.0
---
```

| Field | Required | Rule |
| --- | --- | --- |
| `name` | yes | The folder's name. |
| `description` | yes | 1 to 1,024 characters: what the skill does, then "Use when" and the requests it is for. Agents that read the open format choose a skill by its description. Put it in double quotes, so that a colon inside it is read as text. |
| `license` | yes in this repository | `Apache-2.0`. |

Leave out `allowed-tools`: some agents treat it as approval to use those tools without asking. Leave out any line that
starts with an exclamation mark followed by a backquoted command: some agents run that command when they load the skill.
NuJan reads the frontmatter when it installs a skill and gives the model only the text under it.

### Instructions

The text under the frontmatter is what the model reads whenever the skill fires, on every such turn. Write it to the
model, as a procedure:

- what to do first, and which tool to call for each step;
- what good output looks like, with the details that make it good;
- what to check before answering, and what to do when a step fails;
- what never to do.

Keep it short enough to be worth its cost: every line is read on every turn the skill fires. Keep `SKILL.md` under 500
lines. Name NuJan's tools exactly, in backquotes, as in `web_search`.

### Reference files

Text files in the skill's folder, such as `references/sources.md`, are added to the end of the instructions when the
skill is installed, from GitHub or from a `.zip`: Markdown, plain text, JSON, YAML, CSV and TSV, up to 12 files and
96 KB in all. Files of other kinds (scripts, PDFs, images, fonts) cannot be carried; NuJan names them to the person
before installing and to the model after.

## skill.json

```json
{
  "schemaVersion": 1,
  "id": "trip-planner",
  "name": "Trip planner",
  "version": "1.0.0",
  "description": "A day-by-day plan with a map link for every place.",
  "author": "Your name",
  "license": "Apache-2.0",
  "tier": 1,
  "triggers": {
    "keywords": ["itinerary", "plan a trip", "things to do in"],
    "slashCommand": "trip"
  },
  "tools": ["web_search", "extract_article", "web_fetch"],
  "permissions": { "web_search": "ask", "extract_article": "ask", "web_fetch": "ask" },
  "modelHint": "any",
  "privacy": "allow_cloud"
}
```

| Field | Meaning |
| --- | --- |
| `schemaVersion` | `1`. |
| `id` | Required. The folder's name. |
| `name` | Required. The name NuJan shows. |
| `version` | The skill's version, such as `1.0.0`. |
| `description` | One line for NuJan's list of skills. |
| `author` | Who wrote the skill. |
| `license` | The same licence as the frontmatter. |
| `tier` | `1` for instructions only (the default). `2` for instructions with a `script.js`, described below. |
| `triggers.keywords` | Words and phrases that make the skill fire; see [Triggers](#triggers). |
| `triggers.slashCommand` | A command, without the slash, that runs the skill directly: `trip` for `/trip`. |
| `tools` | The NuJan tools the skill uses; see [Tools](#tools). |
| `permissions` | What you expect each tool to need, such as `"ask"`. This is a note for the person installing the skill: NuJan's own permission settings decide every call, whatever a skill says. |
| `leadTool` | Optional. The tool the procedure starts with, from `tools`. While the skill is active, a cloud model is offered only this tool and `ask_user` until the lead has been called, so the procedure starts the right way whichever model runs it. |
| `then` | Optional, with `leadTool`. The tools that follow the lead, in order, from `tools`. Each is offered alone with `ask_user` until it has run. |
| `modelHint` | `any` (the default), `local` for on-device models only, or `cloud` for cloud models only. |
| `privacy` | `local_only` or `allow_cloud`: what the author expects. NuJan's privacy settings decide what leaves the phone. |

### Triggers

NuJan matches keywords against the person's message as whole words, ignoring case, with a hyphen or an underscore
read as a space (`step-by-step` also matches "step by step"), and scores them:

- A phrase of two or more words, or a keyword with punctuation such as `/note`, fires the skill on its own.
- A single distinctive word, such as `itinerary` or `mindmap`, fires it on its own.
- A single everyday word of the kind people use for many tasks, such as `search`, `image`, `file` or `read`, counts
  half: two of them together fire the skill.
- Ordinary sentence words, such as `what`, `make` or `please`, and anything shorter than three letters never count.

Prefer phrases a person would actually say, such as "plan a trip" rather than "plan". A skill whose keywords could
never fire, even all matched together, and that has no slash command, is refused at install. Two skills should not
claim the same slash command.

### Tools

`tools` lists every NuJan tool the instructions call. NuJan checks the list when the skill is installed and again each
time it starts:

- Each name must be a tool NuJan has. A skill that names a tool NuJan does not have, or one NuJan never allows, is
  refused, and the review screen says which name.
- A tool from a connected MCP server can be named too; the skill is offered only while that server is connected.
- On each turn, the skill is offered only if every tool it names is available to the model taking the turn. On-device
  models are given a smaller set of tools, so a skill built on browser tools does not fire there.

A skill never grants itself a tool or a permission. Every call goes through the same permission settings as any other.

## Scripted skills (tier 2)

A tier 2 skill adds `script.js`, which NuJan runs in a JavaScript sandbox when the skill is used: the script reaches the
phone only by calling NuJan's tools through the host, and its running time, call depth and output are limited. A scripted skill may
not call `spawn_agent`, `run_skill` or `deep_research`. NuJan shows the script to the person before it is installed.
Most skills need only instructions; this repository does not take new scripted skills from contributors at present.

## Test a skill in NuJan

1. Run `node tools/validate.mjs skills/<name>` and fix what it reports.
2. Push the skill to a GitHub repository, or a fork of this one, and install it with **Skills** > **from GitHub**. The
   review screen shows the instructions, the tools and any problem NuJan finds.
3. Send NuJan the requests the skill is for, and some it is not for, and check that it fires only on the first kind.
4. Read what the model did with the instructions, and tighten the steps it skipped.
