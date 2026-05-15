import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'dark' | 'light';
type ThemePreference = ThemeMode | 'auto';

interface ThemeContextType {
  theme: ThemePreference; // User's preference
  setTheme: (mode: ThemePreference) => void;
  resolvedTheme: ThemeMode; // What is actually being displayed
  timeContext: 'night' | 'day';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('theme-preference');
    return (saved as ThemePreference) || 'auto';
  });

  const [timeContext, setTimeContext] = useState<'night' | 'day'>('day');
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>('light');

  const updateTimeContext = useCallback(() => {
    const hour = new Date().getHours();
    // Night is 19:00 to 07:00
    const isNight = hour >= 19 || hour < 7;
    setTimeContext(isNight ? 'night' : 'day');
  }, []);

  useEffect(() => {
    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [updateTimeContext]);

  useEffect(() => {
    let mode: ThemeMode;

    if (theme === 'auto') {
      mode = timeContext === 'night' ? 'dark' : 'light';
    } else {
      mode = theme;
    }

    setResolvedTheme(mode);

    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-night', 'theme-day');
    root.classList.add(`theme-${mode}`);
    
    if (mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme, timeContext]);

  const setTheme = (mode: ThemePreference) => {
    setThemeState(mode);
    localStorage.setItem('theme-preference', mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, timeContext }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
