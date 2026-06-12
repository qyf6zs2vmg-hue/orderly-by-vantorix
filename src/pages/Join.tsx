import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate, useSearchParams, useParams, Navigate, Link } from 'react-router-dom';
import { User as UserIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { TermsOfUseContent } from '../components/TermsOfUseContent';
import { SplashScreen } from '../components/SplashScreen';
import { LanguageToggle } from '../components/LanguageToggle';
import { translations, Language } from '../constants/translations';
import { TelegramLoginWidget } from '../components/TelegramLoginWidget';
import { authenticateWithTelegram } from '../lib/telegramAuth';

export default function Join() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const code = params.code || searchParams.get('code');
  const [lang, setLang] = useState<Language>('RU');
  const t = translations[lang];
  
  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
          const doAnonymousJoin = async (businessId: string, isPublicLink: boolean, inviteId: string) => {
             try {
                const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                const randomEmail = `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}@relible.local`;
                const userCred = await createUserWithEmailAndPassword(auth, randomEmail, randomPassword);
                const uid = userCred.user.uid;
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (!userDoc.exists()) {
                    await setDoc(doc(db, 'users', uid), {
                      uid: uid,
                      role: 'client',
                      status: 'active',
                      inviteCode: code || '',
                      businessId: businessId,
                      securityAcknowledged: true,
                      onboardingComplete: false,
                      isAnonymous: true,
                      accountId: Math.floor(100000 + Math.random() * 900000).toString(),
                      plan_type: 'free',
                      pro_expires_at: null
                    });
                } else {
                    await updateDoc(doc(db, 'users', uid), {
                       businessId: businessId,
                       inviteCode: code || '',
                       status: 'active'
                    });
                }
                
                if (!isPublicLink && inviteId) {
                    await updateDoc(doc(db, 'invites', inviteId), { used: true });
                }
          
                navigate('/client');
             } catch (err: any) {
                console.error(err);
                setInviteError(lang === 'RU' ? 'Ошибка входа' : 'Kirishda xatolik');
             }
          };

          let accessMode = 'private';
          let businessName = lang === 'RU' ? 'Неизвестный бизнес' : 'Noma\'lum biznes';

          if (data.businessId) {
            const busDoc = await getDoc(doc(db, 'businesses', data.businessId));
            if (busDoc.exists()) {
              accessMode = busDoc.data().accessMode || 'private';
              businessName = busDoc.data().name;
            }
          }

          setInviteData({ id: inviteDoc.id, businessName, accessMode, ...data });

          if (accessMode === 'public' || data.isPublicLink) {
             await doAnonymousJoin(data.businessId, !!data.isPublicLink, inviteDoc.id);
             return;
          }

          if (data.blocked) {
            setInviteError(lang === 'RU' ? 'Этот инвайт-код заблокирован' : 'Ushbu taklif kodi bloklangan');
          } else if (data.used) {
            setIsLogin(true);
          }
          setLoadingInvite(false);
        }
      } catch (err: any) {
        console.error(err);
        setInviteError(lang === 'RU' ? 'Ошибка проверки кода' : 'Kodni tekshirishda xatolik');
        setLoadingInvite(false);
      }
    }

    checkInvite();
  }, [code, lang]);

  const handleAnonymousJoin = async () => {
    setError('');
    setLoading(true);
    try {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const randomEmail = `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}@relible.local`;
      const userCred = await createUserWithEmailAndPassword(auth, randomEmail, randomPassword);
      const uid = userCred.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', uid), {
            uid: uid,
            role: 'client',
            status: 'active',
            inviteCode: code || '',
            businessId: inviteData.businessId,
            securityAcknowledged: true,
            onboardingComplete: false,
            isAnonymous: true,
            accountId: Math.floor(100000 + Math.random() * 900000).toString(),
            plan_type: 'free',
            pro_expires_at: null
          });
      } else {
          await updateDoc(doc(db, 'users', uid), {
             businessId: inviteData.businessId,
             inviteCode: code || '',
             status: 'active'
          });
      }
      
      if (!inviteData.isPublicLink && inviteData.id) {
          await updateDoc(doc(db, 'invites', inviteData.id), { used: true });
      }

      navigate('/client');
    } catch (err: any) {
      console.error(err);
      setError(lang === 'RU' ? 'Ошибка входа' : 'Kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const processTelegramSubmit = async (tgUser: any) => {
    setError('');
    setLoading(true);

    try {
      const fbUser = await authenticateWithTelegram(tgUser, 'client', {
         businessId: inviteData.businessId,
         inviteCode: code || '',
         status: inviteData.accessMode === 'public' ? 'active' : 'pending'
      });
      
      const uid = fbUser.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
        
      if (userDoc.exists()) {
          const ud = userDoc.data();
          if (ud.role === 'client') {
            if (ud.businessId !== inviteData.businessId) {
                if (inviteData.used) {
                   setError(lang === 'RU' ? 'Вы не можете присоединиться к этому бизнесу. Инвайт код уже использован.' : 'Ushbu biznesga qoshila olmaysiz. Taklif kodi ishlatilgan.');
                   setLoading(false);
                   return;
                }
                
                await updateDoc(doc(db, 'users', uid), {
                    businessId: inviteData.businessId,
                    inviteCode: code,
                    status: inviteData.accessMode === 'public' ? 'active' : (ud.status === 'blocked' ? 'blocked' : 'pending') 
                });
            }
            if (!inviteData.isPublicLink && inviteData.id) {
                await updateDoc(doc(db, 'invites', inviteData.id), { used: true });
            }
            navigate('/client');
          } else {
             navigate('/admin');
          }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || (lang === 'RU' ? 'Ошибка' : 'Xatolik'));
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

  if (isTermsModalOpen) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col p-6 font-sans relative overflow-x-hidden">
        <div className="max-w-3xl mx-auto w-full pt-10 pb-20 relative z-10">
          <button 
            onClick={() => setIsTermsModalOpen(false)} 
            className="mb-6 flex items-center text-text-muted hover:text-text-main transition-colors text-[13px] font-medium"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
             Назад к регистрации
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
            className="mb-6 flex items-center text-text-muted hover:text-text-main transition-colors text-[13px] font-medium"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
             Назад к регистрации
          </button>
          <div className="bg-surface rounded-[24px] p-8 sm:p-10 shadow-[0_4px_12px_rgba(16,24,40,0.06)] border border-border-color">
             <h1 className="text-[22px] font-bold text-text-main tracking-tight mb-8">
               {lang === 'RU' ? 'Политика конфиденциальности Relible Commerce' : 'Relible Commerce maxfiylik siyosati'}
             </h1>
             <div className="text-text-muted leading-relaxed text-[13px]">
               <PrivacyPolicyContent lang={lang} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && appUser && inviteData) {
    return (
      <div className="min-h-[100dvh] md:min-h-screen bg-bg-base flex flex-col items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden">
        <div className="w-full max-w-[420px] relative z-10 my-4 md:my-8">
          <div className="bg-surface rounded-[24px] p-6 sm:p-10 shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color flex flex-col items-center text-center">
            
            <div className="w-16 h-16 bg-surface-alt text-text-main rounded-full flex items-center justify-center mb-6 border border-border-color shadow-sm">
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

      <div className="w-full max-w-[420px] relative z-10 my-4 md:my-8">
        <div className="bg-surface rounded-[24px] p-6 sm:p-10 shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color flex flex-col items-center">
          <div className="text-center mb-8 w-full flex flex-col items-center">
            <h1 className="text-[18px] font-bold text-text-main tracking-tight mb-2 text-center">{inviteData?.businessName || "Загрузка..."}</h1>
            <p className="text-[13px] text-text-muted font-medium mb-4 text-center" style={{ textWrap: "balance" }}>
               {inviteData?.accessMode === 'public' || inviteData?.isPublicLink
                 ? (lang === 'RU' ? 'Добро пожаловать в наш каталог' : 'Katalogimizga xush kelibsiz') 
                 : inviteData?.used 
                   ? (lang === 'RU' ? 'Вход в портал клиента' : 'Mijoz portaliga kirish') 
                   : (lang === 'RU' ? 'Завершение регистрации: заполните форму, чтобы присоединиться' : 'Ro\'yxatdan o\'tishni yakunlash: qo\'shilish uchun shaklni to\'ldiring')}
            </p>
          </div>

          <div className="w-full flex justify-center">
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[10px] text-[13px] font-medium mb-6 text-center">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="flex justify-center p-4 w-full">
                  <svg className="animate-spin h-8 w-8 text-text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : inviteData?.accessMode === 'public' || inviteData?.isPublicLink ? (
                <button
                  onClick={handleAnonymousJoin}
                  disabled={loading}
                  className="w-full bg-text-main hover:bg-text-main/90 text-bg-base font-bold h-12 rounded-xl text-[14px] transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  {lang === 'RU' ? 'Перейти в каталог' : 'Katalogga o\'tish'}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <TelegramLoginWidget 
                  botName="relible_auth_bot" 
                  onAuth={processTelegramSubmit} 
                />
              )}
          </div>
        </div>
      </div>
      <SecurityConfirmationModal 
        isOpen={isSecurityModalOpen} 
        onConfirm={processSubmit} 
        lang={lang}
        onLanguageChange={setLang}
      />
    </div>
  );
}
