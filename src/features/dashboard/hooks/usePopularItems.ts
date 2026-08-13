import { useEffect, useState } from 'react';
import { reportsService } from '../../reports/services/reportsService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { BestSeller } from '../../../types';

export type PopularWindow = 'week' | 'month' | 'year';

const WINDOW_DAYS: Record<PopularWindow, number> = {
  week: 7,
  month: 30,
  year: 365,
};

export const usePopularItems = (window: PopularWindow) => {
  const [items, setItems] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const from = new Date();
      from.setDate(from.getDate() - WINDOW_DAYS[window]);
      const data = await reportsService.getBestSellers({ from: from.toISOString() });
      setItems(data.slice(0, 8));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load popular items.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetch();
  }, [window]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return { items, loading, error, refetch: fetch };
};
