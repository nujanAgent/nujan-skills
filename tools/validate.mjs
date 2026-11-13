#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
//
// Checks skills against the Agent Skills specification and this repository's rules.
//
//   node tools/validate.mjs [path ...]
//
// A path is a skill folder (one that holds SKILL.md) or a folder of skill folders; the default is `skills`.
// Prints one line per skill and exits with status 1 when any skill has a problem.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, relative, extname, resolve } from "node:path";

const SPEC_FIELDS = new Set(["name", "description", "license", "allowed-tools", "metadata", "compatibility"]);
const LICENSE = "Apache-2.0";
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
const MAX_COMPATIBILITY = 500;
const MAX_SKILL_LINES = 500;
const MAX_SKILL_BYTES = 512 * 1024;
const MAX_REFERENCE_FILES = 12;
const MAX_REFERENCE_BYTES = 96 * 1024;
const REFERENCE_EXTENSIONS = new Set([".md", ".markdown", ".txt", ".json", ".yaml", ".yml", ".csv", ".tsv"]);
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLASH_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$/;
const SHELL_LINE = /!`[^`]+`/;

/** Splits SKILL.md into its frontmatter lines and body, or returns null when it has no frontmatter. */
function splitFrontmatter(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0].trim() !== "---") return null;
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (end < 0) return null;
  return { block: lines.slice(1, end), body: lines.slice(end + 1) };
}

/** Reads a YAML scalar written as `"..."`, `'...'` or plain text. */
function readScalar(raw, problems, key) {
  const value = raw.trim();
  if (value.startsWith('"')) {
    if (!value.endsWith('"') || value.length < 2) {
      problems.push(`frontmatter '${key}': the closing double quote is missing`);
      return "";
    }
    try {
      return JSON.parse(value);
    } catch {
      problems.push(`frontmatter '${key}': not a valid double-quoted string`);
      return "";
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) {
      problems.push(`frontmatter '${key}': the closing single quote is missing`);
      return "";
    }
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (/: /.test(value) || / #/.test(value)) {
    problems.push(`frontmatter '${key}': put the value in double quotes; it holds ': ' or ' #'`);
  }
  return value;
}

/**
 * Parses the frontmatter as the simple YAML skills use: `key: value` lines, and `metadata:` followed by indented
 * `key: value` lines. Anything else is reported, so a strict YAML reader elsewhere never meets a surprise.
 */
function parseFrontmatter(blockLines, problems) {
  const fields = {};
  let inMetadata = false;
  for (const line of blockLines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indented = /^\s+/.test(line);
    const match = line.trim().match(/^([A-Za-z0-9_-]+):(?:\s+(.*))?$/);
    if (!match) {
      problems.push(`frontmatter line not understood: ${line.trim()}`);
      continue;
    }
    const [, key, rest = ""] = match;
    if (indented) {
      if (!inMetadata) {
        problems.push(`frontmatter: '${key}' is indented outside 'metadata'`);
        continue;
      }
      fields.metadata[key] = readScalar(rest, problems, `metadata.${key}`);
      continue;
    }
    inMetadata = false;
    if (key in fields) problems.push(`frontmatter: '${key}' appears twice`);
    if (key === "metadata") {
      if (rest.trim()) problems.push("frontmatter 'metadata': put its entries on indented lines below it");
      fields.metadata = {};
      inMetadata = true;
      continue;
    }
    fields[key] = readScalar(rest, problems, key);
  }
  return fields;
}

function checkFrontmatter(dir, fields, problems) {
  const folder = basename(dir);
  for (const key of Object.keys(fields)) {
    if (!SPEC_FIELDS.has(key)) problems.push(`frontmatter: '${key}' is not an Agent Skills field; NuJan's settings go in skill.json`);
  }
  if ("allowed-tools" in fields) {
    problems.push("frontmatter: leave out 'allowed-tools'; some agents read it as approval to use those tools");
  }

  const name = fields.name ?? "";
  if (!name) problems.push("frontmatter: 'name' is missing");
  else {
    if (name.length > MAX_NAME) problems.push(`name: longer than ${MAX_NAME} characters`);
    if (!NAME_PATTERN.test(name)) problems.push("name: use lowercase letters, digits and single hyphens, not at either end");
    if (name !== folder) problems.push(`name: '${name}' differs from the folder name '${folder}'`);
  }

  const description = fields.description ?? "";
  if (!description.trim()) problems.push("frontmatter: 'description' is missing");
  else {
    if (description.length > MAX_DESCRIPTION) problems.push(`description: longer than ${MAX_DESCRIPTION} characters`);
    if (!description.includes("Use when")) problems.push("description: say when to use the skill, with 'Use when ...'");
  }

  if (fields.license !== LICENSE) problems.push(`frontmatter: 'license' must be ${LICENSE}`);
  if ((fields.compatibility ?? "").length > MAX_COMPATIBILITY) {
    problems.push(`compatibility: longer than ${MAX_COMPATIBILITY} characters`);
  }
}

