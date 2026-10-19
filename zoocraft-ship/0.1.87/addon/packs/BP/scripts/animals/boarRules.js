// Cinder Boars (0.1.87, the Nether trio), pure: the day's moods, the sounder and its lead, rooting, the wallow and
// the mud coat, the sow's defence of her piglets (the alert, the bluff charge and the real one), and what an exhibit
// needs. Spec 5.3: "cinder_boar | Ash-colored rooting animal | Digs and uses cooling mud pockets | Ash, thermal mud,
// strong barrier". The game side is animals/boar.js; the Thermal Mud count is the walking measure's
// (exhibits/geometry.js summarize) and the strong barrier the boar measure's (geometry.js floodBoar). A fantasy
// animal built on the wild boar (research/nether_facts.md): sounders of sows and their young, led by the oldest sow;
// the boars apart; rooting with the snout, wallowing in mud in the heat and rubbing it off after; a sow with piglets
// stands her ground, bluffs, and charges for real at someone who keeps coming.
import { yawTo, herdsOf, rushTo, stepsAlong } from "./grazerRules.js";

export { yawTo, herdsOf, rushTo, stepsAlong };

// The boar mobs, found by type (0.1.70: never by family alone).
export const BOAR_TYPES = ["zoocraft:cinder_boar", "zoocraft:wild_cinder_boar"];

// What a boar is doing (its zoocraft:act entity property): the client plays the matching animation and the Field
// Journal watches for it. "trot" is the script moving it along (walking off, stepping between, going out through a
// broken fence).
export const ACT = { none: 0, root: 1, wallow: 2, rub: 3, rest: 4, sleep: 5, alert: 6, charge: 7, trot: 8 };

// The tag the script puts on the sounder's lead; the others' follow_mob goal follows the mob carrying it.
export const LEAD_TAG = "zoocraft:sounder_lead";

// ---------------- the ground ----------------
// What it roots in: Warm Ash in a zoo; a wild one in soul soil, soul sand, gravel and netherrack too (the entity
// files' seek_root blocks).
const ROOT_ZOO = /^zoocraft:warm_ash$/;
const ROOT_WILD = /^(zoocraft:warm_ash|minecraft:(soul_soil|soul_sand|gravel|netherrack))$/;
export function rootable(blockId, wild) {
  return (wild ? ROOT_WILD : ROOT_ZOO).test(blockId ?? "");
}

// What it wallows in: Thermal Mud in a zoo; a wild one in mud, soul sand and soul soil too, the Nether's nearest
// thing to a wallow (the entity files' seek_mud blocks).
const MUD_ZOO = /^zoocraft:thermal_mud$/;
const MUD_WILD = /^(zoocraft:thermal_mud|minecraft:(mud|soul_sand|soul_soil))$/;
export function wallowable(blockId, wild) {
  return (wild ? MUD_WILD : MUD_ZOO).test(blockId ?? "");
}

// What it rubs the mud off against: a solid block or a wall or fence at its flank (rock, a basalt pillar, bricks, a
// tree trunk: wild boar rub on trees after wallowing), never zoo equipment, leaves, glass or something it walks
// through. `kind`: the block's category from a plain block reader (data/blocks.js).
const NOT_RUB = /^zoocraft:|_leaves$|glass|_pane$|^minecraft:(leaves|leaves2|barrier|border_block)$/;
export function rubbable(blockId, kind) {
  return (kind === "solid" || kind === "barrier") && !NOT_RUB.test(blockId ?? "");
}

// ---------------- the day ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight. A range [a, b] may run past midnight's wrap.
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// "forage" through the morning and from the afternoon into the night (rooting, at the feeder, now and then a wander),
// "wallow" in the heat of the day (the mud, then rubbing the mud coat off, then lying down together), "sleep" late at
// night. Wild boar are active at dusk and through the night and rest by day; the park clock keeps them on show.
export function moodAt(timeOfDay, T) {
  const t = ((timeOfDay % 24000) + 24000) % 24000;
  if (within(t, T.morning) || within(t, T.afternoon)) return "forage";
  return within(t, T.midday) ? "wallow" : "sleep";
}

