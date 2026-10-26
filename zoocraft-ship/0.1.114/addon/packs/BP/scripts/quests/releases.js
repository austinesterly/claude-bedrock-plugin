import { db } from "../persistence/db.js";
import { parkRecordId, inScope, getPark } from "../park/park.js";

// The "releases" collection (owned by quests/conservation.js, read here by anyone): one record per
// animal returned to the wild (its unique completion record, spec section 15) and one summary
// record with the running totals, so pruning old records never loses a count.

export const RELEASES = "releases";
const SUMMARY = "summary";

// 0.1.114: the scope's park's releases (a record from before says nothing and is the first park's); one summary a
// park ("summary" for the world's first park, "summary:<park id>" after; park/park.js parkRecordId).
export function allReleases() {
  return db.all(RELEASES).filter((r) => !r.id.startsWith(SUMMARY) && inScope(r));
}

export function releaseSummary() {
  const id = parkRecordId(SUMMARY);
  return db.get(RELEASES, id) ?? { id, count: 0, zooBorn: 0, species: {}, lastDay: {} };
}

export function releaseCount() {
  return releaseSummary().count;
}

export function addRelease(rec, keep = 100) {
  rec.parkId ??= getPark()?.id;
  db.put(RELEASES, rec);
  const s = releaseSummary();
  s.count += 1;
  if (rec.zooBorn) s.zooBorn += 1;
  s.species[rec.speciesId] = (s.species[rec.speciesId] ?? 0) + 1;
  s.lastDay[rec.speciesId] = rec.day;
  db.put(RELEASES, s);
  const old = allReleases().sort((a, b) => a.at - b.at);
  for (const r of old.slice(0, Math.max(0, old.length - keep))) db.remove(RELEASES, r.id);
}
