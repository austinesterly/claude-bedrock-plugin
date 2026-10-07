#!/usr/bin/env node
// Creates a new, working Bedrock add-on project: BP + RP with fresh UUIDs, current stable script
// module versions, a starter script, lang files, placeholder textures, a deploy helper, and
// optional starter content. No dependencies, Node 18+. Never overwrites an existing folder.
//
// Usage:
//   node new-addon.mjs <target dir> --name "My Add-on" --ns myns [--author "You"]
//        [--starter item,block,entity] [--add <template dir>]... [--no-script] [--min-engine 1.26.50] [--beta]
//   --beta targets the Preview build: beta Script API modules (needs the Beta APIs experiment)
//   and the Preview game version as min_engine_version. For test worlds only.
//
// --starter adds built-in examples (default: item,block,entity; pass --starter none for an empty pack).
// --add copies a template folder (one that holds BP/ and/or RP/, such as the templates in this
// plugin's skills) into the new packs, replacing the namespace "ns" with yours and merging
// item_texture.json, terrain_texture.json, sound_definitions.json, sounds.json and .lang files.

import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname, relative, extname, basename } from "node:path";
import { randomUUID } from "node:crypto";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const all = (k) => argv.flatMap((a, i) => (a === k ? [argv[i + 1]] : []));
const target = resolve(argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--"))) ?? "");
const name = opt("--name", "My Add-on");
const ns = (opt("--ns", "myns") || "").toLowerCase();
const author = opt("--author", "");
const starters = (opt("--starter", "item,block,entity") || "").split(",").map((s) => s.trim()).filter((s) => s && s !== "none");
const addTemplates = all("--add").map((p) => resolve(p));
const withScript = !argv.includes("--no-script");
const beta = argv.includes("--beta");
let minEngine = (opt("--min-engine", "1.26.50")).split(".").map(Number);

if (!argv.length || !target) { console.error("Usage: node new-addon.mjs <target dir> --name \"My Add-on\" --ns myns [--starter item,block,entity] [--add <template dir>]"); process.exit(2); }
if (!/^[a-z][a-z0-9_]{1,30}$/.test(ns) || ns === "minecraft" || ns === "minecraftedu") { console.error("--ns must be lower-case letters, digits or _, not 'minecraft'"); process.exit(2); }
if (existsSync(target) && readdirSync(target).length) { console.error(`${target} already exists and is not empty; pick a new folder.`); process.exit(2); }

// Current stable module versions: from the plugin's last refresh if available.
let serverV = "2.10.0", uiV = "2.2.0";
try {
  const snap = JSON.parse(readFileSync(join(here, "..", "skills", "bedrock-whats-new", "references", ".snapshot.json"), "utf8"));
  serverV = snap.tags?.["@minecraft/server"]?.latest ?? serverV;
  uiV = snap.tags?.["@minecraft/server-ui"]?.latest ?? uiV;
  if (beta) {
    // npm beta tags look like 2.12.0-beta.1.26.60-preview.30; the manifest wants 2.12.0-beta.
    const b = (p) => snap.tags?.[p]?.beta?.match(/^(\d+\.\d+\.\d+-beta)\.(\d+\.\d+\.\d+)/);
    const sb = b("@minecraft/server"), ub = b("@minecraft/server-ui");
    if (sb) { serverV = sb[1]; if (!argv.includes("--min-engine")) minEngine = sb[2].split(".").map(Number); }
    if (ub) uiV = ub[1];
    var betaTypings = { server: snap.tags["@minecraft/server"].beta, ui: snap.tags["@minecraft/server-ui"]?.beta };
  }
} catch {}

const BP = join(target, "packs", "BP"), RP = join(target, "packs", "RP");
const write = (file, data) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, typeof data === "string" ? data : JSON.stringify(data, null, 2) + "\n"); };

