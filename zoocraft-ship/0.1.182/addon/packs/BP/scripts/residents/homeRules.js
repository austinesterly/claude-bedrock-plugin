// Resident homes (0.1.182, module 6c: research/npc_plan.md), pure. A home is a house the players build: a closed room
// (the Staff Room's rule, staff/rules.js measureRoom), a bed and a door in its walls, and the Resident Mailbox inside it
// or against its outside wall. A path laid from the front door takes its resident to the zoo: inside a park's fence the
// door's path has to be on that park's guest paths; outside every fence a walk along path blocks from the door has to
// reach the path by a park's entrance gate. These are the checks the game runs (residents/homes.js), on positions and
// block readings so tests can feed them a grid.
// Facts (research/npc_facts.md): a door's open state is its lower half's open_bit; every colour of bed is minecraft:bed
// with head_piece_bit telling the halves apart.

const SIDES = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0]];
const ACROSS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const keyOf = (p) => `${p.x},${p.y},${p.z}`;

/** Doors a resident uses: the game's wooden, iron, copper and the rest, never trapdoors. */
export function isDoor(typeId) {
  return /_door$/.test(typeId) && !/trapdoor$/.test(typeId);
}

export function isBed(typeId) {
  return typeId === "minecraft:bed";
}

/**
 * The beds and doors in the walls of a room, from its open cells (measureRoom's `at` with keepCells) and a reader
 * `blockAt(x, y, z)` giving `{ typeId, states }` or undefined (unloaded). A bed is either half touching the room; its
 * head is the half with head_piece_bit, its foot the bed half beside the head (a lone half counts as both). A door is
 * one whose lower half stands beside a room cell on the same level, with the cell on its far side outside the room:
 * `inside` is the room cell, `outside` the cell beyond (feet positions).
 * @param {{ x: number, y: number, z: number }[]} cells
 * @param {(x: number, y: number, z: number) => ({ typeId: string, states?: Record<string, any> } | undefined)} blockAt
 */
export function homeParts(cells, blockAt) {
  const inRoom = new Set(cells.map(keyOf));
  const bedHalves = new Map(); // key -> { pos, head }
  const doors = new Map(); // lower key -> door
  const seen = new Set();
  for (const c of cells) {
    for (const [dx, dy, dz] of SIDES) {
      const p = { x: c.x + dx, y: c.y + dy, z: c.z + dz };
      const k = keyOf(p);
      if (inRoom.has(k) || seen.has(k)) continue;
      seen.add(k);
      const b = blockAt(p.x, p.y, p.z);
      if (!b) continue;
      if (isBed(b.typeId)) bedHalves.set(k, { pos: p, head: b.states?.head_piece_bit === true });
      else if (isDoor(b.typeId)) {
        const lower = b.states?.upper_block_bit === true ? { x: p.x, y: p.y - 1, z: p.z } : p;
        const lk = keyOf(lower);
        if (doors.has(lk)) continue;
        if (lower !== p) {
          const below = blockAt(lower.x, lower.y, lower.z);
          if (!below || !isDoor(below.typeId)) continue;
        }
        for (const [ax, az] of ACROSS) {
          const inside = { x: lower.x + ax, y: lower.y, z: lower.z + az };
          const outside = { x: lower.x - ax, y: lower.y, z: lower.z - az };
          if (inRoom.has(keyOf(inside)) && !inRoom.has(keyOf(outside))) {
            doors.set(lk, { lower, inside, outside });
            break;
          }
        }
      }
    }
  }
  const beds = [];
  const used = new Set();
  // Heads first, each with the foot beside it.
  for (const [k, h] of bedHalves) {
    if (!h.head) continue;
    let foot;
    for (const [ax, az] of ACROSS) {
      const fk = keyOf({ x: h.pos.x + ax, y: h.pos.y, z: h.pos.z + az });
      const f = bedHalves.get(fk);
      if (f && !f.head && !used.has(fk)) {
        foot = f.pos;
        used.add(fk);
        break;
      }
    }
    used.add(k);
    beds.push({ head: h.pos, foot: foot ?? h.pos });
  }
  // A foot whose head is out of reach of the room (the bed sticks out through a wall) or missing.
  for (const [k, f] of bedHalves) if (!used.has(k)) beds.push({ head: f.pos, foot: f.pos });
  return { beds, doors: [...doors.values()] };
}

