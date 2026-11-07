# Witches: test plan (0.1.204)

The game's witch as a zoo mob, caught and kept the zombie's way. It looks and sounds like the game's own (the same model,
skin and sounds; its nose twitches, and now and then purple sparkles rise over its hat). In the zoo it never throws or
drinks a potion, never attacks and never despawns.

In the wild: anywhere dark in the Overworld (block light 0), one at a time, but not in mushroom fields, the deep dark,
rivers, frozen rivers or snowy plains. One lives in each swamp hut (with a black cat) and more come to it; witches come
with raids from the fourth wave; and a villager that lightning strikes turns into one. They throw splash potions
(harming, poison, slowness, weakness) and drink potions to heal, to breathe under water, against fire and to run.

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed). Weaken it to a
quarter of its health or less (6.5 of 26) and use a Passivity Serum on it straight away, looking at it up close: a hurt
witch drinks a Potion of Healing. It sparkles green and calms down. Then, with a Grain Ration in your inventory, use an
empty Mob Cage on the calmed one, and use the cage on the floor inside its pen.

What they want (a pen beside a Mob House): a swamp hut's floor or swamp ground (spruce planks, mud, muddy mangrove roots
or clay) under half the floor or more, and a cauldron in the pen (on the floor or set in a wall, as in a swamp hut).
Grain Rations from a Basic Feeder. No dark needed: a witch never burns in the sun. Without the floor or the cauldron
comfort can't rise above 55, and the Exhibit Clipboard says what's missing. They are never bred: catch more. The phantom
comes in the next version.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a witch. On the test server nothing from the add-on in any run (only the bench's own lines and the add-on's loading lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the new Witches pen beside its Mob House. | Spruce planks with a mud patch behind glass, a cauldron against the back wall, a Basic Feeder of Grain Rations, a Hanging Food Basket and a Water Trough. Two witches. No warnings on the Exhibit Clipboard: the pen beside a working Mob House, the floor "97%", "Cauldrons: 1 in the pen". On the test server: ready with exactly those lines and no warnings, both at 26 of 26 health, holding nothing. |
| 3 | Watch them. **Please check this one: the test server draws nothing and plays no sound.** | Each like the game's own witch: the purple robe, the hat, the long nose twitching. Now and then (about once a minute) purple sparkles rise over a witch's hat. They cackle now and then. They never throw or drink a potion. |
| 4 | Watch them for a minute or two. | They wander the pen (one may step up on the cauldron's rim) and stay in. On the test server both stayed in the pen at full health for over 2 minutes. |
| 5 | Open their Field Journal page and watch them. | Spot one, see one calmed. A zoo one counts. On the test server the page filled from watching a zoo one, and from a wild one calmed in runs B and C. |
| 6 | Break the planks and mud under the witches' floor and put dirt there; measure the pen (use the Exhibit Clipboard). | The floor warning: "Witches want a swamp hut's floor or swamp ground (spruce planks, mud, muddy mangrove roots or clay) under 50% of their floor or more (0% now)". Put it back: gone. On the test server: exactly that, and gone once put back. |
| 7 | Take the cauldron out; measure the pen. | "Witches want 1 or more cauldrons in their pen (0 now): on the floor or set in a wall, as in a swamp hut." Put it back: gone. On the test server: exactly that, and gone once put back. |
| 8 | Turn breeding on for the pen. | "This species doesn't breed in the zoo yet." On the test server: exactly that. |
| 9 | Without Mob Taming research, use a Passivity Serum on a weak witch. | It asks for Mob Taming research first. |
| 10 | Find a witch at night (a swamp hut is a sure place), spot it, and use the serum on it at full health. | "It shakes the serum off. Weaken it first (a quarter of its health or less), and be quick: a hurt witch drinks a Potion of Healing." On the test server: exactly that. |
| 11 | Weaken it to a quarter of its health (6.5 of 26 or less), wait a few seconds, then use the serum. | It drinks a Potion of Healing and is too strong again: the serum is shaken off. On the test server: weakened to 6, it was at 10 three seconds later, and the serum was shaken off. |
| 12 | Weaken it again and use the serum straight away. | "The witch sparkles green and calms down. It never attacks now (it never throws or drinks a potion)." It stays as weak as it was (it never drinks now). On the test server: calmed at 6 of 26, and still 6 of 26 ten seconds later. |
| 13 | Calm one where you can't see it, then use an empty Mob Cage on it at once. | The journal asks you to see one calmed first. On the test server: "You don't know witches well enough to move one safely yet." |
| 14 | Look at the calmed one, then use the cage with no Grain Ration in your inventory, then with one. | Without: "You need a grain ration in your inventory to coax it in." With: "<name> the Witch hopped into the carrier." On the test server: exactly those. |
| 15 | Use the full cage on the floor inside the Witches pen. | "<name> is now living in Witches!" On the test server: "Agatha is now living in Witches!" and "Grizelda is now living in Witches!". |
| 16 | Hold a Grain Ration near a calmed witch. | It follows you. On the test server it walked 8 blocks after the Bench in 10 seconds. |

Wild witches far from any player despawn (the game's); a swamp hut's own witch never does. A zoo one let go comes out
calmed.
