// Pure: how much room an exhibit has for a species, and what stops a species living there.

// Space that counts for a profile: usable land, plus water surface for amphibious animals, plus
// the lava surface for Lava Rays. For flyers, the floor with the profile's air above it (ex.aerial,
// the flight measurement, which an empty exhibit gets once a Void Perch floats inside it).
export function habitatArea(ex, profile) {
  if (profile.aerial) return ex.aerial?.usableArea ?? 0;
  if (profile.lava) return ex.usableArea + (ex.lavaCells ?? 0);
  return profile.amphibious ? ex.usableArea + (ex.waterCells ?? 0) : ex.usableArea;
}

// What an amphibious exhibit is missing (enough water, enough dry bank, a deep enough pool, enough
// shallows to wade in), or a
// lava pool (enough lava, deep enough to turn, a bank for Striders), or undefined when it suits the profile. Walking
// animals only need the space check.
export function habitatProblem(ex, profile, label) {
  if (profile.aerial) return aerialProblem(ex, profile, label);
  if (profile.lava) return lavaProblem(ex, profile, label);
  if (!profile.amphibious) return undefined;
  const area = habitatArea(ex, profile);
  if (area === 0) return undefined;
  const water = ex.waterCells ?? 0;
  const pct = (x) => Math.round(x * 100);
  if (water / area < profile.minWaterFraction) return `${label}s need more water: at least ${pct(profile.minWaterFraction)}% of the space (now ${pct(water / area)}%).`;
  if (ex.usableArea / area < profile.minDryFraction) return `${label}s need more dry bank: at least ${pct(profile.minDryFraction)}% of the space (now ${pct(ex.usableArea / area)}%).`;
  if ((ex.deepWaterCells ?? 0) < profile.minDeepWater) return `${label}s need a pool 2 blocks deep in at least ${profile.minDeepWater} spots (now ${ex.deepWaterCells ?? 0}).`;
  // Waders (flamingos): the shallows are the water cells with the ground right under them.
  const shallow = water - (ex.deepWaterCells ?? 0);
  if (shallow < (profile.minShallowWater ?? 0)) return `${label}s ${profile.shallowWhy ?? "wade in the shallows"}: water 1 block deep (the ground right under it) in at least ${profile.minShallowWater} spots (now ${shallow}).`;
  return undefined;
}

// Flyers (Void Rays): the air must not lead out (a roof), the floor needs the profile's headroom, and
// enough Void Perches must float up in the air (air under them) for the rays to rest on.
function aerialProblem(ex, profile, label) {
  const a = ex.aerial;
  if (!a) return `${label}s fly: float ${profile.minPerches} Void Perches up in the air inside the exhibit (air under them), roof it over, then measure it again with the Habitat Marker.`;
  if (!a.enclosed) return `${label}s fly: the exhibit needs a roof and closed walls. The air leads out${a.escape ? ` near ${a.escape.x} ${a.escape.y} ${a.escape.z}` : ""}.`;
  if (a.usableArea === 0) return `${label}s need ${profile.minHeight} blocks of air over the floor: raise the roof.`;
  if ((a.perchCount ?? 0) < profile.minPerches) return `${label}s need ${profile.minPerches} or more Void Perches floating up in the air to rest on (${a.perchCount ?? 0} now; each needs air under it and room above it).`;
  return undefined;
}

function lavaProblem(ex, profile, label) {
  const area = habitatArea(ex, profile);
  const lava = ex.lavaCells ?? 0;
  const pct = (x) => Math.round(x * 100);
  if (lava === 0) return `${label}s ${profile.onLava ? "walk across" : "live in"} lava: dig a lava pool inside the exhibit (fence it with walls, nether brick fence or glass, since lava sets wooden fences on fire), then measure it again with the Habitat Marker on the bank.`;
  if (lava / area < profile.minLavaFraction) return `${label}s need more lava: at least ${pct(profile.minLavaFraction)}% of the space (now ${pct(lava / area)}%).`;
  if (profile.minDryFraction && ex.usableArea / area < profile.minDryFraction) return `${label}s need a bank to rest on: at least ${pct(profile.minDryFraction)}% of the space dry ground (now ${pct(ex.usableArea / area)}%).`;
  if ((ex.deepLavaCells ?? 0) < profile.minDeepLava) return `${label}s need room to turn: lava 2 blocks deep in at least ${profile.minDeepLava} spots (now ${ex.deepLavaCells ?? 0}).`;
  return undefined;
}

// Why a catch can't happen yet, or undefined when some exhibit can take one more of this species.
// check(ex) returns { cap: { population, required, usable, fits }, problem }.
// `shares(ex)` says whether the species may move in with the ones living there (exhibits/mixing.js);
// by default only an exhibit of the same species counts.
export function noRoomReason(exhibits, species, check, shares = (ex) => ex.speciesId === species.id) {
  const usable = exhibits.filter((ex) => !ex.speciesId || shares(ex));
  const safe = usable.filter((ex) => ex.state === "ready" || ex.state === "occupied");
  if (
    safe.some((ex) => {
      const c = check(ex);
      return !c.problem && c.cap.fits;
    })
  )
    return undefined;
  if (!safe.length) {
    const draft = usable.find((ex) => ex.issues?.length);
    if (draft) return `${draft.name} isn't ready yet: ${draft.issues[0]}`;
    if (exhibits.length) return `Every exhibit already holds a species ${species.displayName}s don't share with. Build a new exhibit for a ${species.displayName}.`;
    return `Build an exhibit first: put a Habitat Marker on an Exhibit Controller, then on the ground inside a fenced pen.`;
  }
  const ex = safe[0];
  const c = check(ex);
  if (c.problem) return `${ex.name} isn't right for a ${species.displayName} yet. ${c.problem}`;
  return `${ex.name} has no room for another ${species.displayName}: ${c.cap.population} need ${c.cap.required} usable blocks and it has ${c.cap.usable}. Make the pen bigger, then measure it again with the Habitat Marker.`;
}
