# ZooCraft 0.1.148: the Mythical Glade's water (glowing pools, waterfalls, glow lichen)

Apply on 0.1.147 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(32 files: 26 new: 6 pool structure files in `addon\packs\BP\structures\zoocraft\` (a folder 0.1.147
made), 12 features and 3 feature rules that lay the pools, the springs and the glow lichen, the Glade Spring block and its
drop, 2 scripts (`world\gladeFalls.js`, `world\gladeFallRules.js`) and `docs\Mythical_glade_water_test_plan.md`; 6
replacing ones 0.1.147 has: main.js, blocks.json, en_US.lang, terrain_texture.json, the test file and status.md). No new
folders. `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 6 files it replaces,
as the laptop has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the ZooCraft
Tychoon folder on the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.148 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.148\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.147 must be applied first.)
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Check that the built behaviour pack it deploys has `structures\zoocraft\` with 22 `.mcstructure`
   files (16 trees, 6 pools). Post one short line in the thread: the version it built, the test count (expect 0.1.148
   and 301) and whether the 22 structures are there, or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

A new block: Minecraft needs a full restart to load it. The pools and falls only appear in glade chunks made after this
(a new world, or glade land not yet explored); nothing already made changes, and no world file is touched. Test plan:
`docs\Mythical_glade_water_test_plan.md`.
