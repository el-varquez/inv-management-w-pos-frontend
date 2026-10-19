import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { reportsService, type DateRange } from '../services/reportsService';
import type { ExpenseReport } from '../../../types';

export const useExpenseReport = (range?: DateRange) => {
  const from = range?.from;
  const to = range?.to;

  const q = usePagedQuery<ExpenseReport>(
    (p) => reportsService.getExpenseReport({ from, to, ...p }),
    { key: `${from ?? ''}|${to ?? ''}`, fallbackError: 'Failed to load expense report.' },
  );
  return { report: q.data, ...q };
};
