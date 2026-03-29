import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AppLayout from './components/layout/AppLayout';
import AuthGuard from './guards/AuthGuard';
import RoleGuard from './guards/RoleGuard';
import { PageSkeleton } from './components/ui/LoadingSkeleton';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Employee
const EmployeeDashboard = lazy(() => import('./pages/Employee/Dashboard'));
const MyExpenses = lazy(() => import('./pages/Employee/MyExpenses'));
const SubmitExpense = lazy(() => import('./pages/Employee/SubmitExpense'));

// Manager
const PendingApprovals = lazy(() => import('./pages/Manager/PendingApprovals'));
const TeamExpenses = lazy(() => import('./pages/Manager/TeamExpenses'));

// Admin
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const ApprovalRules = lazy(() => import('./pages/Admin/ApprovalRules'));
const AllExpenses = lazy(() => import('./pages/Admin/AllExpenses'));

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#151c22',
            borderRadius: '12px',
            boxShadow: '0 12px 32px -4px rgba(0, 64, 162, 0.12)',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ba1a1a', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <SuspenseWrapper>
              <Login />
            </SuspenseWrapper>
          }
        />
        <Route
          path="/signup"
          element={
            <SuspenseWrapper>
              <Signup />
            </SuspenseWrapper>
          }
        />
        <Route
          path="/unauthorized"
          element={
            <SuspenseWrapper>
              <Unauthorized />
            </SuspenseWrapper>
          }
        />

        {/* Authenticated */}
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            {/* Employee (Accessible by all roles to submit their own expenses) */}
            <Route element={<RoleGuard roles={['EMPLOYEE', 'MANAGER', 'FINANCE', 'DIRECTOR', 'ADMIN']} />}>
              <Route path="/employee/dashboard" element={<SuspenseWrapper><EmployeeDashboard /></SuspenseWrapper>} />
              <Route path="/employee/expenses" element={<SuspenseWrapper><MyExpenses /></SuspenseWrapper>} />
              <Route path="/employee/submit" element={<SuspenseWrapper><SubmitExpense /></SuspenseWrapper>} />
            </Route>

            {/* Manager */}
            <Route element={<RoleGuard roles={['MANAGER', 'FINANCE', 'DIRECTOR', 'ADMIN']} />}>
              <Route path="/manager/pending" element={<SuspenseWrapper><PendingApprovals /></SuspenseWrapper>} />
              <Route path="/manager/team" element={<SuspenseWrapper><TeamExpenses /></SuspenseWrapper>} />
            </Route>

            {/* Admin Only */}
            <Route element={<RoleGuard roles={['ADMIN']} />}>
              <Route path="/admin/users" element={<SuspenseWrapper><UserManagement /></SuspenseWrapper>} />
              <Route path="/admin/rules" element={<SuspenseWrapper><ApprovalRules /></SuspenseWrapper>} />
            </Route>

            {/* Shared Admin/Manager/Finance/Director (All Expenses & Dash) */}
            <Route element={<RoleGuard roles={['ADMIN', 'MANAGER', 'FINANCE', 'DIRECTOR']} />}>
              <Route path="/admin/dashboard" element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
              <Route path="/admin/expenses" element={<SuspenseWrapper><AllExpenses /></SuspenseWrapper>} />
            </Route>
          </Route>
        </Route>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
