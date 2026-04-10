/**
 * useLocalStorage - Type-safe localStorage hook
 *
 * Features:
 * - Type-safe get/set operations
 * - JSON serialization/deserialization
 * - Sync between tabs (via storage events)
 * - Default value fallback
 * - Error handling
 */

import { useState, useCallback, useEffect } from 'react'

interface UseLocalStorageOptions<T> {
  defaultValue?: T;
  sync?: boolean; // sync across tabs
}

/**
 * Hook for managing localStorage with type safety
 *
 * @param key - Storage key
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const [config, setConfig] = useLocalStorage<WhatsAppConfig>('wa-config', {
 *   defaultValue: defaultConfig,
 *   sync: true // sync across browser tabs
 * })
 *
 * // Usage
 * setConfig({ ...config, accessToken: 'new-token' })
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): [T | null, (value: T | null) => void] {
  const { defaultValue, sync = true } = options;

  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      if (typeof window === 'undefined') {
        return defaultValue || null;
      }

      const item = window.localStorage.getItem(key);
      if (!item) {
        return defaultValue || null;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue || null;
    }
  });

  // Set value in localStorage
  const setValue = useCallback(
    (value: T | null) => {
      try {
        if (typeof window === 'undefined') return;

        if (value === null) {
          window.localStorage.removeItem(key);
          setStoredValue(null);
        } else {
          const serialized = JSON.stringify(value);
          window.localStorage.setItem(key, serialized);
          setStoredValue(value);
        }
      } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Sync across tabs via storage events
  useEffect(() => {
    if (!sync || typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return;

      try {
        if (event.newValue === null) {
          setStoredValue(defaultValue || null);
        } else {
          setStoredValue(JSON.parse(event.newValue) as T);
        }
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, sync, defaultValue]);

  return [storedValue, setValue];
}

/**
 * Hook for managing multiple localStorage items
 *
 * @example
 * ```tsx
 * const storage = useLocalStorageMulti({
 *   config: { defaultValue: defaultConfig },
 *   templates: { defaultValue: [] },
 *   logs: { defaultValue: [] }
 * })
 *
 * // Usage
 * storage.config[0] // current value
 * storage.config[1]({ ...storage.config[0], accessToken: 'new' }) // set value
 * ```
 */
export function useLocalStorageMulti<T extends Record<string, any>>(
  keys: Record<keyof T, UseLocalStorageOptions<any>>
): Record<keyof T, [any, (value: any) => void]> {
  const result: Record<keyof T, [any, (value: any) => void]> = {} as any;

  for (const key in keys) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useLocalStorage(key, keys[key]);
    result[key] = [value, setValue];
  }

  return result;
}

/**
 * Get value from localStorage synchronously (outside React)
 */
export function getLocalStorageSync<T>(key: string, defaultValue?: T): T | null {
  try {
    if (typeof window === 'undefined') return defaultValue || null;

    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue || null;

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue || null;
  }
}

/**
 * Set value to localStorage synchronously (outside React)
 */
export function setLocalStorageSync<T>(key: string, value: T | null): void {
  try {
    if (typeof window === 'undefined') return;

    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/**
 * Clear all localStorage keys
 */
export function clearAllLocalStorage(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
