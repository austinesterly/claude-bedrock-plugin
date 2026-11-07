# Bats and allays: test plan (0.1.194)

The game's bat and allay as zoo animals. They look, sound and fly like the game's own (the same models, skins and
animations); a bat pup is a small bat.

Bats hang upside down from the roof of their house, as the game's do from a cave ceiling, and fly off when someone who
isn't sneaking comes within 4 blocks. Sneak to watch one hang. In a dark house they're out at any hour, flying a while and
hanging a while; in a bright one they hang all day and fly only at night.

Allays dance to a jukebox that's playing within 10 blocks, as parrots do. Give a dancing one an amethyst shard and it
splits in two, as in the game; both rest 5 minutes before they can again. That's the only way they have young: no sexes,
no babies, no Breeding switch. Give one an item and it holds it, and picks up more of the same it finds dropped in the
room (the game's allay brings them to you; the zoo's keep them). Use it with an empty hand to take them back.

How to catch them (a Small Carrier):
- Bats: caves and dark places underground, in colonies. Fill in the Field Journal first: spot one, watch one hanging from
  a ceiling (sneak up: it flies off from someone who isn't sneaking), watch one with its colony. Then, with a Fruit Ration,
  sweet or glow berries or an Insect Ration in your inventory, use an empty Small Carrier on one.
- Allays: 1 to 3 in the dark oak cages by pillager outposts and in the cells of woodland mansions. With a Fruit Ration or
  sweet or glow berries in your inventory, use an empty Small Carrier on one. The first try says to take back any item it
  holds (the zoo can't see its hand, so the crate would lose it); use the carrier on it again and it goes in.

What they want:
- Bats (a Bat House): 40 blocks of floor for the first 3 and 4 more for each after, 4 blocks of air above the floor, a roof
  of solid blocks (stone, planks, logs: not glass, leaves or slabs) with a block of it over open air for each bat to hang
  from, and a straight 10 blocks of open air to fly along. A dark house: no daylight on the floor and nothing brighter
  than the Nocturnal Lamps (solid walls and roof, tinted glass to look in). A colony: 3 at least, up to 12. Food: Fruit
  Rations (or berries) or Insect Rations in a feeder, a Hanging Food Basket of them, a Water Trough.
- Allays (an Allay Room): 25 blocks of floor for the first 2 and 6 more for each after, 4 high, roofed. A jukebox to dance
  to, a note block (enrichment). Alone or up to 8. Food: Fruit Rations or berries (the game's allays eat nothing: this is
  the zoo's choice), a Hanging Food Basket, a Water Trough.

Breeding: bats one pup at a time, grown in 6 park days. Allays don't breed (an amethyst shard splits one).

Not like the game's: the zoo's allays can't hear a note block play (the game keeps that to its own allay), so they don't
keep near one; and they keep what they pick up rather than bringing it to you.

New animals: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_bat or zoo_allay. On the test server the first try at the allay said "Vibration listener is only supported on the Warden and Allay for now"; the zoo's allay goes without it now, and the log was clean. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Bat House and the Allay Room. | A stone Bat House 10 by 5 with a tinted glass front, lit by two Nocturnal Lamps, three bats; an Allay Room of glass 6 by 6 with a note block and a jukebox, two allays glowing blue. The Exhibit Clipboards have no warnings. On the test server: the Bat House 46 blocks of floor, 50 roosts, a 10-block flight, a dark house (no daylight, the brightest light 6); the Allay Room 32 blocks, one note block. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Bats like the game's, flapping as they fly; hanging ones upside down with their wings folded. Allays like the game's, dancing when the jukebox plays. |
| 4 | Watch the bats from outside the house for a minute or two. | They fly about, then fly up under the roof and hang there, turning now and then, and fly off again after a while. On the test server (its bouts shortened) each flew up to a free spot and hung with its top against the roof (0.9 below it, the game's own wild bats hang at the same height), then flew off. |
| 5 | Walk in under a hanging one. Then sneak in under another. | Walking, it flies off when you're within 4 blocks. Sneaking, it stays. On the test server: both. |
| 6 | Sneak up and look at a hanging bat for a few seconds; look at two together. | The Field Journal ticks "watch one hanging upside down from a ceiling" and "watch one with its colony". On the test server: both, from the zoo's bats. |
| 7 | Put the jukebox's disc in (or any disc) and watch the allays. | They dance. Stop the disc and they stop. On the test server: both, and the journal ticked "watch them dance". |
| 8 | While one dances, use an amethyst shard on it. | It splits in two with a chime: a new allay beside it, and a message. The Clipboard's page for each says "Splitting in two: resting" with the time left; after 5 minutes they can again. On the test server: Chime split, Pixie was new (Chime its parent), both rested 5:00 counting down. |
| 9 | Give an allay a diamond. Then try a Small Carrier on it. Then use it with an empty hand, and try the carrier again. | It holds the diamond (the journal ticks "watch one carry an item"). The carrier is refused: "... holds an item someone gave it: take it back first". With an empty hand you get the diamond back; then the carrier takes it. On the test server: all four. |
| 10 | Give an allay a diamond and drop another diamond across the room. | It picks the dropped one up and keeps it (use it with an empty hand to take them back). On the test server the zoo's allay picked it up and kept it; the game's own allay, given a diamond, brought a dropped one back to the player. |
| 11 | **Please check this one: the test server's player can't try it.** In Survival, use a Small Carrier (or any crate) on an allay holding nothing. | The carrier picks it up and the allay doesn't take the carrier as an item to hold. (The crate cancels the use first; on the test server the bench's player can't fire that, so its allay took the carrier as an item.) |
| 12 | Catch a wild bat in a cave with a Fruit Ration (after the journal's three) and put it in the Bat House. | Before the journal's three the carrier says you don't know bats well enough yet. After them it goes in and hangs with the others. On the test server: refused first, then caught with a Fruit Ration and living in the Bat House. |
| 13 | Catch a wild allay (break into a pillager outpost's cage) with sweet berries. | The first try asks to take back any item it holds; the next catches it. On the test server: the warning, then the catch, and it lived in the Allay Room. |
| 14 | Turn breeding on in the Bat House (a male and a female, room for one more) and run `/zoocraft:skip 600` a dozen times. | A message that two are expecting a pup, then a pup: a small bat (0.6 of a grown one). On the test server: expecting after 2 good park days, the pup Belfry 4 days later, at 0.6. |
| 15 | Make the Bat House bright (break a roof block so daylight comes in, or swap the tinted glass for plain glass) and measure again. | A warning that bats live in the dark; they hang all day and fly only at night, and comfort stays at 55 or below. Take out roof blocks over open air until there are fewer than one for each bat: a warning about somewhere to hang. |
| 16 | Open the Field Journal's pages. | Bat: spot one, watch one hanging, watch one with its colony. Allay: spot one, watch them dance (a zoo one), watch one carry an item (a zoo one). |
