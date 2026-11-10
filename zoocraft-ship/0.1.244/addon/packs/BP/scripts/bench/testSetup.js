import { world, BlockPermutation } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { BLOCKS } from "../data/items.js";
import { RESIDENTS, residentById } from "../data/residents.js";
import { posKey } from "../core/ids.js";
import { info, log } from "../core/log.js";
import { message } from "../platform/mc.js";
import { fenceSummary } from "../park/fence.js";
import { getHome, homePlaced, homeWay, homeWorks, setHomeAvailable, queueHomeCheck } from "../residents/homes.js";
import { HOME_TEXT } from "../residents/homeRules.js";
import { moveIn, getResident } from "../residents/residents.js";
import { markUnlocked } from "../residents/people.js";
import { anchorPlaced, assignWorker, getSite, recheckSite, siteBlockPlaced } from "../residents/work.js";
import { siteText } from "../residents/workRules.js";
import { setPoints } from "../residents/bonds.js";
import { runBuild, unresolved, waitTicks } from "./benchmark.js";
import { zooPlanFor, ZOO_MODE } from "./zooBuild.js";
import { zooBuiltText, ZOO_SIZE } from "./zooPlan.js";
import { planStreet, streetBuiltText } from "./streetPlan.js";

// /zoocraft:testsetup [friends] (0.1.227, Austin: "Can you make a zoocraft command that sets everything up for me to
// test on a superflat world"): the test zoo of /zoocraft:build (bench/zooBuild.js) and, south of its Park Entrance Gate,
// the residents' street (bench/streetPlan.js), built by the same job (bench/benchmark.js runBuild). Once the zoo is open
// the street is set up the way a player would: each Resident Mailbox put in its house and owned by the runner, each
// Work Anchor owned by them, each resident (every one unlocked as the build starts) moved into their own house (by name:
// the mailboxes' Move-in is OFF until then, so nobody moves into another's house first), Dave, Paola and Ron given their work sites, and with
// `friends` every resident the runner's Friend. Script-placed blocks fire no player-place event, so this calls what
// that event would (residents/homes.js homePlaced, residents/work.js anchorPlaced), and the woodlot is told of every
// sapling put in it and that its grown trees came from saplings of its own (residents/work.js siteBlockPlaced, as for a
// sapling a player puts down): a sapling that grows while the zoo builds, before the woodlot's first look, is still one.

const WAIT_SECONDS = 60; // for the homes' checks (the house measured, its path to the gate walked), and the sites'

/** Start the test setup round the player. Returns why it can't, or undefined once started. */
export function startTestSetup(player, friends = false) {
  const r = zooPlanFor(player, ZOO_SIZE.default);
  if (r.why) return r.why;
  const { G, park } = r;
  /** @type {any} */
  const plan = r.plan;
  const street = planStreet(plan.entrance, G);
  const bad = unresolved(street);
  if (bad) {
    log(`test setup: ${bad}`);
    return `The test setup can't build: ${bad}. Nothing was changed.`;
  }
  plan.ops.push(...street.ops);
  // The ground the build loads, checks is flat and builds on: the zoo's ring and the street.
  plan.bbox = { min: { x: Math.min(plan.bbox.min.x, street.box.min.x), z: Math.min(plan.bbox.min.z, street.box.min.z) }, max: { x: Math.max(plan.bbox.max.x, street.box.max.x), z: Math.max(plan.bbox.max.z, street.box.max.z) } };
  plan.view = street.view; // the runner ends up on the street by the gate, looking down it
  plan.facing = street.facing;
  plan.street = street;
  const names = Object.fromEntries(RESIDENTS.map((x) => [x.id, x.name]));
  const mode = {
    ...ZOO_MODE,
    tag: "Test setup",
    starting: (p) => `§6Test setup: §fbuilding the test zoo (${p.exhibits.length} exhibits inside a ${p.size} x ${p.size} Aluminum Fence round you) and south of its gate a street of homes for the ${street.homes.length} residents, with Dave's mine, Paola's woodlot, Ron's field and Terra's research site. Stay where you are.`,
    after: (who, p, d) => setUp(who, p, d, friends),
    done: (p, c, got) => [...zooBuiltText(p, c, p.center, fenceSummary()), ...streetBuiltText(got ?? { moved: [], problems: ["§cThe street wasn't set up."], friends, sites: 0 }, names)],
  };
  const why = runBuild(player, plan, G, mode, park);
  // Every resident unlocked as the build starts, so nobody is announced while the zoo fills ("can move in now! Give
  // them a home..." as each one's zoo goal is met): no mailbox stands yet, and the street's go in with Move-in OFF, so
  // nobody moves anywhere until each is moved into their own house.
  if (!why) for (const res of RESIDENTS) markUnlocked(res.id, world.getDay());
  return why;
}

