# The Rift Willows: test plan (0.1.143)

Module 8 (biomes), its third version. Austin's idea (2026-10-12): a Rift Ferret biome "with massive white willow trees
and purple rift grass". The plan and what comes next: `research/biomes_plan.md`; what it rests on:
`research/biomes_facts.md`.

What it is: wide patches on the outer End islands (800 blocks or more from the main island, past the void gap), made the
same way as the Chorus Meadows but on the other side of the same pattern, so a willow patch and a meadow never touch:
violet Rift Turf over the end stone, thick with tall violet Rift Grass, under white weeping willows in three sizes. The
biggest have a trunk two blocks wide and stand about 20 blocks high, with crowns 15 to 20 blocks across; every willow
has strands of white leaves hanging from its crown, some down to the grass. While you are in one: a violet haze, small
sparks of violet and pale cyan light flickering round you, a low hum and now and then a high chime, and its name on
screen as you walk in ("Rift Willows", once in a while, not every step). Rift Ferrets spawn there more than anywhere.
The Field Journal's Places page has it (found the first time you walk onto one). Endermen are as anywhere else in the
End (only the meadows send them away).

As the meadows, it isn't a real biome (the game takes none in the End): the patches are made with the world, and the
haze, sparks, sounds and name come from the add-on's script while you stand on the turf.

New blocks (you can mine and use them): Rift Turf (counts as end stone in an exhibit floor, and for letting an End
animal go), Rift Grass (shears keep it), White Willow Log (makes 4 Whitewood Planks), White Willow Leaves (shears keep
them; they don't decay) and Willow Strands (shears keep them; a strand falls when what holds it up goes).

They only appear where the End is made fresh: a new world, or outer islands you have never been to. Places already
explored don't change. New block, texture, fog and particle files: quit Minecraft fully and start it again.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seed 12345): the whole behaviour pack
  loads with no content log errors, the new blocks, features and rules included.
- Willow shapes, grown one by one on a test platform and drawn from the side: the dark oak's flat crown looked like a
  table, the fancy oak's like a column and the mangrove's filled down to the ground, so the willows use the cherry
  tree's crown, which hangs at its rim (an ancient one: 22 blocks high, its crown 16 by 20 blocks). Strands:
  when the leaves over them were cleared, the strands they held fell (strands side by side used to hold each other up;
  fixed so only leaves, a log or the strand above hold one).
- How much: the top block of every column in 10 squares of 128 by 128 blocks spread over the outer islands (84,165 columns of land): willow ground (turf, grass and willows) on 35.9% of them and meadow ground on 25.5%; 9 of the 10 squares had willows. Where a square had both, the nearest meadow column was 7 to 15 blocks from a willow column: the two never meet. A grove drawn from a scan had about one willow every two chunks.
- Rift Ferrets, with a player standing 5 minutes at each place: 14, 9 and 10 spawned round two willow groves, all but one on Rift Turf, against 0, 3 and 3 round bare end stone; at the first grove's spot before the willows (0.1.142's run), 1.
- The tests (296), the type check and the pack checker (no new warnings).
- What can't be checked without a screen: how the haze, sparks and textures look, and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again. Make a new world (or use one whose outer End islands you haven't explored), beat the dragon or use an End gateway, and fly out past the void gap. | Among the outer islands, patches of violet ground with big white willows, as well as the green Chorus Meadows. |
| 2 | Before Dimensional Preparation research, open the Field Journal's Places page. | A Rift Willows line: "not found yet. Out on the far End islands. Dimensional Preparation (Research Desk) says where to look." |
| 3 | Walk onto the violet turf. | "Rift Willows" on screen (with "The End" under it), "You found the Rift Willows" in chat, a violet haze closing in the distance, small violet and pale cyan sparks flickering round you, a low hum now and then. |
| 4 | Look around. | Violet Rift Turf thick with tall Rift Grass; white willows, some huge with two-block trunks, their crowns hanging in curtains of white strands. |
| 5 | Walk off onto bare end stone and wait a few seconds; then walk into a Chorus Meadow. | The haze clears; in the meadow its own lilac mist and name instead. |
| 6 | Watch for wild animals. | Rift Ferrets on the violet turf, alone or in pairs, more than elsewhere in the End. |
| 7 | Mine Rift Turf, a willow log, leaves, strands and grass (the last three with shears); craft planks from the log. | Each drops itself; 1 log makes 4 Whitewood Planks. |
| 8 | Break the leaf block a strand hangs from (shears or by hand). | The whole strand under it falls. |
| 9 | Lay 6 Rift Turf in a Rift Ferret exhibit floor instead of end stone and measure. | The End ground need is met, as with end stone. |
| 10 | Open the content log (Settings, Creator) after the steps above. | No lines about `rift_willows`, `willow` or `rift_turf`. |
