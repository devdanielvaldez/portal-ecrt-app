/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import OrganizationsPage from './pages/admin/OrganizationsPage';
import TerminalsPage from './pages/admin/TerminalsPage';
import TerminalGroupsPage from './pages/admin/TerminalGroupsPage';
import MessagesPage from './pages/admin/MessagesPage';
import AdsPage from './pages/admin/AdsPage';
import AgencyAssignmentsPage from './pages/admin/AgencyAssignmentsPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLayout from './components/layout/AdminLayout';
import { Toaster } from '@/components/ui/sonner';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/login" />;
  return <>{children}</>;
};

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage type="organization" />} />
        <Route path="/login/admin" element={<LoginPage type="admin" />} />
        
        {/* Admin Routes */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/organizations" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout>
              <OrganizationsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/terminals" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout>
              <TerminalsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/terminal-groups" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout>
              <TerminalGroupsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/messages" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout>
              <MessagesPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/ads" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout>
              <AdsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/transactions" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout>
              <TransactionsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/agencies/:id/assignments" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout>
              <AgencyAssignmentsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        {/* Other Dashboards */}
        <Route path="/dashboard/commerce" element={<ProtectedRoute><div>Commerce Dashboard Placeholder</div></ProtectedRoute>} />
        <Route path="/dashboard/agency" element={<ProtectedRoute><div>Agency Dashboard Placeholder</div></ProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

