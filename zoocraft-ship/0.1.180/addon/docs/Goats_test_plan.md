# Goats: test plan (0.1.180)

The game's goat as a zoo animal. It looks, sounds and walks like the game's own (the same model and skin, both horns;
a kid is the grown model at half size). A screamer (about 1 goat in 50 in the wild) stays a screamer in the zoo: it
screams where the others bleat, and the Exhibit Clipboard says so. A kid takes after one parent or the other. You can
milk a grown one with a bucket, as a cow. Zoo goats never ram people.

The game's own goats leap out of almost any pen (on the test server they got out of walls 2 to 8 blocks high), so the
zoo goat doesn't use the game's leap. Its leaps are the zoo's: up to 3 blocks up, 4 across and 6 down, and only onto
rock ledges inside its own exhibit.

How to catch one: find a wild goat (snowy slopes, jagged peaks, frozen peaks). Have some wheat or a Grain Ration in
your inventory and use a Livestock Crate on a grown one.

What they want (a mountain exhibit):
- Room: 60 blocks of floor for the first and 16 for each more, 3 blocks of headroom. Two at least: they live in herds.
- Strong walls: goats leap 3 blocks up, so every wall, fence and gate needs 4 blocks of height over anything a goat can
  stand on beside it (the floor, a rock, a trough). Over a gate, leave one block of air to walk through and build on up
  from there. Lower, the exhibit isn't enclosed for goats, and the clipboard says where they could get out.
- Rock ledges to leap onto: the tops of rock blocks (stone, cobblestone, stone bricks, andesite, granite, diorite,
  deepslate, tuff, calcite and the like) with a drop of 2 or more beside them. 2 for each goat (4 at least), and one of
  them 4 or more blocks over the floor as a lookout. Without them comfort can't rise above 60.
- Shelter: hay bales under a roof, 1 for every 2 goats.
- Food: a Hay Rack of Grain Rations (or a Basic Feeder). Wheat is their food too.
- Something to forage: a Hanging Food Basket of Grain Rations (or wheat).
- With a Staff Room keeper who has the exhibit on their round, it's a petting farm: guests like it more.

New animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_goat. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Goats. | Grass, walls 4 high, three stone brick outcrops (2, 4 and 3 blocks high), a plank roof over the back with 2 hay bales under it, a Hay Rack of Grain Rations with a Hanging Food Basket of them over it, a Water Trough. Four goats that look exactly like the game's, horns and all. The Exhibit Clipboard: no problems; the Mountain line says 12 rock ledges, a lookout 4 up, 2 hay bales under a roof. |
| 3 | Watch them for a few minutes from outside. | They walk about; now and then one crouches for a moment and leaps onto an outcrop (the highest it can reach, most often), stands on top looking out, then leaps on to another or back down. None ever leaps out. |
| 4 | Keep watching two that stand near each other. | Now and then (about once a minute for a close pair) two grown ones butt heads in play: they face each other, bow (the game's ram), a clash, and both step back. |
| 5 | Open each goat's page on the Exhibit Clipboard, and listen to them. | Two say "Voice: a screamer (it screams where others bleat)", two say "Voice: bleats". The screamers scream now and then instead of bleating. |
| 6 | Use an empty bucket on a grown goat. | You get a bucket of milk (a screamer makes its scream as you milk it). |
| 7 | Break the top block of the Goats' wall all the way round (walls 3 high) and measure the exhibit with the Habitat Marker. | A problem: "Not enclosed for goats: goats leap 3 blocks up, so walls, fences and gates need 4 blocks of height..." with where they could get out, and the Mountain line says "not enclosed for goats, so no leaps". The goats stop leaping. Put the blocks back and measure again: the problem goes and the leaps start again. |
| 8 | Put a block (a stone, a trough) against the inside of the wall and measure again. | Not enclosed for goats again: standing on it, a goat would be a block nearer the top. Take it away and measure: enclosed. |
| 9 | Swap the stone brick outcrops for planks and measure. | A warning that they need rock ledges to leap onto, with how many it found. Put the stone back and measure: the warning goes. |
| 10 | In Survival, find a wild goat with some wheat in your inventory and use an empty Livestock Crate on it. Use the crate on the Goats' floor. | It goes in. If it was a screamer in the wild, its clipboard page says it's a screamer. |
| 11 | Let a grown zoo goat go back to the wild (Conservation, far from the park). | It comes out grown; a screamer comes out a screamer. |
| 12 | Open the Field Journal's Goat page after spotting one. | Its care notes: Strong walls, Rock ledges, Their day, Milk, Bedding, and Catching with some wheat or a Grain Ration. Tasks: spot one, watch the herd, watch one leap onto a ledge. |
