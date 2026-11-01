// Polar bears (0.1.174, module 12: research/vanilla_plan.md "0.1.174 polar bears: the design"): the rules for
// animals/polarBear.js, kept apart so they can be tested. The game walks and swims a zoo polar bear (its own stroll and
// look goals); animals/predators.js decides when one goes to its Holding Den, warns a player off, charges or backs off,
// and when a wild one (the game's own bear) goes to a thrown fish. Then the controller steps it there itself, with its
// act for the client (entity property zoocraft:act).

// The act: 0 its own life (the client's walk by its speed), 1 standing up on its hind legs facing someone (the warning),
// 2 walking (to its den, backing off), 3 the charge, 4 the strike (up on its hind legs and down onto them).
export const ACT = { life: 0, stand: 1, walk: 2, run: 3, strike: 4 };

// Glide paces in blocks a tick: a walk to its den or away (a polar bear walks about 1.6 blocks a second), the charge
// (a polar bear charges at up to 40 km/h; in the game a mob's sprint is about 5 a second), and swimming (a dog paddle
// at about 1 a second).
export const PACE = { walk: 1.6 / 20, run: 5 / 20, swim: 1 / 20 };

// The strike: the act held 6 ticks (the client's stand takes 6 to rise and 6 to ease down), started 2 ticks after
// animals/predators.js decides the swipe (this controller's loop runs 2 ticks after its loop), so the blow it lands 11
// ticks after deciding comes as the paws come down (the test server: decided at 2984, act 4 at 2986, the blow at 2994).
export const STRIKE_TICKS = 6;

// Now and then a grown one in its exhibit stands up on its hind legs to look about and sniff the air (polar bears do,
// to see and smell further): a chance each 10-tick step (about once in 30 seconds), held up this many ticks.
export const LOOK = { chance: 1 / 60, ticks: 50 };

// The intents the controller carries out for a zoo bear (the others leave it to its own life) and a wild one.
export const ZOO_INTENTS = ["den", "warn", "charge", "back"];
export const WILD_INTENTS = ["bait", "eat"];

// What a zoo bear's act is while it does what predators.js asks.
/** @param {string} kind */
export function actFor(kind) {
  if (kind === "warn") return ACT.stand;
  if (kind === "charge") return ACT.run;
  if (kind === "den" || kind === "back") return ACT.walk;
  return ACT.life;
}

// Is the client's stand-up on for this act (the warning, the strike)?
/** @param {number} act */
export function stands(act) {
  return act === ACT.stand || act === ACT.strike;
}

// Its feet swimming: `cellY` the top water block's y (the surface is 0.89 up it). A polar bear swims low, the back and
// head out (the game's float keeps a grown one's feet about 0.8 under the surface; a cub half that).
/** @param {number} cellY @param {boolean} young */
export function swimY(cellY, young) {
  return cellY + 0.89 - (young ? 0.4 : 0.8);
}

// Where it backs off to: `far` blocks straight away from `from` the player at `threat`, or a little to one side or the
// other, the first of them that `can` takes (a fence or the pool's edge behind it). Cells, or undefined.
/**
 * @param {{x: number, y: number, z: number}} from
 * @param {{x: number, z: number}} threat
 * @param {number[]} fars
 * @param {(c: {x: number, y: number, z: number}) => boolean} can
 */
export function backGoal(from, threat, fars, can) {
  const away = Math.atan2(from.z - threat.z, from.x - threat.x);
  for (const far of fars) {
    for (const turn of [0, 30, -30, 60, -60, 90, -90]) {
      const a = away + (turn * Math.PI) / 180;
      const x = Math.floor(from.x + Math.cos(a) * far);
      const z = Math.floor(from.z + Math.sin(a) * far);
      const y = Math.floor(from.y + 0.5);
      for (const dy of [0, 1, -1]) {
        const c = { x, y: y + dy, z };
        if (can(c)) return c;
      }
    }
  }
  return undefined;
}

// Where a zoo bear may go: its exhibit's measured floor ("land", not up on a feeder or fixture: `onTop`) and the surface
// of its pool ("water"). Unmeasured since the world loaded (no cells): open ground and water, as a wild one.
/**
 * @param {Map<string, string> | undefined} cells
 * @param {Set<string>} onTop
 * @param {(c: {x: number, y: number, z: number}) => boolean} open the ground or water surface there is open
 */
export function walkerFor(cells, onTop, open) {
  if (!cells) return open;
  return (c) => {
    const k = `${c.x},${c.y},${c.z}`;
    const v = cells.get(k);
    return (v === "land" && !onTop.has(k)) || v === "water";
  };
}

// The game's own polar bear (0.1.174) has no zoo calm or hunt events: a thrown fish calms an angry grown one with the
// game's own minecraft:on_calm (its attack off), and nothing sets one hunting. The zoo's wild predators have both.
/**
 * @param {{ origin?: string, wildCalm?: string }} species
 * @param {string} ev "zoocraft:calm" or "zoocraft:hunt"
 * @param {boolean} young
 */
export function wildEventFor(species, ev, young) {
  if (species.origin !== "vanilla") return ev;
  return ev === "zoocraft:calm" && !young ? species.wildCalm : undefined;
}
