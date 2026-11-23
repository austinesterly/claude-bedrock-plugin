// The named zookeepers' rules (0.1.361; Austin's spec, research/ZooCraft_Tycoon_Specialized_Zookeepers_Spec.md). Pure:
// plain values in, plain answers out. Stevie, The Boulder, Dory and Ping are residents (data/residents.js, `zookeeper`)
// who apply for work at a Resident Mailbox, and once hired do the keepers' work (staff/staff.js) in one of four jobs.
// His, word for word: the four jobs, the workroom sizes by how many are employed (3x3, 6x6, 12x12, 24x12, side lengths
// and not areas, either way round), efficiency by friendship (75% under 60, 80% from 60, 90% from 80, 100% at 100),
// a thank-you speech the first time friendship reaches 60, 80 and 100. Ours, his to change (numbered in
// playtest/NPC_batch3_suggestions.md): which keeper tasks belong to which job, what efficiency changes (his card:
// "How well": how full and how clean they leave things), that the best friendship any player has with a zookeeper
// counts, wages as the keepers had them.

/** The four jobs: their names, and the keeper tasks (staff/rules.js job kinds) each one does. */
export const JOBS = {
  sanitation: { name: "Trash Collector", short: "Sanitation", does: "empties Litter Bins, sweeps litter off the paths and rakes exhibits clean", kinds: ["bin", "sweep", "clean"], line: "jobSanitation" },
  animal_care: { name: "Feeder & Waterer", short: "Animal Care", does: "refills feeders and tops up water and lava troughs from the Staff Room's rations", kinds: ["feed", "water"], line: "jobAnimalCare" },
  enrichment: { name: "Enrichment Specialist", short: "Enrichment", does: "refills Hanging Food Baskets from the Staff Room's rations, so foragers stay busy", kinds: ["basket"], line: "jobEnrichment" },
  supply_management: { name: "Supply Stocker", short: "Supplies", does: "restocks Snack Stands and Gift Shops, buying wholesale with the park's Zoo Coins", kinds: ["stand", "shop"], line: "jobSupply" },
};
export const JOB_IDS = Object.keys(JOBS);

/** Whether a job does a keeper task of this kind. */
export function jobDoes(jobId, kind) {
  return Boolean(JOBS[jobId]?.kinds.includes(kind));
}

/** A zookeeper's efficiency (0.75 to 1) at `points` of friendship. `g` is balance.js zookeepers. */
export function efficiencyOf(points, g) {
  let e = g.efficiency[0];
  for (let i = 0; i < g.at.length; i++) if (points >= g.at[i]) e = g.efficiency[i];
  return e;
}

/** The next friendship step and what it gives, or undefined at the top: { at, efficiency }. */
export function nextStep(points, g) {
  for (let i = 0; i < g.at.length; i++) if (points < g.at[i]) return { at: g.at[i], efficiency: g.efficiency[i] };
  return undefined;
}

export const percent = (e) => `${Math.round(e * 100)}%`;

/** His example line: "Ping - Assigned: Enrichment - Friendship: 82/100 - Efficiency: 90% - Next: 100 for 100%". */
export function jobLine(name, jobId, points, g) {
  const next = nextStep(points, g);
  return `${name} - Assigned: ${JOBS[jobId]?.short ?? "no job yet"} - Friendship: ${Math.round(points)}/100 - Efficiency: ${percent(efficiencyOf(points, g))}${next ? ` - Next: ${next.at} for ${percent(next.efficiency)}` : ""}`;
}

/** The thank-you speeches now due: the steps (60, 80, 100) friendship has reached that this player hasn't heard. */
export function thanksDue(points, heard, g) {
  return g.thanksAt.filter((at) => points >= at && !(heard ?? []).includes(at));
}

/** How full a zookeeper leaves something that holds `cap`: all of it at 100%, three quarters at 75%. */
export function fillTo(cap, efficiency) {
  return Math.ceil(cap * efficiency - 1e-9);
}

