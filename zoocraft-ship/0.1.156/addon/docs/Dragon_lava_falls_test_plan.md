# Dragons in the Lava Falls: test plan (0.1.156)

Austin (2026-10-31), in the Mythical Glade: "dragons feel out of place here. Let's move them to the lava falls".

What changes:
- Wild Dragons live only in the Lava Falls in the Nether now, a rare few: one at a time, at most one near you. None
  come in the Mythical Glade any more. Wild ones already in a glade go for good once you're well away from them (as wild
  dragons always have); the dragons in your zoo stay where they are, and their halls work as before in any dimension.
- In the Lava Falls they fly through the great caverns and over the lava seas, always under the cavern's roof, and now
  and then land on the nylium or netherrack by the falls to bask in the heat. Never on lava or on top of a fungus. They
  keep out of low caves with no room to fly, and turn away from a lava fall rather than fly through it.
- The Nether has no night, so wild ones there don't settle down to sleep at night. (Dragons in your zoo still sleep by
  the campfire at night.)
- Scared in a cavern, one flies off properly: it looks for a way out nearer to hand when the far side is all rock.
- Spawn weight 4 (8 in the glade): in the Lava Falls the game has fewer other animals to choose, so 8 brought one in
  the first 10 seconds.
- The Field Journal: the Lava Falls' Places page names Dragons, the Mythical Glade's doesn't, and the Dragon's page says
  where they live. A Dragon released through conservation goes back to the Nether, and Nether visitors talk about
  Dragons.

Works in Lava Falls land you've already been to: wild animals come wherever the biome is, old land or new. No new files:
leave the world and open it again.

Checked before shipping, on Mojang's server (Bedrock Dedicated Server 1.26.60, seed 12345, the whole behaviour pack, a
simulated player), at a big patch of the Lava Falls (x 352 to 447, z 2 to 97, the 0.1.155 land with its falls and pools):
- Flight, a wild one followed for 10 minutes over the patch (positions every half second): 1,316 samples in the air,
  3 with a wing tip in lava for a moment and none in rock; the first run, before the look-ahead was made longer, had 46
  in lava (its take-off went through a fall). It landed 7 times, every time on warped nylium, never on lava or a
  fungus.
- A low cave (2 to 4 blocks high) next to the cavern: it never flew in.
- Bait: holding a Meat Ration, one in the air came down 4.9 blocks from the player, facing them, and stayed.
- Scared on the ground (a player walking up without sneaking): it roared facing the player, took off and was 26 blocks
  away 20 seconds later (the first run hovered a minute 7 blocks away: every far spot it tried was in rock).
- How often, the area cleared of animals first and a player standing in the middle for 20 minutes: at weight 4 a
  dragon came 8 seconds in, 25 blocks off on warped nylium, and the one-at-a-time limit kept it at one for the 20
  minutes (2 Warped Geckos came too); at weight 8 one came in the first 10 seconds.
- The tests (313), the type check and the pack checker.
- What can't be checked without a screen: how it looks in the game (a dragon under a cavern's roof, by the falls) and
  how often you happen to meet one on your own travels.

| # | Do this | You should see |
|---|---|---|
| 1 | Leave the world and open it again. | It loads as usual. |
| 2 | In the Nether, `/locate biome zoocraft:lava_falls` and go there. Look round the big caverns and over the lava seas for a while (dragons are rare: give it a few minutes, or use the Wild Dragon Spawn Egg there). | Now and then a Wild Dragon flies through the cavern under its roof or over a lava sea, beating its wings and gliding, and lands on the nylium or netherrack to bask with its wings spread. |
| 3 | Watch one fly for a while. | It keeps under the roof and out of the walls, turns away from the lava falls, and never lands on lava or on a fungus. |
| 4 | In Survival (fire resistance helps), walk up to one on the ground without sneaking. | Within 14 blocks it roars, facing you, takes off and flies well away. |
| 5 | Sneak up to one; then, when one is flying, stand up and hold a Meat Ration. | Sneaking, it doesn't roar. Holding a Meat Ration, one in the air within 16 blocks comes down beside you and stays while you hold it. |
| 6 | Stay in the Lava Falls through an Overworld night (`/time set night` there). | Wild ones keep flying and landing to bask; they don't settle down to sleep. |
| 7 | Open the Field Journal's Places pages and the Dragon's page. | The Lava Falls' page mentions Dragons; the Mythical Glade's doesn't. The Dragon's page says they live in the Lava Falls in the Nether. |
| 8 | Go to a Mythical Glade and stay a while. | Unicorns, Griffins and Glowhorn Stags as before; no Wild Dragons come. |
| 9 | Open the content log (Settings, Creator) after the steps above. | No lines about `dragon`. |
