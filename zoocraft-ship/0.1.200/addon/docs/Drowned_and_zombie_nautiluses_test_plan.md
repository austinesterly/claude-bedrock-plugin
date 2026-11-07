# Drowned and zombie nautiluses: test plan (0.1.200)

The game's drowned and zombie nautilus as zoo mobs in the Mob House's first water pen. Each looks, sounds and moves like
the game's own grown one (the same model, skin, animations and sounds). In the zoo they never attack, never burn in the
sun and never despawn. A drowned walks along the bottom of its water as the game's does by day, and a zombie nautilus
swims about it. A zombie nautilus keeps its look from the wild (plain, or the warm ocean's coral kind with coral on its
shell) through the Mob Cage into the zoo.

In the wild: drowned spawn in water in the dark (block light 0): in oceans in groups of 2 to 4, in rivers one at a time and
in dripstone caves, and a zombie that stays under water too long becomes one. A zombie nautilus comes only with a drowned
riding it: half the grown drowned holding a trident ride one (outside rivers), and in warm shallow oceans it is the coral
kind.

How to catch them (Mob Taming research):

- A drowned, the zombie's way: fill in the Field Journal first (spot one, then see one calmed). Weaken one to a quarter
  of its health or less (5 of 20), look at it up close and use a Passivity Serum: it sparkles green and calms down. Babies
  are refused. Then, with a Meat Ration in your inventory, use an empty Mob Cage on the calmed one.
- A zombie nautilus, the undead mounts' way (as a skeleton horse): no serum, it is calm alone. Fill in its Field Journal
  page (spot one, then watch one swim about with no rider on its back). One with a drowned on it can't be caught: calm the
  drowned and it comes off. Then, with a pufferfish or a Fish Ration in your inventory, use an empty Mob Cage on it. One a
  player tamed with pufferfish is theirs and can't be caught.

Use the cage on the bank inside the pen, beside the water: the mob goes into the water.

What they want (a water pen beside a Mob House hall: a tank shut in all round with a roof, walled off from the hall with
glass, at least 25 blocks of water for the first and 10 more each, all of them 2 deep or more, and a bank beside the water
inside to use the Habitat Marker on, 2 blocks of headroom over it):

- Drowned: the sea floor (sand, gravel or clay) under half the pen or more (the bottom of the water and the bank), and the
  dark (no daylight, nothing brighter than light 7: Nocturnal Lamps). Meat Rations in a feeder on the bank.
- Zombie nautiluses: the dark. Fish Rations in an Aquarium Feeder over the water.
- They share a pen (the Sunken Crypt).

