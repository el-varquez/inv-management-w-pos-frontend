import { usePagedQuery } from '../../../hooks/usePagedQuery';
import { utangService } from '../services/utangService';
import type { Paged, UtangLedgerEntry } from '../../../types';

/** A suki's ledger entries, newest first, each carrying the server-computed running balance. */
export const useLedgerEntries = (sukiId: string) => {
  const q = usePagedQuery<Paged<UtangLedgerEntry>>(
    (p) => utangService.getLedgerEntries(sukiId, p),
    { key: sukiId, fallbackError: 'Failed to load ledger entries.' },
  );
  return { entries: q.items, ...q };
};
