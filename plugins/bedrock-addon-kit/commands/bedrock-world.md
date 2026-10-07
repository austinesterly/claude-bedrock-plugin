---
description: Turn a Bedrock add-on into a world template or map (.mctemplate / .mcworld) - bundle the BP and RP into a world made in the game, write the template manifest and texts, then zip it
argument-hint: "[world folder] [packs folder] [map name]"
---

Help the user make a world template from their add-on with the plugin's script. Arguments: $ARGUMENTS

Follow the `bedrock-world-templates` skill. Work through these steps in order, and skip any the user has already done.

1. **Check the packs.** Find the project's packs folder (usually `<project>/packs` with `BP/` and `RP/`). Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <packs>` and fix the errors first. If the BP uses `-beta` script modules or the dev world uses experiments, say that every copy of the template will have those experiments on (`references/experiments-and-features.md`) and ask whether that's OK.
2. **Create the world in the game.** A world can't be generated from files, so the user has to make it: Play > Create New > Create New World, cheats on, with the add-on's packs active (from `development_behavior_packs` / `development_resource_packs`, see `bedrock-addon-conventions` section 6). Build the map, then set it up for players: game mode, game rules (for example Keep Inventory), `/setworldspawn` facing the right way, an empty or deliberate inventory. Then Save & Quit. Point to `references/building-a-map.md` for lobbies, resets and multiplayer logic.
3. **Find the world folder.** With the game closed, it is in `minecraftWorlds`:
   - Windows (GDK builds, 1.21.120+): `%APPDATA%\Minecraft Bedrock\Users\<user id>\games\com.mojang\minecraftWorlds\<folder>`. If it isn't there, look under `Users\Shared\games\com.mojang\minecraftWorlds`.
   - Minecraft Preview: the same under `%APPDATA%\Minecraft Bedrock Preview\`.
   - Folder names are random. Open `levelname.txt` in each folder to find the world by name. Alternatively the user can use Edit > Export World and unzip the `.mcworld`.
   Ask the user for the path if you can't see their game folders. Never edit the world in `minecraftWorlds`; the script works on a copy.
4. **Build the template** (in a new, empty folder):
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/world-template.mjs" init "<world folder>" --out "<template folder>" --packs "<packs folder>" --name "<Map Name>" --description "<one line>" [--lock] [--base-game 1.26.50]
   ```
   `--lock` sets `lock_template_options` to true so players can't change the world options (recommended for maps with fixed rules). `--base-game` defaults to the BP's `min_engine_version`; check `bedrock-whats-new/references/current-versions.md` and don't go above the current release. The script copies the packs into `behavior_packs/` and `resource_packs/`, merges `world_behavior_packs.json` / `world_resource_packs.json`, and writes `manifest.json` and `texts/`. Show the user its warnings and fix what you can. Replace `world_icon.jpeg` in the template folder with an 800x450 JPEG if they have one (`references/packaging-and-updates.md` explains the conflicting size rules).
5. **Pack it**:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/world-template.mjs" pack "<template folder>" [--out "<dist folder>"]
   ```
   This writes `<Map Name>.mctemplate`. Add `--mcworld` for a plain world file to share as it is (no template manifest).
6. **Test the template by importing it.** Before importing, remove the development copies of the packs (or bump the versions) so the game uses the bundled ones, and move any older import of the same template out of `world_templates` ("Failed to import" otherwise). Double-click the `.mctemplate`, then Play > Create New > Imported Templates, create a world from it, and check: the name and description, the packs are active, spawn point and game rules, the locked options, the content log is clean. Then test with a second player (`bedrock-shipping/references/multiplayer-and-servers.md`).
7. **Optional validation**: if the user has Minecraft Creator Tools installed, `npx mct validate -i "<template folder>" --single -o <report folder>` and go through the CSV. Install nothing without their OK.
8. **For an update later**: run `init` again with the previous template folder as the source, the new packs (same UUIDs, higher versions) and `--version <new version>`, then `pack`. Template UUIDs are kept.

The script reads the source world and the packs and writes only into `--out` and the archive. It needs Node 18+ and no network.
