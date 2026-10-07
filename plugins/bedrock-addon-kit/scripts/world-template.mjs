#!/usr/bin/env node
// Turn a Minecraft Bedrock world into a world template, and zip it as .mctemplate or .mcworld.
// No dependencies, Node 18+. It never modifies the source world: `init` copies it to a new folder
// first, and `pack` only reads the folder and writes the archive somewhere else.
//
// Usage:
//   node world-template.mjs init <world folder> --out <new folder> --packs <packs dir>
//        [--name "Map Name"] [--description "..."] [--lock] [--base-game 1.26.50] [--version 1.0.0]
//   node world-template.mjs pack <template folder> [--out <dir>] [--name <file base>] [--mcworld]
//
// init
//   <world folder>  a world copied out of com.mojang/minecraftWorlds (it must contain level.dat;
//                   a world can't be generated from scratch, so create it in the game first).
//   --out           new, empty folder. The world is copied there and every change happens there.
//   --packs         folder holding the packs (for example <project>/packs with BP/ and RP/). Packs are
//                   found by manifest.json: a "data" or "script" module is a behavior pack, a
//                   "resources" module is a resource pack.
//   It copies each pack into behavior_packs/<folder>/ or resource_packs/<folder>/ (folder names of
//   10 characters or less, Learn: Create a World Template), replacing a bundled copy with the same
//   header uuid; merges { pack_id, version } entries into world_behavior_packs.json and
//   world_resource_packs.json without duplicates; writes the world template manifest.json and
//   texts/en_US.lang + texts/languages.json. An existing world_template manifest keeps its UUIDs.
//   --lock          lock_template_options true (default false; the field is always written).
//   --base-game     base_game_version (default: the BP's min_engine_version, else 1.26.50). "*" is
//                   allowed (Learn: Base Game Versioning) but MCTools CHKMANIF133 warns about it.
//   --version       template header and module version (default 1.0.0, or the existing manifest's).
//
// pack
//   Zips the folder contents (no wrapping folder) into <name>.mctemplate, or <name>.mcworld with
//   --mcworld (the template manifest.json is left out). Default --out: the folder's parent.
//   Warns about: no world_icon.jpeg or one that is not 800x450, pack references that don't match a
//   bundled pack, long pack folder names, beta script modules, and experiments recorded in level.dat.

import { readFileSync, readdirSync, lstatSync, existsSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { join, resolve, relative, basename, dirname, sep, isAbsolute } from "node:path";
import { deflateRawSync } from "node:zlib";
import { randomUUID } from "node:crypto";

const argv = process.argv.slice(2);
const VALUE_FLAGS = new Set(["--out", "--packs", "--name", "--description", "--base-game", "--version"]);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const positional = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && VALUE_FLAGS.has(argv[i - 1])));
const [cmd, target] = positional;
const USAGE = `Usage:
  node world-template.mjs init <world folder> --out <new folder> --packs <packs dir> [--name "Map Name"] [--description "..."] [--lock] [--base-game 1.26.50] [--version 1.0.0]
  node world-template.mjs pack <template folder> [--out <dir>] [--name <file base>] [--mcworld]`;
if (!cmd || !target || argv.includes("--help") || argv.includes("-h") || !["init", "pack"].includes(cmd)) { console.error(USAGE); process.exit(2); }

const warnings = [];
const warn = (m) => warnings.push(m);
const fail = (m, code = 1) => { console.error(m); process.exit(code); };
const SKIP_NAMES = new Set(["node_modules", ".git", "Thumbs.db", "thumbs.db", "desktop.ini", "Desktop.ini"]);
const skipPackFile = (name) => name.startsWith(".") || SKIP_NAMES.has(name) || name.toLowerCase().endsWith(".md");
const skipWorldFile = (name) => name.startsWith(".") || SKIP_NAMES.has(name);
const isInside = (child, parent) => { const r = relative(parent, child); return r === "" || (!r.startsWith("..") && !isAbsolute(r)); };
const isDir = (p) => existsSync(p) && lstatSync(p).isDirectory();

