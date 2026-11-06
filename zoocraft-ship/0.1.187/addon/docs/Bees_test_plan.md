# Bees: test plan (0.1.187)

The game's bee as a zoo animal. It looks and sounds like the game's own (the same model and skins, pollen on its back
when it carries nectar, the buzz, its stinger), and it lives the game's way: it flies out to the flowers, sits in one to
gather nectar, takes it home to its Beehive or Bee Nest (the hive fills with honey), and goes in at night and in the
rain. It can't be hurt, and hitting it doesn't make it angry. Shear its hive without a campfire under it and the bees
sting you, as the game's do, and lose their stingers; a zoo bee lives on after it and never stings again.
Three or more make a colony: a pair has one young bee, drawn as a small grown one.

How to catch one: find wild bees by a bee nest (plains, flower forests, meadows, cherry groves). Have a Nectar Ration in
your inventory and use an empty Small Carrier on one. (Hold a flower and they follow you, as the game's bees do.)

What they want (a bee garden):
- Room: 25 blocks of floor for up to three bees and 6 more for each more, with a roof over it 4 blocks up or higher
  (glass lets the guests see in): a zoo bee can't fly free.
- A hive: a Beehive or Bee Nest in the garden for each 3 bees (the game's hive holds 3), its front (the side with the
  hole) opening into the garden. A hive facing a wall doesn't count. Without enough, comfort can't rise above 60.
- Flowers: the game's bee flowers in the garden (poppies, dandelions, tulips, cornflowers, the tall ones, flowering
  azalea and more), 2 for each bee and 6 at least. They're the bees' food: with enough they need nothing else. Short of
  them, a Nectar Feeder of Nectar Rations makes up the rest, and comfort can't rise above 60.
- Company: a colony, so keep at least 3 together.
- Honey: as in the game. Shears on a full hive give honeycomb, a glass bottle honey. Put a campfire under the hive first
  or the bees come out angry.
- An empty exhibit with a Beehive or Bee Nest in it is a bee garden in the making: the Habitat Marker measures it for
  bees.

A new animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_bee. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Bee Garden. | A garden 9 by 9 of grass under a glass roof 4 blocks up, behind glass walls: nine flowers and a peony, a Beehive against the back wall facing in, a Water Trough, three bees. The Exhibit Clipboard says "Flowers: 10 of 6 (... all the food they need)" and "Hives: 1 of 1 (...); honey 0 of 5", and has no warnings. |
| 3 | Watch them for a few minutes. | They fly about the flowers and sit in one now and then (the Field Journal ticks off "watch one gather nectar in a flower"). With nectar they have pollen on their backs ("spot one carrying nectar home") and fly into the hive. A couple of minutes later they come out again. On the test server the three made 3 honey in one trip and the hive was full (5) after the next. |
| 4 | Open the Exhibit Clipboard while they're in the hive. | Their names and needs are all there (the zoo knows them when they come out again). The honey count is the hive's now. |
| 5 | `/time set night` and wait a little. | They go into the hive and stay in. `/time set day`: they come out. |
| 6 | Break one flower after another and measure with the Habitat Marker until fewer than 6 are left. | A warning that bees forage on flowers, with how many there are and how many they need. The clipboard asks for a Nectar Feeder. Plant them back and measure again: the warning goes. |
| 7 | Turn the hive to face a wall (break it, place it facing the glass) and measure again. | A warning that bees live in a hive (1 faces a wall: turn it round). Put it back facing in and measure again: it goes. |
| 8 | Turn breeding on with the Exhibit Clipboard, and run `/zoocraft:skip 600` three or four times. | A message that two of them are expecting a young bee, and then that it's born: small, with the grown one's look, flying with them. |
| 9 | `/zoocraft:skip 600` twice more. | A message that it's all grown up, and it's full size. With four bees the clipboard now asks for a second hive ("Hives: 1 of 2"): place another Beehive facing in and measure again. |
| 10 | In Survival, hit a zoo bee. | Nothing: it can't be hurt, and it stays calm (on the test server it went on gathering nectar). |
| 11 | Wait until the hive is full (the clipboard says "honey 5 of 5"), then in Survival use shears on it with no campfire under it. | Honeycomb drops and the honey goes to 0. The bees come out angry and each stings you once (a heart or so on the test server), then loses its stinger (gone from its look) and calms down. It doesn't die, as the game's bees do: it lives on, goes back to its flowers and hive, and never stings again (shear the hive again when it's full: nobody is stung). With a campfire under the hive they come out calm. |
| 12 | In Survival, find wild bees, and with a Nectar Ration in your inventory use an empty Small Carrier on one. Use the carrier on the floor of the Bee Garden. | It goes into the carrier and comes out a zoo bee in the garden. |
| 13 | Let a zoo bee go back to the wild (Conservation, far from the park). | It comes out as the game's own bee, grown. |
| 14 | Open the Field Journal's Bee page after spotting one. | Its care notes: A garden, Flowers, Hives, Honey, Company, Breeding, and Catching with a Nectar Ration. Tasks: spot one, watch one gather nectar in a flower, spot one carrying nectar home. |
