# Giant Yeti: test plan (0.1.159)

Module 10, bosses: the first boss. Austin: "then lets go to the next module". The design is in
research/boss_plan.md.

What it does:
- Wild Giant Yetis live in the taigas (snowy or not), one to an area. Walking in a taiga as a park member with no lair
  within 800 blocks gets one made 32 to 48 blocks away: a round snowy clearing 17 across with patches of packed ice,
  sweet berry bushes, bones and mossy boulders, and a den of stone, mossy cobblestone and packed ice with two ice
  spikes by its door and a moss bed inside. The yeti is put in its den. If it goes missing, it comes back.
- Calm: it wanders its clearing, roars now and then, and at night goes to its moss bed and sleeps sitting.
- It fights when you hit it, or when you walk within 5 blocks of it in Survival or Adventure without sneaking. Creative
  players and sneaking players are left alone. It rears up and roars, and its boss bar shows ("Giant Yeti").
- In a fight it walks at you, and every couple of seconds stops for a move with a wind-up you can see: a swipe (an arm
  drawn back, then a backhand: 7, about 3 blocks of knock back), a ground slam (both fists up, then down: 6 to everyone
  near, thrown up and back) and from afar a snowball hurl (snow scooped up over its head and thrown at you: 5). Mojang's
  difficulty scales them: on Easy the swipe is 4.5 and the slam 4.
- At half its energy it beats its chest and gives a frost roar: everyone within 12 blocks is slowed and pushed back,
  and it is quicker after.
- It is never killed. Only a player's hits wear it down (fire, lava, falls and other mobs don't touch it); at 40 of
  its 400 it slumps down tired out, panting, its bar gone, and nothing hurts it. Only now does the Yeti Cage work.
- Left alone (nobody within 32 blocks) for a minute it gets up rested. A fight also ends if you leave its lair.
- The Yeti Cage: Yeti Tracking research (Research Desk, after 5 ready exhibits: 2 iron blocks, 8 packed ice, a
  compass, 300 coins), then 6 iron bars, 2 packed ice and a Reinforced Crate at the Zoo Workshop. With Yeti Tracking
  done, the Field Journal's Places page has "Giant Yeti Lairs" with the way to the nearest wild one.
- In a zoo it is calm and a guest favourite: 400 blocks of floor (20 x 20) for one, 200 more for a second, 5 blocks of
  headroom, snow or ice under half the floor, a den (a roof 5 up over part of it), a Cooling Unit with ice, Fruit or
  Fish Rations. It eats at the feeder, tosses snowballs up and catches them, roars, sits to rest, sleeps at night.

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, a simulated Survival player): Creative 3 blocks off
and sneaking 3 blocks off, no fight; walking up to 4 blocks, the roar (2 s), the bar on, swipes for 4.5 that pushed the
player 2.7 blocks, slams for 4 that threw them 3.2 blocks and 2 up, snowballs that hit for 5 from 7 to 20 blocks off; at 186 the
frost roar and Slowness II; worn from 50: 42, then a hit cut to 2 so it stopped at 40, tired out, the bar off, every
hit after did nothing; the cage check said yes only while tired; a player 40 blocks off for a minute and it got up
at 400; left with nobody near for a minute and met again, up at 400 (half a minute, still tired), with the daylight
cycle off too; walking off past its lair, the fight ended and the bar went off. A lair was made in a taiga 44 blocks from the player and built in under a second (snow 186 blocks,
packed ice 35, the den, the moss bed, 4 berry bushes, 3 bones); no second one; the yeti taken away came back; at night it
sat on its moss bed asleep, and in the morning got up.

New entity, item and texture files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | In Creative, look in the creative menu under Equipment, and for a spawn egg. | The Yeti Cage (an iron cage with ice bands) and the Wild Giant Yeti Spawn Egg. |
| 2 | Survival, as a member of a park, walk into a taiga (`/locate biome taiga`) and keep walking a little. | Within a few seconds, 32 to 48 blocks away: a snowy round clearing with a stone and ice den, two ice spikes by its door, berry bushes and bones. A big white yeti (3.6 blocks tall) in it. |
| 3 | Walk up to it sneaking, right next to it. | It doesn't mind. |
| 4 | Stop sneaking within 5 blocks (or hit it). | It rears up beating its chest and roars; the boss bar "Giant Yeti" shows at the top. |
| 5 | Stay close. | It walks at you; it draws an arm back and backhands you (knocked back a few blocks), or raises both fists and slams the snow (a burst of snow; you are thrown up and back). You can see each coming: step away. |
| 6 | Back off 8 to 20 blocks. | It scoops up snow and hurls a big snowball at you; step aside and it misses. |
| 7 | Hit it with a sword till the bar is half. | It stops, beats its chest and roars; you are slowed and pushed back. It is quicker after. |
| 8 | Light it on fire, or lead it into lava, or let wolves at it. | Its bar doesn't move. |
| 9 | Keep hitting it. | At the last tenth it slumps down sitting and panting; the bar goes; hits do nothing. |
| 10 | Use a Yeti Cage on it with a Fruit Ration in your inventory (after Yeti Tracking research). Before it is tired, try the cage too. | Tired: it goes in (the cage shows it's occupied). Not tired: "A Giant Yeti only goes into its cage once it is tired out...". |
| 11 | Another yeti: wear it down, then walk 40 blocks off and wait a minute. | It gets up, its bar full again when you next fight it. |
| 12 | Wait for night near a lair (or `/time set night`). | It walks into its den and sits asleep on the moss. In the morning it gets up. |
| 13 | Field Journal, Places, after Yeti Tracking. | "Giant Yeti Lairs" with the way to the nearest wild one. |
| 14 | Build an exhibit (snow or ice under half the floor, a roofed den 5 high, a Cooling Unit with ice, a Basic Feeder of Fruit Rations) and release it. `/zoocraft:build` also has one. | Calm; it eats at the feeder, tosses snowballs and catches them, roars now and then, sits, sleeps at night. Guests like it. The Exhibit Clipboard shows "Snow underfoot". |
| 15 | Open the content log (Settings, Creator) after the steps above. | No lines about `yeti`. |
