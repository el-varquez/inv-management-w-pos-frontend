import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { InventoryValuation } from '../../../types';

export const useInventoryValuation = (search?: string) => {
  const term = search?.trim() || undefined;

  const q = usePagedQuery<InventoryValuation>(
    (p) => inventoryService.getValuation(term ? { ...p, search: term } : p),
    { key: term ?? '', fallbackError: 'Failed to load valuation.' },
  );
  return { valuation: q.data, ...q };
};
