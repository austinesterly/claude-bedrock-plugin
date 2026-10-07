# Marketplace and cooperative add-on rules

What Microsoft and Mojang publish openly about Marketplace content. Each rule names its source. Anything marked **unverified** has no official public source we could find; confirm it with the Partner Program before relying on it.

Source keys used below:
- **[PP]** Minecraft Partner Program page, https://www.minecraft.net/en-us/partner
- **[COOP]** Learn: Guidelines for Building Cooperative Add-Ons, https://learn.microsoft.com/en-us/minecraft/creator/documents/practices/guidelinesforbuildingcooperativeaddons
- **[PERF]** Learn: Improving Performance and Resource Usage, https://learn.microsoft.com/en-us/minecraft/creator/documents/practices/improvingperformanceandresourceusage
- **[VAL]** Learn: MCTools Validation Rules Reference (rule IDs such as `CADDONREQ131`), https://learn.microsoft.com/en-us/minecraft/creator/reference/content/mctoolsvalreference/validationrulesindex
- **[LJ]** Learn: Creator Learning Journey; **[WT]** Learn: Create a World Template; **[BGV]** Learn: World Templates and Base Game Versioning; **[SKIN]** Learn: Packaging a Skin Pack; **[OPT]** Learn: Pack Optimization with Bedrock Dedicated Server; **[ADW]** Learn: Add-On Development Workflow.

## The creator program

| Fact | Source |
|---|---|
| Selling on the Marketplace requires being an official partner in the Minecraft Partner Program. | [PP] "As an official partner, you'll get to sell your creations" |
| Criteria: "Proven Experience" (a portfolio of high quality, original content shared with the community: maps, skin packs, texture packs, hosted servers, add-ons, or Realms content), "A Love For Minecraft", "A Drive to Create", "A Business Mindset" (operate like a business; submit key art, screenshots, trailers and descriptions, also needed for the application). | [PP] |
| "The best way to get your foot in the door with the Marketplace is through our publishers", i.e. working with an existing official publishing partner. | [PP] |
| "Every new submission is reviewed for quality and suitability before it is made available to players." | [PP] |
| Players pay in Minecoins. | [PP] |
| Learn says "Add-On" (capitalised) means Marketplace Add-Ons; lower-case add-on means any BP/RP. | [LJ] |
| The full Marketplace content guidelines, submission portal, file size caps per product type, pricing and revenue terms | **unverified** (not published on Learn or minecraft.net; partners receive them) |

## Add-On structure

| Rule | Source |
|---|---|
| Exactly one behavior pack and one resource pack. | [COOP] Technical Structure; [VAL] `CADDONREQ160`, `161`, `163` |
| BP and RP each depend on the other. | [COOP]; [VAL] `CADDONREQ165`, `166`, `168`, `169` |
| No dependency on packs outside the add-on. | [COOP] |
| RP header has `"pack_scope": "world"` so it can't be applied as a global resource pack. | [COOP] Manifest Updates |
| `min_engine_version` on both packs. | [COOP] Versioning |
| Players add the packs from the Resource Pack or Behavior Pack tabs of Create New World / Edit World. | [COOP] |
| Must work stacked with at least one other cooperative Add-On; test that. | [COOP] Cooperativity |
| Must be removable without affecting vanilla gameplay or other Add-Ons. | [COOP] |

## Experiments and beta features

| Rule | Source |
|---|---|
| "Add-Ons should not use or rely on Experimental features." | [COOP] Versioning |
| `use_beta_features: true` in entity, block or item definitions: "Beta features cannot be used in published content." | [VAL] `CBFG103` (error) |
| Experiments enabled in a world stay recorded even after being turned off; "For publishing, create a new world without experiments enabled." | [VAL] `EXPFLAG101` |
| Custom capabilities (experiments, Beta APIs) "may limit where content can be shared". | [VAL] `SHARING100` |
| Beta script module versions are flagged; outdated beta versions are an error. | [VAL] `SCRIPTMODULE114` |

Upcoming Creator Features, Beta APIs and every other toggle count as experiments here. Build experimental work as a separate pack (`bedrock-experimental`), never in the shipped one.

## What a cooperative Add-On must not contain

| Rule | Source |
|---|---|
| No dimension file. | [COOP] Types of Customizations to Avoid; [VAL] `CADDONREQ131` "Cooperative Add-Ons should not contain dimension-related elements" (error). The summary also says not to use "custom dimension sizes". |
| No `ui/` (JSON UI) overrides and no `font/` glyph files. | [COOP] "JSON UI and Custom Fonts overrides are disallowed"; [VAL] `CADDONREQ133` (error) |
| No custom client biome override files. | [COOP] |
| No lang overrides of vanilla strings. | [COOP] |
| No overrides of vanilla sounds or music. | [COOP] |
| No `setLore` on `minecraft:written_book`, or on guide books at all. | [COOP] |
| No changes to vanilla files: block, item and entity types, loot, recipes and so on; no `minecraft:` identifiers; never override `minecraft:player`. | [COOP]; [VAL] `STRICT100`, `STRICT104` (warnings) |
| No `runtime_identifier` on new entities. | [COOP] Versioning; [VAL] `STRICT101` |
| No changes to the player's skin or Character Creator. | [COOP] |
| No scripting that disables vanilla gameplay. | [COOP] Summary |
| Avoid ticking areas (limited and shared with the world and other Add-Ons). | [COOP] Ticking Areas |
| Don't replace blocks in existing chunks without player interaction, explanation and a way to undo; only place into air. | [COOP] Block Placing Methods |

