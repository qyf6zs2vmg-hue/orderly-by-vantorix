
import React from 'react';
import { motion } from 'motion/react';
import { Lock, Shield, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const PostRegistrationSecurityDialog: React.FC<Props> = ({ isOpen, onClose, lang = 'RU' }) => {
  const t = translations[lang].security;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0F1115]/80 backdrop-blur-md" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[440px] bg-surface rounded-[32px] border border-border-color shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        <div className="p-10 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-[0_0_30px_rgba(79,124,255,0.1)]">
                <Lock className="w-10 h-10 text-brand-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-success flex items-center justify-center border-4 border-surface shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-[22px] font-extrabold text-text-main tracking-tight mb-4 px-4 leading-tight uppercase">
            {t.protectedAccess}
          </h2>

          <p className="text-[14px] leading-[1.7] text-text-main/80 mb-10 px-4 font-medium">
            {t.protectedAccount}
          </p>

          <button
            onClick={onClose}
            className="w-full h-16 bg-surface-alt hover:bg-border-color/50 text-text-main font-bold rounded-[20px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm group"
          >
            <CheckCircle2 className="w-5 h-5 text-brand-success group-hover:scale-110 transition-transform" />
            {t.understood}
          </button>
        </div>
        
        <div className="h-1.5 bg-brand-primary/20" />
      </motion.div>
    </div>
  );
};
