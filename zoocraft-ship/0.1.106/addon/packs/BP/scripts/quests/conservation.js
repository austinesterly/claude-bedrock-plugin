import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES, pluralOf } from "../data/species.js";
import { CARRIERS, isClearLava } from "../data/items.js";
import { PROJECTS } from "../data/research.js";
import { newId } from "../core/ids.js";
import { emit } from "../core/events.js";
import { getPark, parkTime, insidePark, parkEdge } from "../park/park.js";
import { distanceFromFence } from "../park/fence.js";
import { earn } from "../economy/economy.js";
import { allExhibits, getExhibit } from "../exhibits/exhibits.js";
import { allAnimals, welfare, retireAnimal } from "../animals/animals.js";
import { levelFor, levels } from "../discovery/discovery.js";
import { researched, releaseCooldownDays } from "../research/research.js";
import { stepsDone, nextStep } from "./steps.js";
import { tutorialStatus } from "./tutorial.js";
import { releaseCheck, siteCheck, groundText, dimensionName, guestBoost, wildDistance, CONSERVATION_STEPS, conservationFacts } from "./conservationRules.js";
import { allReleases, releaseSummary, addRelease } from "./releases.js";
import { message, onlinePlayers } from "../platform/mc.js";

// Conservation releases (spec sections 9 and 15; phase 5 "conservation quests"), the runtime side
// of quests/conservationRules.js. An animal's page on the Exhibit Clipboard offers "Release to the
// wild"; a settled, healthy grown-up goes into its carrier (transport/carriers.js packForRelease)
// and is let out in its home wilds, far from the park, where the carrier spawns a wild one with its
// name and the record leaves the park (retireAnimal) through the journaled transfer (phase
// Released). Each release is a unique completion record in the "releases" collection (only this
// module writes it): the park earns a bounded coin reward, reputation (more guests a day, capped)
// and opens Reintroduction Science. The conservation quest chain lives beside the End expedition on
// the Journal page, checked every two seconds like the others.

const Q = "quests";
const ID = "conservation";
const B = () => BALANCE.conservation;

function quest() {
  return db.get(Q, ID) ?? { id: ID, completed: {}, finished: false };
}

function members() {
  const park = getPark();
  return onlinePlayers().filter((p) => park?.members[p.id]);
}

export function today() {
  return Math.floor(parkTime() / BALANCE.clock.dayLength);
}

// May this animal go to the wild? { ok, reason } (the reason explains itself either way).
export function checkRelease(a) {
  const species = SPECIES[a.speciesId];
  const ex = a.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  return releaseCheck(
    {
      animal: a,
      species,
      welfare: welfare(a),
      daysInPark: Math.floor((parkTime() - (a.createdAt ?? 0)) / BALANCE.clock.dayLength),
      level: levelFor(a.speciesId),
      residentsAfter: ex ? ex.animalIds.filter((id) => id !== a.id).length : 0,
      lastReleaseDay: releaseSummary().lastDay[a.speciesId],
      cooldownDays: releaseCooldownDays(),
      day: today(),
    },
    B(),
  );
}

// Real lava, or Clear Lava (Austin, 0.1.58: "Clear lava also has to work for lava ray exhibits").
const isLavaBlock = (typeId) => typeId === "minecraft:lava" || typeId === "minecraft:flowing_lava" || isClearLava(typeId);

// Lava (or Clear Lava) cells within 2 blocks of a block, nearest first (for letting out a lava animal).
function lavaNear(block) {
  const out = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        try {
          const b = block.dimension.getBlock({ x: block.x + dx, y: block.y + dy, z: block.z + dz });
          if (b && isLavaBlock(b.typeId)) out.push({ x: b.x, y: b.y, z: b.z, d: dx * dx + dy * dy + dz * dz });
        } catch {
          // unloaded
        }
      }
    }
  }
  return out.sort((p, q) => p.d - q.d);
}

// Is the block the carrier was used on a good place to let this species out? { ok, reason }.
export function siteCheckAt(species, block) {
  const park = getPark();
  const dimensionId = block.dimension.id;
  const pos = { x: block.x, y: block.y, z: block.z };
  const here = park && park.dimension === dimensionId;
  const distance = here ? Math.hypot(pos.x - park.center.x, pos.z - park.center.z) : Infinity;
  const fenced = parkEdge(park) === "fence";
  const fenceDistance = here && fenced ? distanceFromFence(pos.x, pos.z) : Infinity;
  let aboveFree = false;
  try {
    aboveFree = Boolean(block.above()?.isAir);
  } catch {
    // top of the world
  }
  return siteCheck(
    {
      species,
      dimensionId,
      insidePark: insidePark(dimensionId, pos),
      distance,
      fenced,
      fenceDistance,
      ground: { id: block.typeId, isAir: block.isAir, isLiquid: block.isLiquid, lavaNear: lavaNear(block).length > 0 },
      aboveFree,
    },
    B(),
  );
}

