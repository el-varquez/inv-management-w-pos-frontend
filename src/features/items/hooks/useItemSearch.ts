import { useEffect, useRef, useState } from 'react';
import { itemService } from '../services/itemService';
import type { SearchItem } from '../../../types';

/** Debounced type-ahead over /items/search, optionally narrowed to one category.
 *  Scanner Enter bypasses this — the Receive screen calls itemService.search
 *  directly for exact-match adds. */
export const useItemSearch = (term: string, categoryId?: string) => {
  const [hits, setHits] = useState<{
    forTerm: string;
    forCategory: string;
    items: SearchItem[];
  } | null>(null);
  const seq = useRef(0);
  const trimmed = term.trim();
  const category = categoryId ?? '';

  useEffect(() => {
    if (!trimmed) {
      seq.current++;
      return;
    }
    const id = ++seq.current;
    const timer = setTimeout(async () => {
      let items: SearchItem[];
      try {
        items = await itemService.search(trimmed, 10, category || undefined);
      } catch {
        items = [];
      }
      if (seq.current === id) setHits({ forTerm: trimmed, forCategory: category, items });
    }, 250);
    return () => clearTimeout(timer);
  }, [trimmed, category]);

  const current =
    trimmed !== '' && hits?.forTerm === trimmed && hits.forCategory === category;
  return {
    results: current ? hits!.items : [],
    searching: trimmed !== '' && !current,
  };
};
