/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import PendingApproval from './pages/PendingApproval';
import { SplashScreen } from './components/SplashScreen';
import { getTelegramWebApp } from './lib/telegram';
import { AlertCircle } from 'lucide-react';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'owner' | 'client' }) {
  const { user, appUser, loading } = useAuth();
  
  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/welcome" replace />;
  if (!appUser) return <SplashScreen />;

  if (appUser.status === 'blocked') return <div className="min-h-screen flex items-center justify-center bg-bg-base text-brand-danger text-lg font-bold font-sans">Ваш аккаунт заблокирован.</div>;

  if (requiredRole && requiredRole === 'owner') {
    if (appUser.role !== 'owner' && appUser.role !== 'admin') return <Navigate to="/" replace />;
  } else if (requiredRole && appUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (appUser.role === 'client' && appUser.status === 'pending') return <PendingApproval />;

  return <>{children}</>;
}

function MissingInvite() {
  const { user, appUser, logout } = useAuth();
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
       <AlertCircle className="w-16 h-16 text-text-muted mb-4 opacity-70" />
       <h1 className="text-xl font-bold tracking-tight mb-2">Требуется приглашение</h1>
       <p className="text-[14px] text-text-muted mb-8 leading-relaxed max-w-[260px]">
         Чтобы пользоваться приложением как клиент, перейдите по инвайт-ссылке, которую вам предоставил бизнес.
       </p>
       <button onClick={logout} className="w-full bg-brand-danger/10 text-brand-danger font-bold py-3.5 rounded-2xl active:scale-95 transition-transform text-[14px]">
         Сменить аккаунт
       </button>
    </div>
  );
}

function HomeRedirect() {
  const { user, appUser, loading } = useAuth();
  
  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/welcome" replace />;
  if (!appUser) return <SplashScreen />;

  if (appUser.role === 'owner' || appUser.role === 'admin') return <Navigate to="/admin" replace />;
  
  if (appUser.role === 'client') {
    if (!appUser.businessId) return <Navigate to="/missing-invite" replace />;
    return <Navigate to="/client" replace />;
  }

  return <Navigate to="/welcome" replace />;
}

import Landing from './pages/Landing';

export default function App() {
  const tg = getTelegramWebApp();
  
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
    }
  }, [tg]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/welcome" element={<Landing />} />
          <Route path="/missing-invite" element={<MissingInvite />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="owner"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/client" element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
