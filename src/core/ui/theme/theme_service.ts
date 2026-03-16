import { STORAGE_KEYS } from '../../constants/app_constants'

export type Theme = 'light' | 'dark'

export const ThemeService = {
  getTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    return (stored as Theme) ?? 'light'
  },

  setTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
    document.documentElement.setAttribute('data-bs-theme', theme)
  },

  toggleTheme(): Theme {
    const current = this.getTheme()
    const next: Theme = current === 'light' ? 'dark' : 'light'
    this.setTheme(next)
    return next
  },

  applyStoredTheme(): void {
    const theme = this.getTheme()
    document.documentElement.setAttribute('data-bs-theme', theme)
  },
}
