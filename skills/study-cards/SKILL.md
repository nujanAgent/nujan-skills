---
name: study-cards
description: "Turns notes, a PDF or a topic into an interactive deck of flip cards to study on the phone, tests the deck, then sets reminders to review it over the next week. Use when someone asks for flashcards, wants to be quizzed on their notes, or is revising for an exam."
license: Apache-2.0
---

# Study cards

Make a deck the person can study right away, then schedule the reviews that make it stick. Four of NuJan's abilities
work together here: reading a file, building an interactive page, testing that page, and setting phone reminders.

## Do this

1. Get the material.
   - A document they attached: NuJan has already read it on the phone, and its text is in their message.
   - A PDF in the workspace that they name: read it with `read_pdf`, giving its path.
   - A text or Markdown file in the workspace: read it with `read_file`.
   - Text in their message: use it as it is.
   - Only a topic: write the cards from what you know, and say so in your answer.
2. Choose 10 to 20 facts worth remembering: definitions, dates, formulas, causes and effects. One fact per card: a
   question on the front, an answer of at most two lines on the back.
3. Build the deck with `create_html_artifact` as one self-contained page, with no outside scripts or fonts:
   - one card at a time, in large text, that flips when tapped;
   - two buttons under the answer, "Knew it" and "Again"; a card marked "Again" comes back after the others;
   - a progress line such as "7 / 15", and at the end a score with a button to start over.
4. Test the page with `test_html_artifact`. If it reports an error, fix the page with `update_artifact` and test it
   again.
5. Set three review reminders with `create_reminder`. Call `get_time` first for today's date, then create one reminder
   for tomorrow, one for three days from today and one for seven days from today. Give `when` as `YYYY-MM-DD HH:MM`, at
   the time the person asked for or 18:00, with the title "Review: <topic> cards". Skip this step if the person said
   they do not want reminders.
6. Answer in two or three lines: what the deck covers, how many cards it has, and the dates of the reviews.

## Check before answering

- Every answer on a card comes from their material, unless they gave only a topic.
- The page passed `test_html_artifact`.
- Each reminder was created; name any that was not.

## Never

- Put more than one fact on a card.
- Set reminders the person declined.
