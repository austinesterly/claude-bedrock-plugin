import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { PROJECTS } from "../data/research.js";
import { getPark, parkTime, runLater, parkRecordId } from "../park/park.js";
import { sandboxOn } from "../park/rules.js";
import { spend } from "../economy/economy.js";
import { levels } from "../discovery/discovery.js";
import { projectNeeds } from "../discovery/rules.js";
import { guestBoost } from "../quests/conservationRules.js";
import { releaseCount } from "../quests/releases.js";
import { countItem, takeItem } from "../platform/mc.js";

// Research (spec section 4): projects at the Research Desk. A finished project is a record in the
// "research" collection; the game reads its effect through the helpers below.

const RES = "research";

// 0.1.114: research is the park's (it costs the park's coins and unlocks the park's equipment): a project's record is
// "<project>" for the world's first park and "<project>:<park id>" after (park/park.js parkRecordId).
export function researched(id) {
  return Boolean(db.get(RES, parkRecordId(id)));
}

// --- effects ---
export const feederCapacity = () => BALANCE.feeder.capacity + (researched("bulk_feeders") ? 16 : 0);
export const exhibitsPerKeeper = () => BALANCE.staff.exhibitsPerKeeper + (researched("keeper_training") ? 2 : 0);
export const keeperTime = (seconds) => (researched("keeper_training") ? seconds * 0.75 : seconds);
// More guests a day: the guidebooks (the End Guidebook's while an End animal is on show), plus the
// park's conservation reputation (releases to the wild).
export const guestFactor = (endOnShow = false) => 1 + (researched("park_guidebook") ? BALANCE.research.parkGuidebook.guests : 0) + (endOnShow && researched("end_guidebook") ? BALANCE.research.endGuidebook.guests : 0) + guestBoost(releaseCount(), BALANCE.conservation);
// How often the wild takes an animal of one species (conservation releases).
export const releaseCooldownDays = () => (researched("reintroduction_science") ? BALANCE.research.reintroduction.cooldownDays : BALANCE.conservation.cooldownDays);
// Containment Anchors after Anchor Tuning: more charge, used more slowly.
export const anchorCapacity = () => (researched("anchor_tuning") ? BALANCE.research.anchorTuning.capacity : BALANCE.anchor.capacity);
export const anchorUsePerDay = () => (researched("anchor_tuning") ? BALANCE.research.anchorTuning.unitsPerDay : BALANCE.anchor.unitsPerDay);
export const recoveryFactor = () => (researched("veterinary_care") ? 2 : 1);

export function itemName(item) {
  return item.split(":")[1].replace(/_/g, " ").replace("writable book", "book and quill");
}

// Where a project stands: done, locked (journal needs), or what it still costs the player. In sandbox
// mode (park/rules.js) every project is open and free.
export function projectState(project, player) {
  if (researched(project.id)) return { done: true };
  if (sandboxOn(getPark())) return { open: true, short: [], afford: true, sandbox: true };
  const missing = projectNeeds(project, levels(), PROJECTS.filter((p) => researched(p.id)).map((p) => p.id), releaseCount());
  if (missing.length) return { locked: true, missing };
  const short = Object.entries(project.items).filter(([item, n]) => countItem(player, item) < n).map(([item, n]) => `${itemName(item)} x ${n - countItem(player, item)}`);
  return { open: true, short, afford: (getPark()?.balance ?? 0) >= project.cost };
}

// Do the project: everything is checked first, then the coins are spent (once, by operation id),
// then the parts are taken. Returns { ok } or { ok: false, reason }.
export function runProject(player, project) {
  const st = projectState(project, player);
  if (st.done) return { ok: false, reason: "Already researched." };
  if (st.locked) return { ok: false, reason: `Needs ${st.missing.join(" and ")}.` };
  if (st.short.length) return { ok: false, reason: `You're missing ${st.short.join(", ")}.` };
  const paid = spend(player, project.cost, `Research: ${project.name}`, `research:${project.id}`);
  if (!paid.ok) return { ok: false, reason: `Not enough Zoo Coins (${project.cost} needed).` };
  if (!st.sandbox) for (const [item, n] of Object.entries(project.items)) takeItem(player, item, n);
  db.put(RES, { id: parkRecordId(project.id), project: project.id, at: parkTime(), by: player.name });
  db.flush();
  return { ok: true };
}

export function researchDeskComponent(openMenu) {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      if (player) runLater(() => openMenu(player));
    },
  };
}

export function doneCount() {
  return PROJECTS.filter((p) => researched(p.id)).length;
}
