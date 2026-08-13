import { useEffect, useRef, useState } from 'react';
import { itemService } from '../../items/services/itemService';
import type { SearchItem } from '../../../types';

/** Debounced type-ahead for the scan box. Scanner Enter bypasses this —
 *  the screen calls itemService.search directly for exact-match adds. */
export const useItemSearch = (term: string) => {
  const [hits, setHits] = useState<{
    forTerm: string;
    items: SearchItem[];
  } | null>(null);
  const seq = useRef(0);
  const trimmed = term.trim();

  useEffect(() => {
    if (!trimmed) {
      seq.current++;
      return;
    }
    const id = ++seq.current;
    const timer = setTimeout(async () => {
      let items: SearchItem[];
      try {
        items = await itemService.search(trimmed);
      } catch {
        items = [];
      }
      if (seq.current === id) setHits({ forTerm: trimmed, items });
    }, 250);
    return () => clearTimeout(timer);
  }, [trimmed]);

  const current = trimmed !== '' && hits?.forTerm === trimmed;
  return {
    results: current ? hits!.items : [],
    searching: trimmed !== '' && !current,
  };
};
