// The residents (0.1.182, module 6c: research/npc_plan.md section 4): everyone who can move into a home the players
// build. Each is one entry: id (saved, never changed), name, look (the zoocraft:who skin, RP textures/entity/zoocraft/
// resident_<look>), likes, dislikes and attributes (tags; LIKE_NAMES says them), a one-line bio for the mailbox's offers,
// and their lines. Austin is writing 32 residents (looks, likes, dislikes, attributes); until his list comes, four
// stand-ins (standIn: true) prove the homes, paths and daily walk. His residents replace them: a home whose resident is
// no longer listed gets its offers again.
// 0.1.182: likes and dislikes only colour what they say. 0.1.217 (research/npc_plan.md section 9) makes them count: what
// they come across each visit (residentRules.js arrivalTags, stopTags) sets their mood, steers where they go, what they
// tip and what they say; ATTRIBUTES change the numbers.

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
  // 0.1.217: the rest of the tags the game can see (research/npc_plan.md section 9).
  reptiles: "reptiles",
  mythical: "mythical animals",
  bosses: "boss animals",
  mob_house: "the Mob House",
  farm: "farm animals",
  restrooms: "restrooms",
  fountains: "water fountains",
  lamps: "path lamps",
  clean: "clean paths",
  low_admission: "a bargain at the gate",
};

// The animal kinds a Viewing Point can show (0.1.217, residentRules.js kindsOf): named species, and the rules for the
// rest (fish: every animal in a tank or pool but the Mob House's; nether and end: every species from there, as the
// themed visitors count them; bosses: species.boss and the game's two; mob_house: every Mob House mob).
export const KIND_TAGS = ["big_cats", "birds", "reptiles", "fish", "nether", "end", "mythical", "bosses", "mob_house", "farm"];
const Z = (...ids) => ids.map((id) => `zoocraft:${id}`);
export const KIND_SPECIES = {
  big_cats: Z("lion", "tiger"),
  birds: Z("penguin", "flamingo", "owl", "zoo_parrot", "zoo_chicken"),
  reptiles: Z("crocodile", "warped_gecko", "basalt_tortoise", "starback_tortoise", "zoo_turtle"),
  mythical: Z("unicorn", "dragon", "griffin", "glowhorn_stag"),
  bosses: Z("zoo_wither", "zoo_ender_dragon"),
  farm: Z("zoo_sheep", "zoo_cow", "zoo_pig", "zoo_chicken", "zoo_mooshroom", "zoo_horse", "zoo_donkey", "zoo_mule", "zoo_llama", "zoo_trader_llama", "zoo_goat", "zoo_rabbit"),
};
// The amenities a resident walks up to (visitors/services.js WALK_TO), by their tag.
export const SERVICE_TAGS = { bench: "benches", stand: "snacks", restroom: "restrooms", fountain: "fountains" };

// What an attribute does (0.1.217; Austin's own attributes say what they mean when his list comes).
export const ATTRIBUTE_NAMES = { generous: "generous", chatty: "chatty", early_riser: "an early riser" };

/** Hearts out of 5 in words (0.1.217). */
export const MOOD_WORDS = ["miserable", "unhappy", "a bit glum", "fine", "happy", "delighted"];

