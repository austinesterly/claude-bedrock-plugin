import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { BLOCKS } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { emit } from "../core/events.js";
import { getPark, parkTime, insidePark, setAdmission, inScopeAt, runLater, runTimeoutLater } from "../park/park.js";
import { allExhibits, getExhibit, exhibitAt, reachableCell } from "../exhibits/exhibits.js";
import { liveEntity } from "../animals/animals.js";
import { entityAsleep, hiddenInTheDark } from "../animals/night.js";
import { viewStatus, chooseViewed, settlesView, pointSlot } from "./demand.js";
import { standSpot, eyeOf, lineOfSight } from "./sight.js";
import { pathLinked } from "./network.js";
import { dim, blockReader, viewReader, message } from "../platform/mc.js";

// Guest-side park features (spec section 12): the Ticket Booth, which sets the admission price
// while it stands near the Park Entrance Gate, and Viewing Points, which count when guests can
// stand there and actually see animals in an exhibit. Both are "equipment" records keyed by block
// position, like the exhibit fixtures, but they never belong to an exhibit's fixture list.

const EQUIP = "equipment";
/** @type {any} Custom block states aren't in the vanilla typings. */
const WORKING = "zoocraft:working";
const TYPE_OF_BLOCK = { [BLOCKS.ticketBooth]: "booth", [BLOCKS.viewingPoint]: "viewpoint" };

// 0.1.111: the scope's park's booths and Viewing Points while a loop runs for one park (park/park.js inScopeAt).
export function allPoints(type) {
  return db.all(EQUIP).filter((e) => e.type === type && inScopeAt(e));
}

function ensure(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: TYPE_OF_BLOCK[block.typeId], blockId: block.typeId, dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z } };
    if (rec.type === "viewpoint") Object.assign(rec, { exhibitId: undefined, viewed: false, lastSeenAt: undefined, inView: 0, total: 0, problem: "unchecked" });
    db.put(EQUIP, rec);
  }
  return rec;
}

// --- Ticket Booth ---

export function pairedBooth() {
  const ent = getPark()?.entrance;
  if (!ent) return undefined;
  const r = BALANCE.ticketBooth.pairRange;
  return allPoints("booth").find((b) => b.dimension === ent.dimension && Math.abs(b.pos.x - ent.x) <= r && Math.abs(b.pos.y - ent.y) <= r && Math.abs(b.pos.z - ent.z) <= r);
}

// The admission each guest pays: the booth's price while a booth is paired, else the default.
export function admission() {
  const park = getPark();
  if (park?.admissionPrice !== undefined && pairedBooth()) return park.admissionPrice;
  return BALANCE.economy.admissionPrice;
}

// --- Viewing Points ---

function boxDistance(p, b) {
  const dx = Math.max(b.min.x - p.x, 0, p.x - b.max.x);
  const dy = Math.max(b.min.y - p.y, 0, p.y - b.max.y);
  const dz = Math.max(b.min.z - p.z, 0, p.z - b.max.z);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// On the animals' side of the fence: inside an exhibit's box and next to where its animals can
// get to. A glass tunnel through a pool is inside the box but on the guests' side.
function insideExhibit(rec) {
  const ex = exhibitAt(rec.dimension, rec.pos);
  if (!ex) return false;
  const near = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dz]) => reachableCell(ex.id, { x: rec.pos.x + dx, y: rec.pos.y, z: rec.pos.z + dz }));
  if (near.includes(undefined)) return true; // not measured since the world loaded: go by the box
  return near.some(Boolean);
}

function boxCenter(b) {
  return { x: (b.min.x + b.max.x + 1) / 2, y: b.min.y, z: (b.min.z + b.max.z + 1) / 2 };
}

// Look from the point into the nearby occupied exhibits and keep the one it serves (chooseViewed).
// Does nothing while the point's area is unloaded: the last result stands. `memos` (dimension -> the blocks read so
// far), shared by the points checked together, reads each block once (0.1.96: the sightlines of a park's points crossed
// the same blocks about ten times over).
export function checkPoint(rec, memos = undefined) {
  const d = dim(rec.dimension);
  let memo = memos?.get(rec.dimension);
  if (memos && !memo) memos.set(rec.dimension, (memo = { blocks: new Map(), views: new Map() }));
  if (!d.isChunkLoaded(rec.pos)) return rec;
  const range = BALANCE.viewing.range;
  const now = parkTime();
  let problem;
  let best;
  let spot;
  const linked = pathLinked(rec.dimension, rec.pos);
  if (linked !== undefined) rec.linked = linked;
  if (!insidePark(rec.dimension, rec.pos)) problem = "outside";
  else if (insideExhibit(rec)) problem = "inside";
  else if (rec.linked === false) problem = "path"; // spec: a viewing node must connect to the entrance
  else {
    const near = allExhibits()
      .filter((ex) => ex.dimension === rec.dimension && ex.bbox && ex.animalIds.length && boxDistance(rec.pos, ex.bbox) <= range)
      .sort((a, b) => boxDistance(rec.pos, a.bbox) - boxDistance(rec.pos, b.bbox));
    if (!near.length) problem = "far";
    else {
      spot = standSpot(blockReader(d, {}, memo?.blocks), rec.pos, boxCenter(near[0].bbox));
      if (!spot) problem = "stand";
      else {
        const eye = eyeOf(spot);
        const view = viewReader(d, memo?.views);
        const rows = [];
        for (const ex of near) {
          let total = 0;
          let seen = 0;
          for (const id of ex.animalIds.slice(0, BALANCE.viewing.maxAnimalsChecked)) {
            const e = liveEntity(id);
            if (!e) continue;
            total++;
            if (entityAsleep(e) || hiddenInTheDark(e)) continue; // a nocturnal animal asleep in its ball, or in pitch dark, isn't on show (0.1.62, 0.1.63)
            const at = { x: e.location.x, y: e.location.y + 0.3, z: e.location.z };
            const far = (at.x - eye.x) ** 2 + (at.y - eye.y) ** 2 + (at.z - eye.z) ** 2 > range * range;
            if (!far && lineOfSight(view, eye, at)) seen++;
          }
          const row = { ex, seen, total, dist: boxDistance(rec.pos, ex.bbox) };
          rows.push(row);
          if (settlesView(row, BALANCE)) break; // the nearest settled row is the choice
        }
        best = chooseViewed(rows, BALANCE);
        if (best.total === 0) return rec; // the animals aren't loaded yet: keep the last result
      }
    }
  }
  if (problem) Object.assign(rec, { problem, exhibitId: undefined, viewed: false, lastSeenAt: undefined, inView: 0, total: 0, spot: undefined });
  else {
    if (rec.exhibitId !== best.ex.id) rec.lastSeenAt = undefined;
    Object.assign(rec, { problem: undefined, exhibitId: best.ex.id, inView: best.seen, total: best.total, spot }, viewStatus(rec, best.seen, now, BALANCE));
  }
  rec.checkedAt = now;
  db.put(EQUIP, rec);
  refreshLook(rec);
  return rec;
}

