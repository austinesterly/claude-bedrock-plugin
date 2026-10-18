#!/usr/bin/env node
// Bedrock pack checker: finds the broken links the game never reports.
// No dependencies, Node 18+. Read-only: never writes to the packs.
// Usage: node check-pack.mjs <pack or project dir> [more dirs...] [--json]
// Each argument can be a BP, an RP, or a folder containing packs; manifests are found automatically.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname, basename, extname } from "node:path";

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const roots = argv.filter((a) => !a.startsWith("--")).map((a) => resolve(a));
if (!roots.length) { console.error("Usage: node check-pack.mjs <pack or project dir> [...] [--json]"); process.exit(2); }

const findings = [];
const err = (file, msg) => findings.push({ level: "error", file, msg });
const warn = (file, msg) => findings.push({ level: "warn", file, msg });
const rel = (f) => relative(process.cwd(), f) || f;

// ---------- file helpers ----------
function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
// Exact-case existence check (Windows and macOS are case-insensitive; the game on other platforms is not).
function existsExactCase(p) {
  if (!existsSync(p)) return false;
  const parts = resolve(p).split(/[\\/]/);
  let cur = parts[0] === "" ? "/" : parts[0] + "/";
  for (let i = 1; i < parts.length; i++) {
    if (!parts[i]) continue;
    let names;
    try { names = readdirSync(cur); } catch { return true; }
    if (!names.includes(parts[i])) return false;
    cur = join(cur, parts[i]);
  }
  return true;
}
function pngSize(file) {
  try {
    const b = readFileSync(file);
    if (b.length > 24 && b.toString("ascii", 1, 4) === "PNG") return [b.readUInt32BE(16), b.readUInt32BE(20)];
  } catch {}
  return undefined;
}
function hasCommentKeys(v, path = "") {
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) { const r = hasCommentKeys(v[i], `${path}[${i}]`); if (r) return r; } }
  else if (v && typeof v === "object") {
    for (const k of Object.keys(v)) {
      if (/^(__comment|_comment|\/\/)/.test(k) || (/^#./.test(k) && !path.endsWith(".key"))) return `${path}.${k}`; // a lone "#" is a valid recipe key symbol
      const r = hasCommentKeys(v[k], `${path}.${k}`); if (r) return r;
    }
  }
  return undefined;
}
// Remove // and /* */ comments outside strings.
function stripComments(t) {
  let out = "", inStr = false, i = 0;
  while (i < t.length) {
    const c = t[i], n = t[i + 1];
    if (inStr) { out += c; if (c === "\\") { out += n ?? ""; i += 2; continue; } if (c === '"') inStr = false; i++; continue; }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === "/" && n === "/") { while (i < t.length && t[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { i += 2; while (i < t.length && !(t[i] === "*" && t[i + 1] === "/")) i++; i += 2; continue; }
    out += c; i++;
  }
  return out;
}
const parsed = new Map();
function readJson(file) {
  if (parsed.has(file)) return parsed.get(file);
  let txt = readFileSync(file, "utf8"), val;
  if (txt.charCodeAt(0) === 0xfeff) { err(file, "starts with a UTF-8 BOM; the game may reject it"); txt = txt.slice(1); }
  if (/[“”]/.test(txt)) warn(file, "contains smart quotes");
  try { val = JSON.parse(txt); }
  catch (e) {
    const stripped = stripComments(txt);
    try {
      val = JSON.parse(stripped);
      warn(file, "has // or /* */ comments: the game tolerates them (vanilla files use them) but many editors and validators don't; prefer removing them");
    } catch (e2) {
      const hint = /,\s*[}\]]/.test(stripped) ? " (trailing comma)" : "";
      err(file, `JSON does not parse${hint}: ${e2.message}`);
      val = undefined;
    }
  }
  if (val !== undefined) { const ck = hasCommentKeys(val); if (ck) err(file, `comment key ${ck}; remove it (comment keys break parsing in the game)`); }
  parsed.set(file, val);
  return val;
}
const vnum = (s) => String(s ?? "0").split(".").map((x) => parseInt(x, 10) || 0).reduce((a, x, i) => a + x * Math.pow(1000, 3 - i), 0);

// ---------- discover packs ----------
const packs = [];
for (const r of roots) {
  for (const f of walk(r)) {
    if (basename(f) !== "manifest.json") continue;
    const m = readJson(f);
    if (!m) continue;
    const types = (m.modules ?? []).map((x) => x.type);
    const kind = types.includes("resources") ? "RP" : (types.includes("data") || types.includes("script")) ? "BP" : "other";
    packs.push({ dir: dirname(f), manifest: m, file: f, kind });
  }
}
if (!packs.length) { console.error("No manifest.json found under the given paths."); process.exit(2); }

// ---------- manifests ----------
const uuidSeen = new Map();
for (const p of packs) {
  const m = p.manifest;
  if (m.format_version !== 2 && m.format_version !== 3) warn(p.file, `manifest format_version is ${m.format_version}; use 2`);
  const ids = [m.header?.uuid, ...(m.modules ?? []).map((x) => x.uuid)];
  for (const u of ids) {
    if (!u) { err(p.file, "missing uuid in header or a module"); continue; }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u)) err(p.file, `invalid uuid ${u}`);
    if (uuidSeen.has(u)) err(p.file, `uuid ${u} is also used in ${rel(uuidSeen.get(u))}; every uuid must be unique`);
    else uuidSeen.set(u, p.file);
  }
  if (!m.header?.min_engine_version) warn(p.file, "header.min_engine_version is missing");
  for (const mod of m.modules ?? []) {
    if (mod.type === "script") {
      if (mod.language !== "javascript") warn(p.file, `script module language is ${mod.language}; expected "javascript"`);
      const entry = join(p.dir, mod.entry ?? "");
      if (!mod.entry || !existsExactCase(entry)) err(p.file, `script entry "${mod.entry}" not found (exact case)`);
      const deps = (m.dependencies ?? []).filter((d) => d.module_name);
      if (!deps.some((d) => d.module_name === "@minecraft/server")) warn(p.file, "script module but no @minecraft/server dependency");
      for (const d of deps) if (/beta/.test(String(d.version))) warn(p.file, `${d.module_name} ${d.version} is a beta module: needs the Beta APIs experiment`);
    }
  }
}
const rps = packs.filter((p) => p.kind === "RP"), bps = packs.filter((p) => p.kind === "BP");
for (const bp of bps) {
  const depUuids = (bp.manifest.dependencies ?? []).map((d) => d.uuid).filter(Boolean);
  if (rps.length && !rps.some((rp) => depUuids.includes(rp.manifest.header?.uuid)))
    warn(bp.file, "BP has no dependency on the RP header uuid, so the RP won't be applied automatically");
}

