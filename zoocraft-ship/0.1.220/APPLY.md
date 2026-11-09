# ZooCraft 0.1.220: Austin's residents (his spec, stage A)

Apply on 0.1.219 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(24 files: 8 new, 2 scripts and 6 resident skins; 16 replacing ones 0.1.219 has: 7 scripts, the resident's client
entity and render controllers, 4 resident skins, the test file, status.md and the residents' test plan; no
manifests).
`SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 16 files it replaces, as the laptop
has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the
ZooCraft Tychoon folder on the laptop).

0. If every line of `SHA256SUMS.txt` already matches the add-on's files, it was applied already (go by the hashes,
   not the version label: on the laptop the label reads behind the content, see the end): write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.220\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.219 must be applied first: if the
   add-on doesn't have it yet, apply `zoocraft-ship\0.1.186\`, `zoocraft-ship\0.1.187\`,
   `zoocraft-ship\0.1.188\`, `zoocraft-ship\0.1.189\`, `zoocraft-ship\0.1.190\`, `zoocraft-ship\0.1.191\`,
   `zoocraft-ship\0.1.192\`, `zoocraft-ship\0.1.193\`, `zoocraft-ship\0.1.194\`, `zoocraft-ship\0.1.195\`,
   `zoocraft-ship\0.1.196\`, `zoocraft-ship\0.1.197\`, `zoocraft-ship\0.1.198\`, `zoocraft-ship\0.1.199\`,
   `zoocraft-ship\0.1.200\`, `zoocraft-ship\0.1.201\`, `zoocraft-ship\0.1.202\`, `zoocraft-ship\0.1.203\`, `zoocraft-ship\0.1.204\`, `zoocraft-ship\0.1.205\`, `zoocraft-ship\0.1.206\`, `zoocraft-ship\0.1.207\`, `zoocraft-ship\0.1.208\`, `zoocraft-ship\0.1.209\`, `zoocraft-ship\0.1.210\`, `zoocraft-ship\0.1.211\`, `zoocraft-ship\0.1.212\`, `zoocraft-ship\0.1.213\`, `zoocraft-ship\0.1.214\`, `zoocraft-ship\0.1.215\`, `zoocraft-ship\0.1.216\`, `zoocraft-ship\0.1.217\`, `zoocraft-ship\0.1.218\` and `zoocraft-ship\0.1.219\` from the same archive by their own APPLY.md first, in that order, each only if its own `SHA256SUMS.txt` doesn't already match the add-on's files.)
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version). No world
   files: the starter world and Austin's worlds stay as they are.
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 395 tests; the version is one more than the BP manifest read before the build: 0.1.189 on the laptop), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

Six new skin files (the residents' looks): quit Minecraft completely and start it again. Test plan:
`docs\Residents_test_plan.md` (its 0.1.220 section). The four stand-in residents move out of a world when it
loads; Austin's ten replace them and move into empty homes by themselves once the zoo unlocks them.

The laptop's version label: build.cmd adds one to the manifests' version each build, and the laptop applied
0.1.186 to 0.1.217 with one build, so its packs read 31 behind the content (0.1.188 for 0.1.219, 0.1.189 after this
build). Austin chose to catch the label up after his playtest. Until then, go by the hashes, never the label, and
never edit a manifest by hand.
