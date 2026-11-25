# Residents: test plan (0.1.182, 0.1.217, 0.1.220, 0.1.221, 0.1.222, 0.1.223, 0.1.224, 0.1.225, 0.1.226, 0.1.228, 0.1.229, 0.1.230, 0.1.231, 0.1.232, 0.1.233, 0.1.243, 0.1.244, 0.1.245, 0.1.246, 0.1.247, 0.1.248, 0.1.249, 0.1.250, 0.1.254, 0.1.255, 0.1.256, 0.1.257, 0.1.258, 0.1.259, 0.1.260, 0.1.261, 0.1.262, 0.1.263, 0.1.264, 0.1.265, 0.1.267, 0.1.268, 0.1.269, 0.1.270, 0.1.271, 0.1.272, 0.1.273, 0.1.274, 0.1.275, 0.1.276, 0.1.277, 0.1.278, 0.1.279, 0.1.280, 0.1.281, 0.1.282, 0.1.283, 0.1.284, 0.1.285, 0.1.286)

Named people who live in houses you build and walk to your zoo every day (module 6c, idea 15). This first version has
four stand-in residents while Austin's own list of residents was on its way (0.1.220 has his ten, below): Rosie Fernwood (a gardener), Captain
Brindle (a retired sailor), Pip Hollow (a kid) and Dr. Amara Vale (an explorer). Each has their own look, a short bio,
likes and dislikes, and things to say.

How a home works:
- Build a house: a closed room with at least 3 x 3 x 3 blocks of open space inside, not counting the bed. Walls, a
  floor and a roof all round (the Staff Room's rule).
- Put a bed inside and a door in one of its walls.
- Craft a Resident Mailbox at the Zoo Workshop (a chest over an oak fence) and place it inside the house, or against
  one of its outside walls. The player who places it owns the home.
- Lay a path from outside the front door to a zoo. Inside a zoo's fence, the door's path has to join the zoo's guest
  paths. Outside every fence, path blocks from the door have to reach the path by the zoo's Park Entrance Gate (up to
  4000 path blocks long). Path blocks are the ones the guests walk on: gravel, dirt path, bricks, planks and the rest.
- Use the mailbox. It says whether the home is ready and, if not, what's missing. A ready home with nobody in it
  offers three residents; pick one and they move in straight away.

Their day, by the time of day:
- Night (from 13000): in bed, lying down. Sunrise (23000): up, at home.
- Morning: each sets off at their own time between 1000 and 3000. They open their front door, step out, shut it
  behind them, walk the path to the gate and go in, paying the zoo's admission like a guest (once a day). In the zoo
  they walk the guest paths from Viewing Point to bench to snack stand, stopping a while at each.
- Evening (from 11500): back home the same way, in through the door, and to bed at nightfall.
- If the zoo is closed they stay home. If the house stops working (bed or door gone, a wall open) they go home and
  wait outside the door until it's fixed. Sleeping through the night wakes them as the morning comes.
- Far from every player they carry on without a body, and appear where they've got to when a player comes near.

New block and new entity: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name resident or resident_mailbox. |
| 2 | Open the Zoo Workshop. | A Resident Mailbox recipe: a chest over an oak fence. Craft one. It looks like a blue mailbox on a wooden post with a red flag. |
| 3 | In a zoo world (`/zoocraft:build` in a new flat Creative world is quickest), build a small stone house a few blocks outside the Park Entrance Gate: 4 wide, 3 deep, 3 high inside. Put a bed and a door in it. Place the mailbox inside. | A chat line: Resident Mailbox placed, and what a home needs. |
| 4 | Use the mailbox before laying a path. | The mailbox says no path leads from the front door to a zoo. The checklist shows the house, the bed and the door ticked, the path not. |
| 5 | Lay gravel (or any path block) from outside the front door to the path by the gate. Use the mailbox again (or press Check the home again, wait a moment, and use it again). | "This home is ready", and the path goes to your zoo. Three residents to pick from, each with a line about them. |
| 6 | Pick one and press Invite. | They appear at the front door outside, open it, walk in, shut it, and stand inside. Their name shows over their head. The mailbox now says who lives here and what they're doing. |
| 7 | Talk to them (use them). | Their page: something they say, their bio, where they live, what they're doing now, their likes and dislikes. |
| 8 | `/time set 1000` and wait a minute or two (or `/time set 3500`). | They open the door, step out, shut it, walk the path to the gate and in. The zoo's guests today go up by one and its takings by the admission price. In the zoo they walk the paths to a Viewing Point or bench and stop a while, then on to another. |
| 9 | Walk far away (over 64 blocks) and come back. | They're further along than when you left. |
| 10 | `/time set 11500`. | They walk back to the gate, out along the path, in at the door (it opens and shuts) and stand inside. |
| 11 | `/time set 13000`. | They walk to the bed and lie down on it, head on the pillow. |
| 12 | `/time set 0` (or sleep the night through). | They get up. |
| 13 | While they're out at the zoo, break the bed. | The mailbox says the house has no bed. They come home and wait outside the door. Put a bed back: they go in. |
| 14 | Close the zoo (Park menu) in the morning. | They stay at home. |
| 15 | Ask them to move out from the mailbox (only the player who placed it can). | They're gone, and the mailbox offers residents again. |
| 16 | Break the mailbox. | The home and its resident are gone. |
| 17 | Place a second mailbox in the same house. | It says another home already uses the house's bed: each home needs its own bed. |
| 18 | Build a house inside the zoo's fence with its door on the zoo's paths. | Its resident goes straight onto the zoo's paths from the door and pays as they step out. |

## 0.1.217: likes, dislikes and moods

What each resident likes and dislikes now steers their day and how they feel (research/npc_plan.md section 9). The
four stand-ins are the same people; Austin's own list of residents can change any of the numbers here.

What they notice, once a day each:
- On the way in at the gate: Path Lamps or Planters along half the paths or more, litter on the paths (20 or more) or
  clean paths (5 or less), a busy park (60 guests a day or more) or a quiet one (10 or fewer), and the admission
  against what guests think is fair (a high price, or a bargain).
- At each Viewing Point they stop at, its animals by kind: big cats, birds, reptiles, fish, Nether animals, End
  animals, mythical animals, boss animals, Mob House mobs, farm animals. At each bench, Snack Stand (with food in it),
  restroom or fountain they stop at, that.

Their mood: every visit starts at 3 of 5 hearts. Each like they come across adds a heart, each dislike takes one away
(0 to 5): miserable, unhappy, a bit glum, fine, happy, delighted. A day they stay home keeps the mood they had.
- Liked exhibits and amenities are picked 3 times as often on their walk round; disliked ones a third as often.
- Heading home in the evening, at 4 hearts they put 5 coins in the Donation Boxes and at 5 hearts 10 (a generous
  resident twice that), once a day, if the park has a working Donation Box near a Viewing Point.
- Each heart over 3 among the park's residents adds a point to the park rating's score (out of 100: 10 points are half
  a star), 5 points at most. Unhappy residents don't take it down; they just don't tip, and say why.
- Talked to after a visit, now and then they say what pleased or bothered them that day (a chatty one more often).
- New in the data: what each resident is known for. Rosie Fernwood is an early riser (off to the zoo between 200 and
  1000, before the others), Captain Brindle is chatty, Dr. Amara Vale is generous.

No new blocks or entities: a world reload is enough (a full restart is fine too). Works in any world.

On the test server (BDS 1.26.62.1, plains flat worlds, runs R and R2): the test zoo (flamingos, cod, ember foxes and
chorus deer), two stone houses south of the Park Entrance Gate (5 by 3 by 5 inside, a bed, a door, a Resident Mailbox,
a gravel path to the gate), Rosie Fernwood (likes planters and birds, dislikes litter) and Dr. Amara Vale (likes Nether
and End animals, dislikes crowds) moved in, their days run by the clock.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log (Settings, Creator). | No errors or warnings from the add-on. On the test server nothing from the add-on in either run. |
| 2 | Build a home and pick a resident (rows 3 to 6 above). Talk to them before they've been to the zoo. **Please check the pages: the test server can't open menus.** | Their page now has "Mood: fine (3 of 5 hearts)", "No visit to the zoo yet." and, for Rosie, "Known for being: an early riser". On the test server both homes were ready (the bed, the door, a way of 4 path points to the gate) and both moved in at 3 hearts. |
| 3 | Let a night pass and watch them set off in the morning. | Rosie leaves first, by 1000; the others between 1000 and 3000. On the test server, on the second day at 500, Rosie (her time 415) was off while Dr. Vale (her time 1120) was still at home; Dr. Vale set off at 1200. |
| 4 | Follow them round the zoo. | Each exhibit with animals they like makes them happier (once a day each). On the test server Rosie went to 4 hearts at the flamingos (birds); Dr. Vale to 4 at the chorus deer (End) and 5 at the ember foxes (Nether). |
| 5 | Talk to one after they've been to a liked exhibit. | Their page: "Mood: happy (4 of 5 hearts)" and "Today: pleased by birds". Now and then (about one time in three) they talk about it: "The birds were singing their hearts out today." On the test server exactly those words; Dr. Vale: "delighted (5 of 5 hearts)", "pleased by End animals and Nether animals", "The End animals behaved just as my notes say." |
| 6 | In the evening, after they've gone home, open the Park Ledger's Finances. | "Dr. Amara Vale gave 20 coins at the Donation Boxes" (5 hearts, generous) and "Rosie Fernwood gave 5 coins at the Donation Boxes" (4 hearts), once a day each. On the test server exactly those two, as they left the zoo. |
| 7 | Open the Park Ledger. | "Residents: 2 living by the park, adding 3 to the rating's score" and a Residents (2) button: each with their mood word and what they're doing; picking one opens their page. On the test server the rating's score went from 88 to 93 with the residents adding 3 (Dr. Vale 2, Rosie 1). |
| 8 | Let litter pile up on the paths (don't empty the bins or sweep), and watch Rosie come in next morning. | She's bothered by it at the gate: a heart down. Her page: "Today: pleased by birds; bothered by litter", and now and then "Litter everywhere today. It made me so cross." At 3 hearts she doesn't tip. On the test server, with 30 litter on the paths: 2 hearts at the gate, 3 after the flamingos, exactly those words, no tip from her (Dr. Vale's 20 came in), and the residents adding 2. |
| 9 | Sweep the paths and watch the next day. | Each day starts again at 3 hearts. On the test server, the next day with the paths swept, Rosie started again at 3 at the gate and went to 4 at the flamingos; Dr. Vale kept the day before's 5 while she was at home, and started again at 3 when she came in. |
| 10 | Make them unhappy (for Dr. Vale a busy park, for Captain Brindle a high admission) and talk to them. | Their mood drops and they say what bothered them. Their everyday lines no longer say "today" ("Crowds make it hard to take proper notes." in place of "Far too many people about today."). On the test server the tests check every resident's lines; a busy park and a high price only in the tests. |
| 11 | At night. | Home and asleep in their beds, as before. On the test server both asleep in their beds at 13500 each night. |

## 0.1.220: Austin's residents (his spec, stage A)

Austin's ten residents replace the four stand-ins (his spec: research/ZooCraft_Tycoon_Custom_NPC_Spec.md; the plan:
research/npc_spec_plan.md). Their names, unlock goals, likes, dislikes and attributes are kept in his own words; what
he hasn't decided yet (Austin's and Zach's dislikes, every job but Dave's) is left out.

| Resident | Moves in once the zoo has |
|---|---|
| Austin | 2 different species on display |
| Zach | 3 different species on display |
| Sheila | 7 animals on display |
| Carrot | 4 rabbits on display |
| Ron | 5 different species on display |
| Jared | 7 different species on display |
| Amanda | 4 giant pandas on display |
| Paola | 2 young animals on display at once |
| Dave | 2 different cave animals on display (bat, axolotl, glow squid, cave spider, silverfish, warden, Lush Okapi, Earth Molebear, Skulker) |
| Teddy | 10 exhibits with animals in them |

What's new:
- "On display" means a zoo animal living in an exhibit that works, in any park of the world (the Mob House's pens are
  exhibits too). Wild mobs and animals in crates or holding don't count; a school of fish counts its fish.
- Once a resident's goal is met they're unlocked for good, even if the animals go later, and everyone in the world is
  told: "Sheila can move in now! (7 animals on display.) Give them a home: ...".
- The Resident Mailbox is the home's anchor and now has **Move-in ON / OFF** (only whoever placed it can switch it).
  A new mailbox starts ON. Turning it off never makes anyone move out.
- With Move-in ON, a home that's ready (the room, the bed, the door, the path to the zoo) and empty gets the first
  unlocked resident who has no home, by day only (sunrise to late afternoon), one at a time. Its owner can still pick
  any of those waiting from the mailbox instead. The mailbox only offers unlocked residents.
- With nobody unlocked yet, the mailbox shows the three goals nearest to done; the Park Ledger's Residents button is
  always there and lists everyone still to move in, with how far the zoo is towards each goal.
- The four stand-ins (Rosie Fernwood, Captain Brindle, Pip Hollow, Dr. Amara Vale) move out of an older world when it
  loads, and their homes are free for Austin's residents.
- Nothing hurts a resident (as before). If a body is killed anyway (`/kill`), they're back home at once, as a player
  comes back at their bed: asleep in it at night, up beside it by day, with nothing about them changed.
- Ten looks. Austin's is drawn from his own character; Sheila, Carrot, Ron, Dave and Teddy from the spec's words;
  Zach, Jared, Amanda and Paola have a plain look until Austin's pictures come. Preview:
  previews/residents/residents_0220.png (shared folder).
- New in their page: what they like and don't like, and what they're known for, in Austin's words; Dave's job
  (miner; work comes in a later version). Sheila is Talkative, so she talks about her day more often.

Six new skin files: quit Minecraft completely and start it again.

On the test server (BDS 1.26.62.1, plains flat worlds, runs A and B): the test zoo with rabbits (4), flamingos (10),
cod (a school of 12), bats (3) and axolotls (2); stone houses south of the Park Entrance Gate (5 by 3 by 5 inside, a
bed, a door, a Resident Mailbox, a gravel path to the gate).

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log (Settings, Creator). | No errors or warnings from the add-on. On the test server nothing from the add-on in either run. |
| 2 | Open a world where stand-ins lived. | They've moved out; their mailboxes say nobody lives there yet. On the test server a stand-in's record in a home was gone at start-up, and with Move-in ON the first resident waiting moved in 2 seconds later. |
| 3 | In a new world, build a zoo bit by bit and watch the chat. | A message as each resident's goal is met. On the test server, while the zoo was built: Sheila first (the flamingos made 7 animals), then Austin, Zach, Carrot, Ron and Dave (bats and axolotls); Jared stayed at 5 of 7, Teddy 5 of 10, Amanda 0 of 4, Paola 0 of 2. |
| 4 | Open the Park Ledger's Residents. **Please check the menus: the test server can't open them.** | Everyone not living anywhere yet: "Sheila: can move in. They need an empty home with its Resident Mailbox set to Move-in ON." or "Jared: 7 different species on display (5 of 7)". |
| 5 | Build a house, path it to the zoo and place a Resident Mailbox in it, by day. | "Resident Mailbox placed (Move-in ON)." Once the house checks out, the first unlocked resident moves in by themselves: "Sheila has moved into the house at x, y, z!" On the test server 2.5 seconds after the mailbox. |
| 6 | Use a mailbox (yours). **Please check.** | "Move-in: ON" with a button to turn it OFF. In an empty ready home, who can move in, or the three goals nearest to done. Someone else's mailbox has no switch. |
| 7 | Build a second house and turn its Move-in OFF straight away. | Nobody moves in by themselves; picking from the mailbox still works, and it only offers unlocked residents. On the test server nobody moved in while it was OFF; it offered Carrot, Zach and Austin. |
| 8 | Turn it ON at night. | Nobody arrives till morning. On the test server, ON at 18000: nobody; at 1000 Austin moved in within 5 seconds. |
| 9 | Talk to a resident. **Please check.** | "Likes:", "Doesn't like:" and "Known for being:" in Austin's words; for Dave "Job: miner". Austin and Zach: "Doesn't like: not known yet". |
| 10 | Look at each resident. **Please check: the test server draws nothing.** | Austin like his character (light brown hair, charcoal hoodie, blue shorts, white socks and trainers); Sheila gray-haired in a lavender cardigan; Carrot in a gray bunny suit (the ears down the back); Ron white-haired, smiling; Dave ginger in overalls and a yellow hard hat; Teddy in a dark suit with a moustache and glasses. |
| 11 | `/kill` a resident by day, then one at night. | By day they're straight back home beside their bed; at night asleep in it. One of them each time. On the test server: killed at the zoo by day, back by the bed; killed in bed at night, asleep in bed; one body both times. |
| 12 | Lose the animals that met someone's goal. | They stay unlocked. On the test server all the rabbits killed: Carrot still unlocked (0 of 4). |

## 0.1.221: jobs, shifts and better looks

Austin gave each resident a job and left who works by day or by night to us:

| Resident | Job | Works |
|---|---|---|
| Austin | zoo influencer | days |
| Zach | singer | nights |
| Sheila | retired | - |
| Carrot | bunny rehabilitator | days (she dislikes darkness) |
| Ron | farmer | days |
| Jared | singer | nights |
| Amanda | geologist | days |
| Paola | tree chopper | days |
| Dave | miner | nights (he dislikes sunlight) |
| Teddy | mayor | days |

What's new:
- Their page and the mailbox's offer show the job ("Job: singer (works nights)", "Job: retired"), and each bio says it.
  The shifts don't change their day yet: night routines come in stage B.
- Zach redrawn after the singer Austin named (a dark knit cap, a full bushy dark beard, an olive flannel shirt, jeans,
  boots); Jared after the other singer he named (short black dreadlocks with a few blue tips, an oversized gray hoodie
  with the hood down, a silver chain and pendant, light ripped jeans, white trainers).
- Dressed for their jobs: Ron's straw hat and green flannel; Amanda's khaki field vest over a white T-shirt, cargo
  trousers and hiking boots; Paola's red and black buffalo-check flannel and work boots; Teddy's gold mayor's sash.
  Preview: previews/residents/residents_0221.png (shared folder).

Changed skin files: quit Minecraft completely and start it again.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log. | No errors or warnings from the add-on. On the test server nothing from the add-on (run B again on 0.1.221: the same unlocks, move-in and comeback as 0.1.220). |
| 2 | Look at Zach and Jared. **Please check: the test server draws nothing.** | Zach in his knit cap with a full dark beard; Jared with short dreadlocks (blue tips at the back), a gray hoodie and a chain. |
| 3 | Look at Ron, Amanda, Paola and Teddy. **Please check.** | Ron's straw hat, Amanda's field vest, Paola's red and black check flannel, Teddy's gold sash. |
| 4 | Talk to a resident, or open a mailbox's offer. **Please check.** | "Job: singer (works nights)" for Zach and Jared, "Job: retired" for Sheila, "Job: mayor (works days)" for Teddy, and so on. |

## 0.1.222: their own days, the weather, favourites and home comfort (stage B)

What's new (every default is in research/npc_spec_plan.md section 6, for Austin to change):
- Night workers (Zach, Jared, Dave) sleep from mid-morning to mid-afternoon, set off for the zoo at dusk and come home
  at midnight. Everyone else keeps the day routine.
- Each resident has their own visit days: Austin, Sheila, Carrot and Teddy every day, Ron, Jared, Amanda and Dave
  most days, Zach and Paola some days. A happy last visit or a comfortable home makes a visit a little more likely.
- Rain and storms: each has their own way (Austin goes in anything; Paola and Dave stay in when it rains; most stay in
  during a storm; some sometimes stay in). Kept in by rain, they set off when it stops; caught out, they head home early.
- Favourite exhibits first, and watched half as long again: Sheila cats, Carrot rabbits, Ron animals that fly, Jared
  crocodiles and pufferfish, Amanda pandas, Paola baby animals, Dave cave animals.
- Sheila walks slowly.
- On the way in: the dark (after dark with few Path Lamps; Carrot dislikes it), bright sunshine (a clear day; Dave
  dislikes it) and a long walk (64 blocks or more of path from home; Paola dislikes it).
- Home comfort out of 10 on the mailbox (room, light, windows, different furnishings), and what would make it cosier.
  A resident gets a point more for something they'd love in it (music, a kitchen, a fireplace, books). Comfortable,
  nice and grand homes bring them more often and tip more; nice and grand ones start each visit a heart up.
- Their page shows their zoo visits, rain and storms, favourite exhibits and their home's comfort for them, and why
  they're at home when they'd be out.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log. | No errors or warnings from the add-on. On the test server nothing from the add-on (run C). |
| 2 | Use the mailbox of a plain house, then add a torch, a lantern, two glass blocks, a chest, a bookshelf, a furnace and a campfire, and use it again. | "Comfort: Basic (1 of 10)" with "Cosier with more room inside, a light, windows and different furnishings", then "Comfort: Nice". On the test server: 1 of 10, then 8 of 10 (room 1, light 2, windows 1, furnishings 4). |
| 3 | Move Dave in and look at him at noon, then in the afternoon. | Asleep in bed at noon (he works nights), up in the afternoon. His page: "Zoo visits: most days, in the evening", "Home: Grand (9 of 10) with the fireplace Dave loves". |
| 4 | At dusk with `/weather rain` on. | Dave stays home: "at home, staying in out of the rain". Clear the weather: he sets off within a few seconds. |
| 5 | Follow him into the zoo. | His first stop is a cave animal (bats or axolotls). Each visit starts at 4 hearts (his grand home). |
| 6 | `/weather thunder` while he's at the zoo. | He heads home early. |
| 7 | Watch Sheila and Austin walk. **Please check.** | Sheila walks noticeably slower than Austin. |
| 8 | A resident out at night in a zoo with few Path Lamps. **Please check.** | Carrot comes home "bothered by the dark". |

## 0.1.223: the resident menu, friendship, gifts and Follow Me (stage C)

What's new (every default is in research/npc_spec_plan.md section 7, for Austin to change):
- Using a resident opens their menu: a word from them, your friendship with them and what they're doing, then Talk,
  Give a Gift, Follow Me (Stay Here and Stop Following while they follow you), Go Home when they're out, Friendship and
  About (their page) and Goodbye. A button that can't be used says why on it.
- Friendship is yours alone with each resident, 0 to 100: Stranger, Acquaintance (10), Friend (40), Close Friend (70),
  Best Friend (90). The first chat each day counts 3, one gift a day: liked 8, anything else 2, disliked -6. Each
  resident's attributes change those a little (Sheila's chats count 5, Paola and Teddy take a bad gift harder).
- Gifts they like and don't, from their likes: Carrot carrots, gold and diamonds but no weapons; Dave rocks, ores, fire,
  tools and weapons but no water or farming; and so on. The add-on's own items, shulker boxes and bundles are never
  offered.
- A Friend or closer visits the zoo a little more often and tips a little more.
- Follow Me (from Friend, in their free time): they walk where you walked, open wooden doors and shut them behind them,
  never open fence gates or iron doors, never break or place a block, and wait at anything they can't walk (a jump
  across a gap, a climb, a long drop, water, riding, flying, a teleport, another dimension). Left behind, they wait,
  and carry on when you come back. Stop Following and Go Home walk them back the way they came. Bedtime sends them home.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log. | No errors or warnings from the add-on. On the test server nothing from the add-on (runs D and E). |
| 2 | Use a resident you haven't met. | Their menu: "Friendship: Stranger, 0 of 100 (Acquaintance at 10)", and "Follow Me / Locked: Friend at 40 (you have 0)". |
| 3 | Talk, then Talk again. | The first time they introduce themselves and "+3 friendship" (Austin +4). The second counts nothing more today. |
| 4 | Hold a carrot and give Carrot a gift, then try a diamond sword the same day. | "A CARROT! For me?!" and +8. The sword is turned down (one gift a day) and stays in your hand; Give a Gift reads "Already had one from you today". No ZooCraft item is in the gift list. |
| 5 | The next day, give Carrot the diamond sword. | She doesn't like it (a weapon, even though she likes diamonds): -6. Her page lists "Gifts they liked from you: carrots" and "Gifts they didn't like: weapons". |
| 6 | Reach Friend (40) with Austin. **Please check.** | "You and Austin are now Friends! Austin will follow you now, in their free time (Follow Me)." Follow Me opens. |
| 7 | Follow Me at his home, walk out of the front door and along the path. **Please check.** | He walks your footsteps a couple of blocks behind. If he opened the door he shuts it behind him. On the test server he walked 34 footsteps out and the door ended shut. |
| 8 | Jump and sprint-jump along as you walk. | He keeps following: a jump doesn't count as a gap. On the test server (run E) twelve sprint-jumps along the path left no gap and he kept up. |
| 9 | Climb onto a wall 3 blocks high and walk off along it. | He waits at the foot of it. After about 10 seconds with you over 16 blocks away he stays there. Come back beside him: "There you are!" and he follows again. |
| 10 | Stay Here, walk away and come back; Follow Me, then Stop Following. | He waits on the spot (not following you back by himself); Follow Me again; Stop Following walks him back the way he came and in at his door, shut behind him. |
| 11 | At the zoo, use Go Home on a visiting resident; another day Follow Me there, walk a bit, then Go Home. | Home by the path. The second time he first walks back to where he joined you, then home. |
| 12 | Follow Me in the evening and stay out until bedtime. | He says it's late ("Bedtime for this legend. See ya, mate!"), walks back the way he came, in at the door (shut behind him) and goes to bed. Then Talk, Give a Gift and Follow Me read "They're asleep". |
| 13 | Follow Me, then go to the Nether and come back. | He waits where he was; when you're back beside him: "You came back!" (Carrot) and he follows again. |
| 14 | Leave the world while someone follows you and open it again. | Everyone is back at home; the friendship is kept. |

## 0.1.224: work at a Work Anchor, Dave's mine and skill levels (stage D)

What's new (every default is in research/npc_spec_plan.md section 8, for Austin to change):
- The Work Anchor, a new block made at the Zoo Workshop (a stone pickaxe over a crafting table over planks). Put it on
  the floor of a work site and use it: it lists what the site needs with a tick or a cross, what to fix first, the ores
  in reach, who works there with their skill and shift, and Choose a worker, Let them go and Check the site again.
- A work site is outside every zoo's fence in the Overworld, fenced all round two high (fences, walls or blocks, up to
  16 blocks from the anchor), at least 9 blocks of floor, a shut fence gate in its fence and a chest or barrel beside
  the anchor. The worker needs a home outside the zoo with path blocks from their door to the gate.
- Only Dave has work in this build. He works nights, midnight (after his zoo visit) to dawn: he walks his path, opens
  the gate, comes in and shuts it, and mines the ores within his reach of the floor with a pick's swing. Each ore goes
  in the chest and its stone is left in its place; nothing else is ever broken or placed. A mined ore grows back in its
  stone 3 days later.
- Apprentice (from the start) mines coal, copper and iron; Skilled (10 good shifts) adds gold, redstone, lapis, Nether
  quartz and Nether gold; Expert (30) adds diamonds, emeralds and ancient debris. A good shift is 3 ores or more, and
  makes his next zoo visit a heart happier.
- If the site stops working while he's there he waits; put right, he carries on. Follow Me is locked while he works.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log. | No errors or warnings from the add-on. On the test server nothing from the add-on (run F). |
| 2 | Open the Zoo Workshop's recipes. | A Work Anchor: a stone pickaxe over a crafting table over planks. It looks like planks with a pickaxe on them. |
| 3 | Place it on open ground outside the zoo and use it. | A checklist with crosses. The first to fix: "It isn't fenced in all round: there's a way out at x y z ...". |
| 4 | Place one inside the zoo's fence and use it. | "This is inside a zoo's fence. Jobs are outside the zoo ...". |
| 5 | Dig a pit or build stone walls three high round a floor (9 blocks or more) east of Dave's house. Put a fence gate in one wall, the anchor on the floor and a chest beside it. Put a few coal, iron and copper ores in the walls, a gold ore and a diamond ore too, and an emerald ore outside the wall. | The anchor ticks off the fence, the floor, the gate and the chest. "Ores in reach" counts the ores in the walls (not the emerald outside). "Nobody works here yet. Choose a worker." |
| 6 | Press Choose a worker. | Only Dave is listed (the only one with work). With no path to the gate: "There's no path from Dave's front door to the gate ...". |
| 7 | Lay path blocks from his door to the gate, then Check the site again. | Within a few seconds every line is ticked: "Ready for work.", Dave the worker, Apprentice, nights. |
| 8 | At midnight (after his zoo visit), watch his house. If he's following you, he says "Shift's starting, mate ..." and goes. | He comes out, shuts his door, walks the path, opens the gate, comes in and shuts it. |
| 9 | Watch him in the mine. | He walks to an ore and swings his arm at it for 8 seconds; it turns to stone with a dig sound and the ore is in the chest. He mines the coal, iron and copper, never the gold or the diamond (Apprentice), and never the emerald outside. No wall, floor or gate block is ever broken. |
| 10 | Use him while he works. | Follow Me reads "Not while they're working". His page shows the mine, Apprentice and this shift's ores. |
| 11 | Break a wall block while he works. | He stops and waits ("at work, waiting: the mine needs fixing"); the anchor names the hole. Put it back: he carries on. |
| 12 | When nothing is left that he can mine, or at dawn. | He walks to the gate, through it, shuts it, home along the path and in, door shut. With 3 ores or more the anchor says "(a good shift)" and his page says a good shift adds a heart to his next visit. |
| 13 | Three days later, look at the stone he left. | The ores have grown back. Where you put another block in place of the stone, your block stays. |
| 14 | Fill the chest, then wait for his shift. | He stops: "the chest was full: empty it to make room". Nothing is dropped or lost. |
| 15 | After 10 good shifts. | He's Skilled: the gold is mined too (6 seconds an ore). |
| 16 | Press Let Dave go and confirm, or break the anchor. | He no longer goes to work (the anchor drops itself when broken). |

## 0.1.225: Paola's woodlot and Ron's field (work for the tree chopper and the farmer)

What's new (every default is in research/npc_spec_plan.md section 9, for Austin to change):
- Paola (tree chopper) works a woodlot and Ron (farmer) a field, each at a Work Anchor site as Dave's mine is: outside
  every zoo's fence, fenced all round, a shut fence gate, a chest or barrel beside the anchor, and a path from their
  front door to the gate. Both work days, from when they leave home until noon, then go to the zoo.
- Paola cuts only trees that grew in the woodlot from a sapling (one seen there since the anchor was placed, or one a
  player or she planted), whole, and only when every log is inside the fence and nothing built touches the trunk.
  The logs go in the chest and the stump is replanted with a sapling from the chest. The leaves fall as they do in the
  wild. Apprentice: one-trunk trees (oak, birch, spruce, jungle, acacia, cherry). Skilled (10 good shifts): she also
  plants the chest's saplings on bare ground and picks up the saplings, sticks and apples that fall. Expert (30):
  four-trunk trees too (dark oak, and giant spruce and jungle).
- Ron harvests only ripe wheat, carrots, potatoes and beetroot into the chest, replanting each one at once (the crop
  goes back to a seedling: nothing is broken). Skilled: he sows bare farmland from the chest's seeds. Expert: a bigger
  harvest. The farmland and its water are never touched.
- The Work Anchor shows each kind's own lines: the trees ready to cut, saplings growing and in the chest, and why any
  grown tree is left alone (with where the first one is); or the ripe and growing crops, bare farmland and seeds.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log. | No errors or warnings from the add-on. On the test server nothing from the add-on (runs W, R and T2). |
| 2 | Fence in a patch of grass east of Paola's house (about 11 by 11), with a fence gate. Put the Work Anchor on the grass and a chest beside it with a few oak saplings and 4 dark oak saplings. Lay path blocks from her door to the gate. Plant an oak, a birch and a spruce sapling and 4 dark oak saplings in a square, well inside the fence. | The anchor ticks every line once Paola is chosen ("Choose a worker" lists whoever lives here with work: Dave, Paola and Ron). "Saplings growing: 7, in the chest: 3 (for the stumps; a Skilled tree chopper plants the rest)". Paola Apprentice, mornings. |
| 3 | Let the saplings grow (bone meal is fine), then use the anchor. | "Trees grown here, ready to cut: 4 (1 with four trunks: for an Expert)". |
| 4 | Watch at her leaving time. | "Shift's starting. Trees don't cut themselves. Bye." if she's following you. She walks the path, opens the gate, comes in and shuts it. She stands by a trunk (or up to 3 blocks off, when a spruce's low leaves fill the ground round it) and swings at it, and the whole tree goes at once with a wood sound: its logs in the chest, a sapling from the chest in the stump (its own kind if the chest has one, else any). The dark oak is left (Apprentice). |
| 5 | Watch the leaves. | They fall over the next while, as they do in the wild, dropping saplings, sticks and apples. Nothing else is broken: not the fence, the gate, the grass or anything of yours. |
| 6 | Build a "tree" yourself in the woodlot: a sapling, then once it's grown, swap it for logs under leaves you place. Or plant a tree right by the fence. | Neither is cut. The anchor says why: "1 has leaves someone placed (a build, not a tree)", "1 reaches past the fence", and where the first is. |
| 7 | Plant a sapling yourself in the woodlot. | It counts as one of hers: once grown, she cuts it. |
| 8 | Use her while she works. | Follow Me reads "Not while they're working". Her page shows the woodlot, Apprentice and this shift's trees. |
| 9 | After 10 good shifts (2 trees or more each), with saplings in the chest and bare grass. | Skilled: she plants saplings on bare ground (two or more blocks from any trunk, sapling or the fence), and picks up the saplings, sticks and apples on the floor into the chest. |
| 10 | After 30 good shifts. | Expert: the dark oak is cut too (all its logs), and its stump replanted with 4 dark oak saplings from the chest. |
| 11 | Fence in farmland east of Ron's house, with water beside it, a gate, the anchor on a grass or dirt block, a chest with wheat seeds beside it, and his path. Plant wheat, carrots, potatoes and beetroot, some ripe, some growing, and leave some farmland bare. | The anchor ticks every line with Ron chosen. "Ripe crops: N, growing: M", "Bare farmland: K, seeds in the chest: 10". Ron Apprentice, mornings. |
| 12 | Watch at his leaving time. | "Fields need tending, friend. I'll catch up with you later." He walks to the field, through the gate, and goes along the rows. Each ripe crop goes back to a seedling with a crop sound and its harvest is in the chest (one of its seeds kept back to replant it). Growing crops and bare farmland are left (Apprentice). |
| 13 | Look at the field after his shift. | The farmland, its water, the fence and the gate are as they were. Nothing is trampled. |
| 14 | After 10 good shifts (6 crops or more each). | Skilled: he sows bare farmland from the chest's seeds (wheat, beetroot, carrots or potatoes). Nothing is sown with no seeds in the chest. |
| 15 | Fill either chest, then wait for the shift. | They stop: "the chest was full: empty it to make room". Nothing is dropped or lost. |
| 16 | Break the anchor or press Let them go. | They no longer go to work. |

## 0.1.226: work gifts, kept for you until you talk to them (stage E)

What's new (every default is in research/npc_spec_plan.md section 10, for Austin to change):
- A resident with a job who is their Friend or closer sometimes keeps a gift from their job for you: Dave, Paola and
  Ron after a good shift at their work site (if they're fine or happier), the others with a job after a happy zoo
  visit. Sheila is retired, so she keeps none.
- They never come looking for you: it's handed over the next time you press Talk, with a line of their own. What
  doesn't fit in your inventory drops at your feet.
- One waits at a time for each player. After one is handed over, none is kept for you for 2 days.
- Friend 40% of the time, Close Friend 60%, Best Friend 80%. Higher skill and closer friendship can bring rarer things
  (an Expert miner now and then a diamond or emerald, a Close Friend singer a music disc).

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log. | No errors or warnings from the add-on. On the test server nothing from the add-on (runs G1 and G2). |
| 2 | Be friends with Ron (Friend, 40 or more: chat each day, bring wheat or things he likes). Let him work a good shift in his field (6 crops or more). | Some days afterwards his Talk button reads "Talk / They have something for you", and his page says "Work gift: they have one for you: talk to them". |
| 3 | Press Talk. | His line, such as "Good harvest this morning. I put some by for you, friend.", then "They give you 4 Bread" (or wheat, carrots, potatoes, beetroot, baked potatoes). It's in your inventory. |
| 4 | Talk again, and the next day. | No second gift: one at a time, and none kept for you for 2 days after one is handed over. |
| 5 | Fill your inventory (in survival), then claim one. | It drops at your feet ("at your feet: your inventory is full"). In creative, as in the game, a full inventory swallows it. |
| 6 | As a Stranger or an Acquaintance (under 40), let him work good shifts. | Nothing is ever kept for you. His page says gifts come "for a Friend or closer". |
| 7 | Be friends with Dave and Paola, and let them work. | Dave: coal, raw copper or raw iron (Skilled adds gold, redstone and lapis; Expert sometimes a diamond or emerald). Paola: logs, saplings or apples (Skilled adds dark oak; Expert 4 dark oak saplings). |
| 8 | Be friends with Amanda, Carrot, Zach, Jared, Austin or Teddy, and let them have a happy zoo visit (4 hearts or more: things they like in the zoo). | A job gift waits for you afterwards: amethyst or quartz from Amanda, carrots from Carrot, a note block from Zach or Jared (a music disc for a Close Friend), paper or a lead from Austin, emeralds or gold nuggets from Teddy. |
| 9 | Talk to them while they're asleep. | No gift until they're up. It stays waiting through leaving the world and opening it again. |
| 10 | Check the zoo's money after a gift. | Nothing changes: work gifts never pay the zoo. |

## 0.1.228: standing still to talk, keeping apart, Austin's hood and Carrot's ears

Austin asked (2026-11-10): "Austins hoodie is messed up on the back of his head. Also NPCs should stop when they talk to
you ... when all the people headed to the zoos, the NPCS walked inside each other without a hit box ... Carrots skin
should have bunny ears sticking up". (The talk screen he asked for in the same message is its own version.)

What's new (the numbers are ours, in balance.js `residents.talk` and `residents.space`, Austin's to change):
- While you have a resident's menu open (any page of it: Talk, Give a Gift, Follow Me, Friendship and About), they
  stand still and face you. Half a second after you close it they walk on. Their work waits too. They also walk on if
  you go more than 8 blocks off or leave the menu open for 5 minutes.
- Residents keep out of each other. They are walked by the add-on a step at a time, so the game gives them no hit box
  against each other (and a solid one would block doors and one-block paths). Instead: each walks a little to the
  right of the middle of the path, so two going opposite ways pass side by side; one coming up behind another waits
  behind them, and walks past after 4 seconds behind a slower walker or 1.5 seconds behind someone standing; two who
  step out of facing doors at once take turns onto the path; and one who finds somebody already standing where they
  were going to watch the animals from stops behind them and watches from there.
- Austin's skin: the back of his head is hair again (the hood used to be painted on it), and a small hood hangs behind
  his neck as its own piece of the model.
- Carrot's skin: two bunny ears standing up on top of the hood, gray with pink inside (the flopped ears painted on
  the hood are gone).
- The hood and the ears are new pieces of the residents' model, so this needs Minecraft closed fully and opened again.

