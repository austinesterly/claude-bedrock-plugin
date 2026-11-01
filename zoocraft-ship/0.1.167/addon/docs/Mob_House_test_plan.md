# Hostile Mob House: test plan (0.1.163 to 0.1.167)

Module 11, the Hostile Mob House: its first part, the house itself with zombies and skeletons. Austin: "then lets go to
the next module". The design is in research/mobhouse_plan.md. Creepers and spiders come next (0.1.164), then the rare
mobs.

What it does:
- The Mob House block (Zoo Workshop: iron bars, a lantern and iron bars over three dark oak planks): a dark wood desk
  with an iron grate and a small green lantern, glowing faintly. It goes inside a hall you build in the park: walls,
  floor and roof all round with no gaps (doors count as wall), at least 3 x 3 x 3 of open space inside. A guest path runs
  from the Park Entrance Gate through the hall's door to right beside the block. Use the block to see how the house
  stands and to set its entry price (1 to 30 coins; guests think 8 is fair).
- Mob pens are exhibits beside the hall (their floor 3 blocks or less from it, a wall or two between), measured with the
  Habitat Marker as usual: shut in all round, roof included, and walled off from the hall with glass, glass panes or
  iron bars to look through (tinted glass for zombies and spiders, who like the dark: see 0.1.164 below). 25 blocks of floor for the first mob and 10 more for each more, 3 blocks of headroom. A
  Viewing Point stands in the hall (a guest path to it) looking into each pen.
- Guests pay to go in. Each visitor step the guests arriving are shared out between the park's open Mob Houses, and of
  those 40% go in at 8 coins (2% more for each coin under 8, up to 60%; 3% fewer for each coin over), 80% of that with
  one pen on view and all of it with two or more. Each payment is a Park Ledger line ("Mob House: 3 guests at 8"). With
  no pen on view nobody goes in.
- No wild monster spawns in the hall or the pens: one that does is taken away at once. Outside them, monsters spawn as
  they always do.
- Mob Taming research (Research Desk): spot a zombie and a skeleton in the Field Journal first, then 4 rotten flesh, 4
  bones, 2 spider eyes, 2 gunpowder and 250 coins. It makes the Passivity Serum work and opens the Mob Cage.
- The Passivity Serum (Zoo Workshop: a glass bottle, a golden carrot and a fermented spider eye make 2). Look at a
  zombie or a skeleton up close and use it:
  - at a quarter of its health or less (5 of 20): the serum is used, the mob sparkles green and calms down. It keeps
    its look, stands dazed for 3 seconds, then wanders about. A calmed one never attacks, never burns in the sun, never
    despawns, and only a player's hits hurt it.
  - with more health: "It shakes the serum off. Weaken it first", and you keep the serum. A baby zombie: "Leave the
    young ones be". Any other monster: "For now the Passivity Serum works only on zombies and skeletons". Before the
    research: it says Mob Taming is needed.
- The Mob Cage (Zoo Workshop: seven iron bars round an iron chain at the top and a Reinforced Crate in the middle):
  look at a calmed one up close and use it with its food in your inventory (a Meat Ration for a zombie, a Bone Ration
  for a skeleton; one is used). Then use it on the ground inside its pen. A calmed one also follows you while you hold
  its food.
- Bone Rations: 3 bones and a bowl make 3 (crafting table or Zoo Workshop).
- In the zoo: zombies want it dark (no daylight in the pen and nothing brighter than light 7) and graveyard earth (dirt,
  coarse dirt, podzol, rooted dirt or mud) under half the floor, and Meat Rations in a Basic Feeder. Skeletons want a
  crypt floor (bone blocks, cobblestone, mossy cobblestone, cobbled deepslate or gravel) under a third of the floor,
  and Bone Rations. Without their floor their comfort stops at 55. Zombies and skeletons share a pen ("Crypt"), up to
  6. They groan and rattle, never attack keepers or guests, and the keepers feed and clean as they do for the animals.
- The Field Journal has Zombie and Skeleton pages: spot one (a wild one counts), then see one calmed (or one in a zoo);
  after that one can be caught.
- `/zoocraft:build`'s test zoo has a Mob House for zombies and one for skeletons, each with its pen (61 exhibits now).

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a flat world at noon, a simulated
player; the test zoo built with only its two Mob Houses, 40 x 40; five runs, A to E):
- Both halls measured (130 blocks of space inside each); both pens were shut in all round, not open to the hall, and
  linked to their house; floors: the zombies' 59 coarse dirt and 16 podzol of 76, the skeletons' 16 bone blocks and 59
  cobblestone of 76. No issues on either pen; each hall's front has an oak door that a player opens.
- Right after the build both houses read "outside the park" for up to a minute: the builder puts the Mob House block
  down before the fence closes round the park, and the next visitor step checked them again and opened them (path
  linked). A Mob House a player places in a park that already has its fence is checked at once.
- The spawn guard: zombies summoned in both halls and in a pen, and a skeleton in the skeletons' hall, were taken away
  the same tick; a zombie summoned outside stayed (and burned in the noon sun, as wild ones do).
- Guests: a visitor step with 20 guests (10 for each house) had 3 pay 8 at each house (24 coins each, ledger lines
  "Mob House: 3 guests at 8"), the rest carried to the next step. In that small park's own slow trickle (1 guest a
  minute) each house built up its share step by step.
- The serum: as planned, the game sends no entity interaction for a plain zombie, so the serum's own use does it (the
  mob you look at). Before the research: the research message. A zombie at full health: "shakes the serum off", serum
  kept. A zombie at 4 and skeletons at 3: calmed, one serum each. A baby zombie: "Leave the young ones be". A creeper:
  "only zombies and skeletons". The journal said "spotted", then "saw one calmed: Ready to move".
- The calmed ones in the noon sun never burned and never had a target. Damage from no player (an attack, fire, magic)
  did nothing; a player's hit with a stick took 1.
- The Mob Cage: a calmed zombie went in (a Meat Ration used) and was let out in the zombies' pen: "Mildew is now living
  in Zombies!", a zoo zombie at full health with the other two. A calmed skeleton went in with a Bone Ration (one used).
  Two tries at the skeleton (runs B and C) said "Look at an animal up close": that was the test player, not the cage.
  Right after the test teleports it beside the mob its view points 25 degrees up, over the skeleton's head (run E
  logged its view: tilted up that tick, level a second later). With its view level the cage took the skeleton (run
  D). Before the journal had "Ready to move" for skeletons, the cage said so: "You don't know skeletons well enough to
  move one safely yet" (run E).
