# Sea Turtles: test plan (0.1.183)

The game's sea turtle as a zoo animal. It looks, sounds, swims and crawls like the game's own (the same model and skin;
a hatchling is the grown model at a third of the size). It swims about its pool and now and then by day crawls up onto
the sand to bask a while, then back into the water. A female that has mated carries her eggs (her belly shows them, as the game's does). At
night she crawls up the beach to her spot in the sand, digs (sand thrown up, the game's digging flippers), lays her eggs
(a Turtle Nest shows on the sand, 1 to 4 eggs) and crawls back to the water. Nobody guards the nest. The eggs crack as
the days pass and hatch, and the hatchlings crawl to the water. A nest in full sun hatches mostly females, a shaded one
mostly males. A young one sheds a Turtle Scute as it grows up (five make a Turtle Shell).

How to catch one: find a wild sea turtle (warm beaches). Have seagrass or a Leafy Ration in your inventory and use a
Livestock Crate on it.

What they want (a turtle beach):
- Room: 45 blocks for the first and 45 for each more, 2 blocks of headroom. At least 60% of it water, 2 deep in at least
  27 spots; at least 20% dry beach.
- Seagrass: seagrass or kelp growing in 4 water blocks for each turtle (bone meal on sand under the water grows it).
  Without it comfort can't rise above 55.
- Sand to nest in: sand or red sand 2 to 5 blocks from the water's edge.
- Food: Leafy Rations, or seagrass, in an Aquarium Feeder over the water.
- Walls 3 high where anything stands against them: a filter or feeder by a wall 2 high is a step up and over it.

A new animal and a new block: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_turtle or turtle_nest. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Turtle Beach. | A pool 2 deep along the left with seagrass on its floor, a sand beach along the right, walls 3 high, a Water Filter and an Aquarium Feeder of Leafy Rations. The Exhibit Clipboard says "Nesting beach: yes". |
| 3 | Watch them for a few minutes (`/time set 1000`). | They swim about with the game's own swim. Now and then one crawls up out of the water onto the sand near the water's edge, lies there a while (20 to 50 seconds) and crawls back into the water. |
| 4 | Turn breeding on with the Exhibit Clipboard and run `/zoocraft:skip 1200` twice. | A message that the pair have mated and that at night she'll crawl up the beach to the sand. Her belly shows her eggs; her clipboard page says she is carrying her eggs. |
| 5 | `/time set 14000` (night) and watch her. | She swims to the beach, crawls up onto the sand to her spot, digs (sand thrown up round her, the sand's sound), and a Turtle Nest appears on the sand with a message. Then she crawls back into the water. |
| 6 | `/time set 1000`, then `/zoocraft:skip 1200` once a time and look at the nest. | The eggs crack (the egg crack sound), then crack more. Then they hatch (the shells' break sound): the hatchlings crawl to the water, and a message says how many females and males and whether the nest was warm or cool. The nest is gone. |
| 7 | Walk over the nest, and break it. | You walk through it. Broken, it comes back (the eggs are the nursery's), and it drops nothing. |
| 8 | `/zoocraft:skip 9600` and look at the young. | A message that each is all grown up and sheds a Turtle Scute; a Turtle Scute lies where each one is. |
| 9 | In Survival, find a wild sea turtle with seagrass in your inventory and use an empty Livestock Crate on it. Use the crate on the beach. | It goes in, and comes out a zoo turtle in the Turtle Beach. |
| 10 | Let a grown zoo turtle go back to the wild (Conservation, far from the park). | It comes out grown. |
| 11 | Open the Field Journal's Sea Turtle page after spotting one. | Its care notes: A turtle beach, Seagrass, Food, Nesting, the scute, and Catching with seagrass or a Leafy Ration. Tasks: spot one, watch one crawl up out of the water onto the sand, watch one dig her nest. |
