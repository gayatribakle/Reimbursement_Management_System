import { Receipt, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusChip from '../../components/ui/StatusChip';
import { StatSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useMyExpenses } from '../../hooks/useExpenses';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useMyExpenses({ limit: 5 });
  const expenses = data?.data || data?.expenses || [];
  const stats = data?.stats || {};

  const statCards = [
    { icon: Receipt, label: 'Total Submitted', value: stats.total ?? expenses.length, color: 'primary' },
    { icon: Clock, label: 'Pending', value: stats.pending ?? expenses.filter((e) => e.status === 'PENDING').length, color: 'amber' },
    { icon: CheckCircle2, label: 'Approved', value: stats.approved ?? expenses.filter((e) => e.status === 'APPROVED').length, color: 'green' },
    { icon: DollarSign, label: 'Total Amount', value: `$${(stats.totalAmount ?? 0).toLocaleString()}`, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant text-sm mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
          : statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Recent Expenses */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-semibold text-on-surface">Recent Expenses</h2>
          <button
            onClick={() => navigate('/employee/expenses')}
            className="text-primary text-sm font-medium hover:underline"
          >
            View All →
          </button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-highest rounded w-40" />
                  <div className="h-3 bg-surface-container-high rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            message="Submit your first expense to get started"
            action={() => navigate('/employee/submit')}
            actionLabel="Submit Expense"
          />
        ) : (
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                onClick={() => navigate('/employee/expenses')}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface text-sm truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {expense.category} · {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-on-surface text-sm">
                    {expense.originalCurrency} {parseFloat(expense.amount).toFixed(2)}
                  </p>
                  <StatusChip status={expense.status} size="xs" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
