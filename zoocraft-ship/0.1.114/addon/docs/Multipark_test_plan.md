# Several zoos in one world: test plan (0.1.114, the second park)

Austin: "People should be able to have their own zoos on a world, or work together." 0.1.114 lets a world hold any
number of parks. A Park Deed claims a park of your own anywhere outside every park's Aluminum Fence and 16 blocks or
more from another park's Deed spot; one park an owner (you can still be a manager or keeper of any number of others).
Each park has its own name, fence, entrance gate and Ticket Booth, path network and guests, coins, day, rating, clock,
staff, research, quests and ledger. The Park Ledger opens the park you stand in if you belong to it, else your own,
else one you belong to; every block's menu is the menu of the park the block stands in. Scripts only: leave the world
and join again. (0.1.115 brings each player their own Field Journal; until then the journal is the world's.)

You need: a Superflat world (Creative, cheats on) and a second player (a second device or account) for steps 7 to 13.
Steps 1 to 6 work alone. `/zoocraft:build` makes a full zoo in one go (docs/Test_zoo_test_plan.md).

| # | Do this | You should see |
|---|---|---|
| 1 | New world, `/zoocraft:build`. Open the Park Deed. | The zoo builds round you as in 0.1.104. The Ledger is titled "Park Ledger" with no park row: a world with one park looks exactly as before. |
| 2 | Walk 300 blocks away (outside the fence) and use the Park Deed. | "You already own Austin's Zoo. One park an owner; you can be a manager or keeper of other parks." Nothing is claimed. |
| 3 | `/zoocraft:status`. | One "park" line: "park: 100500 coins, ...". |
| 4 | Settings in the Ledger. | A "Park name" text field above the three toggles, holding "<you>'s Zoo". Change it to "Riverside" and submit: "...sidebar on. The park is Riverside." Open the Ledger again: still "Park Ledger" (one park, no row). |
| 5 | Stand inside your zoo and `/zoocraft:skip 600`. | "Ran 600 seconds of park time." The day advances as before. |
| 6 | `/zoocraft:grant 100`. | "Added 100 coins. Balance ...": your park's. |
| 7 | A second player (Bea) joins. | She is welcomed: "This world has a zoo already; its owner can make you a keeper or manager from the Park Ledger, or claim a park of your own with a Park Deed outside its fence." and gets a Park Deed. |
| 8 | Bea uses the Deed standing inside your fence. | "This spot is inside Riverside. Claim a park outside every park's Aluminum Fence." No menu. |
| 9 | Bea walks 10 blocks from your Deed spot (outside the fence if it's that close) and uses the Deed. | "This spot is too close to Riverside's Park Deed spot (x z). Claim a park at least 16 blocks from another park's spot." |
| 10 | Bea walks 400 blocks off and uses the Deed, "Claim here". | "You claimed Bea's Zoo! 500 Zoo Coins to start. Rename it in the Park Ledger's settings." Her Ledger is titled "Park Ledger: Bea's Zoo" and its first row says "Bea's Zoo (park 2 of 2 in this world)". Yours now says "Riverside (park 1 of 2 in this world)". |
| 11 | Bea `/zoocraft:build 100` where she stands. | Her zoo builds round her Deed spot inside its own fence ring; yours is untouched (same coins, exhibits, keepers). `/zoocraft:status` lists "park Riverside: ..." and "park Bea's Zoo: ...". Guests come to both entrances; each park's sidebar figures are its own, and the sidebar on screen names the park it shows on its top row (the park with the most members online; with one each, the first park). |
| 12 | Bea opens her Staff Room, Tour Desk, Research Desk, Zoo Bank, Gift Shop, Ticket Booth and the entrance gate. | Each menu is her park's: her coins, her keepers (6 of 6), her research. The same blocks in your park show yours. Her `/zoocraft:skip 300` runs only her clock (your park day doesn't move). |
| 13 | Bea tries to rename her park "Riverside" in settings. | "Another park is already called Riverside." Her park keeps its name. |
| 14 | You make Bea a keeper of Riverside from the Ledger's Members page. | "Bea is now a keeper of Riverside." Bea standing in Riverside opens the Deed: Riverside's Ledger (she belongs to it). Standing in her own: hers. Standing outside both: her own. |
| 15 | Bea builds an Aluminum Fence round her Deed spot that also goes round yours. | The fence's state line: "The Aluminum Fence closes round Riverside's Park Deed spot (x y z) too, so it isn't this park's fence: a park can't hold another park. Fence the two parks apart." Her park keeps its last closed edge. Take the fence back inside: it closes as usual. |
| 16 | In a world with several parks, place an Exhibit Controller outside any fence, then close a fence round it. | The exhibit joins the park whose fence holds it (its Ledger lists it; the other park's doesn't). |
| 17 | Open the content log after loading. | No errors. |
