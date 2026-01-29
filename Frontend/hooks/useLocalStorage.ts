/**
 * useLocalStorage Hook
 *
 * Custom hook for persistent state using localStorage.
 * Automatically syncs state with localStorage and handles serialization.
 *
 * @module hooks/useLocalStorage
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing state persisted in localStorage
 *
 * @template T - Type of the stored value
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * // Basic usage
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 *
 * // With complex types
 * const [user, setUser] = useLocalStorage<User | null>('user', null);
 *
 * // Remove value
 * const [_, __, removeValue] = useLocalStorage('tempData', null);
 * removeValue(); // Clears from localStorage
 * ```
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get stored value or use initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Dispatch custom event for cross-tab synchronization
          window.dispatchEvent(new StorageEvent('storage', { key }));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== JSON.stringify(storedValue)) {
        setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, storedValue, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
