// Guest paths (spec section 12), pure: which path blocks guests can walk along from the Park
// Entrance Gate. `read(x, y, z)` says what the block at (x, y, z) is to a guest walking on top of
// it: "path" (an allowlisted path block with room to walk above it), "other" or "unloaded". The
// game wraps the walk in system.runJob; tests feed it a grid.
//
// A bounded flood fill over path blocks only: guests step to the four neighbours, up or down one
// block. It never searches the world for each guest; features (Viewing Points, stands, benches,
// bins, donation boxes) count when they sit beside a path the fill reached.
// Memory (0.1.64): a 500-block park is never all loaded at once, so the walk takes a reader that
// falls back on the last network where the ground is unloaded (rememberingReader), records the
// first unloaded edge it could not get past (net.unloadedAt, named on the Park Menu), and the
// network can be forgotten block by block (forgetColumn) and written out and read back
// (columnsOf, columnsInto, columnsHash) so it survives leaving the world. A node is complete when
// every block round it was read (loaded or remembered); the unloaded neighbours of a remembered
// complete node were looked at on that visit and were not path, so they are "other", not unknown,
// and only ground no walk has ever seen counts as unchecked.

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const STEP_Y = [0, 1, -1]; // level, up a block, down a block
const col = (x, z) => `${x},${z}`;
const key = (x, y, z) => `${x},${y},${z}`;

export function newNetwork() {
  // columns: "x,z" -> the y of every reached path block in that column. incomplete: the keys
  // "x,y,z" of nodes with a neighbour the walk could not read (unloaded, or past the cap).
  // remembered: how many nodes came from memory rather than a loaded block; unloadedAt: the first
  // unloaded block the walk had to stop at (undefined when it never did).
  return { columns: new Map(), size: 0, partial: false, capped: false, done: false, incomplete: new Set(), remembered: 0, unloadedAt: undefined };
}

function add(net, x, y, z) {
  const k = col(x, z);
  const ys = net.columns.get(k);
  if (ys) {
    if (ys.includes(y)) return false;
    ys.push(y);
  } else net.columns.set(k, [y]);
  net.size++;
  return true;
}

export function hasPath(net, x, y, z) {
  return Boolean(net.columns.get(col(x, z))?.includes(y));
}

export function isComplete(net, x, y, z) {
  return hasPath(net, x, y, z) && !net.incomplete.has(key(x, y, z));
}

// A reader that answers for unloaded ground from the last walk (`prior`): "path" where it found a
// path block (its key goes in `remembered`), "other" where the node asked from (`from`) was complete
// last time (so this block was looked at then and was not path), and "unloaded" otherwise. Loaded
// ground is read for real.
export function rememberingReader(read, prior, remembered = new Set()) {
  return (x, y, z, from) => {
    const kind = read(x, y, z);
    if (kind !== "unloaded" || !prior) return kind;
    if (hasPath(prior, x, y, z)) {
      remembered.add(key(x, y, z));
      return "path";
    }
    return from && isComplete(prior, from.x, from.y, from.z) ? "other" : "unloaded";
  };
}

// Forget the path blocks in one column between two heights (a block changed there). Returns how
// many went.
export function forgetColumn(net, x, z, lo, hi) {
  const k = col(x, z);
  const ys = net.columns.get(k);
  if (!ys) return 0;
  const kept = ys.filter((y) => y < lo || y > hi);
  const gone = ys.length - kept.length;
  if (!gone) return 0;
  for (const y of ys) if (y >= lo && y <= hi) net.incomplete.delete(key(x, y, z));
  if (kept.length) net.columns.set(k, kept);
  else net.columns.delete(k);
  net.size -= gone;
  return gone;
}

// The network as text, column by column ("x,z:y|y", an incomplete node's y followed by "?"), in
// pieces of `per` columns so a big one can be written a slice a tick; columnsInto reads it back;
// columnsHash tells two apart cheaply.
export function* columnsOf(net, per = 2000) {
  let piece = [];
  for (const [k, ys] of net.columns) {
    const [x, z] = k.split(",").map(Number);
    piece.push(`${k}:${[...ys].sort((a, b) => a - b).map((y) => (net.incomplete.has(key(x, y, z)) ? `${y}?` : `${y}`)).join("|")}`);
    if (piece.length >= per) {
      yield piece;
      piece = [];
    }
  }
  if (piece.length) yield piece;
}

