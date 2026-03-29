import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

export default function Unauthorized() {
  const role = useAuthStore((s) => s.user?.role);

  const homeRoutes = {
    ADMIN: '/admin/dashboard',
    MANAGER: '/manager/pending',
    EMPLOYEE: '/employee/dashboard',
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="card-elevated text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-error" />
        </div>
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-2">Access Denied</h1>
        <p className="text-on-surface-variant text-sm mb-6">
          You don't have permission to view this page. Contact your administrator if you believe this is an error.
        </p>
        <Link
          to={homeRoutes[role] || '/login'}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
