import { useState } from 'react';
import { Clock, CheckCircle2, XCircle, Eye, MessageSquare, Loader2 } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import StatusChip from '../../components/ui/StatusChip';
import Modal from '../../components/ui/Modal';
import ApprovalTimeline from '../../components/ui/ApprovalTimeline';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton, StatSkeleton } from '../../components/ui/LoadingSkeleton';
import StatCard from '../../components/ui/StatCard';
import { usePendingApprovals, useApproveExpense, useRejectExpense, useExpenseById } from '../../hooks/useExpenses';

export default function PendingApprovals() {
  const [selectedId, setSelectedId] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { id, type: 'approve' | 'reject' }
  const [comment, setComment] = useState('');

  const { data, isLoading } = usePendingApprovals();
  const pending = data?.data || data?.expenses || [];

  const { data: detailData } = useExpenseById(selectedId || actionModal?.id);
  const detail = detailData?.data || detailData?.expense;

  const { mutate: approve, isPending: approving } = useApproveExpense();
  const { mutate: reject, isPending: rejecting } = useRejectExpense();

  const handleAction = () => {
    if (!actionModal) return;
    const payload = { id: actionModal.id, comment: comment.trim() || undefined };
    if (actionModal.type === 'approve') {
      approve(payload, { onSuccess: () => { setActionModal(null); setComment(''); } });
    } else {
      reject(payload, { onSuccess: () => { setActionModal(null); setComment(''); } });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Pending Approvals</h1>
        <p className="text-on-surface-variant text-sm mt-1">Review and approve team expenses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Clock} label="Pending" value={pending.length} color="amber" />
            <StatCard icon={CheckCircle2} label="Approved Today" value={data?.approvedToday ?? 0} color="green" />
            <StatCard icon={XCircle} label="Rejected Today" value={data?.rejectedToday ?? 0} color="red" />
          </>
        )}
      </div>

      {/* Table */}
      <div className="card-elevated p-0 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : pending.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All caught up!" message="No pending approvals" />
        ) : (
          <Table
            headers={['Employee', 'Description', 'Amount', 'Category', 'Date', { label: 'Actions', align: 'right' }]}
          >
            {pending.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {expense.employee?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{expense.employee?.name}</p>
                      <p className="text-xs text-on-surface-variant">{expense.employee?.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="truncate max-w-[180px]">{expense.description}</p>
                </TableCell>
                <TableCell>
                  <p className="font-semibold">
                    {expense.originalCurrency} {parseFloat(expense.amount).toFixed(2)}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-on-surface-variant">{expense.category?.replace('_', ' ')}</span>
                </TableCell>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelectedId(expense.id)}
                      className="p-2 rounded-xl hover:bg-surface-container-high transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => setActionModal({ id: expense.id, type: 'approve' })}
                      className="p-2 rounded-xl hover:bg-emerald-50 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => setActionModal({ id: expense.id, type: 'reject' })}
                      className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4 text-error" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Expense Details"
        size="lg"
      >
        {detail && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
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
                <p className="text-xs text-on-surface-variant">Category</p>
                <p className="font-medium">{detail.category?.replace('_', ' ')}</p>
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

            <div>
              <p className="text-xs text-on-surface-variant mb-1">Description</p>
              <p className="text-sm">{detail.description}</p>
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

      {/* Approve/Reject Modal */}
      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setComment(''); }}
        title={actionModal?.type === 'approve' ? 'Approve Expense' : 'Reject Expense'}
        size="sm"
        footer={
          <>
            <button onClick={() => { setActionModal(null); setComment(''); }} className="btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={approving || rejecting || (actionModal?.type === 'reject' && !comment.trim())}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-medium text-white transition-all active:scale-[0.98] ${
                actionModal?.type === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-error hover:bg-error/90'
              }`}
            >
              {(approving || rejecting) ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {actionModal?.type === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            {actionModal?.type === 'approve'
              ? 'Add an optional comment for this approval.'
              : 'Please provide a reason for rejecting this expense.'}
          </p>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Comment {actionModal?.type === 'reject' && <span className="text-error">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-elevated resize-none min-h-[80px]"
              placeholder={actionModal?.type === 'approve' ? 'Optional comment...' : 'Reason for rejection...'}
              required={actionModal?.type === 'reject'}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
