import { useEffect, useState } from 'react';
import { utangService } from '../services/utangService';
import type { Suki } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';
import { DEFAULT_PAGE_SIZE } from '../../../lib/pagination';

export const useSukis = (term: string) => {
  const [sukis, setSukis] = useState<Suki[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSukis = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; pageSize: number; term?: string } = {
        page,
        pageSize,
      };
      if (term.trim().length > 0) params.term = term.trim();
      const data = await utangService.getSukis(params);
      setSukis(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load sukis.'));
    } finally {
      setLoading(false);
    }
  };

  const [prevTerm, setPrevTerm] = useState(term);
  if (term !== prevTerm) {
    setPrevTerm(term);
    setPage(1);
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchSukis();
  }, [term, page, pageSize]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return {
    sukis,
    loading,
    error,
    refetch: fetchSukis,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
  };
};
