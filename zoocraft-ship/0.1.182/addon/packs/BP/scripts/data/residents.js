// The residents (0.1.182, module 6c: research/npc_plan.md section 4): everyone who can move into a home the players
// build. Each is one entry: id (saved, never changed), name, look (the zoocraft:who skin, RP textures/entity/zoocraft/
// resident_<look>), likes, dislikes and attributes (tags; LIKE_NAMES says them), a one-line bio for the mailbox's offers,
// and their lines. Austin is writing 32 residents (looks, likes, dislikes, attributes); until his list comes, four
// stand-ins (standIn: true) prove the homes, paths and daily walk. His residents replace them: a home whose resident is
// no longer listed gets its offers again.
// 0.1.182: likes and dislikes only colour what they say; 0.1.183 makes them steer where they go and how they feel.

export const LIKE_NAMES = {
  planters: "planters",
  birds: "birds",
  litter: "litter",
  fish: "fish and tanks",
  benches: "benches",
  high_admission: "high prices at the gate",
  big_cats: "big cats",
  snacks: "snack stands",
  quiet: "quiet days",
  nether: "Nether animals",
  end: "End animals",
  crowds: "crowds",
};

export const RESIDENTS = [
  {
    id: "stand_in_1",
    name: "Rosie Fernwood",
    look: 0,
    standIn: true,
    bio: "A gardener who loves flowers and birdsong.",
    likes: ["planters", "birds"],
    dislikes: ["litter"],
    attributes: [],
    lines: {
      hello: ["Lovely day for it!", "Hello, dear."],
      home: ["My seedlings need watering before I go.", "Home sweet home."],
      leaving: ["Off to see the birds!", "I hope they've planted something new."],
      visiting: ["Listen to them all!", "What a lovely zoo this is."],
      returning: ["Time to put the kettle on.", "My feet are tired, but it was worth it."],
      asleep: ["Zzz..."],
      waiting: ["Someone's taken my house apart!", "I can't get in, dear."],
      likes: ["A few more planters along the paths wouldn't hurt.", "Have you heard the birds this morning?"],
      dislikes: ["Litter on the paths spoils everything."],
    },
  },
  {
    id: "stand_in_2",
    name: "Captain Brindle",
    look: 1,
    standIn: true,
    bio: "A retired sailor who misses the sea.",
    likes: ["fish", "benches"],
    dislikes: ["high_admission"],
    attributes: [],
    lines: {
      hello: ["Ahoy there!", "Fair winds, friend."],
      home: ["A sailor's cabin, snug as you like."],
      leaving: ["Setting a course for the zoo.", "Weigh anchor!"],
      visiting: ["Reminds me of the old days at sea.", "A fine day for a stroll."],
      returning: ["Back to port.", "Home before dark, as a captain should be."],
      asleep: ["Zzz... all hands... zzz..."],
      waiting: ["My cabin's been wrecked! Where's my front door?"],
      likes: ["Nothing like watching the fish swim.", "A good bench is worth its weight in gold."],
      dislikes: ["They charge a fortune at that gate."],
    },
  },
  {
    id: "stand_in_3",
    name: "Pip Hollow",
    look: 2,
    standIn: true,
    bio: "A kid who wants to see every animal there is.",
    likes: ["big_cats", "snacks"],
    dislikes: ["quiet"],
    attributes: [],
    lines: {
      hello: ["Hi! Hi! Have you seen the lions?", "Hiya!"],
      home: ["I'm going to the zoo today!", "Is it time yet?"],
      leaving: ["Zoo time!", "Race you there!"],
      visiting: ["Did you see that?!", "This is the best day ever!"],
      returning: ["Do I have to go home?", "Same time tomorrow!"],
      asleep: ["Zzz... roar... zzz..."],
      waiting: ["My house is broken! Can you fix it?"],
      likes: ["The big cats are the coolest!", "Can I get a snack?"],
      dislikes: ["It's too quiet. Where is everybody?"],
    },
  },
  {
    id: "stand_in_4",
    name: "Dr. Amara Vale",
    look: 3,
    standIn: true,
    bio: "An explorer who has been to the Nether and back.",
    likes: ["nether", "end"],
    dislikes: ["crowds"],
    attributes: [],
    lines: {
      hello: ["Good day. Fascinating place you have here.", "Hello there."],
      home: ["Just finishing my field notes."],
      leaving: ["Time for some fieldwork.", "Off to the zoo with my notebook."],
      visiting: ["Remarkable creatures.", "I must write this down."],
      returning: ["Enough research for one day.", "Home to sort my notes."],
      asleep: ["Zzz..."],
      waiting: ["My lodgings appear to have been dismantled."],
      likes: ["Nothing compares to a creature from the Nether.", "The End wing is my favourite."],
      dislikes: ["Far too many people about today."],
    },
  },
];

/** The skins the resident body has (RP textures/entity/zoocraft/resident_<n>, zoocraft:who 0..63). */
export const RESIDENT_LOOKS = 4;

export function residentById(id) {
  return RESIDENTS.find((r) => r.id === id);
}
