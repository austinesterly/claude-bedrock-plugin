---
name: bedrock-shipping
description: Use when shipping a Minecraft Bedrock add-on - packaging .mcpack/.mcaddon/.mcworld/.mctemplate, versioning and updates, pack icons, localization/translations, Marketplace submission and guidelines, skin packs, world templates, subpacks, multiplayer/Realms/Bedrock Dedicated Server testing, pack compatibility across platforms.
---

# Shipping a Bedrock add-on

Checked 2026-10-06 against the Microsoft Learn creator docs (cooperative add-on guidelines, performance guide, MCTools validation rules, skin pack, world template, subpack, localization and Bedrock Dedicated Server pages), Mojang's `@minecraft/core-build-tasks` 5.7.0, the vanilla `texts/` folder, `@minecraft/server` 2.10.0 typings and the changelogs 26.40 to 26.60.30. Target: stable 26.52, no experiments. House rules live in `bedrock-addon-conventions`; this skill does not repeat them.

## Package it

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" packs          # fix errors first
node "${CLAUDE_PLUGIN_ROOT}/scripts/package-addon.mjs" packs --name MyAddon
```
`package-addon.mjs` finds the BP and RP by `manifest.json` and writes `dist/MyAddon_BP.mcpack`, `dist/MyAddon_RP.mcpack` and `dist/MyAddon.mcaddon` (the two .mcpack files at its root, the same layout as Mojang's `just-scripts mcaddon` task). It never writes into the packs. It skips dotfiles, `node_modules`, `.git`, `*.md`, `Thumbs.db` and `desktop.ini`, and warns about beta modules, a missing `pack_icon.png`, BP/RP dependency versions that don't match the other pack's header, a missing `min_engine_version`, and `$` in paths. Double-click the `.mcaddon` to import both packs.

| File | What it is | Layout |
|---|---|---|
| `.mcpack` | one zipped BP, RP or skin pack | the pack's files at the zip root (`manifest.json` at the top, no wrapping folder) |
| `.mcaddon` | several packs (or worlds) in one file | `.mcpack` / `.mcworld` files at the zip root |
| `.mcworld` | an exported world | world files at the root: `db/`, `level.dat`, `levelname.txt`, `world_icon.jpeg`, plus embedded packs |
| `.mctemplate` | a world template | a world plus `manifest.json` (`world_template` module) and `texts/` |
| `.mcproject` | Bedrock Editor project | opens only in Editor; exporting to .mcworld drops Editor extensions |

Details, embedded world packs and the release checklist: `references/packaging.md`.

## Rules that decide whether an update works

1. **Never change a UUID** after the first public build. Header and module UUIDs identify the pack; world dynamic properties and block dynamic properties are keyed to the manifest (header) UUID. A new UUID is a new pack and orphans saved data.
2. **Bump `header.version` on every release**, in both packs, and update each pack's dependency on the other to the new version. Use MAJOR.MINOR.PATCH meaning (Learn: Add-On Development Workflow).
3. **Never change the namespace or remove a type.** Removing an entity type removes every instance from existing worlds; keep old types working and add new ones (Learn: cooperative guidelines, Versioning).
4. Set `min_engine_version` on both packs. Keep `base_game_version` for world templates only.
5. Ship no experiments, no `-beta` modules and no `use_beta_features`. A world that ever turned an experiment on keeps it.

## Localization

Every pack has `texts/languages.json` (must list `en_US`) and one `<code>.lang` per listed code, e.g. `es_ES.lang`. Lang lines are `key=value`, UTF-8 without BOM, no quotes, comments after a tab (`key=value<TAB>### note for translators`). Always give items and blocks an explicit `minecraft:display_name` key. Scripts send `{ translate: "ns.key", with: [...] }` so each player sees their own language. Full key list, the 29 locale codes and a safe translation workflow: `references/localization.md`. Example files: `templates/localization/` (add it with `new-addon.mjs --add`, which keeps each locale's file and lists every locale in `languages.json`).

## Marketplace and cooperative add-ons

