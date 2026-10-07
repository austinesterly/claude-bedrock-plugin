#!/usr/bin/env node
// Package a Bedrock add-on for sharing: <name>_BP.mcpack, <name>_RP.mcpack and <name>.mcaddon.
// No dependencies, Node 18+. Read-only on the source packs: it only reads them and writes into --out.
//
// Usage: node package-addon.mjs <packs dir> [--out <dir>] [--name <file base>]
//   <packs dir>  a folder holding the packs (for example <project>/packs with BP/ and RP/), or a single pack.
//                Packs are found by their manifest.json: a "data" or "script" module means behavior pack,
//                a "resources" module means resource pack.
//   --out        output folder (default: <packs dir>/../dist). Must not be inside a pack.
//   --name       file base name (default: the BP header name, or the folder name).
//
// Layout (matches Mojang's @minecraft/core-build-tasks mcaddonTask):
//   <name>_BP.mcpack   zip with the pack's files at the zip root (manifest.json at the top)
//   <name>_RP.mcpack   same for the resource pack
//   <name>.mcaddon     zip holding the two .mcpack files at its root
// Skipped: dotfiles and dot folders, node_modules, .git, *.md, Thumbs.db, desktop.ini, symlinks.
// Warnings: beta script modules, missing pack_icon.png, BP<->RP dependency uuid/version mismatches,
// missing min_engine_version, "$" in a path, paths over 255 characters.

import { readFileSync, readdirSync, lstatSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, relative, basename, dirname, sep } from "node:path";
import { deflateRawSync } from "node:zlib";

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const positional = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && (argv[i - 1] === "--out" || argv[i - 1] === "--name")));
if (!positional.length || argv.includes("--help") || argv.includes("-h")) {
  console.error("Usage: node package-addon.mjs <packs dir> [--out <dir>] [--name <file base>]");
  process.exit(2);
}
const src = resolve(positional[0]);
if (!existsSync(src) || !lstatSync(src).isDirectory()) { console.error(`Not a folder: ${src}`); process.exit(2); }

const warnings = [];
const warn = (m) => warnings.push(m);
const SKIP_NAMES = new Set(["node_modules", ".git", "Thumbs.db", "thumbs.db", "desktop.ini", "Desktop.ini"]);
const skip = (name) => name.startsWith(".") || SKIP_NAMES.has(name) || name.toLowerCase().endsWith(".md");

// ---------- find packs ----------
function readJson(file) {
  let text = readFileSync(file, "utf8");
  if (text.charCodeAt(0) === 0xfeff) { warn(`${file}: starts with a BOM (remove it)`); text = text.slice(1); }
  return JSON.parse(text);
}
function findManifests(dir, depth, out) {
  if (existsSync(join(dir, "manifest.json"))) { out.push(dir); return out; }
  if (depth <= 0) return out;
  let entries = [];
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) if (e.isDirectory() && !skip(e.name)) findManifests(join(dir, e.name), depth - 1, out);
  return out;
}
const packs = { BP: [], RP: [], other: [] };
for (const dir of findManifests(src, 3, [])) {
  let m;
  try { m = readJson(join(dir, "manifest.json")); } catch (e) { console.error(`${join(dir, "manifest.json")}: invalid JSON (${e.message})`); process.exit(1); }
  const types = (m.modules || []).map((x) => x && x.type);
  const pack = { dir, manifest: m };
  if (types.includes("data") || types.includes("script")) packs.BP.push(pack);
  else if (types.includes("resources")) packs.RP.push(pack);
  else packs.other.push({ ...pack, types });
}
for (const o of packs.other) warn(`${relative(src, o.dir) || "."}: module type ${o.types.join(", ") || "(none)"} is not a BP or RP; not packaged (skin packs and world templates are zipped by hand, see bedrock-shipping)`);
if (packs.BP.length > 1 || packs.RP.length > 1) {
  console.error(`Found ${packs.BP.length} behavior packs and ${packs.RP.length} resource packs. Point at a folder with one of each.`);
  for (const p of [...packs.BP, ...packs.RP]) console.error(`  ${p.dir}`);
  process.exit(1);
}
const BP = packs.BP[0], RP = packs.RP[0];
if (!BP && !RP) { console.error(`No behavior or resource pack manifest.json found under ${src}`); process.exit(1); }

// ---------- output folder and name ----------
const outDir = resolve(opt("--out") ?? join(dirname(src), "dist"));
for (const p of [BP, RP].filter(Boolean)) {
  const r = relative(p.dir, outDir);
  if (r === "" || (!r.startsWith("..") && !r.startsWith(sep) && !/^[A-Za-z]:/.test(r))) { console.error(`--out ${outDir} is inside the pack ${p.dir}; choose a folder outside the packs`); process.exit(2); }
}
function langValue(dir, key) {
  try {
    for (const line of readFileSync(join(dir, "texts", "en_US.lang"), "utf8").split(/\r?\n/)) {
      if (line.startsWith(key + "=")) return line.slice(key.length + 1).split("\t")[0].split("##")[0].trim();
    }
  } catch { /* no lang file */ }
  return undefined;
}
function defaultName() {
  const p = BP || RP;
  let n = p.manifest.header && p.manifest.header.name;
  if (typeof n === "string" && /^[\w.]+$/.test(n) && n.includes(".")) n = langValue(p.dir, n) ?? n;
  if (typeof n !== "string" || !n.trim()) n = basename(dirname(src)) || basename(src);
  return n.replace(/\s+(BP|RP|Behaviou?r Pack|Resource Pack)$/i, "");
}
const base = (opt("--name") ?? defaultName()).replace(/§./g, "").trim().replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") || "addon";

