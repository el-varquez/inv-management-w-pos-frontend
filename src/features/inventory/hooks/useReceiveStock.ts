import { useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { getApiErrorMessage } from '../../../services/apiError';

export interface ReceiveLinePayload {
  itemId: string;
  quantity: number;
  costPerUnit: number;
  sellingPrice: number;
}

export const useReceiveStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const receiveStock = async (payload: {
    supplierName?: string;
    notes?: string;
    lines: ReceiveLinePayload[];
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await inventoryService.receiveStock(payload);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to receive stock.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { receiveStock, loading, error, clearError: () => setError(null) };
};
