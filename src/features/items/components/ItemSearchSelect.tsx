import { useEffect, useRef, useState } from 'react';
import { useItemSearch } from '../hooks/useItemSearch';
import type { SearchItem } from '../../../types';

interface ItemSearchSelectProps {
  id?: string;
  /** The selected item's id, or '' for none. */
  value: string;
  /** What to show while closed; the caller keeps it because only one page of items is ever loaded. */
  selectedLabel: string;
  onChange: (id: string, item: SearchItem | null) => void;
  categoryId?: string;
  excludeIds?: string[];
  /** Hide inactive items, e.g. when picking something that will be consumed on sale. */
  activeOnly?: boolean;
  /** Adds a clear option at the top that selects nothing. */
  allLabel?: string;
  placeholder?: string;
}

/**
 * A picker that searches the catalog as you type instead of loading it whole.
 * Same markup and keyboard behaviour as SearchSelect; options come from /items/search.
 */
export const ItemSearchSelect = ({
  id,
  value,
  selectedLabel,
  onChange,
  categoryId,
  excludeIds,
  activeOnly = false,
  allLabel,
  placeholder,
}: ItemSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const { results, searching } = useItemSearch(query, categoryId);

  const options = results.filter(
    (r) => (!activeOnly || r.isActive) && !excludeIds?.includes(r.id)
  );
  const closedLabel = value === '' ? (allLabel ?? '') : selectedLabel;
  const q = query.trim();

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  const select = (item: SearchItem | null) => {
    onChange(item?.id ?? '', item);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="search-select" ref={ref}>
      <input
        id={id}
        className="input"
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        value={open ? query : closedLabel}
        placeholder={open ? closedLabel || placeholder : placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
            e.currentTarget.blur();
          } else if (e.key === 'Enter' && open) {
            e.preventDefault();
            if (q && options.length > 0) select(options[0]);
          }
        }}
      />
      {open && (
        <ul className="search-select-menu" role="listbox">
          {allLabel !== undefined && (
            <li
              role="option"
              aria-selected={value === ''}
              className={
                value === ''
                  ? 'search-select-option is-active'
                  : 'search-select-option'
              }
              onMouseDown={(e) => {
                e.preventDefault();
                select(null);
              }}
            >
              {allLabel}
            </li>
          )}
          {options.map((o) => (
            <li
              key={o.id}
              role="option"
              aria-selected={o.id === value}
              className={
                o.id === value
                  ? 'search-select-option is-active'
                  : 'search-select-option'
              }
              onMouseDown={(e) => {
                e.preventDefault();
                select(o);
              }}
            >
              {o.name}
            </li>
          ))}
          {searching && <li className="search-select-empty">Searching…</li>}
          {!searching && q === '' && (
            <li className="search-select-empty">Type to search items</li>
          )}
          {!searching && q !== '' && options.length === 0 && (
            <li className="search-select-empty">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
};
