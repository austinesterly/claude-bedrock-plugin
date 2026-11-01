# Wolves and foxes: test plan (0.1.169)

Module 12, the vanilla catalogue: its second part. Austin: "then lets go to the next module". The design is in
research/vanilla_plan.md ("0.1.169 wolves and foxes: the design"). Pandas and polar bears come next (0.1.170).

What it does:
- Two new zoo animals, the game's own wolf and fox: zoo copies with exactly the game's look, babies included, and their
  own sounds (barks, panting and whines; a fox's yips, its snores while it naps, its screech at night). You catch the
  wild ones as any animal: spot them in the Field Journal and do their watching tasks till the journal says "Ready to
  move". Wolves: spot, watch one with its pack (another wolf close by), watch one sniffing. Foxes: spot, find one
  napping (curled up asleep, by day under trees or a roof), watch one sniffing. A baby can't be moved.
- Bait: any of their foods in your inventory. A wolf (Livestock Crate): raw beef, porkchop, mutton, chicken or rabbit, or
  a Meat Ration. A fox (Small Carrier): sweet berries, glow berries or a Fruit Ration. A wild fox runs from anyone who
  isn't sneaking: sneak up to it. A tamed wolf is someone's pet and can't be put in a crate.
- A caught wolf keeps its coat (all nine: pale, ashen, black, chestnut, rusty, snowy, spotted, striped, woods), a fox
  its red or arctic coat. Pups and kits take after a parent.
- Wolves: a pack, 3 or more together (up to 8). Room: 120 blocks of floor for the first and 24 for each more, 3 blocks of
  headroom. A den: tree leaves or a roof over at least 10% of the ground. Scent Posts on the floor: now and then one trots
  over to a post and noses it a few seconds; posts spread round the run make a scent trail (scent enrichment). They beg as
  the game's wolves do, head tilted at someone holding meat or a bone. Zoo wolves never attack anything, and never anger.
- Foxes: alone or a pair (up to 5). Room: 36 blocks of floor and 12 for each more. Cover over at least 20% of the ground:
  by day they nap there on the ground, as the game's foxes do, and are about at night. Someone walking up without
  sneaking wakes one; keepers, guests and the zoo's own animals don't. Burrow Soil to dig in: 2 or more blocks in the
  floor or beside it (dig enrichment). A Puzzle Feeder holding fruit is something to work at for their food.
- Food: Meat Rations or raw meat (beef, porkchop, mutton, chicken, rabbit) for wolves; Fruit Rations, sweet berries or
  glow berries for foxes, in a Basic Feeder, a Puzzle Feeder or a Hanging Food Basket. Water from a Water Trough.
- Wolves and foxes keep to themselves: neither shares an exhibit with any other animal (nor with each other).
- Breeding: pups (2 to 4), kits (2 or 3), grown in a few park days.
- The zoo's other copies of the game's animals (the rabbit and the farmyard four) now make their own sounds too.
- `/zoocraft:build`'s test zoo has a Wolves run and a Foxes den (72 exhibits). Wolves: 15 by 15, walls 3 high, an oak
  plank den roof over a back corner, three Scent Posts, a Basic Feeder of Meat Rations with a basket over it, a Water
  Trough. Foxes: 9 by 9, a roof over a back corner, 4 blocks of Burrow Soil in the floor, a Puzzle Feeder of Fruit
  Rations, a Water Trough.

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a simulated player; a flat world at noon
with the test zoo built with only its Wolves run and Foxes den; runs fb169a to fb169c):
- Both measured ready, no issues: Wolves 221 blocks of floor, 36 under the den roof ("Animals: 4 · needs 192 usable
  blocks, has 221"); Foxes 81, 20 under cover, 4 Burrow Soil giving them dig enrichment.
- The first run found two things, both fixed. Zoo foxes hardly napped (asleep 13 and 35 of 240 samples over 4 minutes,
  a wild fox in a closed hut nearby 240 of 240): the zoo's usual wandering and looking about came before the nap. They
  now keep the game's own order for the fox, and slept 480 of 480 and 369 of 480. And zoo wolves stood at their Scent
  Posts nearly all the time (66 to 100%); now a wolf rests for 30 to 90 seconds, then goes to a post and noses it for 5
  seconds: by a post 32 to 46% of 4 minutes, every wolf visiting all three posts, about one visit a minute and a half.
- Catching: a chestnut wild wolf with a Livestock Crate and no meat: "You need some raw meat (beef, pork, mutton,
  chicken or rabbit) or a Meat Ration in your inventory to coax it in."; with 3 porkchops it went in (2 left), and out
  in Wolves it was a chestnut zoo wolf. A tamed wolf: "This Wolf is tamed: it's someone's pet, not a zoo animal. Leave
  it with them." and it stayed out. A wild fox with a Small Carrier, sneaking, sweet berries: in (one used); another
  with glow berries: in.
