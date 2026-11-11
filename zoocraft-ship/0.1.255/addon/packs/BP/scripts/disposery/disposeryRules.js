// The two Disposeries (0.1.245; Austin's NPC Expansion spec, Terra's unlocks): the Portable Disposery (an item) and the
// Disposery (a block with a chest's screen in its own colour). Both delete items only when the player presses Dispose
// on the same page, which lists exactly what will go; closing, leaving or picking the block up loses nothing; nothing
// is paid or made. These are the rules both share. No engine calls here.

export const DISPOSERY = {
  block: "zoocraft:disposery",
  store: "zoocraft:disposery_store", // the block's 27 slots: an unseen entity inside it, which is what opens the chest screen
  // 0.1.255: the store's name tag, which is the chest screen's title (an unnamed entity's is "Unknown"): its own lang
  // key, shown translated, and what RP ui/chest_screen.json looks for to colour the screen.
  title: "entity.zoocraft:disposery_store.name",
  sweepTicks: 100, // how often stores near players are checked for their name (ones placed before 0.1.255)
  sweepRange: 48,
  portable: "zoocraft:portable_disposery",
  slots: 27,
  hitTicks: 60, // a second hit within this picks the block up
  listMax: 12, // kinds of item the Dispose page lists by name
};

/** One slot's item as the rules compare it, or undefined for an empty slot. `it` is { typeId, amount, nameTag, localizationKey }. */
export function slotKey(it) {
  return it ? `${it.typeId}|${it.amount}|${it.nameTag ?? ""}` : undefined;
}

/** A snapshot of the filled slots among `slots` (item or undefined by slot number), optionally only the numbers in `only`. */
export function snapshot(slots, only) {
  const out = [];
  slots.forEach((it, slot) => {
    if (!it || (only && !only.has(slot))) return;
    out.push({ slot, key: slotKey(it), typeId: it.typeId, amount: it.amount, name: it.nameTag || undefined, lkey: it.localizationKey });
  });
  return out;
}

/** Whether every slot of a snapshot still holds exactly what it held (so Dispose deletes only what the page listed). */
export function unchanged(snap, slots) {
  return snap.every((s) => slotKey(slots[s.slot]) === s.key);
}

/** A snapshot's items by kind, in the order first seen: [{ typeId, name, lkey, amount }]. */
export function totals(snap) {
  const by = new Map();
  for (const s of snap) {
    const k = `${s.typeId}|${s.name ?? ""}`;
    const t = by.get(k);
    if (t) t.amount += s.amount;
    else by.set(k, { typeId: s.typeId, name: s.name, lkey: s.lkey, amount: s.amount });
  }
  return [...by.values()];
}

/** How many items a snapshot holds in all. */
export const itemCount = (snap) => snap.reduce((n, s) => n + s.amount, 0);

/** Whether the Portable Disposery may hold this inventory slot: never itself, never a locked item. */
export function canHold(it) {
  return Boolean(it) && it.typeId !== DISPOSERY.portable && (it.lockMode ?? "none") === "none";
}

/** The held slots after a press on one: pressed again, it's taken back. */
export function toggled(held, slot) {
  const next = new Set(held);
  if (!next.delete(slot)) next.add(slot);
  return next;
}

/** The held slots that still hold something holdable (an item moved or used up meanwhile is no longer held). */
export function stillHeld(held, slots) {
  return new Set([...held].filter((slot) => canHold(slots[slot])));
}

/** Whether this hit is the second on the same Disposery in time: `last` is { key, tick } or undefined. */
export function secondHit(last, key, tick, ticks = DISPOSERY.hitTicks) {
  return Boolean(last) && last.key === key && tick - last.tick <= ticks && tick >= last.tick;
}

export const TEXT = {
  empty: "The Disposery is empty: put what you don't want inside, then sneak and use it to Dispose.",
  nothingHeld: "Nothing is held yet: press the things you don't want, then Dispose.",
  changed: "§eWhat's inside changed while you were deciding, so nothing was disposed of. Look again.",
  hint: "§7Disposery: put what you don't want inside, close it, then §fsneak and use§7 the Disposery to Dispose.",
  hitOnce: "§eHit the Disposery again to pick it up. What's inside drops out: nothing is lost.",
  ready: "§7The Disposery is ready again.",
  warn: "Dispose deletes these for good. They can't be got back, and nothing is paid for them.",
  done: (n) => `§aDisposed of ${n} item${n === 1 ? "" : "s"}.`,
  kept: "§7Nothing was disposed of.",
};
