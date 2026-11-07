# Cave spiders, silverfish and endermites: test plan (0.1.202)

The game's cave spider, silverfish and endermite as zoo mobs, caught and kept the spider's way. Each looks, sounds and
moves like the game's own (the same model, skin, animations and sounds; a cave spider is the spider's model, smaller and
blue). In the zoo they never attack, bite, climb or despawn; a silverfish never creeps into the stone and an endermite
never vanishes.

In the wild:

- Cave spiders: abandoned mineshafts, round the monster spawners among the cobwebs (light 0); in sulfur caves every
  spider is a cave spider; and the spawners of trial chambers. Their bite poisons. Now and then one carries a skeleton
  (a cave spider jockey).
- Silverfish: hidden in infested blocks (stone, cobblestone, deepslate and stone bricks that break too quickly) in
  strongholds, underground in mountains and windswept hills, in igloo basements and woodland mansions; the spawner of a
  stronghold's portal room and the spawners of trial chambers. Hit one and more break out round it.
- Endermites: now and then (1 in 20) where an ender pearl you throw lands. The game's own vanishes after two minutes
  unless it is named (a Name Tag keeps it); endermen hunt them.

How to catch them (Mob Taming research), the spider's way: fill in the Field Journal first (spot one, then see one
calmed). Weaken one to a quarter of its health or less (3 of 12 for a cave spider; 2 of 8 for a silverfish or an
endermite: punch it, a sword kills it), look at it up close and use a Passivity Serum: it sparkles green and calms down.
Then, with its bait in your inventory (a Meat Ration for a cave spider, a Grain Ration for a silverfish, Chorus Browse
for an endermite), use an empty Mob Cage on the calmed one, and use the cage on the floor inside its pen.

What they want (a pen beside a Mob House):

- Cave spiders: the spider's pen: the dark (no daylight, nothing brighter than light 4 on the floor: Nocturnal Lamps
  hung 3 blocks up, tinted glass to the hall) and 3 or more cobwebs. Meat Rations. They share a pen with spiders (the
  Spider Den).
- Silverfish: the stone they hide in (stone, cobblestone, deepslate or stone bricks of any kind) under half the floor or
  more. Grain Rations.
- Endermites: End ground (end stone, end stone bricks or purpur) under half the floor or more. Chorus Browse.
- Each from a Basic Feeder.

