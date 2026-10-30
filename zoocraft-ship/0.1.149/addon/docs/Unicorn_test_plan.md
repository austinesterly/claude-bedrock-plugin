# Unicorn: test plan (0.1.149)

The first animal of the Mythical Glade (module 9; the plan is research/mythical_plan.md). The classic unicorn drawn on a
real horse's frame and at a horse's size: 1.6 m at the withers, the head carried about 2.3 m up, a long spiral horn
above it, in the plain vanilla style. Two coats: Moonlit (snow white, a lavender-to-mint mane and tail, a pearl horn)
and Dawn (cream, a rose-to-peach mane and tail, a rose-gold horn). A foal is soft grey-white with a short mane and a
horn bud. The horn glows faintly.

New entity, model, skin, animation and particle files: quit Minecraft fully and start it again. Works in any world; wild
Unicorns live only in the Mythical Glade, so elsewhere use the Wild Unicorn Spawn Egg for the wild steps.

What its exhibit needs (the Exhibit Clipboard lists each): glowing flowers growing on the floor (Moonblooms, Starpetals
or Wisp Ferns, picked in a Mythical Glade; they grow on grass or dirt), 3 for each grown unicorn and 4 at least, or its
comfort can't rise above 50; grass in the floor (grazing gives part of their food: 30 grass blocks each, up to 40%);
160 blocks of floor for the first and 48 more for each other, 4 high (a pair 208); Grain Rations in a Basic Feeder or a
Hay Rack, 3 a park day each; a Water Trough. Water beside the floor (the trough, or the edge of a pool) is where they
dip their horns. Small herds of 2 to 6. Carried in a Livestock Crate. No research needed.

How it behaves: by day it grazes the grass, walks to a glowing flower and grazes round it, walks to water beside the
floor and touches its horn to it (sparkles rise from the water with a chime), eats Grain Rations at the feeder or the
Hay Rack, now and then rears up on its hind legs neighing, and lies down for short rests. At night it lies down with its
legs tucked and stays down till morning; it gets up within about 10 seconds of sunrise. Sprinting within 6 blocks of a zoo
Unicorn startles it: it stops with its head up and snorts. Wild ones are shy: come within 10 blocks without sneaking
and one rears up facing you, neighing, then canters off. Sneaking, or holding a Grain Ration, you can get close, and a
Grain Ration brings it over from 8 blocks. In the wild: only in the Mythical Glade, on grass, 1 to 3 together, at most 4
near you.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seed 12345, a simulated player): four
  Wild Unicorns in a 33-block grass pen with five glowing flowers and a pool level with the grass, the add-on's scripts
  running. In 4 minutes they grazed the grass 13 times, grazed the glowing flowers 10 times and dipped their horns in
  the pool 4 times (5 times, by three of the four, over the whole run), often standing corner-on to the flower or the water. The first run found
  two faults, fixed before shipping: the walk to water never started (the engine won't path towards water while
  `avoid_water` is on; off, as the vanilla camel has it, a unicorn walked 10 blocks to the pool's edge in 5 seconds and
  stopped beside it, never in it), and the engine's walk to a flower or a pool can stop corner-on to it, which the
  first build didn't count. A keeper in Survival walking up: all four reared within a second, then cantered off (one
  from 1.3 to 15 blocks off). Holding a Grain Ration: one came from 8.5 to 2.3 blocks in 10 seconds. At midnight all four
  were lying down within 30 seconds; at noon all four were up within 20 seconds (the first build kept them lying up to
  2 minutes). Coats: two Moonlit, two Dawn. No script errors.
- Wild spawns, on the same server: 3 minutes at each of six places in and round two Mythical Glades (the glade found
  by the server's own biome search from the world's middle, at -480 -544, and another at 304 688). 6 Wild Unicorns
  came (3 Moonlit, 3 Dawn; two of them came together), every one in the Mythical Glade standing on grass,
  none anywhere else; the same runs put deer in the birch forest and plains round about and penguins on the peaks.
- The park simulator (a 53-exhibit test zoo from /zoocraft:build, 39 checks, all pass): the exhibit and its measure (8
  glowing flowers, 3 dip spots, 237 grass cells), the clipboard, no warning, comfort 90; grazing a flower and the grass;
  the horn dip at the trough with 6 sparkles and a chime; eating at the Hay Rack; rearing; lying down at night through
  the night and up by day; a keeper sprinting close: head up and a snort; the Livestock Crate in and out; the flowers
  dug up: 0, a red clipboard line, the warning, comfort held at 50; a wild one rearing to face a keeper in Survival then
  moving off, and not startled by one sneaking or holding a Grain Ration. No errors.
- What can't be checked without a screen: how it looks in the game (the model, the two coats and the foal, the horn's
  glow, the sparkles), how it moves (the rear, the dip, lying down) and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | In a Creative world, `/zoocraft:build` (or in your own park, build a grass exhibit with 6 or more glowing flowers, a Water Trough and a feeder or Hay Rack with Grain Rations, and release a pair). | A "Unicorns" exhibit: a grass floor 16 by 15 with 8 glowing flowers, a Hay Rack, a Basic Feeder and a Hanging Food Basket with Grain Rations, and a Water Trough. A pair inside. |
| 2 | Look at them. | White (Moonlit) or cream (Dawn) horses with a long spiral horn that glows faintly and a flowing pastel mane and tail, as big as a horse. |
| 3 | Watch them for a while by day. | They graze the grass; one walks to a glowing flower and grazes round it, head down; one walks to the Water Trough and touches its horn to the water: sparkles rise with a chime; they eat from the Hay Rack and the feeder; now and then one rears up on its hind legs, neighing. |
| 4 | In Survival, sprint past close to one (within 6 blocks). | It stops with its head up and snorts, then goes on. Walking (not sprinting) doesn't bother them. |
| 5 | `/time set night` and wait a little. | They lie down with their legs tucked and stay down. `/time set day`: they get up within about 10 seconds. |
| 6 | Use the Exhibit Clipboard on the exhibit. | Glowing flowers: 8 of 6, green. Water to dip a horn in: the number of spots on the floor beside the water. A line for the foal when there is one. |
| 7 | Dig up the glowing flowers, use the Habitat Marker on the ground inside again, wait a park day. | Glowing flowers 0 of 6 in red; a care warning that they graze the glowing flowers of their glade; comfort no higher than 50. Put them back and measure again. |
| 8 | Carry one in a Livestock Crate, then use the crate on the ground inside the exhibit. | It goes in the crate, and back out into its exhibit. |
| 9 | Turn breeding on and keep them well for a few park days. | One foal, smaller and soft grey-white with a horn bud, following its mother about. |
| 10 | In a normal world, go to a Mythical Glade (the Field Journal's Places page points the way after the Park Guidebook research). | "You found a Mythical Glade" in the Field Journal, which now mentions Unicorns. Wild Unicorns, 1 to 3 together, on the open grass. |
| 11 | Walk up to a wild one without sneaking (or one from the Wild Unicorn Spawn Egg). | Within 10 blocks it rears up facing you, neighing, then canters off. |
| 12 | Sneak up to one; then stand up and hold a Grain Ration. | Sneaking, it doesn't startle. Holding a Grain Ration, it isn't startled either and comes over from 8 blocks. |
| 13 | Watch the Unicorns. | The Field Journal's tasks: spot one, watch one graze the glowing flowers, watch one dip its horn in water, watch one rear. |
| 14 | Open the content log (Settings, Creator) after the steps above. | No lines about `unicorn`. |
