# Horses and donkeys: test plan (0.1.175)

The game's horse and donkey as zoo animals. They look, sound and move like the game's own (the same model and skins; a
foal is a small copy of its mother). A horse keeps its coat (white, creamy, chestnut, brown, black, gray or dark brown)
and its markings (none, white socks and blaze, white patches, white spots or black spots); a foal takes each after one
parent or the other. No saddles, chests, armour or riding in the zoo.

How to catch one: find a wild horse or donkey (plains, savanna, meadows). Have some wheat or a Grain Ration in your
inventory and use a Livestock Crate on a grown one (if the game puts you on its back, you're set down and it goes in).
Foals stay with their families. A tamed one is someone's: it won't go in.

What they want (a paddock):
- Room: horses 200 blocks of floor for the first and 60 for each more; donkeys 120 and 40. 4 blocks of headroom. They
  can share one paddock. Two at least.
- Room to gallop: a straight strip of open floor 2 blocks wide, 20 blocks long for horses and 12 for donkeys. With it,
  now and then one gallops round the paddock. Without it, comfort can't rise above 60.
- Grass in the floor (30 blocks for each horse, 16 for each donkey): they stop on it now and then to graze, head down.
- A stable corner: hay bales under a roof, one for each horse and one for every 2 donkeys.
- Food: a Hay Rack of Grain Rations (or a Basic Feeder). Wheat and apples are their food too.
- Something to forage: a Hanging Food Basket of Grain Rations (or wheat) over the rack.
- Grooming: use a brush on each one at least every 2 park days (it leans into the brush), or give a Staff Room keeper the
  paddock on their round. Ungroomed, comfort can't rise above 65.

Also in 0.1.175: the game's animals you let go back to the wild come out grown. Before, the game's own spawn sometimes
made a young one (wolves 1 in 10, foxes, pandas and the farm animals 1 in 20, horses and donkeys 1 in 5, rabbits 1 in 4,
striders half the time, and a strider sometimes came out with a rider on its back).

New animals: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_horse or zoo_donkey. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Horses and the Donkeys. | Each paddock is grass with a roofed stable along the back holding hay bales, a Hay Rack of Grain Rations with a Hanging Food Basket of them over it, and a Water Trough. Two horses (each its own coat and markings) and two donkeys that look exactly like the game's. Each Exhibit Clipboard: no problems; the Paddock line shows the straight run (24 for the horses, 16 for the donkeys), the hay bales and the grooming. |
| 3 | Watch them for a few minutes from outside. | They walk about; now and then one stops on the grass with its head down for a few seconds (grazing); now and then a horse gallops round the paddock for several seconds (donkeys do it less often). |
| 4 | Open a horse's page on the Exhibit Clipboard. | Its coat and markings (for example "Chestnut coat, white socks and blaze") and a Groomed line. |
| 5 | Wait 2 park days without brushing, then open the clipboard. | "Needs grooming" with their names, and Groomed: not lately. |
| 6 | Hold a brush and use it on each one. | The brushing sound, the brush wears a little, and "You groom (name): it leans into the brush." The Groomed line says yes. |
| 7 | Give a Staff Room keeper the Horses on their round (Staff Room, keeper, round). | The clipboard's Paddock line says a keeper on its round grooms them; no grooming warning. |
| 8 | Break blocks so no straight 2-wide strip of 20 is left in the horses' paddock, then measure it with the Habitat Marker. | A warning that they need room to gallop, with the run it has now. Put it back and measure again: the warning goes. |
| 9 | In Survival, find a wild horse with some wheat in your inventory and use an empty Livestock Crate on it. Use the crate on the Horses' floor (a paddock with room). | It goes in (if you end up on its back for a moment, you're set down). Let out, it has the same coat and markings it had in the wild. With a brush in hand instead, you ride it as usual. |
| 10 | Let a grown wolf, fox, panda, horse, donkey, rabbit or strider go back to the wild (Conservation, far from the park). | It comes out grown every time; a strider comes out with nothing on its back. |
| 11 | Open the Field Journal's Horse page after spotting one. | Its care notes: Exercise, Grooming, Their day, Looks, Bedding, and Catching with some wheat or a Grain Ration. |
