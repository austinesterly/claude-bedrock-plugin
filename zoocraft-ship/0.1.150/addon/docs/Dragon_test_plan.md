# Dragon: test plan (0.1.150)

The great flier of the Mythical Glade (module 9; the plan is research/mythical_plan.md). A movie-style dragon: four
legs, a pair of great wings, horns and a long tail ending in a spade, about 7 blocks nose to tail with an 11 to 12-block
wingspan, the back about 1.75 blocks up and the head carried about 2.6 up, in the plain vanilla style. Three coats:
Emerald (green scales, a gold belly, green fire), Ember (red, a cream belly, orange fire) and Frost (ice blue, a pale
belly, icy blue fire). The eyes glow. A hatchling is small (about a third the size) with a big head and stubby horns.
Not a boss, and not the End's Ender Dragon: it hurts nobody and its fire lights nothing.

New entity, model, skin, animation and particle files: quit Minecraft fully and start it again. Works in any world; wild
Dragons live only in the Mythical Glade, so elsewhere use the Wild Dragon Spawn Egg for the wild steps.

What its hall needs (the Exhibit Clipboard lists each): a roof and closed walls (they fly out of an open top), 16 blocks
of air over the floor, 900 blocks of floor for the first (30 by 30) and 300 more for each other (a pair 1,200); a lit
campfire or soul campfire on the floor to bask by (without one comfort can't rise above 50); Meat Rations in a Basic
Feeder on the floor, 4 a park day each; a Water Trough. Alone or up to 3 together. Carried in a Reinforced Crate. No
research needed. Measure the hall with the Habitat Marker after lighting the campfire.

How it behaves: it flies round the hall, beating its wings and gliding, hovering now and then, and lands on the floor
to bask by a campfire with its wings spread wide, to eat at the feeder, to roar with its wings raised or to breathe a
stream of fire in its coat's colour (particles: it lights nothing and hurts nobody). At night it comes down by a
campfire and sleeps curled up on the floor till morning, then wakes and goes up again. A hatchling flies after a grown
dragon and lands beside it, and never breathes fire till it is grown. Wild ones fly high over the glade's giant trees
and land now and then on the open grass. They are wary: come within 14 blocks in Survival without sneaking and one
roars facing you and takes off, flies well away (more than 20 blocks) and keeps away from that spot for a minute.
Sneaking, you can get close. Hold a Meat Ration within 16 blocks and one in the air comes down beside you and stays
while you hold it; put it away and off it goes. With a Meat Ration in your inventory, a Reinforced Crate takes one in.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, a world made for the test, seed 12345, a simulated player), a Wild
  Dragon put down in the Mythical Glade the server's own biome search found (at -480 -544), the add-on's scripts
  running. The first run found a fault, fixed before shipping: landing beside a raised grass block, the side of its
  body caught on it, the game held it up and the steering (which checked only the middle of its body) thought the game
  was ignoring its pushes and moved it by short steps, into a tree's leaves. Now every move and every landing checks
  its whole body (2.4 blocks wide, 2.2 high; a hatchling 0.9 by 0.8): it lands only where level ground runs under all
  of it with open sky over it (not under a giant tree's crown), it climbs over a crown ahead or picks somewhere else to
  fly, and a landing it can't make it tries again elsewhere. The second run, 88 seconds: it flew (path 741 blocks, up to
  31 blocks over the ground, gliding about a tenth of the time, never more than 27 blocks from where it was put),
  hovered, landed and basked, stood and breathed fire; the game never ignored its pushes. Its body was in a solid
  block only where it was first put down, on an amethyst bud, before its first take-off. Someone in Survival walking
  up to 8 blocks off: it roared within a third of a second, facing them. The third run (with the final steering): the
  same roar, then it flew off and 12 seconds later was 31 blocks from them, still flying. Sneaking up to 7 blocks: no
  roar in 20 seconds. A Meat Ration held 4 blocks from one in the air: it came down 3.1 blocks away within 4 seconds,
  facing them, stayed the 20 seconds they held it, and flew off once they put it away. The campfire's lit and put-out states read as the measure expects, and the fire particle plays. No script
  errors.
