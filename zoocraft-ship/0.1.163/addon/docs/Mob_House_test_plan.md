# Hostile Mob House: test plan (0.1.163)

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
  iron bars to look through. 25 blocks of floor for the first mob and 10 more for each more, 3 blocks of headroom. A
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
| 8 | Beside the hall, build a pen: 5 x 5 floor or more with coarse dirt or podzol under half of it, walls and a roof all round, glass or iron bars on the hall side, kept dark, a Basic Feeder with Meat Rations. Use the Habitat Marker inside. | The Exhibit Clipboard shows it ready, no issues. |
| 9 | Use a Mob Cage on the calmed zombie with a Meat Ration in your inventory, then use the cage on the pen's floor. | It goes in (the cage shows it's occupied), then "... is now living in ...". |
| 10 | Put a Viewing Point in the hall looking into the pen (a guest path to it). Leave the park open for a few minutes. | The Mob House menu: "1 mob pen on view", "Guests in today" goes up. Park Ledger lines "Mob House: N guests at 8". |
| 11 | Do the same with a skeleton: a crypt floor (bone blocks, cobblestone or gravel under a third of it), Bone Rations (3 bones and a bowl), the cage with a Bone Ration in your inventory. | The same: calmed, caught, living in its pen. |
| 12 | Leave the hall and pens dark for a night. | No wild monster appears in them. |
| 13 | Set the entry price to 20 in the menu. | It says fewer guests go in (the % in the menu drops). |
| 14 | Open the content log (Settings, Creator) after the steps above. | No lines about `mobs`, `mob house` or `serum`. |
