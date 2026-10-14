export const THEME_KEY = 'lms-theme';
export type ThemeName = 'light' | 'dark';

export function isTheme(value: string | null): value is ThemeName {
  return value === 'light' || value === 'dark';
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function readTheme(): ThemeName {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY);
  if (isTheme(stored)) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function toggleTheme(current: ThemeName): ThemeName {
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