function readJson(file) {
  let text = readFileSync(file, "utf8");
  if (text.charCodeAt(0) === 0xfeff) { warn(`${file}: starts with a BOM (remove it)`); text = text.slice(1); }
  return JSON.parse(text);
}
// Strict JSON, two-space indent, short number arrays such as versions kept on one line.
const toJson = (data) => JSON.stringify(data, null, 2).replace(/\[\s+(-?\d+(?:,\s+-?\d+)*)\s+\]/g, (_, inner) => `[${inner.split(/,\s+/).join(", ")}]`);
const writeJson = (file, data) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, toJson(data) + "\n"); };
const vstr = (v) => Array.isArray(v) ? v.join(".") : typeof v === "string" ? v : String(v);
const parseVersion = (s, flag) => {
  if (!/^\d+\.\d+\.\d+$/.test(s)) fail(`${flag} must look like 1.26.50, got "${s}"`, 2);
  return s.split(".").map(Number);
};
const moduleTypes = (m) => (m.modules || []).map((x) => x && x.type);
const isWorldTemplateManifest = (m) => moduleTypes(m).includes("world_template");

function findManifests(dir, depth, out) {
  if (existsSync(join(dir, "manifest.json"))) { out.push(dir); return out; }
  if (depth <= 0) return out;
  let entries = [];
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) if (e.isDirectory() && !skipPackFile(e.name)) findManifests(join(dir, e.name), depth - 1, out);
  return out;
}
function classify(dir) {
  let m;
  try { m = readJson(join(dir, "manifest.json")); } catch (e) { fail(`${join(dir, "manifest.json")}: invalid JSON (${e.message})`); }
  const types = moduleTypes(m);
  if (types.includes("data") || types.includes("script")) return { kind: "BP", dir, manifest: m };
  if (types.includes("resources")) return { kind: "RP", dir, manifest: m };
  return { kind: "other", dir, manifest: m, types };
}
function checkBetaModules(label, m) {
  for (const d of m.dependencies || []) {
    if (d && d.module_name && /beta|preview|internal/i.test(String(d.version))) warn(`${label} depends on ${d.module_name} ${d.version}: beta modules need the Beta APIs experiment, which is then saved into the world`);
  }
}

// Copy a folder tree. Symlinks are skipped (warned), never followed.
function copyTree(from, to, skip) {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    if (skip(e.name)) continue;
    const s = join(from, e.name), d = join(to, e.name);
    if (e.isSymbolicLink()) { warn(`skipped symlink ${s}`); continue; }
    if (e.isDirectory()) copyTree(s, d, skip);
    else if (e.isFile()) copyFileSync(s, d);
  }
}

// ---------- level.dat: experiments (optional, best effort) ----------
// Bedrock level.dat is an 8-byte header (version, length) followed by little-endian NBT.
// Minecraft Creator Tools reads an "experiments" compound whose byte tags include gametest
// (Beta APIs), data_driven_items, experiments_ever_used and saved_with_toggled_experiments.
// This scans for that compound and reads its scalar children. Anything unexpected: give up quietly.
function readExperiments(levelDatPath) {
  let buf;
  try { buf = readFileSync(levelDatPath); } catch { return null; }
  const needle = Buffer.concat([Buffer.from([0x0a, 11, 0]), Buffer.from("experiments", "latin1")]);
  const at = buf.indexOf(needle, 8);
  if (at < 0) return null;
  const sizes = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 4, 6: 8 };
  const found = {};
  let i = at + needle.length;
  try {
    for (let n = 0; n < 512 && i < buf.length; n++) {
      const type = buf[i++];
      if (type === 0) return found;
      const len = buf.readUInt16LE(i); i += 2;
      const name = buf.toString("utf8", i, i + len); i += len;
      if (type === 1) { found[name] = buf[i]; i += 1; }
      else if (sizes[type]) i += sizes[type];
      else if (type === 8) { const sl = buf.readUInt16LE(i); i += 2 + sl; }
      else return found; // nested lists or compounds: stop, keep what we have
    }
  } catch { /* truncated or not NBT */ }
  return found;
}
// Names as Minecraft Creator Tools (WorldLevelDat) maps them; other tag names are printed as they are.
const EXPERIMENT_NAMES = { gametest: "Beta APIs", data_driven_items: "Data Driven Items", deferred_technical_preview: "Deferred Technical Preview" };
function warnExperiments(worldDir) {
  const ex = readExperiments(join(worldDir, "level.dat"));
  if (!ex) return;
  const on = Object.entries(ex).filter(([k, v]) => v && k !== "experiments_ever_used" && k !== "saved_with_toggled_experiments").map(([k]) => EXPERIMENT_NAMES[k] ? `${k} (${EXPERIMENT_NAMES[k]})` : k);
  if (on.length) warn(`level.dat has experiments turned on: ${on.join(", ")}. A template made from this world ships with them on (MCTools EXPFLAG101). Rebuild in a world without experiments for Marketplace-style content.`);
  else if (ex.experiments_ever_used || ex.saved_with_toggled_experiments) warn(`level.dat records that experiments were used in this world (experiments_ever_used / saved_with_toggled_experiments). MCTools EXPFLAG101 flags this even after they are turned off.`);
}

