
import React, { useState } from 'react';
import { Shield, Lock, FileText, Activity, ChevronRight, Eye } from 'lucide-react';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import { TermsOfUseContent } from './TermsOfUseContent';
import { InfoSharingPolicyContent } from './InfoSharingPolicyContent';
import { translations, Language } from '../constants/translations';

interface Props {
  lang?: Language;
}

export const SecuritySettings: React.FC<Props> = ({ lang = 'RU' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'policy' | 'terms' | 'sharing' | 'logs'>('policy');
  const t = translations[lang].legal;
  const tLogs = translations[lang].logs;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sub-navigation */}
      <div className="w-full lg:w-72 flex flex-col gap-2">
        <button 
          onClick={() => setActiveSubTab('policy')}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activeSubTab === 'policy' ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary shadow-sm' : 'bg-surface border-border-color text-text-muted hover:text-text-main'}`}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4" />
            <span className="text-[13px] font-bold tracking-tight">{t.privacyPolicy}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>

        <button 
          onClick={() => setActiveSubTab('terms')}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activeSubTab === 'terms' ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary shadow-sm' : 'bg-surface border-border-color text-text-muted hover:text-text-main'}`}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4" />
            <span className="text-[13px] font-bold tracking-tight">{t.termsOfUse}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>

        <button 
          onClick={() => setActiveSubTab('sharing')}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activeSubTab === 'sharing' ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary shadow-sm' : 'bg-surface border-border-color text-text-muted hover:text-text-main'}`}
        >
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4" />
            <span className="text-[13px] font-bold tracking-tight">{t.infoSharing}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>

        <button 
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activeSubTab === 'logs' ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary shadow-sm' : 'bg-surface border-border-color text-text-muted hover:text-text-main'}`}
        >
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4" />
            <span className="text-[13px] font-bold tracking-tight">{t.activityLogs}</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </div>

      {/* Policy Content View */}
      <div className="flex-1 bg-surface border border-border-color rounded-[32px] p-8 min-h-[500px] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-main tracking-tight">
              {activeSubTab === 'policy' && t.privacyPolicy}
              {activeSubTab === 'terms' && t.termsOfUse}
              {activeSubTab === 'sharing' && t.infoSharing}
              {activeSubTab === 'logs' && t.activityLogs}
            </h3>
            <div className="px-3 py-1 bg-brand-success/10 border border-brand-success/20 rounded-full">
              <span className="text-[10px] font-bold text-brand-success uppercase tracking-widest">{tLogs.activeVerified}</span>
            </div>
          </div>

          <div className="max-w-2xl">
            {activeSubTab === 'policy' && <PrivacyPolicyContent />}
            {activeSubTab === 'terms' && <TermsOfUseContent lang={lang} />}
            {activeSubTab === 'sharing' && <InfoSharingPolicyContent lang={lang} />}
            {activeSubTab === 'logs' && (
              <div className="space-y-4">
                {[
                  { event: tLogs.authEvent, time: `${tLogs.today}, 14:20`, device: 'Chrome / MacOS', status: 'success' },
                  { event: tLogs.profileEvent, time: `${tLogs.yesterday}, 18:45`, device: 'Chrome / MacOS', status: 'success' },
                  { event: tLogs.catalogEvent, time: '10 Май, 12:30', device: 'Safari / iPhone', status: 'success' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border-color bg-surface-alt/30">
                    <div>
                      <div className="text-[13px] font-bold text-text-main">{log.event}</div>
                      <div className="text-[11px] text-text-muted mt-1">{log.time} • {log.device}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Abstract watermark pattern */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
          <Shield className="w-64 h-64 rotate-12" />
        </div>
      </div>
    </div>
  );
};
