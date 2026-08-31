import { useEffect, useState } from 'react';
import {
  paymentMethodsService,
  type CreatePaymentMethodPayload,
  type UpdatePaymentMethodPayload,
} from '../services/paymentMethodsService';
import type { PaymentMethod } from '../../../types';
import { getApiErrorMessage } from '../../../services/apiError';

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchMethods = async () => {
    try {
      const data = await paymentMethodsService.getAll();
      setMethods(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load payment methods.'));
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchMethods();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const create = async (payload: CreatePaymentMethodPayload): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await paymentMethodsService.create(payload);
      await fetchMethods();
      return true;
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Failed to save payment method.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (
    id: string,
    payload: UpdatePaymentMethodPayload
  ): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await paymentMethodsService.update(id, payload);
      await fetchMethods();
      return true;
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Failed to save payment method.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    methods,
    loading,
    error,
    saving,
    saveError,
    clearSaveError: () => setSaveError(null),
    create,
    update,
  };
};