On the test server (BDS 1.26.62.1, `/zoocraft:testsetup true`, then the time put past every day resident's leaving
time so they all set off at once; every pair of bodies measured every tick for 4 minutes): 0.1.227 had two residents
inside each other (bodies under 0.45 blocks apart) for 333 pair-ticks, and standing inside each other for 26. With this
version: 0 and 0; the nearest two came while one of them walked was 0.56 blocks. Austin, held as his menu holds him
while walking out of his door, stood still for the 8 seconds, turned to face the player, and walked on within a second
of it closing. The add-on's scripts took about 5 ms a tick, as before. Nothing from the add-on in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again, then open a `/zoocraft:testsetup true` world (or make a new one). | The world opens with no errors. |
| 2 | **Please check** (the test server draws nothing): look at Austin from behind and from the side. | Brown hair on the back of his head down to the neck, and a small hood hanging behind his neck over his hoodie. Nothing odd on the other residents' backs. |
| 3 | **Please check**: look at Carrot. | Two bunny ears standing straight up from the top of the hood, pink inside from the front. No ears on anyone else. |
| 4 | Use a resident while they're walking, and leave the menu open. | They stop at once and turn to face you, and stay there as long as the menu is open. Go through Talk and back: still standing. |
| 5 | Press Goodbye (or Esc). | Within a second they walk on the way they were going. |
| 6 | Type `/time set 3100` at the street's zoo end and watch everyone leave. | Nobody walks inside anybody. Two from facing houses take turns onto the street; on the street they follow each other with a gap, and one coming the other way passes beside them. |
| 7 | Follow two residents to an exhibit they both watch. | The second stops just behind the first and watches too, not inside them. |

## 0.1.229: the talk screen

Austin asked (2026-11-10): "I also want a custom UI for NPC interactions. Make it similar to stardew valleys".

What's new (the layout and the art are ours, Austin's to change; the art is drawn for this add-on, nothing is copied):
- Using a resident opens the talk screen in place of the plain menu: a wide wooden box with their words on cream
  paper, their portrait (drawn from their own skin) and name on its right, and the choices in a wooden frame above it
  on the right. A chat (Talk) and a gift's answer use the same screen.
- The choices are the same as before, one line each. One that can't be used yet is gray: pressing it still says why
  in the chat. "Talk (a gift for you!)" when they have a work gift waiting.
- The gift picker (a list of what you carry) and Friendship and About (a long page) are still the plain menu.
- `/zoocraft:talkscreen false` puts the plain menus back for the world, `/zoocraft:talkscreen true` the talk screen,
  and `/zoocraft:talkscreen` says which it is. No cheats needed.
- Not in this version: the words typing out letter by letter (the game's menus can't change while open) and hearts for
  friendship (it reads "Friendship: Friend, 40 of 100" for now).

How it is made: the game draws every script menu from one layout file, and a resource pack may add to it. Ours
(`RP/ui/server_form.json`) replaces nothing of the game's own menu: it adds a second layout beside it, shown only when a
menu's title starts with an invisible mark the residents' menus carry, and hides the game's own layout only for that
mark. Every other menu in the add-on is untouched. This file can only be seen in the game itself: the test server draws
nothing, so the whole screen is Austin's to check. If anything is wrong with it, `/zoocraft:talkscreen false` is the
way back while it's fixed.

On the test server (BDS 1.26.62.1): the resident menu built for the talk screen (title marked, the portrait on the
first button, one-line buttons, dark words) and, after `/zoocraft:talkscreen false`, as the plain menu, word for word as
0.1.228 had it. Nothing from the add-on in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again, then open your world. | The world opens with no errors. |
| 2 | **Please check first**: open any other ZooCraft menu (a Zoo Bank, a mailbox, a Work Anchor). | The plain menu, exactly as before, in the middle of the screen. |
| 3 | **Please check**: use a resident. | The talk screen: a wooden box low on the screen with their line in dark brown, "Friendship: ..." and "Right now: ..." under it in gray, their portrait in a frame on the right with their name on a plate under it, and the choices in a wooden frame above the box on the right. No plain menu behind it. |
| 4 | **Please check**: move over the choices (mouse, or the arrow keys or a controller). | The one you're on turns dark wood with white words. |
| 5 | Press Talk. | Their answer in the same box with Keep Talking, Back and Goodbye; the friendship gained in dark green. |
| 6 | Press Back, then Give a Gift, pick something. | The picker is the plain menu; their answer comes back on the talk screen. |
| 7 | Press Friendship and About. | The plain page, as before. |
| 8 | Press Esc (or B on a controller) on the talk screen. | It closes, and the resident walks on. |
| 9 | **Please check**: look at each resident's portrait. | Their own face, hat or hair, and shoulders; Carrot's shows the ears. |
| 10 | Type `/zoocraft:talkscreen false`, then use a resident. | "Residents' menus: plain menus." and the plain menu as it was in 0.1.228. `/zoocraft:talkscreen true` brings the talk screen back. |

If the screen looks wrong, say what you see (or send a screenshot): nothing shown at all, the plain menu showing as
well, no portrait, no name, words running out of the box, or another menu changed.

## 0.1.230: better hair and faces, a talk limit, and many more things to say

Austin asked (2026-11-10): "I want the hair on these characters to look much better. The bunny suit looks great. I also
want a talking limit to people every day, if you keep talking to them too much, they tell you off. I am not sure how
much unique chats we have as well. We should have different ones for different times of the day, different friendship
levels, different areas they are walking or looking at as well. Make them unique to their attributes and personalities."

What's new (the numbers and the lines are ours, Austin's to change):
- Hair. Austin, Sheila, Amanda, Paola and Teddy have their hair drawn again, strand by strand, in a few soft tones, and
  it now sits on the outer layer of the head so it stands out from the face like a player skin's hair: Austin's
  tousled, Sheila's curls, Amanda's and Paola's long and running down the back, Teddy's neat with gray at the temples.
  Zach, Ron, Jared and Dave keep their hats; the hair and beards under them are shaded the same way. Carrot's bunny
  suit is untouched. The talk screen's portraits are drawn again from the new skins.
- Faces (Austin: "The faces could also use some work, no nose is needed."): smooth skin with a soft shadow under the
  hair or hat and along the jaw, no nose, a small soft mouth (a wider smile for Sheila and Ron, no teeth), a little
  colour in Sheila's and Amanda's cheeks. Zach has a moustache where his nose was. Carrot's face is untouched with
  the rest of the suit, pink bunny nose included: say so if that should go too.
- How many lines there were: about 22 everyday lines each (403 in all). Now each resident has 52 more of their own
  (520 new, 923 in all), written to their job, likes and manner:
  - 3 for each part of the day (morning, afternoon, evening, night);
  - 3 for each friendship level (Stranger, Acquaintance, Friend, Close Friend, Best Friend);
  - 2 for each kind of thing they can be standing at in the zoo: water animals, cats, birds, small animals, reptiles,
    the farmyard, big animals, strange ones, young ones, and a bench or a food stall;
  - 2 for "that's plenty for today" and 3 for telling you off.
- What they say now depends on where they are and when: at an exhibit they often talk about what's in front of them;
  otherwise the time of day, how well they know you, the rain, or how their day went. They don't say one of their last
  ten lines again while they have another.
- The talk limit: 6 chats a day each (Sheila, who loves a chat, 9). The sixth ends with a "that's plenty for today"
  line; after that they tell you off, in their own way, and the answer has no Keep Talking button. It starts again the
  next day. Being told off costs no friendship (our choice: say so if it should). Gifts and their other choices are
  not limited.

On the test server (BDS 1.26.62.1): the day's talk limit (Ron: five chats, a "that's plenty" line on the sixth, then told off each time; Sheila on her ninth; the count
starts again the next day), morning, afternoon and evening lines at those times, a Best Friend's lines for a Best
Friend, and lines about the exhibit for residents standing at one (Amanda at the pandas, Sheila at the big cats,
Carrot outside the Mob House). Nothing from the add-on in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again, then open your world. | The world opens with no errors. |
| 2 | **Please check**: walk round Austin, Sheila, Amanda, Paola and Teddy. | Hair with strands and soft shading that stands a little out from the head on top, sides and back; faces clear. Amanda's and Paola's runs down their backs. |
| 3 | **Please check**: look at Zach, Ron, Jared, Dave and Carrot. | Hats and the bunny suit as before; hair and beards under the hats a little more shaded. |
| 4 | **Please check**: look at their faces up close. | No noses; smooth skin; small mouths. |
| 4b | **Please check**: use a resident. | Their portrait shows the new hair and face. |
| 5 | Talk to one resident, pressing Keep Talking. | Different lines each time, none twice in a row. In the morning some are about the morning; at night about the night. |
| 6 | Keep going to the sixth chat. | A line that says that's plenty for today (still with Keep Talking). |
| 7 | Press Keep Talking again. | They tell you off, and the choices are Back and Goodbye only. Talk from their menu again: told off again. |
| 8 | Talk to Sheila nine times. | She lasts until the ninth. |
| 9 | Talk to a resident standing at an exhibit (the sharks, the cats, the farmyard). | Before long, a line about what they're looking at. |
| 10 | Sleep, then talk to the one who told you off. | They chat again. |
| 11 | Talk to a Stranger and to a Friend (give gifts to raise it). | A Friend's lines are warmer and say more. |

## 0.1.231: long hair over the shoulders

Austin asked (2026-11-10): "the girl skins should have their hair fall over their shoulders as well. Look up some
references of girl skins online".

What long-haired player skins do (from skin-making guides and community skins): the hair doesn't stop at the head. It
covers the tops of the shoulders, comes down the chest as a lock on each side of the neck, falls wide down the back
and onto the backs of the upper arms, in strands of two or three tones with darker, tapered ends.

What's new (lengths ours, Austin's to change): Amanda's and Paola's hair does that. Amanda's reaches a third of the
way down her chest and halfway down her back; Paola's is longer, nearly to her waist at the back. Sheila keeps her
short curls and Carrot the bunny suit. Their two talk-screen portraits are drawn again from the new skins. Nothing but
pictures changed.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again, then open your world. | The world opens with no errors. |
| 2 | **Please check**: look at Amanda and Paola from the front. | A lock of hair down each side of the chest from the shoulders. |
| 3 | **Please check**: look at them from behind and from above. | Hair over the shoulder tops and falling down the back, a little onto the backs of the arms, with strands and darker ends. |
| 4 | **Please check**: use Amanda or Paola. | The portrait shows the hair on the shoulders. |

## 0.1.232: hearts and faces on the talk screen

Austin chose "Talk screen polish" (2026-11-10), then: "Make sure you use the minecraft hearts for that design".

What's new (the numbers are ours, Austin's to change):
- Friendship as hearts: five hearts low in the talk box, under the words. They are the game's own heart pictures (the
  health bar's full and empty hearts), not drawn by us. One heart fills for every 20 friendship: none under 20, five
  at 100. The words "Friendship: Friend, 45 of 100" stay on the main page.
- Faces: each resident has a happy and a cross portrait besides the plain one. Happy when a chat or gift raised your
  friendship, when they like your gift, or when they hand you a gift of their own. Cross when they tell you off for
  talking too much or dislike a gift. Otherwise the plain face.
- The plain menus (`/zoocraft:talkscreen false`) are unchanged.

Like the rest of the talk screen, the hearts can only be seen in the game itself: the test server draws nothing. On the
test server (BDS 1.26.62.1): the resident menu built with the
title's mark for the friendship (Carrot at 40: the mark for two hearts; Ron at 5: none; Sheila at 100: five) and, after
`/zoocraft:talkscreen false`, the plain title with no mark. Nothing from the add-on in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again, then open your world. | The world opens with no errors. |
| 2 | **Please check**: use a resident you've never met. | Five empty hearts at the bottom left of the box, the game's own heart shapes, clear of the words. |
| 3 | **Please check**: use one you're a Friend of (40 or more). | Two full hearts and three empty (three from 60, four from 80, five at 100). |
| 4 | **Please check**: Talk for the first time that day. | A smiling face with a little colour in the cheeks, and the hearts still there. |
| 5 | Keep Talking. | The plain face again. |
| 6 | **Please check**: talk until they tell you off. | A cross face: brows down, mouth turned down. |
| 7 | Give a gift they like, and another day one they dislike. | Happy for the first, cross for the second. |
| 8 | **Please check first**: open any other ZooCraft menu (a Zoo Bank, a mailbox). | The plain menu as before, with no hearts. |

If the hearts look wrong, say what you see: none at all, all full or all empty whatever the friendship, on top of the
words, or showing on another menu.

## 0.1.233: creeped out by "Follow Me"

Austin asked (2026-11-10): "I want there to be a creeped out face if you ask someone to follow you if you dont have
enough friendship, and they should also say, something like \"thats weird".

What's new: ask a resident you're not yet a Friend of (under 40 friendship) to follow you, and they're creeped out.
- On the talk screen their answer comes up in the box with a creeped-out face: wide eyes with small pupils, a wobbly
  mouth and a drop of sweat. Under their words, one line says what opens Follow Me. Back returns to their menu.
- What they say: three lines each, in their own voice, each calling it weird (Paola: "That's weird. I'm holding an
  axe, you know." Teddy: "One does not simply summon the mayor.").
- With plain menus (`/zoocraft:talkscreen false`) the same line is said in the chat, followed by the reason as before.
- Every other reason Follow Me can't be used (asleep, working, bedtime, with someone else) is unchanged, and so is the
  button, which is still gray on the talk screen until you're a Friend.

On the test server (BDS 1.26.62.1) the add-on loads and the residents' menus build with nothing in the content log;
pressing a menu button can't be done there, so the answer itself is checked by the tests and by Austin.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again, then open your world. | The world opens with no errors. |
| 2 | **Please check**: use a resident you're not a Friend of and press the gray Follow Me. | Their creeped-out face, a line saying it's weird, and "Follow Me opens at Friend: 40 friendship (you have ...)". Buttons Back and Goodbye. |
| 3 | Press Back, then Follow Me again a few times. | Different lines, each that resident's own. |
| 4 | Ask a Friend (40 or more) to follow. | They follow, as before. |
| 5 | Ask one who is asleep or working. | The usual reason in the chat, no creeped-out face. |

## 0.1.243: four new residents (Ailing Bot, Terra, Jaylen, Sophia) and Sophia's book

Austin sent (2026-11-10) "ZooCraft Tycoon, Custom NPC Expansion, NPCs #11 to 15" (kept word for word in
research/ZooCraft_Tycoon_NPC_Expansion_11-15.md), then: "Make ailing boat without the reference photo, he should be a
white guy with a brown mullet, gray eyes, and a full beard and stache, a little on the burly side, with a dress shirt,
tie and dress pants".

What's new: four of his five new residents can move in. Their names, unlocks, likes, dislikes and attributes are his
words; nothing was added to them.

| Resident | Moves in once you have | Job | Look |
|---|---|---|---|
| Ailing Bot | a Goblin Shark on display | Teacher (days) | Brown mullet, gray eyes, full beard and moustache, burly, white dress shirt, red tie, dark dress trousers |
| Terra | 20 animals on display (any species) | Environmental researcher (days) | Blonde with leaves in her hair, blue eyes, a long blue ball gown |
| Jaylen | a mythical animal on display | none | A sharp, ruler-straight hairline, a chin beard, a white and teal warm-up jacket, a diamond chain (our own design) |
| Sophia | a gorilla on display (your answer: gorillas count as monkeys) | none | Long dark hair, olive skin, amber eyes, a green hoodie, jeans |

- Each has their own skin, four talk-screen faces (plain, happy, cross, creeped out), 52 chat lines, 3 "that's weird"
  lines and their own words for gifts, following, the weather and the zoo.
- Sophia's book: at 80 friendship, the next time you talk to her she hands you "History of the Mythical Glades", a
  real written book with your text on 8 pages, signed by Sophia. It is given once and is yours for good, even if the
  friendship drops later. If you lose it, her menu has "Ask for the book" for another copy (only while you carry none).
  Her page (Friendship and About) says what is waiting and when you have earned it.
- Ailing Bot and Terra have jobs, so, like the others with a job, they sometimes keep a work gift for a good friend
  after a happy zoo visit (teacher: paper, a book, cookies, bread, or a book and quill; researcher: seeds, a sapling,
  bone meal, poppies, or moss; never an animal product). Jaylen and Sophia have no job and keep none.
- `/zoocraft:testsetup` now builds 14 houses: the four new ones are the last two rows of the street (Terra west and
  Sophia east, then Jaylen west and Ailing Bot east, whose house has a jukebox and a furnace for his baking).

Not in this version (next, in this order): Terra's research site and the two Disposeries; Ailing Bot's classroom and
lessons; Dr. Pollo, the vet work and the Full Healing Serum; Jaylen's hairline painting.

Our choices, yours to change:
- The game only signs book titles up to 16 characters, so the book is signed "Mythical Glades" and the item itself is
  named "History of the Mythical Glades".
- Jaylen's look is our own design, not anyone real.
- How each one's likes show at the zoo: Ailing Bot is pleased by cats and bothered by fish tanks (water); Terra is
  pleased by planters, a clean park and farm animals and bothered by litter; Jaylen is pleased by a pricey ticket
  (expensive things); Sophia is pleased by a quiet zoo and planters and bothered by crowds and cave animals.
- Gifts: Ailing Bot likes food and music and dislikes water; Terra likes plants and farming things and dislikes
  meat, rabbit parts and feathers; Jaylen likes diamonds and dislikes gold; Sophia likes books and flowers and
  dislikes diamonds.
- Rain: Ailing Bot stays home (he dislikes water), Sophia goes out in it (she likes rain).
- The work gift lists above.

On the test server (BDS 1.26.62.1): `/zoocraft:testsetup true` built the street and moved in 14 of 14 residents; the four
new ones said their own first lines, walked to the zoo with the others and came away with their own likes (Terra:
clean paths and farm animals; Sophia: bothered by the crowds). The game refused the full book title (16 characters at
most), so the book came out as a written book titled "Mythical Glades" by Sophia, named "History of the Mythical
Glades", with all 8 pages. At 79 friendship Sophia gave nothing; at 80 she gave the book once; asked again she gave
nothing; with the book gone she gave another copy; with friendship set down to 30 it still counted as earned. Jaylen at
100 friendship gave nothing (his painting is not built). Nothing in the content log. The looks, the faces and the
talk screen can't be seen there: those rows are Austin's.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again, then open your world. | The world opens with no errors. |
| 2 | In your own world, with a gorilla, a Goblin Shark, a mythical animal or 20 animals on display, open an empty Resident Mailbox that is ON. | The matching new resident can move in (Sophia, Ailing Bot, Jaylen, Terra). |
| 3 | In a new Superflat world run `/zoocraft:testsetup true`. | 14 houses on the street; the last two rows are Terra and Sophia, then Jaylen and Ailing Bot, each with a sign (Jaylen's and Sophia's signs have just their name). |
| 4 | **Please check**: look at each of the four. | Their looks as in the table above. Ailing Bot: mullet down the back of his neck, beard and moustache, shirt and tie. |
| 5 | **Please check**: talk to each. | Their own face on the talk screen and lines in their own voice (Ailing Bot is loud, Terra sweet, Jaylen cocky, Sophia blunt). |
| 6 | Press Follow Me on one you're not a Friend of. | Their creeped-out face and a "that's weird" line. |
| 7 | Get Sophia to 80 friendship (a chat and a gift she likes each day: books, flowers), then talk to her. | She says a few words and gives you "History of the Mythical Glades". |
| 8 | **Please check**: open the book. | Your text on 8 pages, by Sophia. |
| 9 | Talk to her again the next day. | No second book. Her page says the book is yours. |
| 10 | Put the book in a chest and open her menu. | "Ask for the book": she gives another copy. With a copy on you the button is not there. |
| 11 | Visit Ailing Bot or Terra as a Friend over a few days. | Now and then "They have something for you": a teacher's or a researcher's gift. |

## 0.1.244: Terra's research site

Austin's NPC Expansion spec (2026-11-10): "Terra requires a designated, fenced workspace connected to the NPC path
system. Her workspace is an environmental research area ... Her occupation should physically involve her workspace,
while protecting player constructions from unintended changes."

What's new: Terra has work, the fourth kind after Dave's mine, Paola's woodlot and Ron's field.
- Build her a work site exactly as theirs: outside the zoo's fence, fenced in all round, a shut fence gate, a Work
  Anchor on the floor with a chest or barrel beside it, and path blocks from her front door to the gate. Use the
  anchor, Choose a worker, Terra.
- Put one or more **composters** inside. They are her research stations.
- She works mornings (from when she leaves home until noon), then goes to the zoo. At the site she walks from
  composter to composter and studies at each for a few seconds.
- Leave plant waste in the chest (seeds, saplings, leaves, flowers, crops, kelp, moss and the like). When the chest
  holds 7 or more, a study takes 7 of it and puts 1 bone meal in the chest instead. She never takes an animal product,
  or anything that isn't a plant.
- She changes no block at all: not the composters (they stay empty and yours to use), not the fence, not the ground.
- Skill as the others: Apprentice 10 seconds a study; Skilled from 10 good shifts, 8 seconds; Expert from 30, 6
  seconds and 2 bone meal from the same 7. A good shift is 3 studies. A shift holds a study for every 5 blocks of
  floor, from 4 to 16.
- The Work Anchor's page shows the composters in reach, the plant waste in the chest, her skill and her shift.
- Work earns the zoo nothing (the spec). Her work gifts (0.1.243) still come after happy zoo visits.
- `/zoocraft:testsetup` builds her site too: east of Ron's field, an oak fence round grass, three composters, and
  seeds, leaves and poppies in the chest.

Our choices, yours to change: composters as the stations; 7 plant waste for 1 bone meal; the times and the skill
steps; that with no composter in the site she has nothing to do and goes on to the zoo. Her two Disposeries and what
she teaches by friendship come in the next version.

On the test server (BDS 1.26.62.1): `/zoocraft:testsetup true` built her site and it worked at once (79 blocks of
floor, 3 composters in reach, 56 plant waste in the chest). In the morning Terra walked from her house to the gate,
went in and round the three composters in turn: 16 studies in the shift (all it holds), the first 8 each turning 7
plant waste into a bone meal (8 bone meal in the chest, the waste all gone), the other 8 studies alone. All three
composters were still empty and in place afterwards. A good shift, counted toward her skill; at noon she left for the
zoo. Nothing in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | Open your world (a world reload is enough: no new pictures or blocks). | The world opens with no errors. |
| 2 | In a new Superflat world run `/zoocraft:testsetup true`, then walk to the end of the street and east past Ron's field. | Terra's research site: a small fenced lawn with three composters, a Work Anchor and a chest, and a sign "Terra's research site". |
| 3 | Use the Work Anchor there. | Terra as the worker, "Composters in reach of the floor: 3", "Plant waste in the chest: 56". |
| 4 | Stay near in the morning. | Terra walks from her house, opens the gate, shuts it, and goes from composter to composter. |
| 5 | Open the chest at noon. | Less plant waste, some bone meal. The composters are still empty. |
| 6 | Use the anchor after her shift. | Her last shift in words, such as "8 studies, 6 making bone meal". |
| 7 | Take the composters away and watch the next morning. | She comes, finds nothing to study, and goes on to the zoo. The anchor says to put a composter inside. |

## 0.1.245: the Portable Disposery and the Disposery

Austin's NPC Expansion spec (2026-11-10), Terra's unlocks: "Portable Disposery ... Using the item opens a disposal
interface ... A clearly labeled Dispose button permanently deletes all items currently placed in the disposal
interface. Closing the interface without pressing Dispose must not destroy the items", "Disposery ... A placeable
block with a chest-like inventory ... Items are only deleted when the player presses Dispose", "Both Disposery
variants should use consistent disposal behavior." Austin, on the block's screen: "Make it like the chest screen, but
have it colored different so it is distinct from a nornal chest".

What's new:
- **Disposery** (a block: a green metal bin, a little smaller than a full block as a chest is). Use it and the game's
  own chest screen opens, 27 slots, with a **green frame** instead of a chest's gray, titled "Disposery (sneak and
  use: Dispose)". Put in and take out as with any chest.
- **Sneak and use** it for the Dispose page: a red warning, a list of exactly what is inside, and two buttons,
  **Dispose** and **Keep them**. Only Dispose deletes, and only what the page listed: if anything inside changed while
  you were deciding, nothing is deleted and it tells you to look again.
- Picking the block up takes **two hits** within three seconds (the first says so). Everything inside drops out
  first, then the block drops as its item (not in Creative). Explosions and pistons leave it alone. A hopper under it
  takes nothing.
- **Portable Disposery** (an item). Use it for its page: your inventory stack by stack. Press a stack to hold it for
  disposal (it is marked "[Held]"), press again to take it back. Held items never leave your inventory, so closing
  the page keeps everything. **Dispose** shows the same warning page as the block, then deletes the held stacks.
- Neither pays anything or makes anything.
- **Terra's plans.** At 40 friendship her next chat hands you Portable Disposery Plans; at 60, Disposery Plans. Each
  is yours for good: on her "Clean zoo advice" page you can ask for another whenever you carry none.
- **Recipes at the Zoo Workshop** (each uses up one plans):
  - Portable Disposery: top row iron ingot, plans, iron ingot; middle row iron ingot, bucket, iron ingot; bottom
    row a flint in the middle.
  - Disposery: plans, cauldron, furnace down the middle; three iron ingots down each side.
- **Terra's "Clean zoo advice"** (a new button on her menu), in your five friendship bands: from 0 basic advice
  (litter, bins, where to see it); from 20 exhibit cleaning and waste management (a bin's reach, when keepers empty
  and clean, the rake); from 40 the Portable Disposery; from 60 the Disposery; from 80 advanced knowledge (raccoons
  and the Bin Latch, her research site's bone meal). Every number in it is the game's real one.

Our choices, yours to change: the recipes; plans as the way a recipe "unlocks" (the game can't lock a Workshop recipe
behind friendship, so the plans are an ingredient she gives you); sneak and use for the Dispose page (a chest screen
can't carry a button of ours); two hits to pick the block up; the green colour; the advice's words; that holding in
the Portable Disposery marks stacks rather than moving them.

On the test server (BDS 1.26.62.1): a placed Disposery made its store at once (27 slots), by command and by a
player's placing. Dispose deleted exactly what was listed (66 items), and refused when a stack was changed first. Two
hits picked it up in Survival: the 64 rotten flesh, the 3 diamonds and the Disposery itself all came back; one hit, a
5 second wait and another hit did not. TNT beside it and pistons from both sides left it and its contents in place; a
hopper under it took nothing; the `damage` command could not hurt the store. A store whose block was removed by a
command gave its items back and went; a block whose store was killed by a command (the items dropped out) made a new
one when used. Blocks could be built on all four sides and on top. Aimed at from seven places, the store was always
hit before the block. The Portable Disposery deleted the two held stacks (74 items) and kept the rest. Terra gave the
Portable plans at 40 and not at 39, the Disposery plans at 60, each once, and another only when none was carried,
still at 10 friendship. Both recipes are in the game's recipe list. Nothing in the content log.

Not checkable from the cloud (the server draws no screens): the green frame, the pictures, the pages' look, and
sneak-and-use itself (the test player's use doesn't fire that event; the code path behind it was run directly).
If the frame is still gray on your screen, tell me which UI profile you use (Classic or Pocket): the Pocket profile
draws chests differently and keeps its own look in this version.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new block, items and screen). Open your world. | No errors. |
| 2 | `/give @s zoocraft:disposery` and place it. | A green metal bin, a little smaller than a block. |
| 3 | Use it. | The chest screen with a green frame, titled "Disposery (sneak and use: Dispose)". An ordinary chest beside it is still gray. |
| 4 | Put some dirt in, close it, open it again. | The dirt is still there. |
| 5 | Sneak and use it. | A page with a red warning, "64 x Dirt", and the buttons Dispose and Keep them. |
| 6 | Press Keep them, open the bin. | The dirt is still there. |
| 7 | Sneak and use, press Dispose, open the bin. | "Disposed of 64 items." and the bin is empty. No money changed. |
| 8 | Put items in, hit the bin once, wait, hit it twice quickly. | First: "Hit the Disposery again to pick it up." Then the items and the bin drop. |
| 9 | Place a block against each side of a Disposery and on top. | They all place. |
| 10 | `/give @s zoocraft:portable_disposery`, use it. | Its page: Dispose, Close, then your stacks. |
| 11 | Press a stack, then Close. | It was marked "[Held]"; after Close it is still in your inventory. |
| 12 | Use it, press a stack, Dispose, then Dispose on the warning page. | Only that stack is gone. |
| 13 | Talk to Terra at 40 friendship or more (`/zoocraft:testsetup true` moves her in). | She gives you Portable Disposery Plans; at 60, Disposery Plans the next chat. |
| 14 | On her menu press Clean zoo advice. | Her advice for your friendship, and "Ask for ..." only for plans you don't carry. |
| 15 | At a Zoo Workshop lay out each recipe above. | A Portable Disposery; a Disposery. |

## 0.1.246: Ailing Bot's lessons for the player

Austin's NPC Expansion spec (2026-11-10), "Teaching the Player": lessons in four categories ("Zoo layout, design,
and improvements", "Ticket revenue and donations", "Visitor happiness, retention, and repeat visits", "Animal
happiness, habitat quality, and enrichment"), "Lessons should explain actual ZooCraft game systems", five friendship
bands, "Lessons do not automatically unlock items. They satisfy an additional prerequisite", "Completed lessons are
permanently recorded, even if friendship later decreases." Austin's card answer on which Workshop items need a
lesson: "Four items". Austin: "Well ailing bot should unlock new things in the book item we already have".

What's new:
- **Lessons** on Ailing Bot's menu (not while he sleeps): eight lessons, each showing its friendship band and
  whether it is finished, open or locked. Open one, read it, press **Finish the lesson**.
- A finished lesson is yours for good, whatever friendship does later, and becomes a page of the **Field Journal**:
  its new **Lessons** button ("n of 8 learned") lists them to read again anywhere.
- The lessons, by your bands:
  - from 0 (Basic zoo care): The five needs; Paths and Viewing Points
  - from 20 (Animal happiness and habitat improvements): Animal enrichment; Comforts along the paths
  - from 40 (Visitor retention and revenue strategies): Tickets and donations; Happy guests come back
  - from 60 (Advanced zoo research and upgrades): Research and a bigger zoo
  - from 80 (Hidden knowledge and specialized improvements): What the stars are made of
  Every number in them is read from the game's own rules, so they stay right when the balance changes.
- **Lesson Notes** (four new items). Finishing one of these four lessons gives its notes, and the Zoo Workshop recipe
  for the matching item now needs one (it is used up):
  - Animal enrichment (20) -> Puzzle Feeder
  - Tickets and donations (40) -> Donation Box
  - Happy guests come back (40) -> Tour Desk
  - Research and a bigger zoo (60) -> Research Desk
  Each recipe is the old one with the notes in a free slot; the Tour Desk's grid was full, so its notes take the
  place of the bottom middle plank. Ask him for more notes on the lesson's page whenever you carry none.
- Items already placed in a world are untouched; only crafting new ones changed.

Our choices, yours to change: the eight lessons and their words; which lesson goes in which band; Lesson Notes as
an ingredient as the way a lesson is "an additional prerequisite" (the game can't lock a Workshop recipe behind a
record, the same reason Terra gives plans); the Field Journal as the book (your card is still open: Park Ledger or
another item is a small change). One to look at: the Research Desk now waits on 60 friendship with a resident who
only moves in after a Goblin Shark is on display, and the End expedition and the conservation quests need a
Research Desk. Say so if a different item should take that lesson.

On the test server (BDS 1.26.62.1): at 0 friendship the 20 lesson would not finish and the first lesson did, once
(a second finish changed nothing). At 20 the enrichment lesson finished and gave its notes; asking again while
carrying them gave nothing; with none carried, and friendship back down at 5, he gave another, once. At 100 the
other lessons finished: four different notes in the inventory, 6 lessons recorded. The Research Desk recipe is
still in the game's recipe list. Nothing in the content log.

Not checkable from the cloud: the pages' look and the notes' pictures.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new items and pictures). Open your world. | No errors. |
| 2 | Use Ailing Bot (`/zoocraft:testsetup true` moves him in). | His menu has a Lessons button. |
| 3 | Press Lessons. | Eight lessons; at low friendship the later ones say what friendship opens them. |
| 4 | Open "The five needs", press Finish the lesson. | His line, "Lesson finished: The five needs." |
| 5 | Open your Field Journal. | A Lessons button, "1 of 8 learned"; inside, the lesson to read again. |
| 6 | At 20 friendship finish "Animal enrichment". | He gives you Lesson Notes: Animal Enrichment. |
| 7 | At a Zoo Workshop lay out the Puzzle Feeder's recipe with the notes. | A Puzzle Feeder; the notes are used up. |
| 8 | With no notes on you, open that lesson on his menu. | "Ask for Lesson Notes"; he gives another. |
| 9 | Press a locked lesson. | "That lesson opens at ... friendship with Ailing Bot." |

## 0.1.247: residents attend class at Ailing Bot's house, and his glasses

Austin's NPC Expansion spec (2026-11-10), "Teaching NPCs": "His house functions as the classroom", "Only one NPC
student may attend at a time", "NPCs do not attend during their own work shifts", "NPCs who dislike school do not
attend", "NPCs who like school are more likely to attend and learn more quickly", "His teaching skill improves as he
gives more lessons", "Students improve their occupational skill." Austin, 2026-11-11: "Ailing bot has black rim
glasses too, I forgot to say".

What's new:
- **Class.** A resident with a job now and then wants a lesson. When Ailing Bot is at home and up, the next one who
  is free walks out of their own front door, along the path to his, in at his door (shut behind them), and stands
  inside for the lesson. He stays in for them. Then they walk home the same way.
- **One student at a time**, three lessons a day at most.
- **Who goes.** Anyone with a job, when they are at home and free: not on their own work shift, not at their
  bedtime, not in weather that keeps them in. **Sheila never goes** (she dislikes school). **Amanda goes twice as
  often** and each lesson counts double for her (she likes school). Jaylen and Sophia have no job to learn for.
- **Path access.** The student needs a path from their front door to his: the same path blocks their home already
  uses to reach the zoo gate, joined to his door (within 2 blocks of his doorstep). Two homes inside the zoo use the
  guest paths. With no path, their page says so and they try again the next day.
- **What a lesson does.** For Dave, Paola, Ron and Terra it counts as one good shift toward Skilled and Expert at
  their work site. For those with a job but no work site it counts toward the same three levels, shown on their page
  ("Skilled geologist (from lessons)"); that level changes nothing else yet.
- **His teaching skill**: Apprentice, Skilled from 10 lessons given, Expert from 30 (lessons you finish with him
  count too). Lessons take 45 seconds, 36 when he is Skilled, 30 when Expert, and an Expert's lesson counts one more.
- Their pages say "on the way to class at Ailing Bot's house", "in class at Ailing Bot's house", "at home, teaching
  Amanda". A resident's page has a Class line; his has a Teaching line. Follow Me is refused during class.
- **His glasses**: black rims round his eyes with arms back to his hair, on his body and all four talk portraits.

Our choices, yours to change: how often they want a lesson (4 days in 10; 8 in 10 for one who likes school), three
lessons a day, the lesson's length, the levels at 10 and 30, what a lesson is worth, that only residents with a job
study, and that a job with no work site gets a level with no effect of its own.

On the test server (BDS 1.26.62.1), on the test world's street of 14 homes: with Amanda, Ron, Carrot, Zach, Sheila
and Jaylen all made to want a lesson, Amanda, Carrot and Zach went one after another (each walked to his door,
stood inside it for 45 seconds, walked home), never two at once; Ron was left for the next day (three a day);
Sheila and Jaylen never set out. Amanda's lesson counted 2, the others 1. His door and theirs were shut afterwards.
With the day running and a lesson begun just before his leaving time, he stayed in until it ended, 66 seconds past
his time, then left for the zoo; meanwhile Ron, Paola and Terra went to work as usual. At his 30th lesson the chat
said he was now an Expert teacher, and the next lesson counted 2. Nothing in the content log.

Not checkable from the cloud: his glasses in the game, and how the lesson looks inside his house.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new pictures). Open your world. | No errors. |
| 2 | Look at Ailing Bot and open his talk screen. | Black-rimmed glasses on him and on his portrait. |
| 3 | In a test world (`/zoocraft:testsetup true`), wait by his house (the last on the street) in the morning. | Now and then a resident walks to his door, goes in, stays 45 seconds, and walks home. Never two at once. |
| 4 | Use his mailbox, open his page while a student is there. | "Right now: at home, teaching ..." and a Teaching line with his lessons given. |
| 5 | Open the student's page. | "in class at Ailing Bot's house"; afterwards a Class line counting their lessons. |
| 6 | Open Sheila's page. | "Class: never goes: Sheila dislikes school". |
| 7 | Ask a student at class to Follow Me. | "Not while they're at class". |
| 8 | Stand near when a lesson ends. | "... finished a lesson with Ailing Bot." in the chat. |

## 0.1.248: Dr. Pollo moves in

Austin's NPC Expansion spec (2026-11-10), resident 15: "Unlock Condition: Have a functioning veterinary building in
the zoo", "Occupation: Zoo Veterinarian", likes "Animals, Helping, Medicine, New things, Tools", dislikes "Injuries,
Bad people, Animal products, Fire", attributes "Fearless, heroic, crafty, folksy, old-fashioned, brilliant,
reliable, genuine". "0-19 Friendship: Dr. Pollo may live in the NPC community and visit the zoo. He does not yet
work as the zoo veterinarian."

What's new:
- **Dr. Pollo** can move in once a **Recovery Station** stands in a zoo: that is the game's veterinary building,
  where sick animals recover. Everyone is told when he is unlocked, as with the others.
- **His look** is our own (the spec names a real television vet, who is not drawn): an old country vet in a tweed
  flat cap, white hair and a bushy white moustache, blue eyes, a checked shirt under a green vest, brown trousers
  and tall rubber boots. Four talk portraits.
- He lives, visits, chats, takes gifts, follows and takes lessons like any resident. He goes out in any weather.
  At the zoo he is pleased by baby animals and farm animals and bothered by fiery ones.
- **Gifts**: he likes tools; he doesn't like meat, feathers and eggs, rabbit parts or fire things.
- **Work gifts** (as everyone with a job): apples, carrots, hay, glistering melon, and a golden apple for a close
  friend. Nothing that came off an animal.
- The test world's street has a 15th house for him (`/zoocraft:testsetup true`).
- **Not yet**: working as the zoo's vet from 20 friendship, and the Full Healing Serum. Those are the next two
  versions.

Our choices, yours to change: the Recovery Station as the veterinary building; his look; which of his likes the zoo
can show him (babies, farm animals, fiery animals); his gift likes; his work gifts; his words.

On the test server (BDS 1.26.62.1): before any Recovery Station his goal read 0 of 1; `/zoocraft:testsetup true`
built the street with all 15 residents moved in, Dr. Pollo in the 15th house; he walked out of his door and visited
the zoo like the others. In a second world with the test zoo alone, a Recovery Station outside the fence left his
goal at 0 of 1; one placed inside the zoo made it 1 of 1 and unlocked him with the usual message.
Nothing in the content log.