- Found and fixed while checking the recipes against the game's own item list: the Mob Cage's recipe named
  `minecraft:chain`, an id the game no longer has (the chain has been `minecraft:iron_chain` since the copper chains
  came); the recipe now uses the new id.
- No script errors in any run.

New entity, item, block and texture files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | In Creative, look in the creative menu (search "mob", "serum", "bone"). | The Mob House block, the Passivity Serum, the Mob Cage and the Bone Ration. |
| 2 | In Survival, as a member of a park, find a zombie and a skeleton (at night or in a cave) and look at each. | Field Journal: "You spotted one: Zombie" and "...: Skeleton". |
| 3 | Research Mob Taming at the Research Desk (4 rotten flesh, 4 bones, 2 spider eyes, 2 gunpowder, 250 coins). Craft serums at the Zoo Workshop. | The research is done; 2 serums from each craft. |
| 4 | Use a serum on a zombie at full health. | "It shakes the serum off. Weaken it first (a quarter of its health or less)." The serum is kept. |
| 5 | Hit it until it is nearly dead (5 health or less), then look at it and use a serum. | It sparkles green and stands still a moment, then wanders. It never attacks you. In daylight it doesn't burn. Journal: "Ready to move". |
| 6 | Hold a Meat Ration near it. | It follows you. |
| 7 | Build a hall: a closed room at least 3 x 3 x 3 inside with an oak door, the Mob House block inside, a guest path from the Park Entrance Gate through the door to the block. Use the block. | "Mob House: open, but no mob pen is on view yet." The menu shows the entry price (8) and the hall's space. |
| 8 | Beside the hall, build a pen: 5 x 5 floor or more with coarse dirt or podzol under half of it, walls and a roof all round, tinted glass on the hall side (plain glass lets in the daylight from the hall's door: 0.1.164), kept dark, a Basic Feeder with Meat Rations. Use the Habitat Marker inside. | The Exhibit Clipboard shows it ready, no issues. |
| 9 | Use a Mob Cage on the calmed zombie with a Meat Ration in your inventory, then use the cage on the pen's floor. | It goes in (the cage shows it's occupied), then "... is now living in ...". |
| 10 | Put a Viewing Point in the hall looking into the pen (a guest path to it). Leave the park open for a few minutes. | The Mob House menu: "1 mob pen on view", "Guests in today" goes up. Park Ledger lines "Mob House: N guests at 8". |
| 11 | Do the same with a skeleton: a crypt floor (bone blocks, cobblestone or gravel under a third of it), Bone Rations (3 bones and a bowl), the cage with a Bone Ration in your inventory. | The same: calmed, caught, living in its pen. |
| 12 | Leave the hall and pens dark for a night. | No wild monster appears in them. |
| 13 | Set the entry price to 20 in the menu. | It says fewer guests go in (the % in the menu drops). |
| 14 | Open the content log (Settings, Creator) after the steps above. | No lines about `mobs`, `mob house` or `serum`. |

## 0.1.164: the creeper and the spider

The second part of module 11 (Austin: "then lets go to the next module"; research/mobhouse_plan.md). The rare mobs
come next (0.1.165 Cyclops, 0.1.166 Necromancer Skeleton, 0.1.167 Voidling).

What's new:
- The Passivity Serum works on creepers and spiders too, the same way as on zombies: weaken one to a quarter of its
  health or less (5 of a creeper's 20, 4 of a spider's 16), look at it up close and use the serum. A creeper hisses and
  explodes when you are within about 2.5 blocks, so shoot it down with a bow and use the serum from 3 to 5 blocks away.
  A calmed creeper never swells or explodes; a calmed spider never climbs. Each follows a player holding its food (a
  Grain Ration for a creeper, a Meat Ration for a spider) and goes into a Mob Cage with one in your inventory. A cave
  spider, or any other monster: "For now the Passivity Serum works only on zombies, skeletons, creepers and spiders."
- They look exactly like the game's own (the vanilla models, textures and animations; a zoo creeper is never charged).
- Creepers in the zoo want grass blocks under a quarter of the pen's floor and 3 or more leaves or ferns in the pen
  (leaf blocks in a wall or as a bush, ferns on the grass), and Grain Rations in a Basic Feeder. They hiss softly now and
  then. A guest favourite: their pen's view counts a quarter more.
- Spiders want 3 or more cobwebs in the pen (hung in the corners and along the walls; they walk through them at full
  speed) and the dark, darker than the zombies': no daylight and nothing brighter than light 4 on the floor (a Nocturnal
  Lamp hung 3 blocks above the floor gives 4 right under it). Meat Rations. They stay on the floor.
- Without the floor or the things they like, comfort stops at 55; spiders out of the dark stop at 50. Creepers and
  spiders each keep a pen of their own (up to 6). The Field Journal has Creeper and Spider pages, the Exhibit Clipboard
  their lines ("Creepers' floor", "Leaves or ferns", "Cobwebs", "Dark").
- Daylight and doors, found on the test server: in Bedrock a shut door lets daylight through, and so do plain glass,
  glass panes and iron bars; it fades one level a block. So the daylight that comes into a hall through its door goes on
  into a pen behind plain glass or bars. A dark pen (zombies, spiders) needs tinted glass to the hall: it keeps the
  daylight out and the guests still see in. The test zoo's zombie pen had plain glass in 0.1.163 and was never dark: it
  has tinted glass now. The clipboard, the care warning, the journal, the Mob House menu and the nocturnal house's
  advice say so (the nocturnal house's used to say "doors shut").
- `/zoocraft:build`'s test zoo has a creeper pen (grass with a coarse dirt patch, three oak leaf bushes, three ferns,
  plain glass) and a spider pen (stone with a gravel patch, four cobwebs, tinted glass), each in its own Mob House (63
  exhibits now).

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a flat world at noon, a simulated
player; the test zoo built with only its creeper and spider Mob Houses, 40 x 40; two runs, A and B):
- Both pens shut in all round, not open to the hall, linked to their house. The creepers' floor: 56 grass blocks of 76,
  with 3 oak leaf bushes and 3 ferns counted; the spiders': 4 cobwebs. No issues and no care warnings on either.
