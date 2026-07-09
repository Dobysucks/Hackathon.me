import { useCallback, useEffect, useRef, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'mediexplain-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // Default to system theme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  // Tracks whether the user has explicitly chosen a theme (vs. following the OS default).
  const hasExplicitChoiceRef = useRef<boolean>(
    typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) !== null
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Only persist once the user has made an explicit choice, so the app keeps
    // following the system theme until then.
    if (hasExplicitChoiceRef.current) {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  // Follow system preference until the user makes an explicit choice
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      if (hasExplicitChoiceRef.current) return;
      setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const toggleTheme = useCallback(() => {
    hasExplicitChoiceRef.current = true;
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
