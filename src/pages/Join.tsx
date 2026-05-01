import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';
import { LogoSVG } from '../components/SharedLogo';

export default function Join() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  
  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const navigate = useNavigate();
  const { user, appUser } = useAuth();

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
          if (data.used) {
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

  if (user && appUser) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (e: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inviteData) return;
    if (!agreePrivacy) {
      setError('Вы должны согласиться с Политикой конфиденциальности');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: name,
        companyName: companyName,
        email: email,
        role: 'client',
        status: 'pending',
        inviteCode: code,
        businessId: inviteData.businessId
      });

      await updateDoc(doc(db, 'invites', inviteData.id), {
        used: true
      });

      await sendEmailVerification(userCred.user);
      await signOut(auth);

      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
      </div>
    );
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
             <h1 className="text-[22px] font-bold text-text-main tracking-tight mb-8">Политика конфиденциальности</h1>
             <div className="text-text-muted leading-relaxed text-[13px]">
               <PrivacyPolicyContent />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="w-full max-w-[420px] relative z-10 my-8">
          <div className="bg-surface rounded-[24px] p-10 shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color flex flex-col items-center text-center">
            
            <div className="w-16 h-16 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center mb-6 border border-brand-success/20">
              <Mail className="w-8 h-8" />
            </div>
            
            <h1 className="text-[22px] font-bold text-text-main tracking-tight mb-3">Проверьте вашу почту</h1>
            <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
              Мы отправили письмо с подтверждением на <br/><span className="font-medium text-text-main">{email}</span>. Пожалуйста, перейдите по ссылке в письме для завершения регистрации.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-surface border border-border-color hover:bg-surface-alt text-text-main py-2.5 px-4 rounded-[10px] font-medium transition-colors shadow-sm text-[14px]"
            >
              Перейти ко входу
            </button>

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
            
            <div className="flex flex-col items-center mb-6">
                <LogoSVG className="w-10 h-10 mb-2" />
                <span className="font-bold tracking-[0.2em] text-[15px] text-text-main">Orderly</span>
            </div>
              
            <h1 className="text-[18px] font-bold text-text-main tracking-tight mb-2 text-center">{inviteData?.businessName || "Загрузка..."}</h1>
            <p className="text-[13px] text-text-muted mb-4 text-center" style={{ textWrap: "balance" }}>Завершение регистрации: заполните форму, чтобы присоединиться</p>
          </div>

          <div className="w-full">
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[10px] text-[13px] font-medium mb-6 text-center">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-text-main">Ваше имя</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-text-muted text-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      placeholder="Иван Иванов"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-text-main">Название вашей компании</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-text-muted text-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      placeholder="ООО Клиент"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-text-main">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-text-muted text-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-[10px] bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-text-muted text-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      placeholder="Минимум 6 символов"
                      minLength={6}
                    />
                     <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors">
                        <EyeOff className="w-4 h-4" />
                     </button>
                  </div>
                </div>

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
                    Я соглашаюсь с <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="text-brand-primary hover:text-brand-light hover:underline font-medium">Политикой конфиденциальности</button>
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-light text-white py-2.5 px-4 rounded-[10px] font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center shadow-sm text-[14px]"
                >
                  {loading ? 'Создание...' : 'Зарегистрироваться'}
                </button>
              </form>

               <div className="mt-8 text-center text-[11px] text-text-muted font-medium">
                  © {new Date().getFullYear()} Vantorix. All rights reserved.
               </div>
          </div>
        </div>
      </div>
    </div>
  );
}
