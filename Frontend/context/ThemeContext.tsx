/**
 * ThemeContext
 *
 * React Context for theme/appearance state management.
 * Supports light, dark, and system theme modes.
 *
 * @module context/ThemeContext
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

/**
 * Available theme modes
 */
type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme configuration
 */
interface ThemeConfig {
  /** Current theme mode */
  mode: ThemeMode;
  /** Primary brand color */
  primaryColor: string;
  /** Accent color */
  accentColor: string;
}

/**
 * Theme context value type
 */
interface ThemeContextValue {
  /** Current theme configuration */
  theme: ThemeConfig;
  /** Resolved theme (light or dark, after system preference) */
  resolvedTheme: 'light' | 'dark';
  /** Set theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Set primary color */
  setPrimaryColor: (color: string) => void;
  /** Set accent color */
  setAccentColor: (color: string) => void;
  /** Reset to default theme */
  resetTheme: () => void;
}

/**
 * Default theme configuration
 */
const DEFAULT_THEME: ThemeConfig = {
  mode: 'light',
  primaryColor: '#001733',
  accentColor: '#e5002b',
};

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider Component
 *
 * Provides theme state and methods to all child components.
 *
 * @example
 * ```tsx
 * // In App.tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<ThemeConfig>('theme', DEFAULT_THEME);

  // Get system preference
  const systemPrefersDark = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

  // Resolve actual theme based on mode and system preference
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme.mode === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return theme.mode;
  }, [theme.mode, systemPrefersDark]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS custom properties
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);

    // Set theme class
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#1a1a2e' : '#ffffff'
      );
    }
  }, [theme, resolvedTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme.mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme({ ...theme }); // Trigger re-render

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, setTheme]);

  const value = useMemo(
    (): ThemeContextValue => ({
      theme,
      resolvedTheme,
      setThemeMode: (mode) => setTheme({ ...theme, mode }),
      setPrimaryColor: (color) => setTheme({ ...theme, primaryColor: color }),
      setAccentColor: (color) => setTheme({ ...theme, accentColor: color }),
      resetTheme: () => setTheme(DEFAULT_THEME),
    }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 *
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * ```tsx
 * const { theme, setThemeMode, resolvedTheme } = useTheme();
 *
 * return (
 *   <button onClick={() => setThemeMode('dark')}>
 *     Current: {resolvedTheme}
 *   </button>
 * );
 * ```
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
