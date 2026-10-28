#!/usr/bin/env node
// Builds field-by-field Markdown references for every Bedrock JSON component from Mojang's
// official form definitions, published in the Microsoft Learn docs repository
// (github.com/MicrosoftDocs/minecraft-creator, folder content/forms).
// No dependencies, Node 18+. Usage:
//   node build-json-reference.mjs <path to content/forms> [--out <dir>]
// Get the forms with: git clone --depth 1 --filter=blob:none --sparse https://github.com/MicrosoftDocs/minecraft-creator.git
//                     cd minecraft-creator && git sparse-checkout set content/forms

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const formsDir = resolve(args.find((a) => !a.startsWith("--")) ?? "");
const outDir = resolve(args.includes("--out") ? args[args.indexOf("--out") + 1] : join(here, "..", "skills", "bedrock-json-reference", "references"));
if (!formsDir || !existsSync(join(formsDir, "item"))) { console.error("Pass the path to content/forms from the minecraft-creator docs repo."); process.exit(2); }

const TYPE = { 0: "int", 1: "boolean", 2: "string", 3: "float" };
const clean = (s) => String(s ?? "").replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
const short = (s, n = 260) => { const c = clean(s); return c.length > n ? c.slice(0, n - 1) + "…" : c; };
// Official field text that the game contradicts, checked in game. The note is added after the field's own text.
const CORRECTIONS = [
  { field: "targets", text: /Target biomes must not contain namespaces/, note: "**Correction (checked in game 2026-10-28):** write full ids (`minecraft:plains`). The game rejects bare names (\"No biome found with name\", \"Missing referenced asset\") and drops the whole biome." },
];
const correction = (fl) => CORRECTIONS.find((c) => c.field === fl.id && c.text.test(clean(fl.description ?? fl.title)))?.note;

function load(domain) {
  const dir = join(formsDir, domain);
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".form.json")).sort()) {
    let d; try { d = JSON.parse(readFileSync(join(dir, f), "utf8")); } catch { continue; }
    const g = d.generatedFromSchema_doNotEdit ?? d.generated_doNotEdit ?? {};
    const byId = new Map();
    for (const fl of g.fields ?? []) if (fl.id) byId.set(fl.id, { ...fl });
    for (const fl of d.fields ?? []) if (fl.id) byId.set(fl.id, { ...(byId.get(fl.id) ?? {}), ...fl });
    out.push({
      file: f, id: d.id ?? g.id ?? f.replace(".form.json", ""), title: d.title ?? g.title,
      description: d.description ?? g.description, notes: [d.note, d.note2, d.note3, d.note4].filter(Boolean),
      version: d.versionIntroduced, deprecated: d.isDeprecated, experimental: d.isExperimental || d.requiredExperiment,
      experiment: d.requiredExperiment, fields: [...byId.values()], samples: d.samples ?? g.samples,
    });
  }
  return out;
}

function fieldType(fl) {
  const t = fl.dataType;
  if (typeof t === "string") return t;
  if (typeof t === "number") return TYPE[t] ?? "";
  return fl.subFormId ? "object" : "";
}
function sampleOf(form) {
  const s = form.samples;
  if (!s || typeof s !== "object") return undefined;
  for (const list of Object.values(s)) {
    const first = Array.isArray(list) ? list.find((x) => x && x.content !== undefined) : undefined;
    if (first) return { path: first.path, content: first.content };
  }
  return undefined;
}
function renderForm(form, lines) {
  lines.push(`### ${form.id}`);
  lines.push("");
  const tags = [form.version && `since ${form.version}`, form.deprecated && "**deprecated**", form.experimental && `**experimental${form.experiment ? ` (${form.experiment})` : ""}**`].filter(Boolean);
  if (tags.length) lines.push(`_${tags.join(" · ")}_`), lines.push("");
  if (form.description) lines.push(clean(form.description)), lines.push("");
  for (const n of form.notes) lines.push(`> ${clean(n)}`), lines.push("");
  const fields = form.fields.filter((f) => !f.isInternal);
  if (fields.length) {
    lines.push("| Field | Type | Default | Notes |");
    lines.push("|---|---|---|---|");
    for (const fl of fields) {
      const def = fl.defaultValue === undefined ? "" : "`" + short(JSON.stringify(fl.defaultValue), 60) + "`";
      const flags = [fl.isRequired || fl.required ? "**required**" : "", fl.isDeprecated ? "deprecated" : "", fl.isRemoved ? "removed" : "", fl.versionIntroduced ? `since ${fl.versionIntroduced}` : ""].filter(Boolean).join(", ");
      const choices = Array.isArray(fl.choices) && fl.choices.length ? ` Values: ${fl.choices.slice(0, 24).map((c) => "`" + clean(c.id ?? c) + "`").join(", ")}${fl.choices.length > 24 ? ", …" : ""}.` : "";
      const range = fl.minValue !== undefined || fl.maxValue !== undefined ? ` Range: ${fl.minValue ?? ""}..${fl.maxValue ?? ""}.` : "";
      const sub = fl.subFormId ? ` See \`${fl.subFormId}\`.` : "";
      lines.push(`| \`${fl.id}\` | ${fieldType(fl)} | ${def} | ${[flags, short(fl.description ?? fl.title ?? "")].filter(Boolean).join(". ")}${choices}${range}${sub}${correction(fl) ? " " + correction(fl) : ""} |`);
    }
    lines.push("");
  }
  const s = sampleOf(form);
  if (s) {
    const txt = JSON.stringify(s.content, null, 1);
    if (txt.length < 1500) { lines.push(`Example${s.path ? ` (${clean(s.path)})` : ""}:`); lines.push("```json"); lines.push(txt); lines.push("```"); lines.push(""); }
  }
}

