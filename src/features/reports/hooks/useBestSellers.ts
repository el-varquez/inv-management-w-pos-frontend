import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { reportsService, type DateRange } from '../services/reportsService';
import type { BestSeller, Paged } from '../../../types';

export const useBestSellers = (range?: DateRange) => {
  const from = range?.from;
  const to = range?.to;

  const q = usePagedQuery<Paged<BestSeller>>(
    (p) => reportsService.getBestSellers({ from, to, ...p }),
    {
      key: `${from ?? ''}|${to ?? ''}`,
      scope: 'report-best-sellers',
      fallbackError: 'Failed to load best sellers.',
    },
  );
  return { bestSellers: q.items, ...q };
};
