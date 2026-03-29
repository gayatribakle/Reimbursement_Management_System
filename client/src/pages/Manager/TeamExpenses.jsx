import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import StatusChip from '../../components/ui/StatusChip';
import Pagination from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useTeamExpenses } from '../../hooks/useExpenses';

export default function TeamExpenses() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useTeamExpenses({ status: statusFilter, page, limit: 10 });
  const expenses = data?.data || data?.expenses || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const filtered = searchTerm
    ? expenses.filter(
        (e) =>
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : expenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Team Expenses</h1>
        <p className="text-on-surface-variant text-sm mt-1">Track your team's expense history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-elevated pl-10"
            placeholder="Search by name, description..."
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated p-0 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No team expenses" message="Your team hasn't submitted any expenses yet" />
        ) : (
          <>
            <Table
              headers={['Employee', 'Description', 'Category', 'Amount', 'Date', 'Status']}
            >
              {filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {expense.employee?.name?.[0] || '?'}
                      </div>
                      <p className="font-medium text-sm">{expense.employee?.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="truncate max-w-[180px]">{expense.description}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-on-surface-variant">{expense.category?.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">
                      {expense.originalCurrency} {parseFloat(expense.amount).toFixed(2)}
                    </p>
                  </TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell><StatusChip status={expense.status} /></TableCell>
                </TableRow>
              ))}
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