// The street set up once its blocks stand and the zoo is open. A job; returns what streetBuiltText says.
function* setUp(player, plan, d, friends) {
  const st = plan.street;
  const say = (text) => player.isValid && message(player, text);
  say("§6Test setup: §fthe zoo is open. Moving the residents in...");
  yield* waitTicks(3);
  // The signs' words (a sign's text is set once the sign stands, as starter/site.js does).
  for (const s of st.signs) {
    try {
      const sign = d.getBlock(s.pos)?.getComponent("minecraft:sign");
      sign?.setText(s.text);
      sign?.setWaxed(true);
    } catch (error) {
      log(`test setup: the sign at ${s.pos.x} ${s.pos.y} ${s.pos.z}: ${error}`);
    }
  }
  // The mailboxes, put in now that their houses stand, each owned by the runner, its Move-in OFF for now.
  for (const h of st.homes) {
    h.id = posKey(d.id, h.mailbox);
    try {
      const b = d.getBlock(h.mailbox);
      if (!b) continue;
      b.setPermutation(BlockPermutation.resolve(BLOCKS.residentMailbox, h.mailboxStates));
      homePlaced(player, b, true);
      setHomeAvailable(h.id, false);
    } catch (error) {
      log(`test setup: ${h.res}'s mailbox: ${error}`);
    }
  }
  for (const s of st.sites) {
    s.id = posKey(d.id, s.anchor);
    const b = d.getBlock(s.anchor);
    if (b?.typeId === BLOCKS.workAnchor) anchorPlaced(player, b, true);
  }
  // Every home checked (the house measured, the path from its door to the gate walked); asked again every 5 seconds.
  const homeOk = (h) => {
    const rec = getHome(h.id);
    return Boolean(rec?.door && homeWorks(rec) && homeWay(h.id));
  };
  for (let t = 0; t < WAIT_SECONDS && !st.homes.every(homeOk); t++) {
    if (t % 5 === 4) for (const h of st.homes) if (!homeOk(h)) queueHomeCheck(h.id);
    yield* waitTicks(20);
  }
  // Each into their own house; then Move-in back ON, as a mailbox is when it's put down.
  const moved = [];
  const problems = [];
  for (const h of st.homes) {
    const res = residentById(h.res);
    const rec = getHome(h.id);
    if (getResident(h.res)) problems.push(`§e${res.name} already lives somewhere in this world, so their house on the street is empty.`);
    else if (homeOk(h) && moveIn(rec, h.res)) moved.push(h.res);
    else problems.push(`§e${res.name}'s house at ${h.mailbox.x} ${h.mailbox.y} ${h.mailbox.z}: ${rec ? HOME_TEXT[rec.problem] ?? "it isn't ready yet: use its mailbox to see why." : "its mailbox is missing."}`);
    if (rec) setHomeAvailable(h.id, true);
  }
  // The workers, and friends.
  for (const s of st.sites) if (moved.includes(s.worker)) assignWorker(s.id, s.worker);
  if (friends) for (const id of moved) setPoints(id, player, BALANCE.residents.bonds.tiers[2]);
  // Each site measured with its worker's path from their door to its gate; asked again every 10 seconds.
  const siteOk = (s) => {
    const rec = getSite(s.id);
    return Boolean(rec && rec.worker === s.worker && !rec.problem);
  };
  const working = st.sites.filter((s) => moved.includes(s.worker));
  for (let t = 0; t < WAIT_SECONDS && !working.every(siteOk); t++) {
    if (t % 10 === 9) for (const s of working) if (!siteOk(s)) recheckSite(s.id);
    yield* waitTicks(20);
  }
  for (const s of working) {
    if (siteOk(s)) continue;
    const who = residentById(s.worker)?.name;
    problems.push(`§e${who}'s ${s.kind} at ${s.anchor.x} ${s.anchor.y} ${s.anchor.z}: ${siteText(getSite(s.id)?.problem ?? "noWorker", { who, minCells: BALANCE.residents.work.minCells })}`);
  }
  const sites = working.filter(siteOk).length;
  // The woodlot's sapling spots (its grown trees' too), each told a sapling was put there, and the woodlot measured
  // again until it has them all and its trees (asked again every 5 seconds: a check already running when they're told
  // keeps the saplings it read first).
  const wood = working.find((s) => s.kind === "woodlot" && siteOk(s));
  const tracked = () => new Set((getSite(wood.id)?.saplings ?? []).map((p) => posKey(d.id, p)));
  const ready = () => (getSite(wood.id)?.work?.trees ?? 0) >= st.trees.length && st.spots.every((x) => tracked().has(posKey(d.id, x.pos)));
  let trees = 0;
  if (wood && st.spots.length) {
    for (let t = 0; t < WAIT_SECONDS / 2 && !ready(); t++) {
      if (t % 5 === 0) {
        const have = tracked();
        for (const x of st.spots) if (!have.has(posKey(d.id, x.pos))) siteBlockPlaced(d.id, x.pos, x.sapling);
        recheckSite(wood.id);
      }
      yield* waitTicks(20);
    }
    // The ones she can cut now: a dark oak grown while the zoo built waits for an Expert.
    const w = getSite(wood.id)?.work;
    trees = (w?.trees ?? 0) - (w?.big ?? 0);
    if (!ready()) problems.push(`§ePaola's woodlot: ${w?.trees ?? 0} of its ${st.trees.length} trees are ready to cut; use its Work Anchor to see why.`);
  }
  info(`test setup: ${moved.length} of ${st.homes.length} residents moved in; work sites: ${st.sites.map((s) => `${s.kind} ${getSite(s.id)?.problem ?? "works"}`).join(", ")}; the woodlot: ${trees} trees an Apprentice can cut (${st.trees.length} grown by the setup)${friends ? "; friends" : ""}`);
  return { moved, problems, friends, sites, trees };
}
