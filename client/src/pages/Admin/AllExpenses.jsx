import { useState } from 'react';
import { Search, Eye, ShieldCheck, XCircle } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import StatusChip from '../../components/ui/StatusChip';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ApprovalTimeline from '../../components/ui/ApprovalTimeline';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAllExpenses, useExpenseById, useOverrideExpense } from '../../hooks/useExpenses';

export default function AllExpenses() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [overrideModal, setOverrideModal] = useState(null);
  const [overrideComment, setOverrideComment] = useState('');

  const { data, isLoading } = useAllExpenses({ status: statusFilter, page, limit: 10 });
  const expenses = data?.data || data?.expenses || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const { data: detailData } = useExpenseById(selectedId || overrideModal?.id);
  const detail = detailData?.data || detailData?.expense;

  const { mutate: override, isPending: overriding } = useOverrideExpense();

  const filtered = searchTerm
    ? expenses.filter(
        (e) =>
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : expenses;

  const handleOverride = () => {
    if (!overrideModal) return;
    override(
      { id: overrideModal.id, action: overrideModal.action, comment: overrideComment.trim() || undefined },
      {
        onSuccess: () => {
          setOverrideModal(null);
          setOverrideComment('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">All Expenses</h1>
        <p className="text-on-surface-variant text-sm mt-1">Company-wide expense log</p>
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
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
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
          <EmptyState title="No expenses found" message="Try adjusting your filters" />
        ) : (
          <>
            <Table headers={['Employee', 'Description', 'Amount', 'Category', 'Date', 'Status', { label: 'Actions', align: 'right' }]}>
              {filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                        {expense.employee?.name?.[0] || '?'}
                      </div>
                      <p className="font-medium text-sm">{expense.employee?.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="truncate max-w-[160px]">{expense.description}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">
                      {expense.originalCurrency} {parseFloat(expense.amount).toFixed(2)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-on-surface-variant">{expense.category?.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell><StatusChip status={expense.status} /></TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedId(expense.id)}
                        className="p-2 rounded-xl hover:bg-surface-container-high transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-primary" />
                      </button>
                      {expense.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setOverrideModal({ id: expense.id, action: 'APPROVED' })}
                            className="p-2 rounded-xl hover:bg-emerald-50 transition-colors"
                            title="Override approve"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => setOverrideModal({ id: expense.id, action: 'REJECTED' })}
                            className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                            title="Override reject"
                          >
                            <XCircle className="w-4 h-4 text-error" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} title="Expense Details" size="lg">
        {detail && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                {detail.employee?.name?.[0] || '?'}
              </div>
              <div>
                <p className="font-medium text-on-surface">{detail.employee?.name}</p>
                <p className="text-xs text-on-surface-variant">{detail.employee?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant">Amount</p>
                <p className="font-semibold text-lg">{detail.originalCurrency} {parseFloat(detail.amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Converted</p>
                <p className="font-medium">{detail.companyCurrency} {parseFloat(detail.convertedAmount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Category</p>
                <p className="font-medium">{detail.category?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Status</p>
                <StatusChip status={detail.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Description</p>
              <p className="text-sm">{detail.description}</p>
            </div>
            {detail.receiptPath && (
              <div>
                <p className="text-xs text-on-surface-variant mb-2">Receipt</p>
                <img src={`http://localhost:5000/${detail.receiptPath}`} alt="Receipt" className="max-h-48 rounded-xl object-contain bg-surface-container-low" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-on-surface mb-3">Approval Timeline</p>
              <ApprovalTimeline logs={detail.logs || []} steps={detail.approvalRule?.steps || []} currentStepIndex={detail.currentStepIndex || 0} expenseStatus={detail.status || 'PENDING'} />
            </div>
          </div>
        )}
      </Modal>

      {/* Override Modal */}
      <Modal
        open={!!overrideModal}
        onClose={() => { setOverrideModal(null); setOverrideComment(''); }}
        title={`Admin Override: ${overrideModal?.action === 'APPROVED' ? 'Approve' : 'Reject'}`}
        size="sm"
        footer={
          <>
            <button onClick={() => { setOverrideModal(null); setOverrideComment(''); }} className="btn-ghost">Cancel</button>
            <button
              onClick={handleOverride}
              disabled={overriding}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-medium text-white transition-all active:scale-[0.98] ${
                overrideModal?.action === 'APPROVED' ? 'bg-emerald-600' : 'bg-error'
              }`}
            >
              {overriding ? 'Processing...' : `Override ${overrideModal?.action === 'APPROVED' ? 'Approve' : 'Reject'}`}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            This will bypass the normal approval workflow and {overrideModal?.action === 'APPROVED' ? 'approve' : 'reject'} this expense immediately with admin authority.
          </p>
          <textarea
            value={overrideComment}
            onChange={(e) => setOverrideComment(e.target.value)}
            className="input-elevated resize-none min-h-[80px]"
            placeholder="Optional admin comment..."
          />
        </div>
      </Modal>
    </div>
  );
}
