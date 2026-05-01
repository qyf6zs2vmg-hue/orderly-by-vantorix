/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

  if (!user.emailVerified && appUser.role === 'client') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base font-sans p-4">
        <h2 className="text-2xl font-bold text-text-main mb-2">Требуется подтверждение Email</h2>
        <p className="text-text-muted mb-6 text-center max-w-md">
          Пожалуйста, подтвердите ваш адрес электронной почты, перейдя по ссылке, которую мы вам отправили.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-brand-primary text-white px-6 py-2.5 rounded-[10px] font-medium hover:opacity-90 transition-opacity"
        >
          Я подтвердил(а) email
        </button>
      </div>
    );
  }

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

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F9F8F6] font-sans">
        <div className="flex-1 flex items-center justify-center mt-[-40px]">
          <div className="flex items-center gap-3.5">
            <Loader2 className="w-11 h-11 animate-spin text-[#D97757]" strokeWidth={2.5} />
            <h1 className="text-[46px] tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>
              Orderly
            </h1>
          </div>
        </div>
        
        <div className="pb-10 absolute bottom-0 w-full flex justify-center">
          <div className="text-[12px] font-bold tracking-[0.3em] text-[#807D7A] uppercase">
            BY VANTORIX
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
