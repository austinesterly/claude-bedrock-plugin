# What a world template can do that an add-on can't

The cooperative add-on guidelines forbid several things in Marketplace Add-Ons because they "don't scale to being cooperatively overridden" (`../../bedrock-shipping/references/marketplace.md`). A world template owns its world and its packs, so that reason does not apply to it. This file lists, per feature, what Learn and Creator Tools say for add-ons, for world templates and for skin packs.

Source keys:
- **[COOP]** Learn: Guidelines for Building Cooperative Add-Ons, https://learn.microsoft.com/en-us/minecraft/creator/documents/practices/guidelinesforbuildingcooperativeaddons
- **[WT]** Learn: Create a World Template; **[BGV]** Learn: World Templates and Base Game Versioning; **[MAN]** Learn: manifest reference
- **[VIL]** Learn: Managing Village Generation (2026-04-14), https://learn.microsoft.com/en-us/minecraft/creator/documents/managing-villages
- **[DDOH]** Learn: Data-Driven Overworld Height and Void Generation
- **[EDIM]** Learn: Bedrock Editor Custom Dimensions (2026-05-18)
- **[EXP]** Learn: Experimental Features in Minecraft: Bedrock Edition (2025-05-12)
- **[SKIN]** Learn: Packaging a Skin Pack; Introduction to Skin Packs
- **[VAL]** Creator Tools rules (Learn: MCTools Validation Rules Reference and npm `@minecraft/creator-tools` 0.19.0)
- **[TB]** Learn: Texture Budgets (2025-09-26); **[PERF]** Learn: Improving Performance and Resource Usage

## Summary

| Feature | Cooperative Add-On | World template | Skin pack | Plugin skill |
|---|---|---|---|---|
| Custom dimensions, vanilla dimension files | Not allowed ([COOP], `CADDONREQ131` error) | No rule against it on Learn; Learn documents void and height-limited worlds through `dimensions/overworld.json` [DDOH] and dimension creation in Editor projects [EDIM]. Marketplace review rules: unverified | Not applicable (no behavior content) | `bedrock-dimensions-biomes` |
| JSON UI (`RP/ui/`), fonts (`RP/font/`) | Not allowed ([COOP], `CADDONREQ133` error) | No rule on Learn. Creator Tools blocks only `ui/mcoin.png` and `/contents.json` in world templates (`FORBFILE103`). Marketplace review rules: unverified | `ui/mcoin.png` blocked (`FORBFILE103`) | `bedrock-ui` |
| Vanilla overrides (biomes, entities, loot) | Not allowed [COOP]; `minecraft:` ids warn (`STRICT100`/`104`) | Learn's village guide overrides vanilla biome files and marks World Templates "Yes", Add-Ons "No" [VIL]. `STRICT` warnings still appear | Not applicable | `bedrock-dimensions-biomes`, `bedrock-world-content` |
| Experiments | "Add-Ons should not use or rely on Experimental features" [COOP] | Saved into the world; every copy has them. `EXPFLAG101` warns; "For publishing, create a new world without experiments enabled" | Not applicable | `bedrock-experimental` |
| Ticking areas | "avoid using ticking areas" [COOP] | Allowed; 10 per world with `/tickingarea` | Not applicable | `building-a-map.md` |
| Starting area, structures placed without player action | Use "an entire world instead" [COOP] | That is what a map is | Not applicable | `bedrock-world-content` |
| Version lock | None; add-ons must keep working on newer versions [COOP] | `base_game_version` [BGV] | "Base game versioning does not affect texture packs or skin packs" [BGV] | `packaging-and-updates.md` |
| Lock world options | Not applicable | `lock_template_options` [MAN] | Not applicable | `structure.md` |

## Custom dimensions

- **Add-ons**: "You should not add a dimension file to your Add-On" and do not use "custom dimension sizes" [COOP]. `CADDONREQ131`: "Cooperative Add-Ons should not contain dimension-related elements." The `CADDONREQ` rules belong to Creator Tools' cooperative add-on suite; a default `mct validate` of a world template does not run them (checked on a test template).
- **World templates**: Learn's Data-Driven Overworld Height page uses a behavior pack file `dimensions/overworld.json` (`"identifier": "minecraft:overworld"`, `minecraft:dimension_bounds` `min`/`max`, `minecraft:generation` `"generator_type": "void"`) to make void maps or cap the height, "to reduce memory usage" [DDOH]. That page does not mention templates or Marketplace, and its file uses format 1.18.0; current status of that file format on 26.x: see `../../bedrock-dimensions-biomes/references/dimensions.md`.
- Custom dimensions (`dimensionRegistry.registerCustomDimension`, JSON `BP/dimensions/*.json` with `minecraft:dimension_height`) are **Stable** since 26.30 / 26.50 (`bedrock-dimensions-biomes`). The Editor's Custom Dimensions panel creates them in a project; "You can't delete a dimension from your world once you add it" [EDIM].
- The dimension id is the save key for its chunks. Pick it once; renaming it in an update orphans what players built (`bedrock-dimensions-biomes`).
- Whether Marketplace world submissions may include dimension files: **unverified** (partner guidelines are not public).

