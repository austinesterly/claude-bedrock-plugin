#!/usr/bin/env node
// Builds vanilla-ids.json (vanilla render controller, geometry, texture, biome, animation and animation controller ids)
// so check-pack.mjs doesn't flag references to vanilla resources. Source: Mojang's bedrock-samples resource pack.
// Usage: node build-vanilla-ids.mjs <bedrock-samples>/resource_pack [<older bedrock-samples>/resource_pack ...] [--label <text>]
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/Mojang/bedrock-samples.git
//   cd bedrock-samples && git sparse-checkout set --no-cone 'resource_pack/**/*.json'
// The ids come from the first (current) pack only: an id that exists only in an older release isn't in the game.
// Older packs (a tag such as v1.21.130.3) add only controller shapes, so a pack's renamed copy of a game controller
// from before a release split it (as 26.10 did for the baby mobs) is still recognised as the game's own design.
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const li = args.indexOf("--label");
const label = li >= 0 ? args.splice(li, 2)[1] : "";
const [rp, ...older] = args;
if (!rp || !existsSync(join(rp, "render_controllers"))) { console.error("Pass the path to bedrock-samples/resource_pack."); process.exit(2); }
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const strip = (t) => t.replace(/^﻿/, "").replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m, s) => s ?? "");
const read = (f) => { try { return JSON.parse(strip(readFileSync(f, "utf8")).replace(/,(\s*[}\]])/g, "$1")); } catch { return null; } };  // the game's files have trailing commas too
const rc = new Set(), geo = new Set(), tex = new Set(), biomes = new Set(), anim = new Set(), ctrl = new Set(), shapes = new Set();
// A controller's shape: its initial state and each state's name with the animation keys it plays (check-pack.mjs
// builds the same string for a pack's controllers).
const shapeOf = (c) => {
  const states = c?.states ?? {};
  const init = c?.initial_state ?? "default";
  const parts = Object.keys(states).sort().map((n) => `${n}:${(states[n]?.animations ?? []).map((a) => (typeof a === "string" ? a : Object.keys(a)[0])).sort().join(",")}`);
  return `${init}|${parts.join(";")}`;
};
for (const dir of older) for (const f of walk(join(dir, "animation_controllers")).filter((f) => f.endsWith(".json"))) {
  const j = read(f); if (!j) continue;
  for (const c of Object.values(j.animation_controllers ?? {})) if (Object.keys(c?.states ?? {}).length > 1) shapes.add(shapeOf(c));
}
for (const f of walk(rp).filter((f) => f.endsWith(".json"))) {
  const j = read(f); if (!j) continue;
  for (const k of Object.keys(j.render_controllers ?? {})) rc.add(k);
  for (const k of Object.keys(j.animations ?? {})) if (k.startsWith("animation.")) anim.add(k);
  for (const [k, c] of Object.entries(j.animation_controllers ?? {})) { ctrl.add(k); if (Object.keys(c?.states ?? {}).length > 1) shapes.add(shapeOf(c)); }
  for (const g of j["minecraft:geometry"] ?? []) if (g?.description?.identifier) geo.add(g.description.identifier);
  for (const k of Object.keys(j)) if (k.startsWith("geometry.")) geo.add(k.split(":")[0]);
  const d = j["minecraft:client_entity"]?.description ?? j["minecraft:attachable"]?.description;
  for (const t of Object.values(d?.textures ?? {})) if (typeof t === "string") tex.add(t);
  const bid = j["minecraft:client_biome"]?.description?.identifier;
  if (bid) biomes.add(bid);
  for (const v of Object.values(j.texture_data ?? {})) for (const t of [v?.textures].flat()) { const p = typeof t === "string" ? t : t?.path; if (p) tex.add(p); }
}
for (const t of read(join(rp, "textures", "texture_list.json")) ?? []) tex.add(t);
const out = { source: `Mojang/bedrock-samples resource_pack${label ? ` ${label}` : ""}`, built: new Date().toISOString().slice(0, 10), renderControllers: [...rc].sort(), geometry: [...geo].sort(), textures: [...tex].sort(), biomes: [...biomes].sort(), animations: [...anim].sort(), animationControllers: [...ctrl].sort(), controllerShapes: [...shapes].sort() };
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "vanilla-ids.json"), JSON.stringify(out));
console.log(`render controllers ${rc.size}, geometry ${geo.size}, textures ${tex.size}, biomes ${biomes.size}, animations ${anim.size}, animation controllers ${ctrl.size}, controller shapes ${shapes.size}`);
