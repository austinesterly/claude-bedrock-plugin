---
name: bedrock-world-templates
description: Use when building a Minecraft Bedrock world template or map instead of (or on top of) an add-on - .mctemplate and .mcworld files, adventure maps, minigame and parkour worlds, Marketplace-style worlds, bundling a BP/RP inside a world (world_behavior_packs.json, world_resource_packs.json), the world template manifest (lock_template_options, base_game_version, allow_random_seed), world icons and texts/, locking world options, maps that use custom dimensions, JSON UI, vanilla overrides or experiments, and updating packs inside a released world.
---

# World templates and maps

Checked 2026-10-07 against Microsoft Learn (Create a World Template, World Templates and Base Game Versioning, the manifest reference, Latest Platform Version Guidance, the cooperative add-on guidelines, Managing Village Generation, Texture Budgets, the Bedrock Editor pages), the Learn content forms (`world_template_manifest`, `packmanifest/header`, `world_packs`), Mojang's Minecraft Creator Tools 0.19.0 rules (`CWI`, `WPACKREFS`, `BASEGAMEVER`, `CHKMANIF`, `EXPFLAG`, `FORBFILE`) and the 26.30 to 26.60 changelogs. Target: stable 26.52. House rules: `bedrock-addon-conventions`.

## Add-on, world template or .mcworld?

| You ship | What the player gets | It allows | It doesn't allow |
|---|---|---|---|
| **Add-on** (`.mcaddon` / `.mcpack`) | Packs they add to any world, alongside other add-ons | New content in any world; Marketplace Add-Ons must be cooperative | Under the cooperative guidelines: no dimension files, no `ui/` (JSON UI) or `font/` overrides, no vanilla overrides, no experiments, avoid ticking areas, no starting area or structures placed without player interaction, no version lock |
| **World template** (`.mctemplate`) | A template under Create New > Imported Templates; each new world is a fresh copy | Your own map, spawn, game rules and bundled packs; `base_game_version` locks vanilla behaviour to a version; `lock_template_options` locks the world options; `allow_random_seed` for a seed-random start. Marketplace worlds "are typically world templates" | Experiments you turned on stay on in every copy; Marketplace content rules for worlds are partner-only (unverified here) |
| **World** (`.mcworld`) | One world added to the Play list | Share a save as it is; testers, friends, Realms uploads, servers | No template manifest: no option locking, no `base_game_version`, no fresh copy per play-through |

The cooperative rules come from Learn's guidelines and MCTools `CADDONREQ131`/`133`; they run in the cooperative add-on suite only. A world owns its packs, so "use these ideas in an entire world instead" (cooperative guidelines). What a world may contain, with sources: `references/experiments-and-features.md`.

## Folder at a glance

```
<world folder>/                 zip the CONTENTS, never the folder itself
  manifest.json                 world_template module (templates only)
  texts/en_US.lang              pack.name=...  pack.description=...
  texts/languages.json          ["en_US"]
  world_icon.jpeg               800x450 JPEG (Learn)
  level.dat  level.dat_old  levelname.txt  db/
  behavior_packs/<10 chars>/    resource_packs/<10 chars>/
  world_behavior_packs.json     world_resource_packs.json    [{ "pack_id", "version" }]
```

Every file and field, with sources and what is unverified: `references/structure.md`.

## Workflow

1. **Create the world in the game.** A world can't be generated from files: `level.dat` and `db/` come from the game. Use a dev world with cheats on, no experiments unless you accept them (`references/building-a-map.md`).
2. **Develop the packs** in `development_behavior_packs` / `development_resource_packs` (conventions section 6), activated on the dev world. Build terrain by hand, with structures, or in the Bedrock Editor.
3. **Set the world up for players**: game mode, game rules, `/setworldspawn`, ticking areas, the inventory you're holding (players receive it). Learn's parkour guide lists these.
4. **Copy the world out** of `minecraftWorlds` with the game closed, then build the template in a copy:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/world-template.mjs" init <world folder> --out <template folder> --packs <project>/packs --name "My Map" --description "..." --lock
   ```
   It copies the BP and RP into the world, merges `world_*_packs.json`, writes the manifest (fresh UUIDs, `[1, 0, 0]`, `lock_template_options`, `base_game_version`) and `texts/`. It refuses a folder without `level.dat` and a non-empty `--out`, and never touches the source.
5. **Pack and test**: `node "${CLAUDE_PLUGIN_ROOT}/scripts/world-template.mjs" pack <template folder>` writes `<name>.mctemplate` (`--mcworld` for a plain world). Import it on a clean profile, create a world from it, play it in multiplayer.
6. **Validate**: `npx mct validate -i <template folder> --single -o report` if the user has Creator Tools (house rules: only with their OK).

The `/bedrock-world` command walks a user through these steps.

## Rules that bite

- **Experiments are saved into the world.** A template made from a world with any toggle on ships with it on, and "Worlds that use experimental features cannot be restored to a non-experimental state" (Learn). `pack` warns when it can read the flags from `level.dat`. See `bedrock-experimental`.
- **Zip the contents.** "Do not try to zip the whole folder" (Learn); the extra folder stops the import.
- **Pack folders in the world: 10 characters or less** (Xbox path issue, Learn).
- **`pack_id` and `version` must match the bundled pack's header.** A reference to a pack that isn't bundled is an error (`WPACKREFS206`). When you update a pack, change the folder and the `version` together.
- **Same UUIDs fail to import** ("Failed to import"): move the old copy out of `world_templates` before re-importing.
- **`base_game_version`**: required by MCTools (`BASEGAMEVER100`), never below 1.13 (Learn), never above the current release (`BASEGAMEVER111`/`121`/`131`). Use the version you built and tested on.
- **`lock_template_options`**: the manifest reference calls it "required for any world templates"; it "will lock the player from modifying the options of the world".
- Budgets: under 2,000 texture handles for world templates (performance guide); World texture budget 750 MB at memory tier 1 (Texture Budgets).
- Scripts in a map run on the host for everyone. Never assume one player (`references/building-a-map.md`, `bedrock-shipping/references/multiplayer-and-servers.md`).

## References

- `references/structure.md`: every file in a world and template folder, the manifest fields, `world_*_packs.json`, `texts/`.
- `references/building-a-map.md`: dev world, packs, game rules, spawn, ticking areas, limiting the world, structures and Editor, script game logic (lobby, start, reset, per-player state, scoreboards), functions and `tick.json`, multiplayer testing.
- `references/experiments-and-features.md`: custom dimensions, JSON UI, vanilla overrides, experiments, ticking areas: what Learn says for add-ons, world templates and skin packs.
- `references/packaging-and-updates.md`: `.mctemplate` / `.mcworld`, versioning, updating packs in a released world, `base_game_version` semantics, the world icon size conflict, the Creator Tools world checks.

## Related skills

- `bedrock-shipping`: `.mcpack`/`.mcaddon` packaging, skin packs and subpacks (`references/skin-packs-and-templates.md`), Marketplace rules, Realms and BDS.
- `bedrock-world-content`: functions, `tick.json`, game rules, structures, jigsaw, pack settings.
- `bedrock-dimensions-biomes`: custom dimensions, vanilla dimension height files, biomes.
- `bedrock-ui`: script forms first; JSON UI only as decoration.
- `bedrock-scripting`: dynamic properties, scheduling, ticking areas from script.
- `bedrock-experimental`: what each toggle unlocks and whether it is stable yet.
