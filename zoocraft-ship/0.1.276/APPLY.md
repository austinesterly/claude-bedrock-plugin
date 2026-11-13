# ZooCraft 0.1.276: the fishing sky's exotic islands, with Diamond Shards

Apply on 0.1.275 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(50 files: 33 new ones, the Diamond Shards block, items, recipe and pictures, the Weeping Willow leaves and strands,
the willow and azalea tree features and the exotic catch tables, and 17 replacing ones 0.1.275 has: five scripts,
six tree features, the RP's blocks.json, en_US.lang and two texture lists, the tests, status.md and the residents'
test plan; no manifests). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 17
files it replaces, as the laptop has them. Paths in both are relative to the folder that holds `addon\` (this
folder, and the ZooCraft Tychoon folder on the laptop).

The laptop downloads only this version's own zip, never the whole branch (Austin, 12 Nov: "when we download from
github, it should only be the current updated version").

0. If every line of `SHA256SUMS.txt` already matches the add-on's files, it was applied already (go by the hashes,
   not the version label): write nothing, don't run build.cmd, just run the tests and post the version and the test
   count.
1. The laptop session downloads only `zoocraft-ship/0.1.276/0.1.276.zip` from raw.githubusercontent.com at the
   commit the brief names, into a new temp folder outside OneDrive. It checks the zip's SHA-256 against the one in
   the brief (stop and say so if it differs), then extracts it with `Expand-Archive -LiteralPath` into that temp
   folder. The zip holds this folder: `APPLY.md`, `SHA256SUMS.txt`, `BEFORE.txt` and `addon\`.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.275 must be applied first.) If a
   file cannot be read (a OneDrive placeholder), stop and say so: Austin sets the folder to "Always keep on this
   device".
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version). No world
   files: the starter world and Austin's worlds stay as they are.
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 450 tests and no validation errors; the version is one more than the BP manifest read before the build), or
   what failed.
8. Once the build has passed, clean up (Austin, 12 Nov: "Delete the old zip files everytime", and "we only need the
   last days backup", "We can just delete them, we would never need an old backup"):
   - Delete the temp folder (the zip and what was extracted from it), and any
     `claude-bedrock-plugin-claude-project-thread-te8exa*.zip` files and folders extracted from them in Downloads.
     Leave the Oct 13 folder alone.
   - In `addon\backups\`, permanently delete (not to the Recycle Bin) each folder named `yyyyMMdd-HHmmss` whose date
     is before yesterday, by the laptop's own date. Keep yesterday's and today's (this apply's included), and leave
     anything in `addon\backups\` that isn't named that way. Nothing else is deleted.

New blocks, items and textures: Minecraft must be closed fully and opened again. Old worlds are fine (islands already
built in the fishing sky stay as they are; exotic ones get built when a player first comes near, and a sea portal
keeps leading to the island it led to). The six common tree features (oak_round, oak_branchy, oak_tall, oak_great,
birch_tall, birch_slim) only gain plants they may grow over, so they also grow beside flowers in newly made land;
land already made is untouched. Test plan: `docs\Residents_test_plan.md` (its 0.1.276 section). Austin's review list
of the calls made: `playtest\NPC_batch3_suggestions.md` in the project files, items 189 to 199 (nothing to do on the
laptop for it).

The laptop's version label: the label runs behind the content: 0.1.275 reads 0.1.259, so this build should read
0.1.260. Go by the hashes, never the label, and never edit a manifest by hand.
