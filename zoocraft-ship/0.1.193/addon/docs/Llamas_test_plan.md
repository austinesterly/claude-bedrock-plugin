# Llamas, trader llamas and mules: test plan (0.1.193)

The game's llama, trader llama and mule as zoo animals, in the Paddock with the horses and donkeys. They look, sound and
move like the game's own (the same models and skins; a cria or a mule foal is a small copy of the grown one). A llama keeps
its coat (creamy, white, brown or gray). No chests or riding in the zoo.

Carpets: use any of the 16 carpets on a grown zoo llama or trader llama and it wears it, as the game's tamed llamas do.
Another carpet over it swaps them and gives you the first back. Shears take it off and give you the carpet. A trader llama
with no carpet wears its trader's blue blanket. A carpet stays on when the llama is put down and comes back again.

Wolves: as in the game, a llama spits at a wild wolf that comes within 10 blocks of it (never a tamed one). The spit
doesn't hurt the other llamas in the zoo.

How to catch them:
- Llamas: herds of 4 to 6 on savannas and windswept hills. Have a hay bale, wheat or a Grain Ration in your inventory and
  use an empty Livestock Crate on a grown one. A tamed one is someone's: it won't go in.
- Trader llamas: they come with wandering traders, two on leads. On its trader's lead one is the trader's: cut the lead
  with shears and it's free (the game tames it then). The crate's first try on one says to take off any carpet first (the
  zoo can't see a carpet you put on it in its inventory screen, so the crate would lose it); use the crate on it again
  and it goes in, in its trader's blanket. One carrying a chest is someone's pack animal.
- Mules: none in the wild. Breed a tamed horse with a tamed donkey (golden carrots or golden apples) and the foal is a
  mule; once it's grown, have wheat or a Grain Ration in your inventory and use the crate on it. Or let a horse and a
  donkey have one in the zoo.

What they want (a paddock):
- Room: 150 blocks of floor for the first and 50 for each more (llamas and mules alike), 4 blocks of headroom. Llamas and
  trader llamas can share; mules can share with horses and donkeys.
- Company: llamas and trader llamas 2 at least and up to 8, and they count as each other's herd. A mule can be on its
  own, up to 6. Horses, donkeys and mules sharing a paddock count as each other's herd.
- Grass in the floor (20 blocks for each): they graze it for up to half their food.
- A stable corner: hay bales under a roof, one for every 2 llamas, one for each mule.
- Food: a Hay Rack of Grain Rations (or a Basic Feeder). Water from a Water Trough.
- Something to forage: a Hanging Food Basket of Grain Rations (or wheat).
- Mules: room to gallop (a straight strip 2 wide and 12 long, as donkeys) and grooming with a brush, as donkeys.
- With a keeper on their round the paddock is a petting farm: guests like it a quarter more.

Breeding: llamas and trader llamas one cria at a time (each with its own kind). Mules have no foals of their own. With
breeding on, a horse and a donkey of opposite sexes sharing a paddock can have a mule foal, when there's no pair of the
paddock's own kind.

Also in 0.1.193: a horse and a donkey sharing a paddock count as each other's herd (and mules as theirs). Before, a lone
horse with a lone donkey each lacked company, so the pair a mule foal needs could never breed (on the test server: social
40, "Horses like company").

Also in 0.1.193: wild parrots, ocelots, cats and sniffers can be caught again. Since 0.1.188 their Field Journal pages
asked for a task only a zoo one can show (a dancing parrot, a cat sitting, a sniffer digging up a seed) before "Ready to
move", so a wild one could never be caught. Those tasks still tick, but they no longer stand in the way: the page marks
them "(a zoo one)".

New animals: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_llama, zoo_trader_llama or zoo_mule, and no "Locator" error. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Llamas, Trader Llamas and Mules, beside the Horses and Donkeys. | Three paddocks 18 by 12 of grass behind glass, each with a stable corner (hay under a roof), a Hay Rack with a Hanging Food Basket over it and a Water Trough, and two animals each. The Exhibit Clipboards have no warnings. On the test server each measured 215 blocks of floor, 212 or 213 of them grass, the hay the stable corner needs, and an 18-block run. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Llamas in their coats; trader llamas in the blue trader's blanket; mules like donkeys with the mule's darker coat and long ears. No chests on their sides. |
| 4 | Use a red carpet on a llama, then a blue one, then the blue one again. | It wears the red carpet, then the blue one (and the red comes back to you), then nothing changes. The Clipboard says "Dressed: in a blue carpet". On the test server the property and the record followed, the red carpet came back on the swap, and the same carpet again did nothing. |
| 5 | Use shears on it. | The carpet comes off and back to you. On the test server: the carpet came back. |
| 6 | Put a carpet on a trader llama, then leave the world and open it again. | It still wears the carpet. On the test server, made again from its record, it wore it again. |
| 7 | In Survival, let a wolf into the Llamas' paddock (a spawn egg). | The wolf keeps away at first (wolves avoid llamas); once it's within 10 blocks a llama spits at it every few seconds. On the test server the wolf kept 11 to 12 blocks off for a while; then a llama spat at it every 4 seconds and it took 1 damage a hit; one spit hit the other llama, which took nothing. |
| 8 | Find a wandering trader and look at its trader llamas. Try a crate on one. | The Field Journal ticks "Spot one on its wandering trader's lead"; the crate is refused: "This Trader Llama is on its wandering trader's lead: it's the trader's. Cut the lead with shears and it's free to catch." On the test server: both. |
| 9 | Cut the lead with shears, then (with a hay bale) use the crate on it, then again. | The first try says to take off any carpet first; the second catches it. It comes into the zoo in its trader's blanket. On the test server: the warning, then the catch, then the blanket. |
| 10 | Catch a wild llama with a hay bale (or wheat) and put it in the Llamas' paddock. | It goes in, keeps its coat, and lives in the paddock. On the test server two were caught (a hay bale, wheat), in their coats. |
| 11 | Breed a tamed horse and a tamed donkey (golden carrots), wait for the foal to grow, and catch it with wheat. | It goes in as a mule. On the test server mules spawned grown (as a bred one grows) went in with wheat and with a Grain Ration. |
| 12 | Put a horse mare and a donkey jack in one paddock of 330 or more floor blocks, with no other pair (the test zoo's Horses' paddock is 24 by 12, 287 blocks: widen it to 28 by 12), turn breeding on and run `/zoocraft:skip 600` a dozen or so times. | A message that a mule foal was born; it's a small mule. The Mules' Clipboard says mules have no foals of their own. On the test server a mare and a jack in the Horses' paddock (its shared room eased on the bench: the test zoo's paddock is 287 blocks of the 325 a horse and a donkey need) were expecting a mule foal after 2 good park days and had it 4 days later: Sarge, a young zoo mule, both parents on its record. |
| 13 | Put one mule in a paddock with a horse and open the Exhibit Clipboard. | No "likes company" warning: the horse counts as its herd. (The tests check this; the test zoo's paddocks have no room for a third animal.) |
| 14 | Let one of each go back to the wild (Conservation, far from the park). | Each is the game's own again, grown (a llama's coat is the game's new pick: the game has no event for a coat). On the test server, 10 of each let go by the same spawn the crate uses came out grown. |
| 15 | Open the Field Journal's pages. | Llama: spot one, watch one with its herd, find one dressed in a carpet (a zoo one). Trader llama: spot one, watch one with its herd, spot one on its trader's lead. Mule: spot one, watch one grazing, watch one with its herd. On the test server all the wild ones ticked from the game's own animals and "Ready to move" came without the zoo task. |
| 16 | **Parrots, ocelots, cats, sniffers**: find a wild one, tick its wild tasks and try a crate. | It goes in (before 0.1.193 it never could). |