// Nothing changes a block's type between the checks (refreshLook sets only the point's own lit state).
export function checkAllPoints() {
  const memos = new Map();
  for (const rec of allPoints("viewpoint")) checkPoint(rec, memos);
}

// Every park second, the points whose turn it is: each point is checked once every `every` park seconds (a visitor
// step), at a second of its own, rather than all of them on the minute (0.1.96: a full park's 450 sightlines in one
// tick were its slowest moment). A point counts as viewed for memorySeconds after its animals were last seen, so the
// rating at the visitor step reads the same.
export function checkPointsDue(parkTime, every) {
  const now = Math.floor(parkTime) % every;
  const memos = new Map();
  for (const rec of allPoints("viewpoint")) if (pointSlot(rec.id, every) === now) checkPoint(rec, memos);
}


// Exhibit id -> true for exhibits a working Viewing Point looks into.
export function viewedExhibits() {
  const out = new Set();
  for (const rec of allPoints("viewpoint")) if (rec.viewed && rec.exhibitId) out.add(rec.exhibitId);
  return out;
}

function refreshLook(rec) {
  try {
    const block = dim(rec.dimension).getBlock(rec.pos);
    if (!block || block.typeId !== rec.blockId) return;
    const value = Boolean(rec.viewed);
    if (block.permutation.getState(WORKING) !== value) block.setPermutation(block.permutation.withState(WORKING, value));
  } catch {
    // Unloaded or replaced; the look catches up on the next check.
  }
}

export function pointText(rec) {
  const range = BALANCE.viewing.range;
  switch (rec.problem) {
    case "outside":
      return "§cViewing Point: outside the park. Guests only visit inside the park boundary.";
    case "inside":
      return "§cViewing Point: this is inside an exhibit. Put it on the guest side of the fence (a glass tunnel through the pool counts as the guest side).";
    case "far":
      return `§eViewing Point: no exhibit with animals within ${range} blocks.`;
    case "stand":
      return "§cViewing Point: guests have nowhere to stand. Leave a 2-block-high space on solid ground right next to it.";
    case "path":
      return "§eViewing Point: no guest path reaches it. Lay a path (gravel, dirt path, bricks, planks...) from the Park Entrance Gate to right beside it.";
    case "unchecked":
      return "§7Viewing Point: not checked yet.";
  }
  const name = getExhibit(rec.exhibitId)?.name ?? "the exhibit";
  if (rec.inView > 0) return `§aViewing Point: guests can see ${rec.inView} of ${rec.total} animal${rec.total === 1 ? "" : "s"} in ${name}.`;
  const still = rec.viewed ? " §7It still counts for a few minutes while they're hidden." : "";
  return `§eViewing Point: looks toward ${name}, but no animals are in view right now. Guests need a clear line: glass, water, fences and bars are fine; solid walls and leaves aren't.${still}`;
}

// Custom component for the Ticket Booth and the Viewing Point.
export function pointComponent() {
  return {
    onPlace(e) {
      const rec = ensure(e.block);
      if (rec.type !== "viewpoint") return;
      runTimeoutLater(() => {
        const cur = db.get(EQUIP, rec.id);
        if (cur) checkPoint(cur);
      }, 10);
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensure(e.block);
      runLater(() => {
        if (rec.type === "booth") return emit("openBooth", { player, booth: rec });
        message(player, pointText(checkPoint(rec)));
      });
    },
    onPlayerBreak(e) {
      const id = posKey(e.block.dimension.id, e.block.location);
      const setsPrice = pairedBooth()?.id === id;
      db.remove(EQUIP, id);
      // The price goes with the booth: a new booth starts again from the default admission.
      if (setsPrice && !pairedBooth()) setAdmission(undefined);
    },
  };
}
