# World and world template folder structure

Source keys:
- **[WT]** Learn: Create a World Template from an Exported World, https://learn.microsoft.com/en-us/minecraft/creator/documents/createaworldtemplate
- **[BGV]** Learn: World Templates and Base Game Versioning, https://learn.microsoft.com/en-us/minecraft/creator/documents/basegameversioning
- **[MAN]** Learn: manifest.json for Behavior/Resource/Skin Packs and World Templates, https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/packmanifest
- **[LPV]** Learn: Latest Platform Version Guidance, https://learn.microsoft.com/en-us/minecraft/creator/documents/practices/latestplatformversion
- **[FORMS]** Learn content forms in MicrosoftDocs/minecraft-creator: `content/forms/pack/world_template_manifest.form.json`, `content/forms/packmanifest/header.form.json`, `content/forms/world/world_packs.form.json`, `content/forms/world/mcworld_properties.form.json`
- **[MCT]** Minecraft Creator Tools 0.19.0 (npm `@minecraft/creator-tools`): rule messages and the `WorldLevelDat`, `JsonManifest` and `CheckManifest` code
- **[CHUNK]** Learn: Chunker World Settings, https://learn.microsoft.com/en-us/minecraft/creator/documents/chunkerworldsettings
- **[BDS]** Learn: Bedrock Dedicated Server getting started, https://learn.microsoft.com/en-us/minecraft/creator/documents/bedrockserver/getting-started

## The world folder

What an exported world holds, per [WT]:

| Path | What it is | Edit it? |
|---|---|---|
| `db/` | LevelDB database: `*.ldb`, `*.log`, `CURRENT`, `MANIFEST-*`. "binary and not friendly for editing by hand, so don't touch these!" | No |
| `level.dat` | "important data about your Minecraft world" | No (binary NBT) |
| `level.dat_old` | backup of `level.dat` | No |
| `levelname.txt` | the world's name, for example `New_World` | Yes, plain text |
| `world_icon.jpeg` | "the first image Minecraft displays for the world". The game replaces it with a new screenshot "whenever you play the world and then save and exit" | Yes, replace it last |
| `behavior_packs/` | "All the behavior packs you activated in the world will be copied into here" | Yes |
| `resource_packs/` | the same for resource packs | Yes |
| `world_behavior_packs.json` | "Contains behavior pack ID and version" | Yes |
| `world_resource_packs.json` | "Contains resource pack ID and version" | Yes |
| `world_behavior_pack_history.json`, `world_resource_pack_history.json` | "Contains information about the ... packs, such as UUIDs" | Leave as the game wrote them. Field layout: unverified |

The `minecraftWorlds` folder names are random ("XqZXZZQdBQQ" [WT], "eplC8tYRD04=" [BDS]). Open `levelname.txt` in each folder to find yours [BDS].

### Packs inside the world

- Folder names under `behavior_packs/` and `resource_packs/` "must be **10 characters or shorter**. This is due to an issue on Xbox where long paths may cause resource or behavior packs to not load properly. We suggest using an acronym of the contents title for folder names." [WT]
- Each folder is a complete pack with its own `manifest.json` at its root.
- Creator Tools validates the embedded packs with the normal BP and RP rules as well (for example `FORBFILE` extension lists per pack type) [MCT].

### world_behavior_packs.json and world_resource_packs.json

A JSON array at the root of the world folder. "Each element is a pack registration with pack_id (UUID) and version (array of integers)" [FORMS `world_packs`].

```json
[
  { "pack_id": "<BP header uuid>", "version": [1, 0, 0] }
]
```

| Field | Rule | Source |
|---|---|---|
| `pack_id` | the header `uuid` of the referenced pack; a malformed UUID is an error | [MCT] `WPACKREFS203` |
| `version` | "a valid version array [major, minor, patch]. Version must match the referenced pack" | [MCT] `WPACKREFS204` (missing: warning), `WPACKREFS205` (invalid: error) |
| referenced pack | must be bundled in the world | [MCT] `WPACKREFS206` (error) |
| file missing | "Packs may not load correctly without proper references" | [MCT] `WPACKREFS202` (warning) |

Creator Tools reads exactly the names `world_behavior_packs.json` and `world_resource_packs.json` [MCT `MCWorld.js`]. Its rule text says "behavior_packs.json or resource_packs.json"; that is shorthand. Other keys in entries (for example `subpack`): unverified. `world-template.mjs init` keeps any extra keys it finds and only updates `version`.

### level.dat fields that matter for templates

`level.dat` is an 8-byte header followed by little-endian NBT [MCT `WorldLevelDat.loadFromNbtBytes`]. Fields Creator Tools reads (names as in its code, not documented on Learn):

| NBT tag | Meaning | Source |
|---|---|---|
| `baseGameVersion` | the world's base game version (string) | [MCT] |
| `isFromWorldTemplate`, `isFromLockedTemplate`, `isWorldTemplateOptionLocked` | set on worlds made from a template; Chunker describes "Is World Template Option Locked" as "Whether the options for this world are currently locked using the settings from the source world template" | [MCT], [CHUNK] |
| `experiments` compound: `gametest` (Beta APIs), `data_driven_items`, `deferred_technical_preview`, `experiments_ever_used`, `saved_with_toggled_experiments` | which toggles are on, and whether any ever was | [MCT] |
| `LevelName` | the world name | [MCT] |

