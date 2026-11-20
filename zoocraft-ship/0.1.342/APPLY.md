# ZooCraft 0.1.342: Acufend's great cave and the Frequency Friends' statue

Apply on 0.1.341 as built (if 0.1.341 isn't in yet, apply it first by its own APPLY.md, then this, then run build.cmd once for both).

Everything under `addon\` in this folder is the exact file the add-on should hold
(19 files: 9 replace ones 0.1.341 has, 10 are new; no manifests). `SHA256SUMS.txt` has the SHA-256 of each file;
`BEFORE.txt` has the SHA-256 of the 9 files it replaces, as the laptop has them after 0.1.341. Paths in both are
relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on the laptop). Nothing is
removed.

The laptop downloads only this version's own zip, never the whole branch (Austin, 12 Nov: "when we download from
github, it should only be the current updated version").

0. If every line of `SHA256SUMS.txt` already matches the add-on's files, it was applied already (go by the hashes,
   not the version label): write nothing, don't run build.cmd, just run the tests and post the version and the test
   count.
1. The laptop session downloads only `zoocraft-ship/0.1.342/0.1.342.zip` from raw.githubusercontent.com at the
   commit the brief names, into a new temp folder outside OneDrive. It checks the zip's SHA-256 against the one in
   the brief (stop and say so if it differs), then extracts it with `Expand-Archive -LiteralPath` into that temp
   folder. The zip holds this folder: `APPLY.md`, `SHA256SUMS.txt`, `BEFORE.txt` and `addon\`.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If they all match, go on to step 4. If
   they don't, an earlier version is missing. If it still doesn't match, stop, write nothing more, and post the paths that
   differ with the first 8 characters of their hashes. If a file cannot be read (a OneDrive placeholder), stop and say
   so: Austin sets the folder to "Always keep on this device".
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first, keeping its
   relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path (new folders
   are made as needed). Delete nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps
   the version). No world files: the starter world and Austin's worlds stay as they are.
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd once (once for every version that went in now). Post one short line in the thread: the version it
   built and the test count (expect 547 tests and no validation errors; the version is one more than the BP manifest
   read before the build), or what failed.
8. Once the build has passed, clean up (Austin, 12 Nov: "Delete the old zip files everytime", and "we only need the
   last days backup", "We can just delete them, we would never need an old backup"):
   - Delete the temp folder(s) (the zips and what was extracted from them), and any
     `claude-bedrock-plugin-claude-project-thread-te8exa*.zip` files and folders extracted from them in Downloads.
     Leave the Oct 13 folder alone.
   - In `addon\backups\`, permanently delete (not to the Recycle Bin) each folder named `yyyyMMdd-HHmmss` whose date
     is before yesterday, by the laptop's own date. Keep yesterday's and today's (this apply's included), and leave
     anything in `addon\backups\` that isn't named that way. Nothing else is deleted.
Four new blocks, their textures and a new block shape, so close Minecraft fully and open it again. Worlds are
untouched. Test plan: `docs\Residents_test_plan.md` (its 0.1.342 section). Austin's review list of the calls made:
`playtest\NPC_batch3_suggestions.md` in the project files, items 711 to 722 (nothing to do on the laptop for it).

The laptop's version label runs behind the content: 0.1.294 read 0.1.276, 0.1.324 read 0.1.302, 0.1.325 and 0.1.326 were one build and read 0.1.303, 0.1.335 read 0.1.312; 0.1.336 to 0.1.339 built together read 0.1.313, 0.1.340 read 0.1.314. Built in one run with 0.1.341, this one reads 0.1.315; if 0.1.341 was built on its own first (0.1.315), this one reads 0.1.316. Go by the
hashes, never the label, and never edit a manifest by hand.
