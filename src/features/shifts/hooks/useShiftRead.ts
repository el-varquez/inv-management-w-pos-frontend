import { useEffect, useState } from 'react';
import { shiftService } from '../services/shiftService';
import type { ShiftRead } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';

export const useShiftRead = (id: string | undefined) => {
  const [read, setRead] = useState<ShiftRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await shiftService.getRead(id);
      setRead(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load the shift.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetch();
  }, [id]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return { read, loading, error, reload: fetch };
};
