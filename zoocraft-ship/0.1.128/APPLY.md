# ZooCraft 0.1.128: the sharks' faces and the detailed anglerfish

Apply on 0.1.127 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(19 files, none new, all replacing ones 0.1.127 has: the models, skins and animations of the great white, the
hammerhead, the goblin shark, the anglerfish and the whale shark, the giant stingray's skin, the test file, status.md
and the Trench test plan). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 19 files
it replaces, as the laptop has them. Paths in both are relative to the folder that holds `addon\` (this folder, and
the ZooCraft Tychoon folder on the laptop).

1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.128\`
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
   (expect 0.1.128 and 281), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

New model and skin files: quit Minecraft fully and start it again. Then `/zoocraft:build` in a fresh Superflat
world and walk to the shark tanks, the trench tanks, the Whale Shark Tank and the Stingray Tank. Test plan:
`docs\Trench_test_plan.md` steps 36 to 41.
