import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { Paged, StockLevel } from '../../../types';

export const useStockLevels = () => {
  const q = usePagedQuery<Paged<StockLevel>>(
    (p) => inventoryService.getStockLevels(p),
    { fallbackError: 'Failed to load stock levels.' },
  );
  return { stockLevels: q.items, ...q };
};
