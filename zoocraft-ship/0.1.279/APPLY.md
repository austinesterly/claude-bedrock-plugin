# ZooCraft 0.1.279: the closer sky

Apply on 0.1.278 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(11 files, all replacing ones 0.1.278 has: eight scripts, the tests, status.md and the residents' test plan; nothing
new, no manifests). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the SHA-256 of the 11 files it
replaces, as the laptop has them. Paths in both are relative to the folder that holds `addon\` (this folder, and the
ZooCraft Tychoon folder on the laptop).

The laptop downloads only this version's own zip, never the whole branch (Austin, 12 Nov: "when we download from
github, it should only be the current updated version").

0. If every line of `SHA256SUMS.txt` already matches the add-on's files, it was applied already (go by the hashes,
   not the version label): write nothing, don't run build.cmd, just run the tests and post the version and the test
   count.
1. The laptop session downloads only `zoocraft-ship/0.1.279/0.1.279.zip` from raw.githubusercontent.com at the
   commit the brief names, into a new temp folder outside OneDrive. It checks the zip's SHA-256 against the one in
   the brief (stop and say so if it differs), then extracts it with `Expand-Archive -LiteralPath` into that temp
   folder. The zip holds this folder: `APPLY.md`, `SHA256SUMS.txt`, `BEFORE.txt` and `addon\`.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.278 must be applied first.) If a
   file cannot be read (a OneDrive placeholder), stop and say so: Austin sets the folder to "Always keep on this
   device".
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version). No world
   files: the starter world and Austin's worlds stay as they are.
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 453 tests and no validation errors; the version is one more than the BP manifest read before the build), or
   what failed.
8. Once the build has passed, clean up (Austin, 12 Nov: "Delete the old zip files everytime", and "we only need the
   last days backup", "We can just delete them, we would never need an old backup"):
   - Delete the temp folder (the zip and what was extracted from it), and any
     `claude-bedrock-plugin-claude-project-thread-te8exa*.zip` files and folders extracted from them in Downloads.
     Leave the Oct 13 folder alone.
   - In `addon\backups\`, permanently delete (not to the Recycle Bin) each folder named `yyyyMMdd-HHmmss` whose date
     is before yesterday, by the laptop's own date. Keep yesterday's and today's (this apply's included), and leave
     anything in `addon\backups\` that isn't named that way. Nothing else is deleted.

Only scripts change, but Minecraft should still be closed fully and opened again. Old worlds are fine: every island
the fishing sky already built in a world stays where it is, as it is, and old sea portals still open onto the same
island; the new, closer islands are built round them as players come near. Test plan: `docs\Residents_test_plan.md`
(its 0.1.279 section). Austin's review list of the calls made: `playtest\NPC_batch3_suggestions.md` in the project
files, items 225 to 233 (nothing to do on the laptop for it).

The laptop's version label: the label runs behind the content: 0.1.278 reads 0.1.262, so this build should read
0.1.263. Go by the hashes, never the label, and never edit a manifest by hand.