/** How clean (0-100) a rake by a zookeeper leaves an exhibit that was at `was`, a full rake adding `rake`. */
export function cleanTo(was, rake, efficiency) {
  return Math.max(was, Math.min(Math.round(100 * efficiency), was + rake * efficiency));
}

/** The workroom a team of `n` needs: [long side, short side], or undefined for nobody. */
export function roomFor(n, g) {
  return n > 0 ? g.rooms[Math.min(n, g.rooms.length) - 1] : undefined;
}

export const sizeText = (size) => `${size[0]} x ${size[1]}`;

/**
 * How many zookeepers a room's floor plan holds. `cells` are the room's open blocks ({ x, z }, any height: the plan is
 * the room seen from above, so furniture that leaves air over or under it still counts); a size fits when a rectangle
 * that long and wide lies wholly inside the plan, either way round. `cube` says the room passed the Staff Room's own
 * test (3 x 3 x 3 of open space), which is what one zookeeper needs.
 */
export function roomHolds(cells, cube, g) {
  if (!cube) return 0;
  const SPAN = 1 << 20, OFF = 1 << 19;
  const key = (x, z) => (x + OFF) * SPAN + (z + OFF);
  const plan = new Map();
  for (const c of cells) plan.set(key(c.x, c.z), c);
  // run(x, z): how many cells in a row from (x, z) towards +x are in the plan
  const runs = new Map();
  const run = (x, z) => {
    const k = key(x, z);
    if (!plan.has(k)) return 0;
    let r = runs.get(k);
    if (r === undefined) {
      // walk to the row's end, then fill the whole row in
      let end = x;
      while (plan.has(key(end + 1, z))) end++;
      for (let i = end; i >= x; i--) runs.set(key(i, z), end - i + 1);
      r = end - x + 1;
    }
    return r;
  };
  const fits = (a, b) => {
    for (const c of plan.values()) {
      let ok = true;
      for (let j = 0; j < b && ok; j++) if (run(c.x, c.z + j) < a) ok = false;
      if (ok) return true;
    }
    return false;
  };
  let holds = 1;
  for (let n = 2; n <= g.rooms.length; n++) {
    const [a, b] = g.rooms[n - 1];
    if (fits(a, b) || (a !== b && fits(b, a))) holds = n;
    else break;
  }
  return holds;
}

/**
 * Whether an applicant can be taken on: the workroom must hold the team as it would be WITH them (his: "Evaluate the
 * requirement against the prospective hire count"). `holds` is the best working Staff Room's roomHolds; `team` those
 * employed now. Answers { ok } or { ok: false, why: "room" | "small" | "full", need: [a, b] }.
 */
export function canHire(team, holds, anyRoom, g) {
  if (team >= g.rooms.length) return { ok: false, why: "full" };
  const need = roomFor(team + 1, g);
  if (!anyRoom) return { ok: false, why: "room", need };
  if (holds < team + 1) return { ok: false, why: "small", need };
  return { ok: true };
}

/** Which of the team (ids in the order they were hired) the workroom has no room for: the latest hired first out. */
export function overRoom(teamIds, holds) {
  return teamIds.slice(Math.max(0, holds));
}

/** A zookeeper's day shift: from the time they'd leave home to the day shift's end (balance residents.work.dayTo). */
export function onDuty(t, leaveAt, dayTo) {
  return t >= leaveAt && t < dayTo;
}

/** When a Snack Stand or Gift Shop wants restocking: under `below` of what it holds. */
export function wantsStock(stock, cap, below) {
  return (stock ?? 0) < cap * below;
}

/** A restock by a zookeeper: how many to buy to bring `stock` up to what their efficiency reaches, 0 when already there. */
export function restockCount(stock, cap, efficiency) {
  return Math.max(0, fillTo(cap, efficiency) - (stock ?? 0));
}

/** 0.1.363: whether a week's wage is due on park day `day`, the last one counted from `from`: every `days` days. */
export function weekDue(from, day, days) {
  return day - from >= days;
}
