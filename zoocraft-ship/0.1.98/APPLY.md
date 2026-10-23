# ZooCraft 0.1.98: Nether and End visitors

Apply on 0.1.97 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(20 files: 7 new, 13 replacing 0.1.97's). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the
SHA-256 of the 13 files it replaces, as 0.1.97 has them. Paths in both are relative to the folder that holds
`addon\` (this folder, and the ZooCraft Tychoon folder on the laptop).

If 0.1.97 isn't applied yet, apply `zoocraft-ship\0.1.97\` first (and any earlier one that isn't in yet), each by its
own APPLY.md from the same archive, and build each one; leave out their step 8 (the clean-up) and do this one's step 8
at the end instead.

1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.98\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. The 7 new files must not be
   there yet; if one is, stop and say which.
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path
   (create folders as needed). Delete nothing in the add-on, install nothing, and don't touch the manifests
   (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.98 and 261), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

New guest skins: close Minecraft completely and start it again (leaving the world isn't enough). The test plan is
`docs\Guests_test_plan.md`, section 0.1.98.
