# Soul Sloth: test plan (0.1.161)

Module 10, bosses: the second boss. Austin: "then lets go to the next module". The design is in
research/boss_plan.md.

What it does:
- Wild Soul Sloths live in the soul sand valleys in the Nether, one to an area. Walking in a soul sand valley as a park
  member with no lair within 800 blocks gets one made 32 to 48 blocks away: a round clearing 17 across of soul soil
  with soul sand patches, a fossil arch of bone blocks at the back (two pillars and a beam across 7 blocks up), soul
  lanterns hanging from bone brackets and soul torches by the pillars, basalt columns and old bone ribs round the rim.
  The sloth is put hanging upside down under the beam. If it goes missing, it comes back.
- Calm: it hangs from the beam by its claws, asleep much of the time (the Nether has no night: it keeps its own
  clock), awake now and then. Sometimes it climbs down the pillar, ambles round its clearing raking the soul soil and
  yawning, then walks back to the pillar and climbs up again.
- It fights when you hit it, or when you walk within 5 blocks of it in Survival or Adventure without sneaking.
  Creative players and sneaking players are left alone. If it is up on its beam it lets go and drops with a thud and
  a burst of soul sand; then it rears up and howls, and its boss bar shows ("Soul Sloth").
- In a fight it walks at you (slowly) and every couple of seconds stops for a move with a wind-up you can see: a claw
  rake (an arm raised high, then raked down: 7, about 3 blocks of knock back), a soul wail (reared up, arms wide, then
  a ring of soul flames bursts out round it: 4, Slowness I for 3 seconds and a push; nothing catches fire) and from
  afar a soul clump lob (soul sand scooped up and lobbed at you: 5 and a puff). Mojang's difficulty scales them: on
  Easy the rake is 4.5 and the wail 3.
- At half its energy it beats the ground and howls: everyone within 12 blocks is slowed (Slowness II, 3 seconds) and
  pushed back, and it is quicker after.
- It is never killed. Only a player's hits wear it down (fire, lava, falls and other mobs don't touch it); at 40 of
  its 400 it curls up tired out, panting, its bar gone, and nothing hurts it. Only now does the Soul Cage work.
- Left alone (nobody within 32 blocks) for a minute it gets up rested, walks back to its arch and climbs up to hang
  again. A fight also ends if you leave its lair.
- The Soul Cage: Soul Tracking research (Research Desk, after 5 ready exhibits: 2 gold blocks, 8 soul sand, a compass,
  300 coins), then 4 iron bars, 2 soul lanterns, 2 soul sand and a Reinforced Crate at the Zoo Workshop (iron bars in
  the corners, soul lanterns top and bottom middle, soul sand at the sides, the crate in the middle). With Soul
  Tracking done, the Field Journal's Places page has "Soul Sloth Lairs" with the way to the nearest wild one.
- In a zoo it is calm, can't be hurt, and is a guest favourite: 400 blocks of floor (20 x 20) for one, 200 more for a
  second, 5 blocks of headroom, soul sand or soul soil under half the floor or more, a beam to hang from (a post of
  solid blocks with 5 solid blocks running out from its top, 5 to 8 blocks over the floor, with air under them), a
  fuelled Thermal Regulator, Fungal Rations. It hangs asleep from its beam most of the time, climbs down to eat at the
  feeder, rakes the soul sand, yawns and sits, then climbs back up. Two sloths take a beam each; one with no beam
  sleeps curled up on the floor.

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a simulated Survival player; a short
calm cycle in one run so it would come round in minutes):
- A lair was made in the soul sand valley at 440 440, 36 blocks from the player, built in under a second: soul soil
  and soul sand 230 blocks of floor (41 soul sand), 38 bone blocks, 13 basalt, 2 soul lanterns, 2 soul torches. The
  sloth hung at y 89.57 under the beam at 92 and stayed there.
- Calm: asleep, awake, down the pillar (2 seconds), on the ground raking and yawning for a while, walked back to the
  pillar, up and over onto the beam, asleep; twice round.
