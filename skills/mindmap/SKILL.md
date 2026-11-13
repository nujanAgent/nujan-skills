---
name: mindmap
description: "Turns a topic or notes into a mind map artifact. Use when someone asks for a mind map or to map out a topic."
license: Apache-2.0
---

# Mind Map

When the user wants a mind map of a topic or their notes:
1. Identify the central idea and 4-8 main branches, each with a few sub-points.
2. Call `create_html_artifact` with a self-contained HTML page that renders the map
   as a nested, indented outline (a styled `<ul>` tree). Keep it to about 12 nodes.
3. Title the artifact after the topic.

Keep the HTML simple and self-contained (no external scripts or styles).
