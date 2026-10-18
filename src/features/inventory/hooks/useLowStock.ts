import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { LowStockItem, Paged } from '../../../types';

export const useLowStock = () =>
  usePagedQuery<Paged<LowStockItem>>(
    (p) => inventoryService.getLowStock(p),
    { fallbackError: 'Failed to load low stock items.' },
  );
