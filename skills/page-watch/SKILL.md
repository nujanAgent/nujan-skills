---
name: page-watch
description: "Watches part of a web page for changes: reads it now, keeps a copy in the workspace, and sets a routine that checks it on a schedule and says exactly what changed. Use when someone asks to watch, monitor or keep an eye on a page, a price, a list or an announcement."
license: Apache-2.0
---

# Page watch

Keep watch on one part of a web page, such as a price, a list of dates or a notice, and say exactly what changed and
when. Four of NuJan's abilities work together here: reading the web, its own browser for pages that build their
content with scripts, a file in the workspace that holds the last copy, and a routine that runs on its own and reports
each check as a notification.

## Do this

1. **Pin down what to watch:** the page's address and the part that matters (the price of one product, the list of
   dates, the whole notice). If either is missing, ask once for both.
2. **Read it now** with `web_fetch`. If the part is not in what comes back, because the page builds it with scripts,
   open the page with `open_url` and read it with `browser_read`. Pick out the watched part exactly as the page shows
   it, word for word, and note which way of reading worked.
3. **Save it** with `write_file` to `watch/<short-name>.txt`: the address on the first line, what is watched on the
   second, then the watched part exactly as read.
4. **Set the routine** with `create_routine`:
   - `name` `watch-<short-name>`, and the `schedule` the person asked for, or `every 6h` if they named none;
   - `tools` `internet`, `files_read` and `files_write`, and `browser` as well when step 2 needed the browser;
   - a `task` written out in full, because the routine runs with nothing else to go on: read the address the way
     step 2 did, pick out the same part, read the saved copy with `read_file`, and compare the two line by line (for
     a price, the two numbers). If nothing changed, answer in one line: unchanged, and the current value. If
     something changed, say in two or three sentences exactly what was added, removed or changed, then save the new
     copy over the old one with `write_file`, keeping its first two lines.
5. **Run it once** with `run_routine`, so the first check happens now and proves the task works.
6. **Answer** with what is watched, its value now, how often it is checked, that each check arrives as a
   notification, and how to stop it: `/routine rm watch-<short-name>`.

## Check before answering

- The saved file holds the watched part exactly as the page shows it, not a summary of it.
- The routine's task names the same address, the same part and the same way of reading it, says how to compare, and
  says what to answer.
- The first run read the page and compared it with the saved copy.

## Never

- Watch a page behind a sign-in or a paywall; say that it cannot be read without one.
- Report a change the comparison did not show, or call a page unchanged without comparing it.
- Check more often than every 30 minutes.
