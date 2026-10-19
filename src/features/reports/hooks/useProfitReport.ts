import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { reportsService, type DateRange } from '../services/reportsService';
import type { ProfitReport } from '../../../types';

interface ProfitFilters {
  categoryId?: string;
  itemId?: string;
}

export const useProfitReport = (range?: DateRange, filters?: ProfitFilters) => {
  const from = range?.from;
  const to = range?.to;
  const categoryId = filters?.categoryId || undefined;
  const itemId = filters?.itemId || undefined;

  const q = usePagedQuery<ProfitReport>(
    (p) => reportsService.getProfitReport({ from, to, categoryId, itemId, ...p }),
    {
      key: `${from ?? ''}|${to ?? ''}|${categoryId ?? ''}|${itemId ?? ''}`,
      scope: 'report-profit',
      fallbackError: 'Failed to load profit report.',
    },
  );
  return { report: q.data, ...q };
};
