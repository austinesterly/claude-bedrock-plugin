// Jared's rhymes (0.1.377; Austin's notes for Jared, level 100: "he asks you to bring him 4 pairs of items that rhyme
// to give him some inspiration for example, they can give him one stone, and one bone. He will then create a freestyle
// for you based on what you gave him."). An item's word is the last word of its id ("minecraft:cooked_cod" -> "cod",
// "minecraft:cobblestone" -> "cobblestone"); two items rhyme when their words end in the same sound and are not the
// same word, nor one the tail of the other (stone and cobblestone is no rhyme). No engine calls here.

export const RHYME_ABILITY = "rhymes";
export const PAIRS_NEEDED = 4;

/** The word an item goes by. */
export function wordOf(typeId) {
  const id = String(typeId ?? "").split(":").pop() ?? "";
  return id.split("_").pop() ?? "";
}

// Words English spells one way and says another: their sound, written the way the rule below would hear it.
const SOUNDS = {
  eye: "ie", dye: "ie", pie: "ie", key: "ee", prismarine: "een", granite: "anit", compass: "umpas", lantern: "antern",
  foot: "uut", wool: "wul", wood: "wud", sword: "sord", tear: "eer", shears: "eers", spear: "eer", pearl: "url", iron: "iern",
  bowl: "oal", hoe: "ow", dough: "ow", chain: "ane", sac: "ack", door: "ore", floor: "ore", bread: "ed", head: "ed", lead: "ed",
  thread: "ed", wheat: "eet", meat: "eet", steak: "ake", light: "ite", bamboo: "oo", cocoa: "oco", lazuli: "ulee", elytra: "itra",
  bucket: "ucket", potato: "ato", tomato: "ato", emerald: "emerald", diamond: "imond", ingot: "ingot", nugget: "ugget",
  apple: "apple", saddle: "addle", candle: "andle", bottle: "ottle", pickle: "ickle", table: "able", cauldron: "auldron",
  rabbit: "abbit", chicken: "icken", salmon: "ammon", mutton: "utton", button: "utton", cotton: "otton", carrot: "arrot",
  beacon: "eacon", melon: "elon", pumpkin: "umpkin", totem: "otem", trident: "ident", crystal: "istal", coral: "oral",
  gravel: "avel", barrel: "arrel", anvil: "anvil", shovel: "uvel", lever: "ever", feather: "ether", leather: "ether",
  copper: "opper", hopper: "opper", dropper: "opper", chopper: "opper", stopper: "opper", dispenser: "enser", observer: "erver",
  comparator: "arator", repeater: "eeter", banner: "anner", spawner: "awner", smoker: "oker", poker: "oker", powder: "owder",
  flower: "ower", tower: "ower", paper: "aper", sugar: "ugar", ladder: "adder", scaffolding: "olding", helmet: "elmet",
  cookie: "ookie", honey: "unny", money: "unny", bunny: "unny", poppy: "oppy", daisy: "aisy", tulip: "ulip", lily: "illy",
  berries: "erries", cherries: "erries", leaves: "eeves", arrow: "arrow", marrow: "arrow", barrow: "arrow", pillow: "illow",
  willow: "illow", yellow: "ellow", furnace: "urnis", obsidian: "idian", lapis: "apis", quartz: "orts", amethyst: "ethist",
  netherite: "ite", andesite: "ite", diorite: "ite", calcite: "ite", bauxite: "ite", template: "ate", chestplate: "ate",
  leggings: "eggings", carpet: "arpet", target: "arget", piston: "iston", potion: "otion", lotion: "otion", cactus: "actus",
  fungus: "ungus", torchflower: "ower", sunflower: "ower", sapling: "apling", sherd: "urd", shard: "ard", mace: "ace",
  spyglass: "ass", glass: "ass", grass: "ass", seagrass: "ass", scute: "ute", flute: "ute", boots: "oots", roots: "oots",
  planks: "anks", stairs: "airs", seeds: "eeds", beans: "eens", stew: "oo", glue: "oo", bundle: "undle", crossbow: "ow",
  bow: "ow", snow: "ow", rainbow: "ow", precipice: "ipis", figurine: "een", conduit: "onduit", bush: "uush", deadbush: "uush",
  azalea: "alia", sea: "ee", ward: "ord", wart: "ort", flowered: "owered", veil: "ail", meal: "eel", dripleaf: "eef",
  heart: "art", koi: "oy", vein: "ane", wait: "ate", sailfin: "in", cinnabar: "ar", tears: "eers", froglight: "ite",
  shroomlight: "ite", willowlight: "ite", string: "ing",
};
// Endings said lightly: the rhyme then starts a syllable earlier (rocket and basket are no rhyme; ration and station are).
const LIGHT = ["a", "ar", "er", "or", "y", "ion", "ium", "en", "in", "om", "et", "al", "ing", "ern", "on", "el", "le", "us", "um", "ot", "il", "ow"];

