// Park roles and sandbox mode (spec sections 2 and 19; M6 Polish part 2, 0.1.58). Pure rules: park.js
// and the menus apply them.
// Roles: owner, manager, keeper, visitor. The owner controls settings and members; managers build and
// spend shared coins; keepers care for the animals; visitors look around and can't alter records,
// carriers or the balance.
// Sandbox mode is a park setting the owner turns on: nothing costs Zoo Coins, every research project
// can be done at once, and keeper wages are free. It's remembered on the park (sandboxUsed), and the
// Park Ledger says so, so a park built with it is never mistaken for one earned the normal way.

export const ROLE_RANK = { visitor: 0, keeper: 1, manager: 2, owner: 3 };
// Minimum role per action.
export const NEEDS_ROLE = { care: "keeper", build: "manager", spend: "manager", settings: "owner", members: "owner" };
export const ROLE_LABEL = { visitor: "Visitor", keeper: "Keeper", manager: "Manager", owner: "Owner" };
// What each role can do, in the words the menus use.
export const ROLE_TEXT = {
  visitor: "can look around, read the Park Ledger, clipboards and the Field Journal, and watch the animals; can't change animals, carriers, equipment or coins",
  keeper: "cares for the animals: feeders, troughs and toys, carriers and recovery holding, breeding, releases, and the Staff Room's stock",
  manager: "builds and spends as well: exhibits and markers, the entrance gate, the supply shop, research, hiring keepers, shop and stand prices",
  owner: "does everything, and sets members' roles and the park settings",
};
// The roles the owner can give (the park has one owner, changed by handing the park over).
export const GIVABLE_ROLES = ["visitor", "keeper", "manager"];

export function allowed(role, action) {
  const need = NEEDS_ROLE[action];
  if (!need) return false;
  return (ROLE_RANK[role] ?? 0) >= ROLE_RANK[need];
}

// Why an action was refused, and who to ask.
export function denyLine(action, ownerName) {
  const role = NEEDS_ROLE[action] ?? "owner";
  const ask = ownerName ? ` §7Ask ${ownerName}, the park owner, for a role (Park Ledger, Members).` : "";
  return `§cOnly a park ${role} or above can do that.${ask}`;
}

// The line a player sees when they join a world with a park: their role and what it lets them do.
export function welcomeText(role, settings = {}) {
  const r = ROLE_LABEL[role] ? role : "visitor";
  const sandbox = settings.sandbox ? " §dSandbox mode is on." : "";
  return `§6Welcome to the park. §fYou're ${r === "owner" ? "the" : "a"} ${ROLE_LABEL[r].toLowerCase()}: ${ROLE_TEXT[r]}.${sandbox}`;
}

/**
 * The Members page rows: everyone who has joined this world, except the owner, with their role,
 * online first, then by rank, then by name. `players` are the "players" records ({ id, name });
 * members the park knows but never saw join (older worlds) are listed too.
 * @param {{ ownerId: string, members: Record<string, { role: string, name: string }> }} park
 * @param {{ id: string, name?: string }[]} players
 * @param {Iterable<string>} onlineIds
 */
export function memberRows(park, players, onlineIds) {
  const online = new Set(onlineIds);
  const rows = new Map();
  for (const p of players) if (p.id !== park.ownerId && p.name) rows.set(p.id, { id: p.id, name: p.name, role: park.members[p.id]?.role ?? "visitor", online: online.has(p.id) });
  for (const [id, m] of Object.entries(park.members)) if (id !== park.ownerId && !rows.has(id)) rows.set(id, { id, name: m.name, role: m.role, online: online.has(id) });
  return [...rows.values()].sort((a, b) => Number(b.online) - Number(a.online) || ROLE_RANK[b.role] - ROLE_RANK[a.role] || a.name.localeCompare(b.name));
}

// Can the park be handed to this player? { ok, reason }.
export function canHandOver(park, targetId) {
  if (targetId === park.ownerId) return { ok: false, reason: "They already own the park." };
  if (!park.members[targetId]) return { ok: false, reason: "Make them a keeper or manager first; only a member can take the park over." };
  return { ok: true };
}

// Hand the park over: the old owner stays on as a manager. Mutates and returns the park record.
export function handOver(park, targetId, targetName, oldOwnerName) {
  const check = canHandOver(park, targetId);
  if (!check.ok) return check;
  park.members[park.ownerId] = { role: "manager", name: oldOwnerName ?? park.members[park.ownerId]?.name ?? "" };
  park.ownerId = targetId;
  park.members[targetId] = { role: "owner", name: targetName ?? park.members[targetId]?.name ?? "" };
  return { ok: true, park };
}

// --- sandbox mode ---

export const SANDBOX_TEXT = [
  "Unlimited Zoo Coins: nothing costs coins (the ledger still lists what you take, at 0)",
  "Free research: every project at the Research Desk can be done at once, without parts or Field Journal pages",
  "Free keepers: wages are never charged",
];

export function sandboxOn(park) {
  return Boolean(park?.settings?.sandbox);
}

// The balance as the menus show it.
export function balanceText(park) {
  return sandboxOn(park) ? `§dunlimited §8(sandbox; ${park.balance} banked)` : `§e${park.balance}`;
}

// The sidebar's coins row label.
export function coinsLabel(park) {
  return sandboxOn(park) ? "§dZoo Coins (sandbox)" : "§eZoo Coins";
}

// The park settings page body: what each toggle does, and whether sandbox was ever used here.
export function settingsText(park) {
  const s = park.settings ?? {};
  return [
    `§fSandbox mode: ${s.sandbox ? "§don" : "§7off"}`,
    ...SANDBOX_TEXT.map((t) => `§7- ${t}`),
    "§7Turning it on is remembered: the Park Ledger says this park has used sandbox mode.",
    "",
    `§fPeaceful care: ${s.peacefulCare ? "§aon" : "§7off"}`,
    "§7- Animals' needs don't drop (they still eat, and keepers still work).",
    "",
    park.sandboxUsed ? "§dThis park has used sandbox mode." : "§7This park has never used sandbox mode.",
  ].join("\n");
}

// The Park Ledger's line about the mode (empty when the park never used it).
export function sandboxLine(park) {
  if (sandboxOn(park)) return "§dSandbox mode: on §8(unlimited coins, free research and wages)";
  if (park?.sandboxUsed) return "§7Sandbox mode: off §8(this park has used it)";
  return "";
}

