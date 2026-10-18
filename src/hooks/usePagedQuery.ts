import { useEffect, useRef, useState } from 'react';
import type { Paged } from '../types';
import { DEFAULT_PAGE_SIZE } from '../lib/pagination';
import { getApiErrorMessage } from '../services/apiError';

export interface PagedQueryOptions {
  /** Serialized filters. A change clears the page cache and returns to page 1. */
  key?: string;
  fallbackError: string;
  /**
   * Serve revisited pages from memory for the current screen visit.
   * Defaults to true; pass false for editable data such as stocktake lines.
   */
  cache?: boolean;
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
 * Server-side paging with a per-visit page cache.
 *
 * Pages are cached under `key|page|pageSize`. The cache is cleared when the
 * key changes, on `refetch()` (which every mutation already calls) and when
 * the component unmounts. A cached page renders with `loading === false` and
 * no request. After every fetch the page is clamped to `totalPages`, so a
 * list that shrank never strands the user on an empty page.
 */
export const usePagedQuery = <R extends Paged<unknown>>(
  fetcher: Fetcher<R>,
  options: PagedQueryOptions,
): PagedQueryResult<R> => {
  const key = options.key ?? '';
  const pageSize = DEFAULT_PAGE_SIZE;
  const cacheEnabled = options.cache !== false;

  const [data, setData] = useState<R | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  const fallbackRef = useRef(options.fallbackError);
  const cacheRef = useRef(new Map<string, R>());
  const lastKeyRef = useRef(key);
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

  const load = async (target: number, bypassCache: boolean) => {
    const cacheKey = `${key}|${target}|${pageSize}`;
    if (!bypassCache) {
      const hit = cacheRef.current.get(cacheKey);
      if (hit) {
        requestSeq.current++; // an in-flight miss for another page must not overwrite this one
        setData(hit);
        setError(null);
        setLoading(false);
        return;
      }
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current({ page: target, pageSize });
      if (seq !== requestSeq.current) return;
      if (cacheEnabled) cacheRef.current.set(cacheKey, result);
      setData(result);
      if (target > result.totalPages && result.totalPages >= 1) setPage(result.totalPages);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(getApiErrorMessage(err, fallbackRef.current));
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  };

  const refetch = async () => {
    cacheRef.current.clear();
    await load(page, true);
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (lastKeyRef.current !== key) {
      cacheRef.current.clear();
      lastKeyRef.current = key;
    }
    load(page, false);
  }, [key, page, pageSize]);
  /* eslint-enable react-hooks/exhaustive-deps */

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
