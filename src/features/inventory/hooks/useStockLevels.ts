import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { Paged, StockLevel } from '../../../types';

export const useStockLevels = (search?: string) => {
  const term = search?.trim() || undefined;

  const q = usePagedQuery<Paged<StockLevel>>(
    (p) => inventoryService.getStockLevels(term ? { ...p, search: term } : p),
    { key: term ?? '', fallbackError: 'Failed to load stock levels.' },
  );
  return { stockLevels: q.items, ...q };
};
