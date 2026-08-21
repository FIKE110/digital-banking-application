import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useKyc } from '../contexts/KycContext';
import type { ReactNode } from 'react';

const ADMIN_ROUTES = ['/admin', '/admin/accounts', '/admin/audit', '/admin/limits'];
const CUSTOMER_ROUTES = ['/dashboard', '/accounts', '/transfers', '/payments', '/cards', '/transactions', '/beneficiaries', '/notifications', '/settings', '/profile'];

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const kyc = useKyc();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  const isAdmin = user?.permissions?.includes('manage-admin') ?? false;
  const path = location.pathname;

  if (isAdmin && CUSTOMER_ROUTES.some(r => path === r || path.startsWith(r + '/'))) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdmin && ADMIN_ROUTES.some(r => path === r || path.startsWith(r + '/'))) {
    return <Navigate to="/dashboard" replace />;
  }

  // Customers must complete KYC onboarding before using the app
  if (!isAdmin && !kyc.loading && kyc.needsOnboarding && path !== '/kyc') {
    return <Navigate to="/kyc" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/admin/login" replace />;
  if (user === null) return null;
  if (!user.permissions.includes('manage-admin')) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
