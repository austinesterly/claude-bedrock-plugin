# Packaging, versions and updates for worlds and templates

Source keys:
- **[WT]** Learn: Create a World Template, https://learn.microsoft.com/en-us/minecraft/creator/documents/createaworldtemplate
- **[BGV]** Learn: World Templates and Base Game Versioning, https://learn.microsoft.com/en-us/minecraft/creator/documents/basegameversioning
- **[MAN]** Learn: manifest reference, https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/packmanifest
- **[LPV]** Learn: Latest Platform Version Guidance (2025-12-23), https://learn.microsoft.com/en-us/minecraft/creator/documents/practices/latestplatformversion
- **[EXT]** Learn: Minecraft File Extensions
- **[CWI]** Learn: Validation Rules - World Icon, https://learn.microsoft.com/en-us/minecraft/creator/reference/content/mctoolsvalreference/cwi
- **[MCT]** Minecraft Creator Tools 0.19.0 (npm `@minecraft/creator-tools`): rule forms and generator code
- **[CL]** Minecraft changelogs 26.40, 26.50, 26.60.22 (feedback.minecraft.net)

## Zipping

| File | Learn definition | Contents |
|---|---|---|
| `.mcworld` | "A zip archive that contains all the files needed to load a Minecraft: Bedrock Edition or Minecraft Education world" [EXT] | the world folder's contents |
| `.mctemplate` | "A zip archive containing the template of a world used in Minecraft" [EXT] | the world plus `manifest.json` (`world_template` module) and `texts/` [WT] |

- Select the files **inside** the world folder and zip those. "Do **not** try to zip the whole folder and rename it from .zip to .mcworld. ... the world folder goes inside another folder and Minecraft will not be able to import the world." [WT]
- Importing a `.mcworld` adds it to the worlds list; importing a `.mctemplate` puts it in `world_templates` and under Create New > **Imported Templates** [WT].
- Close the world in the game before copying or zipping it. A world that is open keeps its database in use (a `db/LOCK` file is present; exact locking behaviour: unverified).

