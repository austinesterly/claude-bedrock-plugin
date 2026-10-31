# Griffin: test plan (0.1.151)

The second great flier of the Mythical Glade (module 9; the plan is research/mythical_plan.md). The classic griffin: a
lion's body, hind legs and tufted tail with an eagle's head, hooked beak, feathered wings and taloned forelegs, about
4.5 blocks nose to tail with an 8-block wingspan (the "Big" size), in the plain vanilla style. Three coats: Golden (a
tawny lion's body, a white eagle's head, golden-brown wings), Snowy (white with grey-barred wings) and Storm (slate grey
with a dark head and charcoal wings). A chick is small (0.4 the size), pale and downy with a big head. Not dangerous:
it hurts nobody.

New entity, model, skin and animation files: quit Minecraft fully and start it again. Works in any world; wild
Griffins live only in the Mythical Glade, so elsewhere use the Wild Griffin Spawn Egg for the wild steps.

What its hall needs (the Exhibit Clipboard lists each): the dragons' kind of hall, a roof and closed walls with 16
blocks of air over the floor, 900 blocks of floor for the first (30 by 30) and 300 more for each other (a pair 1,200); a
block of gold or raw gold set on the floor (its hoard: without one comfort can't rise above 50); Meat Rations in a Basic
Feeder on the floor, 3 a park day each; a Water Trough. One to four together (a pair and their chicks). Not with
dragons. Carried in a Reinforced Crate. No research needed. Measure the hall with the Habitat Marker after setting the
gold down: a big empty hall with gold on its floor is measured as a griffin hall, so one can move in.

How it behaves: it flies round the hall, beating its wings and gliding, hovering to land, and now and then climbs to
the top of the hall and dives like an eagle with its wings tucked, sweeping up again near the floor. It lands to guard
its gold, lying beside it with its wings mantled round it (a soft clink of gold as it settles), to eat at the feeder, to
rear up and screech, or to preen a wing. At night it comes down by its gold and sleeps there till morning, then wakes and
goes up again. A chick flies after a grown griffin and lands beside it, and never dives or screeches till it is grown.
Wild ones fly over the glade's giant trees, perch on top of the trees' crowns and land on the open grass, alone or in
pairs. They are wary: come within 12 blocks in Survival without sneaking and one screeches facing you and takes off,
flies well away and keeps away from that spot for a while. Sneaking, you can get close. Hold a Meat Ration within 16
blocks and one in the air comes down beside you and stays while you hold it; put it away and off it goes. With a Meat
Ration in your inventory, a Reinforced Crate takes one in.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, a world made for the test, seed 12345, a simulated player), a Wild
  Griffin put down in the Mythical Glade the server's own biome search found (at -480 -534), the add-on's scripts
  running. The first four runs found faults, fixed before shipping: some dives dropped only 3 or 4 blocks and ended 11 to
  14 over the ground (it began the stoop before it had finished climbing, and some were aimed at the top of a giant
  tree's crown). Now it climbs right up to the dive's high spot first, never dives from less than 10 blocks over the
  ground, aims only at open ground with no leaves under it and within its glade, and picks a spot far enough ahead to
  come all the way down. The fifth run, 6 minutes: it flew (path 1,235 blocks, up to 27 over the ground, gliding about a
  tenth of the time, never more than 28 blocks from where it was put), hovered, landed on grass four times to guard,
  preen and screech, and made 13 dives, each dropping 5 to 13 blocks and ending 3 to 7 over the ground. Someone in
  Survival walking up to 8 blocks off: it screeched within a fifth of a second, facing them, took off, and 12 seconds
  later was 22 blocks away. Sneaking up to 7 blocks, three times: no screech. A Meat Ration held 4 blocks from one in
  the air: it came down 3.3 blocks away within 2.4 seconds, facing them, and stayed the 20 seconds they held it. On a
  steep hillside the same bait at first brought nothing down (no flat room for it within 6 blocks of the player); it
  now looks up to 10 blocks out, and there it came down 8.3 and 8.2 blocks off within 3 seconds, facing them. No script
  errors.
- Wild spawns, on the same server: six places in and round two Mythical Glades (the Unicorn's and the Dragon's),
  about 34 minutes in all: 6 Wild Griffins (four alone, then a pair) in all three coats, every one standing on the
  glade's grass, about one every 6 minutes near a glade (8 Unicorns and 2 Dragons came in the same time). The pair, at
  a glade's edge, read as plains at head height though the grass under them was the glade's: Bedrock's biomes change
  with height, and the spawn rule is checked on the ground. A run with griffins made 30 times as common (on the test
  server only) brought 11 more, every one on the glade's ground, all but that same edge spot with the glade at head
  height too.
- The park simulator (a 55-exhibit test zoo from /zoocraft:build, 53 checks, all pass, on two seeds): the hall and its
  measure (4 gold blocks, 1,438 blocks usable, 16 high), the clipboard, no warning, comfort 90; both of a pair flying
  round the hall and landing (beating, gliding and hovering), never touching the walls or the roof; 25 and 31 dives
  from near the roof, each dropping 6.5 to 10 blocks and coming out no lower than 3 over the floor; guarding the gold (about
  3 blocks from it, facing it, the clink); eating beside the feeder; a screech; preening; at night both down asleep by
  the gold till day, then up again; breeding and a chick that flies after a grown one (a median 8 to 9 blocks behind in
  the air) and never dives or screeches; the Reinforced Crate in and out (and up it goes again); the gold taken away: 0
  in red, the warning, comfort held at 50, and they still fly and land; a wild one flying over the glade near where it
  was met (round six giant trees), landing on the grass and on the trees' crowns and diving, screeching at Bea in
  Survival and flying off, not startled by her sneaking, and brought down beside her by a Meat Ration till she puts it
  away. No errors.
- What can't be checked without a screen: how it looks in the game (the model, the three coats and the chick), how it
  moves (the wing beats, the glide, the dive, the landing, the screech, the guarding and preening) and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | In a Creative world, `/zoocraft:build` (or in your own park, build a hall 30 by 30 or more with closed walls and a roof over 16 blocks of air, set a block of gold on the floor, put Meat Rations in a Basic Feeder and add a Water Trough, measure it with the Habitat Marker, and release a pair). | A "Griffins" hall 38 by 38 with a glass roof, four blocks of gold in the middle of the floor, a Basic Feeder and a Hanging Food Basket with Meat Rations, and a Water Trough. A pair inside. |
| 2 | Look at them. | Lion bodies with eagle heads, hooked yellow beaks, feathered wings and taloned front legs; golden with a white head (Golden), white with grey bars (Snowy) or slate grey (Storm). |
| 3 | Watch them for a while by day. | They fly round the hall, beating their wings and gliding, sometimes hovering, never through the walls or the roof. Now and then one climbs near the roof and dives steeply with its wings tucked, then sweeps up again before the floor. |
| 4 | Keep watching. | Now and then one lands: by the gold to guard it, lying with its wings spread round it (a clink of gold), at the feeder to eat, to rear up on its hind legs and screech, or to preen a wing. |
| 5 | `/time set night` and wait a little. | Both come down by the gold and sleep there. `/time set day`: they wake and go up again. |
| 6 | Use the Exhibit Clipboard on the hall. | Gold hoard: the number of gold blocks, green. A line for the chicks when there are any. |
| 7 | Break the gold blocks, use the Habitat Marker inside again, wait a park day. | Gold hoard 0 in red; a care warning that griffins guard gold; comfort no higher than 50. They still fly and land. Put the gold back and measure again. |
| 8 | With a Meat Ration in your inventory, carry one in a Reinforced Crate, then use the crate on the ground inside the hall. | It goes in the crate, and back out into its hall, and soon flies up again. |
| 9 | Turn breeding on and keep them well for a few park days. | One chick, small and pale with a big head, flying after a grown one and landing beside it. It never dives or screeches. |
| 10 | In a normal world, go to a Mythical Glade (the Field Journal's Places page points the way after the Park Guidebook research). | "You found a Mythical Glade" in the Field Journal, which now mentions Griffins. Now and then a Wild Griffin flies over the giant trees, perches on top of one or lands on the open grass. |
| 11 | Walk up to a wild one on the ground without sneaking (or one from the Wild Griffin Spawn Egg). | Within 12 blocks it screeches, facing you, and takes off, then flies well away from you. |
| 12 | Sneak up to one; then, when one is flying, stand up and hold a Meat Ration. | Sneaking, it doesn't screech. Holding a Meat Ration, one in the air within 16 blocks comes down beside you, facing you, and stays while you hold it. |
| 13 | Watch the Griffins. | The Field Journal's tasks: spot one, watch one guard its gold, hear one rear up and screech, watch one dive like an eagle. |
| 14 | Open the content log (Settings, Creator) after the steps above. | No lines about `griffin`. |
