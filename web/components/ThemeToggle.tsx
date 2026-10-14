'use client';

import { useEffect, useState } from 'react';
import { applyTheme, readTheme, toggleTheme, type ThemeName } from '@/lib/theme';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeName>('light');

  useEffect(() => {
    const initial = readTheme();
    applyTheme(initial);
    setTheme(initial);
  }, []);

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
      onClick={() => setTheme((current) => toggleTheme(current))}
    >
      {theme === 'dark' ? 'Terang' : 'Gelap'}
    </button>
  );
}
