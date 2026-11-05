# ZooCraft 0.1.180: goats

Apply on 0.1.179 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(27 files: 7 new, the zoo goat's server and client entity, its animation and render controller,
its two scripts and the test plan; 20 replacing ones 0.1.179 has: 16 scripts, sounds.json, en_US.lang, the test
file and status.md). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 20 files it replaces,
as the laptop has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the ZooCraft
Tychoon folder on the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.180 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.180\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.179 must be applied first: if the
   add-on still reads 0.1.178 or older, apply `zoocraft-ship\0.1.179\` from the same archive by its own APPLY.md first.)
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version). No world
   files: the starter world and Austin's worlds stay as they are.
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.180 and 347), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

A new animal: quit Minecraft completely and start it again. Works in any world. Test plan: `docs\Goats_test_plan.md`.
