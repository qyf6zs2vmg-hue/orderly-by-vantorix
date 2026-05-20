import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Lock, Mail, User as UserIcon, EyeOff, Building2, Globe } from 'lucide-react';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { LanguageToggle } from '../components/LanguageToggle';
import { translations, Language } from '../constants/translations';

import { motion } from 'motion/react';

export default function Register() {
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [lang, setLang] = useState<Language>('RU');
  const t = translations[lang];
  const navigate = useNavigate();
  const { user, appUser } = useAuth();

  if (user && appUser) {
    return <Navigate to="/" replace />;
  }

  const registerOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePrivacy) {
      setError(lang === 'RU' ? 'Вы должны согласиться с Политикой конфиденциальности' : 'Maxfiylik siyosatiga rozilik berishingiz kerak');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', uid);
      const newBusinessRef = doc(collection(db, 'businesses'));
      const businessId = newBusinessRef.id;

      batch.set(newBusinessRef, {
        name: businessName,
        ownerId: uid,
        createdAt: Date.now()
      });

      batch.set(userRef, {
        name: name,
        email: email,
        role: 'owner',
        status: 'active',
        businessId: businessId,
        uid: uid,
        securityAcknowledged: true,
        onboardingComplete: false
      });

      await batch.commit();

      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError(err.message || (lang === 'RU' ? 'Ошибка регистрации' : 'Ro\'yxatdan o\'tishda xatolik'));
    } finally {
      setLoading(false);
    }
  };

  if (isPrivacyModalOpen) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col p-6 font-sans relative overflow-x-hidden">
        <div className="max-w-3xl mx-auto w-full pt-10 pb-20 relative z-10">
          <button 
            onClick={() => setIsPrivacyModalOpen(false)} 
            className="mb-6 flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-medium"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
             {lang === 'RU' ? 'Назад к регистрации' : 'Ro\'yxatdan o\'tishga qaytish'}
          </button>
          <div className="bg-surface rounded-[24px] p-8 sm:p-10 shadow-[0_4px_12px_rgba(16,24,40,0.06)] border border-border-color">
             <div className="text-text-muted leading-relaxed text-[13px]">
               <PrivacyPolicyContent lang={lang} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col md:flex-row font-sans overflow-x-hidden relative">
      <div className="absolute top-6 right-6 z-[100]">
        <LanguageToggle currentLang={lang} onLangChange={setLang} variant="minimal" />
      </div>

      {/* Desktop Branding Column */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-surface border-r border-border-color flex-col justify-center px-10 xl:px-20 relative overflow-hidden">
        {/* Background blobs for desktop */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-text-main/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-brand-accent/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mt-16 text-3xl lg:text-4xl font-bold text-text-main tracking-tight leading-tight">
              {lang === 'RU' ? 'Ваш B2B портал готов к запуску.' : 'Sizning B2B portalingiz ishga tushishga tayyor.'}
            </h2>
            <p className="mt-6 text-text-muted text-[15px] leading-relaxed">
              {lang === 'RU' 
                ? 'Asthea OMS предоставляет все необходимые инструменты для автоматизации оптовых продаж: удобные каталоги, управление заказами и клиентской базой.' 
                : 'Asthea OMS ulgurji savdoni avtomatlashtirish uchun barcha zarur vositalarni taqdim etadi: qulay kataloglar, buyurtmalar va mijozlar bazasini boshqarish.'}
            </p>
            
            <div className="mt-12 flex flex-col gap-6">
              {[
                  lang === 'RU' ? "Удобные каталоги и актуальные остатки" : "Qulay kataloglar va dolzarb qoldiqlar",
                  lang === 'RU' ? "Работа только с проверенными клиентами по инвайт-кодам" : "Faqat tasdiqlangan mijozlar bilan ishlash",
                  lang === 'RU' ? "Полный контроль над статусами заказов" : "Buyurtma holatlarini to'liq nazorat qilish"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                   <div className="w-10 h-10 card-largexl bg-surface-alt flex items-center justify-center flex-shrink-0 text-text-main font-bold shadow-sm border border-border-color">
                      {(i + 1).toString().padStart(2, '0')}
                   </div>
                   <span className="font-bold text-text-main text-[14px]">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Column */}
      <div className="w-full md:w-[55%] lg:w-[50%] flex flex-col items-center justify-center p-4 md:p-12 relative min-h-[100dvh] md:min-h-screen">
        {/* Mobile Background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none md:hidden">
          <div className="absolute top-[5%] right-[5%] w-[20rem] h-[20rem] bg-text-main/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[20rem] h-[20rem] bg-brand-accent/10 rounded-full blur-[80px]" />
        </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px] relative z-10"
        >
          <div className="bg-surface/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(17,24,39,0.05)] border border-white/20 flex flex-col items-center text-left">
            <img src="https://drive.google.com/thumbnail?id=1l7HkE_p4K09Xwkv9g9JAiFzfTuViiWvZ&sz=w1000" alt="ASTHEA Logo" className="w-16 h-auto mb-2 object-contain" />
            <h1 className="text-xl font-black text-text-main tracking-tight mb-4">Asthea OMS</h1>
            <h3 className="text-[16px] font-black tracking-tight text-text-main mb-6 w-full uppercase text-center">{t.auth.registerTitle}</h3>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[12px] text-[13px] font-medium mb-6 text-center animate-shake">
                  {error}
                </div>
              )}
              
              <form onSubmit={registerOwner} className="space-y-5">
                {[
                  { id: 'business', label: t.auth.companyName, icon: Building2, value: businessName, setter: setBusinessName, placeholder: t.auth.companyPlaceholder },
                  { id: 'name', label: t.auth.contactPerson, icon: UserIcon, value: name, setter: setName, placeholder: t.auth.contactPlaceholder },
                  { id: 'email', label: 'Email', icon: Mail, type: 'email', value: email, setter: setEmail, placeholder: 'work@company.com' },
                  { id: 'password', label: t.auth.password, icon: Lock, type: 'password', value: password, setter: setPassword, placeholder: t.auth.passwordPlaceholder }
                ].map((field, idx) => (
                  <motion.div 
                    key={field.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[12px] font-bold text-text-main uppercase tracking-wider ml-1">{field.label}</label>
                    <div className="relative group">
                         <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-text-main transition-colors" />
                         <input
                          type={field.type || 'text'}
                          required
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-[12px] bg-bg-base/50 border border-border-color/50 text-text-main focus:bg-surface focus:border-text-muted focus:ring-4 focus:ring-text-muted/10 outline-none transition-all placeholder:text-text-muted/60 text-[14px] shadow-sm"
                          placeholder={field.placeholder}
                          minLength={field.id === 'password' ? 6 : undefined}
                        />
                    </div>
                  </motion.div>
                ))}

                 <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="pt-2 px-1"
                 >
                    <label className="flex items-start gap-4 group cursor-pointer">
                      <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded-lg border transition-all ${agreePrivacy ? 'bg-text-main border-text-main shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-surface-alt border-border-color group-hover:border-text-muted'}`}>
                        {agreePrivacy && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                      />
                      <span className="text-[12px] text-text-muted leading-relaxed group-hover:text-text-main transition-colors select-none">
                        {lang === 'RU' ? 'Я согласен с ' : 'Men '}<button type="button" onClick={(e) => { e.stopPropagation(); setIsPrivacyModalOpen(true); }} className="text-text-main hover:underline font-bold">{lang === 'RU' ? 'Политикой конфиденциальности' : 'Maxfiylik siyosatiga roziman'}</button>
                      </span>
                    </label>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-text-main hover:bg-text-main/90 text-bg-base py-3.5 px-6 rounded-[14px] font-bold hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center text-[15px] tracking-wide uppercase mt-6"
                >
                  {loading ? t.auth.registering : t.auth.registerButton}
                </motion.button>
              </form>

              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="text-[13px] text-text-muted">
                  {t.auth.alreadyHaveAccount}{' '}
                  <Link to="/login" className="font-bold text-text-main hover:text-text-muted transition-colors underline underline-offset-4">
                    {t.auth.loginLink}
                  </Link>
                </div>

                <Link 
                  to="/welcome" 
                  className="text-[13px] font-bold text-text-main hover:text-text-muted transition-colors underline underline-offset-4 mt-2"
                >
                  {t.auth.moreInfo}
                </Link>

                <div className="pt-6 border-t border-border-color/50 w-full text-center">
                    <span className="text-[10px] font-bold text-text-muted tracking-[0.3em] uppercase opacity-50">
                      © {new Date().getFullYear()} Asthea OMS
                    </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
