// Quest chains, pure: the caretaker tutorial's steps (spec section 3), and which steps of a chain a
// set of park facts completes. Steps finish in order, and a finished step stays finished even if its
// fact later turns false (the feeder runs empty, the park closes), so progress never goes backwards.

export const TUTORIAL_STEPS = [
  { id: "claim", title: "Claim your park", hint: "Use the Park Deed and choose Claim here." },
  { id: "workshop", title: "Build a Zoo Workshop", hint: "Craft it at a crafting table (crafting table, 2 planks, 2 copper ingots, 1 book) and place it." },
  // 0.1.101 (Austin: the fence is "Required"): the park is the ground its fence closes round (0.1.106: every park,
  // however old; the circle older parks kept is gone).
  { id: "fence", title: "Fence in your park", hint: "At the Zoo Workshop, craft Aluminum Fence (4 copper ingots and 2 iron nuggets make 16) and run it all the way round the spot where you claimed the park, with an Aluminum Fence Gate to walk through. Everything inside it, at every height, is your park." },
  { id: "tools", title: "Craft exhibit tools", hint: "At the Zoo Workshop, craft an Exhibit Controller, a Habitat Marker and a Basic Feeder." },
  { id: "exhibit", title: "Get an exhibit ready", hint: "Fence a pen at least 7 x 7 inside. Put the controller outside the fence and the feeder inside, then use the marker on the controller and on the ground inside." },
  { id: "food", title: "Stock the feeder", hint: "Use Leafy Rations on the feeder. Craft them from leaves and wheat, 4 kelp or 4 bamboo." },
  { id: "animal", title: "Bring in an animal", hint: "With a Leafy Ration in your inventory, use an empty Small Carrier on a wild rabbit, then use the carrier on the ground inside the exhibit." },
  { id: "care", title: "Care for your animal", hint: "Play with it using an empty hand, or clean the exhibit with a Cleaning Rake." },
  { id: "open", title: "Open the zoo", hint: "Place a Park Entrance Gate in the park's fence or inside it, where your path will start (it builds an archway 5 blocks wide and 4 high), then use it to open." },
  { id: "path", title: "Lay a guest path", hint: "Lay a path of gravel, dirt path, bricks or planks from the Park Entrance Gate toward your exhibit. Guests only reach what a path reaches." },
  { id: "viewing", title: "Add a viewing point", hint: "Craft a Viewing Point at the Zoo Workshop and place it beside the path, outside the fence, where guests can see the animals. Use it to check the view." },
  { id: "income", title: "Earn your first admission", hint: "Guests pay as they arrive. Happy animals bring more of them." },
];

// facts: { [stepId]: boolean }. Returns the ids of `steps` newly completed, in order: a later fact
// waits for the earlier steps, and an existing park can finish several at once.
export function stepsDone(steps, completed, facts) {
  const done = [];
  for (const step of steps) {
    if (completed[step.id] !== undefined) continue;
    if (!facts[step.id]) break;
    done.push(step.id);
  }
  return done;
}

export function nextStep(steps, completed) {
  return steps.find((s) => completed[s.id] === undefined);
}

// The caretaker tutorial's own; the End expedition (expeditionSteps.js) uses the general ones.
export const completeSteps = (completed, facts) => stepsDone(TUTORIAL_STEPS, completed, facts);
export const currentStep = (completed) => nextStep(TUTORIAL_STEPS, completed);

// Replacement starter kit: only while the tutorial is unfinished, at most `maxClaims` times and
// once per park day, and only the items the player doesn't already carry.
export function kitOffer(quest, day, owned, kit, maxClaims) {
  if (!currentStep(quest.completed)) return { ok: false, reason: "The tutorial is finished." };
  if (quest.kitClaims >= maxClaims) return { ok: false, reason: "The replacement kit has been used up." };
  if (quest.kitDay === day) return { ok: false, reason: "One replacement kit per park day. Come back tomorrow." };
  const items = kit.filter(({ item }) => !owned[item]);
  if (!items.length) return { ok: false, reason: "You already have everything in the kit." };
  return { ok: true, items };
}
