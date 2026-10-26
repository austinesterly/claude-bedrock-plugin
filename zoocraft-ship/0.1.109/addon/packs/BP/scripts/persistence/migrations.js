// Schema migrations, keyed by the version they upgrade FROM. Each one takes a collection's
// records and returns the upgraded records. Add one here (and bump SCHEMA_VERSION in store.js)
// whenever a record's shape changes; never edit an old migration once it has shipped.
//
// Example for a future schema 2:
//   1: (collection, records) => {
//     if (collection === "animals") for (const a of Object.values(records)) a.traits ??= [];
//     return records;
//   },

/** @type {Record<number, (collection: string, records: object) => object>} */
export const MIGRATIONS = {
  // Schema 2 (0.1.109, several parks a world): the one park of a schema-1 world is "main", park number 1, named after
  // its owner; its exhibits and ledger entries say which park they belong to.
  1: (collection, records) => {
    if (collection === "park") {
      for (const p of Object.values(records)) {
        p.number ??= 1;
        p.name ??= `${p.members?.[p.ownerId]?.name ?? "The"}'s Zoo`;
      }
    }
    if (collection === "exhibits" || collection === "ledger") for (const r of Object.values(records)) r.parkId ??= "main";
    return records;
  },
};
