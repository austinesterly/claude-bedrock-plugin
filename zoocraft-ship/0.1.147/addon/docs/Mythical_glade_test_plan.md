# Mythical Glade: test plan (0.1.147)

Module 9 (the Mythical biome), its first version. Austin's idea 10 (2026-10-15): a rare Overworld biome of giant
drooping willows, glowing Willowlight, glowing flowers, amethyst and grass under a mystical fog; and (2026-10-30)
"massive fantasy looking trees". His card (2026-10-30): a griffin and a Glowhorn Stag join the unicorn and the dragon in
later versions. The plan: `research/mythical_plan.md`; what it rests on: `research/mythical_facts.md`.

What it is: a new biome, the **Mythical Glade**, that takes the place of some flower forests, meadows, cherry groves,
birch forests and forests in new land.
- Its look: mint-green grass and leaves' tint under a lavender sky, a violet haze in the distance, turquoise water.
- Its trees, all new wood (Mythwood): giant trees up to 41 blocks across and 94 tall. Elder Mythwoods (a wrung trunk of
  three strands on arching roots, wide flat pads of pink leaves), Great Moonwillows (drooping limbs and teal leaves, with
  curtains of Willow Veil down to the ground) and Spiral Spires (twin twisting trunks with tiers of pink and teal). Between
  them, smaller Mythwoods and Moonwillows and young trees. Willowlights (glowing hanging lanterns) hang from all of them.
- Its floor: thick grass and ferns, drifts of glowing Moonblooms, Starpetals and Wisp Ferns, and patches of amethyst with
  amethyst clusters growing on them.
- Its feel: glowing motes drifting up round you, soft amethyst chimes now and then, and its name on screen as you walk in.
- No hostile mobs spawn there (as on Mushroom Fields), and no farm animals.
- New blocks: Mythwood Log, Mythwood Wood, Mythwood Planks (4 from a log, a crafting table or the Zoo Workshop), Mythwood
  Leaves, Moonwillow Leaves, Willow Veil, Willowlight (light 12), Moonbloom (light 9, makes light blue dye), Starpetal
  (light 7, makes pink dye) and Wisp Fern (light 5).
- Places in the Field Journal: once the Park Guidebook is researched, the Mythical Glade's page points the way to the
  nearest one.

It only shows where the world is made fresh: a new world, or land you have never been to.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seed 12345): the whole behaviour pack
  loads with no content log errors.
- The trees (on Mojang's server, with the glade made widespread for the test, 192 x 192 blocks scanned): all 6 giant spots on glade land grew their giant whole (99.9 to 100% of its blocks; the other 3 spots were a lake, a river and a birch forest), and the 32 trees between them (10 Mythwoods, 4 Moonwillows, 18 young) all grew whole.
- How rare: a census with /locate biome from 1,681 points over 6,000 x 6,000 blocks: at this setting 4.1% of the points stood in a glade, and the nearest glade was a median 684 blocks away.
- The tests (300), the type check and the pack checker (no new warnings).
- What can't be checked without a screen: how the glade looks and feels as you walk through it (the colours, the haze,
  the motes and the light of the Willowlights at night).

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again (new blocks, fog and particles need it). Make a new world, or go well past anywhere you have been. | The world loads as usual. |
| 2 | Research the Park Guidebook at the Research Desk if you haven't, then open the Field Journal's Places page. | A Mythical Glade entry with the way to the nearest one. (Or type /locate biome zoocraft:mythical_glade.) |
| 3 | Go there. | "Mythical Glade" on screen as you walk in; mint-green grass under a lavender sky, a violet haze, glowing motes drifting up round you, a soft chime now and then. |
| 4 | Look round. | Giant trees: wrung pale trunks on arching roots with flat pink crowns, drooping teal willows hung with curtains, tall twin-trunked spires with tiers; smaller trees between them; Willowlights hanging from them. |
| 5 | Look at the ground. | Thick grass, ferns, glowing Moonblooms, Starpetals and Wisp Ferns in drifts, patches of amethyst with clusters. |
| 6 | Stay through the night. | The Willowlights and flowers glow; no zombies, skeletons, creepers or spiders spawn in the glade. |
| 7 | Break a Mythwood Log and craft it at a crafting table. | 4 Mythwood Planks; 4 logs in a square make Mythwood Wood; planks make sticks. |
| 8 | Break a Moonbloom and a Starpetal and craft each. | Light blue dye and pink dye. |
| 9 | Walk through Willow Veil and Willowlights, and through the flowers. | You pass through them. |
| 10 | Walk from land you explored before 0.1.147 into new land. | The old land is unchanged; glades only appear in the new land. |
| 11 | Open the content log (Settings, Creator) after the steps above. | No lines about `mythic`, `mythical_glade`, `structure` or `feature`. |
