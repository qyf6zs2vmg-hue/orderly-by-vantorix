
import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { translations, Language } from '../constants/translations';

interface Props {
  lang?: Language;
  variant?: 'lock' | 'shield';
}

export const SecurityIndicator: React.FC<Props> = ({ lang = 'RU', variant = 'shield' }) => {
  const t = translations[lang].security;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/5 border border-brand-primary/10 rounded-full group transition-all hover:bg-brand-primary/10">
      {variant === 'shield' ? (
        <Shield className="w-3.5 h-3.5 text-brand-primary" />
      ) : (
        <Lock className="w-3.5 h-3.5 text-brand-primary" />
      )}
      <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
        {variant === 'shield' ? t.protectedSession : t.confidentialB2B}
      </span>
    </div>
  );
};
