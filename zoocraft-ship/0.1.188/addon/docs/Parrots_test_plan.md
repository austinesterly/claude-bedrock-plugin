# Parrots: test plan (0.1.188)

The game's parrot as a zoo animal. It looks and sounds like the game's own (the same model, its five colours: red, blue,
green, cyan and grey, its wing beat and its calls), and it lives the game's way: it flies about the aviary and lands on
its Perches, the logs and the floor, dances when a jukebox near it plays a disc, and now and then makes the sound of a
monster near it (the Mob House's too), as the game's parrots do, and once in a while one that isn't there. It can't be
hurt, it never sits on a player's shoulder, and it won't take a cookie. A pair lays one or two eggs in a Nest Box: the
chick is a small grown one.

How to catch one: find wild parrots in a jungle. Have seeds (wheat, beetroot, melon or pumpkin) in your inventory and
use an empty Small Carrier on one.

What they want (a parrot aviary):
- Room: 25 blocks of floor for a pair and 8 more for each more, with a roof over it 4 blocks up or higher (glass lets
  the guests see in): a zoo parrot can't fly free.
- Perches: 2 or more (on the floor, a log, a wall top or a ledge, open air above each). They fly from one to another
  and rest on each a while.
- Food: seeds or Fruit Rations in a feeder, and a Hanging Food Basket to forage from.
- Music: a jukebox in the aviary. While it plays, every parrot within 3 blocks of it dances (enrichment that park day
  and the next). They stop when the track ends.
- Company: a flock, so keep at least 2 together.
- Breeding: a Nest Box in the aviary.

A new animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_parrot. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Parrot Aviary. | An aviary 7 by 7 of grass under a glass roof 4 blocks up, behind glass walls: three Perches at three heights (one on the floor, two on logs), a jukebox, a Nest Box, a Basic Feeder, a Puzzle Feeder, a Hanging Food Basket, a Water Trough, three parrots (red, blue, green). The Exhibit Clipboard says "Jukebox: 1 (play a disc: they dance to it, and it's enrichment)" and has no warnings. |
| 3 | Watch them for a few minutes. | They fly about, beating their wings, and land on the Perches, the logs, the jukebox and the floor, then fly off again. On the test server they were in the air about half the time and on a Perch, a log or the jukebox about one look in seven. |
| 4 | Put a music disc in the jukebox. | The parrots near it (within 3 blocks: in this aviary, all of them) dance, bobbing their heads as the game's do, while the disc plays. The clipboard says "Jukebox: 1 playing: they dance within 3 blocks of it". The Field Journal ticks off "watch them dance to a jukebox". |
| 5 | Take the disc out (or let the track end). | They stop dancing and fly about again. |
| 6 | `/summon zombie` just outside the glass, and wait a minute or two. | Now and then one makes a zombie's groan, higher than a zombie's (the game's own imitation). The Field Journal ticks off "hear one imitate a monster". Without a monster near, once in a while one makes the sound of one that isn't there (not on Peaceful). |
| 7 | Break the Perches one by one and measure with the Habitat Marker until one is left. | A warning that parrots need 2 or more Perches to sit on. Place them back and measure again: it goes. |
| 8 | Turn breeding on with the Exhibit Clipboard, and run `/zoocraft:skip 600` three or four times. | A message that a pair has laid eggs in the Nest Box, then that they've hatched: one or two small parrots, with the grown one's look, flying with them. |
| 9 | `/zoocraft:skip 600` a few more times. | A message that the chicks are grown, and they're full size. |
| 10 | In Survival, hit a zoo parrot, then hold a cookie and use it on one. | Nothing: it can't be hurt, and it won't take the cookie (it doesn't die of it, as the game's do). It doesn't sit on your shoulder. |
| 11 | In Survival, find wild parrots in a jungle, and with seeds in your inventory use an empty Small Carrier on one. Use the carrier on the floor of the Parrot Aviary. | It goes into the carrier and comes out a zoo parrot of the same colour in the aviary. |
| 12 | Let a zoo parrot go back to the wild (Conservation, far from the park). | It comes out as the game's own parrot (the game picks its colour). |
| 13 | Open the Field Journal's Parrot page after spotting one. | Its care notes: Flight, Food (never a cookie), Music, They imitate, Breeding with a Nest Box, and Catching with seeds. Tasks: spot one, watch one dance to music, hear one imitate a monster. |