// What a resident says about their day when they have no line of their own for it (0.1.217): pleased by a like they came
// across, bothered by a dislike.
export const PLEASED = {
  planters: "The planters along the paths look lovely.",
  birds: "I saw the birds today. Wonderful!",
  fish: "I could watch the fish all day.",
  benches: "There's always a bench when I need one.",
  big_cats: "The big cats were out today!",
  snacks: "I had a snack at the stand. Delicious!",
  quiet: "Nice and quiet today.",
  nether: "The Nether animals were fascinating today.",
  end: "The End animals were wonderful today.",
  crowds: "What a crowd! I love a busy day.",
  reptiles: "The reptiles were basking today.",
  mythical: "I saw a mythical animal today. Magical!",
  bosses: "I saw a real boss animal today!",
  mob_house: "The Mob House gave me a thrill.",
  farm: "The farm animals were sweet today.",
  restrooms: "Clean restrooms. That's a good zoo.",
  fountains: "A drink at the fountain went down nicely.",
  lamps: "The path lamps make it all so pretty.",
  clean: "Not a scrap of litter anywhere.",
  low_admission: "What a bargain at the gate!",
  litter: "I don't mind a bit of mess.",
  high_admission: "Worth every coin at the gate.",
};
export const BOTHERED = {
  planters: "The planters are in my way.",
  birds: "Those birds are so noisy.",
  fish: "Fish tanks give me the creeps.",
  benches: "Benches everywhere. Nobody sits on them.",
  big_cats: "Those big cats frighten me.",
  snacks: "Snack stands just make litter.",
  quiet: "It's too quiet. Where is everybody?",
  nether: "The Nether animals give me the shivers.",
  end: "The End animals give me the shivers.",
  crowds: "Far too many people about today.",
  reptiles: "I can't stand reptiles.",
  mythical: "Mythical animals? Silly, if you ask me.",
  bosses: "Those boss animals are far too big.",
  mob_house: "The Mob House gave me a fright.",
  farm: "I didn't come to the zoo to see farm animals.",
  restrooms: "The restrooms could be cleaner.",
  fountains: "The fountains splashed me.",
  lamps: "Those lamps are too bright.",
  clean: "It's all a bit too tidy here.",
  low_admission: "So cheap at the gate. Is something wrong?",
  litter: "Litter on the paths spoils everything.",
  high_admission: "They charge a fortune at that gate.",
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
    attributes: ["early_riser"],
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
      pleased: { planters: ["Someone's planted the paths beautifully!"], birds: ["The birds were singing their hearts out today."] },
      bothered: { litter: ["Litter everywhere today. It made me so cross."] },
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
    attributes: ["chatty"],
    lines: {
      hello: ["Ahoy there!", "Fair winds, friend."],
      home: ["A sailor's cabin, snug as you like."],
      leaving: ["Setting a course for the zoo.", "Weigh anchor!"],
      visiting: ["Reminds me of the old days at sea.", "A fine day for a stroll."],
      returning: ["Back to port.", "Home before dark, as a captain should be."],
      asleep: ["Zzz... all hands... zzz..."],
      waiting: ["My cabin's been wrecked! Where's my front door?"],
      likes: ["Nothing like watching the fish swim.", "A good bench is worth its weight in gold."],
      dislikes: ["A fair price at the gate, that's all I ask."],
      pleased: { fish: ["The fish took me right back to the open sea."], benches: ["Found a fine bench and watched the world go by."] },
      bothered: { high_admission: ["Highway robbery at that gate today!"] },
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
      dislikes: ["I like it best when the zoo is busy!"],
      pleased: { big_cats: ["The lions ROARED at me!"], snacks: ["I got a snack! The best one!"] },
      bothered: { quiet: ["Nobody was there today. Boring!"] },
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
    attributes: ["generous"],
    lines: {
      hello: ["Good day. Fascinating place you have here.", "Hello there."],
      home: ["Just finishing my field notes."],
      leaving: ["Time for some fieldwork.", "Off to the zoo with my notebook."],
      visiting: ["Remarkable creatures.", "I must write this down."],
      returning: ["Enough research for one day.", "Home to sort my notes."],
      asleep: ["Zzz..."],
      waiting: ["My lodgings appear to have been dismantled."],
      likes: ["Nothing compares to a creature from the Nether.", "The End wing is my favourite."],
      dislikes: ["Crowds make it hard to take proper notes."],
      pleased: { nether: ["I filled three pages on the Nether animals today."], end: ["The End animals behaved just as my notes say."] },
      bothered: { crowds: ["I could hardly see the exhibits for the crowds."] },
    },
  },
];

/** The skins the resident body has (RP textures/entity/zoocraft/resident_<n>, zoocraft:who 0..63). */
export const RESIDENT_LOOKS = 4;

export function residentById(id) {
  return RESIDENTS.find((r) => r.id === id);
}
