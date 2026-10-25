# ZooCraft 0.1.104: the test zoo, /zoocraft:build

Apply on 0.1.103 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(8 files: 3 new, 5 replacing 0.1.103's). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the
SHA-256 of the 5 files it replaces, as 0.1.103 has them. Paths in both are relative to the folder that holds `addon\`
(this folder, and the ZooCraft Tychoon folder on the laptop).

If 0.1.103 isn't applied yet, apply `zoocraft-ship\0.1.103\` first by its own APPLY.md from the same archive and
build it (and 0.1.102 before that, the same way, if that isn't in either); leave out their step 8 (the clean-up)
and do this one's step 8 at the end instead.

1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.104\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. The 3 new files must not be
   in the add-on yet; if any is, stop and say which.
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path.
   Delete nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.104 and 267), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

Scripts only: leaving the world and joining again is enough for 0.1.104 itself (0.1.103's new fence block needs
Minecraft closed completely and started again, if it wasn't in before). The test plan is `docs\Test_zoo_test_plan.md`.
