# Sniffers: test plan (0.1.192)

The game's sniffer as a zoo animal. It looks, moves and sounds like the game's own (the same model and skin, its walk,
its sniffing, its long sniff, searching nose down, digging, standing up and its happy wiggle, and its sounds). It digs as
the game's does, by the game's own rules kept on the zoo copy: every 400 to 500 seconds (7 or 8 minutes) a grown one
stops for a long sniff, walks about nose down to a spot of ground it can dig, digs at it for 8 to 10 seconds, turns up a
torchflower seed or a pitcher pod (half and half), then stands up again pleased with itself. A snifflet can't dig. It
can't be hurt, never despawns, can't be leashed or tied to a balloon, and doesn't breed by seeds or lay eggs (zoo
breeding decides young).

How to catch one: none live in the wild. They hatch from sniffer eggs, which you brush out of the suspicious sand in
warm ocean ruins (an egg hatches in 10 minutes on a moss block, 20 elsewhere; the snifflet grows up in about 40). Have
torchflower seeds or a Grain Ration in your inventory and use an empty Livestock Crate on a grown one.

What sniffers want (a paddock of their own):
- Room: 100 blocks of floor for the first and 30 more for each more, 4 blocks high.
- Ground to dig in under at least half the floor: dirt, coarse dirt, grass, podzol, rooted dirt, moss, pale moss, mud or
  muddy mangrove roots. Sand, gravel, mycelium and stone they can't dig. Without it comfort can't rise above 55.
- Food: torchflower seeds and pitcher pods (the seeds they dig up) or Grain Rations, in a Basic Feeder. Water from a
  Water Trough.
- Company: alone or a few together, up to 4.

The seeds they dig up: plant a torchflower seed or a pitcher pod on farmland and it grows into a flower found nowhere
else, or put them in the feeder (chickens eat them too).

A new animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_sniffer, and no "Locator" error. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Sniffers, beside the Armadillos. | A paddock 12 by 12 behind glass: grass, a moss bed along the back, a strip of dirt and coarse dirt along the front, a Basic Feeder with a Hanging Food Basket over it, a Water Trough, and two sniffers. The Exhibit Clipboard says "Digging beds: 142 floor blocks to dig in, 72 needed" and has no warnings. On the test server the measure counted 142 of the 143 floor blocks. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Each looks like the game's sniffer: the big red-brown body with green moss on its back, six legs, the long nose. It walks with the game's walk and sniffs the ground with its nose as it goes. |
| 4 | Watch them for 8 or 9 minutes (or in Creative run `/event entity @e[type=zoocraft:zoo_sniffer] zoocraft:on_scenting_success` to send them looking now). | One stops for a long sniff, walks about with its nose down, stops and digs at the ground, a torchflower seed or a pitcher pod pops out in front of it, it stands up and wiggles its head. On the test server each of five sniffers had its first long sniff 430 to 495 seconds after it came, and the pair and the one on grass blocks each dug up a seed about 9 seconds after starting to dig, then stood up; sent looking by the event, most dug at once and one now and then gave up and stood up again. One digging with its nose to the glass may throw its seed just over the wall. |
| 5 | Pick up the seed and plant it on farmland (or put it in the Basic Feeder). | It grows into a torchflower (or a pitcher plant). In the feeder it counts as food. |
| 6 | Break floor blocks until less than half the floor is ground they dig (put stone or sand there) and measure with the Habitat Marker. | A warning that sniffers need ground to dig in, how many blocks are needed and how many there are now. Put the ground back and measure again: the warning goes. |
| 7 | Build a small pen with a sand floor (or mycelium) and put a sniffer in it. | It never digs there. On the test server sniffers in a sand pen and a mycelium pen, sent looking, never started a search; one in a pen of grass blocks only dug. |
| 8 | Turn breeding on with the Exhibit Clipboard and run `/zoocraft:skip 600` three or four times. | A message that a snifflet was born. It's a small sniffer (the grown look, smaller, with a bigger head). It never digs. |
| 9 | In Survival, hit one. | It takes no harm. |
| 10 | In Survival, catch one: hatch a sniffer egg (or in Creative use a sniffer spawn egg), wait until it's grown, have torchflower seeds in your inventory and use an empty Livestock Crate on it, then use the crate on the Sniffers' floor. | It goes into the crate and comes out a zoo sniffer. |
| 11 | Let one go back to the wild (Conservation, far from the park). | It's the game's own again, grown. On the test server, let go by the same spawn the crate uses, 3 came out grown. |
| 12 | Open the Field Journal's Sniffer page, then watch the pair from the path through the glass while one digs. | Its care notes (digging, digging beds, the seeds, company) and catching with torchflower seeds or a Grain Ration. Tasks: spot one, watch one sniff out a spot to dig, watch one dig up a seed (a zoo one: the game's own doesn't tell the journal). On the test server, from the path at the glass, all three ticked. |
| 13 | **Every animal**: stand on a path outside any exhibit and look at an animal through the glass front (a new one in the journal, or one with a task left). | The Field Journal counts it: "Spot one" ticks, and watching tasks tick through the glass too. Before 0.1.192 the journal only counted an animal with nothing solid in the way, so glass fronts hid every animal from it (on the test server: nothing ticked from the path, all three inside the paddock). |
