# ZooCraft 0.1.143: the Rift Willows (patches of white weeping willows on the outer End islands)

Apply on 0.1.142 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(58 files: 41 new: 5 blocks (Rift Turf, Rift Grass, White Willow Log and Leaves, Willow Strands) with their
loot, 8 textures, a recipe, 19 world-generation feature and rule files, the patch's fog and particle and
`docs\Rift_willows_test_plan.md`; 17 replacing ones 0.1.142 has: 11 scripts, the Rift Ferret's spawn rule,
blocks.json, the language file, terrain_texture.json, the test file and status.md). No new folders.
`SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 17 files it replaces, as the laptop
has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on
the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.143 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.143\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes.
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.143 and 296), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

New block, texture, fog and particle files: quit Minecraft fully and start it again. The willows only appear in End
chunks made after this (a new world, or outer End islands not yet explored); nothing already made changes.
Test plan: `docs\Rift_willows_test_plan.md`.