// ---------- index RP and BP content ----------
const geos = new Map();          // geometry id -> { file, bones: Map(name->bone), tw, th }
const anims = new Map();         // animation id -> { file, data }
const controllers = new Map();   // controller.animation id -> { file, data }
const renderCtrls = new Map();   // controller.render id -> { file, data }
const clientEntities = [];       // { file, desc, fv }
const bpEntities = new Map();    // identifier -> file
const soundDefs = new Set();
const particleIds = new Set();

for (const rp of rps) {
  for (const f of walk(rp.dir)) {
    if (extname(f) !== ".json") continue;
    const r = relative(rp.dir, f).replace(/\\/g, "/");
    const j = readJson(f);
    if (!j) continue;
    if (j["minecraft:geometry"]) {
      for (const g of j["minecraft:geometry"]) {
        const id = g.description?.identifier;
        if (!id) { err(f, "geometry without description.identifier"); continue; }
        if (geos.has(id)) err(f, `duplicate geometry id ${id} (also in ${rel(geos.get(id).file)})`);
        const bones = new Map();
        for (const b of g.bones ?? []) {
          if (bones.has(b.name)) err(f, `${id}: duplicate bone name "${b.name}"`);
          bones.set(b.name, b);
        }
        geos.set(id, { file: f, bones, tw: g.description.texture_width, th: g.description.texture_height, inBlocks: r.startsWith("models/blocks/") });
      }
    } else if (j.format_version && /^1\.8|^1\.1[0-9]/.test(j.format_version) && Object.keys(j).some((k) => /^geometry\./.test(k))) {
      warn(f, "legacy 1.8.0 geometry format; read-only reference, don't author new models in it");
    }
    if (j.animations) for (const [id, a] of Object.entries(j.animations)) anims.set(id, { file: f, data: a });
    if (j.animation_controllers) for (const [id, c] of Object.entries(j.animation_controllers)) controllers.set(id, { file: f, data: c });
    if (j.render_controllers) for (const [id, c] of Object.entries(j.render_controllers)) renderCtrls.set(id, { file: f, data: c });
    if (j["minecraft:client_entity"]) clientEntities.push({ file: f, desc: j["minecraft:client_entity"].description ?? {}, fv: j.format_version });
    if (j["minecraft:attachable"]) clientEntities.push({ file: f, desc: j["minecraft:attachable"].description ?? {}, fv: j.format_version, attachable: true });
    if (r === "sounds/sound_definitions.json") for (const k of Object.keys(j.sound_definitions ?? j)) if (k !== "format_version") soundDefs.add(k);
    if (j.particle_effect?.description?.identifier) particleIds.add(j.particle_effect.description.identifier);
  }
}
for (const bp of bps) {
  for (const f of walk(bp.dir)) {
    if (extname(f) !== ".json") continue;
    const j = readJson(f);
    const id = j?.["minecraft:entity"]?.description?.identifier;
    if (id) { if (bpEntities.has(id)) err(f, `duplicate BP entity ${id}`); bpEntities.set(id, f); }
    // 1.26.10 split minecraft:pushable into pushable_by_entity / pushable_by_block and stopped parsing it:
    // the whole entity then fails to load ("not present in the Schema").
    const ent = j?.["minecraft:entity"];
    if (ent) for (const [where, comps] of [["components", ent.components], ...Object.entries(ent.component_groups ?? {}).map(([g, c]) => [`component_groups.${g}`, c])])
      if (comps?.["minecraft:pushable"] !== undefined) err(f, `${id}: ${where} has minecraft:pushable, which the game stopped parsing in 1.26.10 and the entity fails to load; use minecraft:pushable_by_entity (was is_pushable) and minecraft:pushable_by_block (was is_pushable_by_piston)`);
  }
}

