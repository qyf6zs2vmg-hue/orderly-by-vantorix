import React from 'react';
import { X } from 'lucide-react';
import { InfoSharingPolicyContent } from './InfoSharingPolicyContent';

interface InfoSharingPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'RU' | 'UZ';
}

export default function InfoSharingPolicyModal({ isOpen, onClose, lang = 'RU' }: InfoSharingPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white card-largexl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{lang === 'RU' ? 'Политика обмена информацией ASTHEA' : 'ASTHEA ma\'lumot almashish siyosati'}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <InfoSharingPolicyContent lang={lang} />
        </div>
        
        <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-primary text-white font-medium card-largel hover:bg-brand-primary/90 transition-colors shadow-sm shadow-brand-primary/20"
          >
            {lang === 'RU' ? 'Закрыть' : 'Yopish'}
          </button>
        </div>
      </div>
    </div>
  );
}
