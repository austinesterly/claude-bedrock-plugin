# ZooCraft 0.1.162: the Baby Dragon, the third boss

Apply on 0.1.161 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(50 files: 29 new, the Baby Dragon's entities (the zoo one, the wild boss, its void bolt), the Dragon
Crate items, recipe and icons, the scripts `packs\BP\scripts\animals\babyDragon.js`, `babyDragonMoves.js`,
`babyDragonRules.js`, its model, skin, animations, render controllers, client entities and particles, and
`docs\Baby_Dragon_test_plan.md`; 21 replacing ones 0.1.161 has: the boss scripts, the zoo Dragon's scripts, the species,
exhibit, journal, research, Places and test-zoo scripts, main.js, the item atlas, the lang file, the test file and
status.md).
`SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 21 files it replaces, as the laptop
has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on
the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.162 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.162\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.161 must be applied first: if the
   add-on still reads 0.1.160 or older, apply `zoocraft-ship\0.1.161\` from the same archive first, by its own
   APPLY.md, then this.)
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.162 and 328), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

New entities, items and textures: quit Minecraft completely and start it again. Works in any world; no world file is
touched. Test plan: `docs\Baby_Dragon_test_plan.md`.