// ---------- geometry checks ----------
for (const [id, g] of geos) {
  for (const b of g.bones.values()) {
    if (b.parent && !g.bones.has(b.parent)) err(g.file, `${id}: bone "${b.name}" has missing parent "${b.parent}"`);
    for (const c of b.cubes ?? []) {
      const s = c.size ?? [0, 0, 0];
      if (s.some((x) => x < 0)) err(g.file, `${id}: bone "${b.name}" has a cube with negative size ${JSON.stringify(s)} (renders inside-out)`);
      if (Array.isArray(c.uv) && g.tw && g.th) {
        const [u, v] = c.uv, [w, h, d] = s.map((x) => Math.ceil(Math.abs(x)));
        if (u + 2 * (w + d) > g.tw || v + d + h > g.th) warn(g.file, `${id}: bone "${b.name}" box UV at [${u},${v}] for size ${JSON.stringify(s)} runs off the ${g.tw}x${g.th} sheet`);
      }
    }
  }
}

// ---------- client entity checks ----------
const texRoots = rps.map((rp) => rp.dir);
// Vanilla resources a pack may reference without shipping them (built by build-vanilla-ids.mjs).
let VANILLA = { renderControllers: [], geometry: [], textures: [] };
try { VANILLA = JSON.parse(readFileSync(new URL("./vanilla-ids.json", import.meta.url), "utf8")); } catch {}
const vanillaRc = new Set(VANILLA.renderControllers), vanillaGeoIds = new Set(VANILLA.geometry), vanillaTex = new Set(VANILLA.textures);
function textureExists(path) {
  if (vanillaTex.has(path)) return "(vanilla)";
  for (const root of texRoots) for (const ext of [".png", ".tga", ".jpg", ".jpeg"]) { const f = join(root, path + ext); if (existsExactCase(f)) return f; }
  return undefined;
}
const usedControllerBy = new Map(); // controller id -> [{ entity, animKeys }]
for (const ce of clientEntities) {
  const d = ce.desc, f = ce.file, id = d.identifier;
  if (!id) { err(f, "client entity without identifier"); continue; }
  if (!ce.attachable && bps.length && !bpEntities.has(id) && !id.startsWith("minecraft:")) warn(f, `${id} has no BP entity with the same identifier`);
  const animKeys = new Set(Object.keys(d.animations ?? {}));
  if (d.scripts?.animate && vnum(ce.fv) < vnum("1.10.0")) err(f, `${id}: scripts.animate needs format_version 1.10.0 or later (file has ${ce.fv})`);
  if (d.animation_controllers && vnum(ce.fv) >= vnum("1.10.0")) err(f, `${id}: the animation_controllers field is 1.8.0-only; list controllers in animations + scripts.animate`);
  // textures
  for (const [k, p] of Object.entries(d.textures ?? {})) {
    if (/\.(png|tga)$/i.test(p)) err(f, `${id}: texture "${k}" path includes the extension: ${p}`);
    if (p.includes("\\")) err(f, `${id}: texture "${k}" path uses backslashes: ${p}`);
    const tf = textureExists(p.replace(/\.(png|tga)$/i, "").replace(/\\/g, "/"));
    if (!tf) { (p.startsWith("textures/") ? err : warn)(f, `${id}: texture "${k}" file not found with exact case: ${p}(.png)`); }
  }
  // geometry
  const geoIds = Object.values(d.geometry ?? {});
  for (const [k, gid] of Object.entries(d.geometry ?? {})) {
    const g = geos.get(gid);
    if (!g && !vanillaGeoIds.has(gid) && !gid.startsWith("geometry.humanoid") && !/^geometry\.(player|armor)/.test(gid)) err(f, `${id}: geometry "${k}" = ${gid} is not defined in any .geo.json`);
    if (g && d.textures) {
      for (const [tk, tp] of Object.entries(d.textures)) {
        const tf = textureExists(tp.replace(/\.(png|tga)$/i, ""));
        const sz = tf && tf !== "(vanilla)" && pngSize(tf);
        if (sz && g.tw && g.th && (sz[0] !== g.tw || sz[1] !== g.th) && Object.keys(d.textures).length === 1)
          warn(f, `${id}: ${tp} is ${sz[0]}x${sz[1]} but ${gid} declares texture_width/height ${g.tw}x${g.th}; UVs will rescale`);
      }
    }
  }
  // render controllers
  for (const rcRef of d.render_controllers ?? []) {
    const rcId = typeof rcRef === "string" ? rcRef : Object.keys(rcRef)[0];
    if (rcId === "controller.render.default" || (vanillaRc.has(rcId) && !renderCtrls.has(rcId))) continue;
    const rc = renderCtrls.get(rcId);
    if (!rc) { (rcId.includes(id.split(":")[0]) ? err : warn)(f, `${id}: render controller ${rcId} is not defined in this RP`); continue; }
    const txt = JSON.stringify(rc.data);
    for (const [, t] of txt.matchAll(/Texture\.(\w+)/g)) if (!(t in (d.textures ?? {}))) err(f, `${id}: render controller ${rcId} uses Texture.${t}, missing from the textures map`);
    for (const [, gk] of txt.matchAll(/Geometry\.(\w+)/g)) if (!(gk in (d.geometry ?? {}))) err(f, `${id}: render controller ${rcId} uses Geometry.${gk}, missing from the geometry map`);
    for (const [, mk] of txt.matchAll(/Material\.(\w+)/g)) if (!(mk in (d.materials ?? {}))) err(f, `${id}: render controller ${rcId} uses Material.${mk}, missing from the materials map`);
  }
  // animations map and animate list
  for (const [k, aid] of Object.entries(d.animations ?? {})) {
    const own = aid.includes(id.split(":")[0]);
    if (aid.startsWith("controller.animation.")) {
      if (!controllers.has(aid)) (own ? err : warn)(f, `${id}: animations.${k} = ${aid} is not defined in any animation_controllers file`);
      else { if (!usedControllerBy.has(aid)) usedControllerBy.set(aid, []); usedControllerBy.get(aid).push({ entity: id, animKeys, file: f }); }
    } else if (!anims.has(aid) && !/^animation\.(common|humanoid|quadruped|player|armor|agent|bow|crossbow|trident)\./.test(aid)) (own ? err : warn)(f, `${id}: animations.${k} = ${aid} is not defined in any .animation.json${own ? "" : " (fine if it is a vanilla animation)"}`);
    // bones used by own animations must exist in the entity's geometry
    const a = anims.get(aid);
    if (a && own && geoIds.length) {
      const boneSets = geoIds.map((g) => geos.get(g)).filter(Boolean).map((g) => new Set([...g.bones.keys()].map((n) => n.toLowerCase())));
      for (const bone of Object.keys(a.data.bones ?? {}))
        if (boneSets.length && !boneSets.some((s) => s.has(bone.toLowerCase()))) err(a.file, `${aid}: animates bone "${bone}" which is not in ${geoIds.join(", ")} (used by ${id})`);
    }
  }
  for (const entry of d.scripts?.animate ?? []) {
    const name = typeof entry === "string" ? entry : Object.keys(entry)[0];
    if (!animKeys.has(name)) err(f, `${id}: scripts.animate names "${name}", which is not a key of animations`);
  }
  for (const [k, v] of Object.entries(d.sound_effects ?? {})) if (soundDefs.size && !soundDefs.has(v)) warn(f, `${id}: sound_effects.${k} = ${v} is not in sounds/sound_definitions.json (fine if vanilla)`);
  for (const [k, v] of Object.entries(d.particle_effects ?? {})) if (!v.startsWith("minecraft:") && !particleIds.has(v)) err(f, `${id}: particle_effects.${k} = ${v} is not defined in any particle file`);
  // effect short names used in this entity's own animations
  for (const aid of Object.values(d.animations ?? {})) {
    const a = anims.get(aid); if (!a) continue;
    for (const [chan, map] of [["sound_effects", d.sound_effects], ["particle_effects", d.particle_effects]]) {
      const ev = a.data[chan]; if (!ev) continue;
      if (!Object.keys(ev).length) warn(a.file, `${aid}: empty ${chan} map`);
      for (const list of Object.values(ev)) for (const e of [].concat(list)) if (e?.effect && !(e.effect in (map ?? {}))) err(a.file, `${aid}: ${chan} effect "${e.effect}" is not a key of ${id}'s ${chan}`);
    }
  }
}