- Creative 3 blocks under it and sneaking 3 blocks under it: it stayed asleep. Walking up not sneaking: it dropped
  from its beam to the floor in 0.6 seconds, howled (2.1 seconds), the bar came on; rakes for 4.5, wails for 3; from
  12 blocks off it lobbed clumps, 4 of 5 hit for 5.
- Worn down from 210: at 194 it beat the ground and howled, the player Slowness II for 3 seconds and pushed back from
  3 to 5 blocks; from 60 to 40, tired out, the bar off, every hit after did nothing; the cage check said no before it
  was tired and yes once it was.
- The player 168 blocks off for 70 seconds: met again it was rested (400), walked home to its arch, climbed up and
  hung asleep again.
- The test zoo (/zoocraft:build, now 220 x 220 for 58 exhibits): the Soul Sloth exhibit measured with 2 beams; each of
  its 2 sloths walked to its own post, climbed it, hung under its beam, slept, woke, climbed down, sat and raked, and
  went back up; 150 seconds, no errors.

New entity, item and texture files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | In Creative, look in the creative menu under Equipment, and for a spawn egg. | The Soul Cage (an iron cage with soul lanterns) and the Wild Soul Sloth Spawn Egg. |
| 2 | Survival, as a member of a park, go to the Nether and into a soul sand valley (`/locate biome minecraft:soulsand_valley`), and walk about a little. | Within a few seconds, 32 to 48 blocks away: a round clearing of soul soil with a bone arch at the back, soul lanterns hanging by it and basalt columns round it. A big grey-brown sloth hanging upside down under the arch's beam. |
| 3 | Watch it from a distance for a few minutes. | It sleeps hanging, wakes now and then; sometimes it climbs down the pillar, ambles and rakes the soul soil, then walks back and climbs up again. |
| 4 | Walk up under it sneaking, right next to it. In Creative too. | It doesn't mind. |
| 5 | Stop sneaking within 5 blocks (or hit it). | It lets go and drops with a thud and a burst of soul sand, rears up and howls; the boss bar "Soul Sloth" shows at the top. |
| 6 | Stay close. | It walks at you; it raises an arm and rakes you (knocked back a few blocks), or rears up with its arms wide and a ring of soul flames bursts out (you are slowed a moment). You can see each coming: step away. |
| 7 | Back off 8 to 20 blocks. | It scoops up soul sand and lobs a clump at you; step aside and it misses. |
| 8 | Hit it with a sword till the bar is half. | It stops, beats the ground and howls; you are slowed and pushed back. It is quicker after. |
| 9 | Lead it into lava or soul fire, or let it fall. | Its bar doesn't move. |
| 10 | Keep hitting it. | At the last tenth it curls up on the ground, panting; the bar goes; hits do nothing. |
| 11 | Use a Soul Cage on it with a Fungal Ration in your inventory (after Soul Tracking research). Before it is tired, try the cage too. | Tired: it goes in (the cage shows it's occupied). Not tired: "A Soul Sloth only goes into its cage once it is tired out...". |
| 12 | Another one: wear it down, then walk 40 blocks off and wait a minute. | It gets up, walks back to its arch and climbs up to hang; its bar is full again when you next fight it. |
| 13 | Field Journal, Places, after Soul Tracking. | "Soul Sloth Lairs" with the way to the nearest wild one. |
| 14 | Build an exhibit (soul soil or soul sand under half the floor; a post with a beam of 5 blocks out from its top, 5 to 8 blocks up; a fuelled Thermal Regulator; a Basic Feeder of Fungal Rations) and release it. `/zoocraft:build` also has one. | It climbs the post and hangs from the beam asleep; it climbs down to eat, rakes, yawns, sits, and goes back up. Guests like it. The Exhibit Clipboard shows "Soul underfoot" and "A beam to hang from". |
| 15 | Open the content log (Settings, Creator) after the steps above. | No lines about `boss` or `sloths`. |