/** The first bed no other home has taken (`taken`: bed head keys of the other homes). */
export function pickBed(beds, taken) {
  return beds.find((b) => !taken.has(keyOf(b.head)));
}

/**
 * Where a resident lies in a bed: on top of it (beds are 9/16 of a block tall), turned so its feet point at the foot
 * and its head lies on the head half (the sleep pose, animation.zoocraft.resident.sleep, lies back from the waist:
 * the head and body reach 1.25 blocks behind the waist, the legs 0.75 in front), so the waist sits a quarter block
 * past the bed's middle toward the foot and the body fits the bed end to end.
 */
export function bedSpot(bed) {
  const dx = bed.foot.x - bed.head.x;
  const dz = bed.foot.z - bed.head.z;
  const len = Math.hypot(dx, dz) || 1;
  const x = (bed.head.x + bed.foot.x) / 2 + 0.5 + (0.25 * dx) / len;
  const z = (bed.head.z + bed.foot.z) / 2 + 0.5 + (0.25 * dz) / len;
  const yaw = dx === 0 && dz === 0 ? 0 : Math.round((Math.atan2(-dx, dz) * 180) / Math.PI) + 0;
  return { x, y: bed.head.y + 0.5625, z, yaw };
}

/** The door the resident uses: the one nearest the mailbox (the front door, when there are several). */
export function frontDoor(doors, mailbox) {
  let best;
  let bestD = Infinity;
  for (const d of doors) {
    const dist = Math.hypot(d.lower.x - mailbox.x, d.lower.z - mailbox.z) + Math.abs(d.lower.y - mailbox.y) * 2;
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best;
}

// What the mailbox says about a home that doesn't work yet (ui/mailboxMenu.js), by problem.
export const HOME_TEXT = {
  unchecked: "Checking the house and its path...",
  unloaded: "Part of the house isn't loaded. Come closer and use the mailbox again.",
  open: "The mailbox isn't in a closed house. Build walls, a floor and a roof all round, and put the mailbox inside or on an outside wall.",
  small: "The house is too small inside. It needs at least 3 x 3 x 3 blocks of open space, not counting the bed.",
  bed: "The house has no bed. Put a bed inside.",
  taken: "Another home's mailbox already uses this house's bed. Each home needs its own bed.",
  door: "The house has no door to the outside. Put a door in one of its walls.",
  path: "No path leads from the front door to a zoo. Lay path blocks from outside the front door to the zoo's paths, or to the path by its entrance gate.",
  dimension: "Residents only live in the Overworld.",
};

/**
 * A home's problem, the first that applies, or undefined when it works:
 * room = measureRoom's answer, parts = homeParts, bed = the bed it got (pickBed), path = true / false / undefined
 * (the walk can't tell yet).
 * @param {{ dimension?: string, room?: { ok: boolean, reason?: string }, parts?: { beds: any[], doors: any[] }, bed?: any, path?: boolean }} home
 */
export function homeProblem({ dimension = undefined, room = undefined, parts = undefined, bed = undefined, path = undefined }) {
  if (dimension !== undefined && dimension !== "minecraft:overworld") return "dimension";
  if (!room) return "unchecked";
  if (!room.ok) return room.reason === "unloaded" ? "unloaded" : room.reason === "small" ? "small" : "open";
  if (!parts?.beds.length) return "bed";
  if (!bed) return "taken";
  if (!parts.doors.length) return "door";
  if (path === false) return "path";
  if (path === undefined) return "unchecked";
  return undefined;
}

/** Path blocks right outside a door: under the step out or within `range` of it (the gate's start rule). */
export function doorStarts(read, outside, range) {
  const out = [];
  for (let dx = -range; dx <= range; dx++) {
    for (let dz = -range; dz <= range; dz++) {
      for (let dy = -3; dy <= 0; dy++) {
        const x = outside.x + dx;
        const y = outside.y + dy;
        const z = outside.z + dz;
        if (read(x, y, z) === "path") out.push({ x, y, z });
      }
    }
  }
  return out;
}