- Run A found the daylight. The spiders' pen then had iron bars to the hall, and the hall a shut oak door: 65 of its 76
  floor blocks had sky light, up to 9 at the bars, so it was never dark (the same build as 0.1.163's zombie pen, with
  its plain glass). Run B measured it block by block: 15 outside the door, 14 in the shut door, 13 and 12 in the hall;
  behind plain glass 10 in the glass, then 9 and 8 in the creepers' pen; behind tinted glass 0. With tinted glass the
  spiders' pen had no daylight at all and nothing brighter than 4 (4 on the floor under each lamp): "Dark: yes".
- The spawn guard: a creeper summoned in the spiders' pen and a spider in the creepers' were taken away at once; a
  spider summoned outside stayed.
- The serum: a creeper at 4 health and a spider at 3 were calmed, one serum each ("It never attacks now (it never
  swells or explodes)", "... (and it never climbs)"); a creeper at full health shook it off (serum kept); a cave spider
  was told the serum works only on zombies, skeletons, creepers and spiders (serum kept). The journal said "spotted",
  then "saw one calmed: Ready to move" for each.
- A survival player stood beside the calmed creeper for 6 seconds and then among three zoo creepers in their pen for 8:
  no target, no explosion, no damage (they have no swell or explode part at all).
- The Mob Cage: the calmed creeper went in with a Grain Ration and out in its pen ("Hissy is now living in Creepers!"),
  the calmed spider with a Meat Ration ("Silky is now living in Spiders!"). Let out in the other's pen it was refused:
  "Creepers keep an exhibit of their own".
- The spiders stayed on the floor for the 40 seconds watched (y -60 every time). They chittered and the creepers hissed
  softly now and then (9 and 5 times in run B).
- Guests: a visitor step with 20 guests had 3 pay 8 at each house, each house with its pen on view.
- Spoiling the pens: the creepers' floor turned to dirt gave "Creepers want grass blocks under 25% of their floor or
  more (0% now)"; the spiders' cobwebs taken down and a torch on their floor (14) gave the cobweb warning and the dark
  warning (51 blocks too bright, brightest 14).
- No script errors in either run.

New entity files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | In Survival, as a member of a park, find a creeper and a spider (at night or in a cave) and look at each. | Field Journal: "You spotted one: Creeper" and "...: Spider". |
| 2 | With Mob Taming researched, hit a spider until it has 4 health or less, look at it and use a serum. | "The spider sparkles green and calms down. It never attacks now (and it never climbs)." Journal: "Ready to move". |
| 3 | Shoot a creeper with a bow until it is nearly dead, then step to 3 or 4 blocks from it, look at it and use a serum. | "The creeper sparkles green ... (it never swells or explodes)." Walk right up to it: it never hisses or explodes. |
| 4 | Use a serum on a cave spider. | "For now the Passivity Serum works only on zombies, skeletons, creepers and spiders." The serum is kept. |
| 5 | Beside a Mob House hall, build a creeper pen: 5 x 5 floor or more, grass blocks under a quarter of it, 3 leaf blocks or ferns, walls and a roof all round, glass to the hall, a Basic Feeder with Grain Rations. Use the Habitat Marker inside. | The Exhibit Clipboard: the pen ready, "Creepers' floor" in green, "Leaves or ferns: 3", no issues. |
| 6 | Use a Mob Cage on the calmed creeper with a Grain Ration in your inventory, then on the pen's floor. | It goes in, then "... is now living in ...". It creeps about and hisses softly now and then. |
| 7 | Build a spider pen the same way but with tinted glass to the hall, solid walls and roof, 3 cobwebs, Nocturnal Lamps hung 3 blocks above the floor and Meat Rations. Measure it, then cage the calmed spider in (a Meat Ration with you). | "Cobwebs: 3", "Dark: yes". The spider stays on the floor and walks through its cobwebs. |
| 8 | Put a torch on the spider pen's floor and measure again; then take the torch away. | "Dark: no: too bright ..." and a care warning; back to "yes" without it. |
| 9 | Try plain glass to the hall instead of the tinted glass, and measure (the hall has its door to the outside). | "Dark: no: daylight reaches N of M blocks"; tinted glass again fixes it. |
| 10 | Put a Viewing Point in the hall looking into each pen and leave the park open for a few minutes. | The Mob House menu counts the pens on view; Park Ledger lines "Mob House: N guests at 8". |
| 11 | Open the content log (Settings, Creator) after the steps above. | No lines about `mobs`, `mob house` or `serum`. |

## 0.1.165: the Cyclops

Module 11's first rare mob (Austin: "then lets go to the next module"; research/mobhouse_plan.md "0.1.165 Cyclops: the
design"). Next: 0.1.166 the Necromancer Skeleton, 0.1.167 the Voidling.

What's new:
- The Cyclops: about 3.5 blocks tall, grey-green, one big eye, a hide loincloth and a wooden club. It lives alone in a
  camp in the windswept hills (all five kinds) or the stony peaks, very rarely: the first time a member of a park that
  has done Mob Taming walks there, a camp is made 32 to 48 blocks from them, and never within 1,500 blocks of another.
  A round clearing of coarse dirt with gravel and stone, boulders round it but for the way in, a campfire in the middle,
  a bed of hides (brown carpet) under a rock wall at the back, two log seats, a pile of rocks and some bones. It sleeps
  on the bed at night. Walk within 16 blocks and the Field Journal says you found a Cyclops camp; its page is under
  Places, and the Places page points the way to the nearest.
- It goes for anyone in Survival or Adventure who comes within 12 blocks (sneaking, within 4). The fight goes on while
  someone stays that near or keeps hitting it, and ends when everyone is 28 blocks or more from its camp, or a minute
  goes by with neither. A move every 2.5 seconds: up close the club smash in front (8 and a knock back) or the stomp all
  round (5, thrown up); from 6 to 24 blocks off a rock thrown (6 on a hit, and a push; step aside and it misses). At
  half health an angry bellow: everyone within 10 blocks is slowed and pushed back, and its moves come faster. (On Easy
  the game makes the club and stomp hit for less: 5 and 3.5. The rock is always 6.)
