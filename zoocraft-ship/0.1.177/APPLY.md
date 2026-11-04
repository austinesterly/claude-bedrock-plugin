# ZooCraft 0.1.177: the starter world

Two parts. The add-on part (steps 0 to 8) is applied now, as every version is. The world part waits for Austin's
answer in the thread about where the world should go: don't copy `world\` anywhere until a brief names W1 or W2 below.

## The add-on part

Apply on 0.1.176 as built. Everything under `addon\` in this folder is the exact file the add-on should hold
(5 files: 1 new, the test plan; 4 replacing ones 0.1.176 has: main.js,
starter\site.js, the test file and status.md). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the
SHA-256 of the 4 files it replaces, as the laptop has them. Paths in both are relative to the folder that holds
`addon\` (this folder, and the ZooCraft Tychoon folder on the laptop).

0. If `addon\packs\BP\manifest.json` already reads 0.1.177 and every line of `SHA256SUMS.txt` already matches the
   add-on's files, it was applied and built already: write nothing, don't run build.cmd, just run the tests and post
   the version and the test count.
1. The laptop session downloads the commit-pinned archive of this branch into a new temp folder outside
   OneDrive and extracts it with `Expand-Archive -LiteralPath`. The files are in `zoocraft-ship\0.1.177\`
   inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes. (0.1.176 must be applied first: if the
   add-on still reads 0.1.175 or older, apply `zoocraft-ship\0.1.176\` from the same archive by its own APPLY.md first.)
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path. Delete
   nothing in the add-on, install nothing, and don't touch the manifests (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.177 and 344), or what failed.
8. Austin's rule ("Delete the old zip files everytime"): once the build has passed, delete the temp folder
   (the archive and what was extracted from it), and any `claude-bedrock-plugin-claude-project-thread-te8exa*.zip`
   files and folders extracted from them in Downloads. Leave the Oct 13 folder alone, and nothing else.

Scripts only: leaving the world and joining again is enough. Works in any world; no world file is touched. Test plan:
`docs\Starter_world_test_plan.md`.

## The world part (only when a brief names W1 or W2)

`world\zoocraft_starter\` is the starter world, "ZooCraft Starter World" (9 files; their SHA-256 in
`WORLD_SHA256SUMS.txt`, paths relative to this folder). It has no packs of its own: its `world_behavior_packs.json` and
`world_resource_packs.json` name the add-on's pack UUIDs, so it uses the add-on installed as development packs. It needs
Minecraft 1.26.60 or newer. Get it from a fresh commit-pinned archive (steps 1 and 2, with `WORLD_SHA256SUMS.txt`), and
delete that temp folder after (step 8).

W1. Into Minecraft's worlds, as a new world:
   1. Find the worlds folder: `%APPDATA%\Minecraft Bedrock\Users\*\games\com.mojang\minecraftWorlds` (not the
      `Shared` user). Use the one whose folders hold Austin's worlds (each has a `level.dat`). If there is none, or more
      than one, stop and post the paths you found.
   2. If a `zoocraft_starter` folder is there already, stop and say so. Never overwrite or change any other world.
   3. Copy `world\zoocraft_starter` there as `zoocraft_starter`, then check every line of `WORLD_SHA256SUMS.txt` against
      the copy (the `world\` part of each path is now that worlds folder).
   4. Post one line: where it went, and that it shows as "ZooCraft Starter World" in Play, Worlds (reopen the list, or
      restart Minecraft if it isn't there).
W2. Into the ZooCraft Tychoon folder only: copy `world\zoocraft_starter` to `Starter world\zoocraft_starter` in it
   (next to `addon\`, not inside it), check the hashes the same way, and post one line. Nothing goes into Minecraft.
