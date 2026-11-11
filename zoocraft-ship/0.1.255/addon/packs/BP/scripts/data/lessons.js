// Ailing Bot's lessons for the player (0.1.246; Austin's NPC Expansion spec, "Teaching the Player"). The four topics
// and the five friendship bands with their names are his; the lessons' words are ours, and every number in them is
// read from the game's own rules (balance.js), so a lesson "explain[s] actual ZooCraft game systems". A finished lesson
// is the player's for good (the friendship record keeps it), and is a page of their Field Journal from then on (Austin:
// "ailing bot should unlock new things in the book item we already have"). `notes`: the Lesson Notes item a finished
// lesson gives, which the Workshop item `unlocks` needs in its recipe (his card answer: "Four items").
import { BALANCE } from "./balance.js";

const B = BALANCE;
const pct = (x) => `${Math.round(x * 100)}%`;

export const TOPICS = {
  layout: "Zoo layout, design and improvements",
  revenue: "Ticket revenue and donations",
  visitors: "Visitor happiness, retention and repeat visits",
  animals: "Animal happiness, habitat quality and enrichment",
};

export const BANDS = [
  { at: 0, name: "Basic zoo care" },
  { at: 20, name: "Animal happiness and habitat improvements" },
  { at: 40, name: "Visitor retention and revenue strategies" },
  { at: 60, name: "Advanced zoo research and upgrades" },
  { at: 80, name: "Hidden knowledge and specialized improvements" },
];

