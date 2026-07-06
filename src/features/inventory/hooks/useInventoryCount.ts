import { useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { InventoryCount } from '../../../types';

type CountLine = { itemId: string; actualQty: number | null };

export const useInventoryCount = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (notes?: string): Promise<string | null> => {
    setSaving(true);
    setError(null);
    try {
      const { id } = await inventoryService.createCount(notes);
      return id;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to start count.'));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const load = async (id: string): Promise<InventoryCount | null> => {
    setLoading(true);
    setError(null);
    try {
      return await inventoryService.getCount(id);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load count.'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (id: string, lines: CountLine[]): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      await inventoryService.saveProgress(id, lines);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save progress.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const complete = async (id: string, lines: CountLine[]): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      await inventoryService.completeCount(id, lines);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to complete count.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { start, load, saveProgress, complete, loading, saving, error };
};