// ---------- manifest checks ----------
const vstr = (v) => Array.isArray(v) ? v.join(".") : typeof v === "string" ? v.replace(/^(\d+\.\d+\.\d+).*$/, "$1") : String(v);
function checkPack(label, p) {
  const m = p.manifest, h = m.header || {};
  if (!h.uuid) warn(`${label} manifest has no header.uuid`);
  if (h.version === undefined) warn(`${label} manifest has no header.version`);
  if (h.min_engine_version === undefined) warn(`${label} manifest has no header.min_engine_version (cooperative add-on guideline: set it on both packs)`);
  if (!existsSync(join(p.dir, "pack_icon.png"))) warn(`${label} has no pack_icon.png at its root (the game shows a default icon)`);
  for (const d of m.dependencies || []) {
    if (d && d.module_name && /beta|preview|internal/i.test(String(d.version))) warn(`${label} depends on ${d.module_name} ${d.version}: beta modules need the Beta APIs experiment, not for shipped content`);
  }
  for (const c of m.capabilities || []) if (/experimental/i.test(String(c))) warn(`${label} declares capability "${c}"`);
}
if (BP) checkPack("BP", BP);
if (RP) checkPack("RP", RP);
function checkDep(fromLabel, from, toLabel, to) {
  const deps = (from.manifest.dependencies || []).filter((d) => d && d.uuid);
  const th = to.manifest.header || {};
  const d = deps.find((x) => String(x.uuid).toLowerCase() === String(th.uuid).toLowerCase());
  if (!d) { warn(`${fromLabel} has no dependency on the ${toLabel} header uuid ${th.uuid}`); return; }
  if (vstr(d.version) !== vstr(th.version)) warn(`${fromLabel} depends on ${toLabel} version ${vstr(d.version)} but the ${toLabel} header version is ${vstr(th.version)}`);
}
if (BP && RP) {
  checkDep("BP", BP, "RP", RP);
  checkDep("RP", RP, "BP", BP);
  const bv = vstr(BP.manifest.header?.version), rv = vstr(RP.manifest.header?.version);
  if (bv !== rv) warn(`BP header version ${bv} and RP header version ${rv} differ (fine if intended; bump both on each release)`);
}

// ---------- collect files ----------
function collect(root) {
  const files = [];
  (function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (skip(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isSymbolicLink()) { warn(`skipped symlink ${relative(root, p)}`); continue; }
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.isFile()) continue;
      const name = relative(root, p).split(sep).join("/");
      if (name.includes("$")) warn(`${basename(root)}/${name}: "$" is not allowed in pack paths`);
      if (name.length > 200) warn(`${basename(root)}/${name}: long path (${name.length} chars); keep full install paths under 255`);
      files.push({ name, path: p });
    }
  })(root);
  return files;
}

// ---------- minimal zip writer (deflate or store, no zip64) ----------
const CRC_TABLE = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function dosTime(d) {
  const y = Math.max(1980, d.getFullYear());
  return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date: ((y - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
}
function zip(entries) { // entries: { name, data: Buffer, mtime: Date }
  const locals = [], centrals = [];
  let offset = 0;
  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, "utf8");
    const crc = crc32(e.data);
    let method = 8, body = deflateRawSync(e.data, { level: 9 });
    if (body.length >= e.data.length) { method = 0; body = e.data; }
    const { time, date } = dosTime(e.mtime);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(time, 10); lh.writeUInt16LE(date, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(e.data.length, 22); lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(0x0314, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(method, 10);
    ch.writeUInt16LE(time, 12); ch.writeUInt16LE(date, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(e.data.length, 24); ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32); ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36); ch.writeUInt32LE(0o100644 << 16 >>> 0, 38); ch.writeUInt32LE(offset, 42);
    locals.push(lh, nameBuf, body);
    centrals.push(ch, nameBuf);
    offset += lh.length + nameBuf.length + body.length;
    if (offset > 0xffffffff || entries.length > 0xffff) throw new Error("archive too large for a zip without zip64");
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, cd, end]);
}

// ---------- build ----------
mkdirSync(outDir, { recursive: true });
const now = new Date();
const built = [];
let totalBytes = 0, totalFiles = 0;
for (const [label, p] of [["BP", BP], ["RP", RP]]) {
  if (!p) continue;
  const files = collect(p.dir);
  const entries = files.map((f) => { const data = readFileSync(f.path); totalBytes += data.length; return { name: f.name, data, mtime: lstatSync(f.path).mtime }; });
  totalFiles += entries.length;
  const out = join(outDir, `${base}_${label}.mcpack`);
  const buf = zip(entries);
  writeFileSync(out, buf);
  built.push({ name: basename(out), data: buf, mtime: now, files: entries.length, path: out });
}
const addonPath = join(outDir, `${base}.mcaddon`);
const addon = zip(built.map(({ name, data, mtime }) => ({ name, data, mtime })));
writeFileSync(addonPath, addon);

// Size guidance from Microsoft Learn: cooperative add-ons ~25 MB uncompressed and 2,500 to 3,500 files.
if (totalBytes > 25 * 1024 * 1024) warn(`uncompressed size ${(totalBytes / 1048576).toFixed(1)} MB is over the 25 MB add-on guideline`);
if (totalFiles > 2500) warn(`${totalFiles} files is over the 2,500 file add-on guideline (performance guide; the cooperative guide says 3,500)`);

for (const b of built) console.log(`wrote ${b.path}  (${b.files} files, ${(b.data.length / 1024).toFixed(1)} KB)`);
console.log(`wrote ${addonPath}  (${built.length} packs, ${(addon.length / 1024).toFixed(1)} KB)`);
console.log(`source: ${totalFiles} files, ${(totalBytes / 1024).toFixed(1)} KB uncompressed`);
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); for (const w of warnings) console.log(`  warn: ${w}`); }
