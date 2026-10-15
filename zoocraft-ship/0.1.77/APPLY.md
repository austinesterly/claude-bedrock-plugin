# ZooCraft 0.1.77: Big predators (the Crocodile)

Apply on 0.1.76 as built (apply the 0.1.75 and 0.1.76 folders first, in that order). Everything under `addon\` in this folder is the exact file the add-on should hold
(30 new files, 24 replacing 0.1.76's). `SHA256SUMS.txt` has the SHA-256 of each one; `BEFORE.txt` has the
SHA-256 of the 24 files it replaces, as 0.1.76 has them. Paths in both are relative to the folder that holds
`addon\` (this folder, and the ZooCraft Tychoon folder on the laptop).

1. Austin downloads the branch ZIP into Downloads. Extract it with Expand-Archive into a new folder in
   Downloads. The files are in `zoocraft-ship\0.1.77\` inside it.
2. Check every line of `SHA256SUMS.txt` against the extracted files (`Get-FileHash -Algorithm SHA256`).
   If any is missing or differs, stop, write nothing, and say which in the thread.
3. Check every line of `BEFORE.txt` against the add-on's own `addon\` files. If any differs, stop, write
   nothing, and post those paths with the first 8 characters of their hashes.
4. Copy each file listed in `BEFORE.txt` into a new `addon\backups\<yyyyMMdd-HHmmss>\` folder first,
   keeping its relative path.
5. Copy every file under the extracted `addon\` into the add-on's `addon\` at the same relative path
   (create folders as needed). Delete nothing, install nothing, and don't touch the manifests
   (build.cmd bumps the version).
6. Check every line of `SHA256SUMS.txt` again, now against the add-on's files. All must match.
7. Run build.cmd. Post one short line in the thread: the version it built and the test count
   (expect 0.1.77 and 143), or what failed.

New entities, a new block and textures: Austin needs a full Minecraft restart after the build.
