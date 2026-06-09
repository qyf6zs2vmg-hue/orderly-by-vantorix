import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Lock, Mail, User as UserIcon, EyeOff, Building2, Globe } from 'lucide-react';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { TermsOfUseContent } from '../components/TermsOfUseContent';
import { LanguageToggle } from '../components/LanguageToggle';
import { translations, Language } from '../constants/translations';

import { motion } from 'motion/react';

export default function Register() {
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessMode, setAccessMode] = useState<'private' | 'public' | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isAccessModeModalOpen, setIsAccessModeModalOpen] = useState(false);
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
    if (!accessMode) {
      setError(lang === 'RU' ? 'Выберите режим доступа' : 'Kirish rejimini tanlang');
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
        accessMode: accessMode,
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

  if (isTermsModalOpen) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col p-6 font-sans relative overflow-x-hidden">
        <div className="max-w-3xl mx-auto w-full pt-10 pb-20 relative z-10">
          <button 
            onClick={() => setIsTermsModalOpen(false)} 
            className="mb-6 flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-medium"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
             {lang === 'RU' ? 'Назад к регистрации' : 'Ro\'yxatdan o\'tishga qaytish'}
          </button>
          <div className="bg-surface rounded-[24px] p-8 sm:p-10 shadow-[0_4px_12px_rgba(16,24,40,0.06)] border border-border-color">
             <div className="text-text-muted leading-relaxed text-[13px]">
               <TermsOfUseContent lang={lang} />
             </div>
          </div>
        </div>
      </div>
    );
  }

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
    <>
      {isAccessModeModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-text-main/50 backdrop-blur-sm">
          <div className="max-w-2xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-surface rounded-[24px] p-6 sm:p-8 shadow-2xl border border-border-color">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-text-main tracking-tight">{lang === 'RU' ? 'Режим доступа' : 'Kirish rejimi'}</h2>
                <button onClick={() => setIsAccessModeModalOpen(false)} className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-text-muted hover:text-text-main hover:bg-border-color/50 transition-colors border border-border-color">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-2 border border-border-color rounded-2xl p-4 bg-surface-alt/30">
                  <h3 className="text-[16px] font-bold text-text-main flex items-center gap-2 mb-3">
                    <Lock className="w-5 h-5 text-text-muted" /> Private Access
                  </h3>
                  {lang === 'RU' ? (
                    <div className="text-[13px] text-text-muted leading-relaxed space-y-2">
                      <p className="font-bold text-text-main">Доступ только для приглашённых клиентов.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Каждый клиент получает персональную invite-ссылку и должен зарегистрироваться для входа.</li>
                        <li>Только зарегистрированные и одобренные пользователи могут просматривать каталог, остатки и цены.</li>
                      </ul>
                      <p className="mt-2 pt-2 border-t border-border-color text-text-muted"><i>Подходит для компаний с закрытой клиентской базой и ограниченным доступом к информации.</i></p>
                    </div>
                  ) : (
                    <div className="text-[13px] text-text-muted leading-relaxed space-y-2">
                      <p className="font-bold text-text-main">Faqat taklif qilingan mijozlar kirishi mumkin.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Har bir mijoz shaxsiy invite-havola orqali ro‘yxatdan o‘tadi.</li>
                        <li>Faqat ro‘yxatdan o‘tgan va tasdiqlangan foydalanuvchilar katalog, narxlar va qoldiqlarni ko‘ra oladi.</li>
                      </ul>
                      <p className="mt-2 pt-2 border-t border-border-color text-text-muted"><i>Yopiq mijozlar bazasiga ega kompaniyalar uchun mos.</i></p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 border border-border-color rounded-2xl p-4 bg-surface-alt/30">
                  <h3 className="text-[16px] font-bold text-text-main flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-text-muted" /> Public Access
                  </h3>
                  {lang === 'RU' ? (
                    <div className="text-[13px] text-text-muted leading-relaxed space-y-2">
                      <p className="font-bold text-text-main">Доступ без регистрации.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Любой пользователь, имеющий ссылку на компанию, может открыть каталог и просматривать товары, остатки и цены.</li>
                        <li>Invite-ссылки и регистрация клиентов не требуются.</li>
                      </ul>
                      <p className="mt-2 pt-2 border-t border-border-color text-text-muted"><i>Подходит для компаний, которым важно быстро делиться каталогом с клиентами.</i></p>
                    </div>
                  ) : (
                    <div className="text-[13px] text-text-muted leading-relaxed space-y-2">
                      <p className="font-bold text-text-main">Ro‘yxatdan o‘tmasdan kirish mumkin.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Kompaniya havolasiga ega bo‘lgan har qanday foydalanuvchi katalog, narxlar va qoldiqlarni ko‘ra oladi.</li>
                        <li>Invite-havola va mijoz ro‘yxatdan o‘tishi talab qilinmaydi.</li>
                      </ul>
                      <p className="mt-2 pt-2 border-t border-border-color text-text-muted"><i>Katalogni tez ulashishni istagan kompaniyalar uchun mos.</i></p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 flex justify-end">
                <button 
                  onClick={() => setIsAccessModeModalOpen(false)}
                  className="px-6 py-2.5 bg-text-main text-bg-base rounded-xl font-bold text-[13px] hover:bg-text-main/90 transition-all"
                >
                  {lang === 'RU' ? 'Понятно' : 'Tushunarli'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    <div className="min-h-screen bg-bg-base flex flex-col font-sans overflow-x-hidden relative">
      <div className="absolute top-6 right-6 z-[100]">
        <LanguageToggle currentLang={lang} onLangChange={setLang} variant="minimal" />
      </div>

      {/* Global Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-text-main/10 rounded-full blur-[100px] md:blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-brand-accent/10 rounded-full blur-[80px] md:blur-[100px]" />
      </div>

      {/* Form Column */}
      <div className="w-full flex flex-col items-center justify-center py-4 px-4 relative min-h-[100dvh] md:min-h-screen">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[400px] relative z-10 my-auto"
        >
          <div className="bg-surface/80 backdrop-blur-xl rounded-[20px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(17,24,39,0.05)] border border-white/20 flex flex-col items-center text-left">
            <h3 className="text-[14px] font-bold tracking-tight text-text-main mb-4 w-full uppercase text-center">{t.auth.registerTitle}</h3>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-2 rounded-[10px] text-[12px] font-medium mb-4 text-center animate-shake">
                  {error}
                </div>
              )}
              
              <form onSubmit={registerOwner} className="space-y-3">
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
                    className="space-y-1"
                  >
                    <label className="text-[11px] font-bold text-text-main uppercase tracking-wider ml-1">{field.label}</label>
                    <div className="relative group">
                         <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-text-main transition-colors" />
                         <input
                          type={field.type || 'text'}
                          required
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 rounded-[10px] bg-bg-base/50 border border-border-color/50 text-text-main focus:bg-surface focus:border-text-muted focus:ring-2 focus:ring-text-muted/10 outline-none transition-all placeholder:text-text-muted/60 text-[13px] shadow-sm"
                          placeholder={field.placeholder}
                          minLength={field.id === 'password' ? 6 : undefined}
                        />
                    </div>
                  </motion.div>
                ))}


                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-1.5 pt-1"
                >
                  <div className="flex items-center gap-2 ml-1">
                    <label className="text-[11px] font-bold text-text-main uppercase tracking-wider">{lang === 'RU' ? 'Режим доступа' : 'Kirish rejimi'}</label>
                    <button 
                      type="button" 
                      onClick={() => setIsAccessModeModalOpen(true)}
                      className="bg-surface-alt border border-border-color rounded-full w-4 h-4 flex items-center justify-center text-[10px] text-text-muted hover:text-text-main transition-colors"
                      title={lang === 'RU' ? 'Что это?' : "Bu nima?"}
                    >
                      ?
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setAccessMode('private')}
                      className={`p-2 rounded-[10px] border transition-all text-left flex flex-col justify-center gap-1 ${accessMode === 'private' ? 'bg-text-main border-text-main shadow-md' : 'bg-surface-alt border-border-color hover:border-text-muted/50'}`}
                    >
                      <span className={`text-[12px] font-bold flex items-center gap-1.5 ${accessMode === 'private' ? 'text-bg-base' : 'text-text-main'}`}><Lock className="w-3.5 h-3.5 opacity-70" /> Private Access</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAccessMode('public')}
                      className={`p-2 rounded-[10px] border transition-all text-left flex flex-col justify-center gap-1 ${accessMode === 'public' ? 'bg-text-main border-text-main shadow-md' : 'bg-surface-alt border-border-color hover:border-text-muted/50'}`}
                    >
                      <span className={`text-[12px] font-bold flex items-center gap-1.5 ${accessMode === 'public' ? 'text-bg-base' : 'text-text-main'}`}><Globe className="w-3.5 h-3.5 opacity-70" /> Public Access</span>
                    </button>
                  </div>
                </motion.div>

                 <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="pt-1 px-1"
                 >
                    <label className="flex items-start gap-3 group cursor-pointer">
                      <div className={`mt-0.5 w-4 h-4 shrink-0 flex items-center justify-center rounded border transition-all ${agreePrivacy ? 'bg-text-main border-text-main shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-surface-alt border-border-color group-hover:border-text-muted'}`}>
                        {agreePrivacy && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                      />
                      <span className="text-[11px] text-text-muted leading-tight group-hover:text-text-main transition-colors select-none">
                        {lang === 'RU' ? 'Я согласен с ' : 'Men '}<button type="button" onClick={(e) => { e.stopPropagation(); setIsPrivacyModalOpen(true); }} className="text-text-main hover:underline font-bold">{lang === 'RU' ? 'Политикой конфиденциальности' : 'Maxfiylik siyosatiga'}</button> {lang === 'RU' ? 'и' : 'va'} <button type="button" onClick={(e) => { e.stopPropagation(); setIsTermsModalOpen(true); }} className="text-text-main hover:underline font-bold">{lang === 'RU' ? 'Условиями использования' : 'Foydalanish shartlariga roziman'}</button>
                      </span>
                    </label>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-text-main hover:bg-text-main/90 text-bg-base py-2.5 px-6 rounded-[10px] font-bold hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center text-[13px] tracking-wide uppercase mt-3"
                >
                  {loading ? t.auth.registering : t.auth.registerButton}
                </motion.button>
              </form>

              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="text-[12px] text-text-muted">
                  {t.auth.alreadyHaveAccount}{' '}
                  <Link to="/login" className="font-bold text-text-main hover:text-text-muted transition-colors underline underline-offset-4">
                    {t.auth.loginLink}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
