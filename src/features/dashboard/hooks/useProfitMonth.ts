import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { ProfitReport } from '../../../types';

export const useProfitMonth = () => {
  const [report, setReport] = useState<ProfitReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const data = await dashboardService.getProfitReport({
        from: monthStart.toISOString(),
      });
      setReport(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load profit.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetch();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { report, loading, error, refetch: fetch };
};
