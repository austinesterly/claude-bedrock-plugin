# Packaging, versions and updates

Sources: Microsoft Learn "Minecraft File Extensions" (MinecraftFileExtensions.md), "Create a World Template" (CreateAWorldTemplate.md), "Add-On Development Workflow", "Guidelines for Building Cooperative Add-Ons", "Improving Performance and Resource Usage", the MCTools validation rules (Reference/Content/MCToolsValReference), Mojang's `@minecraft/core-build-tasks` 5.7.0 (`mcaddonTask`), and the 26.40 to 26.60 changelogs. House rules: `../../bedrock-addon-conventions/SKILL.md`.

## File formats

| Extension | Learn definition | What goes inside |
|---|---|---|
| `.mcpack` | "A zipped resource or behavior pack" | One pack. Its files sit at the zip root: `manifest.json`, `pack_icon.png`, folders. Skin packs also ship as `.mcpack` (Learn: Introduction to Skin Packs). |
| `.mcaddon` | "A zip file that contains .mcpack or .mcworld files" | Mojang's build task writes `<name>_bp.mcpack` and `<name>_rp.mcpack` at the zip root. `package-addon.mjs` does the same. |
| `.mcworld` | "A zip archive that contains all the files needed to load a ... world" | `db/`, `level.dat`, `level.dat_old`, `levelname.txt`, `world_icon.jpeg`, and when packs are active `behavior_packs/`, `resource_packs/`, `world_behavior_packs.json`, `world_resource_packs.json`, `world_*_pack_history.json` |
| `.mctemplate` | "A zip archive containing the template of a world" | A `.mcworld` layout plus `manifest.json` (module `world_template`) and `texts/` |
| `.mcproject` | "Minecraft Bedrock Editor's filetype" | Opens only in Editor and can hold Editor extensions. A `.mcworld` imported into Editor becomes an `.mcproject`; exporting back to `.mcworld` removes the extensions. Internal layout: unverified. |
| `.mcstructure` | A structure saved with the Structure Block | Not a distribution format for packs. |

Zip rules from Learn (world template page): select the files inside the folder and zip those. "Do not try to zip the whole folder", because the extra top folder stops the import. The same applies to every `.mc*` format. Each file is just a renamed `.zip`.

MCTools `PACKSIZE410`: use "standard ZIP compression without advanced features". `package-addon.mjs` writes plain deflate or stored entries, UTF-8 names, no zip64.

## Files the game rejects or warns about

| Rule | Source |
|---|---|
| Only allowed extensions per pack type (BP: `.json`, `.js`, `.ts` and so on; RP: `.json`, `.png`, `.tga`, `.fsb`, `.ogg` and so on) | MCTools `FORBFILE102` (full list: unverified, "check documentation") |
| No `Thumbs.db`, `.DS_Store`, `desktop.ini` | `FORBFILE103` |
| No `$` in any path | `FORBFILE104` |
| Full path under 255 characters; more than 8 folder levels is a warning | `PATHLENGTH103`, `PATHLENGTH102` |
| Lower-case file and folder names recommended | `PATHLENGTH104` |
| No BOM in JSON files | MCTools `NOBOM101` (error); also the house rules |
| Pack folder names inside a world template 10 characters or less (Xbox path issue) | Learn: Create a World Template |

## pack_icon.png

| Rule | Source |
|---|---|
| File name `pack_icon.png` at the pack root, one per pack | MCTools `CPACKICON101`, `CPACKICON102` |
| Must be a valid PNG | `CPACKICON103` (error) |
| Square, "typically 256x256 pixels for best display" | `CPACKICON104` (warning) |
| Missing icon is only a warning; the pack still loads | `CPACKICON101` |
| World icon: `world_icon.jpeg`. Learn's template page says 800x450 JPEG; MCTools `CWI104` says square 256x256 or 128x128 | the two sources disagree; 800x450 is the documented template size, use it |

Exact maximum icon size: unverified.

## Versions and UUIDs

| Do | Why (source) |
|---|---|
| Generate the header UUID and every module UUID once (two different UUIDs per pack minimum) and never change them | Learn: Resource Pack tutorial ("two different UUID numbers"); house rules. World dynamic properties and, since 26.40, block dynamic properties are bucketed by the manifest (header) UUID ("Block dynamic properties are now bucketed by manifest-UUID rather than module-UUID", 26.40 changelog) |
| Bump `header.version` for every release you hand out | Learn: Add-On Development Workflow, "The version number needs to be updated in your manifest.json file" |
| Use MAJOR.MINOR.PATCH meaning: major for breaking changes, minor for features, patch for fixes | Learn: Add-On Development Workflow |
| Update the cross-dependency versions to match (BP depends on RP header uuid + version, and the reverse) | MCTools `CADDONREQ166`/`169` (dependency invalid), `WPACKREFS205` for worlds |
| Keep the namespace and every identifier | Learn cooperative guidelines: "don't change namespaces"; removing an entity type "has the impact of removing/hiding all instances of that entity in the world" |
| Set `min_engine_version` on both packs | Learn cooperative guidelines |
| Document breaking changes and how to upgrade | Learn: Add-On Development Workflow |

