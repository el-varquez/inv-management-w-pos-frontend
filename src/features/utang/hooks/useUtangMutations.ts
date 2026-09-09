import { useState } from 'react';
import { utangService } from '../services/utangService';
import { getApiErrorMessage } from '../../../services/apiError';

export const useUtangMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setLoading(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, fallback));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createSuki: (body: { name: string; phone?: string }) =>
      run(() => utangService.createSuki(body), 'Failed to add the suki.'),
    updateSuki: (id: string, body: { name: string; phone?: string }) =>
      run(() => utangService.updateSuki(id, body), 'Failed to save the suki.'),
    deleteSuki: (id: string) =>
      run(() => utangService.deleteSuki(id), 'Failed to delete the suki.'),
    collect: (body: { sukiId: string; amount: number; note?: string }) =>
      run(() => utangService.collect(body), 'Failed to record the collection.'),
    voidPayment: (id: string) =>
      run(() => utangService.voidPayment(id), 'Failed to void the payment.'),
    editPayment: (id: string, amount: number) =>
      run(() => utangService.editPayment(id, amount), 'Failed to save the payment.'),
    voidInvoice: (id: string) =>
      run(() => utangService.voidInvoice(id), 'Failed to void the charge.'),
  };
};
