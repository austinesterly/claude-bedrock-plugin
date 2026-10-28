import { Store } from "./store.js";
import { MIGRATIONS } from "./migrations.js";
import { worldBackend } from "../platform/mc.js";
import { log } from "../core/log.js";

// The one store every module shares. Collections: park, animals, exhibits, equipment, transfers,
// ledger, players, paths, fence, bank, selftest, trench and places (0.1.130, world/). Only the owning module writes each
// collection.
export const db = new Store(worldBackend, { migrations: MIGRATIONS, log });