export function columnsInto(net, cols) {
  for (const c of cols) {
    const at = c.indexOf(":");
    if (at <= 0) continue;
    const k = c.slice(0, at);
    const [x, z] = k.split(",").map(Number);
    const ys = [];
    for (const part of c.slice(at + 1).split("|")) {
      const open = part.endsWith("?");
      const y = Number(open ? part.slice(0, -1) : part);
      if (!Number.isInteger(y) || !Number.isInteger(x) || !Number.isInteger(z)) continue;
      ys.push(y);
      if (open) net.incomplete.add(key(x, y, z));
    }
    if (!ys.length) continue;
    net.columns.set(k, ys);
    net.size += ys.length;
  }
  return net;
}

export function columnsHash(cols) {
  let h = 2166136261;
  for (const c of cols) {
    for (let i = 0; i < c.length; i++) h = Math.imul(h ^ c.charCodeAt(i), 16777619) >>> 0;
    h = Math.imul(h ^ 10, 16777619) >>> 0;
  }
  return `${cols.length}:${h}`;
}

// Path blocks next to the entrance gate (the gate sits on the ground, so paths are a block lower).
export function entranceStarts(read, gate, range) {
  const out = [];
  for (let dx = -range; dx <= range; dx++) {
    for (let dz = -range; dz <= range; dz++) {
      for (let dy = -3; dy <= 1; dy++) {
        const x = gate.x + dx;
        const y = gate.y + dy;
        const z = gate.z + dz;
        if (read(x, y, z) === "path") out.push({ x, y, z });
      }
    }
  }
  return out;
}

// Generator: fills `net` from `starts`, yielding every `perYield` blocks. Stops at `maxNodes`.
// `inBounds(x, z)` keeps the walk inside the park.
// 0.1.96: the queue is read from a moving head (shift() moved the whole queue each node) and the loops index their
// steps (no iterators, slow in the game's script engine); same walk, same order.
export function* walkPaths(read, starts, opts, net) {
  const queue = [];
  for (const s of starts) if (add(net, s.x, s.y, s.z)) queue.push(s);
  let head = 0;
  let work = 0;
  while (head < queue.length) {
    const c = queue[head++];
    let unknown = false; // a neighbour it could not read: the node is incomplete
    for (let d = 0; d < 4; d++) {
      const x = c.x + DIRS[d][0];
      const z = c.z + DIRS[d][1];
      if (opts.inBounds && !opts.inBounds(x, z)) continue;
      for (let j = 0; j < 3; j++) {
        const y = c.y + STEP_Y[j];
        if (hasPath(net, x, y, z)) break;
        const kind = read(x, y, z, c);
        if (kind === "unloaded") {
          net.partial = true;
          net.unloadedAt ??= { x, y, z };
          unknown = true;
          continue;
        }
        if (kind !== "path") continue;
        if (net.size >= opts.maxNodes) {
          // Past the cap: this node and everything still queued were not looked round.
          net.capped = true;
          net.incomplete.add(key(c.x, c.y, c.z));
          for (let i = head; i < queue.length; i++) net.incomplete.add(key(queue[i].x, queue[i].y, queue[i].z));
          net.done = true;
          return net;
        }
        add(net, x, y, z);
        queue.push({ x, y, z });
        break;
      }
    }
    if (unknown) net.incomplete.add(key(c.x, c.y, c.z));
    if (++work % opts.perYield === 0) yield;
  }
  net.done = true;
  return net;
}

// Whether a feature at block position `pos` stands beside a reached path: a path block within
// `reach` blocks sideways, whose top is between two blocks below the feature and level with it.
export function besidePath(net, pos, reach) {
  for (let dx = -reach; dx <= reach; dx++) {
    for (let dz = -reach; dz <= reach; dz++) {
      const ys = net.columns.get(col(pos.x + dx, pos.z + dz));
      if (ys && ys.some((y) => y >= pos.y - 3 && y <= pos.y)) return true;
    }
  }
  return false;
}

// Linked status for a feature after a walk: true or false when the walk can tell, undefined when
// it can't (the walk was cut short by unloaded ground or the size cap and didn't reach it).
export function linkStatus(net, pos, reach) {
  if (!net?.done) return undefined;
  if (besidePath(net, pos, reach)) return true;
  return net.partial || net.capped ? undefined : false;
}
