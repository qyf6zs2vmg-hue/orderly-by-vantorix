import React, { useEffect, useState } from 'react';
import { Shield, AlertCircle, RefreshCw, User, Building2, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { getTelegramWebApp } from '../lib/telegram';
import { useAuth } from '../lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Landing() {
  const tg = getTelegramWebApp();
  const { 
    authError, 
    loading, 
    retryAuth, 
    user, 
    appUser, 
    onboardingState, 
    setOnboardingState, 
    startAuth, 
    completeRegistration 
  } = useAuth();

  const tgUser = tg?.initDataUnsafe?.user;
  const startParam = tg?.initDataUnsafe?.start_param;

  // Form Fields
  const [profileName, setProfileName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // System Setup Progression Tracker
  const [setupStep, setSetupStep] = useState(0);

  // Pre-fill forms on mount or when tgUser becomes available
  useEffect(() => {
    if (tgUser) {
      const defaultName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || '';
      setProfileName(defaultName);
      setWorkspaceName(tgUser.first_name ? `${tgUser.first_name} Workspace` : 'OrderFlow Space');
    } else {
      setProfileName('Sandbox Demo Admin');
      setWorkspaceName('Sandbox Workspace');
    }
  }, [tgUser]);

  // System Creation Progression sequence
  useEffect(() => {
    if (onboardingState === 'creating_system') {
      const interval = setInterval(() => {
        setSetupStep((prev) => {
          if (prev < 3) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1200);
      return () => clearInterval(interval);
    } else {
      setSetupStep(0);
    }
  }, [onboardingState]);

  // Force navigate if we hit dashboard state
  if (onboardingState === 'dashboard' && user && appUser) {
    return <Navigate to="/" replace />;
  }

  // Action Click Handler for landing
  const handleOpenPlatform = async () => {
    await startAuth();
  };

  // Submit Handler for Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!profileName.trim()) {
      setValidationError('Пожалуйста, введите ваше имя.');
      return;
    }

    if (!startParam && !workspaceName.trim()) {
      setValidationError('Пожалуйста, введите название вашей компании.');
      return;
    }

    await completeRegistration(profileName, startParam ? undefined : workspaceName);
  };

  const stepsList = [
    'Авторизация контейнера в BlackBridge Cloud...',
    'Развертывание баз данных OrderFlow OMS...',
    'Инициализация каталогов и ключей доступа...',
    'Запуск аналитики рабочего пространства...'
  ];

  return (
    <div className="min-h-screen bg-bg-base font-sans text-text-main flex flex-col items-center justify-center p-6 text-center overflow-hidden selection:bg-brand-primary/10 select-none">
      <AnimatePresence mode="wait">
        
        {/* LANDING STATE */}
        {onboardingState === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center max-w-[340px]"
          >
            <div className="w-20 h-20 mb-8 rounded-[24px] bg-surface flex items-center justify-center border border-border-color shadow-sm relative group">
              <div className="absolute inset-0 bg-brand-primary/5 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src="https://drive.google.com/thumbnail?id=1l7HkE_p4K09Xwkv9g9JAiFzfTuViiWvZ&sz=w1000" 
                alt="OrderFlow Logo" 
                crossOrigin="anonymous" 
                className="w-12 h-12 object-contain relative z-10" 
              />
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight mb-2">OrderFlow</h1>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-8 opacity-60">
              Powered by BlackBridge
            </p>

            <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
              Коммерческая мини-CRM платформа для управления заказами и дистрибьюцией в реальном времени.
            </p>

            <button 
              onClick={handleOpenPlatform}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <Shield className="w-5 h-5 relative -top-[0.5px]" />
              Открыть платформу
            </button>
          </motion.div>
        )}

        {/* AUTH STATE / LOADING STATE */}
        {onboardingState === 'auth' && (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center max-w-[280px]"
          >
            {authError ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-brand-danger/10 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-brand-danger" />
                </div>
                <h2 className="text-lg font-bold mb-2 text-brand-danger">Ошибка сессии</h2>
                <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
                  {authError}
                </p>
                <button 
                  onClick={retryAuth}
                  className="bg-surface border border-border-color text-text-main font-bold py-3 px-6 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <RefreshCw className="w-4 h-4" />
                  Повторить запрос
                </button>
                <button 
                  onClick={() => setOnboardingState('landing')}
                  className="mt-4 text-[13px] text-text-muted underline active:opacity-70 transition-opacity"
                >
                  Вернуться в начало
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-6" />
                <h2 className="text-lg font-bold mb-2">Подключение...</h2>
                <p className="text-[13px] text-text-muted leading-relaxed">
                  Инициализация защищенного подключения и проверка токенов доступа Telegram...
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* REGISTER STATE */}
        {onboardingState === 'register' && (
          <motion.div 
            key="register"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-[340px] text-left"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Регистрация в системе</h2>
                <p className="text-[12px] text-text-muted">Заполните данные для создания профиля</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Ваше имя</label>
                <div className="relative">
                  <User className="absolute left-[14px] top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-60" />
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Имя Фамилия"
                    className="w-full bg-surface border border-border-color rounded-2xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:border-brand-primary transition-colors text-text-main font-medium"
                  />
                </div>
              </div>

              {!startParam ? (
                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Ваша компания / Бренд</label>
                  <div className="relative">
                    <Building2 className="absolute left-[14px] top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-60" />
                    <input 
                      type="text" 
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="Например, BlackBridge Coffee"
                      className="w-full bg-surface border border-border-color rounded-2xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:border-brand-primary transition-colors text-text-main font-medium"
                    />
                  </div>
                  <span className="text-[11px] text-text-muted mt-1.5 block leading-normal opacity-80">
                    Это автоматически инициализирует полноценное рабочее CRM-пространство с базами данных для заказов и клиентов.
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-surface rounded-2xl border border-border-color">
                  <p className="text-[13px] text-brand-primary font-semibold mb-1">Пригласительная ссылка</p>
                  <p className="text-[12px] text-text-muted leading-relaxed">
                    Вы регистрируетесь как Клиент. После завершения регистрации вы получите защищенный статус ожидания доступа к витрине бизнеса.
                  </p>
                </div>
              )}

              {validationError && (
                <div className="flex items-center gap-2 text-brand-danger text-[12px] font-semibold bg-brand-danger/5 p-3.5 rounded-2xl border border-brand-danger/10">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {authError && (
                <div className="flex items-center gap-2 text-brand-danger text-[12px] font-semibold bg-brand-danger/5 p-3.5 rounded-2xl border border-brand-danger/10">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{startParam ? "Принять приглашение" : "Создать платформу"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* CREATING SYSTEM FLOW */}
        {onboardingState === 'creating_system' && (
          <motion.div 
            key="creating_system"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-[320px] text-left"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
              <h2 className="text-xl font-bold tracking-tight">Развертывание инстанса</h2>
              <p className="text-[13px] text-text-muted">Инициализируем персональные модули OMS</p>
            </div>

            <div className="space-y-3.5 bg-surface p-5 rounded-2xl border border-border-color">
              {stepsList.map((stepMessage, idx) => {
                const isCompleted = setupStep > idx;
                const isActive = setupStep === idx;
                
                return (
                  <div key={idx} className="flex items-start gap-3 transition-opacity duration-300">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-success mt-0.5 flex-shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-brand-primary animate-spin mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border-color mt-0.5 flex-shrink-0" />
                    )}
                    <p className={`text-[13px] font-medium leading-tight ${isCompleted ? 'text-text-main opacity-80' : isActive ? 'text-brand-primary font-bold' : 'text-text-muted opacity-50'}`}>
                      {stepMessage}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[11px] text-text-muted mt-5 text-center leading-normal opacity-70">
              Пожалуйста, подождите. Архитектура OrderFlow разворачивается автоматически в защищенном облаке BlackBridge.
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
