import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { utangService } from '../services/utangService';
import type { LedgerEntriesPage } from '../../../types';

export interface LedgerEntryFilters {
  /** ISO instant; entries at or after it. */
  from?: string;
  /** ISO instant, inclusive; the screen sends the end of the chosen day. */
  to?: string;
  /** Invoice number or note contains, or the exact amount; blank means no filter. */
  search?: string;
}

/**
 * A suki's ledger entries, newest first, each carrying the server-computed running balance,
 * plus the balance carried into `from` (0 without a period). Filters apply on the server
 * after the balance walk, so a filtered row keeps its true balance.
 */
export const useLedgerEntries = (sukiId: string, filters: LedgerEntryFilters = {}) => {
  const { from, to, search } = filters;

  const q = usePagedQuery<LedgerEntriesPage>(
    (p) => {
      const params: LedgerEntryFilters & { page: number; pageSize: number } = { ...p };
      if (from) params.from = from;
      if (to) params.to = to;
      if (search) params.search = search;
      return utangService.getLedgerEntries(sukiId, params);
    },
    {
      key: `${sukiId}|${from ?? ''}|${to ?? ''}|${search ?? ''}`,
      scope: 'ledger-entries',
      fallbackError: 'Failed to load ledger entries.',
    },
  );
  return { entries: q.items, openingBalance: q.data?.openingBalance ?? 0, ...q };
};
