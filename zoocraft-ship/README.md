# ZooCraft ship files

Batch files for the ZooCraft Tycoon add-on, one folder per version. Each `night_N.txt` (or similar) is a self-contained batch of FILE, HEX and EDIT blocks with SHA-256 checks, applied in order on the laptop that holds the add-on. `SHA256SUMS.txt` lists each batch file's own hash.

From 0.1.74 a version folder can instead hold the files themselves under `addon\`, with `SHA256SUMS.txt` (each file's hash), `BEFORE.txt` (the hashes of the files it replaces, as the version before has them) and `APPLY.md` (the steps).