// ---- tiny PNG writer (placeholder art) ----
function crc32(buf) { let c, crc = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
function png(file, w, h, rgbFn) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; for (let x = 0; x < w; x++) { const [r, g, b, a = 255] = rgbFn(x, y); const o = y * (w * 4 + 1) + 1 + x * 4; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a; } }
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
}
// 5-tone bevel placeholder in the given hue.
const ramp = (r, g, b) => [[r * 0.55, g * 0.6, b * 0.7], [r * 0.75, g * 0.78, b * 0.85], [r, g, b], [Math.min(255, r * 1.12 + 10), Math.min(255, g * 1.12 + 10), Math.min(255, b * 1.08 + 12)], [Math.min(255, r * 1.25 + 25), Math.min(255, g * 1.25 + 25), Math.min(255, b * 1.2 + 30)]].map((c) => c.map(Math.round));
const bevel = (rgb) => { const t = ramp(...rgb); return (x, y, w = 16, h = 16) => (x === 0 || y === 0 ? t[4] : x === 1 || y === 1 ? t[3] : x === w - 1 || y === h - 1 ? t[0] : x === w - 2 || y === h - 2 ? t[1] : t[2]); };

// ---- manifests ----
const bpHeader = randomUUID(), rpHeader = randomUUID();
const version = [1, 0, 0];
const meta = author ? { metadata: { authors: [author] } } : {};
write(join(RP, "manifest.json"), {
  format_version: 2,
  header: { name: `${name} RP`, description: "pack.description", uuid: rpHeader, version, min_engine_version: minEngine },
  modules: [{ type: "resources", uuid: randomUUID(), version }],
  dependencies: [{ uuid: bpHeader, version }],
  ...meta,
});
write(join(BP, "manifest.json"), {
  format_version: 2,
  header: { name: `${name} BP`, description: "pack.description", uuid: bpHeader, version, min_engine_version: minEngine },
  modules: [{ type: "data", uuid: randomUUID(), version }, ...(withScript ? [{ type: "script", language: "javascript", entry: "scripts/main.js", uuid: randomUUID(), version }] : [])],
  dependencies: [{ uuid: rpHeader, version }, ...(withScript ? [{ module_name: "@minecraft/server", version: serverV }, { module_name: "@minecraft/server-ui", version: uiV }] : [])],
  ...meta,
});
png(join(BP, "pack_icon.png"), 64, 64, (x, y) => bevel([70, 140, 90])(x % 16, y % 16));
png(join(RP, "pack_icon.png"), 64, 64, (x, y) => bevel([80, 110, 170])(x % 16, y % 16));

// ---- lang ----
const lang = { BP: [`pack.name=${name} BP`, `pack.description=${name}`], RP: [`pack.name=${name} RP`, `pack.description=${name}`] };
const otherLang = { BP: {}, RP: {} }; // locale -> lines, from templates
const itemTextures = {}, terrainTextures = {};

