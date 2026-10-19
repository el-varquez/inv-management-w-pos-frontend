import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { InventoryCountSummary, Paged } from '../../../types';

export const useInventoryCounts = (status: 'Draft' | 'Completed') => {
  const q = usePagedQuery<Paged<InventoryCountSummary>>(
    (p) => inventoryService.getCounts({ status, ...p }),
    { key: status, scope: 'counts', fallbackError: 'Failed to load counts.' },
  );
  return { summaries: q.items, ...q };
};
