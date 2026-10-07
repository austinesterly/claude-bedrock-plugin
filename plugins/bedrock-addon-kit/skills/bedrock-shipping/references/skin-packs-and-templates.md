# Skin packs and subpacks

Sources: Microsoft Learn "Introduction to Skin Packs" (SkinPack.md), "Packaging a Skin Pack" (PackagingASkinPack.md), "Comprehensive Pack Contents", "Create a World Template" (CreateAWorldTemplate.md), "World Templates and Base Game Versioning" (BaseGameVersioning.md), "Building Sub-Packs" (BuildingSubpacks.md), the manifest reference, and the MCTools rules `CSPJ`, `CWI`, `BASEGAMEVER`, `EXPFLAG`, `WPACKREFS`.

## Skin packs

### Layout

```
my_skin_pack/
  manifest.json        module "type": "skin_pack"
  skins.json
  <skin>.png           every skin texture at the pack root
  texts/
    en_US.lang
    languages.json
```

"They can be used only at the root of the skin pack" (Packaging a Skin Pack). Zip the contents (not the folder) as `.mcpack`; opening it imports into `skin_packs` in `com.mojang`. For local testing, Learn says to turn off Settings > General > "Only Allow Trusted Skins" if the game ignores the pack.

### manifest.json

Learn shows two shapes. Packaging a Skin Pack and Comprehensive Pack Contents use `"format_version": 1` with `"name": "pack.name"`; the newer Introduction to Skin Packs (2025) uses `"format_version": 2` with a literal name. Both have a header `uuid` and `version` and one module of `"type": "skin_pack"` with its own `uuid` and `version` ("two different UUIDs need to be generated"). The template here uses format 2.

### skins.json

| Field | Where | Rule |
|---|---|---|
| `serialize_name` | root | Same value as root `localization_name` (MCTools `CSPJ103`, error) |
| `localization_name` | root | Pack title key: `skinpack.<localization_name>`; also prefixed to each skin key |
| `skins` | root | Array, at most 80 entries (`CSPJ116`) |
| `localization_name` | skin | Skin name key: `skin.<pack localization_name>.<skin localization_name>` |
| `geometry` | skin | `geometry.humanoid.custom` (Steve/wide) or `geometry.humanoid.customSlim` (Alex/slim). "It's not possible to add custom models to skin packs at this time using the skin pack JSON capability." Unknown model targets are an error (`CSPJ115`) |
| `texture` | skin | PNG file name at the pack root. 64x64 or 128x128 (`CSPJ107`); one texture per skin (`CSPJ105` warns on duplicates); unreferenced PNGs warn (`CSPJ110`) |
| `type` | skin | `free` or `paid` |
| cape | skin | Capes are validated at 64x32 (`CSPJ106`). The skins.json field name for a cape: unverified |

Lang rules: every key used by skins.json needs a lang line (`CSPJ111`, error); keys must have no leading or trailing spaces (`CSPJ113`); unused keys warn (`CSPJ112`). Some properties are "only allowed for Minecraft Creator accounts" (`CSPJ108`; which ones: unverified).

Learn's Introduction to Skin Packs sample has skin `localization_name` "Sample Skin" but a lang key `skin.sample.skin_example`; those don't match. Follow Packaging a Skin Pack, where the key is built from the `localization_name` values.

Example in this skill: `../templates/skin-pack/` (one free wide-arm skin, namespace-prefixed names `ns_example` / `ns_explorer.png`). Generate new UUIDs before shipping; the ones in the file are examples.

## World templates

World templates (`.mctemplate`), maps and worlds with bundled packs have their own skill: `../../bedrock-world-templates/SKILL.md`. Folder layout and manifest fields are in its `references/structure.md`, packaging, `base_game_version`, icon size and updates in `references/packaging-and-updates.md`, and what a template may contain that an add-on may not in `references/experiments-and-features.md`. The `world-template.mjs` script builds and zips one.

## Subpacks

Field rules, layout and the pack-settings `label` text live in `../../bedrock-world-content/references/pack-settings.md`. Extra facts from Learn "Building Sub-Packs":

- Subpacks are resource-pack only (`RP/subpacks/<folder>/`); their files override the RP's base files.
- Keep folder names short ("so you don't run into any issues with the character limit").
- `name` and `text` "can't be translated".
- `memory_tier`: minimum RAM, each tier 250 MB; being replaced by `memory_performance_tier`.
- `memory_performance_tier`: "values range 1-5"; Learn's table calls it experimental and "requires manifest V3", while the manifest reference lists it as the format 3 field. `pack-settings.md` says 0-5; Learn's table only defines 1-5.
- Selection: the game picks the highest `memory_performance_tier` not above the device's tier. Players can choose a lower one. On a tie, the last listed subpack of that tier wins, so give each subpack its own tier.

| Memory performance tier | Platforms (Learn) | Memory tier | Memory (GB) |
|---|---|---|---|
| 1 | Nintendo Switch | 11 or less | 2-4 |
| 2 | PS4, PS4 Pro, Xbox One, Xbox One S, 60% of mobile | 12-16 | 4-5 |
| 3 | Xbox One X, Xbox Series S | 18-20 | 6-8 |
| 4 | Xbox Series X, PS5 | 24-28 | 8-12 |
| 5 | PS5 Pro, 70% of PC | 32 or more | over 12 |

Use subpacks for platform compatibility: ship a tier 1 subpack with small textures (256x256 or less for blocks and items) so Switch and low-end phones can run the pack, and higher tiers with full detail.

Which subpack a world records in `world_resource_packs.json`, and whether Realms or BDS remember the player's choice: unverified.
