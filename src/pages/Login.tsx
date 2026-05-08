import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';

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

      if (userData.role === 'owner' || userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'client') {
        navigate('/client');
      } else {
        alert("Неизвестная роль: " + userData.role);
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
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[30rem] h-[30rem] bg-brand-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[30rem] h-[30rem] bg-brand-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/20 flex flex-col items-center">
          
          <img src="https://drive.google.com/thumbnail?id=1VG9rOLyli4T9AnEPCm4EX0KkFB49BdqL&sz=w1000" alt="Vantorix Logo" className="w-24 h-auto mb-2 object-contain" style={{ mixBlendMode: 'multiply' }} />
          <h1 className="text-2xl font-black text-text-main tracking-tight mb-8">Vantorix OMS</h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[12px] text-[13px] font-medium mb-6 text-center animate-shake">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-5">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-1.5"
                >
                  <label className="text-[12px] font-bold text-text-main uppercase tracking-wider ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-[14px] bg-bg-base/50 border border-border-color/50 text-text-main focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-text-muted/60 text-[14px] shadow-sm"
                      placeholder="Введите ваш email"
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center px-1">
                     <label className="text-[12px] font-bold text-text-main uppercase tracking-wider">Пароль</label>
                     <a href="#" className="text-[11px] font-bold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-tight">Забыли пароль?</a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 rounded-[14px] bg-bg-base/50 border border-border-color/50 text-text-main focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-text-muted/60 text-[14px] shadow-sm"
                      placeholder="Введите пароль"
                    />
                     <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors">
                        <EyeOff className="w-4 h-4" />
                     </button>
                  </div>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white py-4 px-6 rounded-[16px] font-bold hover:shadow-xl hover:shadow-brand-primary/20 transition-all disabled:opacity-70 flex justify-center items-center text-[15px] tracking-wide uppercase mt-8"
                >
                  {loading ? 'Вход...' : 'Войти в систему'}
                </motion.button>
              </form>
              
              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="text-[13px] text-text-muted">
                  Нет бизнеса?{' '}
                  <Link to="/register" className="font-bold text-brand-primary hover:text-brand-secondary transition-colors underline underline-offset-4">
                    Создать компанию
                  </Link>
                </div>

                <div className="pt-6 border-t border-border-color/50 w-full text-center">
                    <span className="text-[10px] font-bold text-text-muted tracking-[0.3em] uppercase opacity-50">
                      © {new Date().getFullYear()} Vantorix Labs
                    </span>
                </div>
              </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