Not checkable from the cloud: his look in the game.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new pictures). Open your world. | No errors. |
| 2 | Place a Recovery Station in your zoo (or have one already). | Within a few seconds: "Dr. Pollo can move in now! (a Recovery Station in the zoo.)" |
| 3 | Give him a home (a mailbox set to Move-in ON), or run `/zoocraft:testsetup true` in a test world. | He moves in: flat cap, white moustache, green vest, rubber boots. |
| 4 | Talk to him. | His own lines; his portrait on the talk screen. |
| 5 | Give him a pickaxe; another day, raw beef. | He likes the tool; he doesn't like the meat. |
| 6 | Open his page from the mailbox. | Job: zoo veterinarian (works days); his likes and dislikes in your words. |

## 0.1.249: Dr. Pollo works as the zoo's vet

Austin's NPC Expansion spec (2026-11-10): "20 Friendship: Dr. Pollo begins working at the zoo veterinary building.
He starts treating sick and injured zoo animals." "As friendship and experience increase: Dr. Pollo's healing speed
improves. He learns and remembers individual animals' names faster. His veterinary competence improves." "The
precise numerical progression beyond the initial 20 friendship requirement is still to be determined." Austin's
answer on how he treats them: "Both" (the animals in recovery at the building, and out to the exhibits when none
wait).

What's new:
- **From 20 friendship** (with any player) he works on his visits to the zoo. Before that he visits like anyone.
- **The Recovery Station first.** Each visit starts at a Recovery Station in the zoo. While unwell animals wait in
  recovery holding he stays there, and they get better faster: 1.5 times as fast at level 1, then 2, 2.5 and 3. The
  park menu's Recovery holding page says he is there. Each animal he nurses back to health is announced to players
  nearby.
- **Then the exhibits.** With nobody waiting in recovery he walks the guest paths to a Viewing Point of an exhibit
  with an unwell animal and treats it from there (40 seconds at level 1, then 32, 26 and 20). Treating lifts every
  low need as far as "needs attention" and restarts the count toward recovery holding; the animal is well again when
  nothing is still low. What made it ill is still yours to fix, or it sickens again. He enters no exhibit and
  changes no block.
- **Veterinary levels 1 to 4**, by animals treated and friendship together: level 2 at 8 treated and 40 friendship,
  level 3 at 24 and 60, level 4 at 48 and 80. One animal counts once a park day. A new level is announced.
- **Names.** He speaks to an animal by its kind ("little zebra") until he knows it: after 3 treatments at level 1,
  2 at level 2, 1 at levels 3 and 4. Then he uses its name.
- **His page** (from his mailbox) shows his level, the animals treated, the names known and what the next level
  needs. "Right now" on his pages says what he is treating.
- With nobody to treat he strolls round the zoo like the other residents and looks again every 10 seconds. He goes
  home at his usual time.
- **Not yet**: the Full Healing Serum at the top level (the next version).

Our choices, yours to change: every number above (balance.js `residents.vet`); that he works during his visit
rather than a fixed shift; that level needs friendship as well as experience; what a treatment at an exhibit does;
his words. The game's animals have no injuries of their own (zoo animals take no damage), so "sick and injured" is
the one "unwell" state.

On the test server (BDS 1.26.62.1, `/zoocraft:testsetup true`, a Recovery Station by the path inside the gate, two
dragons made unwell in recovery holding and a dragon and a griffin made unwell in their exhibits): on reaching the
zoo he walked straight to the station and stood by it; with him there the two in holding rose from 53 to 60 in 95
seconds (1.5 times the station's own rate) and each was announced as nursed back to health; he then walked to the
first exhibit's Viewing Point, stood 40 seconds and treated the dragon (its three low needs rose by 15, two of them
to 35), then the griffin, then strolled; five minutes later he went back to the dragon, whose enrichment was still
low. His count read 4 treated, and the second visit to the same animal on the same day did not add to it. Set to 50
treated and 85 friendship his page read "Veterinary level 4 of 4". Nothing in the content log. Not measured there:
the under-20 case and the spoken lines at an exhibit (the bench player stood out of earshot); the tests cover the
rules for both.

Not checkable from the cloud: how it looks in the game.

| # | Do this | You should see |
|---|---|---|
| 1 | Open the world (a world reload is enough for this version). | No errors. |
| 2 | With Dr. Pollo living by a zoo with a Recovery Station on its paths, open his page at under 20 friendship. | "Veterinary work: Not the zoo's vet yet: he starts at 20 friendship." |
| 3 | Reach 20 friendship (talk each day, give him tools). Watch his next visit. | He walks to the Recovery Station first and stands by it a while. His page: "Veterinary level 1 of 4". |
| 4 | Let an animal fall unwell in its exhibit (empty its feeder for a park day), with a Viewing Point at that exhibit. | He walks to the Viewing Point, says a line to the animal, and after about 40 seconds: "Dr. Pollo treated ...". |
| 5 | Let an unwell animal reach recovery holding. | He goes to the station and stays; Recovery holding in the park menu says he is nursing them faster; a message when one is well. |
| 6 | After a few treatments of the same animal. | He greets it by its name. |
| 7 | Reach 8 treated and 40 friendship. | "Dr. Pollo is now a level 2 veterinarian!" |

## 0.1.250: the Full Healing Serum

Austin's NPC Expansion spec (2026-11-10): "Maximum Veterinary Level: Unlocks the Full Healing Serum." "The Full
Healing Serum instantly restores the selected target to its maximum health." Valid targets: "The player using the
serum. Another player. Zoo animals. Vanilla Minecraft mobs with health. Custom ZooCraft creatures with health. Other
eligible living entities." "Restores current health to maximum health. Does not increase the target's maximum
health. Does not grant invulnerability." "The crafting recipe, item consumption behavior, and any cooldowns have not
yet been finalized."

What's new:
- **Dr. Pollo's formula.** When he reaches veterinary level 4 (48 animals treated and 80 friendship), talking to him
  with 80 friendship of your own gets you the **Full Healing Serum Formula**. His page says what is still needed
  until then. If you carry none, his menu has "Ask for the Full Healing Serum Formula".
- **The recipe** (Zoo Workshop): the formula on top, a golden apple between two glistering melon slices, a glass
  bottle underneath. Makes 1 Full Healing Serum. The formula is used up, like Terra's plans; ask him for another.
- **Using it.** Hold the serum, look at a living thing within 5 blocks and use it: that creature is restored to its
  full health. Look at nothing, or sneak, and it heals you. It works on players, vanilla mobs and ZooCraft's own
  creatures: anything alive with health. Hearts and a chime show it.
- A use that heals takes one serum (none in Creative). If the target is already at full health nothing is used and
  you are told. There is no cooldown. It raises no maximum, gives no effect and no protection.

Our choices, yours to change: the recipe; that the formula is an ingredient; one serum per healing; no cooldown;
sneak to heal yourself. Note: zoo animals take no damage in this add-on, so on them it will always say "already at
full health"; it does not cure an unwell animal (the spec gives it health only).

On the test server (BDS 1.26.62.1): at full health a use took nothing and said so; hurt to 11 of 20 the bench
player used it and stood at 20 of 20 with one serum fewer; a cow at 4 of 10 it looked at went to 10 of 10 for one
serum, and a second use on it took nothing; an iron golem went from 60 to 100 of 100; looking at an armor stand
(which is not alive) it healed the player instead; sneaking healed the player. With Dr. Pollo at level 3 nothing
was due at 85 friendship ("At veterinary level 4 and 80 friendship they have something special for you."); at level
4 he handed over the formula with his line, and his page read "Their gift to you: Full Healing Serum Formula".
Nothing in the content log. Not measured there: a ZooCraft creature as the target (the wild unicorn ran from the
bench player; its health reads the same way, 22 of 25), another player, and crafting at the Workshop (the recipe
file is checked by the tests).

Not checkable from the cloud: the two item pictures in the game.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new items). Open your world. | No errors. |
| 2 | Open Dr. Pollo's page before he is level 4. | "At veterinary level 4 and 80 friendship they have something special for you." |
| 3 | With him at level 4 and 80 friendship, talk to him. | He gives you the Full Healing Serum Formula. |
| 4 | At the Zoo Workshop: formula, golden apple, 2 glistering melon slices, glass bottle. | 1 Full Healing Serum (a red flask with a white cross). |
| 5 | Take some damage, then use the serum looking at nothing. | Full hearts; one serum gone. |
| 6 | Hurt a cow or a wild animal, look at it and use the serum. | "The Full Healing Serum restores the cow to full health."; hearts over it. |
| 7 | Use it again on the same animal. | "...is already at full health. The serum is not used." |
| 8 | Creative: `/give @s zoocraft:full_healing_serum` to try it without the formula. | Works the same; none used up in Creative. |

## 0.1.254: Jaylen's Hairline Painting

Austin's NPC Expansion spec: at 100/100 friendship Jaylen "unlocks the ability for that player to paint their own
hairline"; locked below that; his menu shows it once earned; his only reward. The spec leaves the interface, the
looks and the method open. **Ours, Austin's to change:** the four styles (Sharp Line-Up, Round Edge, Widow's Peak,
Lightning Bolt), the five colours (Black, Brown, Red, White, Diamond; no gold, he dislikes it), and that the hairline
is a wearable in the helmet slot (his card: "Head slot" recommended; "Always on" would replace the game's player file).
Needs a full restart of Minecraft (new items); old worlds are fine.

| # | Do this | Expect |
|---|---------|--------|
| 1 | Open Jaylen's menu below 100 friendship | No "Paint my hairline" button. His page says "At 100 friendship they have something special for you." |
| 2 | Reach 100 friendship (a chat and a liked gift each day; he likes diamonds) and open his menu | "Paint my hairline" is there. Talk also says he has something for you |
| 3 | Press it, pick a style, pick a colour | He says a line; the hairline shows on your head in third person (F5): paint over the top of the head and down to the style's edge on the forehead, sides and back |
| 4 | Look at all four styles in one colour | Sharp Line-Up: straight edge, square temples. Round Edge: curved at the corners. Widow's Peak: a point in the middle. Lightning Bolt: a deeper edge with a zigzag left bare on the forehead and each side |
| 5 | Wear a helmet, then paint | The helmet goes to your inventory, the hairline goes on. With a full inventory nothing changes and he tells you to take the helmet off |
| 6 | Paint a second time with another style | The old one is gone (also one you took off and carry); only one exists |
| 7 | Try to drop the hairline or put it in a chest | Not possible (a small lock on the item). You can take it off and put it back like a helmet |
| 8 | Die with it on | You still wear it |
| 9 | "Wipe it off" at his menu | It is gone; the button only shows while you wear one |
| 10 | Let friendship fall below 100 after earning it | The button stays: the reward is yours for good |
| 11 | Check the creative inventory and `/give` | Painted hairlines are in neither |

Not seen from the cloud (the test server shows no looks): how the paint sits on the head, over a skin's own hair
layer, and with skins that have slim or classic arms. Tell me what looks off and I'll redraw it.

## 0.1.255: Austin's playtest of 2026-11-11 (Disposery, Research Desk, the women's faces, Carrot, Terra)

Austin: "The disposery didnt work nor was it green, title said unknown when I opened it, and it looked like a normal
chest screen. Research desk should not be kept behind ailing bots friendship. ... Carrot should not have a pink bunny
nose, but you should make her a distinct girl ... for the girl skins, look how they have big eyes and no mouth ... The
attached picture is an idea for terra." Needs a full restart of Minecraft; old worlds are fine.

**The Disposery's cause (researched, not guessed):** the game titles the chest screen of an unnamed add-on entity
"Unknown" and never looks up the entity's own name, so our screen file's test on the title never matched and the
"sneak and use: Dispose" hint in the title never showed. Add-ons that do this (four checked) name the entity from
script; the title is then that name. The store is now named as it is placed, and stores placed earlier are named
within 5 seconds of a player coming near.

| # | Do this | Expect |
|---|---------|--------|
| 1 | Open a Disposery you placed before this update (stand by it a few seconds first) | Title "Disposery (sneak and use: Dispose)", not "Unknown"; the panel is green |
| 2 | Place a new Disposery and open it | The same |
| 3 | The first time you open one | A chat line tells you how to Dispose |
| 4 | Put items in, close, then sneak and use it | The Dispose page lists them; Dispose deletes them, Keep them doesn't |
| 5 | Look at a Disposery from a few blocks away | No floating name over it |
| 6 | Open a normal chest | Unchanged: its own title, the usual grey |
| 7 | Craft a Research Desk at the Zoo Workshop: 3 books over planks, crafting table, planks | Works with no Lesson Notes. Ailing Bot's 60-friendship lesson is still there to read, with no notes |
| 8 | Look at Sheila, Carrot, Amanda, Paola, Terra and Sophia | Eyes two wide and two tall with a white light, lashes, a blush, no mouth, no nose |
| 9 | Look at Carrot | No pink nose or teeth; a fringe under the hood, a pink bow on the hood, two long locks down the suit's front |
| 10 | Look at Terra | Brown bob with a long fringe, pale blue eyes, green hoodie with a pale yellow band and dark drawstrings, maroon trousers, grey shoes |
| 11 | Talk to each of the six | Their portraits match the new faces (happy, cross and creeped-out faces still draw a mouth, to show the mood) |

**Ours, Austin's to change:** Sheila got the new face too (all six women, so they match); Terra's leaves and ball
gown from her first spec are gone in favour of the picture; Carrot's bow is pink.

If the Disposery's panel is still grey with the right title, tell me: the next step is our own copy of the chest
panel (it replaces more of the game's screen, so it is held back until needed). If sneak and use still doesn't open
the Dispose page, tell me what happens instead.

## 0.1.256: the women's eyes, drawn again

Austin on the 0.1.255 faces: "Those eyes look terrible". The six women's faces now follow his own Terra picture,
measured texel by texel: each eye one texel wide and three tall (soft colour, nearly white at the bottom), a dark lash
over it, a blush under it, hair down both sides of the face, no mouth. Needs a full Minecraft restart.

| # | Do | Expect |
|---|----|--------|
| 1 | Look at Sheila, Carrot, Amanda, Paola, Terra and Sophia up close | Tall narrow soft eyes, no white squares, no mouth; hair frames the face |
| 2 | Look at Terra beside the picture | The same kind of face as the picture |
| 3 | Talk to each of them; make one happy (a liked gift), cross (a disliked one) | The talk picture has the new face; happy shuts her eyes, cross lowers her lashes |

## 0.1.257: the women's eyes, the wide shape

Austin on the side-by-side of both shapes: "The bottom eyes look way better". The six women's eyes are now two wide
and two tall, low on the face: a pale texel on the outside, the colour toward the nose, a dark fringe right over
them, a blush under the outer corner. Needs a full Minecraft restart.

| # | Do | Expect |
|---|----|--------|
| 1 | Look at Sheila, Carrot, Amanda, Paola, Terra and Sophia up close | The bottom-row eyes of previews/residents/eyes_A_vs_B_0256.png |
| 2 | Talk to each; make one happy and one cross | The talk picture has the same eyes; happy shuts them, cross slants the lash |

## 0.1.258: Clian, Carrie, Desilva, Aloof and Guido move in

Austin's NPC Expansion #16-20 spec (2026-11-11, research/ZooCraft_Tycoon_NPC_Expansion_16-20.md): "keep working on
them, and go with your suggestions, just keep a list of your suggestions so I can review later". Every call made here is
listed, numbered, in playtest/NPC_batch3_suggestions.md.

What's new:
- **Five residents** with the spec's names, likes, dislikes, attributes and goals, their own skins, four talk portraits
  each, chats, creeped-out lines and houses on the test street (now 20 houses).
- **Clian** moves in after every exhibit with animals stays clean (cleanliness 35 or more) for 14 park days in a row;
  one exhibit dropping under 35 starts it again, with a message. His job shows as "sanitation specialist" (his germ work
  and his white armor come next).
- **Carrie** moves in after every employee stays happy (paid: no wages owed) for 14 park days in a row; any wages
  owed start it again, with a message. Her job shows as "community guide" (her guiding comes after Clian's work).
- **Desilva** moves in at the third zoo problem: an animal getting out, an animal falling ill or staff going unpaid,
  each counted once as it starts, world-wide. Rude words only; she never does anything to the zoo. Her **Poison Gift**:
  when you start a chat, on a quarter of days and at most once in 3 days, she hands you a Poisonous Potato.
- **Aloof** moves in when 6 exhibits with animals have enrichment equipment (any piece the zoo counts as enrichment, or
  a Puzzle Feeder). Monkeys (gorillas) are in his likes AND his dislikes: each park day he feels one way or the other.
- **Guido** moves in at 13 exhibits with animals. His job shows as "bow collector" and he works nights. His collection
  and headquarters wait on Austin's decision.
- Each park day, the members of a zoo hear how Clian's and Carrie's goals are going, until they move in.

On the test server (BDS 1.26.62.1): on the test zoo, Aloof (6 of 6) and Guido (13 of 13) unlocked as it filled. One
park day with every exhibit clean and every keeper paid counted 1 of 14 for both; Flamingos falling under 35 sent
"Flamingos got too dirty: Clian's goal starts again" and his streak went back to 0; a keeper owed a day's wages sent
"Sam went unpaid: Carrie's goal starts again"; sick animals, the unpaid keeper and a Void Ray moved outside its
exhibit each counted as a zoo problem, and Desilva unlocked. With both streaks at 13 and one more good park day, Clian
and Carrie unlocked with the usual messages. `/zoocraft:testsetup true` built the street with all 20 residents moved
in. Desilva's Poison Gift handed over one Poisonous Potato with her line; a second try at once gave nothing (her
3-day wait). Nothing in the content log.

Not checkable from the cloud: their looks in the game.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new pictures). Open your world. | No errors. |
| 2 | Run `/zoocraft:testsetup true` in a new test world. | 20 houses; Clian, Carrie, Desilva, Aloof and Guido in the last five. |
| 3 | Look at each of the five. | Clian bald and all in white; Carrie in a red headscarf and long coat with a lantern; Desilva pale with black hair, red eyes and a black dress; Aloof with blond curls, crossed eyes and clashing clothes; Guido slick-haired in a pinstripe suit. |
| 4 | Talk to each. | Their own lines and portraits. Desilva is rude. Aloof says silly things and changes his mind about monkeys. |
| 5 | Talk to Desilva on a few different days. | Now and then she hands you a Poisonous Potato with a nasty line; never twice within 3 days. |
| 6 | In your own zoo, wait a park day with every exhibit clean and every keeper paid. | "Clian's goal: 1 of 14 ..." and "Carrie's goal: 1 of 14 ...". |
| 7 | Let an animal get out, or fall ill. | It counts toward Desilva (the Residents list shows how many of 3). |

## 0.1.259: Clian's sanitation work and the Spotless Armor

Austin's NPC Expansion #16-20 spec, Clian: "Reduces or eliminates germs in designated areas. Helps maintain sanitary
conditions. Does not collect litter. Does not remove visible dirt, mud, or animal waste." "If the add-on has an
existing germ or disease system, integrate his sanitation work with it." And his reward: three white pieces (chest,
legs, feet), no helmet, "Do not introduce unapproved abilities or potion effects", the numbers and threshold to be
decided. Our calls are numbered in playtest/NPC_batch3_suggestions.md.

What's new:
- **His round.** On his visits to the zoo, Clian walks the guest paths to the Viewing Point of an exhibit with animals
  in it and stands there sanitising it for 20 seconds. Exhibits with an animal in poor care (its illness clock running)
  come first. Then he goes on to the next one.
- **What sanitising does.** The zoo's disease is the illness clock: an animal kept in critical care for half a park day
  falls ill. For one park day after Clian sanitises an exhibit, that clock runs at half speed there, so animals in poor
  care take twice as long to fall ill. He changes nothing else: not the exhibit's cleanliness, its litter, its blocks or
  the animals' needs. The keepers still have to fix the care.
- When he sanitises an exhibit with an animal in poor care, players nearby are told. Now and then he says a line.
- His page shows how many exhibits he has sanitised and how many are sanitised now.
- **The Spotless Armor.** At 60 friendship Clian hands over a **Spotless Armor Pattern**. At the Zoo Workshop, the
  pattern with white wool and iron makes one piece:
  - **Spotless Chestplate** (a white T-shirt)
  - **Spotless Leggings** (white trousers)
  - **Spotless Boots** (white shoes)

  There is no helmet. One pattern makes one piece; when you carry none, ask him for another. The pieces protect and
  last like iron armor, repair with iron, and do nothing else.

On the test server (BDS 1.26.62.1): Measured on Mojang's dedicated server (bench bt259, steps_a.txt), on the `/zoocraft:testsetup true` street (20 residents):
- Three animals put in critical care (comfort 0) in exhibits with Viewing Points: Clian, sent to the zoo, walked the guest
  paths to the Ender Dragon's Viewing Point first (an animal in critical care there), stood 20 s, and the exhibit was
  sanitised for 1200 park seconds; then Dragons, Griffins and the Snow Golem Yard (4 sanitised on the walk, 5 protected).
- From the moment an exhibit was sanitised its animal's illness clock ran at half speed (x0.5) while the others ran at x1.
- Two matched animals (one exhibit sanitised, one not), both in critical care: clocks 30 vs 60 after 60 s, 150 vs 300
  after 300 s. Neither fell ill in the test (that takes 600, or 1200 sanitised).
- At 60 friendship his reward handed over one Spotless Armor Pattern; asking again while carrying it gave nothing.
- The Spotless Chestplate, Leggings and Boots went into the chest, legs and feet slots and read back; the head stayed empty.
- Content log: no errors.

Not checkable from the cloud: how the armor looks when worn, and the icons.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new pictures). Open your world. | No errors. |
| 2 | With Clian moved in, watch him on a zoo visit. | He walks to an exhibit's Viewing Point and stands facing it for a while, then goes to another. |
| 3 | Let an animal's care get poor (for example, no food), then watch Clian. | He goes to that exhibit first. Nearby you're told "Clian sanitised ...". |
| 4 | Open his mailbox page. | "Sanitation: N exhibits sanitised so far; M sanitised now". |
| 5 | Get to 60 friendship with him and talk. | He hands you a Spotless Armor Pattern. |
| 6 | At the Zoo Workshop: pattern + white wool + iron. | Spotless Chestplate, Leggings or Boots. |
| 7 | Wear all three. | A white shirt, white trousers and white shoes; no helmet; no effects. |

## 0.1.260: Carrie guides neighbours to each other's homes

Austin's NPC Expansion #16-20 spec, Carrie: "Carrie's occupation is guiding NPCs to other NPCs' homes." She "Uses the
existing path network", "Guides NPCs from their current location to another NPC's home", "Walks ahead or alongside
the NPC being guided", "Avoids interfering with either NPC's work schedule", "Returns to her normal routine after
completing the trip", "Does not teleport NPCs unnecessarily" and "Does not alter or damage buildings or pathways". No
rewards. Our calls are numbered in playtest/NPC_batch3_suggestions.md.

What's new:
- **Her trips.** When Carrie is at home and up (her mornings and evenings, and her shift: her leaving time until noon,
  when she waits at home for someone to guide before going to the zoo like the other day workers), she now and then
  fetches a neighbour who's at home and free and walks them to another neighbour's home along the paths.
- **How a trip goes.** She walks out of her door to the neighbour's and knocks. They come out and follow her: she walks
  ahead, waits for them if they fall behind, and they keep a step or two back. Both walk at the slower one's pace
  (Sheila's slow walk too). Near the other door she stops and steps aside, and the neighbour goes in. They visit their
  host for half a minute to a minute, standing inside the door, then walk home. Carrie walks home as soon as they're in.
- **Nobody's work is in the way.** A trip starts only when it fits everyone's day: nobody on a work shift, nobody with
  one starting before the trip is over, and nobody's bedtime coming. If a shift or bedtime comes anyway, they head home.
  The host stays in for their guest; a neighbour waiting for Carrie stays in too. Their zoo visit can come a little
  later that day.
- She makes up to 4 trips a day, with a rest at home between them. When a neighbour she guided goes in at the door,
  that's a "leading people" heart on her day.
- Pages: Carrie's says who she's fetching, guiding or seeing in, and her mailbox page counts her trips today and the
  neighbours she has shown the way. The neighbour's says where they're going or visiting; the host's says who's coming
  or visiting.
- Doors are the only blocks touched, and only by walking through them. Nobody is teleported.
- **Fix: Guido's friend gift.** It was spectral arrows, which the Bedrock game doesn't have, so it never came. It's now a
  target block.

On the test server (BDS 1.26.62.1): the `/zoocraft:testsetup true` street (20 houses), a frozen morning, then an evening and the next morning.
- Five trips, four on day one and one the next morning: Desilva to Ron, Dr. Pollo to Paola, Clian to Jaylen, Austin to Ron, then Clian to Sophia. Pairs that failed the room check (a shift or bedtime too close) were tried once and not again that day.
- Carrie walked ahead along the paths and waited at corners when the neighbour fell more than 5 blocks behind. The neighbour was never held up behind her.
- At each door she stopped short and stood 1.8 blocks clear of the neighbour's way in, then headed home. The first run had her standing 0.5 from it near a corner, which held the neighbour up for about 2 seconds; she now picks a spot at least a block from their whole walk.
- Each visit lasted 37 to 58 seconds, and then the neighbour walked home alone. The front doors were shut afterwards. "Leading people" counted on her day.
- At 12300 (too near bedtime), nobody was fetched.
- After a restart with a trip under way, all 20 were home, her trip log was kept, and trips started again.
- The target block exists in the game (the spectral arrow doesn't, which is why Guido's friend gift never came).
- Content log: no errors.

Not checkable from the cloud: how the walk looks with bodies (her stepping aside at the door, the two walking together).

| # | Do this | You should see |
|---|---|---|
| 1 | Open your world (scripts only: a world reload is enough). Stand near the residents' homes in the morning. | No errors. |
| 2 | Watch Carrie. | She walks from her house to a neighbour's door. The neighbour comes out and walks behind her. Nearby you hear her call them. |
| 3 | Follow them. | She stays ahead and waits if they fall behind. Near the other house she stops and steps aside, and says "Here we are". |
| 4 | Watch the neighbour. | They open the door, go in, shut it, and stand inside with their host. Carrie walks home. |
| 5 | Wait a minute. | The neighbour comes out, shuts the door and walks home. |
| 6 | Open the pages of Carrie, the neighbour and the host during a trip. | "showing Teddy the way to Amanda's house", "visiting Amanda at home", "at home, with Teddy visiting" (names as it happens). |
| 7 | Open Carrie's mailbox page. | "Guiding: N trips today (of 4); M neighbours shown the way so far". |
| 8 | Watch someone with a work shift about to start. | Carrie doesn't take them anywhere. |
| 9 | As Guido's friend, talk to him on a few days. | Now and then he hands you a target block. |

## 0.1.261: Guido's Bow Case and ZooCraft's fifteen bows

Austin's NPC Expansion #16-20 spec, Guido: a bow collector who "Collects and stores specialized bows, including the
Zombies mod's". Austin, 11 Nov: "I would need the bows to be able to shoot vanilla arrows. The one in twodogs shoot
custom arrows." On 12 Nov he picked "All 15" on the card ("Make ZooCraft versions of the 15 TwoDogs bows that fire
normal arrows?"). Our calls are numbered in playtest/NPC_batch3_suggestions.md (items 58 to 66).

What's new:
- **Fifteen bows of ZooCraft's own** (`zoocraft:` names, no TwoDogs needed), one for each TwoDogs Zombies bow. They
  fire the game's own arrows, from the inventory or the off hand, wear like the game's bow (384 uses) and take the
  bow's enchantments (Power, Flame and Infinity tried on the test server). Tipped arrows fire as plain arrows from them
  (the game does that for every add-on bow).
- **Each one's difference**: its TwoDogs draw time, and a power from its TwoDogs damage (the TwoDogs Bow is the game's
  bow). Power speeds the arrow up or slows it down as it leaves the bow, and the game's arrow hits harder the faster it
  flies, so it sets both reach and damage: 0.7 to 1.5 times the game's bow. Blaze arrows are set alight (as with
  Flame), Blightbloom arrows poison what they hit for 4 seconds, Panda arrows leave a trail of hearts, and the Ballista
  loads like a crossbow (draw to load, use again to fire). The TwoDogs powers (cones, homing, vexes, the sonic beam)
  don't come along: they're TwoDogs' own scripts.
- **Looks for now are ZooCraft stand-ins** in each bow's colours: an icon and three drawing pictures. The TwoDogs
  pictures replace them once Austin's laptop sends them.
- **Guido's Bow Case** (Zoo Workshop: 7 planks, glass panes and a bow). It counts only inside Guido's house. The first
  time it's opened there it becomes his and is stocked once a world with one of each of the fifteen. That's the only
  way to get them: there are no recipes for them.
- **What you may do, by friendship**: from Acquaintance (10) you can look at the collection (each bow, its wear and
  enchantments). From Friend (40) you can trade: one bow of yours (any bow or crossbow, the game's too) for one of his,
  once a day, while he's at home and up. Both bows move in one go, and the trade is checked first against what the
  pages showed, so nothing is ever doubled or lost.
- **A bow given to Guido goes into his case**, the very bow (its wear and enchantments too). With no case of his, or a
  full one (27), he hands it back. At Close Friend (70) he talks about "the family business": talk only.
- **His case stays put** while he lives there with bows in it: it can't be mined, blown up or pushed, and two hits say
  it's his collection. Another case (empty) picks up with two hits, as the Disposery does; whatever is in it drops out.
- His mailbox page shows his case: how many bows, and its room.

On the test server (BDS 1.26.62.1): - **The bows.** Every one of the fifteen fired the game's arrow, 3 full shots each at an iron golem 6 blocks away; the
  game's bow had 5. Arrows left at 2.1 blocks a tick (Short, Scrap) up to 4.5 (Longbow, Scorpion, Ballista), against the
  game's 3.0. Average hits: the game's bow 8.4; Longbow 13.0, Scorpion 12.3, Ballista 11.8, Proximity 11.4, Vexcaller
  10.6, Twin Fang 10.5, Needle 10.0; Blaze 7.0, Flurry 7.0, Panda 6.7. Three shots each are noisy, because a full
  shot's critical hit varies a lot. A separate run of 6 to 8 shots each with the game's bow settled it: arrows at half
  speed hit for 4.7 (against 8.7) and at 1.5 times speed for 11 to 12.
- Blaze Bow arrows burned and set the golem alight. Every Blightbloom hit poisoned it, and the Panda Bow drew its hearts.
  The Ballista loaded on the draw and fired on the next use. A Classic Bow with Power V and Flame hit for 16.9 and set
  the golem alight. A quick, short draw hit for 3.
- **The case, on the test street, in Guido's house on a frozen night (he was at home).** A Bow Case placed in one of
  his rooms got its store. The first open, as a stranger, showed "15 bows" and the line that he shows them to
  acquaintances. That open made it his and stocked it with one of each of the fifteen.
- As an Acquaintance, "Look at the collection" listed all fifteen, "like new".
- As a Friend, a used game bow with Power II was traded for his Longbow through the pages. The two swapped, and the bow
  went into his case as it was, with its wear and Power II. A second trade the same day got "Come back tomorrow". The
  next day the Longbow went back for the game bow. A trade whose bow had changed since the page was shown was refused,
  and nothing moved.
- A Panda Bow given through his menu gave +8 friendship and went into his case (16 bows).
- Two hits on his case got "That's Guido's collection", and it stayed. A second case in his house got "already has a
  Bow Case", and two hits picked it up. A case outside his house got "counts only inside". Mid-morning, when he was
  asleep, the trade page said so.
- His home stayed fine with the case in it: no problem at the home check, and comfort still 10. A case left in front of
  his door blocked his way as any block would ("needs fixing"); once it was picked up, his home was fine again.
- After a restart: his case, its 16 bows and its record were all kept.
- On the test server a simulated player's use of an entity doesn't reach scripts, so the bench opened the case's page
  the way a use does. The case's store has the same use action as the residents, the one that opens their menus in
  your game.
- Content log: no errors.

Not checkable from the cloud: how the bows look in the hand and in the case, and their sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new items, a new block). Open your world. | No errors. |
| 2 | Craft a Bow Case at the Zoo Workshop and put it in one of Guido's rooms. Use it. | "Guido's Bow Case", his collection: 15 bows. As a stranger, a line saying he shows it to acquaintances. |
| 3 | At Acquaintance, use it and pick "Look at the collection". | All fifteen, each "like new". |
| 4 | At Friend, with a bow in your inventory, pick "Trade a bow", your bow, then one of his. | Guido's line, and the two bows have swapped. Your bow is in his case just as it was. |
| 5 | Try to trade again the same day. | He says to come back tomorrow. |
| 6 | Shoot each new bow at a mob. | The game's arrow flies. The Longbow, Scorpion and Ballista hit hardest and fly furthest; the Short Bow and Flurry Bow draw fastest and hit lighter. |
| 7 | Shoot the Blaze Bow, the Blightbloom Bow and the Panda Bow. | Burning arrows, poison on what's hit, hearts behind the arrow. |
| 8 | Draw the Ballista, let go, then use it again. | It loads, then fires. |
| 9 | Give Guido a bow as a gift. | It goes into his case: the case's count goes up by one. |
| 10 | Hit his case twice. | "That's Guido's collection." It stays. |
| 11 | Put a second Bow Case in his house and use it. | "Guido already has a Bow Case in his house." Two hits pick it up. |

## 0.1.262: fix for 0.1.261's bows stopping the build