const VOWELS = "aeiouy";
const isVowel = (c) => VOWELS.includes(c);

/** The sound a word ends in, for rhyming: its own entry above, else from its last vowel on (a silent last e let go). */
export function soundOf(word) {
  const w = String(word ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return "";
  if (SOUNDS[w]) return SOUNDS[w];
  // more than one: the sound of one, and the s (flakes -> akes, vines -> ines)
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) return `${soundOf(w.slice(0, -1))}s`;
  // a silent e after a consonant: cake -> ake, stone -> one, slice -> ice
  let end = w.length;
  if (w.length > 2 && w.endsWith("e") && !isVowel(w[w.length - 2]) && !w.endsWith("le")) end = w.length - 1;
  const back = (from) => {
    let i = from;
    while (i >= 0 && !isVowel(w[i])) i--;
    while (i > 0 && isVowel(w[i - 1])) i--;
    return i;
  };
  let i = back(end - 1);
  if (i < 0) return w;
  // a light ending: from the syllable before, when there is one
  if (LIGHT.includes(w.slice(i)) && i > 0) {
    const j = back(i - 1);
    if (j >= 0) i = j;
  }
  const sound = w.slice(i);
  return sound === "ight" ? "ite" : sound === "oor" ? "ore" : sound;
}

/** Whether two words rhyme: the same ending sound, different words, neither the tail of the other. */
export function wordsRhyme(a, b) {
  const x = String(a ?? "").toLowerCase();
  const y = String(b ?? "").toLowerCase();
  if (!x || !y || x === y) return false;
  // one word with more in front of it is the same word again (stone, cobblestone); a new start to the sound is a rhyme (ice, slice)
  const tail = (long, short) => long.endsWith(short) && [...long.slice(0, long.length - short.length)].some(isVowel);
  if (tail(x, y) || tail(y, x)) return false;
  const s = soundOf(x);
  return s.length > 1 && s === soundOf(y);
}

/** Whether two items rhyme. */
export const itemsRhyme = (idA, idB) => wordsRhyme(wordOf(idA), wordOf(idB));

/** Why a pair is turned down, or undefined when he takes it: "same" item, "tail" (no rhyme), or "had" (a word used). */
export function pairWhy(idA, idB, pairs) {
  if (idA === idB) return "same";
  if (!itemsRhyme(idA, idB)) return "none";
  const used = new Set((pairs ?? []).flat().map(wordOf));
  if (used.has(wordOf(idA)) || used.has(wordOf(idB))) return "had";
  return undefined;
}

// The freestyle: a couplet a pair, the two words on the ends of its lines.
const COUPLETS = [
  ["Woke up this morning, I reached for my {a},", "by the afternoon I was holding my {b}."],
  ["My friend came through and brought me that {a},", "looked in the bag and I found me that {b}."],
  ["Some folks spend their whole lives chasing the {a},", "you walked right up and you handed me the {b}."],
  ["I put it on the table, one good {a},", "right next to it, no lie, one fine {b}."],
  ["Crocodiles are jealous of my {a},", "the pufferfish keeps asking for my {b}."],
  ["Ask the whole zoo who's got the best {a},", "same friend of mine who brought me that {b}."],
];
const OPEN = "Yo, this one's for {name}. Four pairs in, here's what I've got.";
const CLOSE = "That's the verse. True story. All of it. Thanks, {name}.";

const say = (word) => word.split("_").join(" ");

/** The freestyle for the pairs given, a line an entry, opening and closing with the player's name. Always the same for the same pairs. */
export function freestyle(pairs, name) {
  const lines = [OPEN.split("{name}").join(name)];
  pairs.forEach(([a, b], i) => {
    const c = COUPLETS[i % COUPLETS.length];
    for (const l of c) lines.push(l.split("{a}").join(say(wordOf(a))).split("{b}").join(say(wordOf(b))));
  });
  lines.push(CLOSE.split("{name}").join(name));
  return lines;
}
