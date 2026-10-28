#!/usr/bin/env node
// Builds vanilla-ids.json (vanilla render controller, geometry, texture and biome ids) so check-pack.mjs
// doesn't flag references to vanilla resources. Source: Mojang's bedrock-samples resource pack.
// Usage: node build-vanilla-ids.mjs <bedrock-samples>/resource_pack
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/Mojang/bedrock-samples.git
//   cd bedrock-samples && git sparse-checkout set --no-cone 'resource_pack/**/*.json'
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rp = process.argv[2];
if (!rp || !existsSync(join(rp, "render_controllers"))) { console.error("Pass the path to bedrock-samples/resource_pack."); process.exit(2); }
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const strip = (t) => t.replace(/^﻿/, "").replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m, s) => s ?? "");
const read = (f) => { try { return JSON.parse(strip(readFileSync(f, "utf8"))); } catch { return null; } };
const rc = new Set(), geo = new Set(), tex = new Set(), biomes = new Set();
for (const f of walk(rp).filter((f) => f.endsWith(".json"))) {
  const j = read(f); if (!j) continue;
  for (const k of Object.keys(j.render_controllers ?? {})) rc.add(k);
  for (const g of j["minecraft:geometry"] ?? []) if (g?.description?.identifier) geo.add(g.description.identifier);
  for (const k of Object.keys(j)) if (k.startsWith("geometry.")) geo.add(k.split(":")[0]);
  const d = j["minecraft:client_entity"]?.description ?? j["minecraft:attachable"]?.description;
  for (const t of Object.values(d?.textures ?? {})) if (typeof t === "string") tex.add(t);
  const bid = j["minecraft:client_biome"]?.description?.identifier;
  if (bid) biomes.add(bid);
  for (const v of Object.values(j.texture_data ?? {})) for (const t of [v?.textures].flat()) { const p = typeof t === "string" ? t : t?.path; if (p) tex.add(p); }
}
for (const t of read(join(rp, "textures", "texture_list.json")) ?? []) tex.add(t);
const out = { source: "Mojang/bedrock-samples resource_pack", built: new Date().toISOString().slice(0, 10), renderControllers: [...rc].sort(), geometry: [...geo].sort(), textures: [...tex].sort(), biomes: [...biomes].sort() };
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "vanilla-ids.json"), JSON.stringify(out));
console.log(`render controllers ${rc.size}, geometry ${geo.size}, textures ${tex.size}, biomes ${biomes.size}`);
