# Undead mounts: test plan (0.1.198)

The game's skeleton horse, zombie horse and camel husk as zoo animals in the Mob House. Each looks, sounds and moves
like the game's own grown one (the same model, skin, animations and sounds), with no saddle, armor or rider. In the zoo
they are never ridden, saddled, led or hurt, never burn in the sun and never despawn. A skeleton horse sinks in water and
walks along the bottom (it breathes there), as in the game; a zombie horse and a camel husk float. (On the test server, in a
basin of water 4 deep, a skeleton horse lay on the bottom for 15 seconds at full health while the other two floated.) A camel husk kneels down
to rest now and then, as a zoo camel does.

In the wild they are monsters' mounts. Skeleton horses come only with a skeleton trap (in a thunderstorm, a skeleton horse
that turns into four skeleton horsemen when you come near). Zombie horses come with zombie horsemen at night on plains,
snowy plains and savannas, camel husks with camel husk jockeys (a husk in front, a parched with a bow behind) at night in
deserts. Alone each one is calm: it never attacks.

How to catch them (Mob Taming research): no Passivity Serum (used on one, the serum says it's calm on its own). Defeat its
rider first: a Mob Cage won't take one while a monster rides it. Then, with the bait in your inventory, use an empty Mob
Cage on it: a Bone Ration for a skeleton horse, a red mushroom or a Fungal Ration for a zombie horse, a rabbit's foot or a
Meat Ration for a camel husk. If the mount lets you climb on instead, you are set down and it is caught. A camel husk's
saddle comes back to you. A zombie horse someone tamed is theirs: the cage refuses it. Fill in the Field Journal first, as
for every animal: spot one, watch one walk about with no rider on its back (a camel husk: and watch one kneel).

What they want (a stable, a Mob House pen): 120 blocks of floor for the first and 40 more for each after, 4 blocks of
headroom, shut in all round with a roof, beside a Mob House's hall and walled off from it with glass or iron bars.
Skeleton horses and zombie horses share a stable; camel husks keep their own.

- Skeleton horses: a crypt floor (bone blocks, cobblestone, mossy cobblestone, cobbled deepslate or gravel) under 30% of the
  floor or more. Bone Rations.
- Zombie horses: graveyard earth (dirt, coarse dirt, podzol, rooted dirt or mud) under half the floor or more, and the dark
  (no daylight, nothing brighter than light 7: Nocturnal Lamps). Red mushrooms or Fungal Rations.
- Camel husks: desert ground (sand, red sand or sandstone of any cut) under half the floor or more. Meat Rations.

Without its floor a mount's comfort can't rise above 55, and the Exhibit Clipboard says what's missing. They are never
bred: in the game no undead mount has foals. Catch more.

New animals: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a zoo skeleton horse, zombie horse or camel husk. On the test server nothing from the add-on's own animals in any run (the only lines were the server's own test probes). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the three stables beside their Mob Houses. | Skeleton Horses on cobblestone with a patch of bone blocks behind iron bars, Zombie Horses on coarse dirt with a patch of podzol behind tinted glass under two red Nocturnal Lamps, Camel Husks on sand with a patch of cut sandstone behind glass; a feeder, a Hanging Food Basket and a Water Trough in each, two in each stable. No warnings on the Exhibit Clipboard: the pen beside a working Mob House, the floor "99%" of what they like, and for the zombie horses "Dark: yes". On the test server: all three ready, 175 blocks of floor each (160 is enough for two), those lines, no warnings. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Each like the game's own grown one, with no saddle, armor or bags. The horses walk with their legs moving and turn their heads to look at you; a camel husk kneels down and stands up with the game's sounds. |
| 4 | Watch them for a minute. | They wander about their stable. A camel husk kneels down to rest now and then and gets up again. On the test server the horses walked 9 to 19 of 30 seconds (up to 10 seconds at a time); in 150 seconds one camel husk knelt 3 times (46 seconds in all), the other once. |
| 5 | Open the Field Journal's pages for the three and watch them. | Spot one, watch one walk about with no rider on its back; for a camel husk also watch one kneel. On the test server: the riderless walk 2 seconds after spotting one for a skeleton horse, 16 seconds for a camel husk; the kneel 2 seconds after spotting one. |
| 6 | Break the floor of each stable and put stone down instead, then measure each with the Habitat Marker. | A warning in each that they want their floor (a crypt floor, graveyard earth, desert ground) under 30% or 50% of it (0% now), the Clipboard's floor line in red, comfort falling toward 55. Put their floor back and measure again: the warning goes. On the test server: the three warnings, comfort 78 then 77 (on its way to 55); with the floors back the warnings went. |
| 7 | Swap the zombie horses' two Nocturnal Lamps for glowstone and measure again. | A warning that zombie horses like the dark (light 7 or less), the line "Dark: no: too bright", their comfort held to 50 or below. The lamps back: the warning goes. On the test server: too bright on 48 blocks, the brightest 11; back to Nocturnal Lamps, "Dark: yes" and no warning. |
| 8 | Turn breeding on in each stable. | A message that they can't be bred: in the game no undead mount has foals. Catch more. On the test server: that message for all three. |
| 9 | At night on plains find a zombie horseman (or in a desert a camel husk jockey; or in a thunderstorm a skeleton trap's horsemen). With Mob Taming researched and the bait in your inventory, use an empty Mob Cage on the mount while its rider is on it. | Refused: "This Zombie Horse has a zombie riding it: its rider has to go first. Defeat it, then use the Mob Cage on the zombie horse." (a camel husk: "a husk and a parched"). On the test server: that message for all three, nothing caught. |
| 10 | Use a Passivity Serum on the mount. | "A zombie horse is calm on its own: with no monster on its back it never attacks, so the serum isn't needed..." and the serum stays in your hand. On the test server: that message for all three. |
| 11 | Defeat the rider, then use the Mob Cage again, first without the bait, then with it. | Without: "You need a red mushroom or a Fungal Ration in your inventory to coax it in." With: it hops into the cage, and from the cage into its stable. On the test server: both, for all three; each living in its stable after. |
| 12 | Put a saddle on a camel husk, then catch it. | "...hopped into the carrier. You kept its saddle." and the saddle is in your inventory. On the test server: that message and the saddle back. |
| 13 | Climb on a skeleton horse or a camel husk (they let you on with no saddle) with an empty Mob Cage in your hand. | You are set down and it is caught. On the test server: set down and caught, both. |
| 14 | Tame a zombie horse (ride it till it stops bucking), then use a Mob Cage on it. | Refused: "This Zombie Horse is tamed: it's someone's pet, not a zoo animal. Leave it with them." On the test server: that message. |

Wild ones far from any player despawn (the game's): look for them near you. A zoo one let go is the game's own grown one (a
skeleton horse tame and lightning-proof as the trap's, a zombie horse wild).
