import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { DashboardSummary } from '../../../types';

export const useDashboardSummary = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetch();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { summary, loading, error, refetch: fetch };
};
