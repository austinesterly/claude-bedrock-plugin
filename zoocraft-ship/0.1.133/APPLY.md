# ZooCraft 0.1.133: the Deep Trench's abyss made with the world

Apply on 0.1.132 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(75 files: 66 new, the world-generation files in two new folders `packs\BP\features\` (59) and
`packs\BP\feature_rules\` (6) and `tests\molang.mjs`; 9 replacing ones 0.1.132 has: main.js, commands.js, the
trench scripts, the balance, the test file, status.md and the Trench test plan).
`SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 9 files it replaces, as the laptop
has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on
the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.133 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.133\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes.
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path (create the
   two new folders). Delete nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps
   the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.133 and 286), or what failed. Make sure the build copied `features` and `feature_rules` into the
   development behavior pack (list `development_behavior_packs\zoocraft_BP\features` and say how many files: 59).
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

New world-generation files: quit Minecraft fully and start it again, then make a NEW world (not Flat): only chunks
made after this version get the new abyss. The 0.1.132 world keeps what it already dug; nothing digs any more.
Test plan: `docs\Trench_test_plan.md` steps 71 to 78.
