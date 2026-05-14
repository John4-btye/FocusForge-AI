/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Theme is persisted locally so the user's light/dark choice survives refreshes.
  const [theme, setTheme] = useState(() => localStorage.getItem('focusforge_theme') || 'dark')

  useEffect(() => {
    // The data attribute lets global CSS theme both custom classes and Tailwind utilities.
    document.documentElement.dataset.theme = theme
    localStorage.setItem('focusforge_theme', theme)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme, isLight: theme === 'light' }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
