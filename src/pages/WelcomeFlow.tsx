import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, ShoppingCart, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { LogoSVG } from '../components/SharedLogo';
import clsx from 'clsx';

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Добро пожаловать в Vantorix",
    text: "Управляйте заказами, клиентами и операциями в едином элегантном пространстве.",
    icon: null
  },
  {
    id: 2,
    title: "Создайте свой бизнес",
    text: "Настройте цифровую систему и управляйте всем с одной удобной панели.",
    icon: LayoutDashboard
  },
  {
    id: 3,
    title: "Приглашайте клиентов",
    text: "Генерируйте безопасные ключи доступа для подключения клиентов к вашему бизнесу.",
    icon: Users
  },
  {
    id: 4,
    title: "Контроль заказов",
    text: "Отслеживайте статусы, заявки и завершенные сделки в реальном времени.",
    icon: ShoppingCart
  }
];

export default function WelcomeFlow() {
  const navigate = useNavigate();
  const { user, appUser, loading } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  const visited = localStorage.getItem('visited');
  if (visited === 'true') {
    return <Navigate to="/login" replace />;
  }
  
  if (loading) {
    return null;
  }

  if (user && appUser) {
    if (appUser.role === 'owner') return <Navigate to="/admin" replace />;
    if (appUser.role === 'client') return <Navigate to="/client" replace />;
  }

  const handleNextSlide = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem('visited', 'true');
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-[420px] w-full relative z-10 flex flex-col items-center text-center bg-surface p-10 rounded-[24px] border border-border-color shadow-[0_12px_28px_rgba(16,24,40,0.06)]"
          >
            <div className="mb-6 flex justify-center h-[70px]">
               {currentSlide === 0 ? (
                 <div className="flex flex-col items-center justify-center">
                   <LogoSVG className="w-12 h-12 mb-3" />
                 </div>
               ) : (
                 <div className="w-14 h-14 bg-[#F9F5F1] rounded-2xl flex items-center justify-center text-brand-primary border border-[#EFE8DE]">
                    {ONBOARDING_SLIDES[currentSlide].icon && React.createElement(ONBOARDING_SLIDES[currentSlide].icon as any, { className: "w-7 h-7" })}
                 </div>
               )}
            </div>
            
            <div className="h-[120px] flex flex-col justify-start w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-[22px] font-bold text-text-main tracking-tight mb-2.5">
                    {ONBOARDING_SLIDES[currentSlide].title}
                  </h2>
                  <p className="text-[13px] text-text-muted max-w-[280px] mx-auto leading-[1.6]">
                    {ONBOARDING_SLIDES[currentSlide].text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex gap-2 mb-8 items-center justify-center mt-2">
              {ONBOARDING_SLIDES.map((_, i) => (
                <div 
                  key={i} 
                  className={clsx(
                    "rounded-full transition-all duration-300", 
                    i === currentSlide ? "w-6 h-1.5 bg-brand-primary" : "w-1.5 h-1.5 bg-border-color"
                  )} 
                />
              ))}
            </div>

            <button 
              onClick={handleNextSlide}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-light text-white py-3 px-4 rounded-[10px] font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-sm text-[14px]"
            >
              <span>{currentSlide === ONBOARDING_SLIDES.length - 1 ? "Приступим" : "Далее"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            
            <div className="mt-6 text-[11px] text-text-muted font-medium">
              © {new Date().getFullYear()} Vantorix. All rights reserved.
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="auth-choice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[420px] relative z-10"
          >
             <div className="bg-surface rounded-[24px] p-10 shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color flex flex-col items-center">
                
                <div className="text-center mb-8 w-full">
                  <div className="flex flex-col items-center mb-6">
                    <LogoSVG className="w-10 h-10 mb-2" />
                    <span className="font-bold tracking-[0.2em] text-[15px] text-text-main">VANTORIX</span>
                  </div>
                  <h2 className="text-[22px] font-bold text-text-main tracking-tight mb-2">Начало работы</h2>
                  <p className="text-text-muted text-[13px]">Выберите вариант входа для продолжения</p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/register')} 
                    className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-light text-white text-[13px] font-medium rounded-[10px] hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Зарегистрировать бизнес
                  </button>

                  <button 
                    onClick={() => navigate('/login')} 
                    className="w-full py-3 bg-surface border border-border-color text-text-main text-[13px] font-medium rounded-[10px] hover:bg-surface-alt transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                  >
                    У меня уже есть аккаунт
                  </button>
                </div>

                <div className="mt-8 text-[11px] text-text-muted font-medium">
                  © {new Date().getFullYear()} Vantorix.
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
