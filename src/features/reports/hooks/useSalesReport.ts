import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { reportsService, type DateRange } from '../services/reportsService';
import type { SalesReport } from '../../../types';

export const useSalesReport = (range?: DateRange) => {
  const from = range?.from;
  const to = range?.to;

  const q = usePagedQuery<SalesReport>(
    (p) => reportsService.getSalesReport({ from, to, ...p }),
    { key: `${from ?? ''}|${to ?? ''}`, fallbackError: 'Failed to load sales report.' },
  );
  return { report: q.data, ...q };
};
