# The balance pass: test plan (0.1.178)

Two changes to the money, found by running the game's own formulas through 10 park days for parks from 1 to 76
exhibits (the starter park's rabbits, 3, 6 and 12 exhibits, and the whole test zoo):

- **More kinds of animals bring more guests.** Before, guests stopped growing at 3 exhibits: a 12-exhibit park drew the
  same 18 guests a day as a 3-exhibit one while its food cost eight times as much, so a growing park that bought its
  food lost coins. Now every kind of animal on show past the third (in exhibits open to guests) draws a tenth of a
  small park's guests more, up to 30 kinds. A park of 1 to 3 kinds is exactly as before. Two exhibits of the same
  kind count once.
- **The supply shop buys back at most 64 rations a park day.** Rations crafted from a bamboo, kelp or wheat farm could
  be sold back without limit, so a farm could earn more than the whole zoo. A stack a day still clears spare food and
  helps a park with no coins get going again.

Nothing else changed: prices, wages, the ticket price, snacks, gifts, tours, rides, donations and the rating are as
they were. Scripts only: leaving the world and joining again is enough.

| # | Do this | You should see |
|---|---|---|
| 1 | Open the Park Deed, Finances. | The rating line goes on: "More stars bring more guests, and so do more kinds of animals on show: N now (each kind past the first 3 brings more, up to 30 kinds)". N is how many kinds are in your open exhibits. |
| 2 | A park with 3 kinds or fewer. | Guests a day as before (the Finances page's "Yesterday" line). |
| 3 | Open a 4th and a 5th kind in their own exhibits and wait a park day. | N goes up by one for each; at the same stars, about 2 more guests a day each at 5 stars (fewer at fewer stars). |
| 4 | Put a second exhibit of a kind you already show. | N stays the same. |
| 5 | Park Deed, Supply shop. | The last-but-one button: "Sell rations, get coins back for rations you carry (64 more today)". |
| 6 | Carry 100 Leafy Rations and sell them. | The page says "up to 64 a park day: 64 more today"; the slider stops at 64. You get 64 coins; 36 rations stay with you. |
| 7 | Sell rations again the same park day. | "The shop has bought back all the rations it takes today (64 a park day). It buys more tomorrow." Nothing is taken. |
| 8 | Wait for the next park day ("Park day N begins"), then the shop again. | "(64 more today)" again. |
| 9 | Two members: one sells 40, then the other opens Sell rations. | "24 more today"; the slider stops at 24 (or what they carry, if less). |
| 10 | Sandbox mode on. | Selling works the same, capped the same. |
