// What a visible guest says when a player talks to them (ideas backlog 1: Austin writes his own lines), by situation.
// Each situation has lines for every guest (`any`) and may have lines for one kind of visitor (`nether`, `end`: the
// themed visitors, 0.1.98); a guest picks from its kind's lines and the `any` lines together. To add lines, add
// strings to a list. A line may use the placeholders its situation lists in VARS ({name} the animal's name, {kind}
// its species, {exhibit} the exhibit's name, {where} where the guest is heading); tests/logic.test.mjs checks them.
// Lines go to chat only when a player talks to a guest (spec section 14: no chat spam).

export const GUEST_LINES = {
  // The park's main complaint (visitors/demand.js COMPLAINTS; "services" says which service is short).
  viewing: { any: ["I can't see any animals from the path.", "Where are the animals? I can't see a thing from here."] },
  cleanliness: { any: ["Phew, that exhibit could do with a clean.", "It's a bit messy in there, isn't it?"] },
  value: { any: ["Bit pricey for what's here, isn't it?", "I'm not sure that ticket was worth it."] },
  food: { any: ["I'm starving. Is there anywhere to get a snack?", "You'd think a zoo would sell food."] },
  restock: { any: ["The snack stand's sold out. Typical!", "No snacks left? Oh well."] },
  seating: { any: ["My feet hurt. Is there a bench anywhere?", "I'd love somewhere to sit down."] },
  litter: { any: ["Who dropped all this litter?", "There's rubbish all over the path."] },
  paths: { any: ["Which way to the snacks? I can't find a path.", "I got a bit lost. Where does this path go?"] },
  // Walking the paths to somewhere else in the park.
  travel: { any: ["I'm on my way to {where}.", "Off to {where}, over the paths.", "{where}? This way, I think."] },
  // About an animal in the nearest exhibit, happy or not.
  happy: { any: ["Look at {name} the {kind}!", "{name} looks so happy here.", "I love the {kind}s in {exhibit}."] },
  glum: { any: ["Is {name} feeling all right?", "{name} the {kind} looks a bit glum."] },
  // No animals in the nearest exhibit, or none near.
  empty: { any: ["What a lovely little zoo.", "I hope they get more animals soon.", "Nice place. Where are the animals, though?"] },
  // Just through the gate (0.1.97).
  greeting: { any: ["Right, where do we start?", "I've been looking forward to this all week.", "Ooh, which way to the animals?", "Tickets done. Let's see everything!"] },
  // On the way out (0.1.97).
  goodbye: { any: ["What a day. We'll be back!", "My feet are done in. Time to go home.", "Bye! I'll tell everyone about this place.", "Already time to go? That went quickly."] },
};

// The placeholders each situation may use; a situation not listed uses none.
export const VARS = {
  travel: ["where"],
  happy: ["name", "kind", "exhibit"],
  glum: ["name", "kind", "exhibit"],
};

// Where a travelling guest says it's going when it isn't an exhibit.
export const PLACES = { viewpoint: "the next exhibit", stand: "the snack stand", bench: "a bench" };

/**
 * A line for `situation` from a guest of `type` ("any" for an everyday guest), with its placeholders filled from
 * `values`. `random` is Math.random or a stand-in. Undefined when the situation has no lines.
 * @param {string} situation
 * @param {string} type
 * @param {Record<string, string>} [values]
 * @param {() => number} [random]
 */
export function guestLineFor(situation, type, values = {}, random = Math.random) {
  const set = GUEST_LINES[situation];
  if (!set) return undefined;
  const lines = type !== "any" && set[type] ? [...set[type], ...set.any] : set.any;
  if (!lines?.length) return undefined;
  const line = lines[Math.floor(random() * lines.length)].replace(/\{(\w+)\}/g, (all, k) => values[k] ?? all);
  return line.charAt(0).toUpperCase() + line.slice(1); // "{where}? ..." starts a sentence
}