Without its floor (or a cave spider without its cobwebs) comfort can't rise above 55 (a cave spider without the dark:
50), and the Exhibit Clipboard says what's missing. They are never bred (as the spider): catch more.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a cave spider, a silverfish or an endermite. On the test server nothing from the add-on in any of the three runs (only the bench's own lines and the add-on's loading lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the three new pens beside their Mob Houses. | Cave Spiders: oak planks with a gravel patch behind tinted glass, four cobwebs hung in the corners, two red Nocturnal Lamps. Silverfish: stone bricks with a mossy patch behind glass. Endermites: end stone with an end stone brick patch behind glass. A Basic Feeder (Meat Rations, Grain Rations, Chorus Browse), a Hanging Food Basket and a Water Trough in each, two in each pen. No warnings on the Exhibit Clipboard: the pen beside a working Mob House, the cave spiders' "Cobwebs: 4 in the pen" and "Dark: yes", the others' floor "99%". On the test server: all three ready with exactly those lines and no warnings (the Spiders' pen beside them too). |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Each like the game's own: cave spiders small and blue with red eyes (smaller than a spider), silverfish grey and segmented, endermites purple. They move and sound like the game's. |
| 4 | Watch them for a minute or two. | They wander about the floor. The silverfish never creep into the stone (no infested blocks appear), the endermites never vanish. On the test server: all six stayed in their pens at full health for over 3 minutes (past the two minutes a wild endermite gets); no infested blocks in the silverfish's pen before or after. |
| 5 | Open their Field Journal pages and watch them. | Each: spot one, see one calmed. A zoo one counts. On the test server: all three pages filled from watching zoo ones (the small silverfish 1.2 blocks off, under the Bench's look), and from wild ones calmed in run B. |
| 6 | Break the silverfish's stone bricks and put dirt down instead, then measure with the Habitat Marker. | A warning that silverfish want the stone they hide in under 50% of their floor, the Clipboard's floor line in red, comfort falling toward 55. Put the stone bricks back and measure again: the warning goes. The same for the endermites' end stone. On the test server: "Silverfish want the stone they hide in (stone, cobblestone, deepslate or stone bricks of any kind) under 50% of their floor or more (21% now)", the mossy patch alone; back, 99% and no warning. The endermites: the same at 21%, then 99%. |
| 7 | Swap the cave spiders' Nocturnal Lamps for glowstone and measure again. | A warning that cave spiders like the dark, the line "Dark: no: too bright, brightest spot 12 of 4 allowed", comfort held to 50 or below. The lamps back: "Dark: yes". On the test server: "Dark: no: too bright, brightest spot 12 of 4 allowed (nothing brighter than light 4 on the floor...)", their comfort held to 50 (run A first showed the nocturnal house's "of 7 allowed": fixed, run C); with the Nocturnal Lamps back, "Dark: yes" and no warning. |
| 8 | Take the cave spiders' cobwebs out and measure again. | "Cave Spiders want 3 or more cobwebs in their pen (0 now): hung in the corners and along the walls, as round a mineshaft's spawner; cave spiders walk through them. Without them comfort can't rise above 55." and the line "Cobwebs: 0 in the pen". On the test server: that warning and that line. |
| 9 | Turn breeding on in each pen. | "This species doesn't breed in the zoo yet." On the test server: that message for all three. |
| 10 | In a mineshaft (or with a cave spider you find), with Mob Taming researched, use a Passivity Serum on one at full health. | "It shakes the serum off. Weaken it first (a quarter of its health or less)." and you keep the serum. On the test server: that message, the serum kept. |
| 11 | Hit it down to 3 health or less, then use the serum. | "The cave spider sparkles green and calms down. It never attacks now (and it never climbs or bites). Bring it to a pen in a Mob House: a Mob Cage carries it (with a Meat Ration in your inventory), or lead it holding one." On the test server: calmed at 3 health. |
| 12 | Use an empty Mob Cage on the calmed cave spider before its Field Journal page says you saw one calmed, then with no Meat Ration, then with one. | "You don't know cave spiders well enough to move one safely yet...". Look at it a few seconds and the page fills in. Without the ration: "You need a meat ration in your inventory to coax it in." With it: "...hopped into the carrier." Use the cage on the floor in the Cave Spiders pen: "...is now living in Cave Spiders!" On the test server: calmed out of sight, the cage refused with "You don't know cave spiders well enough to move one safely yet..."; after a look the page filled in; without the ration "You need a meat ration in your inventory to coax it in."; with it caught, then "Venom is now living in Cave Spiders!". |
| 13 | Break some stone bricks in a stronghold (or mountains underground) till a silverfish comes out. Punch it down to 2 health (a sword kills it), then use the serum; catch it with a Grain Ration in your inventory. Try its cage in the Spiders' pen, then in its own. | At 3 health it shakes the serum off; at 2 it calms ("...(and it never hides in the stone)... with a Grain Ration in your inventory"). The Spiders' pen refuses it: "Silverfish don't share an exhibit with Spiders. Silverfish keep an exhibit of their own." Its own: "...is now living in Silverfish!" On the test server: exactly that (refused at 3 of 8, calmed at 2, refused in the Spiders' pen, then "Silvie is now living in Silverfish!"). |
| 14 | Throw ender pearls till an endermite comes out where one lands. Punch it down to 2 health, use the serum, and catch it with Chorus Browse in your inventory. | It calms ("...(and it never vanishes)... with Chorus Browse in your inventory") and lives in Endermites. On the test server: calmed at 2 of 8, caught with Chorus Browse, "Pearlie is now living in Endermites!". The game's own vanishes: on the test server, with the Bench kept beside it, a wild endermite was gone between 111 and 121 seconds after it came; a named one and a calmed one left out stayed past 2 minutes 10 seconds. |
| 15 | Calm and catch another cave spider and use the cage in the Spiders' pen. | It lives there with the spiders (the Spider Den). The Clipboard counts the cobwebs and the dark for both: "Dark: yes (spiders and cave spiders like it...)". On the test server: "Scurry is now living in Spiders!", both kinds' cobweb lines and that dark line. |
| 16 | Find a cave spider with a skeleton riding it (a cave spider jockey). Weaken the spider and use the serum. | The skeleton comes off; the calmed cave spider stays beside it. On the test server: the game's own jockey (a skeleton riding a cave spider); calmed at 3 health, the skeleton on the ground beside the calmed cave spider. |

Wild ones far from any player despawn (the game's): look for them near you. A zoo one let go is the game's own.
