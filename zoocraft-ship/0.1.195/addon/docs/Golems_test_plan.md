# Iron, snow and copper golems: test plan (0.1.195)

The game's iron golem, snow golem and copper golem as zoo animals. They look, sound and move like the game's own (the
same models, skins and animations).

Golems are built, not born: no sexes, no young, no Breeding switch. To have more, build another as in the game and catch
it. They drink nothing (no Water Trough); the zoo keeps them in repair with iron or copper nuggets and topped up with
snowballs from a feeder (the game's golems eat nothing: this is the zoo's choice).

- Iron golems go for monsters that get into their yard (not creepers), never people or the zoo's own animals. They like
  village paving underfoot: dirt path, cobblestone, stone, stone bricks, bricks or planks under a quarter of their floor.
- Snow golems leave a trail of snow as they walk and throw snowballs at monsters near them. Rain and warm places melt the
  game's, so the zoo's want a roof over all of their yard and a biome no warmer than they can stand (not a desert,
  badlands, a savanna or the Nether). The zoo's don't melt, but their comfort stays at 55 or below there.
- Copper golems carry items from a copper chest to a chest that holds the same item, or an empty one, as in the game.
  They green over a stage at a time (copper, exposed, weathered, oxidized), about 7 hours of play each. A honeycomb waxes
  one (it stays as it is); an axe scrapes off the wax, or a stage. Fully oxidized and unwaxed, one turns into a statue in a
  few seconds, in one of the game's four poses (standing, sitting, running, star), and drops what it holds and any poppy
  on its head. Use an empty hand on a statue to turn it to the next pose. Scrape it with an axe a stage at a time; scraped
  back to bright copper, the next scrape brings it back to life. In the game the statue is a block; the zoo's stays an
  animal, so it stays on the park's books.

How to catch them:
- Iron golems (a Reinforced Crate): in villages (their defenders) and in the cages by pillager outposts, or build one
  (four iron blocks in a T and a carved pumpkin). With an iron ingot or iron nuggets in your inventory, use an empty
  Reinforced Crate on it.
- Snow golems (a Livestock Crate): never wild: build one (two snow blocks and a carved pumpkin on top). With a snowball
  or a snow block in your inventory, use an empty Livestock Crate on it.
- Copper golems (a Small Carrier): build one (a copper block and a carved pumpkin), or bring a statue back to life with an
  axe. With a copper ingot or copper nuggets in your inventory, use an empty Small Carrier on it. Its copper and its wax
  go with it. The carrier refuses a statue (bring it back to life first). The first try on a wild one, or on a zoo one
  carrying an item between chests, says to take the item first (use it with an empty hand); the next try catches it.

Fill in the Field Journal first, as for every animal: spot one; iron golems, watch one walk its rounds; snow golems,
watch one leave a trail of snow; copper golems, watch one open a chest to take or put away an item.

What they want:
- Iron golems (an Iron Golem Yard): 64 blocks of floor for the first and 32 more each, walls and 4 blocks of air (they're
  2.9 tall). Village paving under a quarter of the floor or more. Alone or up to 4. Iron nuggets or iron ingots in a feeder.
- Snow golems (a Snow Golem Yard): 16 blocks for the first and 8 more each, 3 high, a roof over all of it, in a cool
  biome. Alone or up to 6. Snowballs or snow blocks in a feeder.
- Copper golems (a Copper Golem Yard): 16 blocks for the first and 8 more each, 2 high. A copper chest and a chest on the
  floor or in a wall (enrichment). Alone or up to 8. Copper nuggets or copper ingots in a feeder.