- It can't be killed: at a quarter of its health (25 of 100) it sits down panting, and nothing hurts it then. Use a
  Passivity Serum on it while it sits (Mob Taming): "The Cyclops sparkles green and calms down. It never attacks now (no
  more club, stomps or rocks)." Its camp is caught then and no Cyclops comes back to it. On a Cyclops that isn't worn
  down: "It shakes the serum off. Wear it down first, till it sits down panting (a quarter of its health)." Left alone
  a minute while tired, it gets up rested.
- A calmed Cyclops follows a Meat Ration and goes into a Mob Cage with one in your inventory.
- In the zoo it lives in a pen beside a Mob House hall, as the other mobs, but a big one: 7 x 7 of floor for one and 25
  blocks more for a second (up to 2), and 6 blocks of air over every block it can stand on (the tops of boulders and
  of a Hanging Food Basket too). Stone under half its floor (stone, cobblestone, mossy cobblestone, andesite, diorite,
  granite, tuff, calcite or gravel) and 4 or more mossy cobblestone boulders in the pen. Meat Rations from a Basic
  Feeder. Its day: it wanders, eats at its feeder, picks up a rock, tosses it up and catches it, bellows softly, sits
  down to rest, and sleeps sitting at night. A guest favourite.
- The Field Journal has a Cyclops page and a Cyclops Camps page under Places; Mob Taming's text says the Cyclops takes
  the serum once worn down.
- `/zoocraft:build`'s test zoo has a Cyclops pen: a Mob House 13 by 14 with walls 8 high, its pen of stone with a
  gravel patch, a pile of nine mossy cobblestone boulders, a glass wall to the hall, two lanterns, a Basic Feeder of
  Meat Rations with a Hanging Food Basket and a Water Trough, and a pair of Cyclopes (64 exhibits).

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a simulated player; three runs: A and A2
in a flat world at noon with the test zoo built with only its Cyclops Mob House, B in the real terrain of seed 12345):
- The pen: shut in all round, linked to its house, 130 blocks of floor (109 stone, 12 gravel), 9 mossy cobblestone
  counted, no issues. Run A found 3 floor blocks short of the 6 blocks of air a Cyclops needs, with the roof 8 over the
  floor: the tops of the two boulders 2 high and the Hanging Food Basket over the feeder ("3 blocks of floor are under a
  roof ... Raise the roof to 6 blocks"). The house is 8 high now (the roof at 9): run A2 measured all 130 usable, no
  warning.
- Who starts a fight (run A): Survival 20 blocks off, no; sneaking 6 off, no; Creative 3 off, no; sneaking 3 off, yes;
  walking 12.5 off, no; 11 off, yes. Each fight opened with the bellow and the boss bar.
- The fight: a rock thrown from 10 to 11 blocks hit for 6 and pushed 1.8 blocks; up close the stomp hit for 3.5 and
  threw the player 3 blocks up, the club 5 and pushed 2.9 (Easy: the game halves a mob's hits and adds 1; on Normal 5
  and 8). Going more than 28 blocks from its home ended the fight at once. Standing 10 blocks off with no hits for 65
  seconds, it kept fighting.
- At 48 health the angry bellow. Hit from 30 to 25 it sat down panting; five more hits left it at 25.
- The serum: before Mob Taming, "The Passivity Serum needs Mob Taming research at the Research Desk first."; on a second
  Cyclops at full health, "It shakes the serum off. Wear it down first, till it sits down panting (a quarter of its
  health)." (serum kept); on the tired one, "The Cyclops sparkles green and calms down. It never attacks now (no more
  club, stomps or rocks). ...". The journal said "spotted", then "saw one calmed: Ready to move". A Survival player
  stood beside the calmed one for 6 seconds: not touched.
- The Mob Cage with a Meat Ration: "Brontes the Cyclops hopped into the carrier", then on the pen's floor "Brontes is now
  living in Cyclopes!". With the pair in it, a visitor step had 6 guests pay 8 at the house.
- The zoo day (run A2): by day it sat for about half a minute, walked about and sat again; set to night, it was asleep
  sitting 8 seconds later and stayed asleep; in the morning it was up again. (Run A looked only 25 seconds after dusk and saw them still awake: the night
  pick waits for the one before to run out, 15 to 30 seconds.)
- The camps (run B; a park claimed at spawn, which is in the sea): in the stony peaks at (-736, -288), no camp for 15
  seconds before Mob Taming (the research gate said no 3 times); 6 seconds after it, a camp 47 blocks away, its Cyclops
  on its bed of hides. It is cut into the mountain, so rock stands round its rim. In the windswept hills at (-2528,
  -1440), 2 seconds after arriving, a camp 49 blocks away in open grass, the way in open. Both had the clearing of coarse
  dirt with gravel, stone and andesite patches, the rock wall, 6 brown carpet, the campfire, 4 log blocks, 3 bones and
  the boulders. Walking up: "Field Journal: you found a Cyclops camp. ... Its page is
  under Places."
- Its Cyclops (run B): calm in Creative 5 blocks off; in Survival 9 off a fight and a rock (6); 45 off the fight ended.
  At night it went to its bed and slept (3.5 seconds); in the morning it got up. Worn down to 25 and given the serum it
  was calmed, the camp marked caught, and no Cyclops came back to it in 30 seconds.
- In the stony peaks again at (-960, -640), 420 blocks from the first camp: no camp (1,500 blocks apart).
- No script errors in any run.

