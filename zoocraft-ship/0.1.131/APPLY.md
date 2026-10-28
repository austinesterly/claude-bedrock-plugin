# ZooCraft 0.1.131: the Deep Trench loads

Apply on 0.1.130 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(4 files, all replacing ones 0.1.130 has: the Deep Trench biome, the test file, status.md and the Trench test plan).
`SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 4 files it replaces, as the laptop
has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on
the laptop).

1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.131\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes.
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path.
   Delete nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.131 and 284), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

Changed biome file: quit Minecraft fully and start it again. The world made under 0.1.130 has no Deep Trench in the
chunks it already made, so make a new world (not Flat). Test plan: `docs\Trench_test_plan.md` steps 60 to 62
(a clean content log, `/locate biome zoocraft:deep_trench`), then 52 to 59.