- Walls 3 high where a chest or a feeder stands against them: a golem up on one steps over a wall 2 high.
- Iron, snow and copper golems may share a Golem Yard (the game's iron golems hold out poppies to copper golems).

New animals: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a zoo golem. On the test server the first try at the snow golem failed to load ("minecraft:freezing_immune ... not present in the Schema", then its ranged attack written for a newer format); both are fixed and the logs were clean. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the three golem yards. | An Iron Golem Yard 10 by 8 with a dirt path across it and cobblestone down one side, one iron golem; a Copper Golem Yard 6 by 5 with a copper chest and two chests, two copper golems; a Snow Golem Yard 6 by 5 under a stone roof, two snow golems. No warnings on the Exhibit Clipboards. On the test server: all three ready, no warnings; the iron yard 80 blocks with 32 paved; the copper yard "Chests: 1 copper, 2 wooden"; the snow yard 29 blocks, all 29 roofed, "Warmth: cool enough for snow golems". |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Each like the game's. Copper golems in their stage's colour; a statue in its pose, without the poppy. |
| 4 | Watch the Copper Golem Yard for a minute. | The copper golems take cobblestone and poppies from the copper chest and put them away, the cobblestone in one chest and the poppies in the other. On the test server: both moved in about a minute. With only one chest, the poppies stayed in a golem's hand (the game's: a chest that already holds cobblestone won't take poppies). |
| 5 | Watch the snow golems walk. | A trail of snow layers behind them. On the test server about 30 layers in their yard within a minute and a half. |
| 6 | Spawn a zombie in the Iron Golem Yard (a spawn egg, at night or on Normal). | The iron golem goes for it and kills it. On the test server: dead in 4 seconds. |
| 7 | Spawn a zombie in the Snow Golem Yard. | They throw snowballs at it (no harm: knockback). On the test server: the snowballs hit it (one hit the other snow golem too, no harm), its health stayed full. |
| 8 | Use a honeycomb on a copper golem; then an iron axe, twice. | Waxed (the Clipboard's page says "waxed (it stays this way)"); the first axe takes the wax off, the second scrapes a stage off. On the test server: weathered and waxed, then unwaxed, then exposed, each kept on its record. |
| 9 | With commands, make one oxidized: `/event entity @e[type=zoocraft:zoo_copper_golem,c=1] zoocraft:coat_3` then `/event entity @e[type=zoocraft:zoo_copper_golem,c=1] minecraft:maximum_oxidation`. Wait a few seconds. | It turns into a statue: it stops still in a pose, and a message says so. On the test server: a statue in about 10 seconds, running pose, the message, its poppy gone from its head. |
| 10 | Use an empty hand on the statue, twice. | It turns to the next pose each time (after star comes standing). On the test server: running, star, standing. |
| 11 | Use a Small Carrier on the statue. | Refused: it's a statue, bring it back to life first. On the test server: refused. |
| 12 | Scrape the statue with an axe until it's bright copper, then once more. | A stage each time; at bright copper the next scrape brings it back to life, with a message. On the test server: oxidized, weathered, exposed, copper, then "came back to life". |
| 13 | Leave a world and come back (or `/reload`) with a waxed weathered golem and a statue in the yard. | Both as they were. On the test server (the zoo put each down again): the waxed weathered one came back weathered and waxed, the statue a statue in its pose. |
| 14 | Build a copper golem (a copper block, a carved pumpkin on top), wax it, then catch it with a copper ingot and put it in the Copper Golem Yard. | The first try says to take any item it carries; the next catches it. It lives there at its stage, still waxed. On the test server: the game's copper golem made weathered and waxed, warned, caught, and living in the yard weathered and waxed. |
| 15 | Build an iron golem and a snow golem and catch them (iron ingot and Reinforced Crate; snowball and Livestock Crate), and put them in their yards. | Each lives there; the Clipboard lists no sex. On the test server: the game's iron golem (as one a player built) and snow golem, each caught and living in its yard, no sex. |
| 16 | Turn breeding on in a golem yard. | A message that golems aren't born: build another and catch it. On the test server: "Snow Golems aren't born: build another (two snow blocks with a carved pumpkin on top) and catch it." |
| 17 | Build a Snow Golem Yard in a desert. | A warning that they melt in warm places, "Warmth: too warm here", comfort no higher than 55; no snow trail (the game's makes none there either). They don't melt. On the test server (a desert flat world): measured warm, the warning and the line, no snow layers, comfort 70 then 65 two minutes later (on its way down to 55), health full. |
| 18 | Open the Field Journal's pages, and watch each for a while. | Iron golem: spot one, watch one walk its rounds. Snow golem: spot one, watch one leave a trail of snow. Copper golem: spot one, watch one open a chest. On the test server all six ticked from the zoo's golems, keeping eyes on them: the iron golem walked 31 of 60 seconds; snow golems walk little while they throw snowballs. |
| 19 | **Please check this one: the test server can't show it.** Put an iron golem and a copper golem in one Golem Yard and watch by day. | The iron golem holds out a poppy now and then, and a copper golem takes it and wears it on its head. |
