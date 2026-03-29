import { useState } from 'react';
import { Plus, Edit2, Trash2, Star, StarOff } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import RuleBuilder from '../../components/forms/RuleBuilder';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useRules, useCreateRule, useUpdateRule, useDeleteRule, useSetDefaultRule } from '../../hooks/useRules';

export default function ApprovalRules() {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useRules();
  const rules = data?.data || data?.rules || [];

  const { mutate: createRule, isPending: creating } = useCreateRule();
  const { mutate: updateRule, isPending: updating } = useUpdateRule();
  const { mutate: deleteRule, isPending: deleting } = useDeleteRule();
  const { mutate: setDefault } = useSetDefaultRule();

  const handleCreate = (ruleData) => {
    createRule(ruleData, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleUpdate = (ruleData) => {
    updateRule(
      { id: editingRule.id, ...ruleData },
      { onSuccess: () => setEditingRule(null) }
    );
  };

  const handleDelete = () => {
    deleteRule(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Approval Rules</h1>
          <p className="text-on-surface-variant text-sm mt-1">Configure expense approval workflows</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </button>
      </div>

      <div className="card-elevated p-0 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : rules.length === 0 ? (
          <EmptyState
            title="No approval rules"
            message="Create your first approval workflow"
            action={() => setShowForm(true)}
            actionLabel="Create Rule"
          />
        ) : (
          <Table headers={['Name', 'Type', 'Steps', 'Threshold', 'Default', { label: 'Actions', align: 'right' }]}>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <p className="font-medium">{rule.name}</p>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {rule.ruleType}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {(rule.steps || []).map((step, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                          {step.stepOrder}
                        </span>
                        {i < (rule.steps?.length || 0) - 1 && (
                          <span className="text-outline text-xs">→</span>
                        )}
                      </div>
                    ))}
                    {!rule.steps?.length && (
                      <span className="text-xs text-on-surface-variant">No steps</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {rule.percentageThreshold ? (
                    <span className="font-medium">{rule.percentageThreshold}%</span>
                  ) : (
                    <span className="text-on-surface-variant">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setDefault(rule.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      rule.isDefault
                        ? 'text-amber-500'
                        : 'text-outline hover:text-amber-500'
                    }`}
                    title={rule.isDefault ? 'Default rule' : 'Set as default'}
                  >
                    {rule.isDefault ? (
                      <Star className="w-4 h-4 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </button>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-2 rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => setDeleteId(rule.id)}
                      className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-error" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Approval Rule" size="lg">
        <RuleBuilder
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={creating}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editingRule} onClose={() => setEditingRule(null)} title="Edit Approval Rule" size="lg">
        <RuleBuilder
          initialData={editingRule}
          onSubmit={handleUpdate}
          onCancel={() => setEditingRule(null)}
          loading={updating}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Rule"
        message="This will permanently delete this approval rule. Existing expenses using this rule will not be affected."
        confirmLabel="Delete Rule"
        loading={deleting}
      />
    </div>
  );
}
