import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Moon, Sun, Monitor, CloudMoon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, timeContext } = useTheme();

  return (
    <div className="flex bg-surface-alt/50 rounded-2xl p-1.5 border border-border-color shadow-sm w-fit transition-all hover:shadow-accent backdrop-blur-sm">
      <button
        onClick={() => setTheme('night')}
        className={`p-2.5 rounded-xl transition-all duration-300 ${
          theme === 'night'
            ? 'bg-surface shadow-md text-brand-primary glow-accent scale-105'
            : 'text-text-muted hover:text-text-main hover:bg-surface-alt'
        }`}
        title="Night Mode (Deep Focus)"
      >
        <Moon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('day')}
        className={`p-2.5 rounded-xl transition-all duration-300 ${
          theme === 'day'
            ? 'bg-surface shadow-md text-brand-primary glow-accent scale-105'
            : 'text-text-muted hover:text-text-main hover:bg-surface-alt'
        }`}
        title="Day Mode (Soft Graphite)"
      >
        <CloudMoon className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('light')}
        className={`p-2.5 rounded-xl transition-all duration-300 ${
          theme === 'light'
            ? 'bg-surface shadow-md text-brand-primary shadow-sm scale-105'
            : 'text-text-muted hover:text-text-main hover:bg-surface-alt'
        }`}
        title="Standard Light Mode"
      >
        <Sun className="w-5 h-5" />
      </button>
      <div className="mx-2 h-8 w-[1px] bg-border-color/30 self-center" />
      <button
        onClick={() => setTheme('auto')}
        className={`p-2.5 rounded-xl transition-all duration-300 ${
          theme === 'auto'
            ? 'bg-brand-primary/10 text-brand-primary glow-accent scale-105'
            : 'text-text-muted hover:text-text-main hover:bg-surface-alt'
        }`}
        title={`Auto System (Currently: ${timeContext === 'night' ? 'Night' : 'Day'})`}
      >
        <Monitor className="w-5 h-5" />
      </button>
    </div>
  );
}
