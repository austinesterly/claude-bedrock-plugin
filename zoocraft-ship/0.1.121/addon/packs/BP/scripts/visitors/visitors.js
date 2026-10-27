import { db } from "../persistence/db.js";
import { on } from "../core/events.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { getPark, recordVisitors, rollDay, setVisitorCarry } from "../park/park.js";
import { earn } from "../economy/economy.js";
import { allExhibits } from "../exhibits/exhibits.js";
import { animalsIn, welfare } from "../animals/animals.js";
import { NEED_KEYS } from "../animals/welfare.js";
import { dailyDemand, arrivals, parkRating, fairPrice, valueScore, priceDemand, viewingScore, varietyFactor, dominantComplaint, complaintText } from "./demand.js";
import { admission, checkAllPoints, checkPointsDue, viewedExhibits } from "./points.js";
import { checkAllServices, checkServicesDue, serviceStep, servicesNow } from "./services.js";
import { setGuestDemand } from "./guests.js";
import { checkShops, giftStep } from "./giftShop.js";
import { tourStep } from "./tours.js";
import { rideStep } from "./rides.js";
import { pathsAreaChanged } from "./network.js";
import { onlinePlayers, message } from "../platform/mc.js";
import { guestFactor } from "../research/research.js";

// Visitors as numbers: guests arrive while the park is open, pay admission once each, and how many
// come depends on the park rating and the ticket price. Viewing Points decide how well guests can
// see the animals; stands, benches and bins along the paths are the services (services.js); the
// few guests you can see walking about are cosmetic (guests.js).

export function ratingNow() {
  const exhibits = allExhibits();
  const occupied = exhibits.filter((ex) => ex.animalIds.length);
  const speciesOn = (ex) => ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : []); // every species in a shared exhibit counts (0.1.61)
  const isTank = (ex) => speciesOn(ex).length > 0 && speciesOn(ex).every((id) => SPECIES[id]?.school);
  const endOnShow = occupied.some((ex) => speciesOn(ex).some((id) => SPECIES[id]?.origin === "custom_end")); // the End Guidebook's draw
  const animals = occupied.flatMap((ex) => animalsIn(ex));
  const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const welfareAvg = avg(animals.map(welfare));
  const anyCritical = animals.some((a) => NEED_KEYS.some((k) => a.needs[k] < BALANCE.needs.bands.urgent));
  const unsafe = exhibits.filter((ex) => ex.state === "unsafe").length;
  const unfed = occupied.filter((ex) => !ex.feederIds.length).length;
  const operations = Math.max(0, 100 - 40 * unsafe - 20 * unfed);
  const species = new Set(occupied.flatMap(speciesOn)).size;
  const park = getPark();
  const price = admission();
  // Fairness is judged against the stars the park already has, so the price can't chase itself.
  const fair = fairPrice(park?.rating.stars ?? 0, BALANCE);
  const viewed = viewedExhibits();
  // Services are judged against the guests the park drew at its current stars (like the price).
  const services = servicesNow(dailyDemand({ stars: park?.rating.stars ?? 0, occupiedExhibits: occupied.length }, BALANCE) * guestFactor(endOnShow));
  const factors = {
    // A tank (every resident a school) with several kinds in it draws more (0.1.121, varietyFactor).
    viewing: viewingScore(occupied.map((ex) => ({ welfare: avg(animalsIn(ex).map(welfare)), viewed: viewed.has(ex.id), variety: isTank(ex) ? varietyFactor(speciesOn(ex).length, BALANCE) : 1 })), BALANCE),
    services: services.score,
    cleanliness: Math.round(avg(occupied.map((ex) => ex.cleanliness ?? 100))),
    value: valueScore(price, fair, BALANCE),
  };
  const r = parkRating({ welfare: welfareAvg, ...factors, speciesCount: species, operations, anyCritical }, BALANCE);
  const complaint = occupied.length ? dominantComplaint(factors, BALANCE) : undefined;
  const complaintLine = complaint ? complaintText(complaint, services.detail) : undefined;
  const unviewed = occupied.filter((ex) => !viewed.has(ex.id)).map((ex) => ex.name);
  return { ...r, factors, services, complaint, complaintLine, price, fair, unviewed, occupiedExhibits: occupied.filter((ex) => ex.state === "occupied").length, endOnShow, park };
}

function visitorStep({ seconds, parkTime, skipped }) {
  const park = getPark();
  if (!park) return;
  // A skip passes no park seconds for the checks due each second: all of them now, as before 0.1.96.
  if (skipped) {
    checkAllPoints();
    checkAllServices();
  }
  checkShops();
  const r = ratingNow();
  recordVisitors({ rating: { stars: r.stars, score: r.score, satisfaction: r.satisfaction } });
  if (!park.open || !park.entrance) return setGuestDemand(0);
  // The well-furnished park's bonus (0.1.99, services.js servicesNow) on top: bins and benches near nearly all the paths.
  const demand = dailyDemand({ stars: r.stars, occupiedExhibits: r.occupiedExhibits }, BALANCE) * priceDemand(r.price, r.fair, BALANCE) * guestFactor(r.endOnShow) * (1 + (r.services.bonus ?? 0));
  setGuestDemand(demand);
  const { guests, carry } = arrivals(park.visitorCarry ?? 0, demand, seconds, BALANCE);
  setVisitorCarry(carry);
  if (guests <= 0) return;
  const stepKey = Math.floor(parkTime / seconds);
  const amount = guests * r.price;
  if (amount <= 0) recordVisitors({ guests }); // free entry: guests come, nothing to pay
  else {
    // One operation per visitor step: replaying the step can't pay twice (AC-10).
    const res = earn(amount, `Admission: ${guests} guest${guests === 1 ? "" : "s"} at ${r.price}`, `admission:${stepKey}`);
    if (res.ok && !res.duplicate) recordVisitors({ guests, revenue: amount });
  }
  serviceStep(guests, stepKey);
  giftStep(guests, stepKey);
  tourStep(guests, stepKey);
  rideStep(guests, stepKey);
}

function parkDay({ day }) {
  const park = getPark();
  if (!park) return;
  rollDay(day);
  db.flush();
  for (const p of onlinePlayers()) {
    if (!park.members[p.id]) continue;
    message(p, `§6Park day ${day + 1} begins. §fYesterday: ${park.lastDay.guests} guests, ${park.lastDay.revenue} coins. Rating ${park.rating.stars} stars.`);
  }
}

export function initVisitors() {
  on("parkSecond", ({ parkTime }) => {
    checkPointsDue(parkTime, BALANCE.clock.visitorEvery);
    checkServicesDue(parkTime, BALANCE.clock.visitorEvery);
  });
  on("visitorStep", visitorStep);
  on("parkDay", parkDay);
  on("parkAreaChanged", pathsAreaChanged); // the fence moved the park's edge (0.1.101): the paths walk again
}
