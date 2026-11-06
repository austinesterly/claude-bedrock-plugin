# ZooCraft 0.1.188: parrots

Apply on 0.1.187 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(24 files: 7 new, the zoo parrot's server and client entities, its animation controllers and render controller, two
scripts and the test plan; 17 replacing ones 0.1.187 has: 13 scripts, sounds.json, en_US.lang, the test file and
status.md; no manifests). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 17 files it
replaces, as the laptop has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the
ZooCraft Tychoon folder on the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.188 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.188\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.187 must be applied first: if the
   add-on still reads 0.1.186 or older, apply `zoocraft-ship\0.1.186\` and then `zoocraft-ship\0.1.187\` from the same
   archive by their own APPLY.md first, each only if the add-on doesn't already read it.)
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version). No world
   files: the starter world and Austin's worlds stay as they are.
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.188 and 357), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

A new entity: quit Minecraft completely and start it again. Works in any world. Test plan:
`docs\Parrots_test_plan.md`.