- Feeders: raw beef in the wolves' Basic Feeder, "Added 8 rations. Feeder: 8/32.", and they ate from it; sweet berries
  in the foxes' Puzzle Feeder, "Added 8 rations. Puzzle Feeder: 8/32.", and they ate from it.
- Hitting a zoo wolf did nothing to it, and the player stood in the wolf run and the fox den for 20 seconds each without
  a scratch.
- A survival player in the fox den, sneaking, 3 blocks from a napping fox: it slept on (20 seconds). The same player not
  sneaking: it woke at once and stayed up (30 seconds). (A creative player didn't wake them: the game's foxes ignore
  creative players.)
- No content log lines about the wolves, foxes, sounds or their scripts.
- Not seen on the server (it draws and plays nothing): the looks, the coats, the begging head tilt, the sounds. Those
  are in the steps below.

New entity files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Find wild wolves (taigas, forests) and a wild fox (taigas, groves). Look at each with the Field Journal; do the watching tasks it lists. For the fox's nap, find one asleep under the trees by day (sneak up so it stays asleep). | Each has a journal page; the tasks tick off; "Ready to move" at the end. |
| 2 | Hold a Livestock Crate and use it on a grown wild wolf with no meat in your inventory. Then with a raw porkchop (or any raw meat). | "You need some raw meat (beef, pork, mutton, chicken or rabbit) or a Meat Ration in your inventory to coax it in." Then it goes in (one piece of meat is used). |
| 3 | Tame a wolf with bones, then use a Livestock Crate on it. | "This Wolf is tamed: it's someone's pet, not a zoo animal. Leave it with them." It stays out. |
| 4 | Sneak up to a wild fox with a Small Carrier and sweet berries (or glow berries) in your inventory, and use the carrier on it. | It goes in (one berry is used). |
| 5 | Build a wolf run: 15 by 15 or so, walls, an oak plank roof (or leaves) over a corner, 3 Scent Posts spread round, a Basic Feeder of raw beef or Meat Rations, a Water Trough. Use the Habitat Marker inside. Let 3 or more wolves out in it. | The Exhibit Clipboard: ready, the ground line counts the floor under cover. Each wolf looks just as it did in the wild (try a chestnut or a black one). |
| 6 | Watch the wolves for a few minutes. Then hold a raw porkchop or a bone near one. | Now and then (about once a minute or two each) one trots to a Scent Post and noses it a few seconds. It tilts its head at you, begging. None attacks you, even if you hit one. |
| 7 | Build a fox den: 9 by 9 or so, a roof over a corner, 2 or more Burrow Soil in the floor, a Puzzle Feeder of sweet berries. Let 1 or 2 foxes out. Watch by day, keeping back. | They curl up asleep under the roof. Walk up without sneaking: one wakes. Sneak up: they sleep on. At night they're about. |
| 8 | Take the Burrow Soil out and measure again; put it back. | The foxes' dig enrichment goes without it, and comes back with it (the clipboard's enrichment line). |
| 9 | Take the den's roof away and measure. | A warning: they want "a den" (wolves) or "cover to nap under" (foxes) over at least 10% (20%) of the ground. |
| 10 | Put sweet berries or glow berries in the foxes' Puzzle Feeder; raw beef, mutton or chicken in the wolves' Basic Feeder. | The berries and the meat go in; each eats from it. |
| 11 | Try a fox in the wolves' run, or a wolf with sheep. | Neither shares. |
| 12 | Listen near each: a wolf, a fox, and the zoo's sheep, cows, pigs, chickens and rabbits. | Each makes the game's own sounds; a pup's and a lamb's higher. |
| 13 | Turn breeding on (the Exhibit Clipboard) and keep them well for a few park days. | Pups and kits, growing up in a few park days, taking a parent's coat. |
| 14 | Release one of each back to the wild (a Conservation release). | The game's wolf or fox with the coat it had. |
| 15 | In a new Superflat world, `/zoocraft:build`. | The Wolves and Foxes exhibits with their animals, measured ready. |
| 16 | Open the content log (Settings, Creator) after the steps above. | No lines about `zoo_wolf`, `zoo_fox`, `sounds.json` or `woodland`. |