// ---- starter content ----
if (starters.includes("item")) {
  write(join(BP, "items", `${ns}_gem.json`), {
    format_version: "1.26.30",
    "minecraft:item": {
      description: { identifier: `${ns}:gem`, menu_category: { category: "items" } },
      components: {
        "minecraft:display_name": { value: `item.${ns}.gem.name` },
        "minecraft:icon": { textures: { default: `${ns}_gem` } },
        "minecraft:max_stack_size": 64,
        ...(withScript ? { [`${ns}:announce`]: { message: "You used a gem!" } } : {}),
      },
    },
  });
  itemTextures[`${ns}_gem`] = { textures: `textures/items/${ns}_gem` };
  png(join(RP, "textures", "items", `${ns}_gem.png`), 16, 16, (x, y) => { const d = Math.abs(x - 7.5) + Math.abs(y - 7.5); return d > 7 ? [0, 0, 0, 0] : d > 5.5 ? [40, 90, 120] : d > 3 ? [70, 170, 210] : [180, 240, 255]; });
  lang.RP.push(`item.${ns}.gem.name=Gem`);
}
if (starters.includes("block")) {
  write(join(BP, "blocks", `${ns}_gem_block.json`), {
    format_version: "1.26.50",
    "minecraft:block": {
      description: { identifier: `${ns}:gem_block`, menu_category: { category: "construction" } },
      components: {
        "minecraft:display_name": `tile.${ns}.gem_block.name`,
        "minecraft:geometry": "minecraft:geometry.full_block",
        "minecraft:material_instances": { "*": { texture: `${ns}_gem_block`, render_method: "opaque" } },
        "minecraft:destructible_by_mining": { seconds_to_destroy: 1.5 },
        "minecraft:destructible_by_explosion": { explosion_resistance: 6 },
        "minecraft:map_color": "#46AAD2",
        "minecraft:tags": ["minecraft:is_pickaxe_item_destructible"],
      },
    },
  });
  terrainTextures[`${ns}_gem_block`] = { textures: `textures/blocks/${ns}_gem_block` };
  png(join(RP, "textures", "blocks", `${ns}_gem_block.png`), 16, 16, (x, y) => bevel([70, 170, 210])(x % 8 + (x >= 8 ? 0 : 0), y % 8, 8, 8));
  lang.RP.push(`tile.${ns}.gem_block.name=Gem Block`);
}
if (starters.includes("entity")) {
  const id = `${ns}:critter`, g = `geometry.${ns}.critter`;
  write(join(BP, "entities", "critter.json"), {
    format_version: "1.26.50",
    "minecraft:entity": {
      description: { identifier: id, is_spawnable: true, is_summonable: true },
      components: {
        "minecraft:type_family": { family: [`${ns}_critter`, "mob"] },
        "minecraft:health": { value: 10, max: 10 },
        "minecraft:collision_box": { width: 0.8, height: 0.9 },
        "minecraft:movement": { value: 0.23 },
        "minecraft:movement.basic": {},
        "minecraft:navigation.walk": { can_path_over_water: true, avoid_damage_blocks: true },
        "minecraft:jump.static": {},
        "minecraft:physics": {},
        "minecraft:pushable_by_entity": {},
        "minecraft:pushable_by_block": {},
        "minecraft:breathable": { total_supply: 15, suffocate_time: 0 },
        "minecraft:behavior.float": { priority: 0 },
        "minecraft:behavior.panic": { priority: 1, speed_multiplier: 1.25 },
        "minecraft:behavior.random_stroll": { priority: 6, speed_multiplier: 0.8 },
        "minecraft:behavior.look_at_player": { priority: 7, look_distance: 6 },
        "minecraft:behavior.random_look_around": { priority: 8 },
      },
    },
  });
  write(join(RP, "entity", "critter.entity.json"), {
    format_version: "1.10.0",
    "minecraft:client_entity": {
      description: {
        identifier: id,
        materials: { default: "entity_alphatest" },
        textures: { default: `textures/entity/${ns}_critter` },
        geometry: { default: g },
        render_controllers: ["controller.render.default"],
        spawn_egg: { base_color: "#C08A4E", overlay_color: "#5A3A1E" },
        scripts: { animate: ["idle", { walk: "math.clamp(q.modified_move_speed * 2.5, 0, 1)" }, "look_at_target"] },
        animations: { idle: `animation.${ns}.critter.idle`, walk: `animation.${ns}.critter.walk`, look_at_target: "animation.common.look_at_target" },
      },
    },
  });
  // Quadruped: root > body > head; four legs under root (see bedrock-blockbench rigging rules).
  const leg = (n, x, z) => ({ name: n, parent: "root", pivot: [x, 6, z], cubes: [{ origin: [x - 1.5, 0, z - 1.5], size: [3, 6, 3], uv: [0, 16] }] });
  write(join(RP, "models", "entity", "critter.geo.json"), {
    format_version: "1.12.0",
    "minecraft:geometry": [{
      description: { identifier: g, texture_width: 64, texture_height: 32, visible_bounds_width: 2, visible_bounds_height: 2, visible_bounds_offset: [0, 0.75, 0] },
      bones: [
        { name: "root", pivot: [0, 0, 0] },
        { name: "body", parent: "root", pivot: [0, 6, 0], cubes: [{ origin: [-4, 6, -6], size: [8, 6, 12], uv: [0, 0] }] },
        { name: "head", parent: "body", pivot: [0, 11, -6], cubes: [{ origin: [-3, 8, -11], size: [6, 6, 5], uv: [40, 0] }] },
        leg("leg0", -2.5, 4.5), leg("leg1", 2.5, 4.5), leg("leg2", -2.5, -4.5), leg("leg3", 2.5, -4.5),
      ],
    }],
  });
  write(join(RP, "animations", "critter.animation.json"), {
    format_version: "1.8.0",
    animations: {
      [`animation.${ns}.critter.idle`]: { loop: true, bones: { head: { rotation: ["1.5 - math.sin(q.life_time*360/3.5 - 40)*2", "math.sin(q.life_time*360/11)*6", 0] } } },
      [`animation.${ns}.critter.walk`]: {
        loop: true, anim_time_update: "query.modified_distance_moved",
        bones: {
          leg0: { rotation: ["math.sin(q.anim_time*38.17)*30", 0, 0] }, leg3: { rotation: ["math.sin(q.anim_time*38.17)*30", 0, 0] },
          leg1: { rotation: ["-math.sin(q.anim_time*38.17)*30", 0, 0] }, leg2: { rotation: ["-math.sin(q.anim_time*38.17)*30", 0, 0] },
        },
      },
    },
  });
  png(join(RP, "textures", "entity", `${ns}_critter.png`), 64, 32, (x, y) => bevel([192, 138, 78])(x % 16, y % 16));
  lang.RP.push(`entity.${id}.name=Critter`, `item.spawn_egg.entity.${id}.name=Spawn Critter`);
}

