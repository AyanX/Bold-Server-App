/**
 * useDebounce Hook
 *
 * Custom hook for debouncing values or callbacks.
 * Useful for search inputs, form validation, and API calls.
 *
 * @module hooks/useDebounce
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounce a value
 *
 * @template T - Type of value to debounce
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     searchApi(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 *
 * @template T - Callback argument types
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback(
 *   (query: string) => {
 *     api.search(query);
 *   },
 *   300
 * );
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as any);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as any);
      }
    };
  }, []);

  return debouncedCallback;
}

export default useDebounce;
