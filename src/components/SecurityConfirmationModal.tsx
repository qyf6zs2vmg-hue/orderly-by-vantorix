
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Check, ChevronRight, ShieldAlert } from 'lucide-react';
import { translations, Language } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  lang: Language;
}

export const SecurityConfirmationModal: React.FC<Props> = ({ isOpen, onConfirm, lang }) => {
  const [accepted, setAccepted] = useState(false);
  const t = translations[lang].security;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
        className="relative w-full max-w-[500px] bg-surface rounded-[32px] border border-border-color shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-warning/10 flex items-center justify-center border border-brand-warning/20 shadow-[0_0_20px_rgba(255,181,71,0.1)]">
              <ShieldAlert className="w-6 h-6 text-brand-warning animate-pulse" />
            </div>
            <h2 className="text-[22px] font-bold text-text-main tracking-tight uppercase">
              {t.important}
            </h2>
          </div>

          <div className="space-y-6 mb-10">
            <div className="p-6 bg-surface-alt/40 rounded-[24px] border border-border-color/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <AlertTriangle className="w-32 h-32 rotate-12" />
              </div>
              <p className="text-[14px] leading-[1.7] text-text-main/90 font-medium relative z-10">
                {t.confidentialMessage}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setAccepted(!accepted)}
            className="flex items-start gap-4 w-full mb-10 group cursor-pointer"
          >
            <div className={`mt-0.5 w-6 h-6 shrink-0 rounded-lg border transition-all flex items-center justify-center ${accepted ? 'bg-brand-primary border-brand-primary shadow-[0_0_15px_rgba(79,124,255,0.3)]' : 'bg-surface-alt border-border-color group-hover:border-text-muted'}`}>
              {accepted && <Check className="w-4 h-4 text-white stroke-[3.5px]" />}
            </div>
            <span className="text-[14px] text-text-muted text-left font-bold select-none group-hover:text-text-main transition-colors leading-snug">
              {t.acceptTerms}
            </span>
          </button>

          <button
            disabled={!accepted}
            onClick={onConfirm}
            className={`w-full h-16 rounded-[20px] flex items-center justify-center gap-3 font-bold text-[15px] transition-all ${
              accepted 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-surface-alt text-text-muted cursor-not-allowed opacity-50'
            }`}
          >
            {t.continue}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Subtle premium glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-warning/30 to-transparent" />
      </motion.div>
    </div>
  );
};