New entity files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | As a member of a park that has done Mob Taming, go to windswept hills or stony peaks (`/locate biome stony_peaks`). | Within a few seconds a camp 32 to 48 blocks away. Walk within 16 blocks: "Field Journal: you found a Cyclops camp ...". Its page is under Places. |
| 2 | In Creative, walk right up to it. Then in Survival, sneak up to 5 blocks, then walk up to 12. | Nothing in Creative or sneaking at 5. At 12 it bellows, the "Cyclops" boss bar shows and it fights. |
| 3 | Stand 8 to 20 blocks off; then close in. | Rocks thrown at you (6 each; step aside and they miss). Up close the club smash in front and the stomp all round. |
| 4 | Hit it down past half its health. | The angry bellow: slowed and pushed back if within 10; faster moves after. |
| 5 | Hit it down to a quarter; keep hitting it. | It sits down panting; the boss bar goes; the hits do nothing. |
| 6 | Use a Passivity Serum on another Cyclops at full health (or this one before Mob Taming). | "It shakes the serum off ..." (or "needs Mob Taming research"); the serum is kept. |
| 7 | Use a Passivity Serum on the sitting one, up close. | "The Cyclops sparkles green and calms down ...". The journal: "saw one calmed: Ready to move". No Cyclops comes back to that camp. |
| 8 | Mid-fight, run 30 blocks away from its camp; come back at night. | The fight ends and it goes home. At night it sleeps on its bed of hides. |
| 9 | Use a Mob Cage on the calmed Cyclops with a Meat Ration in your inventory, then on the floor of a Cyclops pen. | It goes in, then "... is now living in ...". |
| 10 | Build its pen beside a Mob House hall: 7 x 7 of floor or more, walls and a roof 7 blocks over the floor (more over boulders), stone under half the floor, 4 mossy cobblestone, a Basic Feeder of Meat Rations. Use the Habitat Marker inside. | The Exhibit Clipboard: the pen ready, no issues. A boulder 2 high under a roof only 7 up: "N blocks of floor are under a roof ... Raise the roof". |
| 11 | Watch it in its pen by day and at night. | It wanders, eats, tosses a rock up and catches it, bellows softly, sits; asleep sitting at night. |
| 12 | Walk into windswept hills or stony peaks less than 1,500 blocks from that camp. | No new camp. |
| 13 | Open the content log (Settings, Creator) after the steps above. | No lines about `boss`, `cyclops` or `serum`. |

## 0.1.166: the Necromancer

Module 11's second rare mob (Austin: "then lets go to the next module"; research/mobhouse_plan.md "0.1.166 Necromancer
Skeleton: the design"). Next: 0.1.167 the Voidling.

What's new:
- The Necromancer: a skeleton about 2.2 blocks tall in a deep purple-black hooded robe with a pale cyan hem, glowing cyan
  eyes, and a crooked staff with a blue soul flame at its top. It lives alone in a crypt in the Nether, very rarely: the
  first time a member of a park that has done Mob Taming walks through a soul sand valley, or past a Nether fortress
  (40 or more of its nether brick blocks within 20 blocks of them), a crypt is made 28 to 44 blocks away, never within
  1,500 blocks of another, never in or under the fortress, never within 40 blocks of another boss's lair. A round floor
  of soul soil with soul sand and a cross of polished blackstone bricks, low broken walls round it but for the way in,
  four pillars with soul lanterns on top, an altar of chiseled polished blackstone between two soul lanterns at the back,
  a black carpet before it where the Necromancer stands at night with its head bowed, two headstones and some bones. The
  crypt can sit on rough ground: it cuts rises of up to 5 blocks away and fills dips of up to 4, and where the ground
  rises in front of its way in, a path 3 wide is cut out through the Nether's own ground (never a fortress's or a
  bastion's blocks). Round a fortress in the basalt deltas there is rarely any ground for one (lava all round), so it is made elsewhere. Walk within 16 blocks and
  the Field Journal says you found a Necromancer Crypt; its page is under Places.
- It goes for anyone in Survival or Adventure who comes within 12 blocks (sneaking, within 4), and the fight goes on as
  the Cyclops's does (over when everyone is 28 blocks or more from its crypt, or a minute goes by with nobody near and no
  hit). A move every 2.5 seconds: up close the staff strike in front (6 and a knock back) or the soul ring all round
  (4, slowed 2 seconds); from 5 to 24 blocks off a soul bolt that flies straight (6 on a hit and set on fire; step aside
  and it misses). At half health the soul wail: everyone within 10 blocks slowed and pushed back, and its moves come
  faster. (On Easy the game cuts the staff and the ring to 4 and 3; the bolt is always 6.)
- It raises skeletons: 5 seconds into a fight, then every 10 seconds, it lifts its staff and a plain skeleton claws up
  out of the ground 2.5 to 4 blocks from it, toward you, while fewer than 3 it raised still stand. They fight as
  skeletons do and drop what skeletons drop if you kill them, but they never hurt each other, its bolts and its soul
  ring never hurt them, and they never burn. When the fight ends, when it kneels tired out, when it is calmed, or when it
  is gone, they crumble into soul fire and are gone (nothing dropped). One left over (the world closed mid-fight)
  crumbles within 5 seconds of a player coming near.
- It can't be killed: at a quarter of its health (20 of 80) it kneels down panting on its staff, and nothing hurts it
  then. Use a Passivity Serum on it while it kneels (Mob Taming): "The Necromancer sparkles green and calms down. It
  never attacks now (no more bolts, and it raises nothing). ..." Its crypt is caught then and no Necromancer comes back
  to it. On one that isn't worn down: "It shakes the serum off. Wear it down first, till it kneels down panting (a
  quarter of its health)." Left alone a minute while tired, it gets up rested.
- A calmed Necromancer follows a Bone Ration (or a bone) and goes into a Mob Cage with a Bone Ration in your inventory.
- In the zoo it lives in a pen beside a Mob House hall: 5 x 5 of floor for one and 10 more for a second (up to 2), 3
  blocks of headroom, soul sand or soul soil under half its floor and a soul lantern or more in the pen. Bone Rations
  from a Basic Feeder. Its day: it wanders, eats at its feeder, holds its staff up and lets a soul flame float off it,
  chants softly, kneels to rest, and at night kneels with its head bowed. It never raises anything in the zoo, and it
  never burns. A guest favourite.
- The Field Journal has a Necromancer page and a Necromancer Crypts page under Places; Mob Taming's text says the
  Necromancer takes the serum once worn down and where its crypts are.
- `/zoocraft:build`'s test zoo has a Necromancer pen: an 11 by 11 Mob House with walls 5 high, its pen of soul soil with
  soul sand patches, a soul lantern hung over the middle, a glass wall to the hall, a Basic Feeder of Bone Rations with a
  Hanging Food Basket and a Water Trough, and a pair of Necromancers (65 exhibits).

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a simulated player with Resistance III,
so its hits read 0.4 of what the game dealt; runs A and A2 in a flat world at noon with the test zoo built with only its
Necromancer Mob House, B to B4 in the real Nether of seed 12345):
- The pen: shut in all round, linked to its house, 76 blocks of floor (soul soil and soul sand), no issues.
- Who starts a fight (runs A and A2): Survival 20 blocks off, no; sneaking 6 off, no; Creative 3 off, no; walking 12.5
  off, no; 10 off, yes. Each fight opened with the wail and the boss bar.
