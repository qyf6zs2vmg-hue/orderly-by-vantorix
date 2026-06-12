import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';
import { TelegramLoginWidget } from '../components/TelegramLoginWidget';
import { authenticateWithTelegram } from '../lib/telegramAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, appUser } = useAuth();
  
  if (user && appUser) {
    if (appUser.role === 'owner' || appUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/client" replace />;
  }

  const handleTelegramAuth = async (tgUser: any) => {
    setError('');
    setLoading(true);

    try {
      // By default, accessing /login directly assumes creation of an owner account if not exists
      const fbUser = await authenticateWithTelegram(tgUser, 'owner');
      
      const docRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("Данные пользователя не найдены");
        setLoading(false);
        return;
      }

      const userData = docSnap.data();

      if (userData.role === 'owner' || userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'client') {
        navigate('/client');
      } else {
        setError("Неизвестная роль: " + userData.role);
      }
    } catch (err: any) {
      console.error("TELEGRAM LOGIN ERROR:", err);
      setError(err.message || 'Ошибка авторизации через Telegram');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] md:min-h-screen bg-bg-base flex flex-col items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[30rem] h-[30rem] bg-text-main/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[30rem] h-[30rem] bg-brand-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-surface/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-10 border border-white/20 flex flex-col items-center">
          
          <img src="https://lh3.googleusercontent.com/d/1bV4yXsTNYUMjZ7Qe5dYuXf5R6B_xNfop" alt="Relible Commerce" referrerPolicy="no-referrer" className="w-24 h-auto mb-2 object-contain" />
          <h1 className="text-2xl font-black text-text-main tracking-tight mb-8">Relible Commerce</h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full flex-col items-center"
          >
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[12px] text-[13px] font-medium mb-6 text-center animate-shake">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="flex justify-center p-4">
                  <svg className="animate-spin h-8 w-8 text-text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <TelegramLoginWidget 
                  botName="relible_auth_bot" 
                  onAuth={handleTelegramAuth} 
                />
              )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
