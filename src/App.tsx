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

  if (requiredRole && appUser.role !== requiredRole) {
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

  if (appUser.role === 'owner') return <Navigate to="/admin" replace />;
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
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-base text-text-main font-sans">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-border-color border-t-brand-primary rounded-full animate-spin mb-6 drop-shadow-sm"></div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Orderly</h1>
          <div className="text-[11px] font-bold tracking-[0.2em] text-text-muted mt-4 uppercase">
            by VANTORIX
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
          <Route path="/admin" element={<ProtectedRoute requiredRole="owner"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/client" element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
