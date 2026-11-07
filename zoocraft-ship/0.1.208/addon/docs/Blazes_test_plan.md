# Blazes and ghasts: test plan (0.1.208)

The game's blaze and ghast as zoo mobs, caught and kept the zombie's way. They look like the game's own (the same
models and skins: the blaze's spinning rods, the ghast's swaying tentacles) and make the game's sounds. In the zoo they
never shoot fireballs or set you alight, and they never despawn. Fire and lava never hurt them.

A blaze walks about its pen, as the game's does with nobody to fight. A ghast floats: slowly, anywhere in its tall pen,
and floats down to you when you hold up a Meat Ration. Neither breeds in the zoo (the game's never do).

In the wild: blazes in Nether fortresses (1 to 3 at a time, in the dim, and from the fortresses' blaze spawners).
Ghasts float over the Nether wastes, soul sand valleys and basalt deltas, always alone.

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed: keep your eyes
on it for a few seconds). Hit it till it has a quarter of its health or less (a blaze 5 of 20; a ghast 2.5 of 10, so
weak hits only: a fireball hit back kills a ghast), then use a Passivity Serum on it, looking at it up close. Then use
an empty Mob Cage on it, with an Ember Ration in your inventory for a blaze (craft 3 from a raw meat, a blaze powder
and a charcoal) or a Meat Ration for a ghast, and use the cage on the floor inside its pen. Or hold the ration: it
follows you.

What they want (a pen beside a Mob House, glass to the hall):
- Blazes: at least 5 by 5 of floor for the first (10 more blocks for each more); a Nether fortress's floor (nether
  bricks, cracked or chiseled) under half the floor or more; Ember Rations from a Basic Feeder; a Lava Trough to drink
  from (they drink lava, not water). One is happy alone; up to 4 share a pen well.
- Ghasts: the new ghast pen, at least 16 by 16 of floor for the first (96 more blocks for each more) and 12 blocks of
  headroom; the Nether's ground (netherrack, soul sand, soul soil, basalt or blackstone) under half the floor or more;
  Meat Rations from a Basic Feeder; a Water Trough. One is happy alone; up to 4 share a pen well.
- Without their floor comfort can't rise above 55, and the Exhibit Clipboard says why. Blazes and ghasts never share a
  pen.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a blaze or a ghast. On the test server nothing from the add-on in either run (only the bench's own lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk into the two new Mob Houses. | Blazes: nether bricks with a netherrack patch, a Basic Feeder of Ember Rations, a Lava Trough, two blazes. Ghasts: a big, tall pen of netherrack with a soul sand patch, a Basic Feeder of Meat Rations, a Water Trough, one ghast. Each behind glass with a Hanging Food Basket. No warnings on the Exhibit Clipboard. On the test server: both ready, "Mob pen: beside a working Mob House", the blazes' floor 78% nether bricks, the ghasts' floor 100% the Nether's ground and 12 blocks high, no warnings. |
| 3 | Watch them from the hall. **Please check this one: the test server draws nothing and plays no sound.** | Each like the game's own: the blaze's yellow rods spinning round it and its head turning to look, the ghast's white body, eyes shut, and its tentacles swaying. Now and then you hear the blaze's breathing and the ghast's cries. No charged flames on the blaze, and the ghast never opens its eyes and mouth to shoot. |
| 4 | Watch the ghast for a minute. | It floats slowly about its pen, high and low, and never leaves it. On the test server: over 13 readings it floated from the floor to 8 blocks up, always inside its pen; the blazes walked about their floor. |
| 5 | Open their Field Journal pages and keep your eyes on one through the glass for a few seconds. | Spot one, see one calmed. A zoo one counts. On the test server the pages filled from the hall. |
| 6 | Turn breeding on for each pen. | "This species doesn't breed in the zoo yet." On the test server: exactly that, for both. |
| 7 | Without Mob Taming research, use a Passivity Serum on a weak one. | It asks for Mob Taming research first. |
| 8 | Use the serum on each at full health. | A blaze: "It shakes the serum off. Weaken it first (a quarter of its health or less, 5 of 20): blazes shoot fireballs that set you alight, but snowballs hurt them." A ghast: "... (a quarter of its health or less, 2.5 of 10): weak hits only, as a fireball hit back at a ghast kills it." On the test server: exactly those. |
| 9 | Weaken a wild blaze to 5 of 20 (6 is refused) and use the serum. | "The blaze sparkles green and calms down. It never attacks now (it never shoots fireballs or sets you alight)." On the test server: refused at 20 and at 6, calmed at 5. |
| 10 | Use an empty Mob Cage on it before you've watched it, then watch it, then use the cage with no ration, then with a Meat Ration, then with an Ember Ration. | First "You don't know blazes well enough to move one safely yet." Without a ration and with a Meat Ration: "You need an Ember Ration in your inventory to coax it in." With an Ember Ration: "<name> the Blaze hopped into the carrier." On the test server: exactly those ("Pyro the Blaze hopped into the carrier"). |
| 11 | Use the full cage on the floor inside the Blazes pen. | "<name> is now living in Blazes!" On the test server: "Pyro is now living in Blazes!", and it walked about the pen. |
| 12 | Weaken a wild ghast to 2.5 of 10 (3 is refused), calm it, watch it, then use the cage with an Ember Ration, then with a Meat Ration, and put it in the Ghasts pen. | "The ghast sparkles green and calms down. It never attacks now (it never shoots fireballs, and floats down to a Meat Ration held up)." With an Ember Ration: "You need a Meat Ration in your inventory to coax it in." Then "<name> the Ghast hopped into the carrier" and "<name> is now living in Ghasts!" On the test server: refused at 10 and at 3, calmed at 2, "Wailer the Ghast hopped into the carrier", "Wailer is now living in Ghasts!", and it floated about the pen. |
| 13 | Hold a Meat Ration up near a calmed ghast (up to 16 blocks away). | It floats over and down to you, and stops a few blocks off. Put the ration away: it floats off again. On the test server: it was 19 blocks off and 8 up when the ration came out; 20 seconds later it was 5 blocks from the player and 2 up, and it wandered off when the ration was put away. |
| 14 | Try to put a calmed blaze in the Ghasts pen while a ghast lives there. | "Ghasts: Blazes don't share an exhibit with Ghasts. Blazes keep an exhibit of their own." It stays in the cage. On the test server: exactly that, and both pens stayed without warnings. |

Two fixes found on the test server:
- The Mob Cage now asks for every ration by its own name ("You need an Ember Ration", "a Meat Ration", "an Insect
  Ration"). Before, it asked for "a ember ration" in small letters.
- A Mob House pen whose last mob was taken out while the zoo was measuring it lost its pen record, and every mob after
  it was refused ("... isn't right for a Ghast yet. Ghasts live only in a pen beside a Mob House's hall ..."), with the
  pen built right. It keeps its record now. On the test server: a measure started and the ghast taken out in the same
  moment left the pen refusing every ghast before the fix, every time, and with the fix it kept its record and the next
  ghast moved in. Since 0.1.163 this could happen to any Mob House pen (rarely: the timing had to fall just so); using
  the Habitat Marker on the pen's floor again cleared it.
