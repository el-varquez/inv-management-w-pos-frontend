import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { inventoryService } from '../services/inventoryService';
import type { InventoryValuation } from '../../../types';

export const useInventoryValuation = () => {
  const q = usePagedQuery<InventoryValuation>(
    (p) => inventoryService.getValuation(p),
    { fallbackError: 'Failed to load valuation.' },
  );
  return { valuation: q.data, ...q };
};
