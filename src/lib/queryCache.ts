/**
 * App-level page cache shared by every `usePagedQuery` that passes a `scope`.
 *
 * Each entry remembers when it was stored, so the hook can render it at once and
 * refresh anything older than `STALE_AFTER_MS` in the background. The store is
 * cleared as a whole by any mutation's `refetch()` and by `authStore.logout`:
 * web-admin mutations ripple across screens (receiving stock changes levels, low
 * stock, valuation, history and the expense report) and the register changes sales
 * outside the web admin entirely, so precise invalidation would miss both.
 *
 * This module imports nothing from stores or services, so it can never form a cycle.
 */
export const STALE_AFTER_MS = 30_000;

const MAX_ENTRIES = 200;

interface CacheEntry<T> {
  data: T;
  at: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const queryCache = {
  get<T>(key: string): CacheEntry<T> | undefined {
    return store.get(key) as CacheEntry<T> | undefined;
  },

  set<T>(key: string, data: T): void {
    // Delete before set so a refreshed key moves to the end and the oldest stays first.
    store.delete(key);
    store.set(key, { data, at: Date.now() });
    if (store.size > MAX_ENTRIES) {
      const oldest = store.keys().next().value;
      if (oldest !== undefined) store.delete(oldest);
    }
  },

  clear(): void {
    store.clear();
  },
};
