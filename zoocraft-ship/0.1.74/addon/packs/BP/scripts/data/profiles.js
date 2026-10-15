// Habitat sizing profiles (spec section 6) and exhibit registration limits.
// Area required = baseArea + extraArea * max(0, population - 1), counted on usable reachable cells.

export const HABITAT_PROFILES = {
  small_terrestrial: { baseArea: 36, extraArea: 12, minHeight: 3 },
  medium_terrestrial: { baseArea: 100, extraArea: 30, minHeight: 4 },
  large_terrestrial: { baseArea: 256, extraArea: 80, minHeight: 6 },
  // Giraffes (spec section 6: "giraffes need greater shelter clearance"): 7 blocks of headroom.
  tall_terrestrial: { baseArea: 180, extraArea: 60, minHeight: 7 },
  // Amphibious profiles count water surface as space, and need enough water, dry bank and depth.
  small_wetland: { baseArea: 64, extraArea: 20, minHeight: 4, amphibious: true, minWaterFraction: 0.35, minDryFraction: 0.25, minDeepWater: 4 },
  // Capybaras: mostly grazing bank with a pool to wade and swim in; the pool can be shallow.
  medium_wetland: { baseArea: 96, extraArea: 24, minHeight: 4, amphibious: true, minWaterFraction: 0.2, minDryFraction: 0.45, minDeepWater: 2 },
  // Penguins: a cold pool to dive in and a dry bank where the colony stands together.
  small_polar: { baseArea: 64, extraArea: 12, minHeight: 4, amphibious: true, minWaterFraction: 0.4, minDryFraction: 0.3, minDeepWater: 4 },
  // Lava Rays (M4, spec 5.3): a lava pool to glide in, mostly lava, deep enough to turn, with a
  // bank for keepers and carriers. Space counts the bank and the lava surface.
  lava_pool: { baseArea: 80, extraArea: 32, minHeight: 3, lava: true, minLavaFraction: 0.6, minDeepLava: 8 },
  // Striders (M4, spec 5.1): a lava pool to walk across (any depth) and a bank with warm magma blocks
  // to rest on. Space counts the bank and the lava surface; they're 2 blocks tall.
  lava_shore: { baseArea: 64, extraArea: 24, minHeight: 3, lava: true, onLava: true, minLavaFraction: 0.4, minDeepLava: 0, minDryFraction: 0.2 },
  large_aquatic: { baseArea: 144, extraArea: 48, minHeight: 5 },
  small_aviary: { baseArea: 64, extraArea: 16, minHeight: 6 },
  // Void Rays (M5, spec 5.4): a roofed exhibit with air over the floor to glide in, and Void Perches
  // floating up in the air to rest on. Measured by a flood through the air (geometry.js floodAerial);
  // space counts the floor with that much air above it. Giant since 0.1.66 (Austin's idea 5: "the
  // giant ray's exhibit has to be roofed in and big enough to suit it"): 14 blocks of air and a
  // 20 x 20 floor for the first ray.
  large_aerial: { baseArea: 400, extraArea: 120, minHeight: 14, aerial: true, minPerches: 2 },
  // Flamingos (0.1.72, spec 5.2 "Flock wading | Shallow water and mud nesting"): they feed wading, so
  // the water has to be 1 block deep (the ground right under it) in enough spots. Deeper water they
  // swim in, and don't need. Space counts the bank and the water surface.
  wading: { baseArea: 64, extraArea: 12, minHeight: 4, amphibious: true, minWaterFraction: 0.3, minDryFraction: 0.25, minDeepWater: 0, minShallowWater: 16 },
  // Zebras (0.1.74, spec 5.2 "Coordinated herd movement | Savanna mixing and broad grazing"): a herd
  // needs room to graze spread out, walk off in single file and run from a fright, more than deer
  // and less than elephants. The grass to graze is its own rule (species.graze).
  grassland: { baseArea: 160, extraArea: 48, minHeight: 4 },
};

// The most air any flying species wants over the floor: an empty exhibit is measured for flight with this.
export const AERIAL_HEIGHT = Math.max(...Object.values(HABITAT_PROFILES).filter((p) => p.aerial).map((p) => p.minHeight));

// First-version limit: 64 x 64 horizontal, 32 high, around the seed point.
export const EXHIBIT_LIMITS = {
  halfWidth: 32,
  halfHeight: 16,
  maxDrop: 3, // a ledge deeper than this is not walkable
  cellsPerYield: 48, // flood-fill work per tick slice
};

export function requiredArea(profile, population) {
  return profile.baseArea + profile.extraArea * Math.max(0, population - 1);
}