- Wild spawns, on the same server: 5 minutes at each of six places in and round two Mythical Glades (the Unicorn's
  places). At the first weight no dragon came in 30 minutes (8 Unicorns did), too rare to find, so it was raised: then 2
  Wild Dragons came in 30 minutes (with 6 Unicorns), each in the Mythical Glade standing on grass, none anywhere else:
  about one every 15 minutes in and round a glade. A run with the rate raised far higher (on the test server only, to
  see that the rule works at all) brought 5 in 12 minutes, all in the glade on grass, in all three coats.
- The park simulator (a 54-exhibit test zoo from /zoocraft:build, 54 checks, all pass, on two seeds; the wild part on six): the hall and its measure
  (2 campfires, 1,440 blocks usable, 16 high), the clipboard, no warning, comfort 90; both of a pair flying round the
  hall and landing (beating, gliding and hovering), never touching the walls or the roof; basking by a campfire facing
  it; eating beside the feeder; a roar; fire breath from the mouth in the coat's colour, setting nothing alight; at
  night both down asleep by a campfire till day, then up again; breeding and a hatchling that flies after a grown one
  and never breathes fire (it keeps to one parent and flies faster when it falls behind); the Reinforced Crate in and out (and up it goes again); the campfires put out: 0 in red, the
  warning, comfort held at 50; a wild one flying over the grass near where it was met and landing (round four giant
  trees and a bumpy floor), roaring at Bea in Survival and flying off, not startled by her sneaking, and brought down
  beside her by a Meat Ration till she puts it away. No errors.
- What can't be checked without a screen: how it looks in the game (the model, the three coats and the hatchling, the
  glowing eyes, the fire), how it moves (the wing beats, the glide, the landing, the roar and the bask) and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | In a Creative world, `/zoocraft:build` (or in your own park, build a hall 30 by 30 or more with closed walls and a roof over 16 blocks of air, light a campfire on the floor, put Meat Rations in a Basic Feeder and add a Water Trough, measure it with the Habitat Marker, and release a pair). | A "Dragons" hall 38 by 38 with a glass roof, two lit campfires, a Basic Feeder and a Hanging Food Basket with Meat Rations, and a Water Trough. A pair inside. |
| 2 | Look at them. | Big four-legged dragons with great wings, horns and a long spaded tail, green (Emerald), red (Ember) or ice blue (Frost), with glowing eyes. |
| 3 | Watch them for a while by day. | They fly round the hall, beating their wings and gliding, sometimes hovering, never through the walls or the roof. Now and then one lands: by a campfire to bask with its wings spread wide, at the feeder to eat, to roar with its wings raised, or to breathe a stream of fire in its coat's colour. |
| 4 | Stand near one breathing fire. | The flames come from its mouth. Nothing catches fire and you take no damage. |
| 5 | `/time set night` and wait a little. | Both come down by a campfire and sleep curled up on the floor. `/time set day`: they wake and go up again. |
| 6 | Use the Exhibit Clipboard on the hall. | Campfires: the number lit, green. A line for the hatchlings when there are any. |
| 7 | Put out the campfires (a shovel), use the Habitat Marker inside again, wait a park day. | Campfires 0 in red; a care warning that they bask by a fire; comfort no higher than 50. Light them again and measure again. |
| 8 | With a Meat Ration in your inventory, carry one in a Reinforced Crate, then use the crate on the ground inside the hall. | It goes in the crate, and back out into its hall, and soon flies up again. |
| 9 | Turn breeding on and keep them well for a few park days. | One hatchling, small with a big head and stubby horns, flying after a grown one and landing beside it. It never breathes fire. |
| 10 | In a normal world, go to a Mythical Glade (the Field Journal's Places page points the way after the Park Guidebook research). | "You found a Mythical Glade" in the Field Journal, which now mentions Dragons. Now and then a Wild Dragon flies high over the giant trees or lands on the open grass (they are rare). |
| 11 | Walk up to a wild one on the ground without sneaking (or one from the Wild Dragon Spawn Egg). | Within 14 blocks it roars, facing you, and takes off, then flies well away from you. |
| 12 | Sneak up to one; then, when one is flying, stand up and hold a Meat Ration. | Sneaking, it doesn't roar. Holding a Meat Ration, one in the air within 16 blocks comes down beside you, facing you, and stays while you hold it. |
| 13 | Watch the Dragons. | The Field Journal's tasks: spot one, watch one breathe fire, watch one bask with its wings spread, hear one roar with its wings raised. |
| 14 | Open the content log (Settings, Creator) after the steps above. | No lines about `dragon`. |
