---
name: bedrock-json-reference
description: Use when you need the exact fields, types, defaults or allowed values of any Bedrock JSON component (item, block, entity component or AI goal, filter, event, feature, biome, recipe, spawn rule, particle, camera, manifest, Molang query, command, JSON UI) instead of guessing.
---

# Bedrock JSON field reference

Generated from Mojang's official form definitions, which Microsoft Learn publishes in the `MicrosoftDocs/minecraft-creator` repository (`content/forms`). These are the same definitions Minecraft Creator Tools uses to validate packs. See `references/INDEX.md` for the file list.

## How to use

1. Don't read these files whole; they're large. Search for the id: `Grep "### minecraft:durability" references/items.md` and read that section, then any sub-object it links (`See item/...` names a sub-object documented further down the same file, or in `misc.md`).
2. Fields marked **required** must be present. A `since` version tells you the minimum format_version that knows the component or field.
3. Combine this with the task skills, which explain how components fit together: `bedrock-items`, `bedrock-blocks`, `bedrock-entity-behavior`, `bedrock-world-content`, `bedrock-dimensions-biomes`, `bedrock-ui`, `bedrock-experimental`.
4. If a component isn't listed, it may be new: check `../bedrock-whats-new/references/changelog-digest.md` and Microsoft Learn before using it.

| Need | File |
|---|---|
| Item components | `references/items.md` |
| Block components, states, traits, material instances | `references/blocks.md` |
| Entity components | `references/entity-components.md` |
| AI goals (`minecraft:behavior.*`) | `references/entity-ai-goals.md` |
| Filters (`test`, `subject`, `operator`), events, actions | `references/entity-filters-and-events.md` |
| Features, feature rules, biomes, jigsaw, structures, dimensions | `references/worldgen.md` |
| Recipes, spawn rules, trade tables | `references/recipes-spawn-trade.md` |
| Particles, camera presets, visuals, client resources | `references/client-visuals.md` |
| Manifest fields | `references/manifest.md` |
| Molang queries and math | `references/molang.md` |
| Commands and their parameters | `references/commands.md` |
| JSON UI element types | `references/json-ui.md` |
| Shared sub-objects (ranges, descriptors, triggers) | `references/misc.md` |

## Refreshing

`/bedrock-refresh` re-downloads `content/forms` (git sparse checkout of the official docs repo) and rebuilds these files with `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-json-reference.mjs" <content/forms> --out <dir>`.
