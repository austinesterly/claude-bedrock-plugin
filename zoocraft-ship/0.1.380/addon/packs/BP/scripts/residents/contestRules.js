// The rabbits' contest (0.1.380, Carrot's character pass; Austin, 25 Nov: "Level 60, carrot tells you of this contest
// shes been training for ... she gives you a flyer for the event, but it says \"must have ticket to enter\". At level
// 80, carrot says she has an idea, YOU enter the contest ... she reccomends you bring at leaast 4 of her secret potions
// though, and she gives you the ticket. She says she forgot how to actually get to the contest though... shes sure she
// will remember if you keep talking to her every day."). No engine calls here.

export const CONTEST_GIVER = "carrot";
export const FLYER = "zoocraft:contest_flyer";
export const TICKET = "zoocraft:contest_ticket";
/** What the flyer reads, line by line. */
export const FLYER_TEXT = ["THE GREAT RABBIT CONTEST", "Three stages. One champion.", "Who is the most agile, the fastest, the bounciest of all?", "Stage 1: the Parkour Race", "Stage 2: Tag", "Stage 3: Rabbit Hunt", "MUST HAVE TICKET TO ENTER"];
export const POTIONS_ADVISED = 4;

/** Whether she has handed this player the ticket (their friendship record with her). */
export const hasTicketFrom = (bond) => bond?.rewards?.[TICKET] !== undefined;

/** Whether she is still trying to remember the way: the ticket handed over, the way (`known`) not yet. */
export const remembering = (bond, known) => hasTicketFrom(bond) && !known;
