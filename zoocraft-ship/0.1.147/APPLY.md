# ZooCraft 0.1.147: the Mythical Glade (a rare new biome with giant fantasy trees)

Apply on 0.1.146 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(128 files: 119 new: the biome and its look (biome, client biome, fog, motes particle), 10 blocks with
their textures, drops and 6 recipes, 16 tree structure files in a new folder `addon\packs\BP\structures\zoocraft\`,
54 features and 6 feature rules that lay the glade's trees, flowers, grass and amethyst, 2 scripts (the glade's motes, chimes
and name), and `docs\Mythical_glade_test_plan.md`; 9 replacing ones 0.1.146 has: main.js, the Places list
(world\trenchRules.js), research.js, data\blocks.js, blocks.json, en_US.lang, terrain_texture.json, the test file and
status.md). One new folder: `packs\BP\structures\zoocraft\` (create it). `SHA256SUMS.txt` has the SHA-256 of each one;
`BEFORE.txt` has the SHA-256 of the 9 files it replaces, as the laptop has them. Paths in both are relative to
the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.147 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.147\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes.
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path, creating
   `packs\BP\structures\zoocraft\`. Delete nothing in the add-on, install nothing, and don't touch the manifests
   (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Check that the built behaviour pack it deploys has `structures\zoocraft\` with the 16
   `.mcstructure` files. Post one short line in the thread: the version it built, the test count (expect 0.1.147 and
   300) and whether the structures are there, or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

New blocks, textures, a fog and a particle: Minecraft needs a full restart to load them. The glade only appears in
Overworld chunks made after this (a new world, or land not yet explored); nothing already made changes, and no world
file is touched. Test plan: `docs\Mythical_glade_test_plan.md`.
