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
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'owner' | 'client' }) {
  const { user, appUser, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-base font-sans"><Loader2 className="animate-spin w-8 h-8 text-brand-primary" /></div>;

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
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-base font-sans"><Loader2 className="animate-spin w-8 h-8 text-brand-primary" /></div>;
  
  if (!user || !appUser) {
    return <Navigate to="/login" replace />;
  }

  if (appUser.role === 'owner' || appUser.role === 'admin') return <Navigate to="/admin" replace />;
  if (appUser.role === 'client') return <Navigate to="/client" replace />;

  return <Navigate to="/welcome" replace />;
}

import { LogoSVG } from './components/SharedLogo';

function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bg-base font-sans overflow-hidden"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-[60vw] h-[60vw] bg-brand-primary/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[5%] w-[50vw] h-[50vw] bg-brand-accent/5 rounded-full blur-[100px]" 
        />
      </div>
      
      {/* Content Container - Flex Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <LogoSVG className="w-24 h-24" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-main">
            Vantorix Orders
          </h1>
        </motion.div>

        {/* Loading Indicator */}
        <div className="mt-14 w-64 h-[2px] bg-surface-alt rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 2.2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent h-full"
          />
        </div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1, delay: 1.2 }}
           className="mt-20"
        >
           <span className="text-[12px] font-bold tracking-[0.4em] text-text-muted uppercase">
             DEVELOPED BY VANTORIX LABS
           </span>
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
