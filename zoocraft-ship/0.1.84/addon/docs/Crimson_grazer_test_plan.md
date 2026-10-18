# Crimson Grazer test plan (0.1.84)

The first slice of the Nether trio (Austin's card, 2026-10-18) is the Crimson Grazer (spec 5.3: "crimson_grazer | Stocky six-legged fungal herbivore | Herd browsing and fungus rubbing | Crimson ground, fungal feed, herd shelter"). It is a fantasy animal sized and behaving like a musk ox: a herd that rings up against a threat. This version adds new entities, an item and textures, so close Minecraft fully and start it again before testing.

Needs: a Zoo Workshop, a Habitat Marker, an Exhibit Clipboard, a Field Journal, Thermal Carriers (Heat Systems research), a Thermal Regulator with fuel, a Basic Feeder, a Water Trough, crimson fungus, warped fungus and nether wart (for Fungal Rations), crimson nylium (a Silk Touch pickaxe in a crimson forest), crimson stems, fences or walls, and something for a roof over part of the floor. A park day is 20 minutes of game time.

| # | Do this | You should see |
|---|---|---|
| 1 | In the Nether, `/summon zoocraft:wild_crimson_grazer` a few times in Creative. Look at them from all sides. | Blocky crimson-maroon beasts with six short thick legs, a shaggy darker skirt and hump, a pale yellow muzzle, curved horns and three small fungus caps on the back. A bull is bigger and has a heavy horn boss; a cow is smaller. They don't burn in lava or fire. |
| 2 | Find a crimson forest (or `/locate biome crimson_forest`). | Wild herds of 3 to 5 on the nylium. One is the lead; the others follow him about. |
| 3 | At the Zoo Workshop, make Fungal Rations (a crimson fungus, a warped fungus and nether wart). | 2 Fungal Rations. The gift shop sells them too. |
| 4 | Watch a wild herd through a day (`/time set 1000`, `6000`, `9000`, `18000`). | Morning and afternoon: they graze with heads down, now and then one walks to a crimson stem and rubs its flank on it. Noon and night: they lie down together near the lead and chew the cud. Low grunts now and then. |
| 5 | In Survival, walk toward a wild herd. | Within about 8 blocks they bunch into a ring, grown ones facing out, calves in the middle, the bull on your side. Within 3 the nearest of them (the bull, if he's at the front) rushes at you head-down and stops short, or stamps where it stands if you're right at the ring. An action bar line says to give the herd room. No damage. Walk away and after a few seconds they go back to grazing. |
| 6 | In Creative, walk right up to the herd. | Nothing: no ring, no rush. |
| 7 | In Survival, hit one of the herd, then stay near. | The front one charges for real: 4 damage and a shove, and the red action bar line. This goes on for about a minute. In Peaceful the rush still stops short. |
| 8 | Hold a Fungal Ration (or a crimson or warped fungus) within 8 blocks of a wild grazer. | It walks to you and follows. An empty Thermal Carrier with a Fungal Ration on you lets you pick one up. |
| 9 | Build a pen of about 15 x 15, fences 2 high, a netherrack floor, no roof, a Thermal Regulator with fuel, a Basic Feeder and a filled Water Trough. Measure it and try to let 3 grazers out. | Refused, or warned: "Crimson Grazers need at least 16 crimson nylium blocks in the exhibit floor (0 now)", the need for a crimson stem to rub on, and cover over a tenth of the floor. |
| 10 | Replace 16 or more floor blocks with crimson nylium, stand a crimson stem 2 or 3 high on the floor, roof a corner (a tenth of the floor), measure again and let them out. | Accepted. The Clipboard shows "Crimson ground: N of 16 crimson nylium blocks", "Rubbing stems: 1" and "Herd: 3 (3 grown)". |
| 11 | Fill the feeder with Fungal Rations and watch through a day. | The same day as in the wild: grazing on the nylium, eating at the feeder, rubbing on the stem, lying down together at noon and night. |
| 12 | In Survival, step inside the exhibit near them. | Within about 6 blocks they form the ring; within 3 the bull bluffs a rush. Step out of the exhibit and they settle. |
| 13 | Take out the crimson stem (or most of the nylium), measure, and leave them a park day. | Comfort stops at 60 without a stem (55 without enough nylium). The care advice names "crimson nylium in the floor" and "a crimson stem to rub against". |
| 14 | Keep only 2 grazers in an exhibit for a park day. | They are lonely (the social need low). With 3 or more they are content. |
| 15 | Turn breeding on with a bull and cows and skip park days. | One calf after 4 park days; small (0.4 of a cow). It follows its mother and lies by her when the herd rests. Grown in 8. |
| 16 | Open the Field Journal on the Crimson Grazer. | Tasks: spot one, see a herd form its ring, see one rub on a crimson stem, see one chew the cud. Care notes: crimson ground, a rubbing stem, herd shelter, Fungal Rations, heat. |
| 17 | Let one out in the wild (conservation release) on netherrack, then on crimson nylium. | Refused on netherrack; allowed "on crimson nylium". |
| 18 | Check a crocodile, an owl and a red panda exhibit you have. | They behave as before. A red panda still climbs a crimson stem as a log. |
| 19 | Content log after the restart. | No script or content errors. |