// What it goes looking for next while foraging (the engine walks it there; animals/boar.js does the rest when it
// arrives): rooting mostly (where there's ground to root in), the feeder when there's food it eats, a wander, and a
// muddy one goes to rub its coat off.
export function pickInterest({ feeder, ground, muddy }, random = Math.random) {
  const pool = ground ? ["root", "root", "root", "wander"] : ["wander", "wander"];
  if (feeder) pool.push("feeder", "feeder");
  if (muddy) pool.push("rub", "rub");
  return pool[Math.floor(random() * pool.length)];
}

// In the heat of the day: to the mud first (once each heat), then rub the coat off, then lie down together.
export function wallowStep({ wallowed, muddy, mud }) {
  if (!wallowed && mud) return "mud";
  if (muddy) return "rub";
  return "rest";
}

// ---------------- the sounder ----------------
// The lead of a sounder: the oldest grown sow, else the oldest grown boar, else anyone. members: [{ id, male, adult,
// age }] (age: larger is older; the order breaks ties).
export function leadOf(members) {
  if (!members.length) return undefined;
  const rank = (m) => (m.adult ? 2 : 0) + (m.male ? 0 : 1);
  let best = members[0];
  for (const m of members) {
    const r = rank(m);
    const b = rank(best);
    if (r > b || (r === b && (m.age ?? 0) > (best.age ?? 0))) best = m;
  }
  return best.id;
}

// The mother of each piglet: its recorded mother if she's here (zoo piglets), else the nearest grown sow. members:
// [{ id, x, z, adult, male, motherId? }]. Returns Map piglet id -> sow id (a piglet with no sow about has none).
export function mothersOf(members) {
  const out = new Map();
  const sows = members.filter((m) => m.adult && !m.male);
  for (const p of members) {
    if (p.adult) continue;
    let mum = p.motherId && sows.find((s) => s.id === p.motherId);
    if (!mum) {
      let best = Infinity;
      for (const s of sows) {
        const d = Math.hypot(s.x - p.x, s.z - p.z);
        if (d < best) {
          best = d;
          mum = s;
        }
      }
    }
    if (mum) out.set(p.id, mum.id);
  }
  return out;
}

// ---------------- the sow's defence ----------------
// How far it has gone (Forestry England: she stands between you and her young, bristles up and huffs; keep coming
// and she charges, stopping short; come closer, or hurt one, and she means it): "none", "alert" (someone within
// `range` of a piglet: T.alertRange, or T.alertRangeZoo inside an exhibit), "bluff" (within T.bluffRange of her or a
// piglet) or "real" (within T.realRange, or they hurt one of the sounder). dPiglet: the nearest piglet's distance to
// them; dSow: hers.
export function defenceStep({ dPiglet, dSow, hurt }, range, T) {
  if (hurt) return "real";
  const d = Math.min(dPiglet, dSow);
  if (d <= T.realRange) return "real";
  if (d <= T.bluffRange && dPiglet <= range) return "bluff";
  return dPiglet <= range ? "alert" : "none";
}

// Where she stands: between the threat and her piglets (their middle), T.guardGap from it toward the threat, facing
// it; the piglets bunch behind her, T.huddle back from their middle, side by side. piglets: [{ id, x, z }].
// Returns { sow: { x, z, yaw }, piglets: Map id -> { x, z, yaw } }.
export function guardPlaces(piglets, threat, T) {
  const cx = piglets.reduce((s, p) => s + p.x, 0) / Math.max(1, piglets.length);
  const cz = piglets.reduce((s, p) => s + p.z, 0) / Math.max(1, piglets.length);
  const dx = threat.x - cx;
  const dz = threat.z - cz;
  const len = Math.hypot(dx, dz) || 1;
  const ux = dx / len;
  const uz = dz / len;
  const gap = Math.min(T.guardGap, Math.max(0, len - 1)); // never past the threat
  const sow = { x: cx + ux * gap, z: cz + uz * gap, yaw: yawTo(ux, uz) };
  const out = new Map();
  piglets.forEach((p, k) => {
    const side = (k - (piglets.length - 1) / 2) * 0.5;
    const x = cx - ux * T.huddle - uz * side;
    const z = cz - uz * T.huddle + ux * side;
    out.set(p.id, { x, z, yaw: yawTo(ux, uz) });
  });
  return { sow, piglets: out };
}

