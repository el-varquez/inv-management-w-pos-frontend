import { useEffect, useState } from 'react';
import { platformService } from '../services/platformService';
import type { TenantDetail } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';

export const useTenant = (id: string) => {
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = async () => {
    setLoading(true);
    setError(null);
    try {
      setTenant(await platformService.getOne(id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load tenant.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => { fetchTenant(); }, [id]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return { tenant, loading, error, refetch: fetchTenant };
};