## JSON UI

- **Add-ons**: "Do not override UI files (resource packs/ui)"; "JSON UI (i.e., files in <resource pack name>/ui) and fonts (i.e., files in <resource pack name>/font) are not overridable in a cooperative manner" [COOP]. `CADDONREQ133`: "Cooperative Add-Ons should not contain custom UI elements."
- **World templates**: Learn has no statement either way. Creator Tools' forbidden-file list for world templates allows every extension and blocks only `ui/mcoin.png` and `/contents.json`; bundled resource packs are also checked as resource packs, which block `ui/mcoin.png`, `font/emoticons.json`, `/shaders` and `Contents.json` among others (`FORBFILE102`/`103`, `CheckForbiddenFilesData`).
- Learn's Latest Platform Version page lists JSON UI (`ui` folder) with "(no versioning concept)", so a format version does not protect it from game updates. The plugin's `bedrock-ui` skill treats JSON UI as not a stable creator feature, replaced screen by screen by Ore UI. Even in a map, keep script forms as the working path and JSON UI as decoration that can be deleted.
- Whether Marketplace worlds may ship `RP/ui/` changes: **unverified**.

## Vanilla overrides

- **Add-ons**: no overriding vanilla entities, items, blocks, loot, recipes, client biome files, vanilla lang strings, sounds or music; no scripting that disables vanilla gameplay [COOP].
- **World templates**: [VIL] overrides vanilla biome definitions in a behavior pack (removing `minecraft:village_type`) and lists support as World Templates: Yes, Dynamic Worlds: Yes, Add-Ons: No. It warns: "Since this pack overwrites biomes, creators will need to keep their biome files up to date with the current Minecraft release". Villages are placed at world creation, so the override must be active "before world creation starts"; in an existing world it only affects new chunks.
- `base_game_version` loads vanilla resources only up to that version [BGV], which is what keeps a vanilla override in a template consistent with the vanilla files it replaced.
- Other vanilla overrides in a template (mobs, loot, `minecraft:player`): Learn documents no rule for templates; Creator Tools still warns (`STRICT100`, `STRICT104`). Treat them as allowed for your own world, review status unverified.

## Experiments

- Learn: "Worlds that use experimental features cannot be restored to a non-experimental state." "If you're planning to build content that you want to share with the community, it would be best to do it in a non-experimental world." Turning an experiment on in an existing world makes a "Copy of ..." world first [EXP].
- The toggles are stored in the world's `level.dat` (the `experiments` compound, with `experiments_ever_used` and `saved_with_toggled_experiments` flags; Creator Tools `WorldLevelDat`). A template made from that world **ships with the experiments on**, and every world created from it has them.
- `EXPFLAG101` (warning, world templates): "an experimental flag is or was enabled in the world. Some experiments permanently modify world data even after being turned off. ... For publishing, create a new world without experiments enabled." `SHARING100`: custom capabilities such as experiments and Beta APIs "may limit where content can be shared".
- Beta script modules (`2.x.0-beta`) need the Beta APIs experiment (`gametest` in `level.dat`), so a map that uses one carries the experiment too. `world-template.mjs` warns about both.
- Which toggle a feature needs, and whether it graduated: `bedrock-experimental` (`references/experiments.md`, `../../bedrock-whats-new/references/experimental-changelog.md`). If a feature graduates, rebuild the map in a new world without the toggle; you can't remove it from the old one.
- An experimental map is still fine to share yourself (`.mcworld`, Realms, servers) if players accept the warning. For Marketplace-style templates, ship without experiments.

## Performance budgets for worlds

- "For World Templates, we recommend staying under 2,000 texture handles" (add-ons: 800) [PERF].
- Texture budgets by memory performance tier, World column: 750 MB (tier 1), 1 GB (2), 1.5 GB (3), 3 GB (4), 4 GB (5). "Mashups separately measure the resource pack against the Texture budget, and the world template + resource pack against the World budget" [TB].

## Skin packs

What Learn says, for comparison:
- One module of type `skin_pack`; textures only at the pack root; "it's not possible to add custom models to skin packs at this time using the skin pack JSON capability" [SKIN].
- Base game versioning does not affect them [BGV].
- Creator Tools allows only `.json`, `.lang`, `.png`, `.tga`, `.jpg`, `.jpeg`, `.mcstructure` in skin packs and blocks `ui/mcoin.png` and `/contents.json` (`FORBFILE102`/`103`).
- Skin pack rules in full: `../../bedrock-shipping/references/skin-packs-and-templates.md`.
