import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { InventoryHistoryItem, Paged } from '../../../types';

export interface InventoryHistoryFilters {
  from?: string;
  to?: string;
  type?: string;
}

export const useInventoryHistory = (filters?: InventoryHistoryFilters) => {
  const from = filters?.from;
  const to = filters?.to;
  const type = filters?.type;

  const q = usePagedQuery<Paged<InventoryHistoryItem>>(
    (p) => {
      const params: InventoryHistoryFilters & { page: number; pageSize: number } = { ...p };
      if (from) params.from = from;
      if (to) params.to = to;
      if (type) params.type = type;
      return inventoryService.getHistory(params);
    },
    { key: `${from ?? ''}|${to ?? ''}|${type ?? ''}`, fallbackError: 'Failed to load history.' },
  );
  return { history: q.items, ...q };
};
