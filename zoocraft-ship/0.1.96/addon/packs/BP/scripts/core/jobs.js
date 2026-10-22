// One background job that runs queued tasks one after another (0.1.96), pure: the caller hands in how to start a job.
// The game's job system steps every job at least once a tick, then gives out what is left of the tick's time step by
// step, so forty guests' route searches as forty jobs took forty slices in a tick however busy it was. Queued in one
// job they take one slice when the tick is full and as many as fit when it isn't, and the first asked is answered
// first. A task is a generator, each yield a slice; one that throws goes to `onError` and the next goes on.

/**
 * @param {(gen: Generator<undefined, void, unknown>) => unknown} runJob starts a job (system.runJob, or a test's stand-in)
 * @param {(error: unknown) => void} [onError]
 */
export function jobQueue(runJob, onError = () => {}) {
  /** @type {Generator<undefined, unknown, unknown>[]} */
  const queue = [];
  let running = false;
  /** @returns {Generator<undefined, void, unknown>} */
  function* drain() {
    try {
      while (queue.length) {
        const task = /** @type {Generator<undefined, unknown, unknown>} */ (queue.shift());
        try {
          yield* task;
        } catch (error) {
          onError(error);
        }
        yield; // the next task starts in a slice of its own
      }
    } finally {
      running = false;
    }
  }
  return {
    /** @param {Generator<undefined, unknown, unknown>} task */
    push(task) {
      queue.push(task);
      if (running) return;
      running = true;
      runJob(drain());
    },
    /** Tasks waiting (not counting the one running). */
    get waiting() {
      return queue.length;
    },
  };
}
