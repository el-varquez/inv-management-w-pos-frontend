import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { itemService } from '../services/itemService';
import type { Item, Paged } from '../../../types';

export interface ItemFilters {
  isComposite?: boolean;
}

export const useItems = (filters?: ItemFilters) => {
  const isComposite = filters?.isComposite;
  return usePagedQuery<Paged<Item>>(
    (p) => itemService.getPaged(isComposite === undefined ? p : { ...p, isComposite }),
    { key: `${isComposite ?? ''}`, fallbackError: 'Failed to load items.' },
  );
};
