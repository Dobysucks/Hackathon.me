import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors shrink-0"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
