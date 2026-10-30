# The Chorus Meadow: test plan (0.1.142)

Module 8 (biomes), its second version. Austin's idea (2026-10-12): "a Chorus Meadow for the Chorus Deer (with water, so
no endermen at all, and realistic pure whitewood trees)". The plan and what comes next: `research/biomes_plan.md`; what
it rests on: `research/biomes_facts.md`.

What it is: wide patches of meadow on the outer End islands (800 blocks or more from the main island, past the void
gap): soft green Chorus Turf over the end stone with tufts of End Grass, small ponds of water, white whitewood trees in
three shapes (tall, young, and old branching ones), and chorus stalks. They cover about a quarter of the outer islands'
ground. While you are in one: a soft lilac mist, pale motes drifting up round you, a low chime now and then, and its
name on screen as you walk in ("Chorus Meadow", once in a while, not every step). No endermen stay in them: one that
spawns on the meadow is gone at once, and one that wanders in near you teleports away. Chorus Deer spawn on the
turf as well as on end stone. The Field Journal's Places page has it (found the first time you walk onto one).

Why it isn't a real biome: the game takes no custom biome in the End (checked on Mojang's server: "Dimension must be
either 'minecraft:overworld' or 'minecraft:nether'"). So the meadows are made with the world as patches of the End, as
the Eternal End add-on makes its End biomes, and the mist, motes, sounds and name come from the add-on's script while
you stand on the turf. `/locate biome` can't find them, and the game's own End fog and music stay underneath.

New blocks (you can mine and use them): Chorus Turf (counts as end stone in a Chorus Deer exhibit floor, and for letting
one go), Whitewood Log (4 Whitewood Planks at a crafting table; 2 planks make 4 sticks), Whitewood Leaves (shears keep
them; they don't decay) and End Grass (shears keep it).

They only appear where the End is made fresh: a new world, or outer islands you have never been to (far from where you
have been). Places already explored don't change. New block, texture, fog and particle files: quit Minecraft fully and
start it again.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seed 12345): the whole behaviour pack
  loads with no content log errors, the new blocks and every feature and rule included.
- How much: the top block of every column in 10 squares of 128 by 128 blocks spread over the outer islands (83,238
  columns of land): meadow ground on 26.7% of them; 8 of the 10 squares had meadows, one had none and one a few spots.
  The meadows' edges follow the land, frayed column by column, with no chunk lines.
- Ponds: in 4 squares, 27 to 190 blocks of pond water each (1 to 6 ponds), flat with the ground round them and held in
  by it (a pond is only made where the ground a block past its edge is at its level or higher). Chorus: the End's own
  chorus grows only on bare end stone, so none came up on the turf at first; the meadows now grow their own stalks (on
  end stone under them, with grown chorus flowers).
- Endermen, with a player standing in a meadow for 4 minutes, two meadows: 233 endermen spawned round them, 94 of those on meadow ground (turf, End Grass, leaves), and none stayed there: the 13 still near the player at the end all stood on bare end stone. Chorus Deer: 11 and 7 spawned round the two meadows in those 4 minutes (9 in 5 minutes on plain end stone in an earlier run). The rest of the End animals spawn on end stone as before.
- The tests (295), the type check and the pack checker (no new warnings).
- What can't be checked without a screen: how the mist, motes and textures look, and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again. Make a new world (or use one whose outer End islands you haven't explored), beat the dragon or use an End gateway, and fly out past the void gap. | The outer End islands as before, with patches of green turf among the end stone. |
| 2 | Before Dimensional Preparation research, open the Field Journal's Places page. | A Chorus Meadows line: "not found yet. Out on the far End islands. Dimensional Preparation (Research Desk) says where to look." |
| 3 | Walk onto a meadow. | "Chorus Meadow" on screen (with "The End" under it), "You found a Chorus Meadow" in chat, a lilac mist closing in the distance, pale motes drifting up round you, a soft chime now and then. |
| 4 | Look around the meadow. | Green Chorus Turf with End Grass tufts, white whitewood trees (some tall and straight, some big and branching), small ponds, and chorus stalks with flowers. |
| 5 | Walk off it onto bare end stone and wait a few seconds. | The mist clears back to the End's own; the motes and chimes stop. Walking back in within 2 minutes doesn't show the name again. |
| 6 | Stay in the meadow a few minutes (Survival). | No endermen standing on the meadow; one that comes onto it near you vanishes with the enderman's teleport sound. Endermen on the bare end stone round it are as before. |
| 7 | Use an enderman spawn egg on the turf right beside you. | It stays (only the game's own spawns are sent away); a name tag keeps one too. |
| 8 | Watch for wild animals. | Chorus Deer on the turf now and then, as on the bare end stone. |
| 9 | Mine a turf block, a log, leaves (with shears) and End Grass (with shears); craft planks from the log. | Each drops itself (leaves without shears: now and then a stick); 1 log makes 4 Whitewood Planks. |
| 10 | Lay 8 Chorus Turf in a Chorus Deer exhibit floor instead of end stone and measure. | The End ground need is met, as with end stone. |
| 11 | Open the content log (Settings, Creator) after the steps above. | No lines about `chorus_meadow`, `whitewood`, `chorus_turf` or `end_grass`. |