// Where the wild one appears: on the block used, or in the nearest lava for a lava animal.
export function wildSpot(species, block) {
  if (species.lavaSwimmer || species.lavaWalker) {
    const cell = lavaNear(block)[0];
    return cell ? { x: cell.x, y: cell.y, z: cell.z } : undefined;
  }
  return { x: block.x, y: block.y + 1, z: block.z };
}

// The release is done (the wild one stands there, the carrier is empty): record it, retire the
// animal, pay the reward once (by transfer id, AC-15) and tell the park.
export function commitRelease({ animal, player, dimensionId, pos, transferId }) {
  const species = SPECIES[animal.speciesId];
  const day = today();
  const rec = { id: newId("rl"), animalId: animal.id, name: animal.name, speciesId: animal.speciesId, zooBorn: Boolean(animal.parents?.length), day, at: parkTime(), dimension: dimensionId, pos, by: player.name, transferId };
  addRelease(rec);
  retireAnimal(animal);
  const paid = earn(B().reward, `Conservation release: ${animal.name}`, `release:${transferId}`);
  db.flush();
  const s = releaseSummary();
  const boost = Math.round(guestBoost(s.count, B()) * 100);
  for (const p of members()) {
    message(p, `§2${animal.name} the ${species.displayName} is back in the wild! §f${paid.ok ? `+${B().reward} Zoo Coins. ` : ""}The park's name spreads: ${boost}% more guests a day (${s.count} released so far).`);
    try {
      p.playSound("random.levelup");
    } catch {
      // Cosmetic only.
    }
  }
  emit("animalReleased", { release: rec, species });
  return rec;
}

// For the Park Ledger and the Field Journal: totals and the guest boost.
export function releaseStatus() {
  const s = releaseSummary();
  return { count: s.count, zooBorn: s.zooBorn, species: s.species, lastDay: s.lastDay, boost: guestBoost(s.count, B()), records: allReleases() };
}

// Words for the Field Journal's care notes: how this species goes back to the wild.
export function releaseNote(species) {
  const b = B();
  const s = releaseSummary();
  const n = s.species[species.id] ?? 0;
  const text = `Conservation: grown-ups settled ${b.minDays} park days at welfare ${b.welfareMin} or more can be released from their page on the Exhibit Clipboard (an empty ${CARRIERS[species.carrierProfile]?.label ?? "carrier"} in your inventory). Let them out in ${dimensionName(species.homeDimension)}, ${wildDistance(parkEdge() === "fence", b)}, ${groundText(species)}. The wild takes one ${species.displayName} every ${releaseCooldownDays()} park days; each release pays ${b.reward} Zoo Coins and brings more guests`;
  return n ? `${text}. §2Released so far: ${n} ${n === 1 ? species.displayName : pluralOf(species)}` : text;
}

function view() {
  return {
    levels: levels(),
    exhibits: allExhibits(),
    animals: allAnimals(),
    welfareOf: welfare,
    releases: allReleases(),
    researched: PROJECTS.filter((p) => researched(p.id)).map((p) => p.id),
  };
}

export function tickConservation() {
  if (!getPark()) return;
  const q = quest();
  if (q.finished || tutorialStatus().next) return; // the tutorial comes first
  const newly = stepsDone(CONSERVATION_STEPS, q.completed, conservationFacts(view(), B()));
  if (!newly.length) return;
  const now = parkTime();
  for (const id of newly) q.completed[id] = now;
  const next = nextStep(CONSERVATION_STEPS, q.completed);
  q.finished = !next;
  db.put(Q, q);
  if (!next) earn(B().questReward, "Conservation programme complete", "grant:conservation");
  db.flush();
  const last = CONSERVATION_STEPS.find((s) => s.id === newly[newly.length - 1]);
  for (const p of members()) {
    message(p, `§2Conservation: ${newly.length > 1 ? `${newly.length} steps done` : `${last.title} done`}!`);
    if (next) message(p, `§fNext: §2${next.title}§f. §7${next.hint}`);
    else message(p, `§6Conservation programme complete! §f+${B().questReward} Zoo Coins. Keep releasing: every animal returned brings guests to the park.`);
    try {
      p.playSound("random.levelup");
    } catch {
      // Cosmetic only.
    }
  }
}

// For the sidebar and the Park Ledger, like expeditionStatus.
export function conservationStatus() {
  const q = quest();
  const done = CONSERVATION_STEPS.filter((s) => q.completed[s.id] !== undefined).length;
  return { open: !tutorialStatus().next, started: done > 0, done, total: CONSERVATION_STEPS.length, next: nextStep(CONSERVATION_STEPS, q.completed), steps: CONSERVATION_STEPS, completed: q.completed, finished: q.finished };
}
