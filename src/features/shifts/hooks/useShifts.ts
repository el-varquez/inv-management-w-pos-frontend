import { useEffect, useState } from 'react';
import { shiftService } from '../services/shiftService';
import type { Shift } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';
import { DEFAULT_PAGE_SIZE } from '../../../lib/pagination';

export const useShifts = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shiftService.getPaged({ page, pageSize });
      setShifts(data.items);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load shifts.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetch();
  }, [page, pageSize]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return {
    shifts,
    loading,
    error,
    refetch: fetch,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
  };
};