0.1.261's bows named the game's own bow-holding animations, which the add-on's build check can't find in the pack, so
build.cmd stopped with 30 errors (2 for each bow) and the desktop stayed on its old version. The pack now carries its
own copy of those two animations (Mojang's numbers, under ZooCraft names), and a test checks that every held item's
animations and models are in the pack, so the cloud catches this before shipping.

| # | Do this | You should see |
|---|---|---|
| 1 | Run build.cmd after applying 0.1.261 and 0.1.262. | No validation errors; 436 tests pass. |
| 2 | Close Minecraft fully, open it again, and hold any of Guido's bows, then draw it. | Held and drawn like the game's bow, in first and third person. |

## 0.1.263: every bow's TwoDogs power, with the game's arrows

Austin, 12 Nov: "I want all the abilities the same for each bow, just use vanilla arrows only instead". Each of the
fifteen keeps its 0.1.261 draw time and power, and now does what its TwoDogs original does, with the game's own arrow
only. The calls made doing it are items 70 to 84 of `playtest/NPC_batch3_suggestions.md`. The designs (the TwoDogs
looks) and the upgrade abilities follow once the TwoDogs files reach the cloud.

- **Scrap Bow**: three more arrows in a 16-degree cone, four in all. **Twin Fang**: a second arrow just beside the
  first. **Ballista**: four arrows in a tight ring. One arrow is taken from you for the shot, as ever; the extra ones
  are made by ZooCraft and vanish as soon as they land, so they can't be picked up.
- Every arrow of a volley that hits the same hostile mob counts in full. (The game counts only the biggest hit inside
  a mob's hurt time and bounces the rest off; ZooCraft adds back what it left out.)
- **Needle Bow**: a headshot (the top of the head) on a hostile mob does double.
- **Proximity Bow**: the arrow turns toward the nearest hostile mob ahead of it, within 10 blocks.
- **Vexcaller**: every hit on a hostile mob calls a vex over it that fights hostile mobs for 20 seconds (at most four
  of yours at once). It never attacks you, your animals or anyone else, you can't hurt it, and it drops nothing.
- **Sonic Bow**: a dead-straight shot that flies 64 blocks and goes on through every hostile mob in its way, with a
  trail of booms; zombies near its line are pulled onto it.
- **Scorpion**: the arrow goes on through up to seven hostile mobs.
- **Blightbloom Bow**: a spore cloud where the arrow first lands (3 blocks across each way, 5 seconds), hurting
  hostile mobs in it 5 a second. It no longer poisons.
- **Blaze Bow**: burning arrows, and a hostile mob they set alight takes 4 a second while it burns (the game's 1 and
  3 more).
- **Panda Bow**: hearts behind the arrow, as before. Short, Classic and Flurry Bows and the Longbow have no power in
  TwoDogs, and none here.
- The powers only ever go after hostile mobs that aren't the zoo's. Zoo animals, zoo and calmed mobs, residents,
  guests, pets, other players and passive mobs are hit by these bows' arrows exactly as by the game's arrow, never
  more: no volley adding up, no headshot, no homing, no vex, no pull, no cloud or burning damage, no piercing.

On the test server (Mojang's Bedrock server 1.26.62.1), with held-still zombies 6 to 14 blocks off:
- Scrap Bow: 4 arrows per shot, and every one that struck counted (in one shot two struck: the game gave 4.93 and
  bounced the other off, and its 5 was added). No extra arrow was left lying after any shot (0 in the world each time).
- Twin Fang: both arrows struck, about 18 a shot (the Classic Bow does about 8.5). Ballista: all four struck, 40 a
  shot; the game alone would have given about 13.
- Needle Bow: three head hits doubled (27.6 became 55.2); three body hits (0.7 up) weren't.
- Proximity Bow: a zombie 3 blocks to one side, aimed straight past: 3 hits of 3 (the Classic Bow: 0 of 2).
- Scorpion: three zombies in a line, all three hit by each shot. Sonic Bow: the three in line and a fourth 3 blocks
  off the line, pulled onto it and hit.
- Blightbloom: the zombie hit and one beside it each took 5 a second for 5 seconds (25); a cow beside them took
  nothing. Blaze: 1 + 3 each second it burned.
- Vexcaller: two hits, two vexes, which fought the zombie (8.9 a hit) and were gone 20 seconds later; the Bench took
  no damage.
- A cow shot with the Scrap Bow and the Needle Bow: only the game's arrows' damage, nothing added.
- An extra arrow left over (as from before a reload): gone within 5 seconds.
- No errors in the content log.

Not checkable from the cloud: the sounds and particles as you see them, and the vex's look (it's the game's vex).

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (a new mob). Open your world at night with zombies about. | No errors. |
| 2 | Shoot a zombie up close with the Scrap Bow, the Twin Fang and the Ballista. | Several arrows each shot; the zombie dies quicker than with the Classic Bow. Walk over where they landed: you only get your own arrow back. |
| 3 | Shoot a zombie in the head with the Needle Bow, then in the body. | The head shot does about double (a burst of crit sparks). |
| 4 | Shoot past a zombie with the Proximity Bow. | The arrow curves into it. |
| 5 | Hit a zombie with the Vexcaller. | A vex appears over it and fights it, leaves you alone, and fades after 20 seconds. |
| 6 | Shoot the Sonic Bow down a line of zombies. | A straight line of booms; each zombie in line is hit, and ones near the line are pulled onto it. |
| 7 | Shoot the Scorpion through a crowd. | It goes on through several. |
| 8 | Shoot the Blightbloom Bow at the ground among zombies. | A cloud of spores that hurts them for 5 seconds. |
| 9 | Set a zombie alight with the Blaze Bow. | It burns down faster than the game's fire. |
| 10 | Shoot one of your zoo animals or a cow with the Scrap Bow (don't if you'd rather not). | No more than the game's arrow would do. |

## 0.1.264: the TwoDogs looks, TwoDogs' numbers, and Guido's upgrades

From the TwoDogs files your laptop sent (Austin, 12 Nov: "I want all the abilities the same for each bow, just use
vanilla arrows only instead", "And the designs"). Every one of the fifteen bows now has its TwoDogs look and hold, and
its power works to TwoDogs' own numbers. Each also has its Signature and Upgrades I to III, which Guido sells. They
still fire only the game's arrows. The calls made doing it are items 85 to 109 of
`playtest/NPC_batch3_suggestions.md`.

- **Looks:** each bow's TwoDogs model, icon, drawing pictures and hold, and its trail and hit sparks.
- **Arrows:** a shot takes what TwoDogs' takes: the Scrap Bow 4, the Twin Fang 2, the Ballista 4. Shots fly true
  along your aim. The extra arrows still vanish where they land.
- **The powers to TwoDogs' numbers:** Scrap Bow 4 arrows fanned across 16 degrees. Twin Fang 2 arrows, 4 degrees
  apart. Ballista on the press: 4 arrows in a ring round you, straight for 32 blocks, then 0.75 s to wind back.
  Proximity Bow homes within 15 degrees and 18 blocks. Vexcaller: a vex over each mob a full draw hits, striking twice
  for 8, gone after 6 s. Sonic Bow pulls hostile mobs within 24 blocks onto its line. Blightbloom cloud 2.6 blocks,
  4 s, 5 a second. Blaze burning 4 a second for 4 s.
- **Signatures:** Short Bow explosive arrows, Scrap Bow rapid fire, Needle Bow pierces one more, Classic Bow lightning
  splash, Flurry and Panda Bow a 1 in 3 refund, Longbow scope (sneak while drawing) and +25%, Proximity Bow stronger
  homing, Twin Fang poison, Vexcaller three vexes, Sonic Bow Aftershock (pulled mobs held 2 s), Blightbloom Spreading
  Bloom, Blaze Bow Inferno, Scorpion wider bolt, Ballista 16 arrows.
- **Upgrades from Guido** at his Bow Case, from Friend, while he's home and awake. The Signature costs 600 Zoo Coins
  and each Upgrade 200, one step at a time. Upgrade I gives 10% more damage. Upgrade II makes the draw 10% quicker (the
  Scrap Bow's spread tighter, the Ballista's wind-back sooner). Upgrade III gives 20% more damage in all. The Vexcaller
  has its own: heal 1 heart a hit, then bonus hearts, then 10% more damage. The step shows under the bow's name.

On the test server (Mojang's Bedrock server 1.26.62.1), with held-still zombies 4 to 18 blocks off:
- Ballista: a ring of 4 from one press, 4 arrows used (64 to 60). A second press while it wound back did nothing. At
  its Signature, a ring of 16 for 4 arrows. With only 2 arrows it wouldn't fire.
- Scrap Bow: 4 arrows used a shot. With Rapid Fire, three presses 0.15 s and 0.85 s apart fired two volleys (8 arrows).
- Twin Fang: both arrows struck a zombie 8 blocks off (about 21). Its poison did 2 a second.
- Proximity Bow: a zombie 2 blocks to one side, 18 blocks off, aimed straight past: hit. At its Signature, one 4 to
  the side 14 off: hit.
- Sonic Bow: zombies 6 and 10 blocks off the line were set down on it and hit, and one 6 blocks behind the Bench came
  round to the front. One 30 blocks off stayed put.
- Classic Bow lightning: the 2 zombies beside the one hit took 8 each. Short Bow blast: 3 zombies took 8 each.
- Longbow: the scope's +25%, Upgrade II's full draw at 20 ticks counted, Upgrade III's x1.2.
- Vexcaller at Upgrade III: three vexes, each striking twice for 8. The Bench was healed 2 at 14 health, and got
  bonus hearts at full health.
- Blaze Bow burning 4 a second, Inferno +12. Blightbloom cloud 5 a second; Spreading Bloom burst new clouds.
- Buying from Guido: 600, then 200, 200, 200 (1500 Zoo Coins to 300), then "fully upgraded".
- No errors in the content log.

Not checkable from the cloud: the looks, holds, sparks and sounds as you see them, and the scope's zoom.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (new items and pictures). Open your world. | No errors. |
| 2 | Open Guido's Bow Case and take a few bows. Hold each, draw it, look at it in first and third person (F5). | TwoDogs' looks and holds, not the plain stand-ins. |
| 3 | Shoot the Vexcaller and the Sonic Bow at zombies at night. | Their charge sounds and sparks while drawing, a chime when full, a trail behind the arrow. A vex appears over a zombie the Vexcaller hits. |
| 4 | Press use with the Ballista (no need to hold). | It fires at once, 4 arrows round you; it needs a moment before the next. |
| 5 | Shoot the Proximity Bow just past a zombie. | A chime, and the arrow curves into it. |
| 6 | With Guido at Friend, at home and awake, open his Bow Case and pick "Upgrade a bow". | Pick a bow; he shows the Signature, its price and your balance. Buy it: the lines under the bow's name show it. |
| 7 | Upgrade the Longbow's Signature, then sneak while drawing it. | The view zooms in. |
| 8 | Upgrade the Scrap Bow's Signature, then press use quickly. | A volley each press, no draw. |
| 9 | Shoot one of your zoo animals or a cow with an upgraded bow (don't if you'd rather not). | No more than the game's arrow would do. |

## 0.1.265: no label over the Disposery

Austin, 12 Nov: "Disposery has a title for some reason, other than that, everything looks great" (his picture: the
bin with "entity.zoocraft:disposery_store.name" floating over it). That name tag is only there to give the chest
screen its title and colour (0.1.255), but the game also shows a named mob's name over it when you look at it, and
shows it as it is, not translated. Now the bin's store draws its name out to 0 blocks (the game's default is 64), so
nothing shows over the bin. The screen's title and green colour are unchanged.

On the test server (Mojang's Bedrock server 1.26.62.1): a new Disposery's store, one from before (no name), and both
after a restart all read a nameplate distance of 0 and the right name; a zombie reads the default 64. No errors in
the content log. Not checkable from the cloud: the label itself, as you see it.

| # | Do this | You should see |
|---|---|---|
| 1 | Leave your world and open it again (scripts only, no restart needed). Look at a Disposery up close. | No label over it. |
| 2 | Use it. | The green Disposery screen, titled as before. |

## 0.1.267: Jack moves in (resident 21)

Austin's NPC #21 spec (research/ZooCraft_Tycoon_NPC_21_Jack.md, with his picture research/Jack_reference.png). Jack
is a fisherman. He can move in once 4 different fish species are on display in zoo exhibits. The fish that count are
Cod, Salmon, Tropical Fish, Pufferfish, Catfish, Anglerfish, Giant Stingray and the four sharks. His look comes from
Austin's picture, with the jacket's logo left off. He likes gifts of fish, fishing rods, books, sports things (boats,
targets, snowballs, saddles) and prank things (slime, ink, cobwebs, carved pumpkins). He can't stand carrots or
fakes: anything renamed at an anvil, apart from books and name tags. A renamed stack is listed apart in the gift menu.
His first chat of the day is worth 4 friendship, and a gift he dislikes costs 8. His fishing work is 0.1.268. Our
calls are in playtest/NPC_batch3_suggestions.md, items 110 to 121.

On the test server (Mojang's Bedrock server 1.26.62.1):
- /zoocraft:build: before the zoo, Jack had 0 of 4. While it filled, "Jack can move in now! (4 different fish species
  on display.)" came of its own accord. With the zoo built, he had 4 of 4.
- /zoocraft:testsetup: "21 of 21 residents moved in", Jack among them. His house is on the west side, with a sign
  reading "Jack / Fisherman", a mailbox, a door and a bed.
- Gifts with real items. The menu listed 3 diamonds, a cod, and the 2 renamed "Diamond"s apart. The cod was liked
  (+8). A renamed diamond was a fake (-8), and it came from the renamed stack. A plain diamond was neutral (+2).
  Guido took a renamed diamond as neutral.
- No errors in the content log.

Not checkable from the cloud: his look and talk faces as you see them.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (a new skin and pictures). Open your world. | No errors. |
| 2 | With 4 kinds of fish on display (any of the eleven above, each in a finished tank), wait a moment. | "Jack can move in now! (4 different fish species on display.)" in chat. No title on screen. |
| 3 | Give him a home (a Resident Mailbox set to Move-in ON) and let him move in. Talk to him. | His curly hair, grin and navy jacket with no logo; his own talk face; his jokes. |
| 4 | Give him a cod, then the next day a carrot. | He loves the cod (friendship up 8) and mocks the carrot (down 8). |
| 5 | Rename a diamond at an anvil and open Give a Gift. | The renamed diamond is listed apart from your plain diamonds. Give it: "Nice try...", friendship down 8. |
| 6 | Or run /zoocraft:testsetup on a superflat world. | 21 of 21 residents moved in; Jack's house on the west side with a bookshelf. |

## 0.1.268: Jack's fishing spot

Jack's work (Austin's NPC #21 spec: "Jack works as a fisherman"; he dislikes "Getting skunked while fishing"). A
fishing spot is a fifth kind of Work Anchor site: a fenced area with a pond of 9 or more water blocks, floor beside it,
and a chest by the anchor. He casts from the bank holding his rod, and each fish goes into the chest with a splash: cod,
salmon, pufferfish, and now and then a tropical fish, by the game's own odds. On some mornings nothing bites at all.
A shift with casts and no fish is getting skunked: his next zoo visit starts a heart lower, and he tells you about it.
No block is ever changed. Our calls are in playtest/NPC_batch3_suggestions.md, items 122 to 130.

On the test server (Mojang's Bedrock server 1.26.62.1):
- /zoocraft:testsetup: 21 of 21 residents moved in, and 5 of 5 work sites had their worker working. Jack's fishing spot
  measured 94 blocks of floor, 25 blocks of water and 20 spots on the bank, and its Work Anchor page showed them.
- A biting morning: Jack walked from his door to the spot and cast from the bank. He landed a pufferfish into the
  chest on his first cast, and after each cast with no bite he moved along the bank.
- A skunked morning (the bench made nothing bite): 4 casts and no fish. He was skunked, and his next visit started a
  heart lower. Talking to him twice gave two different skunked lines.
- No errors in the content log.

Not checkable from the cloud: his rod, line and bobber as you see them.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (his rod is new art). Open your world. | No errors. |
| 2 | Run /zoocraft:testsetup on a superflat world. Or build your own spot: a fence with a gate round a pond of 9 or more water blocks, with a Work Anchor and a chest beside it inside, and choose Jack as its worker. | "Jack's fishing spot" sign furthest west on the test street. The Work Anchor's page shows the water in the pond and the spots on the bank. |
| 3 | In the morning, watch Jack at the spot. | He stands on the bank facing the water, holding a rod out and looking down. A dark line hangs from it to a red-and-white bobber on the water. Each fish he lands makes a splash. Nobody else holds a rod. |
| 4 | Open the chest after his shift. | Cod, salmon, pufferfish, and sometimes a tropical fish. |
| 5 | On a morning he catches nothing, talk to him that day. | One of his skunked lines ("Skunked. A whole morning on the water..."). His mailbox page says "a skunked shift at the fishing spot takes one". |
| 6 | Watch for titles. | None on screen at any point. Chat lines only. |

## 0.1.269: the Steel Rod

The first of Jack's rods (Austin, 12 Nov: "Steel rod: much more durable, takes tackle ... This should all work like
the vanilla rod"). It fishes like the game's rod, number for number, and lasts three times as long: 1,155 uses. Craft
it like the game's rod with iron ingots for the sticks, or take it from the creative menu (Equipment). Tackle comes
with the Tackle Box in the next build. Our calls are in playtest/NPC_batch3_suggestions.md, items 131 to 141.

On the test server (Mojang's Bedrock server 1.26.62.1), in survival:
- The cast flew the same path as the game's own bobber, measured side by side, to within a hundredth of a block. Cast
  level over water, it came to rest 12.7 blocks out; cast 45 degrees up, 16.3 blocks out (the game's rod: 12.8 and
  16.2).
- Ripples came in, the bobber went under, and reeling in then landed a salmon, then a cod, in the inventory, with XP
  for each. The rod wore 1 per catch.
- Reeling with the bobber on the ground wore it 2; reeling too early caught nothing; a bite left too long went back to
  waiting.
- Cast at a pig: the bobber held onto it, and reeling in pulled it and wore the rod 5.
- Walking past 32 blocks from the bobber, or switching to another item, took the bobber and line away.
- No errors in the content log.

Not checkable from the cloud: the rod and bobber pictures, the line as you see it, and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (a new item, a new mob and new pictures). Open your world. | No errors. |
| 2 | Look in the creative menu under Equipment, or craft one: 3 iron ingots and 2 string, set out like the game's fishing rod. | A Steel Rod with a grey steel rod picture. |
| 3 | Cast into water (use the rod). | The bobber flies out like the game's, with a whoosh. A thin dark line runs from the rod's tip to a red-and-white bobber that floats and bobs. Tell me if the line's end sits off the rod, in first or third person. |
| 4 | Wait for ripples to come in and the bobber to go under with a splash, then use the rod at once. | The fish flies to you in an arc and lands in your hands, with the XP sound. |
| 5 | Use the rod again before anything bites. | The bobber comes back with nothing, and the rod doesn't wear. |
| 6 | In survival, watch the rod's bar over several catches. | It drops a little each catch, far slower than the game's rod. |
| 7 | Cast at a pig or a cow, then use the rod. | The bobber holds on to it, and reeling in tugs it toward you. |
| 8 | Walk well away from the bobber, or switch to another item. | The bobber and line are gone. |
| 9 | On an anvil, add iron ingots to a worn rod, then a Lure or Mending book. | It repairs, and takes the book. |
| 10 | Watch for titles. | None on screen at any point. Chat lines only. |

## 0.1.270: Jack's blue eyes

Austin, 12 Nov: "Jack has blue eyes. Also make his hair a little darker". His eyes are now blue, and his curls are
about a fifth darker, still brown. His rod while he fishes and the rest of his look are as they were, and his four
talk faces show the same. A test checks the eyes, the hair, the rod's texels and the talk faces.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (his skin and talk faces are new pictures). Open your world. | No errors. |
| 2 | Find Jack, or run /zoocraft:testsetup on a superflat world. | Blue eyes, and dark brown curly hair, a shade darker than before. |
| 3 | Talk to him. | His talk face has the blue eyes and darker hair too. |

## 0.1.271: the Tackle Box, the lures and the Deep Sea Rod

Austin, 12 Nov: tackle for the Steel Rod (spoons for more bites, a lure for rarer catches, artificial worms for both,
slightly); "Deep sea rod: takes tackle, casts 3x as far"; and "a custom fishing workbench that looks like a tackle box
(not a full block). In its menu you put a new rod in and select its lure". The Tackle Box puts a lure on a Steel or
Deep Sea Rod, takes it off, and makes the three lures. Jack sells them from Friend. Our calls are in
playtest/NPC_batch3_suggestions.md, items 142 to 152.

On the test server (Mojang's Bedrock server 1.26.62.1), in survival:
- At the Tackle Box the Bench made a Spoon, a Spinnerbait and an Artificial Worm from what it carried. A second Spoon
  was refused, saying what was missing.
- A Spoon went on the Steel Rod and its description read "Lure: Spoon". A Spinnerbait in its place gave the Spoon
  back. The worm went on the Deep Sea Rod, and "Take it off" gave the Steel Rod's Spinnerbait back.
- The Deep Sea Rod's level cast came to rest 38.2 blocks out (the Steel Rod's 12.7), and one 45 degrees up 56.9. It
  fished with the worm's half levels of Lure and Luck of the Sea, and a pufferfish from 57 blocks out landed in the
  inventory.
- On the test street: at Acquaintance, Jack's menu had no Buy Tackle; at Friend it did. A Spoon took 150 coins from
  the park and a worm 100, and both went into the inventory.
- No errors in the content log.

Not checkable from the cloud: the box, the lures and the Deep Sea Rod as you see them, and an anvil with a lure on.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (a new block, four new items and new pictures). Open your world. | No errors. |
| 2 | Craft a Tackle Box (a chest, an iron ingot on top and 2 green dye) and place it on the floor or a table. | A small green box with a handle and two latches, facing you. Not a full block. |
| 3 | Use it. | Its page lists your Steel and Deep Sea Rods with their lures, and Make a lure. |
| 4 | Make a lure: a Spoon (2 iron nuggets, 1 gold nugget), a Spinnerbait (1 iron nugget, 1 gold nugget, 2 string) or an Artificial Worm (a slimeball, pink dye). | One lure each time, and the things it took gone. |
| 5 | Pick a rod and put a lure on it. Then put another one on in its place. | The rod's description says "Lure: ...", and the first lure is back in your pack. |
| 6 | Fish with a Spoon on, then with a Spinnerbait on. | With the Spoon, bites come sooner. With the Spinnerbait, a little more treasure and less junk. |
| 7 | Take the lure off at the box. | The rod is bare again and the lure is back in your pack. |
| 8 | Craft a Deep Sea Rod (a Steel Rod, a nautilus shell, 2 prismarine shards) and cast it over a big lake. | It casts about three times as far as the Steel Rod, and the line still reaches it. |
| 9 | At Friend or better, use Jack and pick Buy Tackle. | A Spoon or Spinnerbait for 150 coins and a worm for 100, from the park's coins. |
| 10 | Repair or enchant a rod with a lure on at an anvil. | Tell me if the lure stays on. |
| 11 | Watch for titles. | None on screen at any point. Chat lines only. |

## 0.1.272: Jack's Flint and Steel, the sea portal and the fishing sky

Austin, 12 Nov: "a modified flint and steel (ruby and saffron) lights a portal framed like a nether portal but of
prismarine", into a fishing dimension of floating islands; "All islands should look cool, and we need to make sure
each seed generates them randomly." This version builds the common islands (grass, dirt, normal water). The places of
every other kind are already fixed by the world's seed, so the uncommon, rare, exotic and mythic islands that come
next won't move anything. Our calls are in playtest/NPC_batch3_suggestions.md, items 153 to 165.

On the test server (Mojang's Bedrock server 1.26.62.1):
- Jack's Flint and Steel lit a 4 by 5 frame of prismarine along x, and a 7 by 6 frame along z of bricks and dark
  prismarine with no corners (20 portal blocks). A frame with a stone in it stayed dark, and a chat line said what
  the lighter lights. Each light took 1 use.
- In survival the Bench stood in the portal 4 seconds. The island it opens onto was built while it waited (128,166
  blocks in 1.8 seconds, a little each tick). The Bench came out standing in a prismarine portal on that island.
- Stepping out and back in for 4 seconds took it back to the spot it left in the Overworld. In creative it went at
  once.
- Dropped below the island, it was caught and sent back to the Overworld portal, falling slowly, and it stayed there
  until it stepped out.
- Breaking a frame block (in creative, holding the lighter) put that portal out, and so did TNT by the other frame.
- Jack gave the lighter at 100 friendship and not at 99. Once it was gone from the inventory, he gave a spare.
- No errors in the content log.

Not checkable from the cloud: the portal, the lighter, the sky and the islands as you see them, and the sounds. We
rendered the islands from their own rules to check their shape (previews/fishing in the project files).

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again (a new dimension, block, item and pictures). Open your world. | No errors. |
| 2 | Take Jack's Flint and Steel from the creative inventory (Equipment), or get to 100 friendship with Jack. | A flint and steel with a gold ring and a ruby flint. Jack says it's his biggest secret. |
| 3 | Build an upright frame of prismarine (any of the three kinds, mixed) 4 wide and 5 tall, corners optional, and use the lighter on the inside of it. | A sea-green swirling portal fills it, with a strike sound. The lighter loses 1 use. |
| 4 | Use the lighter on a frame with a gap, or on anything that isn't prismarine. | Nothing lights. A chat line says once what it lights. |
| 5 | Stand in the portal (survival). | After 4 seconds a sea-green fade, and you're on a floating island in a bright sky, standing in a prismarine portal. |
| 6 | Look around and walk the island. | Grass with oak and birch trees, flowers, a pond with lily pads and sugar cane, small floating rocks beside it, and a stone underside with hanging roots. Other islands in the distance as you go near them. |
| 7 | Step out of the portal, then back in for 4 seconds. | Back where you went in, in the Overworld. |
| 8 | Go again, then jump off the island's edge. | Caught under it and sent back to the Overworld portal, falling slowly. |
| 9 | Break one block of a lit frame. | The portal goes out. |
| 10 | In creative, walk into a portal. | You go through at once. |
| 11 | In a new world with another seed, go through a portal. | Islands of other shapes, in other places. |
| 12 | Watch for titles. | None on screen at any point. Chat lines only. |

## 0.1.273: the rods cast like the game's

Austin, 12 Nov: "The cast is very laggy and a straight line. I need to find a way to make it work like the vanilla
casts, and have smooth animations and transitions." What changed, for the Steel Rod and the Deep Sea Rod:

- The line hangs on the game's own curve, drawn in 16 pieces, where it was one straight stick.
- In first person, the line's rod end is placed from your own view every frame, so it stays on the rod's tip as
  you walk and turn. Before, it came from the server 20 times a second and lagged behind the view. In third person,
  and for other players, it still comes from the server.
- Your arm swings when you cast and when you reel in, as with the game's rod.
- The bobber's position is sent every tick, where it could skip up to 7. It glides to rest on the water and glides
  after a hooked mob, where it used to hop.

Our calls are in playtest/NPC_batch3_suggestions.md, items 166 to 170.

On the test server (Mojang's Bedrock server 1.26.62.1):
- A level cast over water flew the game's arc, landed 11.7 blocks out and glided to rest 12.7 out in a second.
  Its speed fell smoothly every tick with no jumps, and it lay still once it settled.
- A bite reeled in 3 ticks later gave a cod for 1 wear and some XP. A cast into the ground cost 2 wear.
- A cast into a cow hooked it. The bobber glided onto its head and followed it as it ran. Reeling pulled it in for
  5 wear.
- The swing played with no error.
- No errors in the content log.

Not checkable from the cloud: how the line, the swing and the flight look on screen. The tests check the line's
shape (the 16 pieces meet end to end on the game's curve, from the bobber to the rod tip).

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again. Open your world. | No errors. |
| 2 | In first person, hold a Steel Rod and cast over water. | Your arm swings. The bobber flies in a smooth arc, and the line hangs in a curve from the rod's tip. |
| 3 | While it floats, walk sideways and turn your view. | The line's end stays on the rod's tip with no jitter, and the line keeps hanging. |
| 4 | Watch it land. | It glides to rest on the water with no hops, then bobs. |
| 5 | Reel in on a bite. | Your arm swings and the catch flies to you. |
| 6 | Press F5 for third person and cast again. | The line runs from near your hand to the bobber. It may trail a little as you turn (the server's rod tip). |
| 7 | Cast the Deep Sea Rod far out. | A long, smooth arc. The line hangs all the way out. |
| 8 | Cast at a pig or cow. | The bobber catches on it and stays on its head as it walks, with no hops. Reeling pulls it to you. |

## 0.1.274: the fishing sky's uncommon islands, with red and blue amethyst

Austin, 12 Nov: "Uncommon: red and blue amethyst", with grass that has amethyst "worked through it for a mythical
feel, in purple and two new colours", the game's own amethyst pictures with only the colours changed, glowing and
chiming like the game's amethyst and dropping red and blue shards, and "Every kind of island has its own catch". What
changed:

- About one island in four in the fishing sky is now an uncommon island, built the first time you come near it, the
  same way the common ones are. Each one is mostly one colour (purple, red or blue) with some of the other two.
- On it: spires of amethyst with clusters on top, one or two open geodes lined as the game's are (amethyst, then
  calcite, then smooth basalt), crystals hanging under the island, patches of amethyst in the grass, a few trees,
  ponds, and flowers in purples, blues, pinks and whites.
- Red and blue amethyst come in the game's six blocks each: the block, budding amethyst, three buds and the cluster,
  plus a shard. They glow, sound, grow and drop as the game's amethyst does. Four shards craft the block.
- Fishing from an uncommon island brings up its own junk and treasure: red, blue and purple shards and clusters mixed
  in with the game's own. Fish are still the game's.
- Common islands are exactly as before.

Our calls are in playtest/NPC_batch3_suggestions.md, items 171 to 178.

On the test server (Mojang's Bedrock server 1.26.62.1):
- The nearest uncommon island (red, 114 blocks across) was built in 2.3 seconds, 131,050 blocks. Checked block by
  block against the plan: all match except 6 grass blocks under the 6 trees, which the game turns to dirt as it does
  for any tree. Every bud and cluster faces the right way.
- Fishing its pond with junk and treasure only gave blue shards twice, a lily pad and a saddle.
- Every new block and item loads. Drops: a cluster by hand gave 2 shards; with a pickaxe 4; with Fortune III 12, 8
  and 8; with Silk Touch the cluster. A bud gave nothing, and a bud with Silk Touch gave the bud. The block gave
  itself to a pickaxe and nothing by hand or to a Silk Touch shovel. Budding gave nothing even to Silk Touch. Nothing
  dropped in creative. The game's own cluster, broken beside them, gave the same counts.
- Breaking the block under a cluster popped it off (2 shards), and one hanging under it and a bud on its side too.
  TNT dropped the block and 2 shards per cluster. Clearing them with /fill or /setblock dropped nothing.
- With random ticks sped up, budding red amethyst grew clusters on all six sides, like the game's budding amethyst
  beside it. Budding blue under water grew a cluster in the water.
- No errors in the content log.

Not checkable from the cloud: how the islands, the crystals' glow and the new pictures look on screen. Pictures of
three islands made from the same rules are in previews/fishing (uncommon_island_big.png, uncommon_island_small.png,
uncommon_island_other_seed.png), with the new blocks in red_blue_amethyst.png.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again. Open your world. | No errors. |
| 2 | Go through the sea portal. In creative, fly out from the island you arrive on. | About one island in four is a crystal island: tall spires of purple, red or blue amethyst. |
| 3 | Land on one and look round. | Clusters on the spires, an open geode in the grass, amethyst patches, flowers, trees, a pond, and crystals hanging under the island. |
| 4 | Wait for night. | The buds and clusters glow. |
| 5 | In survival, break a red cluster by hand, then one with a pickaxe, then one with a Fortune pickaxe. | 2 red shards, then 4, then 4 to 16. |
| 6 | Break a red cluster with a Silk Touch pickaxe. | The cluster itself. |
| 7 | Break the amethyst block under a cluster. | The cluster pops off and drops its shards. |
| 8 | Break budding red or blue amethyst with Silk Touch. | Nothing drops, as with the game's budding amethyst. |
| 9 | Fish in a crystal island's pond for a while. | Now and then red, blue or purple shards or a cluster instead of the game's junk or treasure. |
| 10 | Put 4 red shards in a crafting table. | A Block of Red Amethyst. |
| 11 | Look in the creative inventory. | The red and blue blocks, buds, clusters and shards, with their names. |

## 0.1.275: the fishing sky's rare islands, blackstone and gold with purple water

Austin, 12 Nov: "The rare biome can have crying obsidian, and blackstone, gilded blackstone, some gold stuff as well,
with a purply colored water", and "Every kind of island has its own catch". What changed:

- About one island in eight in the fishing sky is now a rare island, built the first time you come near it, the same
  way the others are. Common and crystal islands are exactly as before.
- On it: blackstone ground with patches of crimson nylium, crimson roots and fungi, huge crimson fungi for trees (with
  shroomlights in their caps and weeping vines under them), gilded blackstone in the ground, a ruined portal of
  obsidian and crying obsidian (two on a big island) with worked blackstone, fallen pieces and gold blocks round it,
  broken blackstone pillars with gold blocks on some, basalt columns in the stone, gold in the stone, weeping vines
  hanging underneath and crying obsidian weeping from the underside.
- Its pond is bigger than a common island's, and purple. The game gives all the water in one biome one colour and the
  fishing sky is one biome, so a true purple can't be done. Instead the pond has a magenta and purple bed, the sky's
  water is a little clearer everywhere so the bed shows through, and over a rare island the water fog is purple, so
  it's purple under the water too. With the Diving Helmet on, its clear fog turns purple there.
- Fishing from a rare island brings up its own junk and treasure: blackstone, gold nuggets and ingots, gilded
  blackstone, crying obsidian, golden apples and carrots, gold blocks, and rarely netherite scrap, the Pigstep disc or
  an enchanted golden apple, mixed in with the game's own. Fish are still the game's.
- A sea portal now keeps opening onto the island it already opened onto (any island already built near where it
  leads), so a new kind of island being nearer doesn't move where your portal goes.

Our calls are in playtest/NPC_batch3_suggestions.md, items 179 to 188.

On the test server (Mojang's Bedrock server 1.26.62.1):
- The nearest rare island (about 80 blocks across) was built in 0.9 seconds, 38,953 blocks. Checked block by block
  against the plan, every block matched, the pond's water included (none ran into the stone).
- Over the rare island the purple fog was on (removing it by command found it); away from the island over open sky
  it was off; back over the island it was on again. In the Overworld there was none.
- Fishing its pond with junk and treasure only gave gilded blackstone, gold ingots, blackstone, a bow, a bowl and an
  enchanted book.
- Rolling the rare tables 500 times each gave every item listed (4 enchanted golden apples, 9 Pigstep discs, 21
  netherite scrap among the treasure).
- No errors in the content log.

Not checkable from the cloud: how purple the pond looks and how the fog looks on screen. Pictures of three rare
islands made from the same rules are in previews/fishing (rare_island_big.png, rare_island_big_side.png,
rare_island_small.png, rare_island_other_seed.png). The pond's colour there is my estimate of the game's.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again. Open your world. | No errors. |
| 2 | Go through the sea portal. In creative, fly out from the island you arrive on. | Now and then a dark blackstone island with red fungi on it. |
| 3 | Land on one and look round. | Blackstone and red nylium, huge crimson fungi, a broken obsidian portal with gold blocks near it, pillars, gold specks, a big pond, vines hanging under the island. |
| 4 | Look at its pond from the bank. | The water looks purple, not blue. |
| 5 | Swim under the pond's water. | A purple haze under the water. |
| 6 | Do it again wearing the Diving Helmet. | A clear view, tinted purple. |
| 7 | Fly to a common island and swim in its pond. | The usual blue haze under the water. |
| 8 | Look at a common island's pond. | Normal water, a little clearer than before. |
| 9 | Fish in a rare pond for a while. | Now and then blackstone, gold nuggets or ingots, gilded blackstone or crying obsidian instead of the game's junk or treasure. |
| 10 | Stand under a rare island. | Purple drops falling from crying obsidian on its underside. |
| 11 | Use a sea portal you'd been through before this update. | It takes you to the same island as before. |

## 0.1.276: the fishing sky's exotic islands, with Diamond Shards

Austin, 12 Nov: "The exotic biome will be a circled pool of water, relatively large, with large vibrant green weeping
willows around it, there is a place for the angler to stand there as well. This shoud be a very lush island, with
diamond shards sprinkled around as well. 9 Diamond shards can create a diamond." What changed:

- About one island in fifteen in the fishing sky is now an exotic island, built the first time you come near it, the
  same way the others are. Common, crystal and rare islands are as before (their trees now always grow; see below).
- In its middle is a big round pool, 22 to 44 blocks across and up to 6 deep, with a sand and clay bed, lily pads in
  the shallows and seagrass in the deep.
- Round the pool stand 4 to 9 Weeping Willows: big ones on 2-wide trunks and smaller ones, with bright green leaves,
  strands hanging down to the ground and the odd spore blossom under them. Farther out on a bigger island there are
  azalea trees, some flowering.
- The angler's spot is a spruce dock, 5 to 9 long, running from the bank nearest the portal out over deep water, with
  a lantern on each far corner and a barrel at its foot.
- The ground is grass with patches of moss, covered in flowers of every colour, tall flowers, ferns, pink petals,
  moss carpet, azalea bushes, reeds at the water and the odd firefly bush. Glow berries hang under the island.
- Diamond Shards lie about the island (18 to 28 of them): small light blue crystals, like the game's amethyst buds in
  diamond colours, glowing a little. Each drops one Diamond Shard (more with a Fortune pickaxe; the block itself with
  Silk Touch) and pops off if the block under it goes. Nine Diamond Shards in a crafting table make a diamond.
- Fishing from an exotic island brings up its own junk and treasure: moss, lily pads, glow berries, azaleas, seagrass,
  pink petals and spore blossoms as junk; Diamond Shards, emeralds, nautilus shells, and rarely a diamond, a golden
  apple, a heart of the sea or the Otherside disc as treasure, mixed in with the game's own. Fish are still the game's.
- Two fixes found while testing: the common and crystal islands' trees now always grow (a flower right beside a trunk
  had stopped about 1 tree in 18), and an island that was slow to load no longer stops every island after it from
  being built (on the test server the third island in a row could wait for ever; now it waits a few seconds).

Our calls are in playtest/NPC_batch3_suggestions.md, items 189 to 199.

On the test server (Mojang's Bedrock server 1.26.62.1):
- Three exotic islands were built (the bench world's nearest, about 76 blocks across, in 1.1 seconds, 46,610
  blocks), checked block by block against the plan: every block matched apart from the grass the game turns to dirt
  under each tree and a plant or two under the leaves. All 17 of their trees grew.
- Diamond Shards broken by hand, with a pickaxe, popped off from below and from above, and blown up: 1 shard each.
  With Silk Touch: the block. With Fortune III: 1 each of three times (it gives more 3 times in 5).
- Fishing off the dock gave emeralds, a bow, a fishing rod, rotten flesh and a saddle; the exotic tables rolled 500
  times each gave every item listed (226 shards in 500 treasures).
- Ten islands built in a row while standing in the fishing sky: all built, the longest wait 4 seconds. All 35 trees of
  a common island grew.
- No errors in the content log.

Not checkable from the cloud: how the willows, strands and shards look on screen. Pictures of three exotic islands
made from the same rules are in previews/fishing (exotic_island_big.png, exotic_island_big_side.png,
exotic_island_small.png, exotic_island_other_seed.png); they draw each tree as a block of leaves.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again. Open your world. | No errors. |
| 2 | Go through the sea portal. In creative, fly out from the island you arrive on. | Now and then a green island with a big round pool ringed by bright green willows. |
| 3 | Land on one and walk round the pool. | Willows with strands hanging to the ground, flowers everywhere, moss patches, lily pads, azalea trees farther out. |
| 4 | Find the dock and walk to its end. | Spruce planks over deep water, lanterns on the two far corners, a barrel at its foot. |
| 5 | Look for small light blue crystals on the grass and break one by hand. | One Diamond Shard. |
| 6 | Break one with a Silk Touch pickaxe, and one with a Fortune III pickaxe. | The Diamond Shards block; then 1 to 4 shards. |
| 7 | Put 9 Diamond Shards in a crafting table, filling the grid. | A diamond. |
| 8 | Fish off the end of the dock for a while. | Now and then moss, lily pads or glow berries as junk, and Diamond Shards or emeralds as treasure. |
| 9 | Look under the island. | Glow berries hanging down. |
| 10 | In creative, fly fast past several islands in a row. | Each one appears within a few seconds; none is missing. |
| 11 | Look at a common island's trees beside flowers. | Every tree full grown. |

## 0.1.277: the fishing sky's mythic islands, the Shark People's town

Austin, 12 Nov: the mythic island is "super rare", an "advanced fishing civilization of Shark People that speak",
friendly-looking, with a city like the picture he sent (research/Mythic_island_reference.png), only smaller. This
version builds the town; the Shark People who live in it come next (0.1.278). What changed:

- Mythic islands are now built, the first time you come near one, the same way the other islands are. They are
  rare: about 1 region of the fishing sky in 100 (a region is 512 by 512 blocks), and every world has one for sure
  2,000 to 4,000 blocks from the sky's middle. No sea portal ever opens onto one: you find it by travelling the sky.
- Each one is a round island 92 to 112 blocks across, a golden city in rings like the picture: a lagoon in the
  middle, the town round it, a white quartz wall round the town, a ring of sea outside the wall and a sand beach with
  palm trees round the edge.
- The wall is 2 thick with a walkway and battlements on top, lanterns along it and about 14 towers with gold domes.
  Its one gate faces one of four ways, with a gatehouse, two taller towers, a gold-framed arch and blue banners. A
  lit causeway crosses the sea from a paved plaza on the beach to the gate.
- Inside: a paved street along the wall, 12 to 14 houses (round and square, white quartz and sandstone, each with a
  gold or light blue dome, a doorway facing the lagoon, glass windows, a plank floor and a lantern), an avenue from
  the gate to a quay round the lagoon, and opposite the gate the palace: pillars, light blue windows, a golden
  doorway, a blue carpet to a gold seat, four corner towers and the tallest dome in town.
- The lagoon has three piers with lanterns, a column in the middle with a gold cap, sea lanterns glowing on its bed
  and two small boats. Three to five sailboats sit on the sea outside the wall, with live coral and seagrass on the
  sand under them. Palms, flowers, pink petals and flowering azalea bushes fill the gaps.
- Fishing from a mythic island brings up its own junk and treasure: prismarine shards and crystals, gold nuggets,
  kelp, sea pickles, ink sacs, glow ink sacs and turtle scutes as junk; nautilus shells, gold ingots, a heart of the
  sea, sea lanterns, and rarely a diamond, a golden apple, a trident, an enchanted golden apple or a conduit as
  treasure, mixed in with the game's own. Fish are still the game's.
- A test command, /zoocraft:mythic (cheats on), says in chat where the nearest town is and which way its gate faces;
  /zoocraft:mythic true builds it if it isn't yet and takes you to the plaza outside its gate, facing the town.
- The other islands are exactly as they were: same places, same shapes, and a sea portal leads where it led before.

Our calls are in playtest/NPC_batch3_suggestions.md, items 200 to 212.

On the test server (Mojang's Bedrock server 1.26.62.1):
- The bench world's nearest town (94 blocks across, 1,752 blocks from the sky's middle, its gate to the east) was
  built in 2.5 seconds, 109,663 blocks, and checked block by block against the plan: all 108,789 blocks it checks
  matched, every block's state too (the first try found sand falling, coral dying and wall lanterns dropping, because
  they went in before what holds them up; they now go in after it).
- /zoocraft:mythic gave the right place and gate, and /zoocraft:mythic true took the player to the plaza facing the
  gate.
- No errors in the content log.
- Not fished there on the test server: the two catch tables are the exotic island's kind and are checked by the
  tests. Eight towns from eight seeds are checked by the tests too: the wall closed but for the gate, every house,
  the palace and the quay reachable on foot from the plaza, nothing floating, no water leaking out.

Not checkable from the cloud: how it looks on screen. Pictures of three towns made from the same rules are in
previews/fishing (mythic_island_big.png, mythic_island_big_side.png, mythic_island_big_top.png from above,
mythic_island_small.png, mythic_island_other_seed.png).

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again. Open your world with cheats on. | No errors. |
| 2 | Type /zoocraft:mythic | A chat line: where the nearest Shark People's town is, how far, and which way its gate faces. |
| 3 | Type /zoocraft:mythic true | After a moment you stand on a paved plaza on a sand beach, facing a causeway to a gold-framed gate. |
| 4 | Walk across the causeway and through the gate. | Lanterns along the causeway, blue banners and gold-domed towers at the gate. |
| 5 | Walk round the street inside the wall. | 12 to 14 white houses with gold or light blue domes, doorways facing the lagoon, a lantern in each. |
| 6 | Cross to the palace opposite the gate and go in. | A blue carpet to a gold seat, light blue windows, the tallest dome. |
| 7 | Climb onto the wall. | A walkway with battlements, lanterns, towers along it; the sea, boats and palms outside. |
| 8 | Look at the lagoon from a pier. | Sea lanterns glowing on its bed, a column with a gold cap in the middle, two small boats. |
| 9 | Look at the sea outside the wall. | Sailboats, live coral and seagrass on the sand. |
| 10 | Fish from the quay or a pier for a while. | Now and then prismarine, gold nuggets or sea pickles as junk, and nautilus shells or gold ingots as treasure. |
| 11 | Come back at night. | The town lit: wall, causeway, plaza, quay and houses. |
| 12 | Light a sea portal anywhere. | It opens onto an ordinary island, never onto the town. |

## 0.1.278: the mythic towns' Shark People

Austin, 12 Nov: "there will be an advanced fishing civilization there. They are the shark people from the exotic
formations, but they can speak, and are passive. Adjust their look to be more friendly as well." What changed:

- The Shark People now live in every mythic town: an Elder in the palace before the gold seat, two guards at the
  palace door and two outside the gate, a fisher at the end of each of the three piers, and one in every house (20 to
  22 in a town). They appear the first time you come to a town, towns built by 0.1.277 included.
- They are the cave Shark People's own model with a friendlier look: round eyes with whites, a closed, smiling mouth
  with no teeth showing, a lighter blue, and white and gold clothes (a tunic, a fisher's shirt with a blue apron and a
  straw hat band, a guard's gold breastplate, the Elder's long robe and gold circlet). They wave when you stand close.
- They are passive. They never attack; hurt one and it runs off ("Hey! We're friendly here!"). One who dies is back in
  their place the next day. They drop nothing.
- They talk, in chat only (nothing over their heads, nothing on the screen): press Talk on one and they say a line with
  their name, like Elder Cove: "...". The first time you meet each one they welcome you; after that they talk about the
  town, give fishing tips, tell of the other islands and of their cousins in the caves, and say goodnight at night.
  Each town has its own name (Kelpport, Pearlhaven and so on) and each of its people a sea name.
- Gifts: the Elder gives you a nautilus shell the first time you meet; each fisher gives you one or two cooked cod or
  salmon once a day.
- By day the people of the houses stroll about the town near their house; at night they go home and stay in. The
  fishers, guards and Elder keep their places, walk back if pushed or scared off, and turn back to face their way once
  nobody is close. Once a day the nearest one greets you when you come inside the wall.
- The cave Shark People of the Exotic Formation are as they were.

Our calls are in playtest/NPC_batch3_suggestions.md, items 213 to 224.

On the test server (Mojang's Bedrock server 1.26.62.1), in the bench world's town (Kelpport):
- All 20 were placed within 4 seconds of arriving, each in its place facing its way, with the right look.
- Over 45 seconds by day the people of the houses strolled up to 7.3 blocks from home and no farther; the others
  stayed on their spots.
- Talking: the Elder's welcome and a nautilus shell, then a different line and no second shell; a fisher's welcome and
  a cooked cod, then a tip and no second fish; a guard's and a resident's welcomes, then other lines. A first greeting
  coming into town, a "welcome back" the next day.
- A guard hurt by the player said so in chat, ran 7 blocks and walked back to its post. One killed stayed gone that day
  and was back the next. A second one put in the same place was taken away on the next pass.
- At night every one of the house people went home (within half a block of their spot inside the door) within 30 to 40
  seconds, and went out again in the morning.
- No errors in the content log.

Not checkable from the cloud: how they look and wave on screen, and their voices. A picture of the four looks, made from
the same pictures and model, is previews/fishing/shark_townsfolk_0278.png (front, then side).

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again. Open your world with cheats on. | No errors. |
| 2 | Type /zoocraft:mythic true | You stand on the plaza by the gate. Two guards in gold breastplates stand either side of the gate. |
| 3 | Walk into the town. | A chat line from the nearest Shark Person welcoming you, with the town's name. |
| 4 | Look at the people walking about. | White and gold clothes, round eyes, a smile; one waves when you stand close. |
| 5 | Press Talk on one of them twice. | A welcome in chat with their name, then a different line. Nothing on screen. |
| 6 | Go into the palace and talk to the Elder before the gold seat. | A welcome, and a nautilus shell in your inventory. |
| 7 | Talk to a fisher at the end of a pier, twice. | One or two cooked cod or salmon the first time, a fishing tip the second. |
| 8 | Hit one once. | It says something in chat and runs off; a guard or fisher walks back to its spot. |
| 9 | Stay until night. | The people of the houses go inside their houses; the guards stay at their posts. |
| 10 | Visit the Exotic Formation caves. | The cave Shark People are as hostile as before. |

## 0.1.279: the closer sky

Austin, 13 Nov: "the islands to be 33% closer, right now they are very spaced apart. Or use your judgement if you
think 33% is too much". What changed:

- The fishing sky's islands are now about 166 blocks apart middle to middle instead of about 224, and the open sky
  between neighbours is about 70 blocks instead of about 126. The full third closer would have dropped 1 island in 10
  and shrunk the rest to keep them from touching, so this is a little less than a third, with almost every island
  kept at its full size.
- Islands never touch: two always have their land and floating rocks apart, plus 4 blocks.
- Patches of empty sky where an island could be are rarer (1 in 20 instead of 1 in 8).
- The kinds are as rare as before for each island. There are just more islands to pass.
- Islands your worlds already built stay where they are, as they are, and your old portals still take you to the same
  island. The new islands round them move aside to fit, so they are as close there as anywhere else.
- A map of the sky from above, before and after, is previews/fishing/sky_spacing_0279.png (green common, purple
  uncommon, red rare, teal exotic; the grey rings are the huge islands still to come).

Our calls are in playtest/NPC_batch3_suggestions.md, items 225 to 233.

On the test server (Mojang's Bedrock server 1.26.62.1), with a world made on 0.1.278 (a portal onto an island, the two
islands beside it, and the mythic town with its 20 people) and then opened on 0.1.279:
- The 4 islands it had built were kept. Its old portal still took the player to the same island and the same return
  portal.
- A new island was built 190 blocks from that island, with 128 blocks of open sky between them. None of the new
  islands came nearer an old one than both their reaches.
- The town's 20 people took their places, and /zoocraft:mythic worked. (A town's people were also checked on their
  own: closed and reopened, all 20 were still there, each in their place.)
- A new portal lit 9,000 blocks away opened onto one of the new islands. Its neighbours were built 154, 178 and 226
  blocks away, with 85 to 142 blocks of open sky between, and nothing touching.
- Working out the islands of a new place took 4 ms, and finding a portal's island 10 ms.
- No errors in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again. Open a world that already has fishing islands. | No errors. |
| 2 | Go through your old sea portal. | The same island and return portal as before. |
| 3 | Look around from that island. | New islands about 70 blocks of open sky away, none touching yours. |
| 4 | Fly from island to island for a while. | An island every 160 to 180 blocks or so, at different heights. |
| 5 | In the Overworld, light a sea portal 2,000 or more blocks from your old one and go through. | A new island with neighbours close by. |
| 6 | Type /zoocraft:mythic | It says where the nearest mythic town is. |

## 0.1.280: the huge islands, the harbours

Austin, 12 Nov: "All islands need to be randomly generated and should all be relatively big. Some being huge with
builds on them (fishing ships, submarines, etc)". What changed:

- The fishing sky's huge islands (200 to 260 blocks across, 1 region in 12) are built now. Each has a round harbour
  cut into one side, about 75 to 95 blocks across, sealed so no water runs out.
- Round the harbour: a stone quay with lamp posts, a paved promenade, three piers with lanterns (the middle one runs
  out to the submarine, with the harbour bell near its end), a crane, two fish stalls, four fishing huts, a fish store
  full of barrels, and a red and white lighthouse on the far side with a ladder up to its light.
- In the harbour: two trawlers (a wheelhouse with a chart table and a chest, a hold with a hatch and a ladder down,
  a net drum, a gantry over the stern, a mast with a flag), a submarine (a conning tower with a hatch and a ladder
  down, a periscope, planes, a copper propeller, portholes; inside, a torpedo room, a control room, bunks with a
  chest and an engine room), 3 to 5 sailboats, red and green buoys with lights, and two boats you can take out.
- The first trawler's skipper always keeps a Deep Sea Rod in the wheelhouse chest. The other chests have fish,
  string, coal, iron, redstone, lures, now and then an enchanted book, a heart of the sea, a trident or diamonds.
- A rod cast into a harbour brings up the harbour's own catch: the fleet's lost gear, lures, nautilus shells,
  emeralds, compasses and spyglasses, mixed with the game's own junk and treasure.
- No portal opens onto a huge island. Type /zoocraft:harbour to hear where the nearest one is, or /zoocraft:harbour
  true to be taken there (it builds it first if it isn't yet).
- The game keeps at most 300 chunks loaded for an add-on, and a huge island needs about 480, so it is built a
  quarter at a time.
- Pictures: previews/fishing/harbour_island_0280.png, harbour_island_other_seed.png, huge_island_0280.png and
  huge_island_0280_side.png.

Our calls are in playtest/NPC_batch3_suggestions.md, items 234 to 245.

On the test server (Mojang's Bedrock server 1.26.62.1), /zoocraft:harbour true built the nearest huge island (r 126,
544 blocks from the sky's middle):
- It went in 4 parts (each quarter loaded at most 196 chunks, under the game's 300): 842,624 blocks in about 19.5
  seconds.
- All 7,734 blocks of the harbour, its ships and its lamps were in place, each facing the right way. They were all
  still there 40 seconds later.
- The ships' 491 blocks of dry air were all still dry. The harbour held 41,762 still water blocks and 756 seagrass,
  with no water flowing anywhere and none soaking into any other block.
- All 3 chests were filled. The skipper's chest had its Deep Sea Rod; the other trawler's had an enchanted book; the
  submarine's had a diamond. The 2 boats were floating by the middle pier.
- Items dropped on the roofs and on the trawlers' steps landed on the tall half where planned (roofs slope down to
  the eaves, the step goes up to the bow).
- No errors in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | Close Minecraft fully and open it again. Open a world with the fishing sky. | No errors. |
| 2 | Type /zoocraft:harbour true | It says where the nearest huge island is, builds it, and puts you on its promenade facing the harbour. |
| 3 | Look round the harbour. | The quay, three piers, two trawlers, a submarine, sailboats, buoys, a crane, stalls, huts, a fish store and the lighthouse. |
| 4 | Walk out along the middle pier and onto the submarine. Climb the ladder on the back of its tower, open the hatch and go down. | A dry inside with a torpedo room, consoles, bunks, a chest and the engine room. |
| 5 | Go aboard a trawler through the gap in its rail. Open the hatch on deck and climb down. | A dry hold with barrels. The wheelhouse has a chest; one trawler's has a Deep Sea Rod. |
| 6 | Climb the lighthouse ladder. | The light at the top, inside glass, with a gallery round it. |
| 7 | Take one of the boats by the middle pier out on the harbour. | It floats and rows. |
| 8 | Fish in the harbour for a while. | The game's fish, and now and then lost gear or a lure. |

## 0.1.281: Jack's 100-friendship rewards

Jack's spec: "At maximum friendship, Jack unlocks: different custom fishing rods, a new fishing dimension, new custom
fishing mechanics, new custom fish", and "Do not unlock the fishing dimension early". The plan's step 10: "the Steel
Rod and the lighter's secret at 100. You'd find the Deep Sea Rod on a fishing ship in the dimension, and Jack sells
tackle." What changed:

- At 100 friendship, one talk with Jack hands over his Steel Rod and his Flint and Steel together, with one line
  for both. A friend who already had the lighter (0.1.272 to 0.1.280) gets the Steel Rod alone, with its own line.
- Nothing crafts a Steel Rod now; it is Jack's to give. Rods already made stay. Nothing crafts the lighter either, so
  the fishing sky waits for 100.
- Once he has given you his rod, his Buy Tackle page sells spare Steel Rods for 400 Zoo Coins (free in sandbox).
  Until then the page says where the rod comes from. He gives no free rod if you lose it; the lighter he still
  replaces for free while you carry none ("Ask for Jack's Flint and Steel" on his menu).
- The Deep Sea Rod is still made from a Steel Rod, a nautilus shell and 2 prismarine shards, or found in a harbour
  trawler's wheelhouse chest.
- A resident's "Friendship and About" page now shows their rewards when they have more than one (Terra's plans and
  Clian's pattern were missing from it since 0.1.245).
- New test command: /zoocraft:friendship <resident> <points> (cheats on) sets your friendship with a resident, 0 to
  100. What they have for you at that friendship comes the next time you talk.

Our calls are in playtest/NPC_batch3_suggestions.md, items 246 to 255.

On the test server (Mojang's Bedrock server 1.26.62.1), after /zoocraft:testsetup true:
- At 99 friendship, Jack's page said "At 100 friendship they have something special for you", and his Buy Tackle
  page sold the three lures only, with the line about where the rod comes from.
- At 100, one talk gave a Steel Rod and Jack's Flint and Steel ("They give you a Steel Rod and Jack's Flint and
  Steel", with his line for both). A second talk gave nothing more.
- Buy Tackle then listed "Steel Rod: 400 coins"; buying one took 400 from the park and added a second rod.
- His page read "Their gift to you: Steel Rod (yours; spares on their Buy Tackle page)" and "Their gift to you:
  Jack's Flint and Steel (yours; ask them for another if you carry none)".
- With both gone from the inventory, his menu offered "Ask for Jack's Flint and Steel", which gave the lighter back,
  and offered nothing for the rod.
- A friend who had only the lighter got "a Steel Rod" alone, with his rod line.
- /zoocraft:friendship jack 100 set it to Best Friend, 100 of 100; 101 was refused, and so was running it from the
  console. No errors in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | /zoocraft:testsetup true, then /zoocraft:friendship jack 99 and look at Jack's Friendship and About. | "At 100 friendship they have something special for you." |
| 2 | Open Jack's Buy Tackle. | The three lures only, and "Jack gives you his Steel Rod at 100 friendship." |
| 3 | /zoocraft:friendship jack 100, then Talk to Jack. | His line about the rod and his secret, and "They give you a Steel Rod and Jack's Flint and Steel". |
| 4 | Talk to him again. | An ordinary chat: nothing more is handed over. |
| 5 | Open Buy Tackle and buy a Steel Rod. | It costs 400 Zoo Coins and a new Steel Rod lands in your inventory. |
| 6 | Look for the Steel Rod in a crafting table's recipe book, or lay out its old recipe (3 iron, 2 string). | No Steel Rod recipe. |
| 7 | Drop the lighter and every Steel Rod, then open Jack's menu. | "Ask for Jack's Flint and Steel" gives the lighter back; there is no button for the rod. |
| 8 | Look at Terra's or Clian's Friendship and About. | Their rewards and the friendship they come at are listed. |

## 0.1.282: the fishing sky's own fish

Jack's spec: "At maximum friendship, Jack unlocks: different custom fishing rods, a new fishing dimension, new custom
fishing mechanics, new custom fish". The last of the four is in now. What changed:

- Each kind of island in the fishing sky has a fish of its own: the Sky Perch (common islands), the Amethyst Trout
  (uncommon, the amethyst ones), the Gilded Koi (rare, the blackstone ones), the Willow Bass (exotic, the round pool
  and willows), the Golden Sailfin (mythic, the shark city) and the Harbour Herring (huge islands, by the harbours).
- About one fish in four that Jack's rods (the Steel Rod and the Deep Sea Rod) catch at an island is that island's
  own. The rest are the game's cod, salmon, tropical fish and pufferfish. Junk and treasure are as before. The game's
  own fishing rod still catches the game's fish everywhere.
- They eat like the game's fish. Raw, they fill a little, like raw cod. Cooked in a furnace, a smoker or on a
  campfire, they make a good meal, like cooked salmon. The Golden Sailfin cooks into the best meal of them, as filling
  as a steak. The Gilded Koi, like the game's tropical fish, isn't for cooking.
- Their pictures are the game's own fish pictures in new colours.
- Jack loves them as gifts, raw or cooked, with a line of his own. Cooked, they count as food for residents who like
  food.

Our calls are in playtest/NPC_batch3_suggestions.md, items 256 to 265.

On the test server (Mojang's Bedrock server 1.26.62.1):
- Each island's fish table, drawn 800 times through the game's loot tables the way Jack's rods draw a catch, gave
  that island's fish 22% to 29% of the time (about one in four), and the game's fish the rest.
- Eating a Sky Perch, a Cooked Golden Sailfin and a Gilded Koi took one of each, with the game's food values.
- A furnace cooked 2 Amethyst Trout into 2 Cooked Amethyst Trout, a smoker cooked a Willow Bass, and a campfire
  cooked a Harbour Herring. A Gilded Koi in a lit furnace didn't cook.
- Giving Jack a Sky Perch got his line ("Where did you catch THIS? ...") and +8 friendship, a gift he likes.
- No errors in the content log.

| # | Do this | You should see |
|---|---|---|
| 1 | /zoocraft:friendship jack 100, talk to Jack, light a sea portal with his Flint and Steel, and fish with the Steel Rod at a common island. | Now and then a Sky Perch, about one fish in four. |
| 2 | Fish at the other kinds of island. | An Amethyst Trout at an amethyst island, a Gilded Koi at a blackstone one, a Willow Bass at one with a round pool and willows, a Golden Sailfin at the shark city, a Harbour Herring at a huge island's harbour. |
| 3 | Fish there with the game's own fishing rod. | Only the game's fish. |
| 4 | In survival, a little hungry, eat a raw Sky Perch. | It fills a little, like raw cod. |
| 5 | Cook a Sky Perch in a furnace, one in a smoker and one on a campfire. | A Cooked Sky Perch from each. |
| 6 | Eat a Cooked Golden Sailfin. | It fills as much as a steak. |
| 7 | Put a Gilded Koi in a lit furnace. | It doesn't cook. |
| 8 | Give Jack one. | His line "Where did you catch THIS? ..." and the friendship of a gift he likes. |
| 9 | Look for them in the creative inventory. | The raw fish under Nature, the cooked ones under Equipment. |

## 0.1.283: the rods' look and their right-click animation

Austin, 14 Nov: "fix the designs of the fishing rods and there animation. Remember that right click is the button to
use for fishing, so we need an animation with that." The arm swing added in 0.1.273 never showed on his screen. What
changed:

- The Steel Rod and the Deep Sea Rod are 3D models in the hand now: a cork grip, a reel under it, a thin blank with
  guide rings, and a tip. The Deep Sea Rod is longer and thicker, teal with a gold reel.
- Every right-click (a cast or a reel) whips the rod back and then forward over 0.4 seconds, in first and third
  person. The hotbar slot shows the short cooldown sweep at the same time.
- New inventory pictures for both rods to match.

This was built without being able to see it on a screen: the test server shows no pictures. Rows 1 to 4 are for
Austin's eyes. On the test server (Mojang's Bedrock server 1.26.62.1) a use cast the line and started the 8-tick
cooldown, a second use inside it did nothing, a bite and a reel landed a cod, and the log was clean.

| # | Do this | You should see |
|---|---|---|
| 1 | Hold a Steel Rod in first person. | A 3D rod up and forward from your right hand, the reel underneath. |
| 2 | Look at yourself in third person (F5). | The rod in your right hand pointing forward and up. |
| 3 | Right-click to cast. | The rod whips back, then forward, and the bobber flies out. |
| 4 | Right-click again to reel in. | The same whip, and the line comes back. |
| 5 | Do 1 to 4 with a Deep Sea Rod. | The same with the longer teal and gold rod. |

## 0.1.284: the exotic island reworked

Austin, 14 Nov: "The exotic and mythic ones need some work. For the exotic, make there be a fog whenever you are on the
island, and make the willows look more like willows, even if you have to use custom blocks. I want them to be very
detailed willows as well. there should also be some loot at the exotic items in barrels. Something that hints the
mythical fishing island should be there as well." What changed:

- The willows are built block by block now, each one different: a thick bark trunk that leans toward the pool, flared
  roots, boughs that arch out and droop, a crown along every bough with yellow catkins here and there, and long drapes
  hanging to just above the grass and the water. Three new blocks: Willow Bark, Willow Catkin Leaves, Willow Drape.
- A soft green-white mist while you are on an exotic island. It lifts when you leave.
- Up to three barrels at the willows' feet with loot (Diamond Shards, Willow Bass, emeralds, gold, lures, an enchanted
  book now and then).
- The first barrel always holds a Gilded Sea Chart. Right-click it: a chat line says how far and which way the Shark
  People's town is. By the pool stands a small white-and-gold shrine in the town's style.
- An exotic island you already visited keeps its old willows (an island is built once). Stand on it and run
  `/zoocraft:willows` (cheats on) to replant it: the old willows go, the new ones, the barrels and the shrine come.
  It takes out oak logs within 7 blocks of each old willow, so move anything you built of oak logs there first.

On the test server (Mojang's Bedrock server 1.26.62.1) an exotic island built with all 51,880 blocks as planned,
every drape still hanging 40 seconds later, the three barrels filled (the chart in the first), the mist's command
accepted, the chart's line right, and the replanting clean; the log had no errors. The server draws nothing, so the
rows below are for Austin's eyes.

| # | Try | Expect |
|---|-----|--------|
| 1 | Find a new exotic island (or run `/zoocraft:willows` on one you know) | Big leaning willows round the pool, with long green drapes |
| 2 | Walk onto the island and off it again | A soft mist on the island, clear sky off it; no words on screen |
| 3 | Look at the foot of the willows | Up to three barrels with loot; one has a Gilded Sea Chart |
| 4 | Right-click the chart | A gold chat line with the distance, the way and the x z of the Shark People's town |
| 5 | Look round the pool's bank | A small quartz shrine with a sea lantern, a gold cap and a lantern |
| 6 | Walk through the drapes | You pass through them; shears pick them up |

## 0.1.285: the Shark People's town rebuilt, bigger and lived in

Austin, 14 Nov: "For the mythical island, the village needs to be much more detailed, especially the buildings. They
need an interior so it looks like people live there. If we have to make it bigger to do that, that is fine. I want the
homes to look like the ones in the image, again much more detail is needed here. There should be something super rare
and powerful you get here." What changed:

- The island is bigger (64 to 72 blocks from its middle to its edge, was 46 to 56) and holds 22 to 28 homes (was 12
  to 14) on two ring streets, with flowering gardens between them.
- Three kinds of home, all white with a gold or blue dome on a drum, like the picture. Villas: two storeys, a porch
  on columns, a balcony with a rail, a kitchen, a table and chairs downstairs, and two beds, a chest and a loom up a
  ladder. Cottages: one room with a bed, a table, a smoker and a barrel, an awning over the door. Tower houses:
  round, three storeys (a store, a bedroom, a study) joined by a ladder, under a tall dome.
- Every home has windows, lamps, rugs, shelves and somewhere to sleep, and one of the Shark People lives in each.
- The palace is a real hall now: a checkered floor, two rows of columns, tall blue windows, hanging lamps, a gold
  seat on a blue carpet, the Elder's room on one side (bed, books, lectern) and the vault on the other. Outside: a
  columned portico, a great gold dome on a windowed drum, four blue domes and four corner towers.
- The vault's chest is the town's treasure: always a Heart of the Sea, with gold, diamonds, emeralds, Golden
  Sailfin, nautilus shells, treasure-enchanted books, golden apples and now and then a trident. The Mythical Fishing
  Rod joins it in the next build.
- A town you already visited stays the small one (an island is built once). Standing in it you get one chat line
  saying so. `/zoocraft:mythic true` (cheats on) then clears that island and raises the new town in its place. You
  wait on a glass step high above while it happens (about ten seconds) and are set down on the plaza. Anything you
  built or left in chests on that island is cleared with it, so take it off first.

On the test server (Mojang's Bedrock server 1.26.62.1) a new town built in 5 seconds with all 280,980 blocks as
planned and every block state right (beds whole, ladders on their walls, lamps hanging), the vault's chest filled, 34
of its 35 people at home within seconds (the Elder comes once the palace is in view). A town built by 0.1.284 and
then opened with 0.1.285 kept its people, gave the chat line once, and `/zoocraft:mythic true` cleared 115,890 blocks
and raised the new town, again 280,980 of 280,980 right, with the player carried up and set down safely in survival
mode. The log had no errors. The server draws nothing, so the rows below are for Austin's eyes.

| # | Try | Expect |
|---|-----|--------|
| 1 | `/zoocraft:mythic true` in a world where you have been to the town | One line about clearing and raising; you stand on glass in the sky, then on the new plaza facing the gate |
| 2 | Walk in through the gate and round the two ring streets | White homes with gold and blue domes, porches, balconies, gardens; three kinds of home |
| 3 | Go into a two-storey villa | Kitchen, table and chairs, rug, a ladder up to two beds, a chest and a loom |
| 4 | Go into a round tower house | Barrels below, a bed on the middle floor, a study with books on top |
| 5 | Go into the palace | Columns, checkered floor, hanging lamps, a gold seat with the Elder by it |
| 6 | Look left and right of the gold seat | The vault with a chest (a Heart of the Sea inside) and the Elder's room |
| 7 | Stay a minute | A Shark Person in every home, guards at the gate and the palace door, fishers on the piers |
| 8 | Look at the beds | Every bed whole, a pillow at one end |

## 0.1.286: the Mythical Fishing Rod and the Saturater

Austin, 14 Nov: "There should be something super rare and powerful you get here. Let's have a different fishing rod you
get there. It is called the Mythical Fishing Rod. It is golden, and instead of throwing a bobber on the line, only the
bobber goes out by itself, and then when you pull the bobber in an animation occurs where you see a magnetic force
pull the bobber back to the top of the rod. The mythical rod also has a 5X higher chance of fishing out enchanted
books. It also allows the catch of a new rare fish called the Saturater, it is a big fat fish, when cooked fills 10
hunger bars." What it is:

- The Mythical Fishing Rod lies in the vault chest of the Shark People's palace, one in every town. A town built by
  0.1.285 gets its rod put into that chest the next time you are in town.
- It is gold with a lapis grip and a sea-glass tip, a 3D model in the hand like the other rods, and it flicks on a
  right-click the same way.
- Right-click casts a gold bobber with no line at all. It flies twice as far as the game's rod.
- Right-click again and the rod's magnet takes the bobber: it lifts off the water spinning, comes back to the rod's
  tip slowly and then fast with sparks between the two, and lands with a clink. It takes under a second.
- Enchanted books come five times as often as on any other rod: about 1 catch in 21, where the game's is about 1 in
  100.
- About one fish in twenty on this rod is a Saturater, a big fat gold fish no other rod catches. Raw it fills a bar
  and a half; cooked (furnace, smoker or campfire) it fills all ten hunger bars.
- It takes lures at the Tackle Box and the fishing rod enchantments, lasts 2,000 uses and is mended with gold ingots.

On the test server (Mojang's Bedrock server 1.26.62.1): the cast put out a gold bobber with the line off, a fish bit,
the reel started the pull and the bobber was home 13 ticks later from 25 blocks out, the salmon in the bag and the rod
worn by 1. Over 4,000 catches each, the Mythical Fishing Rod brought 173 enchanted books and 172 Saturaters, the Steel
Rod 42 books and none. A town built by 0.1.285 got one rod in its vault chest and no second one; a new town's vault
held one from the start. The log had no errors. The server draws nothing and plays no sound, so the rows below are for
Austin's eyes and ears.

| # | Try | Expect |
|---|-----|--------|
| 1 | Open the vault chest in the palace (left of the gold seat) | A Mythical Fishing Rod among the treasure |
| 2 | Hold it | A gold rod with a blue grip in your hand, first and third person |
| 3 | Right-click at water | The rod flicks; a gold bobber flies out and floats; no line between you and it |
| 4 | Right-click again at any time | The bobber spins up and is drawn back to the rod's tip with sparks, then a clink |
| 5 | Wait for a bite, then right-click | The catch flies to you as usual while the bobber comes home |
| 6 | Fish for a while | Enchanted books now and then; sooner or later a Saturater |
| 7 | Cook a Saturater and eat it when hungry | All ten hunger bars filled |
| 8 | `/give @s zoocraft:mythical_rod` (to try it without the trip) | The same rod |

## The line ends at the rod's top (0.1.287)

| # | Do | Expect |
|---|---|---|
| 1 | Hold the Steel Rod in first person and cast | The line runs from the bobber to the very top of the rod, not to a spot by your hand |
| 2 | Look up and down, turn | The line's end stays on the rod's top |
| 3 | The same with the Deep Sea Rod | The same, on its higher top |
| 4 | F5 (third person) | The line ends up by the rod's top, in front of and above your head |

## The Mythical Fishing Rod casts like the game's rod (0.1.288)

| # | Do | Expect |
|---|---|---|
| 1 | Cast the Mythical Fishing Rod level over water, then a normal fishing rod from the same spot | The gold bobber lands about where the normal rod's does (about 12 blocks), never out of sight |
| 2 | Stand under water and cast any of the three rods | The bobber stays close and floats up slowly to the top (about 2 blocks a second), it doesn't shoot away |
| 3 | Cast steeply down into deep water from a height | It dips, then rises gently and settles |

## The fishing sky's fish swim in their ponds (0.1.289)

| # | Do | Expect |
|---|---|---|
| 1 | Go to a common island with a pond and wait a few seconds | Two blue Sky Perch swim in its biggest pond |
| 2 | The same on the other kinds | Amethyst Trout (uncommon), Gilded Koi (rare), Willow Bass (exotic pool), Golden Sailfin (the town's lagoon), Harbour Herring (the harbour) |
| 3 | Kill one | It drops its raw fish; the pond has one until the next day, then two again |
| 4 | Cast a Steel Rod so the bobber rests within 6 blocks of the two fish, then far from any fish | Bites come about twice as fast near the fish |
| 5 | Creative menu | A spawn egg for each of the six fish |
| 6 | Look at them swimming | No name or text floats over them; they swim like the game's fish and flop on land |

## Chasm moves in, and trades diamonds for Volatile Void Essence (0.1.290)

| # | Do | Expect |
|---|---|---|
| 1 | Put any End animal on display (a Shimmer Snail, an Enderman, a Void Ray...) | "Chasm can move in now! (an End animal on display.)" in chat; with a free home he moves in the next morning |
| 2 | Look at him | A purple hood and robe to the feet with dull yellow trim; the face is black shadow with two glowing purple eyes; arms crossed in front; only his legs move as he walks |
| 3 | Talk to him | Short, blunt, serious lines; his talk picture is the hood and the eyes |
| 4 | Give him chorus fruit or dragon's breath; then (another day) bread, a diamond or a water bucket | He likes the first two; he dislikes the others and says why |
| 5 | `/zoocraft:friendship chasm 49`, open his menu | No "Trade Diamonds" button |
| 6 | `/zoocraft:friendship chasm 50`, Talk | He offers the trade; "Trade Diamonds" is on his menu from now on |
| 7 | Carry 11 diamonds, Trade Diamonds | Buttons for 1, 8 and all 11; each trade takes that many diamonds and gives the same number of Volatile Void Essence |
| 8 | Trade Diamonds with no diamonds | He tells you to come back with diamonds; nothing is given |
| 9 | `/zoocraft:friendship chasm 10`, open his menu | The trade is still there |
| 10 | Make it rain | He stays at home |
| 11 | `/zoocraft:testsetup true` in a new flat world | 22 houses; Chasm's is the last on the east side, across from Jack's |

## Chasm's Volatile Totems (0.1.291)

| # | Do | Expect |
|---|---|---|
| 1 | At a crafting table: 8 Volatile Void Essence round a bed (any colour), an egg, a blaze rod, an eye of ender | Volatile Totem of Dwelling, Zoo, Nether, End: purple idols with a red, cream, orange, green stone |
| 2 | Use a totem before Chasm has taught it | "The totem is cold in your hand" with the friendship it takes; nothing happens, the totem stays |
| 3 | `/zoocraft:friendship chasm 60`, Talk; then 70, 80, 90, a Talk each | He teaches one totem per talk; his page lists each as yours for good |
| 4 | Far from home in survival, use the Totem of Dwelling | You stand beside your bed; the totem is gone; one line in chat, no title |
| 5 | Break your bed, use another | You arrive at the world's spawn |
| 6 | Use the Totem of Zoo | You stand on the ground beside your Park Entrance Gate |
| 7 | Use the Totem of Nether in a world where no portal was used since this update | It says it knows no portal and stays whole |
| 8 | Walk through a Nether portal and back, go far away, use it | You arrive beside the nearest of the two portals, not inside the frame |
| 9 | Use the Totem of End | You stand on the obsidian platform in the End |
| 10 | Use any totem in creative | You travel and keep the totem |
| 11 | Use one while riding a horse | You are taken off the horse and travel alone |
| 12 | `/zoocraft:friendship chasm 0`, use a totem you were taught | It still works |

## Chasm's Voidologist Core and the Volatile Pump (0.1.292)

| # | Do | Expect |
|---|---|---|
| 1 | `/zoocraft:friendship chasm 100`, Talk to Chasm until he has given everything | After the four totems he hands you the Voidologist Core (a dark orb in a gold ring), once |
| 2 | Talk again; set friendship to 0 and back to 100; look at his page | No second core, no button to ask for one; his page says the core is yours |
| 3 | Put the core alone in a crafting table | One Volatile Pump (a purple block with gold bands and a dark window) |
| 4 | Try to place the pump in the Overworld or the Nether | It is not placed; chat says it works only in the End; you keep it |
| 5 | Place it in the End | Chat: set down, one essence every 2 min while the place is loaded |
| 6 | In creative take a second pump and place it elsewhere in the End | Refused, with the first pump's coordinates |
| 7 | Stay near it 2 minutes, then use it (right-click) | "you take 1 Volatile Void Essence"; before that it tells the time left |
| 8 | Note the time left, go to the Overworld for a few minutes, come back, use it | The time left is what it was when you left: nothing made while away |
| 9 | Leave the game and come back, use it | Still yours, progress and stored essence kept |
| 10 | Break it (survival) | It drops itself and the essence it held; you can place it again, anywhere in the End |
| 11 | Light TNT beside it; push it with a piston | It stays where it is |
| 12 | Multiplayer: another player uses or mines your pump | They are told it is yours; it is not emptied or broken |

## Chasm's trips to the End (0.1.293)

| # | Do | Expect |
|---|---|---|
| 1 | Follow Chasm on his zoo visits over several days | On about one day in four, 1 to 4 minutes into the visit, he vanishes in a puff of purple with an enderman's sound |
| 2 | Look at his page at the mailbox while he is gone | "away in the End, at their research" |
| 3 | Wait 4 to 8 minutes at his house | He is back inside with the same puff, and his day goes on as usual |
| 4 | Leave the world while he is away and come back | Still away until his time is up, then at home |

## Long answers on the talk screen (0.1.294)

| # | Do | Expect |
|---|---|---|
| 1 | `/zoocraft:friendship chasm 50`, Talk to Chasm | His words fill one page with a single "Go on" button; the next page has the green gift line and the friendship note, with the usual buttons. Nothing runs off the box |
| 2 | `/zoocraft:friendship chasm 100`, Talk until he gives the core | His long speech comes on two pages of whole sentences, then the gift line |
| 3 | Talk to anyone with a short line | One page, as before |

## Subject 10 moves in, and tells her story with friendship (0.1.295)

| # | Do | Expect |
|---|---|---|
| 1 | Put any Nether animal on display (a Strider, a Hoglin, a Blaze, an Ember Fox...) | "Subject 10 can move in now! (a Nether animal on display.)" in chat; with a free home she moves in the next morning |
| 2 | Look at her | Her right half a blonde girl with a blue eye and long hair; her left half a zombified piglin (pink and green hide, a blank white eye, half a snout, a tusk, no hair); a brown leather tunic with a gold buckle, dark trousers |
| 3 | Talk to her as a stranger | Cheerful and jokey; she talks about Nether animals and dodges questions about her face |
| 4 | Give her a gold ingot, quartz, a water bucket or a carrot; then (other days) a lava bucket, a bone or a porkchop | She likes the first four; she dislikes the others and says why |
| 5 | `/zoocraft:friendship subject_10 40`, Talk | She tells you what she is afraid of (skeletons, lava, going back to the Nether), over two or three pages with "Go on" |
| 6 | `/zoocraft:friendship subject_10 70`, Talk | She says she was human and a skeleton scientist experimented on her |
| 7 | `/zoocraft:friendship subject_10 100`, Talk | She tells of the Nether Fortress and the hidden laboratory and asks you to look; she is NOT cured and is still called Subject 10 |
| 8 | Talk again; open Friendship and About | Each part is told only once; her page lists the three parts as told |
| 9 | Have pigs or skeletons on display; walk her path in the dark | Those bother her; a fountain and a sunny day please her |
| 10 | Make it rain | She still goes out |
| 11 | `/zoocraft:testsetup true` in a new flat world | 23 houses; hers is the last on the west side, a plot past Jack's |

## Subject 10's bioscience lab (0.1.296)

| # | Do | Expect |
|---|---|---|
| 1 | Outside the zoo, fence a patch of ground with a gate, place a Work Anchor with a chest beside it and a brewing stand or two inside, pick Subject 10 as the worker, and join it to her home by a path | The anchor's page says bioscience lab, counts the brewing stands in reach, and shows no problem |
| 2 | Wait for a morning | She walks to the lab and studies at each brewing stand in turn (a bottle sound); she never leaves for the Nether |
| 3 | Look in the chest after a shift | A few sheets of paper (about one study in four is written up); nothing else changed: the brewing stands and what is in them are untouched |
| 4 | Take the brewing stands away | The anchor's page asks for a brewing stand inside the lab |
| 5 | `/zoocraft:testsetup true` in a new flat world | Her lab is the furthest east of the six work sites, three brewing stands inside |

## The Skeleton Scientist and his laboratory (0.1.297)

| # | Do | Expect |
|---|---|---|
| 1 | Walk around inside a Nether fortress (0.1.308: he comes within 15 minutes of fortress time at most, usually sooner; to skip the wait run `/summon zoocraft:skeleton_scientist` there in Survival) | Now and then a skeleton in a lab coat and goggles walks up. He does no damage. Killing him drops nothing |
| 2 | Let him stay next to you for a couple of seconds | Chat: his needle goes in. You wake tied to a chair in a small cell, with everything you carried still on you. You cannot walk or jump |
| 3 | Crouch again and again (12 times) | Chat lines as the ropes creak, fray and snap. The cell door opens. Nothing appears on screen but chat |
| 4 | Fight in the hall | The Skeleton Scientist (now tougher and hitting back) and three wither skeleton guards. When all are down the vault's bars open |
| 5 | Open the vault's chest | 1 Wither Wish Bone, exactly 42 obsidian, 1 flint and steel. Each player gets this once per laboratory |
| 6 | Look at the walls, floor and ceiling | Bedrock all round, no way in or out. A sloth-sized cage stands empty for now (its animal comes in the next update) |
| 7 | Build a portal with the obsidian on the marked floor, light it, go through | You come out in the Overworld. Going back through that portal brings you into the laboratory again, free, not tied up |
| 8 | Leave the game while tied up, then come back | You are still in the chair and can still crouch free; you are never stuck. Dying or leaving the laboratory another way frees you |
| 9 | Get caught again in the same fortress | The same laboratory, not a second one. The chest gives you nothing new; the fight happens again |
| 10 | Two players caught in one fortress | Each is tied and frees themself; one fight; each gets their own share in the chest |

## The laboratory's sloth (0.1.298)

| # | Do | Expect |
|---|---|---|
| 1 | Get taken to a laboratory (or go back into one through your portal) | A small brown sloth sits in the barred cage on a moss floor. A chat line reads its label: the specimen the Soul Sloths came from |
| 2 | Look at it | A plain sloth: shaggy brown, pale face with dark eye stripes, pale claws. Very slow. Harmless |
| 3 | Bring an Animal Carrier and catch it through the bars, as any small animal | It is caught for the zoo; the Field Journal has a Sloth page |
| 4 | Come back to that laboratory later | The cage stays empty: one sloth per laboratory. Another fortress's laboratory has its own |
| 5 | Put it in an exhibit | A small land animal: Leafy Rations, water, and something to climb (a climbing tree or a Climbing Frame). No heat needed |
| 6 | `/zoocraft:build` in a test world | A Sloths exhibit with two inside |

## The Potion of Life and Aurora (0.1.299)

| # | Do | Expect |
|---|---|---|
| 1 | In a brewing stand: a Potion of Healing (or Healing II) below, a Wither Wish Bone on top, blaze powder | It brews into a Potion of Life (a round rose-gold flask). A water bottle or any other potion does not brew with the bone |
| 2 | Use the Potion of Life on Subject 10 below 100 friendship | She says she can't take it yet; the potion stays in your hand |
| 3 | Open her Friendship and About page at 100 friendship with her three stories told | It says: Once she is cured she has something to tell you |
| 4 | Use the Potion of Life on her at 100 friendship | A sparkle and a chime; chat tells everyone she is human again and named Aurora. She turns fully human on the spot (blonde hair, two blue eyes), her name tag reads Aurora, and she tells her whole story over a few pages (Go on), ending with her thanks. The potion is used up |
| 5 | Look at everything of hers afterwards | The same resident: her friendship with everyone, her home, her bioscience lab and her day are as they were. Her menu, portrait and chats say Aurora and no longer speak of a piglin half |
| 6 | Leave the world and come back | She is still Aurora |
| 7 | Use another Potion of Life on her, or on anyone else | On her: she says she is herself already, and the potion is kept. On anyone else: nothing special (their usual menu) |

## Quick gifts (0.1.302)

| # | Do | Expect |
|---|---|---|
| 1 | Hold something a resident could be given, sneak (shift) and use (right-click) on them | No menu. One of the item leaves your hand and a chat line shows their reaction and the friendship change, as Give a Gift would |
| 2 | Do it again the same day | Their "already had one" line in chat; you keep the item |
| 3 | Sneak and use on a sleeping resident | Chat says they're asleep; you keep the item |
| 4 | Sneak and use with an empty hand, or use without sneaking | Their usual menu |
| 5 | Sneak and use holding a ZooCraft tool or a shulker box | Chat says it isn't something to give them |
| 6 | Sneak and use a ZooCraft bow on Guido | It goes into his Bow Case, as from the menu |

## Han Lock, his smithy and the Hanvil and Hammer (0.1.305)

Close Minecraft fully and open it again first (a new block, model and textures). `/zoocraft:friendship han_lock <points>` sets your friendship for testing.

| # | Do | Expect |
|---|---------|--------|
| 1 | Have 30 different species on display and a free home | Han Lock moves in: bald, stubble, a leather apron over a sleeveless shirt. 29 species are not enough |
| 2 | Talk to him the first time | He hands you his Hanvil and Hammer: a dark bedrock anvil with a hammer lying on it |
| 3 | Fence a work site with a Work Anchor and chest, set the Hanvil and a furnace (or blast furnace) inside, make Han its worker | The Work Anchor counts one Hanvil and one furnace. Without either one it says what is missing |
| 4 | Watch a morning shift | He walks in and works at the Hanvil (anvil sound) and the furnace. No block changes; the zoo earns nothing |
| 5 | Leave a worn pickaxe in the smithy's chest for a shift | Its wear goes down a little at each turn at the Hanvil |
| 6 | In survival, try to mine the Hanvil; set off TNT beside it; push it with a piston | It stays, every time |
| 7 | Sneak and use the Hanvil with an empty hand | It comes back to you as an item |
| 8 | `/zoocraft:friendship han_lock 39`, use the Hanvil | Han shouts hands off; chat says 40 friendship is needed |
| 9 | "Ask about the Hanvil" on his menu at 0, 20 and 40 friendship | His bedrock story; then he explains reinforcing; then he says you may use it |
| 10 | At 40, carry two new diamond pickaxes and use the Hanvil | The page offers "Reinforce Diamond Pickaxe, plain to +10%". Take it: one pickaxe is left, named in gold lines "Reinforced +10%" and "Durability 1,717 (156 extra left)" |
| 11 | Make a second +10% pickaxe and use the Hanvil again | It offers +10% to +20% (durability 1,873). A +10% and a plain one are never paired |
| 12 | Use a pickaxe once, then try to reinforce it | The page lists it under "Can't be reinforced: has been used", also after Mending or an anvil repair |
| 13 | Mine with a reinforced pickaxe | The bar dips a little and jumps back to full while the extra lasts; the "extra left" number in its lines goes down. When the extra is used up the bar wears as usual |
| 14 | Reinforce two matching unused armor pieces and wear the result into a fight | Same lines, same top-ups; its armor points are unchanged |
| 15 | Mine continuously with a reinforced pickaxe | Tell me if a top-up ever interrupts the swing (I can't see that from here) |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 403 to 417): the friendship numbers (20 and 40), how the Hanvil reaches you, the smithy's repairs, enchanted pieces being allowed, and the two limitations (how the extra durability is kept; how "never used" is known).

## Explosive Arrows (0.1.306)

Close Minecraft fully and open it again first (a new item). `/zoocraft:friendship han_lock 60` opens them.

| # | Do | Expect |
|---|---------|--------|
| 1 | At 59 friendship, use the Hanvil | No word of Explosive Arrows; the page says Han has more to teach at 60 |
| 2 | At 60, "Ask about the Hanvil" | Han explains them, loudly |
| 3 | Carry 1 TNT and 4 arrows, use the Hanvil | A button "Make 4 Explosive Arrows". Take it: the TNT and the 4 arrows are gone, you have 4 Explosive Arrows |
| 4 | Carry several TNT and plenty of arrows | A second button makes as many as you can at once |
| 5 | Away from any zoo: Explosive Arrows in the off hand, ordinary arrows in the inventory, shoot a normal bow at the ground | A fuse hiss as it leaves; a blast where it lands, a crater a little smaller than TNT's, no fire. One Explosive Arrow is used, your ordinary arrows stay the same, and no arrow is left to pick up |
| 6 | Shoot a mob the same way | It blows up on the mob |
| 7 | Take the Explosive Arrows out of the off hand and shoot | An ordinary arrow |
| 8 | Shoot one of Guido's bows, and a crossbow, with them in the off hand | Each shot is armed the same way. A bow that looses several arrows at once (Scrap, Twin Fang, a Multishot crossbow) arms one of them |
| 9 | Stand in your zoo and shoot the ground or a fence | The blast goes off and hurts what is near, but no block breaks. The same for a shot that lands just outside the fence |
| 10 | A bow with Infinity | The shot is armed; one Explosive Arrow is still used |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 418 to 426): the recipe (1 TNT and 4 arrows make 4), the blast size (3, a creeper's; TNT is 4), no fire, 60 friendship, the off-hand way of loading them, and no block damage in or beside a zoo.

## Ash's pieces joined to armor (0.1.307)

Close Minecraft fully and open it again first (new items). `/zoocraft:friendship han_lock 80` opens it; `/zoocraft:friendship ash 100` opens all of Ash's shop.

| # | Do | Expect |
|---|---------|--------|
| 1 | At 79 friendship with Han, use the Hanvil | Nothing about Ash's pieces; the page says Han has more to teach at 80 |
| 2 | At 80, "Ask about the Hanvil" | Han talks about Ash's things, rudely |
| 3 | Carry Ghast J's and any normal boots, use the Hanvil | A button "Join Ghast J's onto ... Boots". Take it: the Ghast J's are gone; the boots are the same boots (wear, enchantments, trim) with a pink line "Ghast J's: Slow Falling" |
| 4 | Wear those boots and jump off something | Slow Falling while they are on, gone when they come off. The boots' armor is still there |
| 5 | The same with Soul Shoes | Swiftness while worn |
| 6 | Carry the Warped Wood Sombrero and a normal helmet (try diamond), use the Hanvil | A button "Join Warped Wood Sombrero onto Diamond Helmet". Take it: one item, "Diamond Warped Wood Sombrero", with the helmet's wear and enchantments |
| 7 | Wear it | It looks like the sombrero, and your armor bar shows the helmet's points |
| 8 | The same with the Baseball Hat, and with other helmet metals | The same, each named after its metal. A turtle shell is not offered |
| 9 | Join a reinforced helmet or boots | The reinforcement stays on the joined piece |
| 10 | Carry a necklace or gauntlets with a chestplate | Nothing is offered for them (waiting on your word) |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 427 to 436).

## Casings, the two-slot Hanvil, and residents setting their own things down (0.1.309)

Close Minecraft fully and open it again first (new items). This replaces how 0.1.305 to 0.1.307 said the Hanvil is used: there is no page of buttons any more, and Han hands nothing over.

| # | Do | Expect |
|---|---------|--------|
| 1 | Go to Han Lock's house a few seconds after loading in | Chat: he set the Hanvil and Hammer down in the house, with where. It stands on a bare floor block in a corner |
| 2 | Use it | A small screen with five slots in a row, named Hanvil and Hammer |
| 3 | Below 40 friendship, put two unused pickaxes of one kind in the first two slots | Han's refusal in chat; nothing is made; take them back out |
| 4 | At 40 or more, do the same | In a moment both are gone and one Reinforced +10% pickaxe lies in the last slot |
| 5 | One of the two has been used | Chat says which has been used; nothing is made |
| 6 | At 60: TNT in one slot, paper in the other | Explosive Arrow Casings in the last slot, 4 for each TNT and paper, a stack at most; what is left over stays |
| 7 | Casings in the off hand, arrows in the inventory, shoot any bow | The arrow blows up where it lands. One casing AND one arrow are used |
| 8 | At 80: one of Ash's shoes and any boots, or one of his hats and a helmet | The joined piece in the last slot |
| 9 | Hit Han's Hanvil | It stays (chat says it is his). An older Hanvil you set down yourself comes up after two hits |
| 10 | Go to Guido's house, if he had no Bow Case | Chat: he set the Bow Case down. Using it shows his collection as before |
| 11 | Han's smithy without a Hanvil, with a furnace | He works his shift there all the same |
| 12 | A house with no bare floor block free (all carpet, or too small) | Chat says there was no free floor; clear a corner and it is set down within a few seconds |

The Bow Case can also be crafted, at the Zoo Workshop: planks, 3 glass panes and a bow. Ours, Austin's to change: playtest/NPC_batch3_suggestions.md items 437 to 446.

## Han's forge, his bedrock and the Hanvil's recipe (0.1.310)

| # | Do | Expect |
|---|---------|--------|
| 1 | Open the Work Anchor at Han's workplace | It is called a forge everywhere, not a smithy |
| 2 | `/zoocraft:friendship han_lock 100`, then Talk | He gives three blocks of bedrock, once |
| 3 | Crafting table or Zoo Workshop: 3 bedrock across the top, 1 iron block in the middle, 3 iron blocks across the bottom | A Hanvil and Hammer of your own |
| 4 | Set it down and use it | The same five slots as Han's. Two hits pick it up again |

## The Hanvil's own screen (0.1.311)

| # | Do | Expect |
|---|---------|--------|
| 1 | Use Han's Hanvil and Hammer | The screen is titled Hanvil and Hammer, not Unknown |
| 2 | Look at the screen | A steel frame with an orange line, dark slots: two on the left, a hammer and arrow, one on the right |
| 3 | Look at the Hanvil from a few blocks away | No words float over it |
| 4 | Open a plain hopper | It looks as it always did |
| 5 | Put a worn pickaxe and iron ingots in the two left slots | The mended pickaxe lands in the right slot, as before |

## The Wither Star Necklace's show (0.1.312)

| # | Do | Expect |
|---|---------|--------|
| 1 | Wear the Wither Star Necklace, hold a sword, let a zombie hit you | Purple motes fly into your sword hand and a charging note plays |
| 2 | Get hit a few more times | The note is higher each time; the hand keeps a purple glow |
| 3 | Hit the zombie | A purple flash, a burst of sparks, a ring along the ground, and a heavy smash sound |
| 4 | Take ten hearts of damage first, then hit | The bigger sound (a deeper smash with a boom) |
| 5 | Take the necklace off while charged | The glow stops |

## Dark caves under the Deep Trench (0.1.313)

| # | Do | Expect |
|---|---------|--------|
| 1 | Dive to the bottom of a Deep Trench (old or new) | Here and there a 3 by 3 hole in the floor |
| 2 | Swim down a hole | A shaft, a short tunnel and a low chamber, pitch dark |
| 3 | Stay near the bottom a few minutes | Goblin Sharks and Anglerfish turn up in and around the caves |
| 4 | Look along the trench floor | No straight chunk lines, nothing you built changed |

## Darian moves in (0.1.314)

Close Minecraft fully and open it again first (a new look). `/zoocraft:friendship darian <points>` sets your friendship for testing. The Melder (30), the Book of Melding (40), the Void Portal (70), the bait (80) and the rest come in the next versions.

| # | Do | Expect |
|---|---------|--------|
| 1 | Have 35 different species on display and a free home | Chat says Darian can move in; he arrives by day: long white beard, blue robe, icy-white hat and shoes. 34 species are not enough |
| 2 | Talk to him | Calm, quiet lines. His page lists what he likes and dislikes |
| 3 | Give him a potion, a bone, end stone, a book or an emerald | He likes each, with his own line |
| 4 | Give him wool, redstone or a dragon head | He dislikes each, with his own line |
| 5 | `/zoocraft:friendship darian 20`, Talk | He tells you brewing at a stand is only the beginning and that wizards keep a secret ingredient. He does not name it and gives nothing |
| 6 | `/zoocraft:friendship darian 50`, Talk | The dragon's legend: dark gray scales, spines, great wings, crimson fire; he fled; he knows a trick to summon it but you are not ready. No dragon appears |
| 7 | `/zoocraft:friendship darian 60`, Talk | His nightmare of the dragon burning the zoo; he is working on a plan. No dragon appears |
| 8 | Talk again, and after closing and reopening the world | None of the three is told twice |
| 9 | Jump straight to 60 and Talk three times | 20, 50 and 60 come one talk at a time, in order |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 466 to 473): how his likes and dislikes are read as gifts, the hat drawn on the shared body, the quest being one per world, and the build order of the rest.

## The Melder and the Book of Melding (0.1.315)

Close Minecraft fully and open it again first (a new block, items and textures). `/zoocraft:friendship darian <points>` sets your friendship for testing; the Melder, the Ender Flame and the book are also in the creative inventory.

| # | Do | Expect |
|---|---------|--------|
| 1 | `/zoocraft:friendship darian 30`, Talk (after his 20 talk) | He hands you the Melder, once. Talking again gives no second one |
| 2 | `/zoocraft:friendship darian 40`, Talk | He hands you the Book of Melding, once |
| 3 | Set the Melder down | An aqua cauldron on four feet with a bright pool, plainly not the game's cauldron; it lights the dark around it. No words float over it |
| 4 | Use it | A screen titled Melder: an aqua frame, two slots on the left, a little cauldron and arrow, one slot on the right |
| 5 | Put a Fire Charge in one left slot and an Ender Pearl in the other (either order) | Both go and an Ender Flame (a purple flame) lands in the right slot within half a second. Several pairs are joined at once |
| 6 | Put any two other things in | Nothing happens at all: nothing is made, taken or said |
| 7 | Shift-click something into the two middle (covered) slots | It comes straight back to you |
| 8 | Hit the Melder twice | Chat says hit again, then it comes back as an item and what lay in it drops out |
| 9 | Use the Book of Melding | A page turns and one page opens: Ender Flame: Fire Charge + Ender Pearl |
| 10 | Open a plain hopper and Han's Hanvil | Both look as they did |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 474 to 482). The Ender Flame does nothing yet: it lights the Void Portal in the next version.

## The Void Portal (0.1.316)

Close Minecraft fully and open it again first (a new block, dimension and textures). `/zoocraft:friendship darian 70` sets your friendship; `/zoocraft:voidframe` builds the End Stone frame in front of you (only into air) so you need not place 96 blocks by hand.

| # | Do | Expect |
|---|---------|--------|
| 1 | Before his 70 talk, use an Ender Flame inside a finished frame | Nothing lights; chat says Darian has not told you how yet. The Ender Flame is kept |
| 2 | `/zoocraft:friendship darian 70`, Talk (after his earlier talks) | His plan, over a few pages: the void, the End Stone frame 25 by 25, the Ender Flame from the Melder |
| 3 | Use an Ender Flame on the inside of the frame | The whole frame fills with a dark purple portal with slow swirls and a few pale stars. One Ender Flame is used up (none in creative) |
| 4 | Try a frame of another block, a frame with a gap, or a smaller frame | Nothing lights; chat says what the frame must be |
| 5 | Talk to Darian again | He felt it open, and says he needs more time to work out how to lure the dragon. Once only |
| 6 | Stand in the portal about 4 seconds (at once in creative) | You arrive on a small End Stone island in a near-black purple void, inside the same great portal. No lag spike: the island is loaded before you move |
| 7 | Look around | Nothing else anywhere: no land, no mobs, no sun. Falling off is a fall into the void |
| 8 | Step out, then stand in the island's portal again | You come back out of your own portal, where you went in |
| 9 | Break one End Stone of the lit frame (either side) | The whole portal goes out. Mending the frame and another Ender Flame lights it again |
| 10 | Light Jack's sea portal and go through | Works as before |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 483 to 491). The beef, the dragon and Damien come in the next versions.

## The dragon's bait (0.1.317)

Close Minecraft fully and open it again first (a new block, item and looks). Do the Void Portal rows above first: the portal must be lit. `/zoocraft:friendship darian 80` sets your friendship.

| # | Do | Expect |
|---|---------|--------|
| 1 | At 80, Talk (after his lit-portal talk) | Giant steak: he asks for 64 Raw Beef |
| 2 | Talk with fewer than 64 Raw Beef, or with Steak | Ordinary chat; nothing is taken. His page says he is waiting for 64 Raw Beef |
| 3 | Carry 64 Raw Beef (any stacks) and Talk | He takes exactly 64 and says to stand back |
| 4 | Close the talk and watch | 64 pieces of beef rise from him, circle over his head in three rings, draw together, and a great turning cube of beef shows. No words on the screen |
| 5 | Wait about 3 seconds more | The cube goes, you hold a Giant Beef (one, not stackable), and he tells you in chat to hang it near the portal |
| 6 | Use the Giant Beef far from the portal, or where there is no room | A chat line says why; you keep it |
| 7 | Use it on a block within 16 blocks of the lit portal (the underside of a block hangs it) | A 3 by 3 by 3 block of beef appears beyond that face; the item is used. Darian appears beside you in a puff and says to talk to him |
| 8 | Talk to him there | He will stay by the portal and says to come back in two days. His page says he is by the Void Portal, keeping watch |
| 9 | Leave and come back, at night too | He is still standing there |
| 10 | Break one block of the beef | All of it comes down as the one Giant Beef item, and Darian goes home. Hang it again and he comes back |
| 11 | Set off TNT by it; push it with a piston | It stays |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 494 to 502). After the two days nothing more happens yet: his question and the dragon's arrival come with the dragon, next.

## The Void Dragon (0.1.318)

Close Minecraft fully and open it again first (new creatures, looks and fire). Do the bait rows above first. To skip the two days: `/time add 48000`. Creative flight is the easy way to look at the fight; an Elytra with rockets is the real way.

| # | Do | Expect |
|---|---------|--------|
| 1 | Talk to Darian by the portal before two days have passed | His menu as ever |
| 2 | Talk to him two days after the bait was hung | He asks if you are ready: Yes, I am ready / Not yet |
| 3 | Not yet | He says to make ready; his menu opens. Next time he asks again |
| 4 | Yes, I am ready | A huge dark-gray dragon with spines and great wings comes down from the sky to the beef. The beef lifts off and slides into the portal; the dragon follows it in. No words on the screen |
| 5 | After it | The beef is gone, the portal is still lit, and Darian says in chat that it is trapped and that you need a way to fly |
| 6 | Go through the portal | The dragon is there, circling the island with its wings beating |
| 7 | Let it come at you | It flies at you and breathes crimson fire in a cone ahead of it: 3 hearts each half second you stay in it |
| 8 | Get close to its face | It bites: 15 hearts, you are knocked down and away, and blind for 3 seconds. Behind it you are not bitten |
| 9 | Hit its body, then hit an eye (arrows work) | An eye takes three times the damage |
| 10 | Wait on the island (about every 45 seconds) | It lands by the portal, folds its wings, roars, and after 2 to 3 seconds the whole island burns for 8 seconds: 4 hearts a second anywhere on it. In the air above (6 blocks up) you are safe |
| 11 | Bring it under half health | It sometimes stops, gathers purple fire in its mouth, and looses a deep purple beam: 12 hearts if it touches you |
| 12 | Bring it under a quarter | It turns bright white, and instead of the beam it spits a black fireball that bursts: 15 hearts within about 4 blocks |
| 13 | Die in the void during the fight | Chat says it is whole again; it is back to full health and dark gray |
| 14 | Leave the void and come back | It has the health it had |
| 15 | Bring it to a tenth of its health | It stops attacking, flies to the portal and is gone; chat says a man in black and white fled through the portal. It is not killed and drops nothing |
| 16 | Go back into the void | No dragon. The fight does not start again |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 503 to 512). The man who fled, Damien, and what Darian does to him come in the next version.

## Damien (0.1.319)

Close Minecraft fully and open it again first (a new person, item and look). Do the Void Dragon rows above first, to the end of the fight.

| # | Do | Expect |
|---|---------|--------|
| 1 | After the dragon flees, go back through the portal to the Overworld | Within a couple of seconds a man all in black and white stands near Darian by the portal, with a pale blue cast and frost glinting round him. Chat: he is frozen to the spot, and Darian says to hear him out |
| 2 | Hit him, push him, wait | Nothing moves or hurts him. No name floats over him |
| 3 | Use him | His story on six pages (Go on): from the End, shapeshifting with End Crystal and Void energy, the dragon took his mind, he remembers it all, weakening it freed him, that is why he ran |
| 4 | Close a page before the end, use him again | The story starts again; nothing is decided |
| 5 | After the last page | He begs for mercy. Buttons: Let him join the village / Put him on exhibit / Hear him again |
| 6 | Close that page | He stays frozen. Use him again: the choice again, without the story |
| 7 | Put him on exhibit | You get the Wizard's Exhibit Kit (one). He stays frozen by the portal for now |
| 8 | Use the kit outside the zoo, on a wall, on bumpy ground, or where something stands | It says why not; nothing is built |
| 9 | Use the kit on flat empty ground inside the zoo | A 5 by 5 ring of dark Nether Brick Fence goes up round that block, he appears inside it (no longer frozen: he looks at you), the kit is used up, and Darian goes home with a word |
| 10 | Use him in the exhibit | He asks to be released, says he had no control, and promises he would never have done it willingly. Buttons: Release him / Leave him here |
| 11 | Leave him here; leave the world and come back | He is still in the exhibit, one of him |
| 12 | Release him | He vanishes in a puff and says his name is Damien. Within seconds chat says Damien can move in |
| 13 | Give him a house with a Resident Mailbox (on the test street one stands empty for him) | He moves in like anyone. One Damien: nobody is left in the exhibit or by the portal. The fence stays for you to keep or break |
| 14 | Use Damien the resident | The usual menu: Talk, Give a Gift, Follow Me, his page. Friendship grows as with anyone |
| 15 | In another world: choose Let him join the village at step 5 | Same as 12 and 13 straight from the portal; Darian goes home |
| 16 | Step 7, then use him again by the portal | You can still let him join the village instead (the kit then does nothing) |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 513 to 525). 

## Darian at friendship 100 and the Freezing Wand (0.1.320)

Close Minecraft fully and open it again first (a new item and beam). To set friendship: `/zoocraft:friendship darian 100`.

| # | Do | Expect |
|---|---------|--------|
| 1 | At 100 friendship, Talk to Darian (after anything earlier he still has to tell) | He tells of Damien: two of the most powerful wizards, Damien vanished, the trail led to the dragon, he thought it had eaten him, the dragon is Damien |
| 2 | Step 1 before the dragon is beaten | It ends: Damien is trapped inside it, and weakening it enough may let him regain control |
| 3 | Step 1 after the fight, Damien still frozen by the portal | It ends: you have seen it; he stands frozen by the portal and his fate is yours |
| 4 | Step 1 with Damien living in the village | It ends: you let him live among us; my old friend is my neighbour again |
| 5 | Step 1 with Damien on exhibit | It ends: he stands behind a fence in your zoo, and it can still be undone |
| 6 | Talk to Darian again | He gives you Darian's Freezing Wand, once. Talking again gives no second wand |
| 7 | Hold the wand, look at an animal within 24 blocks, right-click | A white beam runs from you to it, glass chimes, and it stands frozen for 5 seconds with frost glinting on it. It cannot walk, and pushing or hitting it does not move it |
| 8 | Right-click again at once | Nothing: the wand shows its 10 second cooldown |
| 9 | Use it on a hostile mob, a flying mob, a resident | Each is held 5 seconds, then goes on as before |
| 10 | Use it on another player (two players) | They cannot walk or jump for 5 seconds, then can again. Leaving and rejoining while frozen leaves them free |
| 11 | Use it at nothing, or at something beyond 24 blocks | The beam goes out 24 blocks (or to the wall you look at) and nothing is frozen; the cooldown still runs |
| 12 | Use it on the Void Dragon (its body or an eye) | It hangs still for 5 seconds and does not attack meanwhile |
| 13 | At 90 friendship | Nothing new (not decided) |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 526 to 534).

## Wand look and gift talks (0.1.321)

Close Minecraft fully and open it again first (a new held model and picture).

| # | Do | Expect |
|---|---------|--------|
| 1 | Look at Darian's Freezing Wand in the hotbar | A dark blue wand with silver bands and a large pale ice crystal on top, with a dark outline |
| 2 | Hold it, first person and third person (F5) | A 3D wand in the hand, crystal up, not a flat picture |
| 3 | Right-click with it | The wand flicks forward and back in half a second as the beam fires, in both views |
| 4 | Right-click again during the 10 second cooldown | No flick, no beam |
| 5 | Talk to a resident over and over until they say they have talked enough, then make them owe you something (`/zoocraft:friendship darian 100`) and Talk again | They hand it over with their usual words and a pleased or plain face: never the telling-off, never a cross face. Keep Talking is still there |
| 6 | Keep Talking while they still have more to give (Darian at 100 has several) | Each press gives the next thing. None of these count toward the day's chats |
| 7 | When they have nothing left to give, Keep Talking past the limit | The usual: talked enough, then the telling-off |
| 8 | The day's first Talk, with a gift waiting | The gift and the day's friendship, as before |
| 9 | After Darian has asked for the 64 Raw Beef: give him Raw Beef (Give a Gift, or sneak and use him holding it) with fewer than 64 on you | Chat says he needs all 64 at once and how many you carry. Nothing is taken, and it does not use up the day's gift |
| 10 | The same carrying 64 or more | He takes exactly 64, says his line in chat, the pieces float up and join, and you are handed the Giant Beef. Talking to him with 64 on you does the same, as before |
| 11 | Give Darian Raw Beef before he has asked, or after he has had the 64 | An ordinary gift of one |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 535 to 539).

## Melding Solute and the Melder's new screen (0.1.322)

Close Minecraft fully and open it again first (new blocks, items and a new screen).

| # | Do | Expect |
|---|---------|--------|
| 1 | Use a Milk Bucket on an empty cauldron | The cauldron holds milk (white), the bucket is empty. An empty bucket takes the milk back |
| 2 | Use a Goo Bucket on that milk cauldron | A fizz, green sparkles, the liquid is bright green and glows a little. Chat says it is Melding Solute and holds 16 |
| 3 | The other order: Goo Bucket into an empty cauldron, then a Milk Bucket on it | The same bright green cauldron. The milk is not drunk |
| 4 | Milk Bucket on a Goo Cauldron that has been dipped from (not full) | Chat says the goo must fill it first. Nothing changes |
| 5 | Use Glass Bottles on the green cauldron | One Melding Solute (a green bottle) each time, 16 in all. The level drops twice on the way. After the 16th it is a plain empty cauldron |
| 6 | Use it with an empty hand | Chat says how many bottles are left |
| 7 | Break a milk or solute cauldron | It drops a cauldron |
| 8 | Open a Melder | The blue screen: Melder at the top left, a banner at the top with a spider eye and TNT joining in a swirl of sparks. Two yellow-rimmed slots on the left, one above the other, a green-rimmed slot further left between them, an arrow in the middle, a red-rimmed slot on the right. Each slot shows a pale emblem while empty: a gem, a bottle, a spark |
| 9 | Put a Fire Charge and an Ender Pearl in the yellow slots, no solute | Nothing happens, however long you wait |
| 10 | Add Melding Solute to the green slot | Bubbles rise from the Melder, the arrow fills yellow then red over 20 seconds, a brewing chime, and one Ender Flame is in the red slot. One Fire Charge, one Ender Pearl and one bottle are used |
| 11 | Leave more of each in | It melds again, 20 seconds and one bottle each time, until something runs out |
| 12 | Take an ingredient or the solute out halfway | The arrow empties. Putting it back starts again from nothing |
| 13 | Try to pick the arrow up | It can't be taken |
| 14 | Put something that is not Melding Solute in the green slot | It comes back to you within a second |
| 15 | Step back up to 24 blocks during a melding | It goes on |
| 16 | Pick the Melder up (two hits) mid-melding | What lay in it drops. No arrow item drops |
| 17 | Darian at friendship 30, after he has given the Melder: Talk again | He names the secret ingredient, Melding Solute, and tells how to make and use it. Players already past 30 hear it at their next Talk |
| 18 | Read the Book of Melding | It tells how to make the solute and where it goes, then the recipes |

Ours, Austin's to change (playtest/NPC_batch3_suggestions.md items 540 to 550).

## The Melder's window (0.1.323)

Close Minecraft fully and open it again first.

| # | Do | Expect |
|---|---------|--------|
| 1 | Open a Melder | The window is as tall as a chest's. Both yellow slots, the green slot between them on the left, the arrow and the red slot all show above the word Inventory; nothing is hidden behind the inventory |
| 2 | Watch the content log while opening it | No UI error about tts properties |
| 3 | Click the arrow during a melding | Nothing is picked up |

## The Melder's title (0.1.324)

| # | Do | Expect |
|---|---------|--------|
| 1 | Open a Melder (after a full restart) | The word Melder at the top left reads as cleanly as the word Inventory: one set of letters, no dark smear behind them |
| 2 | Look at the banner | The game's own Spider Eye on the left and TNT on the right, each in a small dark plate (yellow rim, red rim), sparks and the swirl between them |

## The Crimson Dragon's arrival, the small portal and its health bar (0.1.325)

Close Minecraft fully and open it again first (a new screen part and pictures). The real arrival happens once in a world; `/zoocraft:dragonarrival` (cheats on) shows it again at your lit Void Portal and changes nothing of the quest.

| # | Do | Expect |
|---|---------|--------|
| 1 | Stand some way back from your lit Void Portal and run `/zoocraft:dragonarrival` | Chat says a Giant Beef hangs in front of the portal; it does, on your side of it |
| 2 | Look up and around | The dragon is far off and high (about 60 blocks out, 55 up). It comes down in a wide turn round the bait, about 15 seconds, wings beating |
| 3 | Watch it land | It lands about 14 blocks from the beef, on the side away from the portal, folds its wings and sits facing the food, its head low and moving over it, for about 6 seconds |
| 4 | Keep watching | The beef lifts and slides into the portal; the dragon's head turns after it; then it takes off and flies into the portal after the meat and is gone. No words on the screen |
| 5 | After the test command | The beef is gone, the portal is lit, and nothing else has changed (Darian says nothing) |
| 6 | Go through the Void Portal | On the island the way back is now a small End Stone frame, 5 by 5 (3 by 3 of portal). The great frame that stood there is gone; anything you built there is untouched |
| 7 | Step into the small portal | It takes you home as before |
| 8 | In the void, with the dragon there | At the top of the screen: the title Crimson Dragon in red, and under it a gray frame with a red stone at each end and a red bar inside. No plain pink bar |
| 9 | Hurt it | The red bar empties from the right as its health goes |
| 10 | Bring it under half | The bar turns crimson and purple (the void fire) |
| 11 | Bring it under a quarter | The bar turns white, as the dragon does |
| 12 | Die there | The bar is full and red again |
| 13 | Meet the Giant Yeti or the Soul Sloth, or the game's own Wither | Their health bar is the game's usual one, unchanged |
| 14 | Open the content log after all of this | No new errors (the bar is new screen work: if a line names hud_screen, send it) |

## The Crimson Dragon redrawn (0.1.326)

Close Minecraft fully and open it again first (a new model, skin and movement). `/zoocraft:dragonarrival` shows it close up in the Overworld; the fight shows the rest.

| # | Do | Expect |
|---|---------|--------|
| 1 | Watch it fly (the arrival, or in the void) | Its wings beat in three parts, the beat rolling out to the tips; its body rises and falls a little with each beat; its legs are drawn up under it; its neck is arched and its head held high; its tail waves along its whole length, wider at the tip |
| 2 | Watch it turn | It leans into the turn, the inside wing lower |
| 3 | Watch it climb or dive | Its nose tips up or down with it |
| 4 | Look at its skin | Small overlapping dark-gray scales, each with a lit top, lighter along its back and darker below; plated belly. No big bricks |
| 5 | Look at its spines | A row of tall back-swept spines down its neck, back and tail, each narrowing to a pale point; smaller ones each side of its back; two long horns swept back from its head; a spade on its tail |
| 6 | Look at its legs when it lands (the arrival's sit, or the firestorm rest) | Haunch, shin and clawed foot, the feet flat on the ground and the body carried on them; forelegs the same, smaller. Nothing sunk in the ground |
| 7 | Watch it land and take off | The wings fold and the legs come down smoothly over about half a second, not in a snap |
| 8 | Watch it sit by the bait | Its head comes down toward the food, sways over it, and its jaw works |
| 9 | Watch it breathe fire, and charge the beam | Its jaw opens smoothly; its neck stretches forward for the fire and draws back for the beam |
| 10 | Under a quarter health | The same model in white, eyes dark |
| 11 | Hit an eye (arrows) | The eyes are where the red eyes are drawn, on the sides of its head, and still take three times the damage |

## The Crimson Dragon's hit areas (0.1.327)

Close Minecraft fully and open it again first (a new unseen creature rides the dragon). It used to have one square box, 7 blocks wide and 4 high, round its middle. Now its chest, head, neck, hips, tail and wings each have their own.

| # | Do | Expect |
|---|---------|--------|
| 1 | Shoot its head from the front | The arrow hits and hurts it (ordinary damage) |
| 2 | Shoot its neck | Hits |
| 3 | Shoot along its tail, down to the spade at the end | Hits all the way along |
| 4 | Shoot a wing while it flies (inner part, then near the tip) | Hits |
| 5 | Shoot past it, beside its chest but not touching it (the gap between body and nothing, over a wing root or behind a wing) | The arrow flies on: no hit in empty air |
| 6 | Shoot an eye from the side | Three times the damage, as before; the eyes stand out at either side of its head |
| 7 | Hit its tail or a wing with a sword when it comes low | Hurts it |
| 8 | While it stands for the firestorm, shoot its folded wings' place out to the side | Nothing there: the wing areas are drawn in to its back |
| 9 | Point the Freezing Wand at its tail or a wing | It freezes the dragon, as pointing at its body does |
| 10 | Read the content log after visiting the void | No "void portal:" lines |

## Darker Deep Trench, no more side caves; necklaces onto chestplates (0.1.328)

Close Minecraft fully and open it again first. The darker trench shows only where the trench is new (chunks not visited before); places already explored keep the lights they were made with.

| # | Do | Expect |
|---|---------|--------|
| 1 | Dive into a part of the Deep Trench you have never been to | Far fewer lights on the floor: lights come in patches, with wide stretches of pitch-dark floor between them |
| 2 | Wait in the dark stretches (Survival, no torches) | Goblin Sharks and Anglerfish show up there |
| 3 | Dive in a part of a trench you visited before | No new side caves are dug while you swim; the ones made before 0.1.328 stay as they are |
| 4 | Han Lock at 80 friendship: put a Crying Obsidian Necklace and any chestplate on the Hanvil | Out comes the same chestplate with the line "Crying Obsidian Necklace: Resistance"; the necklace is used up |
| 5 | Wear it | Resistance I while it is on (no particles), gone a few seconds after taking it off; its own armor as before |
| 6 | Same with the Wither Star Necklace and a chestplate, then get hurt and hit something | The stored damage is added to the hit, as with the necklace |
| 7 | Same with the Shroomlight Necklace | A small glow follows you |
| 8 | Try a necklace with an elytra, or with a chestplate that already has one | Nothing is made |
| 9 | Below 80 friendship | The Hanvil says it needs 80 |

## Damien guards the village; the Book of Melding's hints (0.1.329)

Close Minecraft fully and open it again first (new running animation and spell sparks). Damien has to be in the village already (you let him join after the dragon) and living in a house. He works nights now, so try this between about 4 pm and 7 am in game.

| # | Do | Expect |
|---|---------|--------|
| 1 | Stand by Damien's house a little after dusk | He comes out and runs (about as fast as you sprint) to the door of every other home in the village, nearest first, then back home; he rests half a minute and goes round again |
| 2 | Talk to him while he is out | He stops; "What are you doing" says he is on his rounds; his profile says protector of the village |
| 3 | Let a zombie, skeleton, creeper or spider come within about 24 blocks of him | A violet spark beam from him to it and it dies at once: no blast, no broken blocks, its drops fall as usual; now and then he says a line in chat |
| 4 | Name a zombie with a name tag, or lead one on a lead, and bring it near him | He leaves it alone; also endermen, piglins, zombified piglins, the Wither, the Ender Dragon, tamed mobs and zoo animals |
| 5 | Wait for sunrise | He goes home and sleeps through the day; no zoo visits |
| 6 | Give him an apple, a redstone thing, a weapon or armor; then a fermented spider eye, a wither rose, rotten flesh or bamboo | He likes the first ones, dislikes the second |
| 7 | Talk to him the morning after a round | Sometimes he has something a mob left on his rounds for you (bone, string, gunpowder, arrows, an apple, rarely an ender pearl) |
| 8 | `/zoocraft:friendship damien 50`, then talk to him | He thanks you, and says he may know a way to control the shapeshifting spell but must think on it more |
| 9 | `/zoocraft:friendship damien 70`, then talk to him | He says working with Darian he could learn to control it |
| 10 | Read the Book of Melding before making anything | Each recipe has a line: "not found yet" and a hint |
| 11 | Make an Ender Flame in a Melder while standing near it | Chat: "Book of Melding: Ender Flame is written in it in full now." The book shows the full recipe |
| 12 | A player who has heard Darian's 70 talk | The Ender Flame shows in full in their book even if they never made one |
| 13 | Darian at 90 friendship | Nothing new (as you said) |

## Advanced potions: Explosion, Demeter's Aura, Archer's Tempo (0.1.330)

Close Minecraft fully and open it again first (new items). Each potion is two steps: meld the ingredient in a Melder (with a bottle of Melding Solute), then brew it into an Awkward Potion (Nether Wart into a Water Bottle) at a brewing stand with blaze powder.

| # | Do | Expect |
|---|---------|--------|
| 1 | Read the Book of Melding | Unstable Eye, Apple of Growth and Gold Fruit each have a "not found yet" line with a hint |
| 2 | Meld a Spider Eye and TNT | An Unstable Eye; chat says it is written in the book in full now, and the book says to brew it into an Awkward Potion |
| 3 | Meld a Golden Apple and Bone Meal, then a Golden Carrot and a Glistering Melon Slice | An Apple of Growth, then a Gold Fruit |
| 4 | Brew each into an Awkward Potion | Potion of Explosion, Potion of Demeter's Aura, Potion of Archer's Tempo (a water bottle or any other potion makes nothing) |
| 5 | Drink the Potion of Explosion somewhere you don't mind holes, in Survival | Poisoned for 45 seconds. At each sting of the poison a TNT-sized blast goes off 3 to 5 blocks from you: blocks break and mobs and other players near it get hurt; you only lose the poison's hearts (a blast can still nudge you, and the ground goes from under you) |
| 6 | Drink milk while it runs | The poison and the blasts stop |
| 7 | Plant a field of crops, drink the Potion of Demeter's Aura and stand in it | For 3 minutes crops within 12 blocks grow about five times as fast; melon and pumpkin stems grow their fruit; sugar cane and cactus grow taller; nether wart, berries and cocoa too |
| 8 | Drink the Potion of Archer's Tempo and shoot a bow | For 3 minutes a half draw shoots as hard as a full one; ZooCraft's bows (Guido's) show ready in half the time |
| 9 | Let a potion run out | Chat says it has worn off |

## Damien at 90: the dragon shape and Dragon Seeker (0.1.331)

Close Minecraft fully and open it again first (new items, a new creature, a new cauldron).

| # | Do | Expect |
|---|---------|--------|
| 1 | Get to 90 friendship with Damien (to test: `/zoocraft:friendship damien 90`) and talk to him | He says he and Darian found a meld that works (they think) and gives you a Shapeshifting Potion, once |
| 2 | Talk to him again before drinking it | His page says to drink the potion he gave you, then talk to him |
| 3 | Drink it outside, with room round you | For 30 seconds you are a small dragon (the Crimson Dragon's look, about 4 blocks long) and you are hidden on its back. Chat says how to fly |
| 4 | Look where you want to go and walk forward; hold jump; look down and walk | It flies where you look (about 13 to 14 blocks a second); jump climbs; looking down dives |
| 5 | Swing your arm (left click) with a zombie, a pig, a villager and a named mob in front of you | Blue fire from its mouth. The zombie and the pig take 1.5 hearts and burn for 3 seconds; the villager and the named mob are left alone (so are golems, pets, leashed mobs and zoo animals). No blocks catch fire |
| 6 | Press sneak | You are yourself again, with Slow Falling until you land. The first time, chat says Damien and Darian will want to hear how it went |
| 7 | Drink another high up and let it run out | "Your dragon shape has worn off." Slow Falling takes you down with no fall damage |
| 8 | Talk to Damien, then to Darian | Both thank you and tell you the recipe |
| 9 | Read the Book of Melding | Shifting Dragons is written in full: Ender Flame + Dragon's Breath, then the cauldron step |
| 10 | Meld an Ender Flame and a Dragon's Breath (with a bottle of Melding Solute) | A bottle of Shifting Dragons |
| 11 | Use it on a Goo Cauldron that is not full, or on a water cauldron | Chat says to pour it into a cauldron full of goo; nothing is used |
| 12 | Use it on a full Goo Cauldron | The goo turns bright blue and glows (a Dragon Seeker Cauldron); you get the Glass Bottle back |
| 13 | Fill Glass Bottles from it | 16 bottles of Dragon Seeker, then the cauldron is empty |
| 14 | Drink one Dragon Seeker from the stack | 30 seconds as the dragon again; the stack goes down by one and you get a Glass Bottle |
| 15 | Drink milk while you are the dragon | You turn back at once |
| 16 | Please look | How the dragon looks round you in first person and in F5, whether your armor shows on its back, and whether jump and looking down move it as you expect. The test server can't show these |

## Damien at 100: Damien's Wand (0.1.332)

Close Minecraft fully and open it again first (a new item and its picture).

| # | Do | Expect |
|---|---------|--------|
| 1 | Get to 100 friendship with Damien, after his gifts at 90 (to test: `/zoocraft:friendship damien 100`), and talk to him | He gives you Damien's Wand, once, and tells you it is how he got stuck as the dragon |
| 2 | Drink a game potion (Swiftness, say) and one of ours (Archer's Tempo), then use the wand (right click) | Chat: "Time stops for your potion effects. They last until you zap yourself again." A puff of spell round you and the wand flicks |
| 3 | Wait a minute, then look at your effects (inventory screen) | Swiftness's timer has not moved; Archer's Tempo has not worn off |
| 4 | Drink another potion while time is stopped | It stays too |
| 5 | Drink a Dragon Seeker while time is stopped | You stay a dragon past 30 seconds, until you sneak |
| 6 | Use the wand again | Chat: "Time runs again for your potion effects." The timers count down again |
| 7 | Stop time again, then drink milk | The effects go, as milk always does; time stays stopped for the next ones until you zap again |
| 8 | Die while time is stopped | When you come back, time runs as normal |

## The Crimson Dragon's bar, Damien's skin, the dragon shape's armor and fire (0.1.333)

Close Minecraft fully and open it again first (a new unseen creature, a changed picture, the armor drawing and the fire).

| # | Do | Expect |
|---|---------|--------|
| 1 | In the void while the Crimson Dragon is fought, fly far from it (200 blocks or more) | Its health bar stays at the top of the screen the whole time, at the same health |
| 2 | Hit it, leave the void through the portal, then come back | The bar is back at the health you left it on |
| 3 | Hit it, then save and quit while in the void; open the world again and go back | Its health is where you left it (at most a second's worth of blows lost) |
| 4 | With a friend in the void: stand together, then fly far apart | Together you each see one bar; apart, each of you still sees one |
| 5 | Look at Damien (frozen by the portal, in his exhibit or in the village) and at his talk pictures | His face and hands are a normal skin colour; his hat, robe, legs and shoes are black and white as before |
| 6 | (Changed in 0.1.334: armor can't be worn as a dragon at all; see its section) | |
| 7 | (Changed in 0.1.334) | |
| 8 | As a dragon, hold the attack button (left mouse) | The blue fire keeps coming while you hold it and stops within a second of letting go. Tapping keeps it going too |
| 9 | Breathe at mobs up to 20 blocks away: zombies, a blaze or magma cube, a wild ZooCraft creature | Each takes damage every half second and the ones that can burn catch fire |
| 10 | Breathe at a villager, a zoo animal, a named or tamed pet, a Mob House creature, the Shark Folk | None of them are hurt |
| 11 | Breathe at the Crimson Dragon | Its bar goes down |
| 12 | As a dragon, go through a portal or get teleported | You are on your dragon again as soon as the land loads, and the content log stays clean |

## The dragon shape: no armor, no hint words, no mount hearts (0.1.334)

Close Minecraft fully and open it again first (the words file changed and an armor drawing file went).

| # | Do | Expect |
|---|---------|--------|
| 1 | Wear a helmet and boots and try to drink a Shapeshifting Potion (or a Dragon Seeker) | You don't drink it; the potion stays in your hand. Chat: "You cannot shapeshift with armor on. Take off what is on your head and feet first." |
| 2 | The same with only an elytra, a hat, a hairline or a necklace on | The same: anything worn counts |
| 3 | Take everything off and drink it | You are the dragon. No hearts above your hotbar, and no words pop up on screen |
| 4 | As a dragon, hold a chestplate and right-click | It doesn't go on and stays in your hand. Chat: "A dragon cannot wear armor." |
| 5 | As a dragon, open your inventory and drag a helmet onto your head | It is back in your inventory at once. Chat: "A dragon cannot wear armor, so it is back in your inventory." |
| 6 | As a dragon, press sneak | You turn back. No words pop up on screen. Your own hearts and hunger look as normal |
| 7 | Ride a horse or a pig afterwards | Its hearts show as usual |
| 8 | Ride a Void Ray | No words pop up on screen as you get on |

## Tim, resident 28, and Mega TNT (0.1.335)

Close Minecraft fully and open it again first (a new block, a new entity, new textures and particles). Try Mega TNT in a test world: it blows a crater 80 blocks wide and kills within about 75 blocks.

| # | Do | Expect |
|---|---------|--------|
| 1 | Have 9 different hostile mob species on display (zombie, skeleton, creeper, ...), with a Resident Mailbox set to Move-in ON | Tim isn't unlocked yet; his goal reads "10 different hostile mob species on display" |
| 2 | Put a 10th hostile species on display (a spider or an enderman doesn't count) | Tim unlocks and moves in by day: a zombie in a charcoal suit, a white shirt and a red tie |
| 3 | Talk to him a few times, morning and evening | Sarcastic lines; some say zombies are dumb, and that once he went vegetarian nobody hurt him |
| 4 | Give him a carrot, an apple, a book; then raw beef, rotten flesh, a sword | He likes the first three and dislikes the last three, each in his own words |
| 5 | Ask him to Follow Me as a stranger | He's creeped out, in his own words |
| 6 | Use "Ask for a book review" on his menu | One of his reviews in chat |
| 7 | Set up a reading room: a Work Anchor site with a chest and a lectern or bookshelf inside; assign Tim | On his day shift he reads there; now and then a signed book, "Tim's Review", lands in the chest. No block is changed |
| 8 | `/zoocraft:friendship tim 50`, then Talk | Page 1: only "Hey, I've got a gift for you." Press Go on: the punchline and "They give you nothing at all". Nothing is added to your inventory |
| 9 | Talk again (another day too) | No second joke. His page says "Their gift to you: a joke" |
| 10 | `/zoocraft:friendship tim 100`, then Talk | He says he made it with quantum physics and gives you one Mega TNT. Talking again gives no second one |
| 11 | Place Mega TNT on the ground (far from your zoo) | A glowing green block with a hazard band and a radiation sign on top; green glints rise off it |
| 12 | Light it with flint and steel and run (far: 80+ blocks) | It turns into a flashing block, flashing fast at the end; 20 seconds after you light it, it blows |
| 13 | Look at the crater | A round hole about 80 blocks across and 40 deep, cut from the middle out in about a second, with no freeze. Obsidian and bedrock in it are still standing; a chest's contents lie at the bottom |
| 14 | Light one with a redstone block or lever, one with fire beside it, and one with a fire charge | Each lights the same way, with the same 20 second fuse |
| 15 | Put a Mega TNT and a TNT within 40 blocks of a lit Mega TNT | Both go off after the first blast, about a second later |
| 16 | Light one under water | A big blast, but no crater (as TNT under water) |

## Dr. Foss, resident 29 (0.1.336)

Close Minecraft fully and open it again first (a new item, new textures and a new part of the residents' body).

| # | Do | Expect |
|---|---------|--------|
| 1 | Have 39 exhibits with animals in them, with a Resident Mailbox set to Move-in ON | Dr. Foss isn't unlocked yet; his goal reads "40 exhibits with animals in them" |
| 2 | Put an animal in a 40th exhibit (any species, even one you already show) | Dr. Foss unlocks and moves in by day |
| 3 | Look at him | A brown hat with a wide brim all round and a crown on top, a brown leather jacket open over a tan shirt, a satchel strap across his chest and the bag at his left hip, a belt, dark trousers, tall boots, stubble. Nobody else wears the hat |
| 4 | Talk to him the first time | "Ah, hello there! Dr. Foss. I'm a scholar of archaeology and ancient history..." |
| 5 | Give him a map, a bone block, an egg, an emerald, a pottery sherd (one a day) | He likes each, in his own words |
| 6 | Give him redstone or a clock | He dislikes it ("Redstone. Gadgets...") |
| 7 | Sneak and use an enchanted iron sword on him, another day a plain one | The enchanted one he likes ("It hums with magic"); the plain one is just neutral |
| 8 | Let it rain on one of his zoo days | He stays home |
| 9 | Ask him to Follow Me as a stranger | He's creeped out ("That's weird...") |
| 10 | Set up an archaeology study: a Work Anchor site with a chest and a decorated pot, a bone block or a lectern inside; assign Dr. Foss | On his day shift he studies there with a brushing sound; now and then a signed book, "Field Notes" by Dr. Foss, lands in the chest. No block is changed (a suspicious sand block stays unbrushed) |
| 11 | `/zoocraft:friendship dr_foss 40`, then Talk | His Exotic Formation Cave story over a few pages (Go on): the goo, the shark people, an owl the size of a man, the bones and pottery the goo kept. Talking again doesn't repeat it as a gift |
| 12 | `/zoocraft:friendship dr_foss 60`, then Talk | He gives you the Mysterious Egg (teal with purple swirls and gold flecks) and tells of a jungle civilization nobody can see. His page says "Their gift to you: the Mysterious Egg" |
| 13 | Try to use the egg: throw it, place it, eat it, craft with it | Nothing happens: it is only a collectible. A second Talk gives no second egg |

## Dr. Foss's archaeology (0.1.337)

Close Minecraft fully and open it again first (new items and textures).

| # | Do | Expect |
|---|---------|--------|
| 1 | Open the crafting book after picking up iron, string and copper | Rock Hammer, Sifting Pan and Magnifying Glass recipes show up |
| 2 | Craft a Rock Hammer (0.1.340: iron ingot top middle; iron ingot, stick, iron ingot across the middle; stick bottom middle) | A geologist's hammer that mines stone like an iron pickaxe |
| 3 | In survival, mine a few hundred natural stone with the hammer (stone, deepslate, granite...) | Now and then (about 1 in 50) a find pops out with a ding and green sparkles, and a chat line names it. The stone still drops its cobblestone |
| 4 | Mine stone with an ordinary pickaxe | Finds come much more rarely (about 1 in 250) |
| 5 | Place stone and mine it again; mine cobblestone or bricks | Never a find |
| 6 | Get 8 finds in one Minecraft day | No more from stone until the next day |
| 7 | Mine deep (deepslate, or below y 0) | Skulls, tablets and old tools turn up more often |
| 8 | Craft a Sifting Pan (sticks and string in a woven square) and use it on sand or gravel | The block is sifted away; usually flint, clay, a nugget or a bone, sometimes a fragment, rarely a pottery sherd |
| 9 | Craft a Magnifying Glass, hold a find in your off hand, use the glass | Chat says what it is and how many kinds you've looked over (of 7). Nothing shows on screen |
| 10 | Put finds in item frames and decorated pots | They show like any item |
| 11 | Give Dr. Foss a find | He likes it |
| 12 | Brush suspicious sand in a desert well or trail ruins | Works as always |

## Dr. Foss at 80: the Frequency Stick (0.1.338)

Close Minecraft fully and open it again first (a new item, a new entity, textures and a fog).

| # | Do | Expect |
|---|---------|--------|
| 1 | `/zoocraft:friendship dr_foss 80`, then Talk | Several pages: the TNT accident, the village in the treetops, why he walked away, then he gives you the Lightning TNT Frequency Stick and warns that ordinary weapons won't touch them |
| 2 | Look at the stick | A red stick of TNT with a lit fuse and a bright bolt across it, shimmering |
| 3 | In survival, look down and throw it at your feet | A flash, sparks and thunder; you lose exactly one heart (in any armor); chat says Transcending Vision has started for 10:00; the world takes a faint violet haze; no block is broken |
| 4 | Pick the stick up again from where it landed | It's back in your inventory |
| 5 | Throw it far away | It goes off over there; you aren't hurt; chat says to throw it at your feet |
| 6 | Have a friend stand next to you when you throw it | They get the vision too (and lose a heart) |
| 7 | Wait 9 minutes | Chat warns it is fading with 1:00 left; at 10 minutes it says it has worn off and the haze goes |
| 8 | Die while it lasts | Chat says it left you when you died; the haze goes |
| 9 | Log out and back in while it lasts | The haze comes back and the time carries on |
| 10 | Throw the stick into lava, then talk to Dr. Foss | "Ask for the Lightning TNT Frequency Stick" is on his menu and he gives you another |

## The Frequency Friends' hidden jungle villages (0.1.340)

Close Minecraft fully and open it again first (new blocks, a new creature and textures).

| # | Do | Expect |
|---|---------|--------|
| 1 | Get Transcending Vision (throw the Lightning TNT Frequency Stick at your feet), then go into a jungle with giant jungle trees (the ones with 2 by 2 trunks) | Within a few seconds of being near the tallest one, chat says a village of the Frequency Friends hums into view high in the tallest tree |
| 2 | Look up at the tallest tree and climb to its crown | A round wooden deck round the trunk near the top, four small huts with doors facing in and a window out, thatched roofs, lanterns, and a carved monument with an empty nest on top |
| 3 | Look round the deck and in the huts | Six Frequency Friends: slim violet figures with glowing eyes, bands and antennae, bobbing gently and turning to look at you |
| 4 | Talk to one | A line in chat about it humming, waving or pointing at the monument |
| 5 | Hit one with a sword, shoot one with a bow | No damage at all |
| 6 | Try to break a village block, or blow one up | It doesn't break and nothing drops |
| 7 | Have a second player without the vision stand near you | They see the village (Bedrock can't hide blocks per player) but not the Frequency Friends, and they can't talk to them |
| 8 | Walk more than 80 blocks away, or let the vision run out | The village comes down and the tree's leaves are back as they were; anyone still up there drifts down with slow falling |
| 9 | Come back with the vision | The same village goes up in the same tree |
| 10 | Log out while it's up, then come back without the vision | It comes down by itself |
| 11 | Go to a jungle without the vision | Nothing appears |

## The way to Acufend (0.1.341)

Close Minecraft fully and open it again first (a new block, its texture, a new dimension, its sky and fog).

| # | Do | Expect |
|---|---------|--------|
| 1 | Build an upright frame of Crying Obsidian 4 wide and 5 tall, empty in the middle (the 4 corners can be left out). In creative, `/zoocraft:acuframe` sets one up 3 blocks in front of you | A frame like a Nether portal's |
| 2 | Use Flint and Steel inside it | Only fire, as on any block. No portal |
| 3 | Stand more than 4 blocks away and throw the Lightning TNT Frequency Stick at the frame | It goes off as usual and the middle fills with a swirling purple portal with orange sparks |
| 4 | Throw the stick at a frame of plain obsidian, or at a Crying Obsidian frame with a gap | No portal. At the gappy one, a chat hint about the frame (once) |
| 5 | Stand in the portal for 4 seconds (at once in creative) | A purple fade, then Acufend: you stand on a 7 by 7 pad of polished blackstone in front of a lit Crying Obsidian frame |
| 6 | Look round | Orange sky overhead, purple fog at the horizon. Jagged tuff, blackstone and basalt ground, sharp dripstone spikes with points (now and then a huge one), and mountains banded orange, purple and magenta |
| 7 | Walk or fly round for a few minutes | The land keeps appearing ahead of you inside the fog, never a visible edge, and no lag spikes |
| 8 | Stand in the pad's portal for 4 seconds | Back in the Overworld, in the portal you went in by. Step out and back in to go again |
| 9 | Go in by a second portal right beside the first | The same pad as before |
| 10 | Go in by a portal more than 200 blocks from the first | A new pad, an eighth of that distance away in Acufend (as the Nether) |
| 11 | In creative, break through the bedrock at the bottom of Acufend and fall | Caught below it and sent back to the Overworld, falling slowly |
| 12 | Break one block of a lit frame | Its portal goes out |
| 13 | Throw the stick at a Crying Obsidian frame in the Nether | It only goes off. A chat line says the way only opens from the Overworld |

## Acufend's great cave and the Frequency Friends' statue (0.1.342)

Close Minecraft fully and open it again first (four new blocks, their textures and a new block shape).

| # | Do | Expect |
|---|---------|--------|
| 1 | Go through an Acufend portal | In chat: a cold wind rises from deep under the rock, about so many blocks to the north, east or wherever. It says it each time you arrive until you have found the great chamber |
| 2 | Walk that way | A trench with dripstone walls, 5 wide, cut down into the rock (in a dip it runs on a dripstone causeway). It becomes a tunnel going steeply down |
| 3 | Follow it down | Into a side chamber some 40 to 50 across, hung with stalactites, with stalagmites on its floor. Every step is one block or less |
| 4 | Find the narrow passage out of the side chamber | 3 or 4 wide and 4 high, winding, with dripstone points hanging from its roof. It comes out in the great chamber |
| 5 | Stand in the great chamber | A chat line about a cavern bigger than any you have seen. A dome up to 70 high, huge stalagmites (some reaching the roof as pillars), massive stalactites, dripstone, tuff and copper on every face, glow lichen here and there on the floor |
| 6 | Walk to the middle | A flat floor round a dais of tuff bricks (chiseled tuff at its corners). On it the statue: 3 wide, 7 tall, a pointed spiky rock of gold and glowing emerald on carved stone with a gold wave |
| 7 | Try to break a statue block, in survival and creative, or blow it up with TNT | It stays. Taking it comes after its guardian (0.1.343 and 0.1.344) |
| 8 | From the great chamber, try each of the other three passages | Each leads to its own side chamber |
| 9 | In creative, `/zoocraft:acucave` while in Acufend | You stand at the mouth of the way in, facing down it |
| 10 | `/zoocraft:acucave true` | You stand on the great chamber's floor beside the statue |
| 11 | Walk round the cave for a few minutes | It keeps appearing as you go (inside the fog, as the land outside). No lag spikes |
| 12 | Make a second world and go to Acufend | Its cave is somewhere else, and shaped differently |

## Augustus Kong, Protector of Gods (0.1.343)

Close Minecraft fully and open it again first (two new entities, their models, textures and animations, six particles).
The test server checked his moves, the hits and the defeat, not his looks, sounds or dust: those rows are yours.

| # | Do | Expect |
|---|---------|--------|
| 1 | In creative, in Acufend, `/zoocraft:acucave true` | Beside the statue. Augustus Kong stands guard on the flat floor in front of it, facing where the passage from the way in comes into the chamber. He ignores you in creative |
| 2 | Look at him | A gorilla about 6 blocks tall: dark fur, silver back, green eyes, tuff rock on his shoulders and forearms, dripstone spikes along his back |
| 3 | `/gamemode survival` (or walk in from the way in, in survival) | Chat: he rises beside the statue and beats his chest. He roars, the ground shakes |
| 4 | Stand still on the flat floor | He crouches and a ring of dust marks the floor round where you stand (the slam's size). About 1.3 seconds later he leaps and lands there: rock and dust burst out, the ground shakes, you are hurt (most at the middle) and thrown back |
| 5 | Run out of the dust ring while he crouches or flies | He lands where you were. You are not hurt |
| 6 | Stand on the far side of the statue | He leaps over it (high over its top), never touching it |
| 7 | Stand well off (over 26 blocks), or up on the statue, or up on a stalagmite | He punches the floor and tears out a dripstone spike, raises it over his shoulder and throws it, nearly flat, at where you stand. It hurts you if it reaches you and breaks on whatever it hits. Side-step and it misses |
| 8 | Fight him down to half his health | Chat: he roars and beats his chest, quicker now. Shorter warnings, a wider slam ring, three spikes at a time, fanned |
| 9 | Wear him down to his last point of health | Chat: he sinks down, spent. He sits and no hit hurts him any more |
| 10 | Leave Acufend and come back to the statue | He sits calmly across the statue from the way in. He never fights again in this world |
| 11 | `/zoocraft:kongreset` (creative, cheats on) | He guards the statue again, whole, as if never beaten |
| 12 | Fight him a little, then go out of the great chamber for half a minute and come back | He is back at his place and whole again. Back sooner: his health as you left it |
| 13 | After any fight, look at the statue, the dais and the floor | Nothing is broken or moved |
| 14 | `/kill @e[type=zoocraft:augustus_kong]` | He is back the next moment (whole, or sitting calmly if beaten) |
| 15 | With a friend, both in the chamber | He goes after whoever is nearest. A slam hurts everyone in its ring |

## Dr. Foss's Acufend expedition (0.1.344)

Close Minecraft fully and open it again first (a new item and its picture, the Frequency Friends' walk).
The test server checked the offer, Dr. Foss walking along, the statue taken and put up, the ambush and the way home,
not looks or sounds: those rows are yours. To reach 100 friendship fast, give him gifts he likes and talk each day.

| # | Do | Expect |
|---|---------|--------|
| 1 | At 100 friendship with Dr. Foss, Talk | His story of Acufend, a few pages ("Go on"). It ends "Will you come with me to Acufend?" with two buttons: I'll come with you, Not yet |
| 2 | Press Not yet | Chat: the offer stands. His menu now has The Acufend expedition. Press it: he asks again |
| 3 | Press I'll come with you | Chat: how to get there (an upright Crying Obsidian frame, at least 4 by 5, hit with the Lightning TNT Frequency Stick) |
| 4 | Close his story with the cross instead of answering | Next time you open his menu he asks first |
| 5 | His menu, Friendship and About | "Right now" reads as usual. In Acufend later it reads "in Acufend, on the expedition" |
| 6 | Go through the Acufend portal | About 2 seconds after you, Dr. Foss comes through in a puff where you arrived. Chat: "Acufend! Look at that sky..." |
| 7 | Walk, sprint, jump about | He walks where you walked, about 3 blocks behind; he hurries when you get ahead. Left far behind (a long drop, a fast sprint) he pops up near you |
| 8 | Fly in creative | He waits; land and walk and he comes on |
| 9 | Walk toward the great cave | Near it, chat: "Listen. Hear that hum? We're close" |
| 10 | Go into the great chamber (survival) | Augustus Kong wakes. Chat: "You fight. I'll supervise. From back here." Dr. Foss stops at the edge of the chamber (about 44 blocks from the statue) and stays there through the fight. Nothing hurts him |
| 11 | Try to use the statue before Kong is beaten | Chat: Augustus Kong guards the statue |
| 12 | Beat Kong | Chat: "You beat him!..." Dr. Foss comes on to you. Kong sits, calm |
| 13 | Use the statue (any of its gold, emerald or stone blocks) | A question: Take it / Leave it. Leave it: nothing changes |
| 14 | Take it | Its blocks go (the dais stays), the Frequency Friends' Statue is in your inventory. Chat: "We have it!..." |
| 15 | Wait a moment | Frequency Friends come out of the three passages that are not the way out, and up from the far side of the floor: 24 of them, visible to everyone, humming. Chat: "Frequency Friends! ... Run! Out of the cave and back to the portal!" |
| 16 | Hit one | Chat once: your blow passes straight through. They take no damage from anything |
| 17 | Stand still | They walk up and hit you (about a heart and a half a hit on Normal). Kong does not join in |
| 18 | Run (sprint) out the way you came in | They follow but a sprint outpaces them. At the mouth of the cave they stop and go. Chat: they hum after you |
| 19 | Die in the cave with the statue | It drops where you fell and stays there. After a while with nobody in the cave the Frequency Friends go. Go back for it: no second ambush |
| 20 | Back through the portal with the statue | In the Overworld, a few steps from the portal, Dr. Foss comes out after you. Chat: "We made it! ... You know what? Keep that one. You've earned it." He stands by you a while, then goes home in a puff |
| 21 | Back through the portal without it | Chat: "Back in one piece..." He goes home |
| 22 | Use the statue on the top of a block in the open | It stands there: the cave's statue, 3 wide, 3 deep, 7 tall, gold and emerald. The item is gone from your hand |
| 23 | Use it on the side of a block, in a cramped spot, or in Acufend | Chat says why, nothing is placed. It never replaces a block (only air, grass, ferns, dead bushes, snow) |
| 24 | Use the standing statue | A question: Take it down / Leave it. Take it down: the item is back in your hand. Stand it up somewhere else |
| 25 | A friend uses your statue | Chat: it is yours, only you can move it |
| 26 | Hit it in survival, blow it up with TNT or Mega TNT | It stands |
| 27 | In creative, break one of its blocks | The whole statue comes down into your inventory |
| 28 | Dr. Foss's menu, The Acufend expedition, after it is home | His word on the statue ("looks splendid where you've put it" once it stands) |
| 29 | Close the world and open it again with the statue standing | It is still there, still yours to move |
| 30 | `/zoocraft:fossstatue` (creative, cheats on) | The statue in your hand as if just taken (you are put on the expedition). In the Overworld Dr. Foss comes out to you as in row 20 |
| 31 | `/zoocraft:fossreset` | The expedition as before anyone set out: answers forgotten, a standing statue gone, the cave's statue back (if you are near it in Acufend) |

## Dr. Foss's visits to the statue (0.1.345)

Close Minecraft fully and open it again first. You need the expedition done and the Frequency Friends' statue standing
in the Overworld (`/zoocraft:fossstatue` gives it to you if you want to skip the expedition). He goes on about every
other day, at most once a day, so some days nothing happens. The test server checked his walks, the puff, the moved and
taken-down statue and the zoo stop, not looks: those rows are yours.

| # | Do | Expect |
|---|---------|--------|
| 1 | Stand the statue beside a path that joins Dr. Foss's front door (within about 16 blocks of the path), and wait at it in his morning (before work and the zoo) or his evening | On one of his days he comes out of his door, walks along the path, takes the last few steps off it to a spot about 3 blocks from the statue, and faces it |
| 2 | Stand near him while he looks | Chat, once: one of his lines about the expedition (Kong, the Frequency Friends, Acufend) |
| 3 | Open his menu there | "Right now: admiring the Frequency Friends' statue". Talk: one of the same lines |
| 4 | Wait about 30 seconds | He walks home the way he came and goes in at his door |
| 5 | Stand the statue beside one of the zoo's paths, inside the park | On one of his days, on his zoo visit, the statue is one of his stops: he walks there over the zoo's paths, looks a while, then goes on with his visit. His menu: "at the zoo, admiring the Frequency Friends' statue" |
| 6 | Take the statue down while he walks to it, and stand it up somewhere else | From home: he turns back, goes in, then sets out again to its new place. At the zoo: he goes straight to its new place |
| 7 | Take it down while he looks at it | He goes home (at the zoo: on with his visit) |
| 8 | Stand it somewhere no path goes (out in a field) and wait by it | On one of his days he comes in a puff beside it, on your side, looks a while, says his line, and goes home in a puff. With nobody near it he doesn't come |
| 9 | Rain or thunder | He doesn't go out to it from home (he can't stand rain) |
| 10 | Night, or just before his work or bedtime | He doesn't set out: he only goes when he'll be back in time |

## The Frequency Friends' tree house village (0.1.347)

Austin (2026-11-21): "The friendship friends village looks terrible. Take your time to research and design a tree house
civilization. There should be bridges that lead to other trees, and detailed designed homes." The four huts of 0.1.340
are gone. The village is now built of the game's own wood round the tallest giant jungle tree and the trees about it,
from 20 build videos' rules: a great deck stepping in underneath, a spiral stair up the trunk, the Council Hall high in
the crown, homes at different heights on the trees round it, rope bridges between them. It is shown and hidden as
before (the vision, the shared reveal), and every block goes back as it was. Close Minecraft fully and open it again
first.

| # | Do | Expect |
|---|---------|--------|
| 1 | With Transcending Vision, go into a jungle with giant jungle trees | Near the tallest one, chat says the Frequency Friends' village hums into view. It goes up over a few seconds |
| 2 | Look at the tallest tree from the ground | A big octagon deck round the trunk about two fifths of the way up, stepping in underneath, with lit posts round its railing. A wooden house hangs off its edge on one or more sides. High in the crown, the Council Hall: purple windows, a balcony, and a crimson roof rising out of the leaves with a glowing crown and a crystal on top |
| 3 | Walk up the spiral stair round the trunk from its foot (a lantern marks it) | Slabs half a block apart all the way up, with a railing and a lantern every quarter turn, to the deck, and on through the deck up to the hall's floor. No step too high, no bumping your head |
| 4 | Look round the hall | The monument on a mossy pedestal with candles, bookshelves, glowing floor blocks, lanterns hanging on chains of fence, two doors out to the balcony |
| 5 | Look out from the deck | Rope bridges (slab walkways, sagging a little, railings on both sides with lit posts) to two to four other trees, each with its own deck at its own height: a house with a gable roof, a round hut with a cone roof, an open workshop |
| 6 | Cross each bridge and go into each house | Doors, windows with shutters and flower boxes, a bed, a table and chair, a candle, bookshelves, a rug and a hanging lamp. The workshop has its work tables |
| 7 | Look round for the Frequency Friends | About six of them, on the decks and in the hall and homes |
| 8 | Try to break any village block, strip a log with an axe, or set off TNT on the deck | Nothing breaks or drops (a line in chat says the wood won't give). The blast leaves the village whole |
| 9 | Walk more than 80 blocks away, or let the vision run out | The village comes down, last block first. The trees' leaves and branches are back as they were and nothing lies on the ground. Anyone up there drifts down slowly |
| 10 | Come back with the vision | The same village goes up in the same trees |
| 11 | In a world that had a 0.1.340 village, go back to it | The old huts come down by themselves, then the new village goes up when you come with the vision |
| 12 | Build something of your own (stone, a chest) in a tree's crown before the village first goes up there | The village leaves your blocks alone: a bridge whose way is blocked isn't built, and nothing of yours is replaced |

## Acufend, the small moon (0.1.348)

Austin (2026-11-21): "Acufend is actually a tiny moon of an ancient world. It is only 500 blocks by 500 blocks ... I
would need you to load the whole dimension before the player even enters. At the end of the world, it would just be
void. ... The cave also never loaded in the dimension." Acufend is now one round moon 500 blocks across, its land,
spikes and banded mountains as before, the great cave and the statue inside it. The whole moon is built once in each
world, starting a minute after the world is first opened with this version, a square of chunks at a time, the middle
first. The Acufend portal opens onto it once it is whole. Past its edge, and under it, is the void. Close Minecraft fully
and open it again first.

| # | Do | Expect |
|---|---------|--------|
| 1 | Open your world and play as usual for a few minutes | Nothing to see; the moon is being built out of sight, a slice of each tick, so the game keeps its pace |
| 2 | Stand in a lit Acufend portal straight away (before the moon is done) | You stay where you are; chat says how much of the moon is built (for example 40%). Once it is done, chat says Acufend is whole, and the portal takes you |
| 3 | Go through the portal | You land on a pad with a lit frame on the moon. Chat says which way the cold wind of the great cave rises from, and roughly how far |
| 4 | Look round | Land as before, now with no edge appearing as you move: everything is already there. The purple haze only at the far edge of what you can see |
| 5 | Walk to the moon's edge (at most about 250 blocks from the middle) | The land sinks toward it, then stops at a cliff. Look over: the moon's rock rounds off below like the bottom of a floating island, with stones of dripstone hanging from it, and nothing but void beyond and below |
| 6 | Step off the edge (or dig down through the bottom) | You fall into the void and come back where you went in, falling slowly |
| 7 | Follow the cold wind to the great cave's way in | An open trench going down into the rock, curving round as it goes down to the side chamber, then the passages to the great chamber, the statue on its dais in the middle (Augustus Kong guards it as before) |
| 8 | `/zoocraft:acucave true` in Acufend | You are by the statue in the great chamber |
| 9 | In a world where you had been to Acufend before this version | The moon is made far from the old land (you never see the old land again). If you were standing in Acufend when the world opened, you are sent home with a line in chat; the portal then takes you to the moon |
| 10 | In a world where the statue had already been taken home | The moon's cave has the dais with no statue on it (there is only one statue) |

## Dr. Foss on the moon (0.1.349)

Austin (2026-11-21): "mention the light comes from the ancient world acefund orbits is a glowing purple, while the sun
is an orange". Dr. Foss now speaks of Acufend as the small moon it is.

| # | Do | Expect |
|---|---------|--------|
| 1 | Reach 100 friendship with Dr. Foss and hear his story | "There is another world. Acufend. A tiny moon of an ancient world, hanging alone in the void." Its light comes from the ancient world it circles, glowing purple, and from its orange sun. Then his offer, as before |
| 2 | His menu's rewards list | His 100 reward reads "a story: Acufend, the little moon nobody comes back from, and his offer to go there with you" |
| 3 | Go through the portal with him on the expedition | One of two lines: the orange sun and the purple ancient world, and the edge with nothing past it but void; or "mind the edge: this whole moon ends in void" |

## The tree house village goes up (0.1.350)

Austin (2026-11-21): "The village is not spawning for me in the jungle" ... "Yes it was on, and I was by a tree". In a
real jungle the great tree was found, but the village waited for the land all round it to be loaded, which the game
never does round a player (it keeps only about 4 chunks round you loaded). Now it loads its own area while it goes up
and comes down.

| # | Do | Expect |
|---|---------|--------|
| 1 | In a jungle with giant (2 by 2) jungle trees, throw the Lightning TNT Frequency Stick at your feet and stay there | Within a few seconds chat says the village hums into view, round the tallest tree within about 48 blocks |
| 2 | `/zoocraft:village` | Lines in chat: your vision, the biome here, the nearest village (where, how far, up or not), and what the last look over the jungle found |
| 3 | Walk well away (over 80 blocks) | The village comes down behind you, every block as it was |
| 4 | Walk back with the vision still on | It goes up again |
| 5 | In jungle with no giant tree near, `/zoocraft:village true` | It says it's looking; asked again, the last look says "no trunk 12 or more logs tall" |

## Augustus Kong, quick and strong (0.1.351)

Austin (2026-11-21): "The Augustus Kong boss fight is very slow, Kong should be able to move around quick, and jump in
the air to slam players far away, not just jump when they are close. He also feels clunky, the design is great, but the
movement and attacking feels like he is a weak boss". His look is the same; how he moves and fights is new.
`/zoocraft:acucave true` takes you to the statue; `/zoocraft:kongreset` makes him fight again.

| # | Do | Expect |
|---|---------|--------|
| 1 | In Survival, walk up to the statue | He roars, then runs at you on all fours, faster than you can sprint (8 blocks a second) |
| 2 | Stand close to him | Both fists go up, then down on the floor in front of him: the Fist Smash (18 damage on Normal, thrown back). It misses if you get behind him or out of reach in time |
| 3 | Run to the far side of the great chamber, off the flat floor | He crouches (a ring of dust follows you, then stops), leaps right across the chamber in about a second and lands on you. He lands on the cave floor, never on a stalagmite, never on the statue |
| 4 | Keep moving while the ring is on you | The ring stops following a quarter of a second before he jumps: sprint out of it then |
| 5 | Stay far away from him | Mostly leaps, now and then a dripstone spike |
| 6 | Climb the statue or a stalagmite | Only spikes reach you up there |
| 7 | Bring him to half health | He roars; after that he runs at 10 blocks a second, warns for less time, throws three spikes, and sometimes leaps a second time straight after landing |
| 8 | Fight him to the end | He sinks down beaten as before; no block of the cave or statue has changed |
| 9 | Leave the chamber mid-fight for 30 seconds | He heals and goes back to his place (in one leap if he was off the flat floor) |

## Dr. Foss leads the way; the cave's mouth (0.1.352)

Austin (2026-11-21): "Dr Foss should lead the player in Acufend to find the cave. There should also be a cave opening
in the surface that leads down to it so its not all luck".

| # | Do | Expect |
|---|---------|--------|
| 1 | Open your world and wait about a minute | The content log says "the cave's mouth made" (once per world). Nothing else changes on the moon |
| 2 | In Acufend, `/zoocraft:acucave` | You stand at the mouth: a wide hollow about 20 blocks across that funnels down to the tunnel, with four tall dripstone stones round it, each with pale purple light on top |
| 3 | Walk down the hollow's sides | Steps of one block (two here and there); the tunnel's opening is in the rock face at the far end |
| 4 | With the expedition accepted, go through the portal | Dr. Foss comes through after you, says he knows the way, and walks AHEAD of you |
| 5 | Follow him | He goes round spikes and cliffs, by ground you can walk. He walks a little faster than you; sprint up behind him and he hurries to stay in front |
| 6 | Stop, or wander off a little | Over 14 blocks behind, he stops, looks back and calls you. He goes on when you are within 8 |
| 7 | Run far off another way (over 36 blocks) | He appears by you in a puff and leads on from there |
| 8 | Follow him to the mouth | He says "There: the way down", and goes down the tunnel first |
| 9 | Follow him down | Across the side chamber and along the passage. He stops at the edge of the great chamber (he never goes nearer Kong) |
| 10 | Walk into the great chamber | From then on he walks behind you, as before. On a later trip, with the statue already taken, he only follows |

## Augustus Kong's jungle health bar (0.1.353)

Austin (2026-11-21): "Augustus Kong should also have his own boss bar that is Jungle Themed".

| # | Do | Expect |
|---|---------|--------|
| 1 | In Acufend, `/zoocraft:kongreset`, then stand at the edge of the great chamber | No bar while he sits on guard |
| 2 | Walk up to the statue (or hit him) so he wakes | His bar comes up at the top of the screen: "Augustus Kong" in leaf green over a bark frame bound with vines, leaves and a yellow flower at each end, little vines hanging under it. The bar is leaf green and full |
| 3 | Fight him | The bar goes down as he is hurt. The game's own purple bar is NOT drawn as well |
| 4 | Bring him under half his health | The bar turns orange (when he roars and gets quicker) |
| 5 | Leave the chamber until he walks home, then come back | The bar goes while he is back on guard, and comes up again where it was when he wakes |
| 6 | Beat him | The bar goes, and never comes back while he sits beaten |
| 7 | Fight the Crimson Dragon, or a Wither | The Crimson Dragon keeps its own gray and red bar; every other boss keeps the game's bar |

## The Frequency Hammer, the villages' prize (0.1.354)

Austin (2026-11-22): "have the frequency friends village actually have something worth going out to find ... like the
endships in the end where there is an item frame with the prized item. The item should be a frequency hammer, it works
like a wind charge and a mace."

| # | Do | Expect |
|---|---------|--------|
| 1 | With the vision, go up a Frequency Friends village to its Council Hall (the top of the spiral stair) | On the monument, a glowing item frame with the Frequency Hammer in it: an orange to purple handle, a glowing blue head. (A village on a shorter tree has no hall: its monument and frame stand on the great deck, across the trunk from the stair) |
| 2 | Hit the frame | The hammer pops out, with a line in chat on how to use it. Pick it up |
| 3 | Walk away until the village fades, and come back | The village is back with no frame and no second hammer. One hammer a village, ever |
| 4 | Find another village | It has its own hammer |
| 5 | Hold the hammer, look down, left click the ground | You are thrown about 8 blocks straight up, with a wind burst sound and blue sparks. Landing does not hurt |
| 6 | Left click the ground a little ahead of you | Thrown back and up, away from the blow. A wall beside you throws you off it |
| 7 | Left click the ground, and near the top right click | You drive straight down. Where you land: a smash sound, blue sparks in a ring, and every wild mob near is hurt and thrown back. You are not hurt |
| 8 | Slam from higher (off a cliff, or a launch from a hill) | More damage and a wider ring the further you fell (a launch and slam on flat ground: about 13 hearts at the middle) |
| 9 | Slam beside a villager, a named mob, a pet, a zoo animal, a resident, another player | None of them is hurt |
| 10 | Right click on the ground | Nothing |
| 11 | In creative, left click the ground with it | You are launched; the block is not broken |
| 12 | Creative menu, Equipment | The Frequency Hammer is there for testing |

## Acurite, the Acufend Incubator, Gradient Hue Glass (0.1.355)

Austin (2026-11-22): "the mysterious egg can only be hatched if placed into an acufend incubator. There should be a
resource found on the moon only when you are in the right frequency, it can be called acurite ... The acufend incubator
can be made by putting one torch in the middle of 8 acurite. Besides the incubator, acurite can also create the gradient
hugh glass, it is see through like glass, but hard as stone."

| # | Do | Expect |
|---|---------|--------|
| 1 | Walk Acufend's moon without the Transcending Vision | Only rock. No Acurite anywhere |
| 2 | Use the Lightning TNT Frequency Stick (the vision on) and walk the moon | Within a few seconds, small seams of Acurite show in the ground near you: purple and orange, softly glowing, 3 to 6 blocks side by side. About one chunk in three has a seam |
| 3 | Let the vision run out, or walk well away, and look back | The seams turn back into the rock they were |
| 4 | With the vision, mine a seam with a pickaxe | Each block gives 1 or 2 Acurite: a heart, purple below and orange above. That block never comes back |
| 5 | Crafting table: 8 Acurite round 1 torch | An Acufend Incubator |
| 6 | Crafting table: 8 glass round 1 Acurite | 8 Gradient Hue Glass. Place it: you see through it, purple to orange. It takes as long as stone to break, wants a pickaxe to be quick, drops itself, and shrugs off a blast like stone |
| 7 | Place the incubator anywhere and use it with an empty hand | A line in chat: it is empty and wants an egg from Acufend |
| 8 | Use it holding the Mysterious Egg (from Dr. Foss at 60) | The egg goes in (you see it in the window), the block glows, a line in chat |
| 9 | Use it again over the next minutes | "The egg is warming (n of 4)". About a minute a stage |
| 10 | After about 5 minutes | A crack sound, the window bright, the line says it is ready to hatch: use it once more (see the 0.1.356 section) |
| 11 | Break the incubator with the egg in it | The incubator and the egg both drop |
| 12 | Any other egg or item on the incubator | Nothing taken; the "empty" line |

## Baby Kong (0.1.356)

Austin (2026-11-22): "Baby Kong should be able to be put on the zoo exhibit, and he likes to be raised with the normal
gorillas in the zoo. Then when he gets big enough, he wants to move out to his own exhibit where he can jump around".

| # | Do | Expect |
|---|---------|--------|
| 1 | Use the incubator once the egg is ready | A hatch sound, a line in chat, and a Reinforced Crate in your inventory holding Baby Kong. The incubator is empty again |
| 2 | Use the crate on the ground inside your gorillas' exhibit | Baby Kong moves in: a small ape, charcoal dark with bright green eyes, a little bigger than a gorilla infant |
| 3 | Read the exhibit's clipboard | A line for Baby Kong: "growing up with the troop". No warning |
| 4 | Put him in an exhibit with no grown gorilla instead | A warning: he wants to grow up with gorillas |
| 5 | Wait 10 park days (the clipboard's page for him counts them down) | A line in chat: he has grown up. He is "Kong" now (a name you gave him stays), bigger than the silverback, with a mossy back |
| 6 | Leave grown Kong with the troop | A warning that he has outgrown the troop and wants his own exhibit. His comfort stays low. He fights nobody and fathers no infants |
| 7 | Call him into a Holding Den, crate him from it, and release him into an empty gorilla-proof exhibit | No warning. The clipboard line says he is in his own exhibit, with room to jump |
| 8 | Watch him there by day | Every few seconds he leaps 4 to 11 blocks across the floor in a high arc and lands with a thud, and now and then beats his chest where he lands. He never leaves the floor of his exhibit |
| 9 | At night | He nests and sleeps as gorillas do. No leaping |

## Mirium the banker, resident 30 (0.1.357)

Close Minecraft fully and open it again first (a new look and new scripts). `/zoocraft:testsetup` builds her house too (west side, the last row).

| # | Do | Expect |
|---|---------|--------|
| 1 | Have two animals of one species on display, with a Resident Mailbox set to Move-in ON | Mirium isn't unlocked; her goal reads "2 different species on display" |
| 2 | Put a second species on display | She moves in when a home is free: light brown hair up in a bun, golden eyes, a navy blazer over a cream blouse, a charcoal skirt |
| 3 | Talk to her while she's awake | Her menu has Banking, Currency Exchange and Daily Shop beside the usual buttons |
| 4 | Banking | The park's Zoo Coins and its latest 8 transactions. Under 100 coins she worries about it. Nothing can be deposited or withdrawn |
| 5 | Currency Exchange | She says Zoo Coins are the only currency; nothing is traded |
| 6 | Daily Shop | Exactly 10 listings: Common in white, Rare in aqua, Legendary in gold, each with its price and how many are left for you today |
| 7 | Close the shop and open it again; save, quit and come back the same Minecraft day | The same 10 listings |
| 8 | Buy a listing | The park's coins drop by the price, you get the item (cheap blocks come 8 or 16 at a time), "left" goes down by one |
| 9 | Buy a Common three times (a Rare or Legendary once) | It reads "Sold out today" for you; another player can still buy theirs |
| 10 | Try to buy something the park can't afford | She says the park can't cover it; no coins leave, nothing is given |
| 11 | Sleep to the next Minecraft day | Ten new listings |
| 12 | Watch the shop over many days | About half the days have 2 Rare, about one in ten has 2 Legendary; never fewer than 6 Common |
| 13 | Raise her friendship to 40, 60, 80, 100 | The shop page shows your odds going up: Rare 55, 60, 65, 70%; Legendary 13, 16, 20, 25% |
| 14 | At 100 friendship | Every price is 20% lower, with the old price shown beside it |
| 15 | Look through many days of stock | Vanilla items and ZooCraft items both turn up. Never the Mysterious Egg, Damien's Wand, another resident's rewards or wares, or story items |
| 16 | Give her wool, a bed, gold or an emerald; then a bow | She loves the first four and dislikes the bow |
| 17 | Sandbox mode on | Everything in her shop is free, the daily limits still apply |

## Mirium never sells what residents give (0.1.358)

| # | Do | Expect |
|---|---------|--------|
| 1 | Look through many days of her shop | Never the Volatile Pump, Deep Sea Rod, Tackle Box, Gradient Hue Glass, Hanvil and Hammer or Bow Case, nor anything else a resident gives or that is made from it |

## Mirium's updo (0.1.359)

| # | Do | Expect |
|---|---------|--------|
| 1 | Look at Mirium from the front, the side and behind | A real bun stands up on top of her head, a little toward the back. It is a shape, not a picture painted on the back of her head |
| 2 | Look at her hair colour | Dirty blonde all over, bun included. Two loose strands frame her face and her neck shows at the back |
| 3 | Watch her look around, walk and sleep | The bun stays on her head and turns with it |
| 4 | Look at every other resident | Nobody else has a bun |
| 5 | Talk to her | Her talk picture shows the bun above her head in every mood |

## Mirium's hanging hair (0.1.360)

| # | Do | Expect |
|---|---------|--------|
| 1 | Look at Mirium from behind | Hair covers the back of her head and hangs down her back in two locks past the shoulders, shorter in the middle. The bun still stands on top |
| 2 | Look at her from the side | Hair hangs behind her ear down to the jaw; the ear and her face are clear |
| 3 | Look at her from the front | Her face and the two front strands are as before |

## The named zookeepers: Stevie, The Boulder, Dory and Ping (0.1.361)

From your Specialized Zookeepers spec. Unnamed keepers are gone; a world that had some gets one chat line saying they were let go.

| # | Do | Expect |
|---|---------|--------|
| 1 | Load a zoo that had hired keepers | One chat line says the unnamed keepers have left and that zookeepers now apply at a Resident Mailbox. The Staff Room menu has no "Hire a keeper" button; it has "How to hire a zookeeper" |
| 2 | With a working Staff Room, open a Resident Mailbox on an empty, ready home | "Job applications" lists Stevie, The Boulder, Dory and Ping, each with an "Application" button |
| 3 | Open an application | Their own words, who they are, the four jobs, the wage (200 Zoo Coins a Minecraft week, from 0.1.363), their efficiency and whether the workroom is big enough. Decline or Accept |
| 4 | Accept the first with a 3 x 3 Staff Room | They move into that home and are hired. They have no job yet |
| 5 | Try to accept a second with the same 3 x 3 room | Refused, with the size needed: 6 x 6. Nobody is hired and nothing is lost |
| 6 | Make the room 3 x 12 inside and try again | Still refused: both sides must reach 6 |
| 7 | Make it 6 x 6, then 12 x 12, then 24 x 12 (or 12 x 24) and accept the others | Second, third and fourth are hired in turn. The Staff Room menu says how many the room is big enough for |
| 8 | Talk to a zookeeper and press Assign Job | Four jobs: Trash Collector, Feeder & Waterer, Enrichment Specialist, Supply Stocker. They answer in their own voice when given one |
| 9 | Press Change Job and pick another | The job changes. Friendship and efficiency stay as they were |
| 10 | Press View Job | A line like "Ping - Assigned: Enrichment - Friendship: 82/100 - Efficiency: 90% - Next: 100 for 100%", then what the job does, what they are doing now, tasks done and wages |
| 11 | In the morning (their shift runs until noon) with a job and wages paid | They are at the Staff Room, and are seen with their own face at bins, feeders, baskets or stands as their job says |
| 12 | Trash Collector | Empties Litter Bins, sweeps path litter and rakes exhibits. No feeding or stocking |
| 13 | Feeder & Waterer | Refills feeders and troughs from the Staff Room's rations. Nothing else |
| 14 | Enrichment Specialist | Refills Hanging Food Baskets only |
| 15 | Supply Stocker | Restocks Snack Stands and Gift Shops that are under half full, paying wholesale from the park's Zoo Coins |
| 16 | Under 60 friendship | They fill things to three quarters and rake an exhibit to 75 clean |
| 17 | Raise friendship to 60, 80 and 100 and talk to them each time | A thank-you speech in chat, once each, and efficiency reads 80%, 90% and 100%. At 100% everything is filled to the top and raked fully clean |
| 18 | Ask a zookeeper on shift to Follow Me | The button reads "On shift". After noon it works as for any resident |
| 19 | Break the workroom down below the size for the team | The latest hired stops working and says the room is too small. Nobody is fired, friendship is kept. Make it bigger and they work again |
| 20 | Look at all four | Stevie: sandy hair, khaki shirt and shorts. The Boulder: bald, big, explorer shirt. Dory: auburn hair, green top. Ping: long black hair, teal shirt |
| 21 | Watch the screen through all of this | No title text or floating text anywhere; chat only |

Walking to tasks came in 0.1.362 (next section).

## Zookeepers walk to their tasks (0.1.362)

Rows 11 and 18 of the section above change: they no longer stand at the Staff Room or appear at tasks as a keeper.

| # | Do | Expect |
|---|---------|--------|
| 1 | Give a zookeeper a job and wait for morning | They come out of their front door and walk the paths to the zoo, like any resident going to visit |
| 2 | Follow them into the zoo | First they walk to the Staff Room and stand by it a few seconds (once a day) |
| 3 | Keep following | They walk the guest paths to each task: the Viewing Point of the exhibit, or the path by the bin, stand or shop. They stand there a few seconds with arms working, and only then is the feeder filled, the bin emptied, and so on |
| 4 | After a task, stand near them | Now and then a line of their own in chat (Stevie cheerful, The Boulder boastful, Dory muddled, Ping careful) |
| 5 | Give them a job whose only target has no path or Viewing Point near it | They do not jump there. View Job says they couldn't get to it; they try again later and do other tasks meanwhile |
| 6 | Nothing needs doing | They stroll the zoo and watch animals like a visitor |
| 7 | Rain, or the zoo closed to guests | A zookeeper with a job still goes to work |
| 8 | Evening | They walk home with the other residents. Nobody works at night, so keep feeders and troughs big enough to last it |
| 9 | Ask a zookeeper who is at the zoo with a job to Follow Me | "On shift". At home in the evening it works |
| 10 | Watch the screen through all of this | No title text or floating text; chat only |

## Zookeeper wages: 200 Zoo Coins a Minecraft week (0.1.363)

| # | Do | Expect |
|---|---------|--------|
| 1 | Open an application, a zookeeper's View Job, and "How to hire a zookeeper" | Wages read 200 Zoo Coins a Minecraft week |
| 2 | Hire a zookeeper and play 7 Minecraft days | Nothing is charged for the first 6 dawns. At the 7th the park pays 200 Zoo Coins for each zookeeper (see the Bank or Park ledger: "Wages: name") |
| 3 | Let the park have under 200 coins on pay day | That zookeeper stops work and View Job shows 200 coins owed. They start again once the park can pay |
| 4 | A world that already had zookeepers | Their week starts at the next dawn; old daily wages owed are dropped |

## Residents speak to the moment (0.1.364)

Every resident has about 230 new lines of their own. Which one you hear depends on what is true when you talk. A line is not repeated while another fits. Talk a few times in each case: about 6 chats in 10 are for the moment (9 in 10 when something striking is going on), the rest are their older chats.

| # | Do | Expect |
|---|---------|--------|
| 1 | Talk to someone you have never met | They introduce themselves: their name and what they do, in their own voice |
| 2 | Talk to the same resident as a Stranger, then as a Close or Best Friend | Different lines: distant or formal in their way at first, warm and personal later, sometimes using your name |
| 3 | Talk at home in the morning, on their walk to the zoo, in the zoo, on the walk home, at home in the evening | They speak about what they are doing right then |
| 4 | Talk to a worker at work (a zookeeper on shift, Dave at his mine, Jack fishing) | They speak about the job in hand |
| 5 | Have one Follow you, by day and by night; tell them Stay Here | Lines about coming along, about the night, about waiting |
| 6 | Talk in rain, in a thunderstorm, at sunrise, at sunset, under a full moon, on a moonless night | They remark on it |
| 7 | Take a follower into the Nether, the End, the Fishing Sky, Acufend, deep in a cave, up a mountain | Each place has its own lines, in character |
| 8 | Talk with a zombie or skeleton close by; then a creeper | Nearly always they react to it, each in their own way |
| 9 | Talk beside villagers, your tamed wolf or cat, farm animals, a zoo animal, a crowd of guests | They mention them; by a zoo animal they name the animal |
| 10 | Talk while another resident stands near | They say something about or to that neighbour by name. Each has three neighbours they have special words for |
| 11 | In multiplayer, talk with a second player standing near | They mention the other player by name |
| 12 | Talk beside water, lava, flowers, a campfire, crops, bookshelves, in snow | They remark on the place |
| 13 | Hold something they like; a weapon; food; a fishing rod; a pickaxe | They notice what is in your hand, sometimes by name |
| 14 | Wear full armor; be badly hurt; stand in water; crouch | They notice |
| 15 | Talk for the first time in a day; after 3 or more days away | A greeting; "it has been a while" in their own way |
| 16 | In the zoo when it is packed, empty, closed, littered, 4 or 5 stars, 1 star, nearly out of coins, or an animal is unwell | They have an opinion |
| 17 | Open a resident's menu several times | About half the time the opening line is one for the moment instead of their usual hello |
| 18 | Read lines for tone | Nobody tells you to do something in the game or promises a reward. No titles or floating text; all talk is on the talk screen or in chat as before |

The whole list for review: `playtest/Resident_scene_lines.csv` (resident, scene, friendship, line).

## Austin the resident's show and portrait (0.1.365)

From your notes of 23 Nov. Step 1 of 4 for Austin; the Prank Cam (60), the alligator livestream (80) and the StreamerPro (100) come next.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Find Austin on his zoo visit (daytime) | He holds a selfie stick up in his right hand with a phone on the end |
| 2 | Watch him walk between exhibits | Three or more ordinary guests walk behind him in a line, and stop when he stops, facing him |
| 3 | Stand near him as he reaches an exhibit | Most times a chat line "Austin (to his stream): ..." that names the animals in front of him |
| 4 | Follow him until he heads home | The stick goes away and the crowd leaves when he leaves the zoo |
| 5 | Look at him at home or on the street | No stick, no crowd |
| 6 | Reach friendship 40 and talk to him | He says "If you ever want a laugh, take a look at this." and gives Austin's Portrait |
| 7 | Place the portrait against a wall, from each of the four sides | It hangs flat on the wall you face, picture toward you; you can walk through it; breaking it gives it back |
| 8 | Give him redstone, a lead or a name tag | He likes it and says so |
| 9 | Give him wheat, a carrot, a potato or an apple | He dislikes it and says so |
| 10 | Raise the park to 4 or 5 stars | His crowd grows to 4 or 5 |
| 11 | Check Mirium's shop over a few days | Austin's Portrait is never for sale |

Things I could not see from here: how the stick sits in his hand, and which way the portrait faces on each wall. Please tell me if either looks wrong.

## Austin the resident's Prank Cam and VR Headset (0.1.366)

From your notes of 23 Nov. Step 2 of 4 for Austin.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Reach friendship 60 and talk to him | He gives a Prank Cam and a VR Headset in one talk |
| 2 | Place the Prank Cam anywhere | A small camera on a stand, its lens looking back at you |
| 3 | Walk a little way off, hold the VR Headset and use it | Your view jumps to the cam's lens, looking the way it faces; chat says how to stop |
| 4 | Move the mouse or stick | The cam's view turns as you look around; you cannot walk |
| 5 | Sneak | You are back in your own eyes and can walk again |
| 6 | Use the headset twice | The first use puts it on, the second takes it off |
| 7 | Ask Austin for another Prank Cam, place it too, then use the headset | A list: Prank Cam 1 and Prank Cam 2, each with how far and which way |
| 8 | Use the headset more than 64 blocks from every cam | Chat says no Prank Cam is close enough |
| 9 | While watching, have a friend break the cam (or get hit by something) | The headset comes off and chat says why |
| 10 | Leave the world while watching, then come back | You can move and see normally |
| 11 | Break the Prank Cam | It drops itself and leaves the headset's list |

Limit to know about: the game only draws the world near you, so a cam shows its view only while you are within 64 blocks of it. If you want to watch from anywhere, tell me and I will offer ways to do it.

Things I could not see from here: the cam's shape and which way its lens points, and how the view looks through the headset.

## Austin the resident's big livestream (0.1.367)

From your notes of 23 Nov. Step 3 of 4 for Austin. The game has crocodiles and no alligators, so the stream uses the crocodile exhibit.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Reach friendship 80 with no crocodiles on exhibit, open his Friendship page | It says he has a big idea once there are crocodiles on exhibit |
| 2 | Put crocodiles on exhibit, then talk to him | He asks to go into the crocodile exhibit for his stream: "Yes, I'm in" or "No. Stay out of there" |
| 3 | Close the question without answering | His menu has "The big livestream", which asks again |
| 4 | The rest of this section was reworked in 0.1.369 | See "The big livestream, slowed down and opened up (0.1.369)" below |

## Austin the resident's StreamerPro and Stream Reviewer (0.1.368)

From your notes of 23 Nov. Step 4 of 4 for Austin.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Reach friendship 100 and talk to him | He gives the StreamerPro and a Stream Reviewer in one talk |
| 2 | Use the StreamerPro | A menu: Go live, and your follower count (photos and clips were removed in 0.1.369) |
| 3 | Go live in a quiet spot | Chat says you are live. About every 20 seconds chat shows viewers, Zoo Coins and new followers. With nothing going on it says viewers are leaving |
| 4 | Stand close to animals, still live | A few viewers come |
| 5 | Stand near dangerous animals, fight monsters, get hurt, or go to another dimension | Viewers climb much faster, and chat says what they are here for |
| 6 | Keep an exciting stream going | Now and then a viewer donates Zoo Coins with a message in chat |
| 7 | Use the StreamerPro and pick End stream | A summary: length, peak viewers, coins earned, donations, new followers, total followers and your best audience |
| 8 | Open the park's Finances page | "StreamerPro: stream income" entries |
| 9 | Use the Stream Reviewer | Followers, best live audience out of 1,000,000, and your last 10 streams |
| 12 | Die while live | The stream ends and is kept |
| 13 | Stream again after gaining followers | The same kind of stream draws a bigger audience than before |

Things I could not see from here: the two item icons.

## The big livestream, slowed down and opened up (0.1.369)

From your notes of 24 Nov: the scene was too quick, walls blocked the view, and you wanted to walk there with Austin, escape yourself, and read at a normal pace. The StreamerPro is now held like a selfie stick and no longer takes photos or clips.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | At friendship 80 with crocodiles on exhibit, answer Yes | Nothing fades. Austin says to lead the way, and chat tells you how far the crocodile exhibit is and in which direction |
| 2 | Walk to the crocodile exhibit | Austin follows behind you with his selfie stick, the whole way |
| 3 | Dawdle on the way | Every 20 seconds or so chat reminds you where the exhibit is |
| 4 | Arrive at the exhibit's way in | The screen fades and the cutscene starts: Austin greets his stream outside |
| 5 | Watch the cutscene | Shots of him outside, going in, the crocodiles, his face, the steak, the crocodiles coming. Each line stays up for four to eleven seconds, long enough to read. No shot has a wall between the camera and him |
| 6 | When the crocodiles come | The camera lets go. You are inside the exhibit, free to move, and Austin shouts to run |
| 7 | Run out through the Keeper Gates | Austin is outside, thrilled, and the question page comes up ("That was cool!" or "never allowed in the zoo again") |
| 8 | (again) Stay inside instead of running | For about 15 seconds the crocodiles are busy with the steak. Then chat warns you and they can hurt you. After a minute and a half he pulls you out |
| 9 | (other world) Answer No | He runs off. Chat says he has gone to the crocodile exhibit |
| 10 | Go to the crocodile exhibit | The same cutscene starts when you arrive, but you watch from outside and he runs out by himself |
| 11 | (other world) Answer No and stay away | After a minute and a half the screen fades and you are brought to the exhibit to see it |
| 12 | Use an exhibit with no Keeper Gates, answer Yes | After the cutscene you are both shown outside; there is no run of your own, since there is no way out on foot |
| 13 | Hold the StreamerPro | It sits in your hand like a tool: a stick with the phone at the far end |
| 14 | Use the StreamerPro | Only "Go live" (or "End stream") and "Close". No photo or clip buttons |
| 15 | Use the Stream Reviewer | One page, with no "Photos and clips" |

Things I could not see from here: every camera angle, and how the StreamerPro looks in the hand. Tell me any shot that still has something in the way.

## Zach sings on the zoo paths (0.1.370)

From your notes of 24 Nov. Step 1 of 5 for Zach. Zach needs 3 species on exhibit and a home.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Open the park and wait for night | Chat says Zach is singing on the zoo paths tonight, with the day of the week |
| 2 | Find him on the paths | He stands on a path block. In front of him is an open guitar case with a few coins, and a small crate with a bucket of fried chicken |
| 3 | Stand near him | You hear your recording, about every 14 seconds |
| 4 | Watch the guests | More guests walk to his spot than to other places, and stand around |
| 5 | Wait near him | Now and then chat says a guest dropped coins in the guitar case |
| 6 | Wait about 3 minutes | He walks along the paths to another spot and sets up again. The Finances page shows "Zach's guitar case: donations" |
| 7 | Use the guitar case or crate | "Zach's Merch": Fried chicken for 20 Zoo Coins, and Close |
| 8 | Talk to him while he sings | His menu has "Fried chicken" too |
| 9 | Buy and eat a piece | 20 Zoo Coins leave the park, and it restores 5 hunger bars |
| 10 | Listen on a night that is not Friday | Between songs he grumbles about the night |
| 11 | Listen on a Friday night (the 5th night of a world, then every 7th) | He is amped, the crowd is bigger and the tips are doubled |
| 12 | Wait for morning, or close the park | He goes home and the case and crate are gone |
| 13 | Give him a music disc or a flower | He likes it, as before |
| 14 | Give him raw chicken, cooked chicken, bread, an apple, milk or a potion | He dislikes it |

Things I could not see or hear from here: the song itself and how loud it is, the look of the case and crate, and the fried chicken icon.

## Zach's Redstone Noise Maker (0.1.371)

From your notes of 24 Nov. Step 2 of 5 for Zach.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Reach friendship 40 with Zach and talk to him | He gives a Redstone Noise Maker |
| 2 | Place it and use it | A menu: "Play it now", then 31 animals. It starts as a cow |
| 3 | Pick Frog | It croaks once, a note floats up, and the menu now marks Frog as set |
| 4 | Put a lever or button beside it and switch it on | It makes the frog call once each time the power arrives |
| 5 | Leave the lever on | It stays quiet until the power goes and comes back |
| 6 | Wire it to a redstone clock | It calls on every pulse |
| 7 | Break it and place it again | It drops itself, and starts as a cow again |

Things I could not hear from here: every call. Tell me any animal that is silent or wrong.

## Zach's story of the wardens, and hugging (0.1.372)

From your notes of 24 Nov. Step 3 of 5 for Zach.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Before 60 friendship with Zach, sneak and use an empty hand on a cow | Nothing new happens |
| 2 | Reach 60 and talk to him | He tells the story: the wardens sang the most beautiful song, and you only have to hug one. His Friendship page keeps how to hug |
| 3 | Sneak and use an empty hand on a cow | Hearts rise and chat says "You hug Cow." |
| 4 | Do the same to any other mob, a zoo animal, or a resident | The same: hearts and a line in chat |
| 5 | Find a wild warden. Sneak up and use an empty hand on it | Hearts, and it turns passive on the spot: it no longer attacks, roars or digs away |
| 6 | Stay near it | It sings the classic Minecraft song, and notes rise from its head while it does |
| 7 | Hug it again after the song ends | It sings again |
| 8 | Another player who has not heard the story tries to hug | Nothing happens for them |

Things I could not hear or see from here: the song, and whether a right click on a wild warden reaches the game as a use (it does for other mobs).

## Zach's guitar (0.1.373)

From your notes of 24 Nov. Step 4 of 5 for Zach.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Reach friendship 80 with Zach and talk to him | He gives a Guitar Body and says how to build the guitar |
| 2 | On a crafting table, put the body bottom middle and string in the three slots up each side | A Guitar |
| 3 | Hold the Guitar and right click | A guitar note plays, like a note block on wool, and a note floats up |
| 4 | Left click | Chat says the new note, for example "Guitar note: G (2 of 25)". Right click plays it |
| 5 | Left click 25 times | It goes up through two octaves and back to the first note |
| 6 | Sneak and left click | It goes down a note instead |
| 7 | Leave the world and come back | The guitar is still on the note you left it on |

Things I could not hear or see from here: the notes, the two icons, and how the guitar sits in the hand.

## Zach's night show (0.1.374)

From your notes of 24 Nov. Step 5 of 5 for Zach: his quest.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Reach friendship 100 with Zach and talk to him | He asks you to play a show with him, with "I'm in" and "Another night" |
| 2 | Answer "Another night", or talk to him by day | Nothing starts. His menu now has "Play a show with Zach" |
| 3 | Choose it by day | He says it has to be at night, on the paths |
| 4 | Find him singing on the paths at night and choose "Play a show with Zach" (or "I'm in") | Every resident who is not away or working appears in rings round him, facing him. A row of guests stands behind them and more guests walk over |
| 5 | Open a resident's menu during the show | It says they are at Zach's show |
| 6 | Wait a few minutes | Zach stays at this spot for the whole show |
| 7 | Choose "We're done" on Zach's menu straight away | He asks for a tune first. Chat says how many notes you have played of 16 |
| 8 | Play 16 notes or more on your Guitar | Every 8 notes the crowd cheers in chat |
| 9 | Choose "We're done" | The crowd goes home, the park is paid 500 Zoo Coins, and Zach thanks you |
| 10 | Try another show the same night | He says one show a night |
| 11 | Start a show another night and walk more than 32 blocks away | The show is called off and nobody is paid |
| 12 | Start a show, play, and stay until sunrise | The show ends at sunrise and the park is paid |

Things I could not see from here: how the crowd looks standing round him, and whether the rings fit your paths.

## Zach's guitar case and chicken stall, rebuilt (0.1.376)

You heard him sing but saw no case and no stand. They are two props now, bigger and lit at night.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Find Zach singing on a path at night | An open guitar case on the ground in front of him: black, red inside, coins in it |
| 2 | Look beside him | A fried chicken stall as tall as he is: wooden counter, red and white awning, two buckets of chicken |
| 3 | Look at them from a dark spot | Both are fully lit, never black |
| 4 | Right click the stall | The fried chicken shop opens |
| 5 | Wait until he walks to his next spot | Both props go with him and are set up again there |
| 6 | Go into the zoo at dusk, before midnight | He sets up and sings straight away instead of strolling first |

Things I could not see from here: the props themselves in the game. A drawn preview is in the thread.

## Jared (0.1.377)

From your notes of 24 Nov: his job, the Warden Mask at 50, the rhymes at 100.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Stand near Jared's house while he is up and at home (late afternoon, or after midnight) | Every so often chat shows him practising a two-line freestyle. His page says "at home, practising freestyles" |
| 2 | Keep an eye on him in the late afternoon over a few days | Some days chat says he is off to a neighbour's house to freestyle. He walks there, goes in, and they trade bars and reactions for under a minute. Then he walks home |
| 3 | Open his page during a visit | "freestyling with (name) at their house" |
| 4 | Give him a gift he liked before | Same reaction as before: his gifts are unchanged |
| 5 | Reach friendship 50 and talk to him | He says wardens are the coolest thing ever and gives you a Warden Mask |
| 6 | Put the Warden Mask in your helmet slot and look in third person | A warden's head over yours, full warden size, with googly eyes, a toothy grin, a tongue and crooked tendrils |
| 7 | Reach friendship 100 and talk to him | He asks for four pairs of things that rhyme, like a stone and a bone |
| 8 | Choose "Give Jared a rhyming pair (0 of 4)", pick stone, then bone | He takes one of each and counts pair 1 |
| 9 | Try stone and cake | He says it does not rhyme and you keep both |
| 10 | Try a word he already has, like sandstone and bone | He asks for something new |
| 11 | Give three more pairs (cake and rake, cod and fishing rod, bell and nautilus shell, bed and bread, book and tripwire hook, chest and bee nest, feather and leather, copper and hopper, button and mutton all work) | After the fourth he performs a freestyle in chat, one line every few seconds, with your eight words on the line ends and your name in it |
| 12 | Choose "Hear my freestyle" on his menu later | The same freestyle again |

An item's word is the last word of its name: cooked cod counts as "cod", iron ore as "ore".

Things I could not see from here: the mask on your head, and whether the walk to a neighbour looks right.

## Sheila (0.1.378)

From your notes of 24 Nov: she stays the same, and gives diamonds from her retirement fund and one favour to do.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Open Sheila's page | Still retired, same gift tastes |
| 2 | Reach friendship 40 and talk to her | 1 diamond from her retirement fund |
| 3 | Reach 60 and talk to her | 3 diamonds |
| 4 | Reach 80 and talk to her | 10 diamonds |
| 5 | Reach 100 and talk to her | 30 diamonds |
| 6 | Talk to her again | She says Ron was rude to her and asks you to slap him and tell him that was from Sheila |
| 7 | Hit Ron once | Chat: you slap Ron and say "That was from Sheila." Ron says "Okay. Ha ha ha!" and laughs. He is not hurt |
| 8 | Hit Ron again | Nothing more happens |
| 9 | Talk to Sheila | She thanks you and gives you 1 carrot |
| 10 | Hit Ron before she has asked (a new friendship) | Nothing happens |


## Carrot, step 1 (0.1.379)

From your notes of 25 Nov: her job, and the Diamond Carrot at 40. The flyer, ticket, portal and contest come in the next steps.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Have an exhibit with rabbits and wait for Carrot's daytime visit to the zoo | She is inside the rabbit exhibit, hopping from spot to spot among the rabbits |
| 2 | Walk up to the exhibit | Chat says she is in the exhibit hopping with the rabbits, once per visit |
| 3 | Open her page | "in with the rabbits, hopping about" |
| 4 | Talk to her there and choose "Let her hop" | She is happy and keeps hopping |
| 5 | Choose "Send her home for the day" | She says goodbye to the bunnies and is gone from the exhibit. She does not get back in until the next day |
| 6 | Close the park, or wait for evening | She leaves the exhibit by herself |
| 7 | Give her a gift she liked before | Same reaction as before |
| 8 | Reach friendship 40 and talk to her | A Diamond Carrot |
| 9 | Put an Awkward Potion in a brewing stand with the Diamond Carrot on top | Potion of One with the Rabbits |
| 10 | Drink it | Jump Boost III and Speed III for 8:00 |
| 11 | Put a carrot and a diamond in a crafting grid | A Diamond Carrot |


## Carrot, step 2 (0.1.380)

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Reach friendship 60 and talk to Carrot | She tells you about the contest she has trained for her whole life and gives you a Contest Flyer |
| 2 | Use the flyer | A page with the contest's three stages, ending "MUST HAVE TICKET TO ENTER" |
| 3 | Reach friendship 80 and talk to her | Her idea: you enter. She advises at least 4 of her potions, gives you her Contest Ticket, and says she forgot the way |
| 4 | Choose "Ask about the way to the contest" on her menu | She is still trying to remember and asks you to keep talking to her every day |
| 5 | Open her page | At 100 friendship she has something special for you |


## Carrot, step 3 (0.1.381)

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Reach friendship 100 and talk to Carrot | She has remembered: 20 Bunny Blocks (white fur). "Ask about the way to the contest" is gone from her menu |
| 2 | Build an upright frame of Bunny Blocks, 4 wide and 5 tall, empty in the middle | Like a Nether portal frame |
| 3 | Use a Flint and Steel on the inside of the frame | The middle fills with a pink portal. No fire on the fur |
| 4 | Use a Flint and Steel on a single Bunny Block | A hint in chat about the frame, no fire |
| 5 | Stand in the portal for 4 seconds | A pink fade, then you stand on the grass of a stadium under a pink sky |
| 6 | Look round | Stands on all sides, rabbits of six fur colours sitting in them, a jumbotron with a rabbit's face over the north stand, a gold podium, the Rabbit King with a crown on his dais |
| 7 | Talk to a rabbit in the stands | A short cheer in chat |
| 8 | Talk to the king without a ticket | "You must have a ticket to enter." |
| 9 | Talk to the king with the ticket | He welcomes you. The contest itself comes in the next step, and he does not take the ticket yet |
| 10 | Walk into the frame behind where you arrived | You are back where you went in |
| 11 | Break a Bunny Block of your frame at home | The portal goes out |
