// Makes the slim copy of the packs that ships: what Minecraft loads and what goes into the .mcaddon.
// Austin, 26 Nov 2026: "what is the size of our addon, I do want to make it within Mojangs reccomended size". Mojang's
// creator docs recommend at most 25 MB uncompressed for an add-on, and 2,500 files on one page, 3,500 on another.
//
// Usage: node tools/slim.mjs [out folder]   (default: dist/slim; it is emptied first: everything in it is a copy)
//
// The source in packs/ stays as it is written. The slim copy differs in three ways, none of which changes the game:
//   1. scripts: the one file tools/bundle/main.js instead of the 460-odd files under packs/BP/scripts. The bundle is
//      made in the cloud from those very files, comments dropped; its first line carries their hash, and this script
//      stops the build if the bundle does not match the source it sits beside.
//   2. every .json is written without spaces and line breaks (its numbers and words exactly as they were).
//   3. the resource pack's render controllers, animations, animation controllers and models are merged into one file
//      per folder and format version (the game reads any number of them from one file).
// It prints the size and the file count and exits with an error when either is over BUDGET.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const BUDGET = { bytes: 25 * 1024 * 1024, files: 3500 };
/** The folders merged into one file per format version, with the key their entries sit under. */
export const MERGED = [
  ["RP/render_controllers", "render_controllers"],
  ["RP/animations", "animations"],
  ["RP/animation_controllers", "animation_controllers"],
  ["RP/models/entity", "minecraft:geometry"],
  ["RP/models/blocks", "minecraft:geometry"],
];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Every file under a folder, as paths relative to it with forward slashes, sorted. */
export function filesUnder(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(relative(dir, p).split(sep).join("/"));
    }
  };
  walk(dir);
  return out.sort();
}

/** The hash the bundle carries: every script's path and bytes, in order. */
export function sourceHash(scriptsDir) {
  const h = createHash("sha256");
  for (const rel of filesUnder(scriptsDir)) {
    h.update(rel);
    h.update("\0");
    h.update(readFileSync(join(scriptsDir, rel)));
    h.update("\0");
  }
  return h.digest("hex");
}

/** The hash on a bundle's first line, or undefined. */
export const bundleHash = (text) => /^\/\/ zoocraft-bundle sha256=([0-9a-f]{64})\n/.exec(text)?.[1];

/**
 * A JSON text without the spaces and line breaks between its tokens. The tokens themselves are kept as written: the
 * game tells 0.0 (a float) from 0 (an integer) in places, so the numbers must not be re-written.
 */
export function compact(text) {
  let out = "";
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j + 1;
    } else {
      if (c !== " " && c !== "\n" && c !== "\r" && c !== "\t") out += c;
      i++;
    }
  }
  return out;
}

