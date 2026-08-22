import { useEffect, useState } from 'react';
import { utangService } from '../services/utangService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { UtangSummary } from '../../../types';
import type { DateRangeValue } from '../../../hooks/useDateRange';

export const useUtangSummary = (range?: DateRangeValue) => {
  const [summary, setSummary] = useState<UtangSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await utangService.getSummary(range);
      setSummary(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load utang summary.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetch();
  }, [range?.from, range?.to]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return { summary, loading, error, refetch: fetch };
};
