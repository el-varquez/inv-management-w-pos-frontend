import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { BestSeller } from '../../../types';

export type PopularWindow = 'week' | 'month' | 'year';

const WINDOW_DAYS: Record<PopularWindow, number> = {
  week: 7,
  month: 30,
  year: 365,
};

/** The card shows the top 8, so it asks the API for exactly one page of 8. */
const POPULAR_PAGE_SIZE = 8;

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
      const data = await dashboardService.getBestSellers({
        from: from.toISOString(),
        page: 1,
        pageSize: POPULAR_PAGE_SIZE,
      });
      setItems(data.items);
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
