import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { utangService } from '../services/utangService';
import type { Paged, Suki } from '../../../types';

export const useSukis = (term: string) => {
  const trimmed = term.trim();

  const q = usePagedQuery<Paged<Suki>>(
    (p) => utangService.getSukis(trimmed ? { ...p, term: trimmed } : p),
    { key: trimmed, fallbackError: 'Failed to load sukis.' },
  );
  return { sukis: q.items, ...q };
};
