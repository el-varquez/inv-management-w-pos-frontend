import { useEffect, useState } from 'react';
import { platformService } from '../services/platformService';
import type { TenantSummary } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';

export const useTenants = () => {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      setTenants(await platformService.getAll());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load tenants.'));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTenants(); }, []);

  return { tenants, loading, error, refetch: fetchTenants };
};
