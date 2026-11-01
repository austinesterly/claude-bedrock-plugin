# The farmyard: test plan (0.1.168)

Module 12, the vanilla catalogue: its first part, the farmyard four. Austin: "then lets go to the next module". The
design is in research/vanilla_plan.md ("0.1.168 the farmyard four: the design"). Wolves and foxes come next (0.1.169),
then pandas and polar bears (0.1.170).

What it does:
- Four new zoo animals, the game's own sheep, cow, pig and chicken: zoo copies with exactly the game's look, babies
  included. You catch the wild ones as any animal: spot them in the Field Journal and do their watching tasks (sheep and
  cows: graze and herd; pigs: sniff and herd; chickens: peck and flock) till the journal says "Ready to move", then a
  Livestock Crate (sheep, cows, pigs) or a Small Carrier (chickens) with the bait in your inventory: wheat for sheep and
  cows, a carrot for pigs, wheat seeds for chickens. A baby can't be moved.
- A caught sheep keeps its wool colour (all 16) and a shorn one stays shorn. A caught cow, pig or chicken keeps the look
  of its climate: temperate, warm (from savannas, jungles and badlands) or cold (from taigas, snowy taigas and windswept
  hills). Lambs take after a parent. Released back to the wild, it keeps its colour or its climate.
- The Farmyard: sheep, cows, pigs, chickens and rabbits can share one exhibit. Room: a sheep, cow or pig wants 48 blocks
  of floor for the first and 16 for each more, a chicken 16 and 4 more; 3 blocks of headroom. A shared yard takes the
  biggest of those and a quarter more, as every shared exhibit does.
- Grass: sheep and cows graze the grass in their floor (12 grass blocks each, up to half their food; it never wears
  away). Pigs want a mud wallow (4 mud blocks), as the elephants do.
- Bedding: a barn corner. Hay bales on the floor under a roof (any roof up to the cover height over that spot), 1 for
  every 2 animals in the yard and 2 at least. A bale counts beside a floor block they can stand on, or under their feet.
  Without enough, comfort can't rise past 55 and the clipboard warns. Measure again with the Habitat Marker after.
- Food: Grain Rations, or the game's own foods in a Basic Feeder (or a Hay Rack for sheep and cows): wheat (grain: all
  four), carrots, potatoes and beetroot (roots: pigs), wheat, beetroot, melon and pumpkin seeds (seeds: chickens). A
  Basic Feeder or Hanging Food Basket shows roots as a heap of carrots, potatoes and beetroot, and seeds as a scatter of
  seeds. Water from a Water Trough or the yard's water.
- The game's products: shears on a grown sheep give its wool (of its colour); the wool grows back a park day later if
  the yard has its grass. An empty bucket on a grown cow fills with milk. A grown chicken lays an egg on the floor every 5
  to 10 minutes: white, brown from a warm one, blue from a cold one. Lambs, calves, piglets and chicks give nothing. No
  saddles and no riding.
- Petting farm: a yard holding one of the four with a keeper on its round (a Staff Room keeper with the exhibit on their
  round) draws guests as a guest favourite does (a quarter more). The Exhibit Clipboard says so on its Farmyard line.
- Breeding: lambs (1, sometimes 2), calves (1), piglets (2 to 4), chicks (1 to 3), grown in a few park days.
- `/zoocraft:build`'s test zoo has a Sheep, a Cows, a Pigs and a Chickens yard (70 exhibits): grass, walls 3 high, an
  oak plank roof over the back rows with hay bales under it, a Hay Rack or Basic Feeder of Grain Rations, a Water
  Trough, and mud for the pigs.

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a simulated player; a flat world at noon
with the test zoo built with only its four farm yards; the bench copy's hens lay every 8 to 12 seconds instead of 5 to 10
minutes; runs fb168a to fb168a5):
- The first run found the zoo cow wouldn't load at all ("play_sounds: expected an array": the game's own cow file is
  an older format that takes one name; ours, newer, wants a list), and the test zoo stopped at the cows. Fixed, and a
  test now fails on any farm animal with a single name there.
- The yards measured ready, no issues: Sheep, Cows and Pigs 120 blocks of floor with 3 hay bales under the barn roof
  (115 grass for sheep and cows, 4 mud for the pigs), Chickens 49 with 2. The clipboard: "Farmyard: 3 hay bales under a
  roof; a keeper on its round makes it a petting farm (guests like it a quarter more)" (the test zoo hires keepers).
- Hay taken away from the Sheep yard and measured: 0 hay, the warning "Sheep need bedding: ... 2 or more for the 4 in
  the yard (0 now) ..." and "Farmyard: 0 hay bales under a roof (2 needed)". Put back: 3 again, no warning.
- Shears on a grown zoo sheep: wool of its colour dropped (magenta 2 from a magenta one, orange 1 from an orange one)
  and it showed shorn; shears again on it did nothing. A park day later with its grass the wool grew back (shown
  unshorn again).
