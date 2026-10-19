import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { InventoryHistoryItem, Paged } from '../../../types';

export interface InventoryHistoryFilters {
  from?: string;
  to?: string;
  type?: string;
  /** Movement item's name, code or barcode; blank means no filter. */
  search?: string;
}

export const useInventoryHistory = (filters?: InventoryHistoryFilters) => {
  const from = filters?.from;
  const to = filters?.to;
  const type = filters?.type;
  const search = filters?.search?.trim() || undefined;

  const q = usePagedQuery<Paged<InventoryHistoryItem>>(
    (p) => {
      const params: InventoryHistoryFilters & { page: number; pageSize: number } = { ...p };
      if (from) params.from = from;
      if (to) params.to = to;
      if (type) params.type = type;
      if (search) params.search = search;
      return inventoryService.getHistory(params);
    },
    {
      key: `${from ?? ''}|${to ?? ''}|${type ?? ''}|${search ?? ''}`,
      scope: 'history',
      fallbackError: 'Failed to load history.',
    },
  );
  return { history: q.items, ...q };
};
