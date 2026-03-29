import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GitBranch, Receipt, PlusCircle, Clock,
  LogOut, Building2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useLogout } from '../../hooks/useAuth';
import StatusChip from '../ui/StatusChip';

const navItems = {
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/rules', label: 'Approval Rules', icon: GitBranch },
    { to: '/admin/expenses', label: 'All Expenses', icon: Receipt },
  ],
  MANAGER: [
    { to: '/manager/pending', label: 'Pending Approvals', icon: Clock },
    { to: '/manager/team', label: 'Team Expenses', icon: Users },
  ],
  FINANCE: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/pending', label: 'Pending Approvals', icon: Clock },
    { to: '/admin/expenses', label: 'All Expenses', icon: Receipt },
  ],
  DIRECTOR: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/pending', label: 'Pending Approvals', icon: Clock },
    { to: '/admin/expenses', label: 'All Expenses', icon: Receipt },
  ],
  EMPLOYEE: [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/expenses', label: 'My Expenses', icon: Receipt },
    { to: '/employee/submit', label: 'Submit Expense', icon: PlusCircle },
  ],
};

export default function Sidebar({ collapsed, onToggle }) {
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const { mutate: logout } = useLogout();
  const role = user?.role || 'EMPLOYEE';
  const items = navItems[role] || [];

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-outline-variant/30 h-screen transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 min-w-[40px] bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-headline font-semibold text-on-surface text-sm truncate">
                {company?.name || 'Company'}
              </h1>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {company?.currency || 'USD'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary/8 text-primary border-l-[3px] border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high border-l-[3px] border-transparent'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <item.icon className="w-5 h-5 min-w-[20px]" />
            {!collapsed && <span className="font-body font-medium text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-outline-variant/30">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 min-w-[36px] rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-on-surface truncate">{user?.name}</p>
              <StatusChip status={role} size="xs" />
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-error hover:bg-error/8 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