Consequence for this plugin: **custom dimensions** (`bedrock-dimensions-biomes`) and **JSON UI** (`bedrock-ui`) are fine in a world or world template, and in add-ons you share yourself, but not in a cooperative Marketplace Add-On. Whether Marketplace worlds and world templates may include dimension JSON or JSON UI: **unverified**. Custom biomes through `minecraft:replace_biomes` are not named in the forbidden list; client biome *override* files are. Treat a new client biome for your own new biome as **unverified**.

## Namespaces and folders

| Rule | Source |
|---|---|
| Every identifier has a namespace, never `minecraft:`, the same namespace across the whole Add-On, including particles. | [COOP] Namespace |
| A new namespace for every Add-On you release; suggested form `<creator>_<pack>` (e.g. `ycn_saaop:`). | [COOP] |
| The namespace can't be changed after release without data loss. | [COOP] Important note |
| Textures, sounds, loot tables, functions and trade tables go two folders deep: `<type>/<creator_name>/<pack_name>/...`. Inside `<creator_name>` only `<pack_name>` and optionally `common`. No loose files. | [COOP] Folder Structures; [VAL] `CADDONREQ101`, `102`, `104`, `108`, `109`, `110`, `111` |
| Structures go in `structures/<namespace>/`. | [COOP] Structures |
| Feature and feature rule files: unique namespaced names; not in subfolders. | [COOP] |
| Geometry `geometry.<ns>.<...>`, animations `animation.<ns>.<...>`, animation controllers `controller.animation.<ns>.<...>`, render controllers `controller.render.<ns>.<...>`. | [COOP] |
| Texture references, sound references, tags, scoreboard objectives, NPC scenes and lang keys all namespaced. | [COOP] |
| Folder names in `<type>/` must not be "common" generic names like `mobs`; use `creatorname_gamename`. | [VAL] `CADDONREQ102` |

The house layout in `bedrock-addon-conventions` (one namespace, `geometry.ns.thing`, `animation.ns.thing.walk`) matches. The two-folder rule for textures, sounds, loot, functions and trading is stricter than the house default; apply it when targeting Marketplace.

## Performance and size

| Rule | Source |
|---|---|
| Add-On "Try not to exceed 25MB uncompressed, or a maximum of 3,500 files" (roughly 1,000 elements). | [COOP] Limits for Performance |
| "For add-ons, we recommend a max pack size of 25MB (uncompressed) and a maximum of 2,500 files." | [PERF] (the two pages differ; 2,500 is the safer number) |
| Block permutations under 10,000 for an Add-On. | [COOP] |
| Textures: under 256x256 for blocks and items, under 2048x2048 for anything else; prefer efficient space over power-of-2 sizes; use Molang/materials for colour variants. | [COOP] |
| Texture handles: under 800 for Add-Ons, under 2,000 for world templates; hard limit 4,000 ("pink textures"). | [PERF] |
| Packs: under 200 MB uncompressed recommended, under 100 MB safest; stay under 10,000 files, 5,000 to 7,000 is safer. | [PERF] |
| "Target under 100MB for best mobile compatibility"; large add-ons may have issues with Realms uploads. | [VAL] `PACKSIZE401` |
| Skin packs: at most 80 skins. | [VAL] `CSPJ116` |
| Marketplace per-product download size cap | **unverified** |

## Player experience

| Rule | Source |
|---|---|
| Teach the Add-On with a guide book spawned once per player at their feet (structure with the book and a structure void, or a custom book item). Never respawn it on every join or death. Book items: max stack 64 so they fit bundles. | [COOP] Teaching players |
| Chat messages 28 characters or less, only on first join. | [COOP] Messages in chat |
| Strong language is flagged. | [VAL] `SHARING101` |

## Worlds, templates and skin packs

| Rule | Source |
|---|---|
| Marketplace worlds are "typically world templates". | [WT] |
| World template icon `world_icon.jpeg` 800x450; non-Marketplace templates don't need one. | [WT] (MCTools `CWI104` says square 256x256 or 128x128; the sources conflict) |
| World template manifest needs `base_game_version` (error without it in MCTools); a version above the current release is an error. | [VAL] `BASEGAMEVER100`, `111`, `121`, `131`; [BGV] |
| Embedded pack folder names 10 characters or less (Xbox). | [WT] |
| `lock_template_options` is documented in Learn's manifest reference as required for world templates (Creator Tools flags it missing, CHKMANIF105); exactly which options it locks is not listed. | Learn manifest reference; see `bedrock-world-templates` |
| Skin pack: `localization_name` equals `serialize_name`; every skins.json key has a lang entry; textures 64x64 or 128x128; capes 64x32; geometry `geometry.humanoid.custom` or `geometry.humanoid.customSlim`; `type` `free` or `paid`. | [SKIN]; [VAL] `CSPJ103`, `106`, `107`, `111`, `115` |
| Certain skin properties are only allowed for creator accounts. | [VAL] `CSPJ108` (which properties: **unverified**) |
| Pack optimization through Bedrock Dedicated Server can prepare packs "for testing and distribution inside or outside Marketplace"; it takes the `Content\resource_packs` and `Content\behavior_packs` folders of a "Marketplace structured pack". | [OPT]; 26.40 changelog |
| Release with semantic versions; `just-scripts mcaddon` packages "for distribution in the marketplace". | [ADW] |

The "Content\..." layout of a Marketplace submission (beyond those two folder names) is **unverified**.

## Tooling

Minecraft Creator Tools (https://mctools.dev, npm `@minecraft/creator-tools`) runs these validation rules, including an "Add-On Best Practices" suite in its Inspector [COOP]. Install it only with the user's OK (house rules). This plugin's `check-pack.mjs` and `package-addon.mjs` catch a subset: link errors, beta modules, missing icons, dependency versions, `$` paths.
