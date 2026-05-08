import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, EyeOff, Building2 } from 'lucide-react';
import PrivacyPolicyContent from '../components/PrivacyPolicyContent';

import { motion } from 'motion/react';

export default function Register() {
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const navigate = useNavigate();

  const registerOwner = async (e: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!agreePrivacy) {
      setError('Вы должны согласиться с Политикой конфиденциальности');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', uid);
      const newBusinessRef = doc(collection(db, 'businesses'));
      const businessId = newBusinessRef.id;

      batch.set(newBusinessRef, {
        name: businessName,
        ownerId: uid,
        createdAt: Date.now()
      });

      batch.set(userRef, {
        name: name,
        email: email,
        role: 'owner',
        status: 'active',
        businessId: businessId,
        uid: uid
      });

      await batch.commit();

      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  if (isPrivacyModalOpen) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col p-6 font-sans relative overflow-x-hidden">
        <div className="max-w-3xl mx-auto w-full pt-10 pb-20 relative z-10">
          <button 
            onClick={() => setIsPrivacyModalOpen(false)} 
            className="mb-6 flex items-center text-text-muted hover:text-text-main transition-colors text-sm font-medium"
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

  return (
    <div className="min-h-screen bg-bg-base flex flex-col md:flex-row font-sans overflow-x-hidden">
      
      {/* Desktop Branding Column */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-surface border-r border-border-color flex-col justify-center px-10 xl:px-20 relative overflow-hidden">
        {/* Background blobs for desktop */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-brand-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-brand-accent/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mt-16 text-3xl lg:text-4xl font-bold text-text-main tracking-tight leading-tight">
              Ваш B2B портал готов к запуску.
            </h2>
            <p className="mt-6 text-text-muted text-[15px] leading-relaxed">
              Vantorix OMS предоставляет все необходимые инструменты для автоматизации оптовых продаж: удобные каталоги, управление заказами и клиентской базой.
            </p>
            
            <div className="mt-12 flex flex-col gap-6">
              {[
                  "Удобные каталоги и актуальные остатки",
                  "Работа только с проверенными клиентами по инвайт-кодам",
                  "Полный контроль над статусами заказов"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0 text-brand-primary font-bold shadow-sm border border-brand-primary/20">
                      {(i + 1).toString().padStart(2, '0')}
                   </div>
                   <span className="font-bold text-text-main text-[14px]">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Column */}
      <div className="w-full md:w-[55%] lg:w-[50%] flex flex-col items-center justify-center p-6 md:p-12 relative min-h-screen">
        {/* Mobile Background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none md:hidden">
          <div className="absolute top-[5%] right-[5%] w-[20rem] h-[20rem] bg-brand-primary/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[20rem] h-[20rem] bg-brand-accent/10 rounded-full blur-[80px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px] relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/20 flex flex-col items-center text-left">
            <img src="https://drive.google.com/thumbnail?id=1VG9rOLyli4T9AnEPCm4EX0KkFB49BdqL&sz=w1000" alt="Vantorix Logo" className="w-24 h-auto mb-2 object-contain" style={{ mixBlendMode: 'multiply' }} />
            <h1 className="text-2xl font-black text-text-main tracking-tight mb-8">Vantorix OMS</h1>
            <h3 className="text-[20px] font-black tracking-tight text-text-main mb-8 w-full uppercase text-center">Создание компании</h3>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-3 rounded-[12px] text-[13px] font-medium mb-6 text-center animate-shake">
                  {error}
                </div>
              )}
              
              <form onSubmit={registerOwner} className="space-y-5">
                {[
                  { id: 'business', label: 'Название компании', icon: Building2, value: businessName, setter: setBusinessName, placeholder: 'Введите название организации' },
                  { id: 'name', label: 'Контактное лицо', icon: UserIcon, value: name, setter: setName, placeholder: 'ФИО руководителя или менеджера' },
                  { id: 'email', label: 'Электронная почта', icon: Mail, type: 'email', value: email, setter: setEmail, placeholder: 'work@company.com' },
                  { id: 'password', label: 'Пароль для входа', icon: Lock, type: 'password', value: password, setter: setPassword, placeholder: 'Минимум 6 символов' }
                ].map((field, idx) => (
                  <motion.div 
                    key={field.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[12px] font-bold text-text-main uppercase tracking-wider ml-1">{field.label}</label>
                    <div className="relative group">
                         <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                         <input
                          type={field.type || 'text'}
                          required
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 rounded-[14px] bg-bg-base/50 border border-border-color/50 text-text-main focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-text-muted/60 text-[14px] shadow-sm"
                          placeholder={field.placeholder}
                          minLength={field.id === 'password' ? 6 : undefined}
                        />
                    </div>
                  </motion.div>
                ))}

                 <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-start gap-2.5 mt-8 mb-8 px-1"
                 >
                    <div className="flex items-center h-5">
                      <input
                          id="terms"
                          type="checkbox"
                          checked={agreePrivacy}
                          onChange={(e) => setAgreePrivacy(e.target.checked)}
                          className="w-4 h-4 rounded border-border-color text-brand-primary bg-surface focus:ring-brand-primary/10 cursor-pointer"
                          required
                      />
                    </div>
                    <label htmlFor="terms" className="text-[12px] text-text-muted leading-snug cursor-pointer">
                       Я согласен с <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="text-brand-primary hover:text-brand-secondary hover:underline font-bold">Политикой конфиденциальности</button>
                    </label>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white py-4 px-6 rounded-[16px] font-bold hover:shadow-xl hover:shadow-brand-primary/20 transition-all disabled:opacity-70 flex justify-center items-center text-[15px] tracking-wide uppercase mt-8"
                >
                  {loading ? 'Регистрация...' : 'Зарегистрировать компанию'}
                </motion.button>
              </form>

              <div className="mt-10 flex flex-col items-center gap-4">
                <div className="text-[13px] text-text-muted">
                  Компания уже зарегистрирована?{' '}
                  <Link to="/login" className="font-bold text-brand-primary hover:text-brand-secondary transition-colors underline underline-offset-4">
                    Войти в кабинет
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
    </div>
  );
}
