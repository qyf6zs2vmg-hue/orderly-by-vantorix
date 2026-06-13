import React, { useState, useEffect } from 'react';
import { X, Download, MonitorSmartphone } from 'lucide-react';
import { clsx } from 'clsx';

export const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (!hasDismissed) {
      // Small delay before showing it up so it doesn't jump immediately on load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className={clsx(
      "fixed bottom-24 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[100]",
      "animate-in slide-in-from-bottom-5 fade-in duration-500 ease-out fill-mode-forwards"
    )}>
      <div className="bg-surface rounded-2xl shadow-xl border border-border-color p-4 max-w-sm w-full relative overflow-hidden group">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 text-text-muted hover:text-text-main bg-surface-alt/50 hover:bg-surface-alt rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-brand-primary/10 p-3 rounded-xl shrink-0 text-brand-primary">
            <MonitorSmartphone className="w-6 h-6" />
          </div>
          <div className="pr-4">
            <h3 className="text-[14px] font-bold text-text-main leading-tight mb-1">
              Добавить на главный экран
            </h3>
            <p className="text-[12px] text-text-muted leading-relaxed mb-3">
              Для быстрого доступа и удобной работы оффлайн.
            </p>
            <button 
              onClick={() => {
                // In a real PWA you would trigger the deferred prompt here.
                // For this UI mockup, we will just dismiss.
                handleDismiss();
              }}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-[10px] text-[12px] font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Добавить на экран
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
