import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { SalesTrend, TrendPeriod } from '../../../types';

export const useSalesTrend = (period: TrendPeriod) => {
  const [trend, setTrend] = useState<SalesTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getSalesTrend(period);
      setTrend(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the sales trend.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetch();
  }, [period]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return { trend, loading, error, refetch: fetch };
};
