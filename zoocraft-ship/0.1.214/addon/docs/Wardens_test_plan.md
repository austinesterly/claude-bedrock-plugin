# Wardens: test plan (0.1.214)

The game's warden as a zoo mob in a Mob House pen, caught and kept the zombie's way. It looks and sounds like the game's
own (the same model, skin, glowing heart and spots, animations, heartbeat and footsteps). In the zoo a warden never
roars, strikes or fires a sonic boom, puts Darkness on no one, never sniffs anyone out, and never digs back into the
ground. Blind, as the game's, it looks about but never turns to look at you. It never despawns.

In the wild wardens come only from the deep dark, deep underground (most in ancient cities): one digs up out of the ground
when sculk shriekers have been set off four times near you, and digs back down after a minute without hearing anything.
It is blind but finds you by sound and smell, hits for half your health and more, fires sonic booms through walls and
shields, and puts Darkness on you. In Creative a spawn egg makes one (and a warden doesn't hear Creative players).

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed: keep your eyes
on it for a few seconds; a zoo one counts). Weaken it to a quarter of its health or less (125 of 500), look at it up
close and use a Passivity Serum. It sparkles green, calms down and stands dazed for a moment. Then, with a Meat Ration
in your inventory, use an empty Mob Cage on it, and use the cage on the floor inside its pen. A calmed one also follows
you while you hold a Meat Ration.

What they want (a pen beside a Mob House, a roof over it, at least 5 by 5 of floor for the first and 10 more blocks
each, 3 blocks of headroom):
- The deep dark's floor (sculk, deepslate, cobbled or polished deepslate, deepslate bricks or deepslate tiles) under
  half the floor or more. Without it comfort can't rise above 55, and the Exhibit Clipboard says why.
- The dark: no daylight in the pen and nothing brighter than light 7 (tinted glass to the hall, Nocturnal Lamps for the
  guests to see them by).
- Meat Rations in a Basic Feeder; a Water Trough.
- One is happy alone; two share a pen well. Wardens keep a pen to themselves.

They are never bred (the game's have no young): catch more.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a warden. On the test server nothing from the add-on in any run (only the bench's own lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk into the new Mob House. | Wardens: sculk with a deepslate tiles patch behind tinted glass, dark, two Nocturnal Lamps, two wardens, a Basic Feeder and a Hanging Food Basket of Meat Rations, and a Water Trough; no warnings on the Exhibit Clipboard. On the test server: ready, beside a working Mob House and shut in all round, the floor 99%, "Dark: yes" (light 4 at most on the floor, no daylight), no warnings. |
| 3 | Watch them from the hall. **Please check this one: the test server draws nothing and plays no sound.** | Like the game's own: a huge dark-teal figure with glowing cyan spots, a heart in its chest that pulses (about every 2 seconds, the game's calm beat) with a thump you can hear, and two tendrils on its head; heavy footsteps; now and then the game's warden growl. It never roars, sniffs, or opens its chest to fire a sonic boom. |
| 4 | Watch them for two minutes. | They lumber about the pen and never leave it, and they don't dig into the ground (the game's dig down after a minute of quiet). On the test server: 1,200 readings each over two minutes, all inside the pen; they crossed 6 to 10 blocks of the pen and walked about 28 to 38 blocks each. |
| 5 | Stand in the hall beside them for a while in Survival. | No Darkness on you. On the test server: none in 20 seconds beside the pair (while a wild warden 18 blocks away put Darkness on the test player within 8 seconds). |
| 6 | Open their Field Journal page and keep your eyes on one through the glass for a few seconds. | Spot one, see one calmed. A zoo one counts. On the test server the page filled from the hall. |
| 7 | Turn breeding on for the pen. | "This species doesn't breed in the zoo yet." On the test server: exactly that. After a park day their comfort rose from 71 to 90 with no care needed. |
| 8 | Without Mob Taming research, use a Passivity Serum on a weak one. | It asks for Mob Taming research first. |
| 9 | Use the serum on a warden at full health, and at 125.5 of 500. | "It shakes the serum off. Weaken it first (a quarter of its health or less, 125 of 500): wardens hit for half your health and more and fire sonic booms through walls and shields; they are blind, but find you by sound and smell." On the test server: exactly that, at 500 and at 125.5. |
| 10 | Weaken a warden to 125 of 500 and use the serum. | "The warden sparkles green and calms down. It never attacks now (it never roars, strikes or fires a sonic boom, puts Darkness on no one, and never digs back into the ground). Bring it to a pen in a Mob House: a Mob Cage carries it (with a Meat Ration in your inventory), or lead it holding one." It stands dazed for a moment. On the test server: exactly that, slowed for its daze, then free to move. |
| 11 | Stand beside the calmed one in Survival. | No Darkness on you. On the test server: none in 20 seconds 4 blocks from it. |
| 12 | Use an empty Mob Cage on the calmed warden before you've watched one, then watch it, then use the cage with a Bone Ration, then with a Meat Ration, and put it in the Wardens pen. | First "You don't know wardens well enough to move one safely yet. Field Journal: spot one, wild or in a zoo; see one calmed with a passivity serum (or one in a zoo). Look at one for a few seconds to fill it in." With a Bone Ration: "You need a Meat Ration in your inventory to coax it in." With a Meat Ration: "<name> the Warden hopped into the carrier." Then "<name> is now living in Wardens!". On the test server: exactly those ("Sculkie the Warden hopped into the carrier", "Sculkie is now living in Wardens!"). |
| 13 | Hold a Meat Ration about 8 blocks from a calmed warden. | It walks over to you. On the test server: it came from 8.0 to 2.1 blocks within 3 seconds and stopped there. |
| 14 | In Survival, deep underground, set off a deep dark's sculk shrieker four times (step on it, or make a noise near a sculk sensor beside it), then calm the warden that digs up. | It shrieks; a warden digs up out of the ground beside it a few seconds after the fourth time. Weakened to 125 of 500, the serum calms it like any other. On the test server (a shrieker set to summon, as a deep dark's own, with a sculk sensor 3 blocks from it): the test player's jumps set the sensor off each time, and the shrieker was shrieking a second after the second, third and fourth; a warden came up beside the shrieker about 5 seconds after the fourth, with mob spawning off; a fifth jump brought no second warden while that one stood there; weakened to 125, the serum calmed it. Walking over the shrieker never set it off on the test server (inferred: the test player's footsteps don't count as stepping on it). |
