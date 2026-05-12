import React from 'react';
import { Language } from '../constants/translations';

interface Props {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  variant?: 'auth' | 'minimal';
}

export const LanguageToggle: React.FC<Props> = ({ currentLang, onLangChange, variant = 'auth' }) => {
  return (
    <div className={`flex items-center gap-1 p-1 rounded-xl border ${variant === 'auth' ? 'bg-surface border-border-color' : 'bg-surface-alt border-transparent'}`}>
      <button 
        onClick={() => onLangChange('RU')}
        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${currentLang === 'RU' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
      >
        RU
      </button>
      <button 
        onClick={() => onLangChange('UZ')}
        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${currentLang === 'UZ' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
      >
        UZ
      </button>
    </div>
  );
};
