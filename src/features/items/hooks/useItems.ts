import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { itemService } from '../services/itemService';
import type { Item, Paged } from '../../../types';

export interface ItemFilters {
  isComposite?: boolean;
  /** Name, item code or barcode; blank means no filter. */
  search?: string;
}

export const useItems = (filters?: ItemFilters) => {
  const isComposite = filters?.isComposite;
  const search = filters?.search?.trim() || undefined;

  return usePagedQuery<Paged<Item>>(
    (p) =>
      itemService.getPaged({
        ...p,
        ...(isComposite === undefined ? {} : { isComposite }),
        ...(search ? { search } : {}),
      }),
    { key: `${isComposite ?? ''}|${search ?? ''}`, fallbackError: 'Failed to load items.' },
  );
};