Without its floor a drowned's comfort can't rise above 55 (without the dark: 50), and the Exhibit Clipboard says what's
missing. They are never bred (the drowned as the zombie; no undead mount has young in the game): catch more.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a drowned or a zombie nautilus. On the test server nothing from the add-on in either run (only the bench's own lines and the add-on's loading lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the two new pens beside their Mob Houses. | Drowned and Zombie Nautiluses: each a tank of water 3 deep over sand with a patch of gravel, behind tinted glass under a red Nocturnal Lamp, a sand bank along the glass with a Water Filter; a Basic Feeder of Meat Rations on the drowned's bank, an Aquarium Feeder of Fish Rations over the zombie nautiluses' water, a Hanging Food Basket in each, two in each pen. No warnings on the Exhibit Clipboard: the pen beside a working Mob House, "Dark: yes", and for the drowned the floor "98%" or more of the sea floor. On the test server: both ready, 66 blocks of water, all of them 2 deep or more, the bank's 10 and 12 blocks, the pen beside a working Mob House, "Dark: yes", the drowned's floor 99%, no warnings. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | A drowned like the game's own (the green-blue skin, glowing eyes). The two zombie nautiluses different: one plain, one with coral growing on its shell. They make the game's drowned and zombie nautilus sounds (the drowned's gurgle changes under water). Bubbles rise from the zombie nautiluses. |
| 4 | Watch them for a minute. | The drowned walk slowly along the bottom of the water with their arms out. The zombie nautiluses swim about it. On the test server the drowned walked 7 and 13 of 30 seconds, all of it on the bottom; the zombie nautiluses swam 29 and 29 of 30, low over the bottom. |
| 5 | Open their Field Journal pages and watch them. | Drowned: spot one, see one calmed. Zombie nautilus: spot one, watch one swim about with no rider. A zoo one counts. On the test server all four steps came from watching zoo ones, and again from wild ones in run B. |
| 6 | Break the sand and gravel under the drowned's water and put stone down instead, then measure with the Habitat Marker. | A warning that drowned want the sea floor under 50% of their pen, the Clipboard's floor line in red, comfort falling toward 55. Put the sand back and measure again: the warning goes. On the test server: the warning (12% now: the sand of the bank alone), the floor line "12%", comfort falling from 73 to 71; with the sand back, 99% and no warning. |
| 7 | Swap the drowned's Nocturnal Lamp for glowstone and measure again. | A warning that drowned like the dark, the line "Dark: no: too bright", their comfort held to 50 or below. The lamp back: the warning goes. On the test server: too bright on 27 blocks, the brightest 11; back to the Nocturnal Lamp, "Dark: yes" and no warning. |
| 8 | Turn breeding on in each pen. | "This species doesn't breed in the zoo yet." for the drowned; for the zombie nautiluses that no undead mount has young (skeleton horses, zombie horses, camel husks and zombie nautiluses alike). On the test server: both messages. |
| 9 | At night in an ocean find a drowned. With Mob Taming researched, use a Passivity Serum on a baby, then on a grown one at full health. | "Leave the young ones be: the serum is too strong for a baby." Then "It shakes the serum off. Weaken it first (a quarter of its health or less)." and you keep the serum. On the test server: both messages, the serum kept each time. |
| 10 | Hit a grown one down to 5 health or less, then use the serum. | "The drowned sparkles green and calms down..." It stays calm in the water. On the test server: calmed at 4 health, in the water. |
| 11 | Use an empty Mob Cage on the calmed drowned before its Field Journal page says you saw one calmed, then with no Meat Ration, then with one. | "You don't know drowned well enough to move one safely yet...". Look at it a few seconds and the page fills in. Without the ration: "You need a meat ration in your inventory to coax it in." With it: "...hopped into the carrier." Use the cage on the bank in the Drowned pen: "...is now living in Drowned!" On the test server: each message in that order, then it lived in the Drowned pen. |
| 12 | Find a drowned riding a zombie nautilus. Use a Mob Cage on the zombie nautilus. | Refused: "This Zombie Nautilus has a drowned riding it: its rider has to go first. Defeat it, then use the Mob Cage on the zombie nautilus." A Passivity Serum on the zombie nautilus: it is calm alone (the serum isn't used). On the test server: a drowned spawned by the game's own way of making a jockey rode a coral zombie nautilus in the warm ocean; the cage was refused with that message, and the serum gave "A zombie nautilus is calm on its own: with no monster on its back it never attacks, so the serum isn't needed..." and stayed in hand. |
| 13 | Weaken the drowned on it and use the serum. | It calms down and comes off. Watch the zombie nautilus swim about a few seconds and its journal page fills in. On the test server: the drowned calmed, came off, and the zombie nautilus's page filled in. |
| 14 | Use the cage on the zombie nautilus with no bait, then with a pufferfish. | Without: "You need a pufferfish or a Fish Ration in your inventory to coax it in." With: caught. A coral one stays coral. Use the cage on the bank in the Drowned pen: it lives there with the drowned (the Sunken Crypt). On the test server: that message, then caught with a pufferfish, coral in the zoo (its look kept), living with a drowned in the Drowned pen. The jockey's calmed drowned went into the Zombie Nautiluses' pen the same way, and a plain one caught with a Fish Ration stayed plain there. |
| 15 | Tame a zombie nautilus with pufferfish (or find one someone tamed) and use a Mob Cage on it. | Refused: it's someone's pet. On the test server: "This Zombie Nautilus is tamed: it's someone's pet, not a zoo animal. Leave it with them." |

Wild drowned far from any player despawn (the game's): look for them near you. A zoo one let go is the game's own grown
one.
