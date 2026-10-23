// What a visible guest says when a player talks to them (ideas backlog 1: Austin writes his own lines), by situation.
// Each situation has lines for every guest (`any`) and may have lines for one kind of visitor (`nether`, `end`: the
// themed visitors, 0.1.98); a guest picks from its kind's lines and the `any` lines together. To add lines, add
// strings to a list. A line may use the placeholders its situation lists in VARS ({name} the animal's name, {kind}
// its species, {exhibit} the exhibit's name, {where} where the guest is heading); tests/logic.test.mjs checks them.
// A themed visitor says its own `happy` and `glum` lines only about an animal from its own dimension; about any
// other animal it says the everyday ones.
// Lines go to chat only when a player talks to a guest (spec section 14: no chat spam).

export const GUEST_LINES = {
  // The park's main complaint (visitors/demand.js COMPLAINTS; "services" says which service is short).
  viewing: {
    any: ["I can't see any animals from the path.", "Where are the animals? I can't see a thing from here."],
    nether: ["I came all this way for the Nether animals and I can't see a thing.", "Is there a Viewing Point? These goggles don't help."],
    end: ["I can't see any of the animals from here.", "Where's the best spot to watch? I've brought my notebook."],
  },
  cleanliness: {
    any: ["Phew, that exhibit could do with a clean.", "It's a bit messy in there, isn't it?"],
    nether: ["Even the Nether wastes look tidier than that exhibit."],
    end: ["End stone stays spotless. That exhibit, not so much."],
  },
  value: {
    any: ["Bit pricey for what's here, isn't it?", "I'm not sure that ticket was worth it."],
    nether: ["I've paid less to cross a lava lake."],
    end: ["Cheaper than a trip to the End, I suppose. Only just."],
  },
  food: {
    any: ["I'm starving. Is there anywhere to get a snack?", "You'd think a zoo would sell food."],
    nether: ["I haven't eaten since the portal. Any snacks?"],
    end: ["I've had nothing but chorus fruit all week. Any proper snacks?"],
  },
  restock: {
    any: ["The snack stand's sold out. Typical!", "No snacks left? Oh well."],
    nether: ["Sold out? I should have packed more for the trip."],
    end: ["No snacks left. Back to chorus fruit, then."],
  },
  seating: {
    any: ["My feet hurt. Is there a bench anywhere?", "I'd love somewhere to sit down."],
    nether: ["I need to sit down. This heat suit is heavy."],
    end: ["Is there a bench? I've been on my feet since the End portal."],
  },
  litter: {
    any: ["Who dropped all this litter?", "There's rubbish all over the path."],
    nether: ["Litter everywhere. That wouldn't last a second near lava."],
    end: ["Litter on the path? The End is so clean and quiet compared to this."],
  },
  paths: {
    any: ["Which way to the snacks? I can't find a path.", "I got a bit lost. Where does this path go?"],
    nether: ["I can cross a soul sand valley, but I can't find the path here."],
    end: ["I can find a stronghold, but I can't find the snack stand."],
  },
  // Walking the paths to somewhere else in the park.
  travel: {
    any: ["I'm on my way to {where}.", "Off to {where}, over the paths.", "{where}? This way, I think."],
    nether: ["Off to {where}. At least it's cooler than the Nether.", "{where}? Lead on, goggles on."],
    end: ["Heading for {where}. Notebook's ready.", "{where} next. I'll take notes."],
  },
  // About an animal in the nearest exhibit, happy or not.
  happy: {
    any: ["Look at {name} the {kind}!", "{name} looks so happy here.", "I love the {kind}s in {exhibit}."],
    nether: ["{name} the {kind} looks happier than the wild ones I've seen.", "Look at {name}! I've only ever seen {kind}s from across a lava lake.", "{exhibit} feels just like the Nether. Well done."],
    end: ["{name} the {kind} looks so calm. The wild ones never let me near.", "I'm writing down everything {name} does.", "{exhibit} is almost as quiet as the End itself."],
  },
  glum: {
    any: ["Is {name} feeling all right?", "{name} the {kind} looks a bit glum."],
    nether: ["{name} doesn't look right. The wild {kind}s are much livelier.", "Poor {name}. I hope someone checks on that {kind}."],
    end: ["{name} the {kind} seems out of sorts. I'll make a note.", "The wild {kind}s look livelier than {name}."],
  },
  // No animals in the nearest exhibit, or none near.
  empty: {
    any: ["What a lovely little zoo.", "I hope they get more animals soon.", "Nice place. Where are the animals, though?"],
    nether: ["No animals in here. I hope the Nether ones are somewhere else.", "Empty? I've come a long way for this."],
    end: ["An empty exhibit. Quiet as the End, I suppose.", "Nothing in here yet. I'll come back with my notebook."],
  },
  // Just through the gate (0.1.97).
  greeting: {
    any: ["Right, where do we start?", "I've been looking forward to this all week.", "Ooh, which way to the animals?", "Tickets done. Let's see everything!"],
    nether: ["Phew, made it. Which way to the Nether animals?", "Goggles on. Let's find the Nether animals!"],
    end: ["Right, where are the End animals? I've got pages to fill.", "Notebook ready. Which way to the End animals?"],
  },
  // On the way out (0.1.97).
  goodbye: {
    any: ["What a day. We'll be back!", "My feet are done in. Time to go home.", "Bye! I'll tell everyone about this place.", "Already time to go? That went quickly."],
    nether: ["Better than the real Nether, and nothing tried to eat me.", "Time to go. I'll tell the other explorers about this place."],
    end: ["Pages and pages of notes. Thank you!", "Back to the research station. What a visit."],
  },
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