/** The members of a compact JSON object or array text, as written: [{ key (objects only), raw }]. */
export function members(text) {
  const out = [];
  const array = text[0] === "[";
  let i = 1;
  while (i < text.length - 1) {
    let key;
    if (!array) {
      let j = i + 1;
      while (text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
      key = JSON.parse(text.slice(i, j + 1));
      i = j + 2; // past the colon
    }
    const start = i;
    let depth = 0;
    for (; i < text.length - 1; i++) {
      const c = text[i];
      if (c === '"') {
        i++;
        while (text[i] !== '"') i += text[i] === "\\" ? 2 : 1;
      } else if (c === "{" || c === "[") depth++;
      else if (c === "}" || c === "]") depth--;
      else if (c === "," && depth === 0) break;
    }
    out.push({ key, raw: text.slice(start, i) });
    i++; // past the comma
  }
  return out;
}

/**
 * Merges files of one folder: [{ name, text }] -> [{ name, text }], one per format version, every entry as it was
 * written. Throws when a file holds anything else, or two files define the same thing.
 */
export function mergeFiles(files, key) {
  const groups = new Map();
  for (const f of files) {
    const top = members(compact(f.text));
    const extra = top.filter((m) => m.key !== "format_version" && m.key !== key).map((m) => m.key);
    const body = top.find((m) => m.key === key);
    const version = top.find((m) => m.key === "format_version");
    if (extra.length || !body || !version) throw new Error(`${f.name}: cannot merge (${extra.join(", ") || `no ${key} or format_version`})`);
    if (!groups.has(version.raw)) groups.set(version.raw, []);
    groups.get(version.raw).push({ name: f.name, body: body.raw });
  }
  const out = [];
  for (const [version, list] of [...groups].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const array = list[0].body[0] === "[";
    const seen = new Set();
    const parts = [];
    for (const f of list) {
      for (const m of members(f.body)) {
        const id = array ? JSON.parse(m.raw)?.description?.identifier : m.key;
        if (id === undefined || seen.has(id)) throw new Error(`${f.name}: ${id} is defined twice`);
        seen.add(id);
        parts.push(array ? m.raw : `${JSON.stringify(m.key)}:${m.raw}`);
      }
    }
    const inner = array ? `[${parts.join(",")}]` : `{${parts.join(",")}}`;
    out.push({ name: `zoocraft_all_${JSON.parse(version).replace(/\./g, "_")}.json`, text: `{"format_version":${version},${JSON.stringify(key)}:${inner}}` });
  }
  return out;
}

/** Builds the slim copy in `out` from `src` (a folder holding packs/ and tools/bundle/main.js). Returns { bytes, files }. */
export function slim(src, out) {
  const scripts = join(src, "packs", "BP", "scripts");
  const bundle = readFileSync(join(src, "tools", "bundle", "main.js"), "utf8");
  const want = sourceHash(scripts);
  if (bundleHash(bundle) !== want) throw new Error(`tools/bundle/main.js was not made from these scripts (it says ${bundleHash(bundle)}, they are ${want}). The cloud ships a new bundle with every change to packs/BP/scripts.`);
  rmSync(out, { recursive: true, force: true });
  let bytes = 0;
  let files = 0;
  const put = (rel, data) => {
    const p = join(out, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, data);
    bytes += data.length;
    files++;
  };
  const mergedDirs = new Map(MERGED.map(([dir, key]) => [dir, { key, list: [] }]));
  for (const pack of ["BP", "RP"]) {
    const base = join(src, "packs", pack);
    for (const rel of filesUnder(base)) {
      const full = `${pack}/${rel}`;
      if (full.startsWith("BP/scripts/")) continue;
      let data = readFileSync(join(base, ...rel.split("/")));
      if (rel.endsWith(".json")) {
        const text = data.toString("utf8");
        JSON.parse(compact(text)); // it must be plain JSON (no comments) to be compacted safely
        const m = mergedDirs.get(full.slice(0, full.lastIndexOf("/")));
        if (m) {
          m.list.push({ name: full, text });
          continue;
        }
        data = Buffer.from(compact(text), "utf8");
      }
      put(full, data);
    }
  }
  for (const [dir, m] of mergedDirs) for (const f of mergeFiles(m.list, m.key)) put(`${dir}/${f.name}`, Buffer.from(f.text, "utf8"));
  put("BP/scripts/main.js", Buffer.from(bundle, "utf8"));
  return { bytes, files };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = process.argv[2] ? process.argv[2] : join(root, "dist", "slim");
  const r = slim(root, out);
  const size = (dir) => filesUnder(dir).reduce((n, f) => n + statSync(join(dir, f)).size, 0);
  const mb = (n) => (n / 1048576).toFixed(1);
  console.log(`slim copy: ${mb(r.bytes)} MB in ${r.files} files (BP ${mb(size(join(out, "BP")))} MB, RP ${mb(size(join(out, "RP")))} MB) -> ${out}`);
  console.log(`budget: ${mb(BUDGET.bytes)} MB and ${BUDGET.files} files (Mojang's recommendation for add-ons)`);
  if (r.bytes > BUDGET.bytes || r.files > BUDGET.files || !existsSync(join(out, "BP", "manifest.json"))) {
    console.error("OVER BUDGET: the add-on is larger than Mojang recommends. Tell the build thread.");
    process.exit(1);
  }
}
