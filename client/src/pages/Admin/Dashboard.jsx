import { LayoutDashboard, Users, Receipt, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusChip from '../../components/ui/StatusChip';
import { StatSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAllExpenses } from '../../hooks/useExpenses';
import { useUsers } from '../../hooks/useUsers';

export default function AdminDashboard() {
  const { data: expenseData, isLoading: loadingExpenses } = useAllExpenses({ limit: 5 });
  const { data: userData, isLoading: loadingUsers } = useUsers();

  const expenses = expenseData?.data || expenseData?.expenses || [];
  const users = userData?.data || userData?.users || [];
  const stats = expenseData?.stats || {};

  const isLoading = loadingExpenses || loadingUsers;

  const statCards = [
    { icon: Users, label: 'Total Users', value: users.length, color: 'primary' },
    { icon: Receipt, label: 'Total Expenses', value: stats.total ?? expenses.length, color: 'purple' },
    { icon: Clock, label: 'Pending', value: stats.pending ?? 0, color: 'amber' },
    { icon: DollarSign, label: 'Total Amount', value: `$${(stats.totalAmount ?? 0).toLocaleString()}`, color: 'green' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Admin Dashboard</h1>
        <p className="text-on-surface-variant text-sm mt-1">Company-wide overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
          : statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="card-elevated">
          <h2 className="font-headline font-semibold text-on-surface mb-4">Recent Expenses</h2>
          {loadingExpenses ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-surface-container-highest rounded-xl" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState title="No expenses" message="No expenses submitted yet" />
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {exp.employee?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface text-sm truncate">{exp.description}</p>
                    <p className="text-xs text-on-surface-variant">{exp.employee?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {exp.originalCurrency} {parseFloat(exp.amount).toFixed(2)}
                    </p>
                    <StatusChip status={exp.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Breakdown */}
        <div className="card-elevated">
          <h2 className="font-headline font-semibold text-on-surface mb-4">Team Members</h2>
          {loadingUsers ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-surface-container-highest rounded-xl" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState title="No users" message="Add team members to get started" />
          ) : (
            <div className="space-y-3">
              {users.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface text-sm truncate">{user.name}</p>
                    <p className="text-xs text-on-surface-variant">{user.email}</p>
                  </div>
                  <StatusChip status={user.role} size="xs" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