- An empty bucket on a grown zoo cow: a bucket of milk.
- The hens laid in their coop: in 30 seconds 5 white, 3 brown and 3 blue eggs (two white-coated hens, one warm, one
  cold).
- Catching: a red, shorn wild sheep with a Livestock Crate and no wheat: "You need some wheat in your inventory to coax
  it in."; with wheat it went in, and out in the Sheep yard it was red and shorn (its wool due back a park day later).
  A cold wild cow (Livestock Crate, wheat) came out a cold zoo cow; a warm wild chicken (Small Carrier, wheat seeds) a
  warm zoo chicken.
- No content log lines about the farm animals or their scripts in the last run.
- Not seen on the server (it draws nothing): the animals' looks and animations, the wool colour on a sheep, the
  feeders' carrot and seed looks. Those are in the steps below.

New entity files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Find a wild sheep, cow, pig and chicken. Look at each with the Field Journal; do the watching tasks it lists. | Each has a journal page; the tasks tick off; "Ready to move" at the end. |
| 2 | Hold a Livestock Crate and use it on a grown sheep with no wheat in your inventory. Then with wheat. | "You need wheat in your inventory to coax it in." Then the sheep goes into the crate (the wheat is used). |
| 3 | The same on a cow (wheat), a pig (a carrot) and, with a Small Carrier, a chicken (wheat seeds). Try a baby too. | Each goes in. The baby can't be moved. |
| 4 | Build a yard: walls, grass for a floor, an oak plank roof over a back corner with 2 or more hay bales on the floor under it, a Hay Rack or Basic Feeder of Grain Rations or wheat, a Water Trough. Use the Habitat Marker inside. | The Exhibit Clipboard: the ground line counts the hay under a roof; a "Farmyard:" line with the bales and "no keeper on its round". |
| 5 | Let the sheep out of the crate on the yard's floor. | It looks just as it did in the wild: the same wool colour (try a pink or a black one), shorn if it was shorn. Its walk, its head down eating grass, and a lamb's big head all look as the game's. |
| 6 | Let out a cow from a snowy taiga or a taiga, a pig from a savanna or a jungle, and a chicken from a cold place. | Each keeps its cold or warm look. Temperate ones look as usual. |
| 7 | Take all the hay away, or the roof over it, and measure again. | A warning: they need bedding, "2 or more for the 2 in the yard (0 now)", comfort can't rise above 55. Put it back, measure: gone. |
| 8 | Use shears on a grown sheep. Then use them again. | Wool of its colour drops (1 to 3) and it looks shorn. The second time nothing happens. |
| 9 | Wait a park day (a Minecraft day) with the yard's grass. | Its wool is back. With no grass in the floor it stays shorn. |
| 10 | Use an empty bucket on a grown cow, then on a calf. | A bucket of milk from the cow; nothing from the calf. |
| 11 | Leave a few chickens in a coop for 10 minutes. | Eggs on the floor: white, brown from a warm chicken, blue from a cold one. Chicks lay none. |
| 12 | Put carrots, potatoes or beetroot in a Basic Feeder in the pigs' yard; seeds in one in a coop; wheat in a Hay Rack. | A heap of carrots, potatoes and beetroot; a scatter of seeds. Each animal eats from the feeder its diet allows. |
| 13 | Put 4 mud blocks in the pigs' floor; then take them out and measure. | With the mud no warning; without it the mud wallow warning. |
| 14 | Hire a keeper (Staff Room) with the yard on their round. Measure. Then watch a few visitor days. | The Farmyard line: "a keeper on its round makes it a petting farm (guests like it a quarter more)". The yard draws guests as a favourite. |
| 15 | Put a sheep, a cow, a pig, a chicken and a rabbit in one big yard. Try a zebra in it too. | The five share it; the zebra doesn't. |
| 16 | Turn breeding on in the yards (the Exhibit Clipboard) and keep them well for a few park days. | Lambs, calves, piglets and chicks, growing up in a few park days. A lamb takes its colour after a parent. |
| 17 | Shear a sheep and move it to another yard in a crate. | It comes out shorn and its wool grows back a park day later. |
| 18 | Release one of each back to the wild (a Conservation release). | The game's sheep, cow, pig or chicken with the colour or climate look it had. |
| 19 | In a new Superflat world, `/zoocraft:build`. | The Sheep, Cows, Pigs and Chickens yards with their animals, hay and roof, measured ready. |
| 20 | Open the content log (Settings, Creator) after the steps above. | No lines about `zoo_sheep`, `zoo_cow`, `zoo_pig`, `zoo_chicken` or `farm`. A line about a sheep animation (`setup.v2` or `baby_transform`) would mean the sheep's look needs a fix: post it in the thread. |
