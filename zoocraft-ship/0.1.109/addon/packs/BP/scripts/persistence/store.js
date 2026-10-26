// Record store (spec sections 19-20). Pure: the game backend is passed in, so tests run in Node.
//
// Each collection ("park", "animals", "exhibits", ...) is one JSON document
//   { schemaVersion, records: { [id]: record } }
// split into chunks of world dynamic properties:
//   zoocraft:db:<collection>:n   number of chunks
//   zoocraft:db:<collection>:<i> chunk i
// Records are cached in memory. put() marks a collection dirty; checkpoint() writes dirty ones
// (bounded, every few seconds) and flush() writes at once for critical commits (transport, money).
// A collection that can't be parsed is moved to a quarantine key and never silently deleted.

export const SCHEMA_VERSION = 2; // 2: 0.1.109, several parks a world (persistence/migrations.js)
const PREFIX = "zoocraft:db:";
// Dynamic property strings cap at 32,767 bytes; one character can take up to 4 bytes in UTF-8.
const CHUNK_CHARS = 8000;

export class Store {
  /**
   * @param {{ get(key: string): any, set(key: string, value: any): void, now?(): number }} backend
   * @param {{ migrations?: Record<number, (collection: string, records: object) => object>, log?: (msg: string) => void }} [options]
   */
  constructor(backend, options = {}) {
    this.backend = backend;
    this.migrations = options.migrations ?? {};
    this.log = options.log ?? (() => {});
    this.cols = new Map(); // name -> Map<id, record>
    this.dirty = new Set();
  }

  col(name) {
    let map = this.cols.get(name);
    if (!map) {
      map = this.load(name);
      this.cols.set(name, map);
    }
    return map;
  }

  get(name, id) {
    return this.col(name).get(id);
  }

  all(name) {
    return [...this.col(name).values()];
  }

  put(name, record) {
    if (!record || typeof record.id !== "string") throw new Error(`record in ${name} needs a string id`);
    record.revision = (record.revision ?? 0) + 1;
    this.col(name).set(record.id, record);
    this.dirty.add(name);
    return record;
  }

  remove(name, id) {
    if (this.col(name).delete(id)) this.dirty.add(name);
  }

  // Write every dirty collection now. Call after a commit that must survive a crash.
  flush(name) {
    const names = name ? [name] : [...this.dirty];
    for (const n of names) {
      if (!this.dirty.has(n)) continue;
      this.write(n);
      this.dirty.delete(n);
    }
  }

  checkpoint() {
    this.flush();
  }

  // --- internals ---

  load(name) {
    const map = new Map();
    const n = this.backend.get(`${PREFIX}${name}:n`);
    if (typeof n !== "number" || n <= 0) return map;
    let text = "";
    for (let i = 0; i < n; i++) text += this.backend.get(`${PREFIX}${name}:${i}`) ?? "";
    let doc;
    try {
      doc = JSON.parse(text);
    } catch (error) {
      this.quarantine(name, text, `unreadable JSON: ${error}`);
      return map;
    }
    let version = doc.schemaVersion ?? 1;
    let records = doc.records ?? {};
    if (version > SCHEMA_VERSION) {
      // Saved by a newer add-on version: copy it to quarantine and run with an empty collection.
      this.quarantine(name, text, `schema ${version} is newer than ${SCHEMA_VERSION}`);
      return map;
    }
    while (version < SCHEMA_VERSION) {
      const step = this.migrations[version];
      if (!step) {
        this.quarantine(name, text, `no migration from schema ${version}`);
        return map;
      }
      records = step(name, records);
      version++;
      this.dirty.add(name);
      this.log(`migrated ${name} to schema ${version}`);
    }
    for (const [id, record] of Object.entries(records)) map.set(id, record);
    return map;
  }

  write(name) {
    const records = Object.fromEntries(this.col(name));
    const text = JSON.stringify({ schemaVersion: SCHEMA_VERSION, records });
    const n = Math.max(1, Math.ceil(text.length / CHUNK_CHARS));
    const oldN = this.backend.get(`${PREFIX}${name}:n`);
    for (let i = 0; i < n; i++) this.backend.set(`${PREFIX}${name}:${i}`, text.slice(i * CHUNK_CHARS, (i + 1) * CHUNK_CHARS));
    if (typeof oldN === "number") for (let i = n; i < oldN; i++) this.backend.set(`${PREFIX}${name}:${i}`, undefined);
    // Count last: a crash mid-write leaves the old count pointing at complete old-or-new chunks.
    this.backend.set(`${PREFIX}${name}:n`, n);
  }

  quarantine(name, text, why) {
    const stamp = this.backend.now ? this.backend.now() : Date.now();
    const key = `zoocraft:quarantine:${name}:${stamp}`;
    // Quarantined text is kept whole in its own chunks so a developer can recover it.
    const n = Math.max(1, Math.ceil(text.length / CHUNK_CHARS));
    for (let i = 0; i < n; i++) this.backend.set(`${key}:${i}`, text.slice(i * CHUNK_CHARS, (i + 1) * CHUNK_CHARS));
    this.backend.set(`${key}:n`, n);
    this.log(`quarantined collection ${name} (${why}) under ${key}`);
    // Remember the latest quarantine so /zoocraft:status can report it.
    this.backend.set(`${PREFIX}${name}:quarantined`, key);
  }
}