With the plugin script:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/world-template.mjs" pack <template folder> [--out <dir>] [--name MyMap]
node "${CLAUDE_PLUGIN_ROOT}/scripts/world-template.mjs" pack <template folder> --mcworld
```

It writes plain deflate entries with UTF-8 names and no zip64 (the same writer as `package-addon.mjs`; MCTools `PACKSIZE410` asks for "standard ZIP compression without advanced features"). `--mcworld` leaves out the root `manifest.json`. Skipped: dotfiles, `Thumbs.db`, `desktop.ini`, `node_modules`, `.git`, symlinks. It refuses an `--out` inside the folder and never changes the folder.

The Bedrock Editor can export the same formats: since 26.30, File > Export offers **World Template** (`.mctemplate`) and **Shareable World** (`.mcworld`) "with all Editor settings and metadata removed" (26.30 changelog). An Editor export does not bundle your development packs for you; check `behavior_packs/` and `world_*_packs.json` in the result (unverified either way).

## Versioning a template

| Rule | Source |
|---|---|
| New content starts at `[1, 0, 0]` | [WT] |
| `version`: "The new pack will replace the old one if the version is higher, and ignored if it's the same or lower." Bump it for every release | [MAN] |
| Keep the header and module UUIDs for every release of the same template | [MAN] (version replacement is per UUID); house rules |
| Re-importing content with UUIDs that are already installed gives "Failed to import"; while testing, move the old copy out of `world_templates` | [WT] |
| Use MAJOR.MINOR.PATCH meaning | Learn: Add-On Development Workflow (for packs) |

`world-template.mjs init` on a folder that already has a world template manifest keeps its UUIDs and version; pass `--version 1.1.0` to bump both the header and the module version.

## Updating packs inside a released world

- A world made from a template is "their own fresh copy of the world" [WT]. Its bundled packs are copies too. Releasing a new template does not change worlds players already created (what the Marketplace does for existing worlds: unverified).
- To ship a new pack build in the template:
  1. Bump the pack's `header.version` (and its dependency on the other pack). Keep its UUIDs: world dynamic properties are keyed to the BP header UUID (`bedrock-addon-conventions`), and `pack_id` must match.
  2. Run `init` with the previous release's template folder as the source and the new packs: it replaces the bundled folder with the same header UUID, updates `version` in `world_*_packs.json`, and keeps the template UUIDs. Add `--version` to bump the template.
  3. `pack`, import on a clean profile, create a new world, and also load a world saved with the previous release.
- `pack_id` and `version` mismatches are the usual cause of a pack silently not loading: `WPACKREFS205` (version must match), `WPACKREFS206` (pack not bundled).
- For a world on a server or Realm, replace the pack folders in the world, update `version` in `world_*_packs.json` and restart (`../../bedrock-shipping/references/multiplayer-and-servers.md`).

## base_game_version

- "Base game versioning is a method of keeping current or future changes in Vanilla Minecraft: Bedrock Edition from causing unexpected changes to your world files, and allowing you to lock your world template to a specific Minecraft version." Example: a 1.18 client with `base_game_version` 1.15 "will load the resources for all versions up to 1.15 and will skip any new resources implemented in 1.16 through 1.18" [BGV].
- "We use this to determine what version of the base game resource and behavior packs to apply when your content is used." [MAN]
- Introduced in 1.13: "**Do not** try to set your `base_game_version` below 1.13" [BGV].
- `"*"` for content that "doesn't depend on version features, like a simple map that is unlikely to break from future updates" [BGV]. Creator Tools warns and asks for an exact version instead (`CHKMANIF133`, warning).
- It is "a world template-only concept" and "compliant with the N-1 minor version idea": within one minor version of the current release counts as up to date [LPV]. Creator Tools: below the current or previous minor version is a recommendation (`BASEGAMEVER120`); above the current release is an error (`BASEGAMEVER111`/`121`/`131`); missing is an error (`BASEGAMEVER100`).
- It does not replace testing: "base game versioning can't replace testing and maintenance of your content" [BGV]. When you raise it, check new vanilla content does not break the map, for example "a glow squid suddenly inside of your dungeon pond" [LPV].
- Real effects in recent releases [CL]: "For new worlds (base game version 1.26.40 and later), stair corner-state changes now trigger neighbor block updates ...; existing worlds keep the prior client-only update behavior" (26.40); the same for thin fences and trip wire at 1.26.50 (26.50); a Straw Bed fix "in worlds and templates using a base game version older than 26.50" (26.60.22). Redstone and contraptions can behave differently depending on this number.
- `base_game_version` (template manifest) is not `min_engine_version` (each BP and RP manifest). Packs still need their own `min_engine_version`. It "does not affect texture packs or skin packs" [BGV].
- The world records its own value in `level.dat` as `baseGameVersion` ([MCT] `WorldLevelDat`).

`world-template.mjs init` defaults `base_game_version` to the BP's `min_engine_version` (the version the packs were tested on), else `[1, 26, 50]`; override with `--base-game`.

## World icon size: the sources disagree

| Source | Rule |
|---|---|
| Learn, Create a World Template [WT] | `world_icon.jpeg`, "**Dimensions:** 800x450px", "**File format:** JPEG". "Non-marketplace templates do not need a world icon" |
| Learn, Validation Rules - World Icon [CWI] | `CWI104` (warning): "World icons should be square (typically 256x256 or 128x128 pixels)". `CWI101` missing (warning), `CWI102` more than one (warning), `CWI103` not a valid JPEG (error) |
| Creator Tools 0.19.0 code [MCT] `CheckWorldIconsGenerator.js` | accepts exactly **800x450** (also 480x270 for Education offers) and reports all CWI results at **error** severity. Only `world_icon.jpeg` at the world root counts |

Use **800x450 JPEG**: it is what the tutorial documents and what the validator code checks. The square sizes in the rule text look like they were copied from the pack icon rule (`CPACKICON104`, "typically 256x256"); that reading is unverified. The game overwrites `world_icon.jpeg` with a screenshot when you save and quit [WT], so replace the icon in the template copy after the last play session. `pack` warns when the icon is missing or not 800x450.

## Creator Tools checks that apply to world templates

What `npx mct validate -i <template folder> --single -o <out>` runs on a world template (Creator Tools 0.19.0, default suite). Only run it if the user has installed Creator Tools (house rules).

| Rule | Checks | Severity (Learn page / tool) |
|---|---|---|
| `BASEGAMEVER100` / `110`-`131` | `base_game_version` present and not above the current release; lower values get recommendations | error / recommendation |
| `CHKMANIF105` | `lock_template_options` missing in a format 2 template manifest | error |
| `CHKMANIF108` | more than one `world_template` module | error |
| `CHKMANIF132`, `133` | `base_game_version` needs format 2; wildcard not recommended | error, warning |
| `CWI101`-`104` | world icon present, single, valid JPEG, right size | see the table above |
| `WPACKREFS201`-`206` | `world_*_packs.json` valid, `pack_id` valid and bundled, `version` present and valid | 202, 204 warnings; others errors |
| `EXPFLAG101` | an experiment is or was on in `level.dat` | warning |
| `WORLD101`-`109` | info: Beta APIs, Data Driven Items and Deferred Technical Preview experiments, base game version, name and description | info |
| `WORLDDATA101`, `102`, `112`, `212` | risky commands in functions and command blocks, world-wide commands (`weather`, `time`, `gamerule`), old command syntax | warning |
| `WORLDDATA400` | world data could not be read | error |
| `FORBFILE102`-`104` | file types per pack type (world templates allow any extension; `ui/mcoin.png` and `/contents.json` blocked), `$` in paths | error |
| `PATHLENGTH102`-`104` | deep folders, paths over 255 characters, upper-case names | warning, error, recommendation |

Plus every BP and RP rule on the bundled packs (`FORMATVER`, `MINENGINEVER`, `SCRIPTMODULE`, `JSON`, `TEXTURE` and so on). The cooperative add-on suite (`CADDONREQ`) is a separate suite and does not run by default. Budgets: under 2,000 texture handles for world templates (Learn performance guide); World texture budget 750 MB at tier 1 (Learn Texture Budgets).

On this plugin's test template (a dummy `level.dat`, packs from `new-addon.mjs`), the tool reported `CWI101` (no icon) and `WORLDDATA400` (the dummy `level.dat` is not NBT), and passed `CHKMANIF`, `WPACKREFS` and `FORBFILE`. With a 640x480 icon it reported `CWI104`; with a reference to a pack that was not bundled, `WPACKREFS206`; with Beta APIs set in `level.dat`, `EXPFLAG101`. The Marketplace's own submission checks beyond these public rules: unverified.
