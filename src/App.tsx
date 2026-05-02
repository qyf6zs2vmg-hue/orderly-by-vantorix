/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Join from './pages/Join';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import PendingApproval from './pages/PendingApproval';
import WelcomeFlow from './pages/WelcomeFlow';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'owner' | 'client' }) {
  const { user, appUser, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-base"><Loader2 className="animate-spin w-8 h-8 text-brand-primary" /></div>;

  if (!user) return <Navigate to="/welcome" replace />;

  if (!appUser) return <Navigate to="/welcome" replace />; // If no user document exists

  if (appUser.status === 'blocked') return <div className="min-h-screen flex items-center justify-center bg-bg-base text-brand-danger text-xl font-medium font-sans">Ваш аккаунт заблокирован.</div>;

  if (requiredRole && requiredRole === 'owner') {
    if (appUser.role !== 'owner' && appUser.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRole && appUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (appUser.role === 'client' && appUser.status === 'pending') {
    return <PendingApproval />;
  }

  return <>{children}</>;
}

function HomeRedirect() {
  const { user, appUser, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-base"><Loader2 className="animate-spin w-8 h-8 text-brand-primary" /></div>;
  
  if (!user || !appUser) {
    if (localStorage.getItem('visited') === 'true') {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/welcome" replace />;
  }

  if (appUser.role === 'owner' || appUser.role === 'admin') return <Navigate to="/admin" replace />;
  if (appUser.role === 'client') return <Navigate to="/client" replace />;

  return <Navigate to="/welcome" replace />;
}

function SplashScreen() {
  return (
    <motion.div 
      initial={{ backgroundColor: '#000000', opacity: 0 }}
      animate={{ backgroundColor: '#FAF9F6', opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center font-sans overflow-hidden"
    >
      {/* Background soft gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] bg-[#D17B5B]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] bg-[#736E68]/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Micro noise texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <h1 className="text-[56px] md:text-[72px] font-bold tracking-tight text-[#1A1815] relative drop-shadow-[0_8px_24px_rgba(209,123,91,0.15)]" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>
              Orderly
            </h1>
            {/* Light sweep effect */}
            <motion.div 
              initial={{ left: "-100%" }}
              animate={{ left: "200%" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.8 }}
              className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] z-20 pointer-events-none mix-blend-overlay"
            />
          </div>
          
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
             className="mt-6"
          >
             <span className="text-[12px] md:text-[13px] font-medium tracking-[0.2em] text-[#736E68] uppercase">
               Developed by Vantorix Labs
             </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatePresence>
          {initialLoading && <SplashScreen key="splash" />}
        </AnimatePresence>
        <motion.div 
          initial={false}
          animate={{ opacity: initialLoading ? 0 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ display: initialLoading ? 'none' : 'block' }}
        >
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
          <Route path="/welcome" element={<WelcomeFlow />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join" element={<Join />} />
          <Route path="/invite/:code" element={<Join />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="owner"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/client" element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </BrowserRouter>
    </AuthProvider>
  );
}
