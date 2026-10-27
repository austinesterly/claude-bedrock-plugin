# ZooCraft 0.1.123: the squid swim

Apply on 0.1.122 as built (0.1.121's code; the laptop's second build.cmd run bumped the number). Everything under `addon\` in this folder is the exact file the add-on should hold
(5 files, all replacing ones 0.1.121 shipped: the two squid entity files, the test file, status.md and the test plan). `SHA256SUMS.txt`
has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 5 files it replaces, as the laptop has them. Paths in both are relative to the folder that holds `addon\`
(this folder, and the ZooCraft Tychoon folder on the laptop).

1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.123\`
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
   (expect 0.1.123 and 276), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

Edited entity files only: leave the world and rejoin (a full restart is fine too). Then `/zoocraft:build` in a fresh Superflat
world and watch the Squid and Glow Squid tanks: the squid swim about, and the content log has no "Can't use SquidIdleGoal"
lines. Test plan: `docs\Aquarium_test_plan.md` step 22.
