# Residents: test plan (0.1.182, 0.1.217, 0.1.220, 0.1.221, 0.1.222, 0.1.223, 0.1.224, 0.1.225, 0.1.226, 0.1.228, 0.1.229, 0.1.230, 0.1.231, 0.1.232)

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
