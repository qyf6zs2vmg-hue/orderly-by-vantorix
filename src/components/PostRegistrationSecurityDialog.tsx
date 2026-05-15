
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const PostRegistrationSecurityDialog: React.FC<Props> = ({ isOpen, onClose, lang = 'RU', onLanguageChange }) => {
  const t = translations[lang];
  const [timeLeft, setTimeLeft] = useState(10);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(10);
      setCanProceed(false);
      return;
    }

    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanProceed(true);
    }
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0F1115]/90 backdrop-blur-md" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[480px] bg-surface rounded-[32px] border border-brand-danger/30 shadow-[0_20px_50px_rgba(239,68,68,0.15)] overflow-hidden flex flex-col"
      >
        <div className="absolute top-6 right-6 z-10 flex gap-2">
           {onLanguageChange && (
             <div className="flex bg-surface-alt rounded-lg p-1 border border-border-color shadow-sm">
                <button
                  onClick={() => onLanguageChange('RU')}
                  className={`px-3 py-1 rounded-[6px] text-[11px] font-bold tracking-wider transition-all ${
                    lang === 'RU' 
                      ? 'bg-white text-text-main shadow-sm' 
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => onLanguageChange('UZ')}
                  className={`px-3 py-1 rounded-[6px] text-[11px] font-bold tracking-wider transition-all ${
                    lang === 'UZ' 
                      ? 'bg-white text-text-main shadow-sm' 
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  UZ
                </button>
             </div>
           )}
        </div>
        
        <div className="p-10 text-center flex flex-col items-center mt-4">
          <div className="w-20 h-20 rounded-full bg-brand-danger/10 flex items-center justify-center border border-brand-danger/20 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
             <ShieldAlert className="w-10 h-10 text-brand-danger" />
          </div>

          <h2 className="text-[20px] font-black text-brand-danger tracking-tight mb-6 uppercase">
            {t.auth.importantNotice}
          </h2>

          <p className="text-[14px] leading-relaxed text-text-main font-medium mb-10 text-left bg-surface-alt/50 p-6 rounded-[20px] border border-border-color">
            {t.auth.ndaWarningText}
          </p>

          <button
            onClick={onClose}
            disabled={!canProceed}
            className={`w-full h-14 font-bold rounded-[16px] flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
              canProceed 
                ? 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg active:scale-[0.98]' 
                : 'bg-surface-alt text-text-muted cursor-not-allowed border border-border-color'
            }`}
          >
            {canProceed ? (
              <>
                <span>{t.common.next}</span>
                <CheckCircle2 className="w-5 h-5 opacity-80" />
              </>
            ) : (
              <span className="tabular-nums tracking-widest">{timeLeft}</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

