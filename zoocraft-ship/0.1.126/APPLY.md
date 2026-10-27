# ZooCraft 0.1.126: the Goblin Shark and the Anglerfish

Apply on 0.1.125 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(40 files: 20 new, among them the goblin shark's and the anglerfish's entity and client files, models, skins, animations,
controllers and spawn rules; 20 replacing ones 0.1.125 shipped: sixteen script files, the lang file, the test file, status.md and the
Trench test plan). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 19 files it replaces, as the laptop
has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on the laptop).

1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.126\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes.
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path
   (new files make their folders). Delete nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.126 and 279), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

New entity and texture files: quit Minecraft fully and start it again. Then `/zoocraft:build` in a fresh Superflat
world and walk to the Goblin Shark Tank and the Anglerfish Tank, dark stone houses with a tinted front. Test plan:
`docs\Trench_test_plan.md` steps 21 to 28.
