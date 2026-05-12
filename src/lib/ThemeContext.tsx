import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'night' | 'day' | 'light';
type ThemePreference = ThemeMode | 'auto';

interface ThemeContextType {
  theme: ThemePreference; // User's intentional override or 'auto'
  setTheme: (mode: ThemePreference) => void;
  resolvedTheme: ThemeMode; // What is actually being displayed
  timeContext: 'night' | 'day';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Load preferences from localStorage
  const [preferences, setPreferences] = useState<{ night: ThemePreference; day: ThemePreference }>(() => {
    const saved = localStorage.getItem('vantorix-theme-prefs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse theme preferences', e);
      }
    }
    return { night: 'auto', day: 'auto' };
  });

  const [timeContext, setTimeContext] = useState<'night' | 'day'>('day');
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>('day');

  // Determine time context
  const updateTimeContext = useCallback(() => {
    const hour = new Date().getHours();
    // Night is 19:00 to 07:00
    const isNight = hour >= 19 || hour < 7;
    setTimeContext(isNight ? 'night' : 'day');
  }, []);

  // Update context periodically
  useEffect(() => {
    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [updateTimeContext]);

  // Resolve which theme mode to actually apply
  useEffect(() => {
    let mode: ThemeMode;
    const pref = preferences[timeContext];

    if (pref !== 'auto') {
      mode = pref;
    } else {
      // Automatic behavior
      if (timeContext === 'night') {
        mode = 'night';
      } else {
        // daytime context
        // fallback to system preference if daytime is the only context left
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        mode = systemDark ? 'day' : 'light';
        
        // Actually, the prompt says:
        // NIGHT MODE (primary brand mode): 19-07
        // DAY MODE (soft dark mode): 07-19
        // LIGHT MODE: optional if selected
        
        // Priority 2: TIME-BASED
        // If daytime, we use DAY MODE
        mode = 'day';
      }
    }

    setResolvedTheme(mode);

    // Apply classes to document
    const root = document.documentElement;
    root.classList.remove('theme-night', 'theme-day', 'theme-light');
    root.classList.add(`theme-${mode}`);
    
    // Compatibility for other components that might rely on .dark/.light
    if (mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [preferences, timeContext]);

  const setTheme = (mode: ThemePreference) => {
    const newPrefs = { ...preferences, [timeContext]: mode };
    setPreferences(newPrefs);
    localStorage.setItem('vantorix-theme-prefs', JSON.stringify(newPrefs));
  };

  // The 'theme' exposed to UI is the preference for the current context
  const theme = preferences[timeContext];

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