const SETS = [
  { file: "items.md", title: "Item components", domains: ["item"] },
  { file: "blocks.md", title: "Block components", domains: ["block"] },
  { file: "entity-components.md", title: "Entity components (non-AI)", domains: ["entity"], filter: (f) => !/^minecraft:behavior\./.test(f.id) },
  { file: "entity-ai-goals.md", title: "Entity AI goals (minecraft:behavior.*)", domains: ["entity"], filter: (f) => /^minecraft:behavior\./.test(f.id) },
  { file: "entity-filters-and-events.md", title: "Entity filters, events and actions", domains: ["entityfilters", "entityevents", "action", "action_set"] },
  { file: "worldgen.md", title: "Features, biomes, jigsaw, structures, dimensions", domains: ["features", "biome", "client_biome", "jigsaw", "structure", "dimension", "world"] },
  { file: "recipes-spawn-trade.md", title: "Recipes, spawn rules, trades", domains: ["recipe", "spawn", "trade"] },
  { file: "client-visuals.md", title: "Particles, cameras, visuals, resource files", domains: ["client_particles", "camera", "visual", "resource", "client_misc", "client_deferred_rendering"] },
  { file: "manifest.md", title: "Pack manifest", domains: ["packmanifest"] },
  { file: "molang.md", title: "Molang queries and functions", domains: ["molang"] },
  { file: "commands.md", title: "Commands", domains: ["command"] },
  { file: "json-ui.md", title: "JSON UI elements", domains: ["ui"] },
  { file: "misc.md", title: "Shared sub-objects", domains: ["misc"] },
];

mkdirSync(outDir, { recursive: true });
const index = [];
const today = new Date().toISOString().slice(0, 10);
for (const set of SETS) {
  let forms = set.domains.flatMap(load);
  if (set.filter) forms = forms.filter(set.filter);
  if (!forms.length) continue;
  const main = forms.filter((f) => /^minecraft:/.test(f.id)).sort((a, b) => a.id.localeCompare(b.id));
  const subs = forms.filter((f) => !/^minecraft:/.test(f.id));
  const lines = [`# ${set.title}`, "", `Generated ${today} by \`scripts/build-json-reference.mjs\` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/${set.domains.join(", ")}). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.`, ""];
  if (main.length) { lines.push(`## Components (${main.length})`, ""); lines.push(main.map((f) => `\`${f.id}\``).join(", "), ""); for (const f of main) renderForm(f, lines); }
  if (subs.length) { lines.push(`## Documents and sub-objects (${subs.length})`, ""); for (const f of subs) renderForm({ ...f, id: `${f.id}${f.id.includes(":") ? "" : ` (${set.domains.length > 1 ? f.file.replace(".form.json", "") : f.file.replace(".form.json", "")})`}` }, lines); }
  writeFileSync(join(outDir, set.file), lines.join("\n"));
  index.push(`| [${set.file}](${set.file}) | ${set.title} | ${main.length} components, ${subs.length} sub-objects |`);
}
// Components and fields that the official definitions mark as experimental or needing a toggle.
const EXP = /\[EXPERIMENTAL\]|(?<!without (?:an? |the )?[\w ]{0,40})(?:requires?|only available with|behind)[^.]{0,60}experiment|experimental (?:component|field|feature)/i;
const expRows = [], expSeen = new Set();
for (const set of SETS) {
  let forms = set.domains.flatMap(load);
  if (set.filter) forms = forms.filter(set.filter);
  for (const f of forms) {
    if (f.experimental || EXP.test(clean(f.description))) expRows.push(`| \`${f.id}\` | (whole component) | ${f.experiment ?? "experimental"} | ${set.file} |`);
    for (const fl of f.fields) if (!fl.isInternal && EXP.test(clean(fl.description)) && !expSeen.has(fl.id + fl.description) && expSeen.add(fl.id + fl.description)) expRows.push(`| \`${f.id}\` | \`${fl.id}\` | ${short(fl.description, 140)} | ${set.file} |`);
  }
}
writeFileSync(join(outDir, "INDEX.md"), ["# JSON reference index", "", `Generated ${today}.`, "", "| File | Covers | Size |", "|---|---|---|", ...index, "",
  "## Marked experimental in the official definitions", "", "These need an experiment toggle in world settings (usually Upcoming Creator Features). The definitions lag the changelogs, so also check `bedrock-whats-new/references/experimental-changelog.md`.", "",
  "| Component | Field | Toggle or note | File |", "|---|---|---|---|", ...[...new Set(expRows)], ""].join("\n"));
console.log(`Wrote ${index.length} files to ${outDir}`);
