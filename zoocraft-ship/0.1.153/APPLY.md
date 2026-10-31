# ZooCraft 0.1.153: wild animals run off properly

Apply on 0.1.152 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(17 files: 1 new, `docs\Wild_animals_flee_test_plan.md`; 16 replacing ones 0.1.152 has:
the wild Deer, Chorus Deer, Flamingo, Lush Okapi, Unicorn and Zebra entities, 6 scripts, the test file, status.md and
two test plans).
`SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 16 files it replaces, as the laptop
has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on
the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.153 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.153\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.152 must be applied first: if the
   add-on still reads 0.1.151 or 0.1.150, apply `zoocraft-ship\0.1.151\` and `zoocraft-ship\0.1.152\` from the
   same archive first, in that order, each by its own APPLY.md, then this.)
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.153 and 307), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

Entity and script files change: quit Minecraft fully and start it again. Works in any world. No world file is
touched. Test plan: `docs\Wild_animals_flee_test_plan.md`.
