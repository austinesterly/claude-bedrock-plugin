#!/usr/bin/env node
// Refreshes the version and API references in skills/bedrock-whats-new/references/
// from official sources only: the npm registry (@minecraft/* packages published by Mojang),
// feedback.minecraft.net (Mojang's changelog site) and Blockbench's own GitHub repository.
// No dependencies. Node 18+ (global fetch). Usage:
//   node fetch-updates.mjs [--out <references dir>] [--json]
// Writes current-versions.md, api-surface.md, preview-api.md, experimental-changelog.md and .snapshot.json,
// and prints what changed since the last run.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { apiDetails, experimentalParts } from "./lib-preview.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const outDir = resolve(args.includes("--out") ? args[args.indexOf("--out") + 1] : join(here, "..", "skills", "bedrock-whats-new", "references"));
const today = new Date().toISOString().slice(0, 10);

const PACKAGES = [
  "@minecraft/server", "@minecraft/server-ui", "@minecraft/server-graphics", "@minecraft/server-gametest",
  "@minecraft/server-admin", "@minecraft/server-net", "@minecraft/debug-utilities", "@minecraft/common",
  "@minecraft/math", "@minecraft/vanilla-data", "@minecraft/creator-tools", "@minecraft/core-build-tasks",
];
const TYPED = ["@minecraft/server", "@minecraft/server-ui"];
// Modules whose rc/beta surface is written out in detail (signature + first doc sentence).
const DETAILED = ["@minecraft/server", "@minecraft/server-ui", "@minecraft/server-graphics", "@minecraft/server-gametest", "@minecraft/server-admin", "@minecraft/server-net", "@minecraft/debug-utilities"];
const SECTIONS = { release: "360001186971", preview: "360001185332" };