- The fight: soul bolts from 5 to 10 blocks off hit and set the player on fire; up close the staff strike and the soul
  ring (slowed). Going more than 28 blocks from its home ended the fight. Standing near with no hits for 65 seconds, it
  kept fighting. Hit from 44 to 36 it gave the soul wail; at 20 it knelt down panting, and more hits left it at 20.
- Raising (run A2, with the fixes): the first skeleton 6 seconds into the fight (the raise starts at 5 seconds
  and takes 1), then one every 10 seconds, never more than 3 standing; one killed, another raised at its next turn. A
  player's hit hurt one (20 to 16); set on fire, it took nothing. No raised skeleton was hurt by another's arrows (run
  A: 17 such hits, before the fix). They crumbled into soul fire when the fight ended (the player over 28 blocks from
  its home), when it knelt tired (3 of 3), when it was removed, and a tagged skeleton nobody had raised was swept away
  1.4 seconds later. A raise due mid-move waits for that move to end (7.4 seconds in, in the last two fights).
- The serum: before Mob Taming, "The Passivity Serum needs Mob Taming research at the Research Desk first."; on a second
  Necromancer at full health, "It shakes the serum off. Wear it down first, till it kneels down panting (a quarter of
  its health)."; on the tired one, "The Necromancer sparkles green and calms down. It never attacks now (no more bolts,
  and it raises nothing). ...". The journal said "spotted", then "saw one calmed: Ready to move".
- The Mob Cage with a Bone Ration: "Grimwald the Necromancer hopped into the carrier", then on the pen's floor "Grimwald
  is now living in Necromancers!". With the pair in it, a visitor step had 6 guests pay 8 at the house.
- The zoo day: by day they walked about, ate at the feeder and knelt; set to night, both knelt head bowed and stayed so;
  in the morning they were up.
- The crypts (runs B2 to B4; a park claimed at the Overworld's spawn): beside the fortress in the basalt deltas at (-480,
  -864), no crypt (lava all round: no ground for one), and the next look waited 30 seconds. Beside the fortress at
  (288, -240): the first stand (on the fortress) found its site had fortress blocks over it; the second, 31 seconds
  later, made a crypt 42 blocks away at (368, 70, -240) in a crimson forest, its Necromancer on its carpet. From
  above: the floor of soul soil with soul sand and the cross of polished blackstone bricks, the walls, the pillars, the
  altar (3 chiseled polished blackstone) and 6 black carpet. That crypt was cut into rising ground: rock stood round
  its rim and in front of its way in. The way out, cut into it on the bench as 0.1.166 builds it, took 21
  blocks of netherrack and crimson ground and left a path 3 wide and 6 long out through the rise.
- In a fresh world (run B4) the third stand beside that fortress made a crypt 42 blocks away at (208, 68, -280), on
  level ground. Walking in: "Field Journal: you found a Necromancer's crypt ...". A fight in it: the first skeleton 6
  seconds in, the next 10 seconds later, each clawing out 4 blocks from it onto the ground; worn down to 20 it knelt
  and both crumbled; the serum calmed it, the crypt was marked caught, and 20 seconds later no wild Necromancer was
  there. In the soul sand valley by the fortress at (-288, 1248), 1,600 blocks off, a crypt 34 blocks away 1.6 seconds
  after arriving (a Soul Sloth's lair was made 55 blocks off at the same moment, its own kind). Set to night, its
  Necromancer went to its carpet and knelt head bowed. Back at the basalt deltas fortress, under 1,500 blocks from the
  first crypt, no crypt was looked for at all.
- Each look round a fortress took 19 to 77 ms, every 5 seconds at most and 30 seconds apart after one that found no
  site; counting a fortress's blocks took 1 to 2 ms.
- No script errors in any run.

New entity files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | As a member of a park that has done Mob Taming, go into a soul sand valley in the Nether (`/locate biome soulsand_valley` from the Nether). | Within a few seconds a crypt 28 to 44 blocks away. Walk within 16 blocks: "Field Journal: you found a Necromancer Crypt ...". Its page is under Places. |
| 2 | In a world with no crypt yet, walk through a Nether fortress outside a soul sand valley (not the basalt deltas). | A crypt beside it within a minute or two (sooner where there is open ground), never in the fortress or under its bridges. |
| 3 | In Creative, walk right up to it. Then in Survival, sneak up to 5 blocks, then walk up to 12. | Nothing in Creative or sneaking at 5. At 12 it wails, the "Necromancer" boss bar shows and it fights. |
| 4 | Stand 8 to 20 blocks off; then close in. | Soul bolts at you (6 and set on fire; step aside and they miss). Up close the staff strike in front and the soul ring all round (slowed). |
| 5 | Keep fighting it for half a minute. | About 5 seconds in it lifts its staff and a skeleton claws out of the ground beside it; another every 10 seconds, never more than 3 standing. Kill one and another comes. |
| 6 | Hit it down past half its health. | The soul wail: slowed and pushed back if within 10; faster moves after. |
| 7 | Hit it down to a quarter; keep hitting it. | It kneels down panting; its skeletons crumble into soul fire; the boss bar goes; the hits do nothing. |
| 8 | Use a Passivity Serum on another Necromancer at full health (or this one before Mob Taming). | "It shakes the serum off ..." (or "needs Mob Taming research"); the serum is kept. |
| 9 | Use a Passivity Serum on the kneeling one, up close. | "The Necromancer sparkles green and calms down ...". The journal: "saw one calmed: Ready to move". No Necromancer comes back to that crypt. |
| 10 | Mid-fight with skeletons up, run 30 blocks from its crypt; come back at night. | The fight ends, its skeletons crumble and it goes home. At night it stands on its carpet before the altar, head bowed. |
| 11 | Use a Mob Cage on the calmed Necromancer with a Bone Ration in your inventory, then on the floor of a Necromancer pen. | It goes in, then "... is now living in ...". |
| 12 | Build its pen beside a Mob House hall: 5 x 5 of floor or more, walls and a roof 4 blocks over the floor, soul sand or soul soil under half the floor, a soul lantern, a Basic Feeder of Bone Rations. Use the Habitat Marker inside. | The Exhibit Clipboard: the pen ready, no issues. |
| 13 | Watch it in its pen by day and at night. | It wanders, eats, holds its staff up with a soul flame floating off it, chants, kneels; at night kneels with its head bowed. |
| 14 | Walk into another soul sand valley or fortress less than 1,500 blocks from that crypt. | No new crypt. |
| 15 | Open the content log (Settings, Creator) after the steps above. | No lines about `boss`, `necromancer` or `serum`. |

## 0.1.167: the Voidling

Module 11's third rare mob, and the last of the module (Austin: "then lets go to the next module"; research/mobhouse_plan.md
"0.1.167 Voidling: the design").

