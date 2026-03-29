import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useManagers } from '../../hooks/useUsers';

const RULE_TYPES = ['SEQUENTIAL', 'PERCENTAGE', 'SPECIFIC', 'HYBRID'];

export default function RuleBuilder({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    ruleType: 'SEQUENTIAL',
    percentageThreshold: 50,
    specificApproverId: '',
    steps: [{ approverId: '', stepOrder: 1 }],
  });

  const { data: managersData } = useManagers();
  const managers = managersData?.data || managersData?.managers || [];

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        ruleType: initialData.ruleType || 'SEQUENTIAL',
        percentageThreshold: initialData.percentageThreshold || 50,
        specificApproverId: initialData.specificApproverId || '',
        steps: initialData.steps?.map((s, i) => ({
          approverId: s.approverId || '',
          stepOrder: s.stepOrder || i + 1,
        })) || [{ approverId: '', stepOrder: 1 }],
      });
    }
  }, [initialData]);

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { approverId: '', stepOrder: prev.steps.length + 1 }],
    }));
  };

  const removeStep = (index) => {
    if (form.steps.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, stepOrder: i + 1 })),
    }));
  };

  const updateStep = (index, approverId) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? { ...s, approverId } : s)),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!['PERCENTAGE', 'HYBRID'].includes(data.ruleType)) {
      delete data.percentageThreshold;
    }
    if (!['SPECIFIC', 'HYBRID'].includes(data.ruleType)) {
      delete data.specificApproverId;
    }
    onSubmit(data);
  };

  const showPercentage = ['PERCENTAGE', 'HYBRID'].includes(form.ruleType);
  const showSpecific = ['SPECIFIC', 'HYBRID'].includes(form.ruleType);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">Rule Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="input-elevated"
          placeholder="e.g. Standard Approval"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface mb-2">Rule Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RULE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setForm((p) => ({ ...p, ruleType: type }))}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                form.ruleType === type
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {showPercentage && (
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Approval Threshold: {form.percentageThreshold}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={form.percentageThreshold}
            onChange={(e) =>
              setForm((p) => ({ ...p, percentageThreshold: parseInt(e.target.value) }))
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-on-surface-variant mt-1">
            <span>1%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {showSpecific && (
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Specific Approver (Override)
          </label>
          <select
            value={form.specificApproverId}
            onChange={(e) => setForm((p) => ({ ...p, specificApproverId: e.target.value }))}
            className="select-elevated"
            required
          >
            <option value="">Select approver</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-on-surface">Approval Steps</label>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-container transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Step
          </button>
        </div>
        <div className="space-y-2">
          {form.steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-xs font-bold flex-shrink-0">
                {step.stepOrder}
              </div>
              <select
                value={step.approverId}
                onChange={(e) => updateStep(idx, e.target.value)}
                className="select-elevated flex-1"
                required
              >
                <option value="">Select approver</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeStep(idx)}
                disabled={form.steps.length <= 1}
                className="p-2 rounded-xl text-error hover:bg-error/8 transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Rule' : 'Create Rule'}
        </button>
      </div>
    </form>
  );
}
