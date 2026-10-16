# ZooCraft 0.1.78: fix for the crocodile animations

Applied on 0.1.77 by relay (text edits), built on the laptop 2026-10-16 with 144 tests. This folder holds the three
files as 0.1.78 has them (`SHA256SUMS.txt`) and as 0.1.77 had them (`BEFORE.txt`), for the record and as a
fallback: copying the `addon\` files over 0.1.77 gives the same result.

The crocodile's drag and snap animations failed to load ("Precomputed cubic interpolation requires keyframes have
constant data"): catmullrom keys must hold plain numbers. The drag's neck keys are now linear; the snap's are numbers.
A full Minecraft restart is needed after the build.
