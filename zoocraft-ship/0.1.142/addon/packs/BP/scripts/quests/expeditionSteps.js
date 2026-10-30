import { SPECIES } from "../data/species.js";

// The End expedition (spec section 4, "End discovery center: complete dimensional research and
// establish End access"; phase 4 "End research quests"), pure: the campaign chain after the
// caretaker tutorial, one step per piece of the End wing. quests/expedition.js checks the facts
// against the park's real state every two seconds, so a step can't be skipped or lost; the step
// rules (in order, never backwards) are quests/steps.js.

// The End wing's three. The Expansion's End animals (from the End Hopper on, 0.1.91) come after the expedition and
// aren't part of it.
export const END_SPECIES = ["zoocraft:chorus_deer", "zoocraft:void_ray", "zoocraft:rift_ferret"].filter((id) => SPECIES[id]?.origin === "custom_end");

export const EXPEDITION_STEPS = [
  { id: "research", title: "Research Dimensional Preparation", hint: "At the Research Desk, once 4 species in your Field Journal are ready to move: 2 ender pearls, 4 obsidian, an eye of ender and 250 Zoo Coins." },
  { id: "carrier", title: "Craft a Stabilized Carrier", hint: "At the Zoo Workshop: a Reinforced Crate between 2 obsidian, with an ender pearl above and below." },
  { id: "end", title: "Set foot in the End", hint: "Through an End portal in a stronghold. The End animals live on the outer islands, past an End gateway." },
  { id: "spot", title: "Spot all three End animals", hint: "Look at a Chorus Deer, a Void Ray and a Rift Ferret for 2 seconds each: the Field Journal notes them." },
  { id: "deer", title: "Bring home a Chorus Deer", hint: "Fill in its Field Journal page, coax one into a Stabilized Carrier with Chorus Browse, and release it in an exhibit with room, cover and a Basic Feeder." },
  { id: "ground", title: "Lay End ground for the deer", hint: "8 or more end stone (or Chorus Turf) blocks in its exhibit floor, then measure the exhibit again with the Habitat Marker." },
  { id: "flight", title: "Raise a flight room", hint: "A roofed exhibit with 14 blocks of air over the floor, a 20 x 20 floor and 2 Void Perches floating inside (the rays are giants); measure it with the Habitat Marker." },
  { id: "ray", title: "Bring home a Void Ray", hint: "Its Field Journal page, a Stabilized Carrier and Chorus Browse; release it on the flight room's floor." },
  { id: "anchor", title: "Charge a Containment Anchor", hint: "Craft one at the Zoo Workshop, place it beside an exhibit's floor, measure the exhibit, then use ender pearls on it." },
  { id: "ferret", title: "Bring home a Rift Ferret", hint: "Its Field Journal page, a Stabilized Carrier and Chorus Browse; release it in the anchored exhibit, with 2 Rift Tunnels on the floor." },
  { id: "settled", title: "Settle the End wing", hint: "All three End animals in exhibits with nothing orange or red on the Exhibit Clipboard: food, End ground, perches, tunnels and anchor charge in place." },
];

// What the park has done, from a plain view of it:
//   researched: project ids done; carrying: a member holds a Stabilized Carrier; inEnd: a member
//   has stood in the End; levels: Field Journal level by species id; exhibits, animals, anchors:
//   the records (exhibits with speciesId, animalIds, endCells, aerial { enclosed, perchCount },
//   careWarnings; animals with speciesId and location; anchors with exhibitId and units).
// Returns { [stepId]: boolean }. An End animal already living in the park proves the carrier and
// the trip, so a park that got there before this chain existed isn't stuck.
export function expeditionFacts(view) {
  const researched = new Set(view.researched);
  const housed = (speciesId) => view.animals.filter((a) => a.speciesId === speciesId && a.location.kind === "exhibit");
  const exhibitOf = (a) => view.exhibits.find((ex) => ex.id === a.location.id);
  const deer = housed("zoocraft:chorus_deer");
  const anyEnd = END_SPECIES.some((id) => housed(id).length > 0);
  const endExhibits = view.exhibits.filter((ex) => (ex.speciesIds ?? [ex.speciesId]).some((id) => END_SPECIES.includes(id)) && ex.animalIds.length);
  const minEnd = SPECIES["zoocraft:chorus_deer"]?.endGround?.minCells ?? 8;
  const flightRoom = (ex) => Boolean(ex.aerial?.enclosed) && (ex.aerial.perchCount ?? 0) >= 2;
  return {
    research: researched.has("dimensional_preparation"),
    carrier: Boolean(view.carrying) || anyEnd,
    end: Boolean(view.inEnd) || anyEnd,
    spot: END_SPECIES.every((id) => (view.levels[id] ?? 0) >= 1),
    deer: deer.length > 0,
    ground: deer.some((a) => (exhibitOf(a)?.endCells ?? 0) >= minEnd),
    flight: view.exhibits.some(flightRoom),
    ray: housed("zoocraft:void_ray").length > 0,
    anchor: view.anchors.some((a) => Boolean(a.exhibitId) && a.units > 0),
    ferret: housed("zoocraft:rift_ferret").length > 0,
    settled: END_SPECIES.every((id) => housed(id).length > 0) && endExhibits.every((ex) => !(ex.careWarnings ?? []).some((w) => w.severity >= 2)),
  };
}
