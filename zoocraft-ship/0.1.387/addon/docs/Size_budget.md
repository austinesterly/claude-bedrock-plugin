# Size budget (0.1.387)

Austin, 26 Nov 2026: "what is the size of our addon, I do want to make it within Mojangs reccomended size".

Mojang's creator docs recommend, for an add-on: at most 25 MB uncompressed, at most 2,500 files (one page says 3,500), and under 800 texture handles.

| | Before (0.1.386) | Slim copy (0.1.387) | Recommended |
|---|---|---|---|
| Size, uncompressed | 27.1 MB | 21.7 MB | 25 MB or less |
| Files | 4,175 | 3,268 | 2,500 or 3,500 |
| Entity textures | about 330 | about 330 | under 800 |

How: `tools/slim.mjs` makes the copy that Minecraft loads and that goes into the .mcaddon. The source in `packs/` is unchanged.

1. Scripts: one file (`tools/bundle/main.js`, made in the cloud from the 460-odd script files, comments dropped). Its first line carries the hash of the scripts it was made from; the build stops if they differ.
2. Every .json is written without spaces and line breaks.
3. Render controllers, animations, animation controllers and models are merged into one file per folder and format version.

The build and a test both fail if the slim copy goes over 25 MB or 3,500 files.

What still takes the most room: structures (7.1 MB, mostly the Mythical Glade trees at about 1 MB each), the script bundle (6.2 MB), textures (1,166 files). Getting to 2,500 files would mean combining textures into atlases, which the game does not support for blocks and items.

Check after applying: the game loads with no content-log errors, residents talk, an animal's animations play, custom blocks (Bow Case, Rabbit Trophy) and custom mobs look right.