What's new:
- The Voidling: a thin, long-armed shadow about 2.5 blocks tall, near black with violet cracks and eyes that glow, and
  three long fingers on each hand. It is very slow (about half a zombie's pace: walk away and it never catches you). It
  lives alone in a rift on the outer End islands (more than 800 blocks from the End's middle), very rarely: the first
  time a member of a park that has done Mob Taming walks out there, a rift is made 16 to 40 blocks away by an island's
  edge (the void within 14 blocks of its middle), on level ground, never within 1,500 blocks of another rift and never
  within 40 blocks of another boss's lair (a Baby Dragon's nest). A round floor of end stone patched with end stone
  bricks and obsidian, a 3 by 3 of crying obsidian in its middle, and round it a broken ring of six obsidian pillars,
  some topped with end rods. Where there is no edge near, no rift is made there (it looks again 30 seconds later as you
  walk on). Walk within 16 blocks and the Field Journal says you found a Voidling's rift; its page is under Places.
- It goes for anyone in Survival or Adventure who comes within 10 blocks (sneaking, within 4), and the fight goes on as
  the Cyclops's does (over when everyone is 28 blocks or more from its rift, or a minute goes by with nobody near and no
  hit). A move every 2.5 seconds: up close the claw rake in front (5 and a small push); from 5 to 20 blocks off a violet
  void orb that flies slowly and straight (4 on a hit, 3 seconds of Darkness and a small push; step aside and it
  misses). Every push it gives is guarded: it never throws anyone off an island. At half health the void shriek:
  everyone within 10 blocks slowed, in Darkness for 4 seconds and pushed back a little; its moves come faster after.
  (On Easy the game cuts the rake to 3.5; the orb is always 4.)
- The grab (up close, in front of it, when it has a way to an island's edge): it shrieks for a second with its arms
  thrown wide (step back out of its reach), then lunges. Whoever is still in reach is held out in front of it, lifted
  off the ground, and walked slowly to the edge, then let go over the void. Any hit on it breaks the grab: it staggers
  back and puts you down, pushed back toward the island. An ender pearl (or a chorus fruit) gets you away too. It lets
  go wherever it is if something blocks its way for 2 seconds, and after 16 seconds whatever. No second grab for 10
  seconds. With no way to an edge (flat ground, a wall in the way, steep ground) it rakes instead.
- It can't be killed: at a quarter of its health (20 of 80) it crouches down panting, and nothing hurts it then. Use a
  Passivity Serum on it while it crouches (Mob Taming): "The Voidling sparkles green and calms down. It never attacks
  now (no more grabs, rakes or orbs). ..." Its rift is caught then and no Voidling comes back to it. On one that isn't
  worn down: "It shakes the serum off. Wear it down first, till it crouches down panting (a quarter of its health)."
  Left alone a minute while tired, it gets up rested.
- A calmed Voidling follows Chorus Browse (or a chorus fruit) and goes into a Mob Cage with Chorus Browse in your
  inventory.
- In the zoo it lives in a pen beside a Mob House hall: 5 x 5 of floor for one and 10 more for a second (up to 2), 3
  blocks of headroom, end stone or end stone bricks under half its floor (a solid floor: no void in the zoo) and a crying
  obsidian set in the floor or a wall. Chorus Browse from a Basic Feeder. Its day: it wanders slowly, eats at its
  feeder, stretches its long arms up and lets a violet wisp float off its fingers, hums now and then, crouches to rest,
  and at night crouches with its head bowed. It never grabs anyone in the zoo. A guest favourite.
- The Field Journal has a Voidling page and a Voidling Rifts page under Places; Mob Taming's text says the Voidling
  takes the serum once worn down and where its rifts are.
- `/zoocraft:build`'s test zoo has a Voidling pen: an 11 by 11 Mob House with walls 5 high, its floor end stone with a
  patch of end stone bricks and a crying obsidian set in it, a glass wall to the hall, a Basic Feeder of Chorus Browse
  with a Hanging Food Basket and a Water Trough, and a pair of Voidlings (66 exhibits).
- Three fixes found on the bench, for the bosses before it too: a thrown thing's hit on a player never got past reading
  how it flew (the thrown thing is gone by then), so the Baby Dragon's bolt never gave its small guarded push; it does
  now, and the Voidling's orb gives Darkness. A block check the game's scripts don't have (it read as "not solid" for
  every block) made the lairs since the Yeti's fill every block under their floors, not just the holes; now only holes,
  liquid and grass are filled. And a rift made beside a Chorus Meadow's pond flooded (the game's "top block" reads
  under water): rifts and the Baby Dragon's nest clearings are never made on or beside a pond now.

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a simulated player with Resistance III,
so its hits read 0.4 of what the game dealt; runs A, C2 and D in a flat world at noon with the test zoo built with only
its Voidling Mob House, B5 (and its continuations), L and L2 on the real outer End islands of seed 12345):
- The pen: shut in all round, linked to its house, 76 blocks of floor (end stone with end stone bricks), no issues.
- Who starts a fight (run A): Survival 20 blocks off, no; sneaking 6 off, no; Creative 3 off, no; walking 10.6 off,
  no; 9.5 off, yes. The fight opened with its shriek and the boss bar.
- The fight on flat ground (run A): void orbs from 6 to 12 blocks off hit for 1.6 (4 before the 0.4); up close the
  claw rake hit for 1.4 (5, 3.5 on Easy, then the 0.4). With no island edge near it never grabbed: it raked instead.
  Standing near with no hits for 65 seconds, it kept fighting. Hit down to 28 it turned angry; at 20 it crouched down
  panting. Walking 43 blocks off ended a fight (its boss bar gone, calm again).
