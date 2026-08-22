import { useEffect, useState } from 'react';
import { utangService } from '../services/utangService';
import type { SukiLedger } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';

export const useSukiLedger = (sukiId: string | null) => {
  const [ledger, setLedger] = useState<SukiLedger | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = async () => {
    if (!sukiId) {
      setLedger(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setLedger(await utangService.getLedger(sukiId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the ledger.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchLedger();
  }, [sukiId]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return { ledger, loading, error, refetch: fetchLedger };
};
