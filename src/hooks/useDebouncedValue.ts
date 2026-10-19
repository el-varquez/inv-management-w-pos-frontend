import { useEffect, useState } from 'react';

/**
 * Returns `value` once it has stayed unchanged for `delayMs`. The pending timer is
 * cleared on every change and on unmount, so a fast typist produces one update.
 */
export const useDebouncedValue = <T,>(value: T, delayMs = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};
