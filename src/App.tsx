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
import { AccountStatusScreen } from './components/AccountStatusScreen';

import DeveloperPanel from './pages/DeveloperPanel';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'owner' | 'client' }) {
  const { user, appUser, loading } = useAuth();

  if (loading) return <SplashScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (loading) return <SplashScreen />;

  if (!appUser) {
    const creationTime = new Date(user.metadata.creationTime || '').getTime();
    const now = Date.now();
    // If auth user exists but no firestore document AND the account is older than 10 seconds, it's been deleted.
    if (now - creationTime > 10000) {
      return <AccountStatusScreen status="deleted" />;
    }
    return <SplashScreen />;
  }

  if (appUser.status === 'blocked') return <AccountStatusScreen status="blocked" />;

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
    return <Navigate to="/login" replace />;
  }

  if (loading || !appUser) {
    return <SplashScreen />;
  }

  if (appUser.role === 'owner' || appUser.role === 'admin') return <Navigate to="/admin" replace />;
  if (appUser.role === 'client') return <Navigate to="/client" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join" element={<Join />} />
          <Route path="/invite/:code" element={<Join />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="owner"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/client" element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="/dev" element={<DeveloperPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
