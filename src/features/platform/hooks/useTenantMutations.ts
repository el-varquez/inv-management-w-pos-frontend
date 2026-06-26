import { useState } from 'react';
import { platformService } from '../services/platformService';
import { getApiErrorMessage } from '../../../services/apiError';

export const useTenantMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createTenant = (payload: {
    businessName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    cashierCap?: number;
  }) =>
    run(async () => {
      await platformService.create(payload);
    });

  const suspendTenant = (id: string) => run(() => platformService.suspend(id));

  const reactivateTenant = (id: string) =>
    run(() => platformService.reactivate(id));

  const setCashierCap = (id: string, cashierCap: number) =>
    run(() => platformService.setCashierCap(id, cashierCap));

  return {
    createTenant,
    suspendTenant,
    reactivateTenant,
    setCashierCap,
    loading,
    error,
  };
};