async function getJson(url) {
  const r = await fetch(url, { headers: { "user-agent": "bedrock-addon-kit-updater" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}
async function getBuf(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

// Minimal tar reader: returns the contents of one file from a .tgz.
function readFromTgz(tgz, wanted) {
  const tar = gunzipSync(tgz);
  for (let off = 0; off + 512 <= tar.length;) {
    const name = tar.toString("utf8", off, off + 100).replace(/\0.*$/s, "");
    if (!name) break;
    const size = parseInt(tar.toString("utf8", off + 124, off + 136).replace(/\0.*$/s, "").trim() || "0", 8);
    const prefix = tar.toString("utf8", off + 345, off + 500).replace(/\0.*$/s, "");
    const full = prefix ? `${prefix}/${name}` : name;
    if (full === wanted) return tar.toString("utf8", off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return undefined;
}

// Extract "Type.member" names from an index.d.ts (exported classes, interfaces, enums, functions, consts).
function apiSurface(dts) {
  const text = dts.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const out = new Set();
  const re = /export\s+(?:declare\s+)?(class|interface|enum)\s+(\w+)[^{]*\{([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(text))) {
    const [, kind, name, body] = m;
    out.add(`${kind} ${name}`);
    for (const mm of body.matchAll(/^\s{4}(?:static\s+)?(?:readonly\s+)?(?:get\s+|set\s+)?(\w+)\??\s*[:(=<]/gm)) {
      if (mm[1] !== "constructor") out.add(`${name}.${mm[1]}`);
    }
  }
  for (const mm of text.matchAll(/^export\s+(?:declare\s+)?(?:function|const|let)\s+(\w+)/gm)) out.add(`${mm[1]}`);
  return out;
}

const snapshotPath = join(outDir, ".snapshot.json");
const prev = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, "utf8")) : null;
const snap = { checked: today, tags: {}, changelogs: {}, blockbench: null, api: {} };
const errors = [];

for (const p of PACKAGES) {
  try { snap.tags[p] = await getJson(`https://registry.npmjs.org/-/package/${p}/dist-tags`); }
  catch (e) { errors.push(String(e)); }
}

for (const [kind, id] of Object.entries(SECTIONS)) {
  try {
    const d = await getJson(`https://feedback.minecraft.net/api/v2/help_center/en-us/sections/${id}/articles.json?per_page=12&sort_by=created_at&sort_order=desc`);
    snap.changelogs[kind] = d.articles
      .filter((a) => kind === "preview" || /bedrock/i.test(a.title))
      .map((a) => ({ id: a.id, date: a.created_at.slice(0, 10), title: a.title, url: a.html_url }));
  } catch (e) { errors.push(String(e)); }
}

try {
  const pkg = await getJson("https://raw.githubusercontent.com/JannisX11/blockbench/master/package.json");
  snap.blockbench = pkg.version;
} catch (e) { errors.push(String(e)); }

// API surface per channel. Names go into the snapshot for the typed modules; full details
// (signatures and doc sentences) are kept in memory for preview-api.md.
const details = {};
for (const p of DETAILED) {
  const tags = snap.tags[p] ?? {};
  if (TYPED.includes(p)) snap.api[p] = {};
  details[p] = {};
  for (const ch of ["latest", "rc", "beta"]) {
    const v = tags[ch];
    if (!v || (ch === "rc" && v === tags.latest)) continue;
    try {
      const base = p.split("/")[1];
      const tgz = await getBuf(`https://registry.npmjs.org/${p}/-/${base}-${v}.tgz`);
      const dts = readFromTgz(tgz, "package/index.d.ts");
      if (!dts) continue;
      if (TYPED.includes(p)) snap.api[p][ch] = { version: v, members: [...apiSurface(dts)].sort() };
      details[p][ch] = { version: v, map: apiDetails(dts) };
    } catch (e) { errors.push(String(e)); }
  }
}

// Experimental sections of every changelog we list (cached by article id in the snapshot).
snap.experimental = {};
snap.experimentalParser = 2;
for (const a of [...(snap.changelogs.preview ?? []), ...(snap.changelogs.release ?? [])]) {
  const cached = prev?.experimentalParser === 2 ? prev?.experimental?.[a.id] : undefined;
  if (cached) { snap.experimental[a.id] = cached; continue; }
  try {
    const d = await getJson(`https://feedback.minecraft.net/api/v2/help_center/en-us/articles/${a.id}.json`);
    snap.experimental[a.id] = experimentalParts(d.article?.body ?? "");
  } catch (e) { errors.push(String(e)); }
}

// ---------- write current-versions.md ----------
const t = (p, ch) => snap.tags[p]?.[ch] ?? "n/a";
const rel = snap.changelogs.release ?? [];
const pre = snap.changelogs.preview ?? [];
const latestRelease = rel[0];
const latestPreview = pre[0];
const gameFromRc = (t("@minecraft/server", "rc").match(/rc\.(\d+\.\d+\.\d+)/) || [])[1];

const cv = [];
cv.push("# Current Bedrock versions (generated)");
cv.push("");
cv.push(`Generated by \`scripts/fetch-updates.mjs\` on **${today}** from the npm registry, feedback.minecraft.net and Blockbench's GitHub. Don't edit by hand; re-run the script (or \`/bedrock-refresh\`). If this date is more than ~2 weeks old, refresh before pinning versions.`);
cv.push("");
cv.push("## Game");
cv.push("");
cv.push(`- Latest stable changelog: ${latestRelease ? `[${latestRelease.title}](${latestRelease.url}) (${latestRelease.date})` : "n/a"}`);
cv.push(`- Latest beta/preview: ${latestPreview ? `[${latestPreview.title}](${latestPreview.url}) (${latestPreview.date})` : "n/a"}`);
if (gameFromRc) cv.push(`- Next release in preview: ${gameFromRc} (from the \`@minecraft/server\` rc tag). Its rc modules become \`latest\` when it ships.`);
cv.push("");
cv.push("## Script modules (npm dist-tags)");
cv.push("");
cv.push("Use `latest` in shipped packs. `rc` = what the next game release will ship as stable. `beta` needs the Beta APIs experiment.");
cv.push("");
cv.push("| Package | latest (stable) | rc (next release) | beta |");
cv.push("|---|---|---|---|");
for (const p of PACKAGES) cv.push(`| \`${p}\` | ${t(p, "latest")} | ${t(p, "rc")} | ${t(p, "beta")} |`);
cv.push("");
cv.push("Notes: `@minecraft/server-gametest`, `server-admin`, `server-net` and `debug-utilities` have no stable release; they are beta-only (dedicated servers and test worlds). `vanilla-data` tracks the game version (typed ids for vanilla blocks, items, entities). `creator-tools` is Mojang's validator and CLI (`mct`).");
cv.push("");
cv.push("Manifest dependency example for the current stable:");
cv.push("```json");
cv.push(`{ "module_name": "@minecraft/server", "version": "${t("@minecraft/server", "latest")}" },`);
cv.push(`{ "module_name": "@minecraft/server-ui", "version": "${t("@minecraft/server-ui", "latest")}" }`);
cv.push("```");
cv.push("");
cv.push("## Tools");
cv.push("");
cv.push(`- Blockbench: ${snap.blockbench ?? "n/a"} (from its package.json on GitHub; download only from blockbench.net or the Microsoft Store)`);
cv.push("");
cv.push("## Recent changelogs");
cv.push("");
for (const a of rel.slice(0, 6)) cv.push(`- ${a.date} [${a.title}](${a.url})`);
cv.push("");
for (const a of pre.slice(0, 6)) cv.push(`- ${a.date} [${a.title}](${a.url})`);
if (errors.length) { cv.push(""); cv.push("## Fetch errors this run"); cv.push(""); for (const e of errors) cv.push(`- ${e}`); }
cv.push("");

// ---------- write api-surface.md ----------
const as = [];
as.push("# Script API surface by channel (generated)");
as.push("");
as.push(`Generated on **${today}** from the official \`index.d.ts\` typings on npm. "Stable" = the \`latest\` tag. Use this to check whether an API a tutorial uses is stable before shipping it.`);
for (const p of TYPED) {
  const a = snap.api[p] ?? {};
  const S = new Set(a.latest?.members ?? []);
  const R = new Set(a.rc?.members ?? []);
  const B = new Set(a.beta?.members ?? []);
  const rcNew = [...R].filter((x) => !S.has(x));
  const betaOnly = [...B].filter((x) => !S.has(x) && !R.has(x));
  as.push("");
  as.push(`## ${p}`);
  as.push("");
  as.push(`Stable ${a.latest?.version ?? "n/a"} (${S.size} names), rc ${a.rc?.version ?? "n/a"}, beta ${a.beta?.version ?? "n/a"}.`);
  as.push("");
  as.push(`### Coming in the next stable (in rc, not in latest): ${rcNew.length}`);
  as.push("");
  as.push(rcNew.length ? rcNew.map((x) => `\`${x}\``).join(", ") : "none");
  as.push("");
  as.push(`### Beta-only (needs the Beta APIs experiment): ${betaOnly.length}`);
  as.push("");
  as.push(betaOnly.length ? betaOnly.map((x) => `\`${x}\``).join(", ") : "none");
  as.push("");
  as.push(`### Stable top-level types`);
  as.push("");
  as.push([...S].filter((x) => /^(class|interface|enum) /.test(x)).map((x) => `\`${x.split(" ")[1]}\``).join(", "));
}
as.push("");
as.push("To check one member: search this file for `Class.member`. Members of stable types are not all listed above; the full stable list is in `.snapshot.json`.");
as.push("");

// ---------- write preview-api.md ----------
const pa = [];
pa.push("# Upcoming and beta Script APIs (generated)");
pa.push("");
pa.push(`Generated on **${today}** from the official \`index.d.ts\` typings on npm. Labels: **[next stable]** is in the \`rc\` build (ships in the next game release, works without experiments once it does); **[beta]** needs the Beta APIs experiment and a \`-beta\` module version in the manifest; **[beta module]** has no stable release at all. Search for \`Type.member\`.`);
const groupByOwner = (keys, map) => {
  const g = new Map();
  for (const k of keys) { const owner = k.includes(".") ? k.split(".")[0] : k.replace(/^(class|interface|enum) /, ""); if (!g.has(owner)) g.set(owner, []); g.get(owner).push(k); }
  return [...g.entries()].sort((a, b) => a[0].localeCompare(b[0]));
};
const renderKeys = (keys, map, label) => {
  for (const [owner, ks] of groupByOwner(keys, map)) {
    const typeKey = ks.find((k) => !k.includes(".")) ?? [...map.keys()].find((k) => k === `class ${owner}` || k === `interface ${owner}` || k === `enum ${owner}`);
    const tinfo = typeKey ? map.get(typeKey) : null;
    pa.push(`### ${owner} ${label}${ks.some((k) => !k.includes(".")) ? " (new type)" : ""}`);
    if (tinfo?.doc) pa.push("", tinfo.doc);
    pa.push("");
    for (const k of ks.filter((k) => k.includes(".")).sort()) { const d = map.get(k); pa.push(`- \`${d.sig.replace(/;$/, "")}\`${d.doc ? ` ${d.doc}` : ""}`); }
    pa.push("");
  }
};
for (const p of DETAILED) {
  const d = details[p] ?? {};
  const S = d.latest?.map ?? new Map(), R = d.rc?.map ?? new Map(), B = d.beta?.map ?? new Map();
  pa.push("", `## ${p}`, "");
  if (!d.latest || /-beta/.test(d.latest.version)) {
    pa.push(`No stable release: everything here is **[beta module]** (${d.beta?.version ?? "no beta tag"}). ${p.endsWith("server-admin") || p.endsWith("server-net") ? "Bedrock Dedicated Server only." : p.endsWith("gametest") ? "For automated tests in test worlds." : ""}`, "");
    renderKeys([...B.keys()].filter((k) => B.get(k).kind !== "type"), B, "[beta module]");
    continue;
  }
  const rcNew = [...R.keys()].filter((k) => !S.has(k) && R.get(k).kind !== "type");
  const betaOnly = [...B.keys()].filter((k) => !S.has(k) && !R.has(k) && B.get(k).kind !== "type");
  pa.push(`Stable ${d.latest.version}, rc ${d.rc?.version ?? "same as stable"}, beta ${d.beta?.version ?? "n/a"}. ${rcNew.length} names coming in the next stable, ${betaOnly.length} beta-only.`, "");
  if (rcNew.length) renderKeys(rcNew, R, "[next stable]");
  if (betaOnly.length) renderKeys(betaOnly, B, "[beta]");
}
pa.push("");

// ---------- write experimental-changelog.md ----------
const ex = [];
ex.push("# Experimental and upcoming features in recent changelogs (generated)");
ex.push("");
ex.push(`Generated on **${today}** from feedback.minecraft.net (official Zendesk API). Each release lists its "Experimental ..." sections word for word, then other bullets that mention an experiment or beta (often a feature graduating out of an experiment). Newest first. Toggle names are as Mojang writes them in world settings > Experiments.`);
for (const a of [...(snap.changelogs.preview ?? []), ...(snap.changelogs.release ?? [])].sort((x, y) => y.date.localeCompare(x.date))) {
  const e = snap.experimental[a.id];
  if (!e || (!e.sections.length && !e.mentions.length)) continue;
  ex.push("", `## ${a.title} (${a.date})`, "", `Source: ${a.url}`);
  for (const s of e.sections) ex.push("", `### ${s.title}`, ...s.lines);
  if (e.mentions.length) ex.push("", "### Other experiment and beta mentions", "", ...e.mentions);
}
ex.push("");
const tidy = (arr) => arr.join("\n").replace(/\n{3,}/g, "\n\n");

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "preview-api.md"), tidy(pa));
writeFileSync(join(outDir, "experimental-changelog.md"), tidy(ex));
writeFileSync(join(outDir, "current-versions.md"), cv.join("\n"));
writeFileSync(join(outDir, "api-surface.md"), as.join("\n"));
writeFileSync(snapshotPath, JSON.stringify(snap));

// ---------- report changes since last run ----------
const changes = [];
if (prev) {
  for (const p of PACKAGES) for (const ch of ["latest", "rc", "beta"]) {
    const a = prev.tags?.[p]?.[ch], b = snap.tags?.[p]?.[ch];
    if (a !== b) changes.push(`${p} ${ch}: ${a ?? "none"} -> ${b ?? "none"}`);
  }
  const seen = new Set([...(prev.changelogs?.release ?? []), ...(prev.changelogs?.preview ?? [])].map((a) => a.id));
  for (const a of [...rel, ...pre]) if (!seen.has(a.id)) changes.push(`new changelog: ${a.date} ${a.title} ${a.url}`);
  if (prev.blockbench !== snap.blockbench) changes.push(`Blockbench: ${prev.blockbench} -> ${snap.blockbench}`);
  for (const p of TYPED) {
    const was = new Set(prev.api?.[p]?.latest?.members ?? []);
    const now = snap.api?.[p]?.latest?.members ?? [];
    const added = now.filter((x) => !was.has(x));
    if (was.size && added.length) changes.push(`${p} stable gained ${added.length}: ${added.slice(0, 40).join(", ")}${added.length > 40 ? " ..." : ""}`);
  }
}
const report = { checked: today, outDir, firstRun: !prev, changes, errors };
if (args.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Checked ${today}. Wrote ${outDir}`);
  console.log(prev ? (changes.length ? `Changes since ${prev.checked}:\n- ${changes.join("\n- ")}` : `No changes since ${prev.checked}.`) : "First run: baseline saved.");
  if (errors.length) console.log(`Errors:\n- ${errors.join("\n- ")}`);
}