// ---- script ----
if (withScript) {
  write(join(BP, "scripts", "main.js"), `import { system, world, CommandPermissionLevel, CustomCommandStatus } from "@minecraft/server";

// Startup: register custom components and commands (world isn't loaded yet; no world calls here).
system.beforeEvents.startup.subscribe((init) => {
  init.itemComponentRegistry.registerCustomComponent("${ns}:announce", {
    onUse(e, { params }) {
      const player = e.source;
      system.run(() => player.sendMessage(String(params.message ?? "Used!")));
    },
  });

  init.customCommandRegistry.registerCommand(
    { name: "${ns}:hello", description: "Say hello from ${name}", permissionLevel: CommandPermissionLevel.Any },
    (origin) => {
      const who = origin.sourceEntity;
      system.run(() => world.sendMessage(\`Hello from ${name}\${who ? ", " + (who.nameTag || who.typeId) : ""}!\`));
      return { status: CustomCommandStatus.Success };
    },
  );
});

// World ready: start game logic here.
world.afterEvents.worldLoad.subscribe(() => {
  console.warn("[${ns}] loaded");
});
`);
  write(join(target, "jsconfig.json"), { compilerOptions: { module: "es2022", target: "es2021", checkJs: true, moduleResolution: "bundler" }, include: ["packs/BP/scripts/**/*.js"] });
  write(join(target, "package.json"), {
    name: ns.replace(/_/g, "-") + "-addon", private: true, type: "module",
    scripts: { check: `node "${join(here, "check-pack.mjs").replace(/\\/g, "/")}" packs`, deploy: "node tools/deploy.mjs", "deploy:preview": "node tools/deploy.mjs --preview", package: `node "${join(here, "package-addon.mjs").replace(/\\/g, "/")}" packs` },
    devDependencies: { "@minecraft/server": typeof betaTypings !== "undefined" ? betaTypings.server : serverV, "@minecraft/server-ui": typeof betaTypings !== "undefined" ? betaTypings.ui : uiV },
  });
}

