import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate, useSearchParams, useParams, Navigate, Link } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, EyeOff, Building2, Globe, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { SplashScreen } from '../components/SplashScreen';
import { SecurityConfirmationModal } from '../components/SecurityConfirmationModal';
import { LanguageToggle } from '../components/LanguageToggle';
import { translations, Language } from '../constants/translations';

export default function Join() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const code = params.code || searchParams.get('code');
  const [lang, setLang] = useState<Language>('RU');
  const t = translations[lang];
  
  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  
  const navigate = useNavigate();
  const { user, appUser } = useAuth();
  
  useEffect(() => {
    if (user && appUser && inviteData) {
      if (appUser.role === 'client' && appUser.businessId === inviteData.businessId) {
         navigate('/client', { replace: true });
      }
    }
  }, [user, appUser, inviteData, navigate]);

  useEffect(() => {
    async function checkInvite() {
      if (!code) {
        setInviteError(lang === 'RU' ? 'Код приглашения не указан' : 'Taklif kodi ko\'rsatilmagan');
        setLoadingInvite(false);
        return;
      }

      try {
        const inviteDoc = await getDoc(doc(db, 'invites', code));
        if (!inviteDoc.exists()) {
          setInviteError(lang === 'RU' ? 'Неверный код приглашения' : 'Taklif kodi noto\'g\'ri');
        } else {
          const data = inviteDoc.data();
          if (data.blocked) {
            setInviteError(lang === 'RU' ? 'Этот инвайт-код заблокирован' : 'Ushbu taklif kodi bloklangan');
          } else if (data.used) {
            setInviteError(lang === 'RU' ? 'Этот инвайт-код уже использован' : 'Ushbu taklif kodi allaqachon ishlatilgan');
          } else {
            if (data.businessId) {
              const busDoc = await getDoc(doc(db, 'businesses', data.businessId));
              if (busDoc.exists()) {
                setInviteData({ id: inviteDoc.id, businessName: busDoc.data().name, ...data });
              } else {
                setInviteData({ id: inviteDoc.id, businessName: lang === 'RU' ? 'Неизвестный бизнес' : 'Noma\'lum biznes', ...data });
              }
            } else {
              setInviteData({ id: inviteDoc.id, businessName: lang === 'RU' ? 'Неизвестный бизнес' : 'Noma\'lum biznes', ...data });
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setInviteError(lang === 'RU' ? 'Ошибка проверки кода' : 'Kodni tekshirishda xatolik');
      } finally {
        setLoadingInvite(false);
      }
    }

    checkInvite();
  }, [code, lang]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inviteData) return;
    if (!isLogin && !agreePrivacy) {
      setError(lang === 'RU' ? 'Вы должны согласиться с Политикой конфиденциальности' : 'Maxfiylik siyosatiga rozilik berishingiz kerak');
      return;
    }
    
    if (!isLogin) {
      setIsSecurityModalOpen(true);
    } else {
      processSubmit();
    }
  };

  const processSubmit = async () => {
    setIsSecurityModalOpen(false);
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (userDoc.exists()) {
          const ud = userDoc.data();
          if (ud.role === 'client') {
            if (ud.businessId !== inviteData.businessId) {
                // Assign to this new business? 
                // Typically you only belong to one business or we just overwrite it
                await updateDoc(doc(db, 'users', uid), {
                    businessId: inviteData.businessId,
                    inviteCode: code,
                    status: ud.status === 'blocked' ? 'blocked' : 'pending' 
                });
                await updateDoc(doc(db, 'invites', inviteData.id), { used: true });
            }
            navigate('/client');
          } else {
             navigate('/admin');
          }
        }
      } else {
        // Handle Register
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

          await setDoc(doc(db, 'users', uid), {
            uid: uid,
            name: name,
            email: email,
            role: 'client',
            status: 'pending',
            inviteCode: code,
            businessId: inviteData.businessId,
            securityAcknowledged: true,
            onboardingComplete: false
          });

        await updateDoc(doc(db, 'invites', inviteData.id), {
          used: true
        });

        // Skip email verification and don't sign out. The AuthContext will pick up the user,
        // and the useEffect above will redirect them to /client, which in turn will show PendingApproval.
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError(lang === 'RU' ? 'Неверный email или пароль' : 'Email yoki parol noto\'g\'ri');
      } else if (err.code === 'auth/email-already-in-use') {
        setError(lang === 'RU' ? 'Этот email уже зарегистрирован. Войдите в аккаунт.' : 'Ushbu email allaqachon ro\'yxatdan o\'tgan. Hisobga kiring.');
      } else {
        setError(err.message || (lang === 'RU' ? 'Ошибка' : 'Xatolik'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvite) {
    return <SplashScreen />;
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-brand-danger/10 text-brand-danger p-6 rounded-[16px] max-w-[420px] w-full font-medium shadow-sm border border-brand-danger/20">
          {inviteError}
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
            className="mb-6 flex items-center text-text-muted hover:text-text-main transition-colors text-[13px] font-medium"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
             Назад к регистрации
          </button>
          <div className="bg-surface rounded-[24px] p-8 sm:p-10 shadow-[0_4px_12px_rgba(16,24,40,0.06)] border border-border-color">
             <h1 className="text-[22px] font-bold text-text-main tracking-tight mb-8">Политика конфиденциальность Vantorix</h1>
             <div className="text-text-muted leading-relaxed text-[13px]">
               <PrivacyPolicyContent />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && appUser && inviteData) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="w-full max-w-[420px] relative z-10 my-8">
          <div className="bg-surface rounded-[24px] p-10 shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color flex flex-col items-center text-center">
            
            <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6 border border-brand-primary/20">
              <UserIcon className="w-8 h-8" />
            </div>
            
            <h1 className="text-[22px] font-bold text-text-main tracking-tight mb-3">Вы уже авторизованы</h1>
            <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
              Вы вошли в систему как <br /><span className="font-medium text-text-main">{appUser.email || user.email}</span>.<br/><br/>
              Чтобы зарегистрироваться или войти по этому приглашению, необходимо выйти из текущего аккаунта.
            </p>

            <div className="w-full flex gap-3">
               <button
                 onClick={() => signOut(auth)}
                 className="flex-1 bg-surface border border-border-color hover:bg-surface-alt text-text-main py-2.5 px-4 rounded-[10px] font-medium transition-colors shadow-sm text-[13px] btn-secondary"
               >
                 Выйти
               </button>
               <button
                 onClick={() => navigate(appUser.role === 'client' ? '/client' : '/admin')}
                 className="flex-1 btn-primary  py-2.5 px-4 rounded-[10px] font-medium transition-opacity hover:opacity-90 shadow-sm text-[13px]"
               >
                 В панель
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle currentLang={lang} onLangChange={setLang} />
      </div>

      <div className="w-full max-w-[420px] relative z-10 my-8">
        <div className="bg-surface rounded-[24px] p-10 shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color flex flex-col items-center">
          <div className="text-center mb-8 w-full flex flex-col items-center">
            <h1 className="text-[18px] font-bold text-text-main tracking-tight mb-2 text-center">{inviteData?.businessName || "Загрузка..."}</h1>
            <p className="text-[13px] text-text-muted font-medium mb-4 text-center" style={{ textWrap: "balance" }}>
               {lang === 'RU' ? 'Завершение регистрации: заполните форму, чтобы присоединиться' : 'Ro\'yxatdan o\'tishni yakunlash: qo\'shilish uchun shaklni to\'ldiring'}
            </p>
          </div>

          <div className="w-full">
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[10px] text-[13px] font-medium mb-6 text-center">
                  {error}
                </div>
              )}
              
              <div className="flex bg-surface-alt rounded-[12px] p-1.5 mb-8 border border-border-color">
                 <button
                   onClick={() => { setIsLogin(false); setError(''); }}
                   className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${!isLogin ? 'bg-surface shadow-sm text-brand-primary' : 'text-text-muted hover:text-text-main'}`}
                 >
                   {lang === 'RU' ? 'Регистрация' : 'Ro\'yxatdan o\'tish'}
                 </button>
                 <button
                   onClick={() => { setIsLogin(true); setError(''); }}
                   className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${isLogin ? 'bg-surface shadow-sm text-brand-primary' : 'text-text-muted hover:text-text-main'}`}
                 >
                   {lang === 'RU' ? 'Вход' : 'Kirish'}
                 </button>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-text-main ml-1">{lang === 'RU' ? 'Ваше имя' : 'Ismingiz'}</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-muted text-[13px] shadow-sm"
                        placeholder={lang === 'RU' ? "Иван Иванов" : "Ism Familiya"}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-text-main ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-muted text-[13px] shadow-sm"
                      placeholder="example@vantorix.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-text-main ml-1">{lang === 'RU' ? 'Пароль' : 'Parol'}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-muted text-[13px] shadow-sm"
                      placeholder={lang === 'RU' ? "Минимум 6 символов" : "Kamida 6 belgi"}
                      minLength={6}
                    />
                  </div>
                </div>

                {!isLogin && (
                   <div className="pt-2 px-1">
                      <label className="flex items-start gap-4 group cursor-pointer">
                        <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded-lg border transition-all ${agreePrivacy ? 'bg-brand-primary border-brand-primary shadow-[0_0_10px_rgba(79,124,255,0.2)]' : 'bg-surface-alt border-border-color group-hover:border-text-muted'}`}>
                          {agreePrivacy && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={agreePrivacy}
                          onChange={(e) => setAgreePrivacy(e.target.checked)}
                        />
                        <span className="text-[12px] text-text-muted leading-relaxed group-hover:text-text-main transition-colors select-none">
                          {lang === 'RU' ? 'Я согласен с ' : 'Men '}<button type="button" onClick={(e) => { e.stopPropagation(); setIsPrivacyModalOpen(true); }} className="text-brand-primary hover:underline font-bold">{lang === 'RU' ? 'Политикой конфиденциальности' : 'Maxfiylik siyosatiga roziman'}</button>
                        </span>
                      </label>
                   </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold h-12 rounded-xl text-[14px] mt-6 transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      {isLogin ? (lang === 'RU' ? 'Войти' : 'Kirish') : (lang === 'RU' ? 'Создать аккаунт' : 'Hisob yaratish')}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

               <div className="mt-8 text-center text-[11px] text-text-muted font-medium uppercase tracking-[0.2em] flex flex-col items-center gap-4">
                  <Link 
                    to="/welcome" 
                    className="text-[13px] font-bold text-brand-primary hover:text-brand-secondary transition-colors underline underline-offset-4 normal-case tracking-normal"
                  >
                    Подробная информация о сайте
                  </Link>
                  <span>DEVELOPED BY VANTORIX LABS</span>
               </div>
          </div>
        </div>
      </div>
      <SecurityConfirmationModal 
        isOpen={isSecurityModalOpen} 
        onConfirm={processSubmit} 
        lang={lang}
      />
    </div>
  );
}
