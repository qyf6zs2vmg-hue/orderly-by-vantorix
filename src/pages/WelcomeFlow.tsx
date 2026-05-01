import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { LogoSVG } from '../components/SharedLogo';
import clsx from 'clsx';

export default function WelcomeFlow() {
  const navigate = useNavigate();
  const { user, appUser, loading } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  const visited = localStorage.getItem('visited');
  if (visited === 'true') {
    return <Navigate to="/login" replace />;
  }
  
  if (loading) {
    return null;
  }

  if (user && appUser) {
    if (appUser.role === 'owner' || appUser.role === 'admin') return <Navigate to="/admin" replace />;
    if (appUser.role === 'client') return <Navigate to="/client" replace />;
  }

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
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-text-main">Orderly</h1>
            
            <p className="text-[14px] text-text-muted mb-4 max-w-[280px] mx-auto leading-[1.6]">
              Это наш сайт для системы заказов. Клиент просматривает товар, оформляет заказ, и всё прекрасно. Всё.
            </p>

            <div className="text-[11px] font-bold tracking-[0.2em] text-text-muted mt-2 mb-8 uppercase">
              by VANTORIX
            </div>

            <button 
              onClick={handleGetStarted}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-light text-white py-3 px-4 rounded-[10px] font-medium hover:opacity-90 transition-opacity shadow-sm text-[14px] mb-8"
            >
              Купить
            </button>
            
            <div className="text-[12px] text-text-muted leading-relaxed border-t border-border-color pt-6 w-full text-left font-medium">
              Orderly — профессиональная платформа для покупок. В будущем в окне приветствия мы добавим административную панель. Оформляйте свои заказы быстро и с удовольствием.
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
                    <span className="font-bold tracking-[0.2em] text-[15px] text-text-main mb-1">Orderly</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted">by VANTORIX</span>
                  </div>
                  <h2 className="text-[22px] font-bold text-text-main tracking-tight mb-2">Начало работы</h2>
                  <p className="text-text-muted text-[13px]">Выберите вариант входа для продолжения</p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/login')} 
                    className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-light text-white text-[13px] font-medium rounded-[10px] hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Войти
                  </button>

                  <button 
                    onClick={() => navigate('/register')} 
                    className="w-full py-3 bg-surface border border-border-color text-text-main text-[13px] font-medium rounded-[10px] hover:bg-surface-alt transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                  >
                    Регистрация (Администрация)
                  </button>
                </div>

                <div className="mt-8 text-[11px] text-text-muted font-medium uppercase tracking-wider">
                  by Vantorix
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
