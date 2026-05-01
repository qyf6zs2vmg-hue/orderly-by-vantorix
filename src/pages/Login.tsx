import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { LogoSVG } from '../components/SharedLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, appUser } = useAuth();
  
  if (user && appUser) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Данные пользователя не найдены");
        return;
      }

      const userData = docSnap.data();

      // Check email verification ONLY for clients
      if (userData.role === 'client') {
        await user.reload();
        if (!user.emailVerified) {
          await signOut(auth);
          setError('Пожалуйста, подтвердите ваш email перед входом в систему');
          setLoading(false);
          return;
        }
      }

      if (userData.role === 'owner') {
        navigate('/admin');
      } else if (userData.role === 'client') {
        navigate('/client');
      } else {
        alert("Неизвестная роль");
      }
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-surface rounded-[24px] p-10 shadow-[0_12px_28px_rgba(16,24,40,0.06)] border border-border-color flex flex-col items-center">
          
          <div className="text-center mb-8 w-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-6">
               <LogoSVG className="w-10 h-10 mb-2" />
               <span className="font-bold tracking-[0.2em] text-[15px] text-text-main">Orderly</span>
            </div>
            
            <h2 className="text-[22px] font-bold text-text-main tracking-tight mb-2">Вход в систему</h2>
            <p className="text-[13px] text-text-muted">Войдите в свой аккаунт для продолжения</p>
          </div>
          
          <div className="w-full">
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[10px] text-[13px] font-medium mb-6 text-center">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
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
                      placeholder="Введите ваш email"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                     <label className="text-[13px] font-medium text-text-main">Пароль</label>
                     <a href="#" className="text-[12px] text-brand-primary hover:text-brand-light transition-colors">Забыли пароль?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-[10px] bg-surface border border-border-color text-text-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-text-muted text-[13px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      placeholder="Введите пароль"
                    />
                     <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors">
                        <EyeOff className="w-4 h-4" />
                     </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-light text-white py-2.5 px-4 rounded-[10px] font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center shadow-sm text-[14px] mt-6"
                >
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </form>
              
              <div className="mt-8 text-center text-[13px] text-text-muted">
                Нет аккаунта?{' '}
                <Link to="/register" className="font-medium text-brand-primary hover:text-brand-light transition-colors">
                  Регистрация
                </Link>
              </div>

              <div className="mt-8 text-center text-[11px] text-text-muted font-medium">
                © {new Date().getFullYear()} Vantorix. All rights reserved.
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