export const LESSONS = [
  {
    id: "needs",
    at: 0,
    topic: "animals",
    title: "The five needs",
    lines: [
      `Every animal has five needs: food, comfort, cleanliness, enrichment and company. Its welfare weighs them ${pct(B.needs.weights.satiety)}, ${pct(B.needs.weights.comfort)}, ${pct(B.needs.weights.cleanliness)}, ${pct(B.needs.weights.enrichment)} and ${pct(B.needs.weights.social)}.`,
      `Left alone, a park day takes ${B.needs.drainPerDay.satiety} off food, ${B.needs.drainPerDay.cleanliness} off cleanliness and ${B.needs.drainPerDay.enrichment} off enrichment.`,
      `A need at ${B.needs.bands.healthy} or more is healthy. Under ${B.needs.bands.attention} it needs attention, and under ${B.needs.bands.urgent} it is critical.`,
      `A Cleaning Rake on the exhibit floor adds ${B.care.rakeCleanliness} cleanliness. Playing with an animal with an empty hand adds ${B.care.playEnrichment} enrichment.`,
    ],
  },
  {
    id: "viewing",
    at: 0,
    topic: "layout",
    title: "Paths and Viewing Points",
    lines: [
      `Guests only walk on guest paths, and they only count an exhibit they can see from a Viewing Point.`,
      `A Viewing Point shows animals up to ${B.viewing.range} blocks away, and one within ${B.viewing.besideRange} blocks of an exhibit belongs to that exhibit.`,
      `Happier animals are a better view: a seen exhibit scores ${B.viewing.seenBase} plus ${pct(B.viewing.seenWelfare)} of its animals' welfare.`,
    ],
  },
  {
    id: "enrichment",
    at: 20,
    topic: "animals",
    title: "Animal enrichment",
    notes: "zoocraft:lesson_notes_enrichment",
    unlocks: "zoocraft:puzzle_feeder",
    lines: [
      `Enrichment comes in kinds: forage, swim, manipulate, dig, climb and scent. A species only cares for the kinds on its Field Journal page.`,
      `Each kind an exhibit offers gives back ${B.enrichment.perCategoryPerDay} enrichment a park day, so two kinds beat two of the same.`,
      `A Puzzle Feeder is the manipulate kind, but only while it holds food the animal eats.`,
      `Every extra animal in an exhibit dirties it ${pct(B.care.exhibitDirtPerExtraAnimal)} faster.`,
    ],
  },
  {
    id: "comforts",
    at: 20,
    topic: "layout",
    title: "Comforts along the paths",
    lines: [
      `A Litter Bin covers the paths within ${B.litter.coverRange} blocks, a Bench within ${B.seating.coverRange}, a Path Lamp and a Planter within ${B.lamps.coverRange}.`,
      `Bins and Benches covering ${pct(B.amenities.bins.cover)} of the paths, Lamps ${pct(B.amenities.lamps.cover)} and Planters ${pct(B.amenities.planters.cover)} each bring ${pct(B.amenities.bins.guests)} more guests a day, ${pct(B.amenities.cap)} at most together.`,
      `Lamps keep monsters from spawning on the paths they light.`,
    ],
  },
  {
    id: "revenue",
    at: 40,
    topic: "revenue",
    title: "Tickets and donations",
    notes: "zoocraft:lesson_notes_revenue",
    unlocks: "zoocraft:donation_box",
    lines: [
      `Guests think a fair ticket is ${B.admission.fairBase} coins plus ${B.admission.fairPerStar} for each star of your park's rating.`,
      `Each coin over the fair price loses ${pct(B.admission.demandPerCoinOver)} of your guests (never below ${pct(B.admission.demandFloor)}). Each coin under brings ${pct(B.admission.demandPerCoinUnder)} more, up to ${pct(B.admission.demandBonusMax)}.`,
      `A Donation Box within ${B.donations.range} blocks of a working Viewing Point collects up to ${B.donations.perGuest} coins a guest when the animals are well. ${B.donations.boxesForFull} boxes collect it all.`,
    ],
  },
  {
    id: "visitors",
    at: 40,
    topic: "visitors",
    title: "Happy guests come back",
    notes: "zoocraft:lesson_notes_visitors",
    unlocks: "zoocraft:tour_desk",
    lines: [
      `Guests judge your services: food ${pct(B.services.weights.food)}, seating ${pct(B.services.weights.seating)}, tidy paths ${pct(B.services.weights.litter)}, restrooms ${pct(B.services.weights.restrooms)}, drinking water ${pct(B.services.weights.drinks)}.`,
      `Plan a Snack Stand for every ${B.snacks.guestsPerStand} daily guests, a Bench for every ${B.seating.guestsPerBench}, a Restroom for every ${B.restrooms.guestsPer} and a Water Fountain for every ${B.drinks.guestsPer}.`,
      `A Tour Desk sells guided walks. At the fair price of ${B.tours.fair} coins, ${pct(B.tours.shareAtFair)} of guests buy one when the walk has four stops or more. Each guide costs ${B.tours.guideWage} coins a day and leads ${B.tours.toursPerGuide} tours of ${B.tours.groupSize}.`,
    ],
  },
  {
    id: "research",
    at: 60,
    topic: "layout",
    title: "Research and a bigger zoo",
    // 0.1.255 (Austin: "Research desk should not be kept behind ailing bots friendship"): a lesson only, no notes;
    // the Research Desk's recipe is as it was before 0.1.246. The Lesson Notes item stays for worlds that hold one.
    lines: [
      `A Research Desk runs the park's research projects. The Park Guidebook alone brings ${pct(B.research.parkGuidebook.guests)} more guests a day.`,
      `Past your third kind of animal on show, each new kind draws ${pct(B.economy.drawPerSpecies)} of a small park's guests more, up to ${B.economy.drawSpeciesCap} kinds.`,
      `An animal at ${B.conservation.welfareMin} welfare or more, ${B.conservation.minDays} days in the park, can be released to the wild: ${B.conservation.reward} coins, and ${pct(B.conservation.guestsPerRelease)} more guests a day for each release, up to ${pct(B.conservation.guestsCap)}.`,
    ],
  },
  {
    id: "rating",
    at: 80,
    topic: "visitors",
    title: "What the stars are made of",
    lines: [
      `Your park's rating is ${pct(B.rating.weights.welfare)} animal welfare, ${pct(B.rating.weights.satisfaction)} guest satisfaction, ${pct(B.rating.weights.variety)} variety and ${pct(B.rating.weights.operations)} how well it runs.`,
      `One animal in critical care holds the whole park at ${B.rating.criticalCapStars} stars, whatever else you do. Fix that animal first.`,
      `A guest favourite's exhibit counts ${B.viewing.favourite} times as a view. Its Field Journal page says when a species is one.`,
      `A Gift Shop sells ${pct(B.giftShop.varietyBase + B.giftShop.varietyPerSpecies)} of what it could with one kind of animal on view, and all of it with two or more.`,
    ],
  },
];

export const lessonById = (id) => LESSONS.find((l) => l.id === id);
