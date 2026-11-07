# Husks and zombie villagers: test plan (0.1.199)

The game's husk and zombie villager as zoo mobs in the Mob House, caught the zombie's way. Each looks, sounds and moves
like the game's own grown one (the same model, skin, animations and sounds). A zombie villager keeps the job it had as a
villager (its clothes show which of the 15) and the clothes of where it came from (the plains, the desert, the jungle, the
savanna, the snow, the swamp or the taiga), from the wild through the serum and the Mob Cage into the zoo. In the zoo they
never attack, never burn in the sun, never despawn, and a husk never turns into a zombie under water.

In the wild: husks come out at night in deserts (most of a desert's zombies are husks), zombie villagers at night anywhere
zombies do (a few in each hundred), in abandoned villages and igloo basements, and when a zombie kills a villager.

How to catch them (Mob Taming research, as for zombies): fill in the Field Journal first (spot one, then see one calmed).
Weaken one to a quarter of its health or less (5 of 20), look at it up close and use a Passivity Serum: it sparkles green
and calms down. Babies are refused. Then, with a Meat Ration in your inventory, use an empty Mob Cage on the calmed one,
and use the cage on the ground inside its pen.

What they want (a mob pen beside a Mob House hall, as the zombie's: 25 blocks of floor for the first and 10 more each, 3
blocks of headroom, shut in all round and walled off from the hall with glass, glass panes or iron bars):

- Husks: desert ground (sand, red sand or sandstone of any cut) under half the floor or more. They never burn, so they
  don't mind light. Meat Rations. A pen of their own.
- Zombie villagers: graveyard earth (dirt, coarse dirt, podzol, rooted dirt or mud) under half the floor or more, and the
  dark (no daylight, nothing brighter than light 7: Nocturnal Lamps), as zombies. Meat Rations. They share a pen with
  zombies and skeletons (the Crypt).

Without its floor a mob's comfort can't rise above 55 (without the dark: 50), and the Exhibit Clipboard says what's
missing. They are never bred, as the zombie: catch more. The Exhibit Clipboard names a zombie villager's look ("fletcher,
from the desert"), and its Field Journal page says how the look is kept.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a husk or a zombie villager. On the test server nothing from the add-on in any run (the only lines were the server's own test probes). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the two new pens beside their Mob Houses. | Husks on sand with a patch of cut sandstone behind glass; Zombie Villagers on coarse dirt with a patch of podzol behind tinted glass under a red Nocturnal Lamp; a feeder, a Hanging Food Basket and a Water Trough in each, two in each pen. No warnings on the Exhibit Clipboard: the pen beside a working Mob House, the floor "99%" of what they like, and for the zombie villagers "Dark: yes". On the test server: both ready, 76 blocks of floor, those lines, no warnings. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | A husk like the game's own (sandy skin). The two zombie villagers dressed differently: one unemployed in desert clothes, one a farmer in jungle clothes. They walk with their arms out and groan with the game's husk and zombie villager sounds. |
| 4 | Watch them for a minute. | They wander about their pen. On the test server the husks walked 13 and 16 of 30 seconds (up to 7 seconds at a time), the zombie villagers 11 and 7. |
| 5 | Open their Field Journal pages and watch them. | Spot one, see one calmed: a zoo one counts for both. The zombie villager's page has a "Looks" line. On the test server both steps came from watching a zoo one. |
| 6 | Break the floor of each pen and put stone down instead, then measure each with the Habitat Marker. | A warning in each that they want their floor (desert ground, graveyard earth) under 50% of it (0% now), the Clipboard's floor line in red, comfort falling toward 55. Put the floor back and measure again: the warning goes. On the test server: both warnings, comfort 73 then 71 (the zombies next door, with their floor, rose 74 to 76); with the floors back the warnings went. |
| 7 | Swap the zombie villagers' Nocturnal Lamp for glowstone and measure again. | A warning that zombie villagers like the dark, the line "Dark: no: too bright", their comfort held to 50 or below. The lamp back: the warning goes. On the test server: too bright on 39 blocks, the brightest 12; back to the Nocturnal Lamp, "Dark: yes" and no warning. The husks' pen has no dark line. |
| 8 | Turn breeding on in each pen. | "This species doesn't breed in the zoo yet." On the test server: that message for both. |
| 9 | At night in a desert find a husk or a zombie villager. With Mob Taming researched, use a Passivity Serum on it at full health. | "It shakes the serum off. Weaken it first (a quarter of its health or less)." and you keep the serum. On the test server: that message. |
| 10 | Use the serum on a baby husk or a baby zombie villager. | "Leave the young ones be: the serum is too strong for a baby." On the test server: that message for a baby husk. |
| 11 | Hit a grown one down to 5 health or less (a few sword hits), then use the serum. | "The husk sparkles green and calms down. It never attacks now..." (a zombie villager: "...(it keeps its job and its home's clothes)"). It wanders about calm. A zombie villager keeps its clothes. On the test server: both calmed; five zombie villagers (a fletcher, a cartographer, a cleric, an armorer and a stone mason, all in desert clothes) kept their job and clothes. |
| 12 | Use an empty Mob Cage on the calmed one before its Field Journal page says you saw one calmed. | "You don't know husks well enough to move one safely yet..." Look at the calmed one for a few seconds and the page fills in. On the test server: that message, then the page filled in. |
| 13 | Use the cage with no Meat Ration in your inventory, then with one. | Without: "You need a meat ration in your inventory to coax it in." With: "...hopped into the carrier." On the test server: both. |
| 14 | Use the cage on the ground in the Zombies' pen with a husk in it. | Refused: "Zombies: Husks don't share an exhibit with Zombies. Husks keep an exhibit of their own." and it stays in the cage. Then in the Husks' pen: "...is now living in Husks!" On the test server: both. |
| 15 | Catch a zombie villager and use the cage in the Zombies' pen (or the Skeletons'), then catch another and try the Husks' pen. | The first lives with the zombies (the Crypt), still dressed as before, and the zombies' pen says "Dark: yes (zombies and zombie villagers like it...)". The second: "Husks: Zombie Villagers don't share an exhibit with Husks. Zombie Villagers share with: Zombies, Skeletons.", then it lives in the Zombie Villagers' pen. On the test server: all of that; an armorer and a stone mason, both in desert clothes, kept their job and clothes into the zoo, as a fletcher did before. |

Wild ones far from any player despawn (the game's): look for them near you. A zoo one let go is the game's own grown one.
