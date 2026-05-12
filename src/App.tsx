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
import { SplashScreen } from './components/SplashScreen';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'owner' | 'client' }) {
  const { user, appUser, loading } = useAuth();

  if (loading) return <SplashScreen />;

  if (!user) return <Navigate to="/welcome" replace />;

  if (loading) return <SplashScreen />;

  if (!appUser) {
    // If we have a firebase user but no firestore profile yet, 
    // we might be in the middle of registration.
    // Let's show the splash screen instead of immediately redirecting.
    return <SplashScreen />;
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
  
  if (loading) return <SplashScreen />;
  
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  if (loading || !appUser) {
    return <SplashScreen />;
  }

  if (appUser.role === 'owner' || appUser.role === 'admin') return <Navigate to="/admin" replace />;
  if (appUser.role === 'client') return <Navigate to="/client" replace />;

  return <Navigate to="/welcome" replace />;
}

import Landing from './pages/Landing';

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
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
            <Route path="/welcome" element={<Landing />} />
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
