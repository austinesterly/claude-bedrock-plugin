# Camels: test plan (0.1.181)

The game's camel as a zoo animal. It looks, sounds and walks like the game's own (the same model and skin; a calf is
the grown model at about half size). No saddle, no riding, no dash. Now and then one kneels a while and looks round,
as the game's camels do. At midday a grown one out in the sun walks into the shade and kneels there till the heat
passes. On sand, now and then one kneels for a dust bath: sand thrown up round it with the sand's sound.

How to catch one: find a wild camel (deserts, one at a time). Have a cactus or a Leafy Ration in your inventory and use
a Livestock Crate on a grown one.

What they want (a desert exhibit):
- Room: 120 blocks of floor for the first and 40 for each more, 3 blocks of headroom. Two at least: they live in herds.
- Sand underfoot: sand or red sand under at least half the floor. Without it comfort can't rise above 60.
- Shade: tree leaves or a roof 3 or more blocks up over 6 blocks of floor for each camel, so all of them can lie in it
  at midday. Without it comfort can't rise above 60.
- Food: Leafy Rations from a Hay Rack, a Basic Feeder or an Elevated Browse Feeder. A cactus is their food too.

New animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_camel. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Camels. | Sand over most of the floor (grass along the front), walls 3 high, a plank roof over the back 4 rows, a Hay Rack of Leafy Rations with a Hanging Food Basket over it (under the roof), a Water Trough. Three camels that look exactly like the game's, with no saddle. The Exhibit Clipboard: no problems; the Desert line says how many floor blocks are sand and how many shaded. |
| 3 | Watch them for a few minutes in the morning (`/time set 1000`). | They amble about with the game's own walk. Now and then one kneels down for a while, looks round, and stands up again. Now and then one standing on sand kneels and throws sand up round it (a dust bath), then stands up. |
| 4 | `/time set 6000` (midday) and watch. | Each grown camel out in the sun walks under the roof (turning as it goes, the game's own walk) and kneels there, beside the others, not on top of them. They stay kneeling till the heat passes. |
| 5 | `/time set 9500` and watch. | They stand up and amble about again. |
| 6 | Turn most of the sand to grass and measure the exhibit with the Habitat Marker. | A warning that camels need sand underfoot, with how many blocks it needs and how many it found. Put the sand back and measure: the warning goes. |
| 7 | Break the roof and measure again. | A warning that camels need shade to lie in at midday. At midday they don't go looking for shade. Put the roof back and measure: the warning goes. |
| 8 | Open a camel's page on the Exhibit Clipboard. | Its comfort with sand and shade among its needs. |
| 9 | In Survival, find a wild camel with a cactus in your inventory and use an empty Livestock Crate on it. Use the crate on the Camels' floor. | It goes in (a wild camel is tamed from birth in the game, but it's caught like any other; a saddled one gives its saddle back). |
| 10 | Let a grown zoo camel go back to the wild (Conservation, far from the park). | It comes out grown. |
| 11 | Open the Field Journal's Camel page after spotting one. | Its care notes: Sand underfoot, Shade, Food, Their day, and Catching with a cactus or a Leafy Ration. Tasks: spot one, watch the herd, watch one kneel. |