- The orb (runs D and C2): run D found the hit on a player never got past reading how the orb flew (the orb is gone
  by then: "Entity being invalid" three times), so no Darkness and no push; with the fix (run C2) each orb that hit gave
  3 seconds of Darkness and a 0.4 block push.
- The void shriek (run C2): hit from 42 to 38 it shrieked; the player 5.8 blocks off was slowed and in Darkness.
- The serum (run A): before Mob Taming, "The Passivity Serum needs Mob Taming research at the Research Desk first."; at
  full health "It shakes the serum off. Wear it down first, till it crouches down panting (a quarter of its health)."; at
  20 "The Voidling sparkles green and calms down. ...". A Mob Cage (with Chorus Browse) took the calmed one and let it
  out into the pen: the pen occupied with no issues, the pair in it, the house showing them at 8 a guest.
- The zoo day (run C2): by day it sat and wandered; set to night, 30 seconds later it crouched head bowed (sleeping).
- The outer End islands (run B5): a stand on a big island by the Baby Dragon's spot (2,120 blocks out) found no rift
  site (24 sites with no void within 14 blocks); the next look, 30 seconds later and 10 blocks in from an edge, made a
  rift at (493, 55, 1989), 3 blocks from the edge. Walking in: "Field Journal: you found a Voidling's rift ...".
- The grab (run B5): standing in front of it by the edge, it shrieked for a second, lunged, held the player out in
  front of it and walked them 2.1 blocks to the edge (2 seconds), then let go over the void: the player fell into the
  void and it killed them.
- Broken by a hit: a hit 1.3 blocks into a drag (3 damage): it let go at once and staggered back; the player was put
  down on the island beside it.
- Escaped (an ender pearl's teleport 3 blocks behind it, as soon as it grabbed): it let go 3 ticks into the drag (the
  player 4.3 blocks from where it held them), twice, the second on a drag 7.1 blocks long.
- On its island: orbs from 10.7 blocks off with Darkness; it never walked off the island after the player. Hit down to
  39 it shrieked (the player 1.9 off slowed and in Darkness); at 20 it crouched panting; the serum calmed it there, its
  rift was marked caught, and 25 seconds later no wild Voidling was there.
- A fix found on the islands: Block.isSolid is not in the game's stable scripts (it read undefined), so no column was
  ever ground and no grab ever had a way to the edge (run B4: "route=none" for every rift); with the passable-block list
  every grab found its way.
- The rift look: done at once, a look that found no site on the big island took 0.47 seconds in one tick (run B5). As
  a job (runs L and L2), the same look ran in 358 and 375 small steps of at most 5 and 7 ms, spread over 0.5 and 0.7
  seconds; a look that made a rift took 11 to 48 ms in all, at most 2 ms a step. The rifts were still made and built,
  each with its Voidling at home.
- A pond: the rift in run B5 was cut in a Chorus Meadow beside its pond, and the pond ran in over its floor (79 blocks of
  water a block deep). The game's "top block" reads under water (the end stone under the pond; gravel under the sea at
  the Overworld's spawn), so the ground check never saw it. Now the block over each column's top is read too: at that
  rift's spot it finds water in 74 columns and no rift would be made there, while runs B4's and L's spots read dry. In
  run L2 one site was turned down for water and the rift was made 11 blocks away, dry. The Baby Dragon's nest clearing
  (run L2) was still made and built with the same check.
- No script errors from the add-on in any run.

New entity files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | As a member of a park that has done Mob Taming, go to the outer End islands (through an End gateway after the dragon) and walk near an island's edge. | Within half a minute or so a rift 16 to 40 blocks away by an edge. Walk within 16 blocks: "Field Journal: you found a Voidling's rift ...". Its page is under Places. |
| 2 | In Creative, walk right up to it. Then in Survival, sneak up to 5 blocks, then walk up to 10. | Nothing in Creative or sneaking at 5. At 10 it shrieks, the "Voidling" boss bar shows and it fights. |
| 3 | Stand 6 to 18 blocks off; then walk away from it. | Void orbs at you (4, a small push and 3 seconds of Darkness; step aside and they miss). It follows very slowly: you walk away easily. |
| 4 | Stand right in front of it near the island's edge and wait. | It shrieks with its arms thrown wide for a second, then lunges: you are held out in front of it and walked to the edge, then dropped into the void. |
| 5 | Let it grab you again, and hit it while it holds you. | It lets go at once and staggers back; you are put down pushed back toward the island. |
| 6 | Let it grab you again, and throw an ender pearl back onto the island. | It lets go when you land. |
| 7 | Up close on flat ground away from any edge. | It rakes you instead (5 and a small push that never throws you off). |
| 8 | Hit it down past half its health. | The void shriek: slowed, Darkness and pushed back a little if within 10; faster moves after. |
| 9 | Hit it down to a quarter; keep hitting it. | It crouches down panting; the boss bar goes; the hits do nothing. |
| 10 | Use a Passivity Serum on another Voidling at full health (or this one before Mob Taming). | "It shakes the serum off ..." (or "needs Mob Taming research"); the serum is kept. |
| 11 | Use a Passivity Serum on the crouching one, up close. | "The Voidling sparkles green and calms down ...". The journal: "saw one calmed: Ready to move". No Voidling comes back to that rift. |
| 12 | Use a Mob Cage on the calmed Voidling with Chorus Browse in your inventory, then on the floor of a Voidling pen. | It goes in, then "... is now living in ...". |
| 13 | Build its pen beside a Mob House hall: 5 x 5 of floor or more, walls and a roof 4 blocks over the floor, end stone or end stone bricks under half the floor, a crying obsidian in the floor or a wall, a Basic Feeder of Chorus Browse. Use the Habitat Marker inside. | The Exhibit Clipboard: the pen ready, no issues. |
| 14 | Watch it in its pen by day and at night, and stand beside it in Survival. | It wanders slowly, eats, stretches up with a violet wisp off its fingers, hums, crouches to rest; at night crouches head bowed. It never grabs or hits you. |
| 15 | Fight a Baby Dragon on the outer islands and let its bolt hit you. | A small push (never off the island). |
| 16 | Open the content log (Settings, Creator) after the steps above. | No lines about `boss`, `voidling` or `serum`. |
