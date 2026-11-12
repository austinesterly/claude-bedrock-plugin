# ZooCraft 0.1.261: Guido's Bow Case and ZooCraft's fifteen bows

Apply on 0.1.260 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(136 files: 122 new ones (the 15 bows: items, attachables, icons and drawing pictures; the Bow Case block, its
item, store entity, recipe, model and pictures; 4 scripts) and 14 replacing ones 0.1.260 has (scripts, the lists of
blocks, items and textures, the names, the test file, status.md and the residents' test plan); no manifests).
`SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 14 files it replaces, as the laptop
has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the
ZooCraft Tychoon folder on the laptop).

0. If every line of `SHA256SUMS.txt` already matches the add-on's files, it was applied already (go by the hashes,
   not the version label): write nothing, don't run build.cmd, just run the tests and post the version and the test
   count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.261\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.260 must be applied first: if the
   add-on doesn't have it yet, apply `zoocraft-ship\0.1.260\` from the same archive by its own APPLY.md first, which
   names the versions before it.) If a file cannot be read (a OneDrive placeholder), stop and say so: Austin sets the
   folder to "Always keep on this device".
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version). No world
   files: the starter world and Austin's worlds stay as they are.
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 435 tests; the version is one more than the BP manifest read before the build: 0.1.261 when 0.1.260 read
   0.1.260), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

New items, a new block and new pictures: Minecraft must be closed fully and opened again. Old worlds are fine.
Test plan: `docs\Residents_test_plan.md` (its 0.1.261 section). Austin's review list of the calls made for these five:
`playtest\NPC_batch3_suggestions.md` in the project files (nothing to do on the laptop for it).

The laptop's version label: Austin chose to catch the label up (build.cmd run until the packs read 0.1.257, the same
as the content). If that catch-up stopped part-way, say where it stopped, finish it first (build.cmd only, with
Minecraft closed; if it is open, ask Austin to close it), then apply this. From here on the label should equal the
version. Go by the hashes, never the label, and never edit a manifest by hand.