Bump the module versions too? Learn does not say. Keeping module `version` equal to the header version is common and harmless (unverified as a requirement).

What the game does when a pack with the same UUID and a higher version is imported: it is treated as an update of the same pack. Exact replacement behaviour (whether the old version is kept side by side, how worlds that pin the old version react): unverified. Related changelog facts:
- 26.60 Preview: "Development resource and behavior packs are now refreshed when managing packs for a world, and take precedence over other copies when their version is equal or newer." Uninstall old development copies before testing a packaged build.
- 26.50: "Fixed an issue where transferring to another server with the same resource pack at a different version would cause players to load in with no resource pack applied."
- Learn (world template page): "You will get 'Failed to import' errors if you already have content with the same UUIDs loaded into your com.mojang folder." Remove the installed copy (move it to a backup folder) before re-importing the same version.

### Format 3 manifests

In `"format_version": 3`, versions are strings (`"1.2.0"`), not arrays. `package-addon.mjs` compares both forms. Field list: `../../bedrock-json-reference/references/manifest.md`.

## Dependencies

| Rule | Source |
|---|---|
| BP lists the RP header `uuid` + `version`; RP lists the BP header `uuid` + `version` | Learn cooperative guidelines ("Both the Behavior Pack and Resource Pack need to contain dependencies on each other"); `CADDONREQ165`/`168` |
| Exactly one BP and one RP in a cooperative add-on; no dependency on packs outside the add-on | Learn cooperative guidelines; `CADDONREQ160`/`161`/`163` |
| Script modules are listed by `module_name` + version string, not by uuid | Learn: Troubleshooting Add-Ons ("Dependencies use `module_name`, not `uuid`") |
| A BP dependency on a RP that is not found is an error | MCTools `RPDEPENDS102` |
| Beta module versions (`x.y.z-beta`) need the Beta APIs experiment; outdated beta versions stop loading | MCTools `SCRIPTMODULE114`; house rules |
| RP for a cooperative add-on: `"pack_scope": "world"` in the header, so it can't be used as a global resource pack | Learn cooperative guidelines, Manifest Updates |

## Packs embedded in a world (.mcworld / .mctemplate / BDS)

When a world with active packs is exported, the game writes (Learn: Create a World Template):

```
behavior_packs/<folder>/          copies of the active BPs
resource_packs/<folder>/          copies of the active RPs
world_behavior_packs.json         "Contains behavior pack ID and version"
world_resource_packs.json         "Contains resource pack ID and version"
world_behavior_pack_history.json  "Contains information about the behavior packs, such as UUIDs"
world_resource_pack_history.json
```

Each entry of `world_behavior_packs.json` / `world_resource_packs.json` references a pack by `pack_id` (the header UUID) and `version` (an array that must match the bundled pack). Source: MCTools `WPACKREFS203` ("Ensure pack_id matches the UUID in the referenced pack's manifest"), `WPACKREFS204`/`205` (version array), `WPACKREFS206` (referenced pack must be bundled with the world). Shape:

```json
[
  { "pack_id": "<BP header uuid>", "version": [1, 2, 0] }
]
```

Other keys sometimes seen in these files (for example `subpack`): unverified. The safest way to produce the files is to enable the packs on the world in game and export it; when you ship an update inside a world, change both the pack folder and the `version` in these files.

## Release checklist

1. `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" packs` passes.
2. Content log clean in a new world on current stable and current Preview (house rules section 6).
3. `header.version` bumped in BP and RP; each cross-dependency updated; no UUID or namespace changed; nothing removed.
4. `min_engine_version` set on both packs; no `-beta` modules, no `use_beta_features`, no experiments in any test world you export (`EXPFLAG101`: experiments stay recorded in the world).
5. `pack_icon.png` in both packs; `texts/languages.json` lists every shipped `.lang`; `en_US.lang` complete (`LANGFILES102`, `104`).
6. No forbidden files (`$`, `Thumbs.db`, long paths); no `.md`, source maps or editor folders (the packager skips dotfiles, `node_modules`, `.git`, `*.md`).
7. Size inside the budget: about 25 MB uncompressed and 2,500 files (performance guide) or 3,500 files (cooperative guide), under 800 texture handles. MCTools `PACKSIZE401` suggests under 100 MB "for best mobile compatibility" and warns about Realms uploads.
8. Multiplayer test (two players, LAN or BDS) and a stacked test with one other add-on (cooperative guidelines).
9. Upgrade test: load a world saved with the previous release.
10. `node "${CLAUDE_PLUGIN_ROOT}/scripts/package-addon.mjs" packs --name <Name>`; import the `.mcaddon` on a profile without development copies; check both packs appear and activate together.
11. Optional: Bedrock Dedicated Server pack optimization (26.40+) bakes packs into archives for faster loading. Optimized packs need client 1.26.40 or newer. See `multiplayer-and-servers.md`.