// ---------- items, blocks, attachables, lang ----------
const readTextureMap = (name) => {
  const m = new Map();
  for (const rp of rps) { const f = join(rp.dir, "textures", name); if (existsSync(f)) { const j = readJson(f); for (const [k, v] of Object.entries(j?.texture_data ?? {})) m.set(k, { file: f, v }); } }
  return m;
};
const itemTex = readTextureMap("item_texture.json"), terrainTex = readTextureMap("terrain_texture.json");
const texPaths = (v) => { const t = v?.textures; if (typeof t === "string") return [t]; if (Array.isArray(t)) return t.map((x) => (typeof x === "string" ? x : x?.path)).filter(Boolean); if (t && typeof t === "object") return [t.path].filter(Boolean); return []; };
for (const [m, kind] of [[itemTex, "item_texture.json"], [terrainTex, "terrain_texture.json"]])
  for (const [k, { file, v }] of m) for (const pth of texPaths(v)) if (!textureExists(pth)) err(file, `${kind}: "${k}" points at ${pth}(.png), which doesn't exist with exact case`);
const langKeys = new Set();
for (const rp of rps) { const f = join(rp.dir, "texts", "en_US.lang"); if (existsSync(f)) for (const line of readFileSync(f, "utf8").split(/\r?\n/)) { const k = line.split("=")[0].trim(); if (k && !k.startsWith("#") && !k.startsWith("##")) langKeys.add(k); } }
const scriptText = bps.flatMap((bp) => walk(bp.dir).filter((f) => /\.(m?js|ts)$/.test(f)).map((f) => readFileSync(f, "utf8"))).join("\n");
const registered = new Set([...scriptText.matchAll(/registerCustomComponent\(\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]));
const scriptsKnown = scriptText.length > 0;
const bpItems = new Map();
const vanillaGeo = new Set(["minecraft:geometry.full_block", "minecraft:geometry.full_cube", "minecraft:geometry.cross"]);
// Components that only work with an experiment on (as of Preview 26.60; keep in sync with
// skills/bedrock-experimental/references/experiments.md).
const EXPERIMENTAL = {
  "minecraft:enchantment_power_transmitter": "Upcoming Creator Features (format 1.26.60)",
  "minecraft:vibration_properties": "Upcoming Creator Features (format 1.26.60)",
  "minecraft:neighbor_change": "Upcoming Creator Features (format 1.26.60)",
  "minecraft:storage_item": "an experiment (marked [EXPERIMENTAL] in Mojang's definitions)",
  "minecraft:bundle_interaction": "an experiment (marked [EXPERIMENTAL] in Mojang's definitions)",
};
function experimentCheck(file, id, comps) {
  for (const [k, toggle] of Object.entries(EXPERIMENTAL)) if (comps?.[k] !== undefined) warn(file, `${id}: ${k} needs ${toggle}; keep it out of release builds`);
  const be = comps?.["minecraft:block_entity"];
  if (be?.entity_storage) warn(file, `${id}: block_entity.entity_storage needs Upcoming Creator Features`);
  if (be?.container) warn(file, `${id}: block_entity.container needs Upcoming Creator Features`);
  const cb = comps?.["minecraft:collision_box"];
  if ([cb].flat().some((b) => b && typeof b === "object" && ("min" in b || "max" in b))) warn(file, `${id}: collision_box min/max form needs Upcoming Creator Features; origin/size works without it`);
}
function customComponentCheck(file, id, comps) {
  experimentCheck(file, id, comps);
  for (const k of Object.keys(comps ?? {})) {
    if (k.startsWith("minecraft:") || !k.includes(":")) continue;
    if (scriptsKnown && !registered.has(k)) err(file, `${id}: custom component "${k}" is never registered with registerCustomComponent in the BP scripts`);
    if (!scriptsKnown) warn(file, `${id}: uses custom component "${k}" but the BP has no scripts to register it`);
  }
}
for (const bp of bps) for (const f of walk(bp.dir)) {
  if (extname(f) !== ".json") continue;
  const j = readJson(f);
  const it = j?.["minecraft:item"], bl = j?.["minecraft:block"];
  if (it) {
    const id = it.description?.identifier, c = it.components ?? {}, fv = j.format_version;
    if (!id) { err(f, "item without description.identifier"); continue; }
    bpItems.set(id, f);
    if (vnum(fv) >= vnum("1.26.30") && !Object.keys(c).length) err(f, `${id}: items at format ${fv} need at least one component`);
    if (c["minecraft:custom_components"] && vnum(fv) >= vnum("1.21.90")) err(f, `${id}: the minecraft:custom_components list is rejected from format 1.21.90; put each custom component id as a key`);
    const icon = c["minecraft:icon"];
    const iconKeys = typeof icon === "string" ? [icon] : icon?.textures ? Object.values(icon.textures) : icon?.texture ? [icon.texture] : [];
    for (const k of iconKeys) if (rps.length && !itemTex.has(k)) err(f, `${id}: icon "${k}" is not a key in RP textures/item_texture.json`);
    if (!icon && rps.length && !c["minecraft:block_placer"]) warn(f, `${id}: no minecraft:icon, so it shows as a missing texture`);
    const dn = c["minecraft:display_name"]?.value;
    if (dn && /\./.test(dn) && !/\s/.test(dn) && langKeys.size && !langKeys.has(dn)) warn(f, `${id}: display_name key "${dn}" is not in RP texts/en_US.lang`);
    customComponentCheck(f, id, c);
  }
  if (bl) {
    const id = bl.description?.identifier, fv = j.format_version;
    if (!id) { err(f, "block without description.identifier"); continue; }
    const groups = [bl.components ?? {}, ...(bl.permutations ?? []).map((p) => p.components ?? {})];
    for (const c of groups) {
      const geo = c["minecraft:geometry"], gid = typeof geo === "string" ? geo : geo?.identifier;
      if (gid && !vanillaGeo.has(gid)) { const g = geos.get(gid); if (!g) err(f, `${id}: geometry ${gid} is not defined in RP models/blocks`); else if (!g.inBlocks) err(f, `${id}: geometry ${gid} is in ${rel(g.file)}; block geometry must be under models/blocks`); }
      for (const [face, mi] of Object.entries(c["minecraft:material_instances"] ?? {})) {
        if (typeof mi === "string") continue; // alias to another instance
        if (mi?.texture && rps.length && !terrainTex.has(mi.texture)) err(f, `${id}: material_instances.${face}.texture "${mi.texture}" is not a key in RP textures/terrain_texture.json`);
      }
      const cb = c["minecraft:collision_box"];
      if (cb && typeof cb === "object" && !Array.isArray(cb) && vnum(fv) >= vnum("1.26.60")) err(f, `${id}: at format ${fv} minecraft:collision_box must be an array of boxes`);
      customComponentCheck(f, id, c);
    }
    const dn = bl.components?.["minecraft:display_name"];
    if (typeof dn === "string" && /\./.test(dn) && !/\s/.test(dn) && langKeys.size && !langKeys.has(dn)) warn(f, `${id}: display_name key "${dn}" is not in RP texts/en_US.lang`);
  }
}
for (const ce of clientEntities) {
  const id = ce.desc.identifier;
  if (ce.attachable) {
    const itemIds = ce.desc.item ? Object.keys(ce.desc.item) : [id];
    if (bps.length && id && !id.startsWith("minecraft:") && !itemIds.some((x) => x.startsWith("minecraft:") || bpItems.has(x))) warn(ce.file, `attachable ${id} has no BP item with that identifier${ce.desc.item ? " (or any id in its item field)" : ""}`);
  } else if (id && !id.startsWith("minecraft:") && langKeys.size && !langKeys.has(`entity.${id}.name`)) warn(ce.file, `${id}: no "entity.${id}.name" line in RP texts/en_US.lang`);
}

// ---------- Vibrant Visuals texture sets ----------
for (const rp of rps) {
  const sets = walk(rp.dir).filter((f) => f.endsWith(".texture_set.json"));
  if (!sets.length) continue;
  const caps = readJson(join(rp.dir, "manifest.json"))?.capabilities ?? [];
  if (!caps.includes("pbr")) warn(join(rp.dir, "manifest.json"), `${sets.length} texture set(s) but the manifest has no "capabilities": ["pbr"], so Vibrant Visuals ignores them`);
  for (const f of sets) {
    const ts = readJson(f)?.["minecraft:texture_set"];
    if (!ts) { err(f, "texture set without a minecraft:texture_set object"); continue; }
    if (!ts.color) err(f, "texture set needs a color layer");
    for (const [layer, v] of Object.entries(ts)) {
      if (typeof v !== "string" || v.startsWith("#")) continue; // uniform values ("#rrggbb" or arrays) need no file
      const p = join(dirname(f), v);
      if (![".png", ".tga", ".jpg", ".jpeg"].some((e) => existsExactCase(p + e))) err(f, `${layer} layer "${v}" has no image next to the texture set (exact case, no extension in the value)`);
    }
  }
}

// ---------- animation controllers ----------
for (const [cid, c] of controllers) {
  const states = c.data.states ?? {};
  if (!c.data.initial_state && !states.default) err(c.file, `${cid}: no initial_state and no "default" state`);
  if (c.data.initial_state && !(c.data.initial_state in states)) err(c.file, `${cid}: initial_state "${c.data.initial_state}" is not a state`);
  for (const [sn, s] of Object.entries(states)) {
    for (const t of s.transitions ?? []) for (const target of Object.keys(t)) if (!(target in states)) err(c.file, `${cid}: state "${sn}" transitions to unknown state "${target}"`);
    if (Object.keys(states).length > 1 && s.blend_transition === undefined) warn(c.file, `${cid}: state "${sn}" has no blend_transition, so it will snap`);
    for (const user of usedControllerBy.get(cid) ?? [])
      for (const an of s.animations ?? []) { const n = typeof an === "string" ? an : Object.keys(an)[0]; if (!user.animKeys.has(n)) err(c.file, `${cid}: state "${sn}" plays "${n}", which is not a key of ${user.entity}'s animations`); }
  }
}

// ---------- animations ----------
const timesOf = (ch) => (ch && typeof ch === "object" && !Array.isArray(ch)) ? Object.keys(ch).map(Number).filter((n) => !isNaN(n)) : [];
for (const [aid, a] of anims) {
  const A = a.data;
  for (const [bone, b] of Object.entries(A.bones ?? {})) {
    for (const chan of ["rotation", "position", "scale"]) {
      const ch = b[chan];
      if (ch === undefined) continue;
      if (chan === "scale" && typeof ch === "number") warn(a.file, `${aid}: ${bone}.scale is a bare number; write [x, y, z]`);
      const ts = timesOf(ch);
      // The game precomputes catmullrom curves, so their keys must be plain numbers; Molang there fails the whole
      // animation ("Precomputed cubic interpolation requires keyframes have constant data").
      if (ts.length) for (const [k, v] of Object.entries(ch)) {
        if (v?.lerp_mode !== "catmullrom") continue;
        const vals = ["pre", "post"].flatMap((p) => (v[p] === undefined ? [] : Array.isArray(v[p]) ? v[p] : [v[p]]));
        if (vals.some((x) => typeof x !== "number")) err(a.file, `${aid}: ${bone}.${chan} key ${k} is catmullrom but holds Molang (catmullrom keys must be numbers; make it linear or fold the value in)`);
      }
      if (ts.length && chan === "scale") for (const k of Object.keys(ch)) { const v = ch[k]; const val = v?.post ?? v; if (typeof val === "number") warn(a.file, `${aid}: ${bone}.scale key ${k} is a bare number; write [x, y, z]`); }
      if (A.loop === true && ts.length > 1 && typeof A.animation_length === "number") {
        const last = Math.max(...ts), first = Math.min(...ts);
        if (Math.abs(last - A.animation_length) > 0.001) warn(a.file, `${aid}: ${bone}.${chan} last key at ${last}s but animation_length is ${A.animation_length}s (loop seam)`);
        else if (first === 0) {
          const v0 = JSON.stringify(ch[Object.keys(ch).find((k) => Number(k) === 0)]?.post ?? ch[Object.keys(ch).find((k) => Number(k) === 0)]);
          const vL = JSON.stringify(ch[Object.keys(ch).find((k) => Number(k) === last)]?.pre ?? ch[Object.keys(ch).find((k) => Number(k) === last)]);
          if (v0 !== vL) warn(a.file, `${aid}: ${bone}.${chan} first and last keys differ (loop seam)`);
        }
      }
    }
  }
}

// ---------- report ----------
const errors = findings.filter((x) => x.level === "error"), warns = findings.filter((x) => x.level === "warn");
if (asJson) console.log(JSON.stringify({ packs: packs.map((p) => ({ dir: p.dir, kind: p.kind })), errors, warnings: warns }, null, 2));
else {
  console.log(`Checked ${packs.map((p) => `${p.kind} ${rel(p.dir)}`).join(", ")}`);
  console.log(`${geos.size} geometries, ${clientEntities.length} client entities, ${bpEntities.size} BP entities, ${anims.size} animations, ${controllers.size} controllers`);
  for (const x of [...errors, ...warns]) console.log(`${x.level === "error" ? "ERROR" : "warn "} ${rel(x.file)}: ${x.msg}`);
  console.log(errors.length || warns.length ? `\n${errors.length} errors, ${warns.length} warnings` : "\nNo problems found.");
}
process.exit(errors.length ? 1 : 0);
