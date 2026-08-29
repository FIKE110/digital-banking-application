import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { KycProvider } from './contexts/KycContext';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import SecurityPin from './pages/SecurityPin';
import Kyc from './pages/Kyc';
import Layout from './components/Layout';
import { ThemeProvider } from './ui/Theme';
import { ToastProvider } from './ui/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Transfers from './pages/Transfers';
import Beneficiaries from './pages/Beneficiaries';
import Bills from './pages/Bills';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import AdminAccounts from './pages/AdminAccounts';
import AdminAuditTrail from './pages/AdminAuditTrail';
import AdminLimits from './pages/AdminLimits';
import AdminDashboard from './pages/AdminDashboard';
import AdminTransactions from './pages/AdminTransactions';
import AdminCustomers from './pages/AdminCustomers';
import AdminKyc from './pages/AdminKyc';
import AdminCards from './pages/AdminCards';
import AdminBeneficiaries from './pages/AdminBeneficiaries';
import AdminPayments from './pages/AdminPayments';
import AdminRoles from './pages/AdminRoles';
import AdminAdmins from './pages/AdminAdmins';
import AdminAdjustments from './pages/AdminAdjustments';
import AdminLogin from './pages/AdminLogin';
import Cards from './pages/Cards';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <KycProvider>
              <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/accounts/:id" element={<AccountDetail />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/payments" element={<Bills />} />
                <Route path="/bills" element={<Navigate to="/payments" replace />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/beneficiaries" element={<Beneficiaries />} />
                <Route path="/kyc" element={<Kyc />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pin" element={<SecurityPin />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/accounts" element={<AdminRoute><AdminAccounts /></AdminRoute>} />
                <Route path="/admin/audit" element={<AdminRoute><AdminAuditTrail /></AdminRoute>} />
                <Route path="/admin/limits" element={<AdminRoute><AdminLimits /></AdminRoute>} />
                <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
                <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
                <Route path="/admin/kyc" element={<AdminRoute><AdminKyc /></AdminRoute>} />
                <Route path="/admin/cards" element={<AdminRoute><AdminCards /></AdminRoute>} />
                <Route path="/admin/beneficiaries" element={<AdminRoute><AdminBeneficiaries /></AdminRoute>} />
                <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
                <Route path="/admin/roles" element={<AdminRoute><AdminRoles /></AdminRoute>} />
                <Route path="/admin/admins" element={<AdminRoute><AdminAdmins /></AdminRoute>} />
                <Route path="/admin/adjustments" element={<AdminRoute><AdminAdjustments /></AdminRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </KycProvider>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
