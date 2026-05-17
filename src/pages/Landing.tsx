import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Zap,
  Activity,
  Users,
  Network,
  Lock,
  Database,
} from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { Language, translations } from '../constants/translations';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import TermsOfUseModal from '../components/TermsOfUseModal';
import InfoSharingPolicyModal from '../components/InfoSharingPolicyModal';

export default function Landing() {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [lang, setLang] = useState<Language>('RU');
  
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);
  const [isTermsOpen, setTermsOpen] = useState(false);
  const [isInfoSharingOpen, setInfoSharingOpen] = useState(false);

  useEffect(() => {
    // Theme will auto-sync with the time context because of ThemeProvider
  }, []);

  const handleStart = () => {
    localStorage.setItem('asthea_visited', 'true');
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans text-text-main overflow-x-hidden relative selection:bg-surface-alt">
      {/* Header / Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border-color/50 bg-bg-base/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://drive.google.com/thumbnail?id=1Zzhxcg4wGu4HCBSmPptAhuTqb-s8yb3D&sz=w1000" alt="ASTHEA Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold tracking-tight text-[15px] uppercase">Asthea OMS</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-text-muted">
            <a href="#overview" className="hover:text-text-main transition-colors">{translations[lang].landing.navPlatform}</a>
            <a href="#features" className="hover:text-text-main transition-colors">{translations[lang].landing.navFeatures}</a>
            <a href="#integrations" className="hover:text-text-main transition-colors">{translations[lang].landing.navIntegrations}</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="block">
              <LanguageToggle currentLang={lang} onLangChange={setLang} variant="minimal" />
            </div>
            <button 
              onClick={handleStart}
              className="hidden sm:block text-[13px] font-semibold text-text-muted hover:text-text-main transition-colors"
            >
              {translations[lang].landing.enterWorkspace}
            </button>
            <button 
              onClick={handleStart}
              className="btn-primary px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-bold"
            >
              {translations[lang].landing.openPlatform}
            </button>
          </div>
        </div>
      </nav>

      <main className="relative pt-32">
        {/* 1. HERO SECTION */}
        <section id="platform" className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center mb-56">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-alt border border-border-color text-[11px] font-black uppercase tracking-widest mb-8 text-brand-primary">
              <Shield className="w-3 h-3" />
              {translations[lang].landing.verifiedAccessOnly}
            </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.05] mb-6">
              Asthea OMS<br />
              <span className="text-brand-primary text-3xl md:text-4xl lg:text-5xl block mt-4">{translations[lang].landing.heroSubtitle}</span>
            </h1>
            <p className="text-lg text-text-muted max-w-xl leading-relaxed mb-10 font-medium">
              {translations[lang].landing.heroDesc}
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleStart}
                className="btn-primary px-8 py-4 text-[15px] font-bold flex items-center gap-2 group"
              >
                {translations[lang].landing.openPlatform}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleStart}
                className="btn-secondary px-8 py-4 text-[15px] font-bold"
              >
                {translations[lang].landing.enterWorkspace}
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-base bg-surface-alt flex items-center justify-center text-[10px] font-bold ring-1 ring-border-color">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-text-muted font-medium">{translations[lang].landing.trustedBy}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center w-full"
          >
            {/* Professional Dashboard Mockup Visual */}
            <div className="relative w-full aspect-[4/3] max-w-[600px] bg-surface rounded-[24px] border border-border-color shadow-[0_30px_60px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col">
              <div className="h-12 border-b border-border-color bg-surface-alt/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-border-color/80" />
                <div className="w-3 h-3 rounded-full bg-border-color/80" />
                <div className="w-3 h-3 rounded-full bg-border-color/80" />
                <div className="ml-4 h-6 px-3 bg-surface border border-border-color rounded-md flex items-center">
                  <div className="w-32 h-2.5 bg-text-muted/20 rounded-full" />
                </div>
              </div>
              <div className="flex-1 p-6 flex gap-6 bg-bg-base/50">
                {/* Sidebar mock */}
                <div className="w-1/4 hidden sm:flex flex-col gap-3">
                  <div className="h-4 w-1/2 bg-text-muted/30 rounded-full mb-4" />
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-8 w-full bg-surface border border-border-color rounded-lg opacity-60" />
                  ))}
                </div>
                {/* Content mock */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-6 w-1/3 bg-text-main/20 rounded-full" />
                    <div className="h-8 w-24 bg-brand-primary/20 rounded-lg border border-brand-primary/30" />
                  </div>
                  {/* Stats mock */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-20 bg-surface border border-border-color rounded-xl p-4 flex flex-col justify-between">
                        <div className="h-3 w-1/2 bg-text-muted/30 rounded-full" />
                        <div className="h-5 w-3/4 bg-text-main/40 rounded-full" />
                      </div>
                    ))}
                  </div>
                  {/* List mock */}
                  <div className="flex-1 bg-surface border border-border-color rounded-xl p-4 flex flex-col gap-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex justify-between items-center p-3 hover:bg-surface-alt rounded-lg transition-colors border border-transparent hover:border-border-color">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-primary/10" />
                          <div className="flex flex-col gap-1.5">
                            <div className="h-2.5 w-24 bg-text-main/30 rounded-full" />
                            <div className="h-2 w-16 bg-text-muted/30 rounded-full" />
                          </div>
                        </div>
                        <div className="h-4 w-16 bg-brand-success/20 rounded-full border border-brand-success/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 top-1/4 w-40 p-4 bg-surface/90 backdrop-blur-md border border-border-color rounded-2xl shadow-xl flex items-center gap-4"
              >
                 <div className="w-10 h-10 rounded-full bg-brand-success/10 flex items-center justify-center">
                   <Shield className="w-5 h-5 text-brand-success" />
                 </div>
                 <div>
                   <div className="text-[12px] font-bold text-text-main">{translations[lang].landing.verifiedAccessOnly}</div>
                 </div>
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-6 bottom-1/4 w-48 p-4 bg-surface/90 backdrop-blur-md border border-border-color rounded-xl shadow-xl space-y-2"
              >
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-text-muted uppercase">Sync</span>
                   <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                 </div>
                 <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                   <div className="h-full bg-brand-primary w-3/4 rounded-full" />
                 </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* 2. OVERVIEW SECTION */}
        <section id="overview" className="max-w-7xl mx-auto px-6 mb-56">
           <div className="text-center mb-20">
             <h2 className="text-3xl font-bold tracking-tighter mb-4">{translations[lang].landing.overviewTitle}</h2>
             <p className="text-text-muted text-[13px] font-semibold uppercase tracking-[0.2em]">{translations[lang].landing.overviewSubtitle}</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
             {/* Step 1 */}
             <div className="bg-surface border border-border-color rounded-2xl p-8 hover:border-brand-primary/30 transition-all flex flex-col group relative overflow-hidden">
                <div className="w-14 h-14 bg-surface-alt text-brand-primary rounded-2xl flex items-center justify-center mb-8 border border-border-color relative z-10">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-tighter relative z-10">{translations[lang].landing.step1Title}</h3>
                <p className="text-[14px] text-text-muted leading-relaxed font-medium relative z-10">{translations[lang].landing.step1Desc}</p>
                <div className="absolute -bottom-8 -right-8 text-[120px] font-black text-surface-alt/50 select-none pointer-events-none group-hover:scale-110 transition-transform">1</div>
             </div>
             
             {/* Step 2 */}
             <div className="bg-surface border border-border-color rounded-2xl p-8 hover:border-brand-primary/30 transition-all flex flex-col group relative overflow-hidden">
                <div className="w-14 h-14 bg-surface-alt text-brand-primary rounded-2xl flex items-center justify-center mb-8 border border-border-color relative z-10">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-tighter relative z-10">{translations[lang].landing.step2Title}</h3>
                <p className="text-[14px] text-text-muted leading-relaxed font-medium relative z-10">{translations[lang].landing.step2Desc}</p>
                <div className="absolute -bottom-8 -right-8 text-[120px] font-black text-surface-alt/50 select-none pointer-events-none group-hover:scale-110 transition-transform">2</div>
             </div>
             
             {/* Step 3 */}
             <div className="bg-surface border border-border-color rounded-2xl p-8 hover:border-brand-primary/30 transition-all flex flex-col group relative overflow-hidden">
                <div className="w-14 h-14 bg-surface-alt text-brand-primary rounded-2xl flex items-center justify-center mb-8 border border-border-color relative z-10">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-tighter relative z-10">{translations[lang].landing.step3Title}</h3>
                <p className="text-[14px] text-text-muted leading-relaxed font-medium relative z-10">{translations[lang].landing.step3Desc}</p>
                <div className="absolute -bottom-8 -right-8 text-[120px] font-black text-surface-alt/50 select-none pointer-events-none group-hover:scale-110 transition-transform">3</div>
             </div>
           </div>
        </section>

        {/* 3. FEATURES SECTION */}
        <section id="features" className="bg-brand-primary/5 border-y border-border-color py-48 mb-56">
           <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-20">
               <h2 className="text-3xl font-bold tracking-tighter mb-4">{translations[lang].landing.featuresTitle}</h2>
               <p className="text-text-muted text-[13px] font-semibold uppercase tracking-[0.2em]">{translations[lang].landing.featuresSubtitle}</p>
             </div>
             
             <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="flex gap-5 items-start">
                   <div className="w-10 h-10 rounded-xl bg-surface border border-border-color text-brand-primary flex flex-shrink-0 items-center justify-center">
                     <Shield className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-lg font-bold mb-2">{translations[lang].landing.featPrivate}</h4>
                     <p className="text-[14px] text-text-muted leading-relaxed font-medium">{translations[lang].landing.featPrivateDesc}</p>
                   </div>
                </div>
                <div className="flex gap-5 items-start">
                   <div className="w-10 h-10 rounded-xl bg-surface border border-border-color text-brand-primary flex flex-shrink-0 items-center justify-center">
                     <Database className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-lg font-bold mb-2">{translations[lang].landing.featCatalog}</h4>
                     <p className="text-[14px] text-text-muted leading-relaxed font-medium">{translations[lang].landing.featCatalogDesc}</p>
                   </div>
                </div>
                <div id="integrations" className="flex gap-5 items-start">
                   <div className="w-10 h-10 rounded-xl bg-surface border border-border-color text-brand-primary flex flex-shrink-0 items-center justify-center">
                     <Network className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-lg font-bold mb-2">{translations[lang].landing.featIntegrations}</h4>
                     <p className="text-[14px] text-text-muted leading-relaxed font-medium">{translations[lang].landing.featIntegrationsDesc}</p>
                   </div>
                </div>
                <div className="flex gap-5 items-start">
                   <div className="w-10 h-10 rounded-xl bg-surface border border-border-color text-brand-primary flex flex-shrink-0 items-center justify-center">
                     <Activity className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-lg font-bold mb-2">{translations[lang].landing.featWorkflow}</h4>
                     <p className="text-[14px] text-text-muted leading-relaxed font-medium">{translations[lang].landing.featWorkflowDesc}</p>
                   </div>
                </div>
             </div>
           </div>
        </section>

        {/* 4. PROBLEMS VS SOLUTION */}
        <section className="max-w-7xl mx-auto px-6 mb-56">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold tracking-tighter mb-4">{translations[lang].landing.problemsTitle}</h2>
             <p className="text-text-muted text-[13px] font-semibold uppercase tracking-[0.2em]">{translations[lang].landing.problemsSubtitle}</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8">
              {/* Manual Approach */}
              <div className="bg-brand-danger/5 border border-brand-danger/20 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                 <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mb-8 border border-brand-danger/20 shadow-sm relative z-10">
                   <div className="w-6 h-6 rounded-full border-2 border-brand-danger flex items-center justify-center relative">
                     <div className="w-px h-8 bg-brand-danger absolute transform rotate-45" />
                   </div>
                 </div>
                 <h3 className="text-2xl font-bold tracking-tighter text-brand-danger mb-8 relative z-10">{translations[lang].landing.manualApproach}</h3>
                 
                 <div className="space-y-4 relative z-10">
                    {[
                      translations[lang].landing.prob1,
                      translations[lang].landing.prob2,
                      translations[lang].landing.prob3,
                      translations[lang].landing.prob4,
                      translations[lang].landing.prob5
                    ].map((prob, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-danger shrink-0 mt-2" />
                        <span className="text-[14px] font-medium text-text-main/80">{prob}</span>
                      </div>
                    ))}
                 </div>
              </div>
              
              {/* Digital Approach */}
              <div className="bg-brand-success/5 border border-brand-success/20 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                 <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mb-8 border border-brand-success/20 shadow-sm relative z-10">
                   <CheckCircle2 className="w-8 h-8 text-brand-success" />
                 </div>
                 <h3 className="text-2xl font-bold tracking-tighter text-brand-success mb-8 relative z-10">{translations[lang].landing.digitalApproach}</h3>
                 
                 <div className="space-y-4 relative z-10">
                    {[
                      translations[lang].landing.sol1,
                      translations[lang].landing.sol2,
                      translations[lang].landing.sol3,
                      translations[lang].landing.sol4,
                      translations[lang].landing.sol5
                    ].map((sol, i) => (
                      <div key={i} className="flex gap-4">
                        <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                        <span className="text-[14px] font-medium text-text-main/90">{sol}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* 5. ACCESS SECTION */}
        <section className="max-w-4xl mx-auto px-6 mb-56 text-center">
           <div className="p-12 md:p-20 bg-surface border border-border-color rounded-3xl relative overflow-hidden shadow-accent">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-8 leading-tight">
                  {translations[lang].landing.joinNetwork}
                </h2>
                <p className="text-lg text-text-muted mb-12 max-w-xl mx-auto font-medium">
                  {translations[lang].landing.joinNetworkDesc}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <button 
                     onClick={handleStart}
                     className="btn-primary px-10 py-5 text-[16px] font-bold shadow-xl"
                   >
                     {translations[lang].landing.openPlatform}
                   </button>
                   <button 
                     onClick={handleStart}
                     className="btn-secondary px-10 py-5 text-[16px] font-bold"
                   >
                     {translations[lang].landing.loginToDashboard}
                   </button>
                </div>
                
                <div className="mt-12 pt-12 border-t border-border-color flex flex-wrap justify-center gap-x-12 gap-y-6">
                   <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-black">{translations[lang].landing.averageUptime}</span>
                      <span className="text-xl font-bold">99.998%</span>
                   </div>
                   <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-black">{translations[lang].landing.dataLatency}</span>
                      <span className="text-xl font-bold">{'<'}120ms</span>
                   </div>
                   <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                      <span className="text-[10px] uppercase tracking-widest text-text-muted font-black">{translations[lang].landing.activePartners}</span>
                      <span className="text-xl font-bold">450+ Entities</span>
                   </div>
                </div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-color pt-24 pb-12 bg-surface/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
             <img src="https://drive.google.com/thumbnail?id=1Zzhxcg4wGu4HCBSmPptAhuTqb-s8yb3D&sz=w1000" alt="ASTHEA Logo" className="w-8 h-8 object-contain" />
             <span className="font-bold tracking-tight text-[15px] uppercase">Asthea OMS</span>
          </div>
          <p className="text-[13px] text-text-muted leading-relaxed font-medium mb-16 max-w-sm">
             {translations[lang].landing.footerDesc}
          </p>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border-color gap-6">
             <div className="flex flex-col sm:flex-row items-center gap-6 text-[12px] text-text-muted font-medium">
                <button onClick={() => setPrivacyOpen(true)} className="hover:text-text-main transition-colors text-left font-semibold">
                  {lang === 'RU' ? 'Политика конфиденциальности' : 'Maxfiylik siyosati'}
                </button>
                <button onClick={() => setTermsOpen(true)} className="hover:text-text-main transition-colors text-left font-semibold">
                  {lang === 'RU' ? 'Условия использования' : 'Foydalanish shartlari'}
                </button>
                <button onClick={() => setInfoSharingOpen(true)} className="hover:text-text-main transition-colors text-left font-semibold">
                  {lang === 'RU' ? 'Политика обмена информацией' : 'Ma\'lumot almashish siyosati'}
                </button>
             </div>
             <div className="text-[12px] text-text-muted font-medium text-center">
               {translations[lang].landing.footerCopyright.replace('{year}', new Date().getFullYear().toString())}
             </div>
          </div>
        </div>
      </footer>
      
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setPrivacyOpen(false)} lang={lang} />
      <TermsOfUseModal isOpen={isTermsOpen} onClose={() => setTermsOpen(false)} lang={lang} />
      <InfoSharingPolicyModal isOpen={isInfoSharingOpen} onClose={() => setInfoSharingOpen(false)} lang={lang} />
    </div>
  );
}