Marketplace "Add-Ons" follow Microsoft Learn's **Guidelines for Building Cooperative Add-Ons** and the MCTools validation rules. The short version:
- one BP plus one RP, each depending on the other, no other dependencies; RP manifest `"pack_scope": "world"`
- one namespace for everything, unique per add-on, never `minecraft:`; content in `<type>/<creator>/<pack>/` folders, no loose files
- no experiments or beta flags, no `runtime_identifier`, no vanilla overrides (including `minecraft:player`), no dimension files, no `ui/` or `font/` files, no client biome overrides, no vanilla lang or sound overrides
- about 25 MB uncompressed and 2,500 to 3,500 files at most, under 800 texture handles
- a guide book spawned once per player; chat messages of 28 characters or less

This collides with two things people want: **custom dimensions** (`CADDONREQ131` rejects dimension elements in a cooperative add-on) and **JSON UI** (`CADDONREQ133`). Build those as a world or world template, not as a cooperative add-on. Every rule with its source, and what is unverified: `references/marketplace.md`.

## Skin packs, world templates, subpacks

- Skin pack: `manifest.json` (`skin_pack` module), `skins.json`, PNG skins at the pack root, `texts/en_US.lang` with `skinpack.<name>` and `skin.<name>.<skin>`. Max 80 skins; 64x64 or 128x128 textures.
- World template: exported world + `manifest.json` (`world_template` module, `base_game_version`, optional `lock_template_options`, `allow_random_seed`) + `texts/` with `pack.name` and `pack.description`. Embedded pack folder names 10 characters or less.
- Subpacks: see `../bedrock-world-content/references/pack-settings.md`; the platform tier table is in `references/skin-packs-and-templates.md`.
- Example skin pack: `templates/skin-pack/` (replace the UUIDs and add your PNG).

## Multiplayer, Realms and Bedrock Dedicated Server

Scripts run on the host (the server), never on the joining clients. Test every add-on with at least two players before release:
1. LAN: host a world with the packs active; a second device on the same network joins it.
2. Bedrock Dedicated Server from https://www.minecraft.net/download/server/bedrock (download it yourself; this plugin never downloads executables). Copy a world that already has the packs and experiments set into `worlds/`, set `level-name`, put the packs in the world's `behavior_packs/`/`resource_packs/` (or the server's shared folders).
3. Realms: upload a world that has the packs active to the realm (Learn: Getting Started). The BDS-only experimental modules (`@minecraft/server-admin`, `@minecraft/server-net`) cannot be used on Realms.

Per-player state keyed by `player.id`, late joiners initialised on `playerSpawn` with `initialSpawn`, clean-up on `playerLeave`, and the BDS-only `@minecraft/server-admin` / `@minecraft/server-net` setup (`config/<module uuid>/permissions.json`, `variables.json`, `secrets.json`): `references/multiplayer-and-servers.md`.

## Release checklist (short)

1. `check-pack.mjs` clean; content log clean in a fresh world on the current stable game and in Preview.
2. Versions bumped in both headers and both cross-dependencies; UUIDs unchanged.
3. `pack_icon.png` (square PNG, 256x256 recommended by MCTools) in each pack.
4. `en_US.lang` complete, every language in `languages.json` has a file.
5. Tested with two players (LAN or BDS) and with one other add-on stacked.
6. Upgrade test: open a world saved with the previous release, confirm nothing vanished.
7. `package-addon.mjs`, then import the `.mcaddon` on a clean profile.

## References

- `references/packaging.md`: formats, icons, versions and UUIDs, embedded packs, dependencies, checklist.
- `references/localization.md`: languages.json, lang syntax, keys, RawMessage, translation workflow.
- `references/marketplace.md`: Partner Program, cooperative rules and validation IDs with sources.
- `references/skin-packs-and-templates.md`: skins.json and subpack tiers. World templates have their own skill: `bedrock-world-templates`.
- `references/multiplayer-and-servers.md`: LAN, Realms, BDS, server.properties, permissions, multiplayer scripts.
