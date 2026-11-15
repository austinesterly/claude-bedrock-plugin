# ZooCraft 0.1.300: fix for the Sloth's entity file (the build stopped at validation)

Apply on 0.1.299's files (copied in on 15 Nov; their build stopped at validation, which this fixes). Everything under `addon\` in this folder is the exact file the add-on should hold
(3 files, all replacing ones 0.1.299 has: the Sloth's entity, the tests, a doc; no manifests). `SHA256SUMS.txt` has the SHA-256 of each file; `BEFORE.txt` has the SHA-256 of the 3 files it replaces,
as the laptop has them after 0.1.299. Paths in both are relative to the folder that holds `addon\` (this folder, and
the ZooCraft Tychoon folder on the laptop). Nothing is removed.

The laptop downloads only this version's own zip, never the whole branch (Austin, 12 Nov: "when we download from
github, it should only be the current updated version").

0. If every line of `SHA256SUMS.txt` already matches the add-on's files, it was applied already (go by the hashes,
   not the version label): write nothing, don't run build.cmd, just run the tests and post the version and the test
   count.
1. The laptop session downloads only `zoocraft-ship/0.1.300/0.1.300.zip` from raw.githubusercontent.com at the
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
   built and the test count (expect 474 tests and no validation errors; the version is one more than the BP manifest
   read before the build), or what failed.
8. Once the build has passed, clean up (Austin, 12 Nov: "Delete the old zip files everytime", and "we only need the
   last days backup", "We can just delete them, we would never need an old backup"):
   - Delete the temp folder(s) (the zips and what was extracted from them), and any
     `claude-bedrock-plugin-claude-project-thread-te8exa*.zip` files and folders extracted from them in Downloads.
     Leave the Oct 13 folder alone.
   - In `addon\backups\`, permanently delete (not to the Recycle Bin) each folder named `yyyyMMdd-HHmmss` whose date
     is before yesterday, by the laptop's own date. Keep yesterday's and today's (this apply's included), and leave
     anything in `addon\backups\` that isn't named that way. Nothing else is deleted.
With 0.1.297 to 0.1.299 going in by the same build (new mobs, items, recipes, textures), Minecraft needs a full restart. Worlds are untouched. Test plan:
`docs\Residents_test_plan.md` (its 0.1.297 to 0.1.299 sections).

The laptop's version label runs behind the content: 0.1.294 read 0.1.276, 0.1.296 read 0.1.277, so the one build of 0.1.297 to 0.1.300 reads 0.1.278. Go by the
hashes, never the label, and never edit a manifest by hand.