// Where she backs off to after a charge: beside her piglets' middle, on the side toward the threat.
export function backTo(piglets, threat, T) {
  return guardPlaces(piglets, threat, T).sow;
}

// Where a boar walking off from someone goes: straight away from them, `far` blocks. Returns { x, z, yaw }.
export function walkOffTo(from, threat, far) {
  const dx = from.x - threat.x;
  const dz = from.z - threat.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: from.x + (dx / len) * far, z: from.z + (dz / len) * far, yaw: yawTo(dx, dz) };
}

// The damage a real charge does: a grown boar's tusks more than a sow.
export function chargeDamage(male, T) {
  return male ? T.boarDamage : T.sowDamage;
}

// ---------------- what the exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile);

// Thermal Mud to wallow in: species.wallow.minCells blocks in the floor.
export function hasThermalMud(species, ex) {
  if (!species.wallow || ex.thermalMudCells === undefined) return true;
  return ex.thermalMudCells >= species.wallow.minCells;
}

// The exhibit's issue when wood leads out (an occupied exhibit is unsafe; one won't move in).
export function boarIssue(plural, boar) {
  const v = boar.via;
  const where = v ? `: the wooden fence, gate or door at ${v.x} ${v.y} ${v.z} leads out` : "";
  return `${plural} break through wooden fences, gates and doors${where}. Build the walls of stone, brick or nether brick (walls or fences), iron bars or glass, with a Keeper Gate to go in by.`;
}

// The care warnings: Thermal Mud to wallow in, and one grown boar.
export function boarWarnings(ex, residents, plural, species) {
  const out = [];
  if (ex.thermalMudCells !== undefined && ex.thermalMudCells < species.wallow.minCells) out.push({ severity: 2, text: `${plural} need Thermal Mud to wallow in: at least ${species.wallow.minCells} blocks in the exhibit floor (${ex.thermalMudCells} now). Without it the heat of the Thermal Regulator is too much for them. Craft it from mud, soul soil and a snowball.` });
  const boars = grown(residents).filter((a) => a.sex === "male");
  if (boars.length > 1) out.push({ severity: 2, text: `${boars.map((a) => a.name).join(" and ")} are grown boars: boars live apart and fight over the sows. Keep one to an exhibit and move the others to one of their own.` });
  return out;
}

// The clipboard's lines: the mud, the walls and the sounder.
export function boarLines(ex, residents, species) {
  const lines = [];
  lines.push(ex.thermalMudCells !== undefined ? `§fThermal Mud: §7${ex.thermalMudCells} of ${species.wallow.minCells} blocks${ex.thermalMudCells < species.wallow.minCells ? " §c(too hot without it)" : ""}` : "§fThermal Mud: §7not measured yet: use the Habitat Marker on the ground inside again");
  const w = ex.boarWalls;
  if (!w) lines.push("§fStrong walls: §7not measured yet");
  else if (w.proof) lines.push(`§fStrong walls: §ayes§7${w.weak ? `, ${w.weak} wooden block${w.weak === 1 ? "" : "s"} beside the floor, with strong walls behind` : ""}`);
  else lines.push(`§fStrong walls: §cno§7, they'd break through the wood${w.via ? ` at ${w.via.x} ${w.via.y} ${w.via.z}` : ""}`);
  const young = residents.filter((a) => a.juvenile).length;
  lines.push(`§fSounder: §7${residents.length}${young ? ` (${young} piglet${young === 1 ? "" : "s"})` : ""}`);
  return lines;
}