// ---- templates (--add) ----
const mergeJson = (file, obj) => { const cur = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {}; deepMerge(cur, obj); write(file, cur); };
function deepMerge(a, b) { for (const [k, v] of Object.entries(b)) { if (v && typeof v === "object" && !Array.isArray(v) && a[k] && typeof a[k] === "object") deepMerge(a[k], v); else a[k] = v; } return a; }
const MERGE = new Set(["textures/item_texture.json", "textures/terrain_texture.json", "sounds/sound_definitions.json", "sounds.json", "blocks.json", "textures/flipbook_textures.json"]);
const renameNs = (s) => s.replace(/\bns([:._])/g, `${ns}$1`).replace(/\bns_/g, `${ns}_`).replace(/\/ns\//g, `/${ns}/`);
// Template manifests contribute only their extra sections (settings, subpacks, capabilities,
// metadata); the generated header, modules, UUIDs and dependencies stay. A format 3 template
// upgrades the generated manifest to format 3 (string versions).
function mergeManifest(file, tpl) {
  const m = JSON.parse(readFileSync(file, "utf8"));
  for (const [k, v] of Object.entries(tpl)) {
    if (["format_version", "header", "modules", "dependencies"].includes(k)) continue;
    m[k] = Array.isArray(v) && Array.isArray(m[k]) ? [...m[k], ...v.filter((x) => typeof x === "object" || !m[k].includes(x))] : v && typeof v === "object" && m[k] ? deepMerge(m[k], v) : v;
  }
  if (tpl.format_version === 3 && m.format_version !== 3) {
    const vs = (v) => (Array.isArray(v) ? v.join(".") : v);
    m.format_version = 3;
    m.header.version = vs(m.header.version); m.header.min_engine_version = vs(m.header.min_engine_version);
    for (const x of [...(m.modules ?? []), ...(m.dependencies ?? [])]) x.version = vs(x.version);
  }
  write(file, m);
}
function copyTemplate(dir) {
  for (const side of ["BP", "RP"]) {
    const src = join(dir, side);
    if (!existsSync(src)) continue;
    const dst = side === "BP" ? BP : RP;
    const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
    for (const f of walk(src)) {
      const r = relative(src, f).replace(/\\/g, "/");
      if (r === "manifest.json") { mergeManifest(join(dst, "manifest.json"), JSON.parse(renameNs(readFileSync(f, "utf8")))); continue; }
      // A template's own scripts/main.js becomes scripts/<template>.js, and every top-level
      // template script is imported from the add-on's main.js so it runs.
      let rr = r;
      if (side === "BP" && r === "scripts/main.js") rr = `scripts/${basename(dir).replace(/[^\w-]/g, "_")}.js`;
      if (side === "BP" && /^scripts\/[^/]+\.js$/.test(rr)) templateImports.push(`./${renameNs(rr.slice("scripts/".length))}`);
      const out = join(dst, renameNs(rr));
      const ext = extname(f).toLowerCase();
      if (ext === ".png" || ext === ".tga" || ext === ".ogg" || ext === ".fsb") { mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, readFileSync(f)); continue; }
      let txt = renameNs(readFileSync(f, "utf8"));
      if (ext === ".lang") {
        // Keep each locale separate; en_US lines go with the generated ones.
        const locale = basename(f, ".lang");
        const lines = txt.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("pack."));
        if (locale === "en_US") (side === "BP" ? lang.BP : lang.RP).push(...lines);
        else ((otherLang[side][locale] ??= [])).push(...lines);
        continue;
      }
      if (r === "texts/languages.json") continue;
      if (ext === ".json" && MERGE.has(r)) {
        const j = JSON.parse(txt);
        if (r.endsWith("item_texture.json")) Object.assign(itemTextures, j.texture_data ?? {});
        else if (r.endsWith("terrain_texture.json")) Object.assign(terrainTextures, j.texture_data ?? {});
        else mergeJson(out, j);
        continue;
      }
      if (existsSync(out)) console.warn(`template file replaced an existing file: ${relative(target, out)}`);
      write(out, txt);
    }
  }
}
const templateImports = [];
for (const t of addTemplates) { if (!existsSync(t)) { console.error(`template not found: ${t}`); process.exit(2); } copyTemplate(resolve(t)); }
if (templateImports.length) {
  const mainFile = join(BP, "scripts", "main.js");
  if (!withScript) console.warn("templates include scripts but --no-script was given: add a script module to the BP manifest to run them");
  const cur = existsSync(mainFile) ? readFileSync(mainFile, "utf8") : "";
  const lines = [...new Set(templateImports)].filter((i) => !cur.includes(`"${i}"`)).map((i) => `import "${i}";`);
  write(mainFile, `${lines.join("\n")}${lines.length ? "\n" : ""}${cur}`);
}