function checkManifest(dir, manifestPath, fields, problems) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    problems.push(`skill.json: not valid JSON (${error.message})`);
    return null;
  }
  if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) {
    problems.push("skill.json: must be a JSON object");
    return null;
  }
  const folder = basename(dir);
  if (manifest.id !== folder) problems.push(`skill.json: 'id' must be the folder name '${folder}'`);
  if (typeof manifest.name !== "string" || !manifest.name.trim()) problems.push("skill.json: 'name' is missing");
  if (manifest.version !== undefined && !VERSION_PATTERN.test(String(manifest.version))) {
    problems.push("skill.json: 'version' must look like 1.0.0");
  }
  if (manifest.license !== fields.license) problems.push("skill.json: 'license' differs from the frontmatter");

  const tier = manifest.tier ?? 1;
  if (tier !== 1 && tier !== 2) problems.push("skill.json: 'tier' must be 1 or 2");
  const hasScript = existsSync(join(dir, "script.js"));
  if (tier === 2 && !hasScript) problems.push("tier 2 needs a script.js");
  if (tier === 1 && hasScript) problems.push("script.js is only for tier 2");

  const triggers = manifest.triggers ?? {};
  if (triggers.keywords !== undefined) {
    if (!Array.isArray(triggers.keywords) || triggers.keywords.some((k) => typeof k !== "string" || !k.trim())) {
      problems.push("skill.json: 'triggers.keywords' must be a list of words or phrases");
    }
  }
  if (triggers.slashCommand !== undefined && triggers.slashCommand !== null) {
    if (typeof triggers.slashCommand !== "string" || !SLASH_PATTERN.test(triggers.slashCommand)) {
      problems.push("skill.json: 'triggers.slashCommand' must be lowercase, without the slash");
    }
  }

  const tools = manifest.tools ?? [];
  if (!Array.isArray(tools) || tools.some((t) => typeof t !== "string" || !t.trim())) {
    problems.push("skill.json: 'tools' must be a list of tool names");
  } else {
    if (new Set(tools).size !== tools.length) problems.push("skill.json: a tool is listed twice");
    if (manifest.leadTool != null && !tools.includes(manifest.leadTool)) {
      problems.push(`skill.json: lead tool '${manifest.leadTool}' is not in 'tools'`);
    }
    const then = manifest.then ?? [];
    if (!Array.isArray(then)) problems.push("skill.json: 'then' must be a list");
    else {
      for (const step of then) if (!tools.includes(step)) problems.push(`skill.json: step '${step}' is not in 'tools'`);
      if (then.length && manifest.leadTool == null) problems.push("skill.json: 'then' needs a 'leadTool'");
    }
  }
  if (manifest.permissions !== undefined) {
    const values = Object.values(manifest.permissions ?? {});
    if (typeof manifest.permissions !== "object" || values.some((v) => typeof v !== "string")) {
      problems.push("skill.json: 'permissions' maps tool names to text such as \"ask\"");
    }
  }
  if (manifest.modelHint !== undefined && !["any", "local", "cloud"].includes(manifest.modelHint)) {
    problems.push("skill.json: 'modelHint' must be any, local or cloud");
  }
  if (manifest.privacy !== undefined && !["local_only", "allow_cloud"].includes(manifest.privacy)) {
    problems.push("skill.json: 'privacy' must be local_only or allow_cloud");
  }
  return manifest;
}

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function checkFiles(dir, problems) {
  const references = [];
  for (const path of listFiles(dir)) {
    const rel = relative(dir, path).split("\\").join("/");
    if (["SKILL.md", "skill.json", "script.js"].includes(rel)) continue;
    if (rel.startsWith("references/") && REFERENCE_EXTENSIONS.has(extname(rel).toLowerCase())) {
      references.push(path);
      continue;
    }
    problems.push(`${rel}: NuJan carries only SKILL.md, skill.json, script.js and text files under references/`);
  }
  if (references.length > MAX_REFERENCE_FILES) problems.push(`more than ${MAX_REFERENCE_FILES} reference files`);
  const referenceBytes = references.reduce((sum, path) => sum + statSync(path).size, 0);
  if (referenceBytes > MAX_REFERENCE_BYTES) problems.push(`reference files exceed ${MAX_REFERENCE_BYTES / 1024} KB in all`);
}