Learn's world properties form lists `spawnX`, `spawnY`, `spawnZ`, `difficulty`, `generator`, `gameType` and `isEditor` [FORMS `mcworld_properties`]. Change these in the game, not by editing bytes.

## What a world template adds

"All you need to do to turn a Minecraft world into a world template is: 1. Create a working exported world with any configurations and Add-On packs activated. 2. Add the proper manifest.json file. 3. Optional: Create a folder named texts with 2 text files inside: en_US.lang and languages.json." Zip and rename to `.mctemplate` [WT].

### manifest.json

| Field | Rule | Source |
|---|---|---|
| `format_version` | `2` ("Use 2 for modern templates"). Format 3 is in preview and uses string versions | [FORMS], [MAN] |
| `header.name` | "always `pack.name`", resolved from `texts/` | [WT] |
| `header.description` | "always `pack.description`" | [WT] |
| `header.version` | "Always create new content with `[1, 0, 0]`". A higher version replaces an imported copy; the same or lower is ignored | [WT], [MAN] |
| `header.uuid` | one UUID for the header and a different one for the module ("Generate two different UUIDs") | [WT] |
| `header.lock_template_options` | Boolean. "This option is required for any world templates. This will lock the player from modifying the options of the world." Creator Tools flags it as missing in format 2 (`CHKMANIF105`) | [MAN], [MCT] |
| `header.base_game_version` | `[major, minor, patch]` or `"*"`. Required by Creator Tools (`BASEGAMEVER100`). Needs format 2 or higher (`CHKMANIF132`); `"*"` gets a warning asking for an exact version (`CHKMANIF133`). Semantics: `packaging-and-updates.md` | [BGV], [MAN], [MCT] |
| `header.allow_random_seed` | Boolean. "generate a random seed every time a template is loaded and allow the player to change the seed before creating a new world" | [MAN], [WT] |
| `header.platform_locked`, `header.pack_scope` | in the header schema; no world template meaning documented | [FORMS], [MCT]; meaning for templates unverified |
| `modules[]` | one module with `"type": "world_template"`, its own `uuid` and `version`. At most one `world_template` module (`CHKMANIF108`) | [WT], [MCT] |
| `dependencies[]` | "Optional list of behavior and resource packs this template depends on" (`uuid` or `module_name`, `version`) | [FORMS]. When a template needs this instead of `world_*_packs.json`: unverified |
| `metadata.authors` | array of names, as in Learn's example | [BGV] |

The manifest that `world-template.mjs init` writes (UUIDs are fresh on each run):

```json
{
  "format_version": 2,
  "header": {
    "name": "pack.name",
    "description": "pack.description",
    "version": [1, 0, 0],
    "uuid": "<header uuid>",
    "lock_template_options": true,
    "base_game_version": [1, 26, 50]
  },
  "modules": [
    { "version": [1, 0, 0], "type": "world_template", "uuid": "<module uuid>" }
  ]
}
```

Learn's own examples differ in small ways: [WT] has no `lock_template_options` or `base_game_version`; [BGV] and [LPV] have both. Creator Tools requires both, so always write them.

#### Random seed templates

"Starting with any unzipped, exported world, delete the db folder", then add `"allow_random_seed": true`. "After the world is created, the world seed is locked and no longer editable." [WT] The 1.20.30 notes say "Marketplace maps can now specify map templates to allow for random world seeds" (Learn Update1.20.30). `world-template.mjs` keeps an existing `allow_random_seed` but does not delete `db/`; do that by hand in the template copy.

### texts/

| File | Content | Source |
|---|---|---|
| `texts/en_US.lang` | required lines `pack.name=<name>` and `pack.description=<description>`. "The names after the = are what will show up in the UI" | [WT] |
| `texts/languages.json` | `["en_US"]`, plus a code for each extra `xx_YY.lang`. Optional | [WT] |

"If you do not have this folder and its contents, then the name of your world template will be 'pack.name'." [WT] Lang file rules (UTF-8 without BOM, tab comments): `../../bedrock-shipping/references/localization.md`.

### world_icon.jpeg

JPEG at the world root, one only (`CWI102`). Size rules conflict between sources; see `packaging-and-updates.md`. "Non-marketplace templates do not need a world icon" [WT].

## Where the files live on Windows

| What | Path | Source |
|---|---|---|
| Worlds | `%APPDATA%\Minecraft Bedrock\Users\<user id>\games\com.mojang\minecraftWorlds\<folder>` | [BDS] |
| Development packs | `%APPDATA%\Minecraft Bedrock\Users\Shared\games\com.mojang\development_behavior_packs` and `development_resource_packs` | Learn: GDK Migration on Windows |
| Preview | the same under `%APPDATA%\Minecraft Bedrock Preview\` | Learn: GDK Migration (packs and logs). Preview worlds under `Users\<user id>`: unverified |
| Imported templates | `world_templates` in `com.mojang` | [WT] |
| Editor exports | `com.mojang\projectbackups` | Learn: Editor Workflow |

The 26.30 changelog mentions a "Shared `minecraftWorlds` folder" in a GDK bug fix; if a world is not under your user id, look under `Users\Shared` too. The old UWP path (`%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang`) is for builds before 1.21.120.