// ---- texture registries and lang ----
if (Object.keys(itemTextures).length) write(join(RP, "textures", "item_texture.json"), { resource_pack_name: ns, texture_name: "atlas.items", texture_data: itemTextures });
if (Object.keys(terrainTextures).length) write(join(RP, "textures", "terrain_texture.json"), { resource_pack_name: ns, texture_name: "atlas.terrain", padding: 8, num_mip_levels: 4, texture_data: terrainTextures });
for (const side of ["BP", "RP"]) {
  const dir = side === "BP" ? BP : RP;
  write(join(dir, "texts", "en_US.lang"), [...new Set(lang[side])].join("\n") + "\n");
  for (const [loc, lines] of Object.entries(otherLang[side])) write(join(dir, "texts", `${loc}.lang`), [...new Set([...lang[side].filter((l) => l.startsWith("pack.")), ...lines])].join("\n") + "\n");
  write(join(dir, "texts", "languages.json"), ["en_US", ...Object.keys(otherLang[side]).sort()]);
}

// ---- deploy helper ----
write(join(target, "tools", "deploy.mjs"), `// Copies packs/BP and packs/RP into Minecraft's development pack folders (Windows GDK builds).
// Usage: node tools/deploy.mjs [--preview]
import { cpSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appdata = process.env.APPDATA;
if (!appdata) { console.error("APPDATA is not set (this helper is for Windows)."); process.exit(1); }
const game = process.argv.includes("--preview") ? "Minecraft Bedrock Preview" : "Minecraft Bedrock";
const base = join(appdata, game, "Users", "Shared", "games", "com.mojang");
if (!existsSync(base)) { console.error("Not found: " + base + " (start the game once first)."); process.exit(1); }
for (const [src, dir] of [["BP", "development_behavior_packs"], ["RP", "development_resource_packs"]]) {
  const dst = join(base, dir, ${JSON.stringify(ns)} + "_" + src);
  rmSync(dst, { recursive: true, force: true });
  cpSync(join(root, "packs", src), dst, { recursive: true });
  console.log("Deployed " + src + " -> " + dst);
}
console.log("Re-enter the world to load JSON and resource changes; /reload is enough for script-only changes.");
`);
write(join(target, ".gitignore"), "node_modules/\n*.mcaddon\n*.mcpack\n");
write(join(target, "README.md"), `# ${name}

Bedrock add-on created with the Bedrock Add-on Kit.

- Namespace: \`${ns}\`
- Script modules: @minecraft/server ${serverV}, @minecraft/server-ui ${uiV}${withScript ? "" : " (no script module)"}
- Min engine: ${minEngine.join(".")}
${beta ? "- **Beta build:** uses beta Script API modules, so it loads only in the matching Minecraft Preview version, in a world with the Beta APIs experiment on. Use a separate test world: experiments can't be turned off again. Re-run the generator without --beta (or edit the manifest versions) for a release build.\n" : ""}
Test loop: run \`/bedrock-check packs\` in Claude Code (or \`node <plugin>/scripts/check-pack.mjs packs\`), then \`node tools/deploy.mjs\`, open a world, enable both packs, and read the content log. In game: \`/${ns}:hello\`${starters.includes("item") ? `, \`/give @s ${ns}:gem\`` : ""}${starters.includes("block") ? `, \`/give @s ${ns}:gem_block\`` : ""}${starters.includes("entity") ? `, \`/summon ${ns}:critter\`` : ""}.

Ship it: \`npm run package\` (or \`node <plugin>/scripts/package-addon.mjs packs\`) writes \`dist/<name>_BP.mcpack\`, \`dist/<name>_RP.mcpack\` and \`dist/<name>.mcaddon\`.

Keep the UUIDs in both manifests forever (saved world data is keyed to them); bump \`version\` for each release.
`);

console.log(`Created ${target}\n  BP ${relative(process.cwd(), BP)}\n  RP ${relative(process.cwd(), RP)}\n  modules: server ${serverV}, server-ui ${uiV}\n  starters: ${starters.join(", ") || "none"}${addTemplates.length ? `\n  templates: ${addTemplates.map((t) => relative(process.cwd(), t)).join(", ")}` : ""}`);