// ---------- JPEG size ----------
function jpegSize(file) {
  const b = readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    if ((marker >= 0xc0 && marker <= 0xcf) && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

// ---------- minimal zip writer (deflate or store, no zip64), copied from package-addon.mjs ----------
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

// ---------- shared: lang helpers ----------
function readLang(file) {
  try { return readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/); } catch { return null; }
}
function langValue(lines, key) {
  for (const line of lines || []) if (line.startsWith(key + "=")) return line.slice(key.length + 1).split("\t")[0].trim();
  return undefined;
}
const NO_LEVEL_DAT = (dir) => `${dir} has no level.dat, so it is not a Minecraft world.
A world can't be generated from scratch. Create it in the game (Play > Create New), set it up, then
save and quit and copy its folder out of com.mojang/minecraftWorlds. On Windows (GDK builds, 1.21.120+)
worlds are under %APPDATA%\\Minecraft Bedrock\\Users\\<user id>\\games\\com.mojang\\minecraftWorlds\\<folder>
(Preview: %APPDATA%\\Minecraft Bedrock Preview\\...). The folder names are random; levelname.txt inside
each one holds the world's name. You can also export the world (Edit > Export World) and unzip the .mcworld.`;

// ================= init =================
function init() {
  const src = resolve(target);
  if (!isDir(src)) fail(`Not a folder: ${src}`, 2);
  if (!existsSync(join(src, "level.dat"))) fail(NO_LEVEL_DAT(src));
  const outOpt = opt("--out");
  if (!outOpt) fail(`init needs --out <new folder>: the source world is never modified, the template is built in a copy.\n${USAGE}`, 2);
  const out = resolve(outOpt);
  if (isInside(out, src) || isInside(src, out)) fail(`--out ${out} must be outside the source world ${src} (and not contain it)`, 2);
  if (existsSync(out) && (!isDir(out) || readdirSync(out).length)) fail(`${out} already exists and is not empty; pick a new folder.`, 2);
  const packsOpt = opt("--packs");
  if (!packsOpt) fail(`init needs --packs <packs dir> (the folder with your BP and RP).\n${USAGE}`, 2);
  const packsDir = resolve(packsOpt);
  if (!isDir(packsDir)) fail(`Not a folder: ${packsDir}`, 2);
  if (isInside(out, packsDir)) fail(`--out ${out} must be outside the packs folder ${packsDir}`, 2);

  const packs = findManifests(packsDir, 3, []).map(classify);
  for (const o of packs.filter((p) => p.kind === "other")) warn(`${o.dir}: module type ${o.types.join(", ") || "(none)"} is not a BP or RP; not added to the world`);
  const bps = packs.filter((p) => p.kind === "BP"), rps = packs.filter((p) => p.kind === "RP");
  if (!bps.length && !rps.length) fail(`No behavior or resource pack manifest.json found under ${packsDir}`);
  for (const p of [...bps, ...rps]) {
    const h = p.manifest.header || {};
    if (!h.uuid || h.version === undefined) fail(`${join(p.dir, "manifest.json")}: header needs uuid and version`);
    checkBetaModules(`${p.kind} ${basename(p.dir)}`, p.manifest);
  }

  // 1. copy the world (the only write to anything is inside --out from here on)
  copyTree(src, out, skipWorldFile);
  warnExperiments(out);

  // 2. copy packs into the world and merge the reference files
  const sanitize = (s) => String(s || "").replace(/§./g, "").toLowerCase().replace(/\b(bp|rp|behaviou?r pack|resource pack)\b/g, "").replace(/[^a-z0-9]+/g, "");
  for (const [kind, list, sub, refFile] of [["BP", bps, "behavior_packs", "world_behavior_packs.json"], ["RP", rps, "resource_packs", "world_resource_packs.json"]]) {
    if (!list.length) continue;
    const root = join(out, sub);
    mkdirSync(root, { recursive: true });
    // existing bundled packs by header uuid
    const existing = new Map();
    for (const e of readdirSync(root, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      try { const m = readJson(join(root, e.name, "manifest.json")); if (m.header?.uuid) existing.set(String(m.header.uuid).toLowerCase(), e.name); } catch { /* not a pack */ }
    }
    for (const e of readdirSync(root)) if (e.length > 10) warn(`${sub}/${e}: folder name longer than 10 characters (Learn: Create a World Template, Xbox path issue)`);
    let refs = [];
    const refPath = join(out, refFile);
    if (existsSync(refPath)) {
      try { refs = readJson(refPath); } catch (e) { fail(`${refPath}: invalid JSON (${e.message}); fix it in the source world or delete it`); }
      if (!Array.isArray(refs)) fail(`${refPath}: expected a JSON array of { "pack_id", "version" }`);
    }
    for (const p of list) {
      const h = p.manifest.header;
      const id = String(h.uuid).toLowerCase();
      let folder = existing.get(id);
      if (folder) rmSync(join(root, folder), { recursive: true, force: true });
      else {
        const base = (sanitize(h.name).slice(0, 7) || "pack") + "_" + kind.toLowerCase();
        folder = base;
        for (let n = 2; existsSync(join(root, folder)); n++) folder = base.slice(0, 10 - String(n).length) + n;
      }
      copyTree(p.dir, join(root, folder), skipPackFile);
      const ref = refs.find((r) => r && String(r.pack_id).toLowerCase() === id);
      if (ref) ref.version = h.version;
      else refs.push({ pack_id: h.uuid, version: h.version });
      console.log(`${kind}: ${p.dir} -> ${sub}/${folder}  (${h.uuid} ${vstr(h.version)})`);
    }
    writeJson(refPath, refs);
  }

  // 3. world template manifest
  const manPath = join(out, "manifest.json");
  let old = null;
  if (existsSync(manPath)) {
    try { old = readJson(manPath); } catch (e) { fail(`${manPath}: invalid JSON (${e.message})`); }
    if (!isWorldTemplateManifest(old)) fail(`${manPath} exists but has no world_template module; a world folder should not have a manifest.json at its root`);
  }
  const oldMod = old ? old.modules.find((m) => m && m.type === "world_template") : null;
  let baseGame;
  const bg = opt("--base-game");
  if (bg === "*") { baseGame = "*"; warn(`base_game_version "*" is allowed by Learn but MCTools CHKMANIF133 recommends an exact version`); }
  else if (bg) baseGame = parseVersion(bg, "--base-game");
  else if (old?.header?.base_game_version !== undefined) baseGame = old.header.base_game_version;
  else {
    const mev = bps[0]?.manifest.header?.min_engine_version ?? rps[0]?.manifest.header?.min_engine_version;
    baseGame = Array.isArray(mev) && mev.length === 3 ? mev : [1, 26, 50];
  }
  const version = opt("--version") ? parseVersion(opt("--version"), "--version") : (old?.header?.version ?? [1, 0, 0]);
  const lock = argv.includes("--lock") ? true : (old?.header?.lock_template_options ?? false);
  const manifest = {
    format_version: 2,
    header: {
      name: "pack.name",
      description: "pack.description",
      version,
      uuid: old?.header?.uuid ?? randomUUID(),
      lock_template_options: lock,
      base_game_version: baseGame,
      ...(old?.header?.allow_random_seed !== undefined ? { allow_random_seed: old.header.allow_random_seed } : {}),
    },
    modules: [{ version, type: "world_template", uuid: oldMod?.uuid ?? randomUUID() }],
    ...(old?.metadata ? { metadata: old.metadata } : {}),
  };
  if (old && !opt("--version")) warn(`kept the existing template version ${vstr(version)}; pass --version to bump it for a release`);
  writeJson(manPath, manifest);

  // 4. texts/en_US.lang and texts/languages.json
  const langPath = join(out, "texts", "en_US.lang");
  const lines = readLang(langPath) || [];
  const levelName = (() => { try { return readFileSync(join(out, "levelname.txt"), "utf8").trim(); } catch { return ""; } })();
  const name = (opt("--name") ?? langValue(lines, "pack.name") ?? levelName) || basename(src);
  const description = opt("--description") ?? langValue(lines, "pack.description") ?? "";
  const setKey = (key, value) => {
    const clean = String(value).replace(/[\r\n]+/g, " ");
    const i = lines.findIndex((l) => l.startsWith(key + "="));
    if (i >= 0) lines[i] = `${key}=${clean}`; else lines.push(`${key}=${clean}`);
  };
  setKey("pack.name", name);
  setKey("pack.description", description);
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  mkdirSync(dirname(langPath), { recursive: true });
  writeFileSync(langPath, lines.join("\n") + "\n");
  const lj = join(out, "texts", "languages.json");
  let langs = [];
  if (existsSync(lj)) { try { langs = readJson(lj); } catch { langs = []; } if (!Array.isArray(langs)) langs = []; }
  if (!langs.includes("en_US")) langs.unshift("en_US");
  writeJson(lj, langs);

  if (!existsSync(join(out, "world_icon.jpeg"))) warn(`no world_icon.jpeg at the world root (Learn: 800x450 JPEG; needed for Marketplace templates)`);
  console.log(`manifest: ${manPath}  (uuid ${manifest.header.uuid}, version ${vstr(version)}, base_game_version ${vstr(baseGame)}, lock_template_options ${lock})`);
  console.log(`texts: pack.name=${name}`);
  console.log(`\nTemplate folder ready: ${out}\nSource world untouched: ${src}\nNext: node world-template.mjs pack "${out}"`);
}

// ================= pack =================
function pack() {
  const dir = resolve(target);
  if (!isDir(dir)) fail(`Not a folder: ${dir}`, 2);
  if (!existsSync(join(dir, "level.dat"))) fail(NO_LEVEL_DAT(dir));
  const asWorld = argv.includes("--mcworld");
  const manPath = join(dir, "manifest.json");
  let manifest = null;
  if (existsSync(manPath)) {
    try { manifest = readJson(manPath); } catch (e) { fail(`${manPath}: invalid JSON (${e.message})`); }
  }
  if (!asWorld) {
    if (!manifest || !isWorldTemplateManifest(manifest)) fail(`${dir} has no world template manifest.json. Run "init" first, or pass --mcworld for a plain world.`);
    const h = manifest.header || {};
    if (h.base_game_version === undefined) warn(`manifest header has no base_game_version (MCTools BASEGAMEVER100, error)`);
    if (h.lock_template_options === undefined) warn(`manifest header has no lock_template_options (Learn manifest reference: required for world templates; MCTools CHKMANIF105)`);
    if (!existsSync(join(dir, "texts", "en_US.lang"))) warn(`no texts/en_US.lang: the template will be named "pack.name" (Learn: Create a World Template)`);
  }

  // icon
  const icon = join(dir, "world_icon.jpeg");
  if (!existsSync(icon)) warn(`no world_icon.jpeg at the world root (MCTools CWI101). Learn: 800x450 JPEG, needed for Marketplace templates`);
  else {
    const s = jpegSize(icon);
    if (!s) warn(`world_icon.jpeg is not a readable JPEG (MCTools CWI103)`);
    else if (s.width !== 800 || s.height !== 450) warn(`world_icon.jpeg is ${s.width}x${s.height}; Learn and the Creator Tools check use 800x450 (see bedrock-world-templates packaging-and-updates.md)`);
  }

  // bundled packs and references
  for (const [sub, refFile] of [["behavior_packs", "world_behavior_packs.json"], ["resource_packs", "world_resource_packs.json"]]) {
    const bundled = new Map();
    const root = join(dir, sub);
    if (isDir(root)) {
      for (const e of readdirSync(root, { withFileTypes: true })) {
        if (!e.isDirectory()) continue;
        if (e.name.length > 10) warn(`${sub}/${e.name}: folder name longer than 10 characters (Learn: Create a World Template)`);
        const mp = join(root, e.name, "manifest.json");
        if (!existsSync(mp)) { warn(`${sub}/${e.name} has no manifest.json`); continue; }
        try {
          const m = readJson(mp);
          if (m.header?.uuid) bundled.set(String(m.header.uuid).toLowerCase(), m.header.version);
          checkBetaModules(`${sub}/${e.name}`, m);
        } catch (err) { warn(`${mp}: invalid JSON (${err.message})`); }
      }
    }
    const refPath = join(dir, refFile);
    if (!existsSync(refPath)) { if (bundled.size) warn(`${sub}/ holds packs but ${refFile} is missing, so they are not active (MCTools WPACKREFS202)`); continue; }
    let refs;
    try { refs = readJson(refPath); } catch (err) { warn(`${refFile}: invalid JSON (${err.message}) (MCTools WPACKREFS201)`); continue; }
    if (!Array.isArray(refs)) { warn(`${refFile}: expected an array (MCTools WPACKREFS201)`); continue; }
    for (const r of refs) {
      const id = String(r?.pack_id || "").toLowerCase();
      if (!id) { warn(`${refFile}: entry without pack_id (MCTools WPACKREFS203)`); continue; }
      if (r.version === undefined) warn(`${refFile}: ${r.pack_id} has no version (MCTools WPACKREFS204)`);
      if (!bundled.has(id)) { warn(`${refFile}: ${r.pack_id} is not bundled in ${sub}/ (MCTools WPACKREFS206, error). Remove the entry or bundle the pack.`); continue; }
      if (r.version !== undefined && vstr(r.version) !== vstr(bundled.get(id))) warn(`${refFile}: ${r.pack_id} version ${vstr(r.version)} but the bundled pack is ${vstr(bundled.get(id))}`);
    }
  }
  warnExperiments(dir);

  // output
  const outDir = resolve(opt("--out") ?? dirname(dir));
  if (isInside(outDir, dir)) fail(`--out ${outDir} is inside the folder being zipped; choose a folder outside it`, 2);
  const lines = readLang(join(dir, "texts", "en_US.lang"));
  let n = opt("--name") ?? langValue(lines, "pack.name");
  if (!n) { try { n = readFileSync(join(dir, "levelname.txt"), "utf8").trim(); } catch { /* none */ } }
  const base = String(n || basename(dir)).replace(/§./g, "").trim().replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") || "world";
  const outFile = join(outDir, `${base}.${asWorld ? "mcworld" : "mctemplate"}`);

  const entries = [];
  let bytes = 0;
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (skipWorldFile(e.name)) continue;
      const p = join(d, e.name);
      if (e.isSymbolicLink()) { warn(`skipped symlink ${relative(dir, p)}`); continue; }
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.isFile()) continue;
      const name = relative(dir, p).split(sep).join("/");
      if (asWorld && name === "manifest.json") continue;
      if (name.includes("$")) warn(`${name}: "$" is not allowed in pack paths (MCTools FORBFILE104)`);
      if (name.length > 200) warn(`${name}: long path (${name.length} chars); keep full install paths under 255 (MCTools PATHLENGTH103)`);
      const data = readFileSync(p);
      bytes += data.length;
      entries.push({ name, data, mtime: lstatSync(p).mtime });
    }
  })(dir);
  if (existsSync(join(dir, "db", "LOCK")) || existsSync(join(dir, "db", "lock"))) {
    // harmless in an exported world, but a running game holds the database open
    console.log(`note: db/ contains a LOCK file; make sure the world is closed in the game before packing`);
  }
  mkdirSync(outDir, { recursive: true });
  const buf = zip(entries);
  writeFileSync(outFile, buf);
  console.log(`wrote ${outFile}  (${entries.length} files, ${(bytes / 1024).toFixed(1)} KB uncompressed, ${(buf.length / 1024).toFixed(1)} KB zipped)`);
  console.log(asWorld ? `Import: double-click it; it appears in the Play > Worlds list.` : `Import: double-click it; it appears under Play > Create New > Imported Templates (Learn: Create a World Template).`);
}

if (cmd === "init") init(); else pack();
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); for (const w of warnings) console.log(`  warn: ${w}`); }
