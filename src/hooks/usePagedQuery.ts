import { useEffect, useRef, useState } from 'react';
import type { Paged } from '../types';
import { DEFAULT_PAGE_SIZE } from '../lib/pagination';
import { STALE_AFTER_MS, queryCache } from '../lib/queryCache';
import { getApiErrorMessage } from '../services/apiError';

export interface PagedQueryOptions {
  /** Serialized filters. A change returns to page 1; pages are cached per key. */
  key?: string;
  fallbackError: string;
  /**
   * Serve revisited pages from memory.
   * Defaults to true; pass false for editable data such as stocktake lines.
   */
  cache?: boolean;
  /**
   * Namespace in the app-level cache (`src/lib/queryCache.ts`). With a scope, pages
   * outlive the screen and are served stale-while-revalidate; without one the hook
   * keeps a per-visit cache that dies with the component.
   */
  scope?: string;
}

export interface PagedQueryResult<R extends Paged<unknown>> {
  data: R | null;
  items: R['items'];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

type Fetcher<R> = (params: { page: number; pageSize: number }) => Promise<R>;

/**
 * Server-side paging with a page cache.
 *
 * Pages are cached under `key|page|pageSize`, inside the shared `queryCache` under
 * `scope` when one is given, else in a per-instance map. A cached page renders with
 * `loading === false` and no request; a shared page older than `STALE_AFTER_MS` is
 * refreshed in the background, and a failed background refresh leaves the cached
 * rows and `error` untouched. `refetch()` (which every mutation already calls)
 * clears the whole shared store and reloads the current page in the foreground.
 * After every fetch the page is clamped to `totalPages`, so a list that shrank never
 * strands the user on an empty page.
 */
export const usePagedQuery = <R extends Paged<unknown>>(
  fetcher: Fetcher<R>,
  options: PagedQueryOptions,
): PagedQueryResult<R> => {
  const key = options.key ?? '';
  const scope = options.scope;
  const pageSize = DEFAULT_PAGE_SIZE;
  const cacheEnabled = options.cache !== false;

  const [data, setData] = useState<R | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  const fallbackRef = useRef(options.fallbackError);
  const localCacheRef = useRef(new Map<string, R>());
  const requestSeq = useRef(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
    fallbackRef.current = options.fallbackError;
  });

  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setPage(1);
  }

  const cacheKeyFor = (target: number) => `${key}|${target}|${pageSize}`;

  const readCache = (cacheKey: string): { data: R; at: number } | undefined => {
    if (!cacheEnabled) return undefined;
    if (scope) return queryCache.get<R>(`${scope}|${cacheKey}`);
    const hit = localCacheRef.current.get(cacheKey);
    return hit ? { data: hit, at: Date.now() } : undefined; // per-visit pages never go stale
  };

  const writeCache = (cacheKey: string, result: R) => {
    if (!cacheEnabled) return;
    if (scope) queryCache.set(`${scope}|${cacheKey}`, result);
    else localCacheRef.current.set(cacheKey, result);
  };

  const fetchPage = async (target: number, background: boolean) => {
    const seq = ++requestSeq.current;
    if (!background) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await fetcherRef.current({ page: target, pageSize });
      if (seq !== requestSeq.current) return;
      writeCache(cacheKeyFor(target), result);
      setData(result);
      if (target > result.totalPages && result.totalPages >= 1) setPage(result.totalPages);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      if (!background) setError(getApiErrorMessage(err, fallbackRef.current));
    } finally {
      if (seq === requestSeq.current && !background) setLoading(false);
    }
  };

  const load = async (target: number) => {
    const hit = readCache(cacheKeyFor(target));
    if (!hit) {
      await fetchPage(target, false);
      return;
    }
    requestSeq.current++; // an in-flight miss for another page must not overwrite this one
    setData(hit.data);
    setError(null);
    setLoading(false);
    if (Date.now() - hit.at > STALE_AFTER_MS) await fetchPage(target, true);
  };

  const refetch = async () => {
    queryCache.clear();
    localCacheRef.current.clear();
    await fetchPage(page, false);
  };

  // A cache hit is applied synchronously on purpose: the cached page must render in the same
  // commit as the navigation, or every revisit would flash a skeleton.
  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  useEffect(() => {
    load(page);
  }, [key, page, pageSize]);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  return {
    data,
    items: (data?.items ?? []) as R['items'],
    loading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
  };
};
