# NuJan skills

How to make skills for [NuJan](https://nujan-agent.com), an AI agent app for Android, and install them: the
format, a validator, and example skills to install and copy.

A skill teaches NuJan a workflow. When a request matches the skill, NuJan adds the skill's instructions to the turn,
and the skill names the tools the workflow uses. A skill is a folder of text files: a `SKILL.md` in the open
[Agent Skills](https://agentskills.io/specification) format, and a `skill.json` with NuJan's settings. Other agents
that read the format can load the instructions too; the tools the instructions mention are NuJan's.

## Skills in this repository

| Skill | What it does |
| --- | --- |
| [anatomy](skills/anatomy/SKILL.md) | Draws a real system as an interactive figure to scale, with researched dimensions and sources, every part named and the states it goes through, checked before it is drawn. |
| [meeting-notes](skills/meeting-notes/SKILL.md) | Turns notes or a transcript of a meeting into minutes: what was decided, who does what by when, and what is still open. |
| [mindmap](skills/mindmap/SKILL.md) | Turns a topic or notes into a mind map artifact. |
| [page-watch](skills/page-watch/SKILL.md) | Watches part of a web page for changes: reads it now, keeps a copy in the workspace, and sets a routine that checks it on a schedule and says exactly what changed. |
| [plain-language](skills/plain-language/SKILL.md) | Rewrites a text in plain language: the main point first, short sentences, everyday words and the same meaning. |
| [study-cards](skills/study-cards/SKILL.md) | Turns notes, a PDF or a topic into an interactive deck of flip cards to study on the phone, tests the deck, then sets reminders to review it over the next week. |
| [trip-brief](skills/trip-brief/SKILL.md) | Plans a city trip from research: day plans grouped by area with real opening hours, prices and travel times, a PDF itinerary to keep offline, reminders for what has to be booked, and a countdown widget to the day of departure. |

Anatomy and Mind Map ship with NuJan, so they are already on your phone. The others are examples to install, try and
copy.

## Make a skill in NuJan

The quickest way is to ask for one. Say what the skill should do and when it should fire, for example:

> Make a skill that turns a list of tasks into a plan for the day, hardest task first, with a time for each. It
> should fire when I say "plan my day".

NuJan writes the instructions and the settings, and asks before it saves the skill. From then on the skill fires on
the words you gave, and it is listed under **Skills**, where you can **share** it or **remove** it.

## Write a skill by hand

Writing the files yourself gives you full control of the instructions. This walk-through makes the
[meeting-notes](skills/meeting-notes) example.

1. Make a folder named after the skill, in lowercase letters, digits and single hyphens:

   ```
   meeting-notes/
     SKILL.md
     skill.json
   ```

2. Write `SKILL.md`. The frontmatter says what the skill does and when to use it. The text under it is what the
   model reads each time the skill fires, so write it as a procedure: the steps, what good output looks like, what
   to check, and what never to do.

   ```markdown
   ---
   name: meeting-notes
   description: "Turns notes or a transcript of a meeting into minutes: what was decided, who does what by when, and what is still open. Use when someone asks for meeting minutes, to sum up a meeting, or to turn notes into action items."
   license: Apache-2.0
   ---

   # Meeting notes

   Turn what the person gives you into minutes they can send as they are.

   ## Do this

   1. Read all of it before writing anything.
   2. Write the minutes: the meeting, who attended, the decisions, a table of action items with
      *What*, *Who* and *When*, and the questions still open.

   ## Never

   - Invent a decision, an owner or a date the notes do not contain.
   ```

3. Write `skill.json`, which says when the skill fires and which tools it may use:

   ```json
   {
     "schemaVersion": 1,
     "id": "meeting-notes",
     "name": "Meeting notes",
     "version": "1.0.0",
     "description": "Minutes from meeting notes: decisions, action items with owners and dates, open questions.",
     "author": "Your name",
     "license": "Apache-2.0",
     "tier": 1,
     "triggers": {
       "keywords": ["meeting minutes", "meeting notes", "sum up the meeting"],
       "slashCommand": "minutes"
     },
     "tools": [],
     "modelHint": "any",
     "privacy": "allow_cloud"
   }
   ```

   Keywords are phrases a person would actually say. A skill that uses NuJan's tools lists every one of them in
   `tools`, as [trip-brief](skills/trip-brief/skill.json) does.

4. Check the skill with the validator, which runs on [Node.js](https://nodejs.org):

   ```sh
   node tools/validate.mjs skills/meeting-notes
   ```

[docs/FORMAT.md](docs/FORMAT.md) describes every field, how keywords are matched, and what a skill may not do. Each
skill here shows one part of the format:

| Skill | What it shows |
| --- | --- |
| [meeting-notes](skills/meeting-notes) | The smallest useful skill: instructions only, no tools, fired by phrases or by `/minutes`. |
| [plain-language](skills/plain-language) | A reference file, `references/plain-words.md`, that NuJan adds to the instructions. |
| [mindmap](skills/mindmap) | A skill whose answer is a page NuJan shows, made with one tool. |
| [trip-brief](skills/trip-brief) | Research that ends in things to keep: opening hours and prices read from real pages, a PDF itinerary, phone reminders for each booking and a countdown widget. It lists its tools in `tools` and names the one it starts with in `leadTool`. |
| [study-cards](skills/study-cards) | Several of NuJan's abilities in one request: a document read on the phone becomes an interactive deck, which is tested, then reviews are scheduled as phone reminders. |
| [page-watch](skills/page-watch) | Work that carries on after the conversation: a page read now, in NuJan's browser when the page needs one, a copy kept in the workspace, and a routine that checks the page on a schedule and says exactly what changed. |
| [anatomy](skills/anatomy) | A long procedure: research, a drawing tool and a check, offered in order with `leadTool` and `then`. |

The skills that get the most out of NuJan combine its tools: the web and NuJan's own browser, files, Python,
spreadsheets, charts, interactive pages, PDFs, phone reminders, home-screen widgets and routines that run on their own
all work together, and a skill is where you write down how.

## Install a skill in NuJan

**From GitHub.** Put the skill on GitHub, at the root of a repository or in a folder under `skills/`. Then:

1. In NuJan, open **Skills** from the actions grid, or type `/skills`.
2. Open the **from GitHub** tab, enter `owner/repo` or the repository's address, and tap **fetch**.
3. Tap **install** beside the skill. NuJan shows what the skill does, the tools it uses and what fires it. Read it,
   then install it.

A public repository needs nothing more. For a private one, NuJan uses the GitHub token added under **Connect**.

**From a file.** Compress the skill's folder into a `.zip`, copy it to the phone, and tap **import zip** on the same
tab. NuJan shows the same review before anything is saved.

## Try it

- Send a request the skill is for, such as *"Sum up the meeting from these notes: ..."*, or start a message with
  its command, such as `/minutes`.
- Send a few requests it is not for, and check that it stays out of them.
- When the model skips a step, make that step plainer in `SKILL.md` and install the skill again.

A skill can be switched off under **Settings** > **Skills**, and an installed skill removed under **Skills**.

## Share a skill

- **As a file.** Under **Skills**, tap **share** on an installed skill to save it as a `.zip`, and send the file. The
  person who receives it installs it with **import zip** and reviews it first. Unzipped, it is the skill's folder,
  which other agents that read the open format can load.
- **On GitHub.** Put each skill in its own folder under `skills/` in a repository of your own. Anyone can install it
  with the steps above, and NuJan records where it came from.
- **In this repository.** Open a pull request that adds the skill under `skills/`. See
  [CONTRIBUTING.md](CONTRIBUTING.md).

## License

The skills, the documentation and the validator in this repository are licensed under the
[Apache License 2.0](LICENSE). The license does not grant permission to use the NuJan name or logo.
