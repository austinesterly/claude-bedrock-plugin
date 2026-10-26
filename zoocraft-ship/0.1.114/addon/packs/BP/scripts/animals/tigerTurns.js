import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { allExhibits, getExhibit, dirtied } from "../exhibits/exhibits.js";
import { animalsIn, liveEntity } from "./animals.js";
import { densOf, denOf, isDenned, callAnimalIn, letOut, keeperBusy, intentOf } from "./predators.js";
import { groupsOf, turnPlan, turnSteps, turnsLine } from "./tigerRules.js";
import { today } from "./nursery.js";

// Tigers take turns out (0.1.76; spec 5.2 "Privacy and separate adult territories"): only one grown tiger is
// loose in an exhibit at a time (a tigress with her cubs counts as one), the rest shut in their Holding Dens,
// a different one out each park day, as the Smithsonian's tigers rotate ("visitors may see a different tiger
// each day"). The rules are animals/tigerRules.js (groupsOf, turnPlan, turnSteps). Every two seconds, for
// each exhibit of a solitary species: the ones out of turn are called into a free den first (her cubs go in
// with a tigress: animals/predators.js), and only when they're all in are the ones whose turn it is let out
// (only those the turns shut in: never one a player or a keeper shut in). One let out on the wrong day is
// called back in. While a keeper is shifting them or working inside, nothing turns. On an introduction day
// (breeding on, a grown male and a tigress without cubs) the pair are out together, and the day goes on the
// exhibit's record with the two who met (ex.turns.introDay, introIds): breeding needs one in the last few
// days, and it's that pair that breeds (animals/breeding.js).

const plans = new Map(); // exhibit id -> { day, plan, groups }

// Today's plan for this exhibit (worked out by the last tick), or undefined.
export function planOf(exId) {
  return plans.get(exId);
}

// Is today an introduction day in this exhibit (a pair let out together)? animals/tiger.js: they don't fight.
export function introToday(exId) {
  return Boolean(plans.get(exId)?.plan.intro);
}

// The clipboard's turns line for this exhibit, or undefined (one group: no turns).
export function turnsText(ex) {
  const p = plans.get(ex.id);
  if (!p || p.groups.length < 2) return undefined;
  const names = new Map(animalsIn(ex).map((a) => [a.id, a.name]));
  return turnsLine(p.groups, p.plan, names, p.day);
}

export function tickTurns() {
  const T = BALANCE.tiger;
  const live = new Set();
  for (const ex of allExhibits()) {
    const day = today(ex);
    const species = SPECIES[ex.speciesId];
    if (!species?.solitary) continue;
    live.add(ex.id);
    const tigers = animalsIn(ex).filter((a) => a.speciesId === species.id);
    const groups = groupsOf(tigers);
    const plan = turnPlan(groups, day, Boolean(ex.breeding?.on), T);
    plans.set(ex.id, { day, plan, groups });
    if (keeperBusy(ex.id)) continue; // a keeper's job: nothing turns till it's done
    const dens = densOf(ex);
    if (groups.length < 2) {
      // On its own (the others moved out): out of its den if the turns put it there.
      for (const d of dens) if (d.held && d.turn) letOut(d);
      continue;
    }
    const view = tigers.map((a) => ({ id: a.id, juvenile: a.juvenile, denned: isDenned(a.id), turnDen: Boolean(denOf(a.id)?.turn) }));
    const steps = turnSteps(groups, plan, view);
    const free = dens.filter((d) => !d.held);
    for (const id of steps.callIn) {
      const e = liveEntity(id);
      if (!e || intentOf(e.id)?.kind === "den") continue;
      // The nearest free den not already promised to another.
      let best;
      for (const d of free) {
        const k = Math.hypot(e.location.x - d.pos.x, e.location.z - d.pos.z);
        if (!best || k < best.k) best = { d, k };
      }
      if (!best) break; // not enough dens: the care warning says so (predators.js densNeeded)
      free.splice(free.indexOf(best.d), 1);
      callAnimalIn(id, best.d, { turn: true });
    }
    for (const id of steps.letOut) {
      const d = denOf(id);
      if (d?.held === id) letOut(d);
    }
    // The pair both out on their introduction day: it counts for breeding.
    if (plan.intro && (ex.turns?.introDay ?? -1) !== day) {
      const out = groups.filter((g) => plan.out.has(g.key)).flatMap((g) => g.grown);
      if (out.length >= 2 && out.every((id) => !isDenned(id))) {
        const fresh = getExhibit(ex.id);
        if (fresh) {
          fresh.turns = { ...(fresh.turns ?? {}), introDay: day, introIds: out };
          dirtied(fresh);
        }
      }
    }
  }
  for (const id of [...plans.keys()]) if (!live.has(id)) plans.delete(id);
}
