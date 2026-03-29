import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GitBranch, Receipt, PlusCircle, Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const navItems = {
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/rules', label: 'Rules', icon: GitBranch },
    { to: '/admin/expenses', label: 'Expenses', icon: Receipt },
  ],
  MANAGER: [
    { to: '/manager/pending', label: 'Pending', icon: Clock },
    { to: '/manager/team', label: 'Team', icon: Users },
  ],
  EMPLOYEE: [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/expenses', label: 'Expenses', icon: Receipt },
    { to: '/employee/submit', label: 'Submit', icon: PlusCircle },
  ],
};

export default function BottomNav() {
  const role = useAuthStore((s) => s.user?.role) || 'EMPLOYEE';
  const items = navItems[role] || [];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-outline-variant/30 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[60px] ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
