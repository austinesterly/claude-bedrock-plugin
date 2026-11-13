# ZooCraft 0.1.281: Jack's 100-friendship rewards

Apply on 0.1.280 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(11 files, all replacing ones 0.1.280 has: seven scripts, the tests, balance.js, status.md and the residents' test
plan; no manifests). This version also takes one file out of the add-on: `REMOVE.txt` names it (the Steel Rod's
recipe, which is now Jack's to give) with its SHA-256 as 0.1.280 has it. `SHA256SUMS.txt` has the SHA-256 of each new
file; `BEFORE.txt` has the SHA-256 of the 11 files it replaces, as the laptop has them after 0.1.280. Paths in all
three are relative to the folder that holds `addon\` (this folder, and the ZooCraft Tychoon folder on the laptop).

The laptop downloads only this version's own zip, never the whole branch (Austin, 12 Nov: "when we download from
github, it should only be the current updated version").

0. If every line of `SHA256SUMS.txt` already matches the add-on's files and the file in `REMOVE.txt` is gone, it was
   applied already (go by the hashes, not the version label): write nothing, don't run build.cmd, just run the tests
   and post the version and the test count.
1. The laptop session downloads only `zoocraft-ship/0.1.281/0.1.281.zip` from raw.githubusercontent.com at the
   commit the brief names, into a new temp folder outside OneDrive. It checks the zip's SHA-256 against the one in
   the brief (stop and say so if it differs), then extracts it with `Expand-Archive -LiteralPath` into that temp
   folder. The zip holds this folder: `APPLY.md`, `SHA256SUMS.txt`, `BEFORE.txt`, `REMOVE.txt` and `addon\`.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` and `REMOVE.txt` against the add-on's own `addon\` files. If they all match, go
   on to step 4. If they don't, 0.1.279 or 0.1.280 may not be in yet (their briefs went out while the laptop was
   asleep): for each of those briefs that is waiting and not done, oldest first, do its steps 1 to 6 now (download
   and check its zip, back up, copy, check), but don't run build.cmd for it; then check again. If it still doesn't
   match, stop, write nothing more, and post the paths that differ with the first 8 characters of their hashes. If a
   file cannot be read (a OneDrive placeholder), stop and say so: Austin sets the folder to "Always keep on this
   device".
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first, keeping its
   relative path. Then MOVE the file listed in `REMOVE.txt` into that same backup folder at its relative path, so it
   leaves the add-on (moved, not deleted: it goes when that backup folder ages out in step 8).
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete nothing
   else in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version). No world files:
   the starter world and Austin's worlds stay as they are.
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files, and that the file in `REMOVE.txt` is
   no longer in the add-on. All must hold.
7. Run build.cmd once (once for every version that went in now). Post one short line in the thread: the version it
   built and the test count (expect 455 tests and no validation errors; the version is one more than the BP manifest
   read before the build), or what failed.
8. Once the build has passed, clean up (Austin, 12 Nov: "Delete the old zip files everytime", and "we only need the
   last days backup", "We can just delete them, we would never need an old backup"):
   - Delete the temp folder(s) (the zips and what was extracted from them), and any
     `claude-bedrock-plugin-claude-project-thread-te8exa*.zip` files and folders extracted from them in Downloads.
     Leave the Oct 13 folder alone.
   - In `addon\backups\`, permanently delete (not to the Recycle Bin) each folder named `yyyyMMdd-HHmmss` whose date
     is before yesterday, by the laptop's own date. Keep yesterday's and today's (this apply's included), and leave
     anything in `addon\backups\` that isn't named that way. Nothing else is deleted.

Scripts and a recipe change, so close Minecraft fully and open it again. Old worlds are fine: Steel Rods already made
stay; a friend who already had Jack's Flint and Steel gets his Steel Rod the next time they talk to him. To try it:
/zoocraft:friendship jack 100, then talk to Jack. Test plan: `docs\Residents_test_plan.md` (its 0.1.281 section).
Austin's review list of the calls made: `playtest\NPC_batch3_suggestions.md` in the project files, items 246 to 255
(nothing to do on the laptop for it).

The laptop's version label: the label runs behind the content. Built one version at a time, 0.1.279 reads 0.1.263,
0.1.280 reads 0.1.264 and this one 0.1.265. Each build that holds several versions takes one number for all of them
(0.1.279 to 0.1.281 in one build read 0.1.263). Go by the hashes, never the label, and never edit a manifest by hand.
