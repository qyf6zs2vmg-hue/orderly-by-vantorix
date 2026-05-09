import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate, useSearchParams, useParams, Navigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { SplashScreen } from '../components/SplashScreen';

export default function Join() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const code = params.code || searchParams.get('code');
  
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
        setInviteError('Код приглашения не указан');
        setLoadingInvite(false);
        return;
      }

      try {
        const inviteDoc = await getDoc(doc(db, 'invites', code));
        if (!inviteDoc.exists()) {
          setInviteError('Неверный код приглашения');
        } else {
          const data = inviteDoc.data();
          if (data.blocked) {
            setInviteError('Этот инвайт-код заблокирован');
          } else if (data.used) {
            setInviteError('Этот инвайт-код уже использован');
          } else {
            if (data.businessId) {
              const busDoc = await getDoc(doc(db, 'businesses', data.businessId));
              if (busDoc.exists()) {
                setInviteData({ id: inviteDoc.id, businessName: busDoc.data().name, ...data });
              } else {
                setInviteData({ id: inviteDoc.id, businessName: 'Неизвестный бизнес', ...data });
              }
            } else {
              setInviteData({ id: inviteDoc.id, businessName: 'Неизвестный бизнес', ...data });
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setInviteError('Ошибка проверки кода');
      } finally {
        setLoadingInvite(false);
      }
    }

    checkInvite();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inviteData) return;
    if (!isLogin && !agreePrivacy) {
      setError('Вы должны согласиться с Политикой конфиденциальности');
      return;
    }
    
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
          businessId: inviteData.businessId
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
        setError('Неверный email или пароль');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Этот email уже зарегистрирован. Войдите в аккаунт.');
      } else {
        setError(err.message || 'Ошибка');
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
                 className="flex-1 bg-surface border border-border-color hover:bg-surface-alt text-text-main py-2.5 px-4 rounded-[10px] font-medium transition-colors shadow-sm text-[13px]"
               >
                 Выйти
               </button>
               <button
                 onClick={() => navigate(appUser.role === 'client' ? '/client' : '/admin')}
                 className="flex-1 bg-brand-primary text-white py-2.5 px-4 rounded-[10px] font-medium transition-opacity hover:opacity-90 shadow-sm text-[13px]"
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
      <div className="w-full max-w-[420px] relative z-10 my-8">
        <div className="bg-surface rounded-[24px] p-10 shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color flex flex-col items-center">
          <div className="text-center mb-8 w-full flex flex-col items-center">
            <h1 className="text-[18px] font-bold text-text-main tracking-tight mb-2 text-center">{inviteData?.businessName || "Загрузка..."}</h1>
            <p className="text-[13px] text-text-muted mb-4 text-center" style={{ textWrap: "balance" }}>Завершение регистрации: заполните форму, чтобы присоединиться</p>
          </div>

          <div className="w-full">
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[10px] text-[13px] font-medium mb-6 text-center">
                  {error}
                </div>
              )}
              
              <div className="flex bg-surface-alt rounded-[10px] p-1 mb-6">
                 <button
                   onClick={() => { setIsLogin(false); setError(''); }}
                   className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all ${!isLogin ? 'bg-surface shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                 >
                   Регистрация
                 </button>
                 <button
                   onClick={() => { setIsLogin(true); setError(''); }}
                   className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all ${isLogin ? 'bg-surface shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                 >
                   Вход
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-text-main">Ваше имя</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-muted text-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                        placeholder="Иван Иванов"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-text-main">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-muted text-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      placeholder="ivan@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-text-main">Пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-[10px] bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all placeholder:text-text-muted text-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      placeholder="Минимум 6 символов"
                      minLength={6}
                    />
                     <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors">
                        <EyeOff className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="flex items-start gap-2.5 mt-6 mb-6 px-1">
                    <div className="flex items-center h-5">
                      <input
                        id="privacy-join"
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="w-4 h-4 rounded border-border-color text-brand-primary bg-surface focus:ring-brand-primary/20 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="privacy-join" className="text-[12px] text-text-muted leading-snug cursor-pointer">
                      Я соглашаюсь с <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="text-brand-primary hover:text-brand-secondary hover:underline font-medium">Политикой конфиденциальности</button>
                    </label>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white py-2.5 px-4 rounded-[10px] font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center shadow-lg shadow-brand-primary/20 text-[14px] mt-4"
                >
                  {loading ? (isLogin ? 'Вход...' : 'Создание...') : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                </button>
              </form>

               <div className="mt-8 text-center text-[11px] text-text-muted font-medium uppercase tracking-[0.2em]">
                  DEVELOPED BY VANTORIX LABS
               </div>
          </div>
        </div>
      </div>
    </div>
  );
}
