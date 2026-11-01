# Hostile Mob House: test plan (0.1.163, 0.1.164)

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
