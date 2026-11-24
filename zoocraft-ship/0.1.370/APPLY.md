# ZooCraft 0.1.370: Zach sings on the zoo paths, with his guitar case and fried chicken

Apply on 0.1.369 as built (if 0.1.369 isn't in yet, apply it first by its own APPLY.md, then this, then run build.cmd once for both).

Everything under `addon\` in this folder is the exact file the add-on should hold
(23 files: 12 replace ones 0.1.369 has, 11 are new; no manifests). `SHA256SUMS.txt` has the SHA-256 of each file;
`BEFORE.txt` has the SHA-256 of the 12 files it replaces, as the laptop has them after 0.1.369. Paths in both are
relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on the laptop). Nothing is
removed.

The laptop downloads only this version's own zip, never the whole branch (Austin, 12 Nov: "when we download from
github, it should only be the current updated version").

0. If every line of `SHA256SUMS.txt` already matches the add-on's files, it was applied already (go by the hashes,
   not the version label): write nothing, don't run build.cmd, just run the tests and post the version and the test
   count.
1. The laptop session downloads only `zoocraft-ship/0.1.370/0.1.370.zip` from raw.githubusercontent.com at the
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
   built and the test count (expect 574 tests and no validation errors; the version is one more than the BP manifest
   read before the build), or what failed.
8. Once the build has passed, clean up (Austin, 12 Nov: "Delete the old zip files everytime", and "we only need the
   last days backup", "We can just delete them, we would never need an old backup"):
   - Delete the temp folder(s) (the zips and what was extracted from them), and any
     `claude-bedrock-plugin-claude-project-thread-te8exa*.zip` files and folders extracted from them in Downloads.
     Leave the Oct 13 folder alone.
   - In `addon\backups\`, permanently delete (not to the Recycle Bin) each folder named `yyyyMMdd-HHmmss` whose date
     is before yesterday, by the laptop's own date. Keep yesterday's and today's (this apply's included), and leave
     anything in `addon\backups\` that isn't named that way. Nothing else is deleted.
New item, sound and textures: close Minecraft fully and open it again. World files are untouched.

After step 5, set the LastWriteTime of every file just copied to the current time (PowerShell: `(Get-Item $path).LastWriteTime = Get-Date`). The zip's files carry a fixed old date, and OneDrive has skipped syncing files whose date did not change. Changing the date does not change the hashes.
Test plan: `docs\Residents_test_plan.md` (its 0.1.370 section).

The laptop's version label runs behind the content: 0.1.294 read 0.1.276, 0.1.324 read 0.1.302, 0.1.325 and 0.1.326 were one build and read 0.1.303, 0.1.335 read 0.1.312; 0.1.336 to 0.1.339 built together read 0.1.313, 0.1.340 read 0.1.314, 0.1.341 read 0.1.315, 0.1.342 read 0.1.316, 0.1.343 read 0.1.317, 0.1.344 read 0.1.318, 0.1.345 read 0.1.319, 0.1.346 read 0.1.320, 0.1.347 read 0.1.321, 0.1.348 read 0.1.322, 0.1.349 read 0.1.323, 0.1.352 read 0.1.326, 0.1.353 read 0.1.327, 0.1.356 read 0.1.330, 0.1.357 read 0.1.331, 0.1.358 read 0.1.332, 0.1.359 read 0.1.333, 0.1.360 read 0.1.334, 0.1.361 read 0.1.335, 0.1.362 read 0.1.336, 0.1.363 read 0.1.337, 0.1.364 read 0.1.338, 0.1.365 to 0.1.368 built together read 0.1.339, 0.1.369 read 0.1.340. This one reads 0.1.341, or one more than the last run read. Go by the
hashes, never the label, and never edit a manifest by hand.