function checkSkill(dir) {
  const problems = [];
  const skillPath = join(dir, "SKILL.md");
  if (!existsSync(skillPath)) return { problems: ["SKILL.md is missing"], manifest: null };
  if (statSync(skillPath).size > MAX_SKILL_BYTES) problems.push(`SKILL.md is larger than ${MAX_SKILL_BYTES / 1024} KB`);

  const text = readFileSync(skillPath, "utf8");
  const split = splitFrontmatter(text);
  let fields = {};
  if (!split) problems.push("SKILL.md must open with frontmatter between two '---' lines");
  else {
    fields = parseFrontmatter(split.block, problems);
    checkFrontmatter(dir, fields, problems);
    if (!split.body.join("\n").trim()) problems.push("SKILL.md has no instructions under the frontmatter");
  }
  const lines = text.split(/\r?\n/);
  if (lines.length > MAX_SKILL_LINES) problems.push(`SKILL.md has more than ${MAX_SKILL_LINES} lines`);
  lines.forEach((line, i) => {
    if (SHELL_LINE.test(line)) problems.push(`SKILL.md line ${i + 1}: a shell-command line, which some agents run`);
  });

  const manifestPath = join(dir, "skill.json");
  const manifest = existsSync(manifestPath) ? checkManifest(dir, manifestPath, fields, problems) : null;
  if (!manifest && existsSync(join(dir, "script.js"))) problems.push("script.js needs a skill.json with tier 2");
  checkFiles(dir, problems);
  return { problems, manifest };
}

function skillDirs(path) {
  const full = resolve(path);
  if (!existsSync(full) || !statSync(full).isDirectory()) throw new Error(`not a folder: ${path}`);
  if (existsSync(join(full, "SKILL.md"))) return [full];
  return readdirSync(full, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(full, entry.name))
    .sort();
}

const targets = process.argv.slice(2);
const dirs = (targets.length ? targets : ["skills"]).flatMap(skillDirs);
if (!dirs.length) {
  console.error("no skills found");
  process.exit(1);
}

let failed = 0;
const slashOwners = new Map();
for (const dir of dirs) {
  const { problems, manifest } = checkSkill(dir);
  const command = manifest?.triggers?.slashCommand;
  if (command) {
    if (slashOwners.has(command)) problems.push(`slash command /${command} is also used by ${slashOwners.get(command)}`);
    else slashOwners.set(command, basename(dir));
  }
  if (problems.length) {
    failed += 1;
    console.log(`FAIL ${basename(dir)}`);
    for (const problem of problems) console.log(`     ${problem}`);
  } else {
    console.log(`ok   ${basename(dir)}`);
  }
}
console.log(`${dirs.length - failed} of ${dirs.length} skills valid`);
process.exit(failed ? 1 : 0);
