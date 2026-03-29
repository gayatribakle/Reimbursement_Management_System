import { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import StatusChip from '../../components/ui/StatusChip';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ApprovalTimeline from '../../components/ui/ApprovalTimeline';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useMyExpenses, useExpenseById } from '../../hooks/useExpenses';
import { useNavigate } from 'react-router-dom';

export default function MyExpenses() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useMyExpenses({ status: statusFilter, page, limit: 10 });
  const expenses = data?.data || data?.expenses || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const { data: detailData } = useExpenseById(selectedId);
  const detail = detailData?.data || detailData?.expense;

  const filtered = searchTerm
    ? expenses.filter(
        (e) =>
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : expenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">My Expenses</h1>
          <p className="text-on-surface-variant text-sm mt-1">Track all your submitted expenses</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/employee/submit')}>
          + Submit Expense
        </button>
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
            placeholder="Search expenses..."
          />
        </div>
        <div className="flex gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
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
          <EmptyState title="No expenses found" message="Try adjusting your filters" />
        ) : (
          <>
            <Table
              headers={[
                'Description',
                'Category',
                'Amount',
                'Date',
                'Status',
                { label: 'Actions', align: 'right' },
              ]}
            >
              {filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <p className="font-medium truncate max-w-[200px]">{expense.description}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-on-surface-variant">{expense.category?.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">
                      {expense.originalCurrency} {parseFloat(expense.amount).toFixed(2)}
                    </p>
                    {expense.originalCurrency !== expense.companyCurrency && (
                      <p className="text-xs text-on-surface-variant">
                        ≈ {expense.companyCurrency} {parseFloat(expense.convertedAmount).toFixed(2)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-on-surface-variant">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={expense.status} />
                  </TableCell>
                  <TableCell align="right">
                    <button
                      onClick={() => setSelectedId(expense.id)}
                      className="p-2 rounded-xl hover:bg-surface-container-high transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4 text-primary" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Expense Details"
        description={detail?.description}
        size="lg"
      >
        {detail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant">Category</p>
                <p className="font-medium">{detail.category?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Amount</p>
                <p className="font-semibold">
                  {detail.originalCurrency} {parseFloat(detail.amount).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Date</p>
                <p className="font-medium">{new Date(detail.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Status</p>
                <StatusChip status={detail.status} />
              </div>
            </div>

            {detail.receiptPath && (
              <div>
                <p className="text-xs text-on-surface-variant mb-2">Receipt</p>
                <img
                  src={`http://localhost:5000/${detail.receiptPath}`}
                  alt="Receipt"
                  className="max-h-48 rounded-xl object-contain bg-surface-container-low"
                />
              </div>
            )}

            {detail.status === 'REJECTED' && detail.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-xs text-error font-medium mb-1">Rejection Reason</p>
                <p className="text-sm text-on-surface">{detail.rejectionReason}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-on-surface mb-3">Approval Timeline</p>
              <ApprovalTimeline
                logs={detail.logs || []}
                steps={detail.approvalRule?.steps || []}
                currentStepIndex={detail.currentStepIndex || 0}
                expenseStatus={detail.status || 'PENDING'}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
