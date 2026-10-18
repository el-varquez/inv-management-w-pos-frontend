import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { LowStockItem, Paged } from '../../../types';

export const useLowStock = (search?: string) => {
  const term = search?.trim() || undefined;

  return usePagedQuery<Paged<LowStockItem>>(
    (p) => inventoryService.getLowStock(term ? { ...p, search: term } : p),
    { key: term ?? '', fallbackError: 'Failed to load low stock items.' },
  );
};
