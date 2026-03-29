import { useState, useEffect } from 'react';
import { useManagers } from '../../hooks/useUsers';

export default function UserForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    managerId: '',
    isManagerApprover: false,
  });

  const { data: managersData } = useManagers();
  const managers = managersData?.data || managersData?.managers || [];

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        role: initialData.role || 'EMPLOYEE',
        managerId: initialData.managerId || '',
        isManagerApprover: initialData.isManagerApprover || false,
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (isEdit) delete data.password;
    if (data.role !== 'EMPLOYEE') delete data.managerId;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="input-elevated"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="input-elevated"
          placeholder="john@company.com"
          required
        />
      </div>

      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="input-elevated"
            placeholder="Min 6 characters"
            required
            minLength={6}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-on-surface mb-1">Role</label>
        <select
          value={form.role}
          onChange={(e) => handleChange('role', e.target.value)}
          className="select-elevated"
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {form.role === 'EMPLOYEE' && (
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Assign Manager</label>
          <select
            value={form.managerId}
            onChange={(e) => handleChange('managerId', e.target.value)}
            className="select-elevated"
          >
            <option value="">Select a manager</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      )}

      {form.role === 'MANAGER' && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isManagerApprover"
            checked={form.isManagerApprover}
            onChange={(e) => handleChange('isManagerApprover', e.target.checked)}
            className="w-4 h-4 rounded border-outline accent-primary"
          />
          <label htmlFor="isManagerApprover" className="text-sm text-on-surface">
            Can approve expenses
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update User' : 'Add User'}
        </button>
      </div>
    </form>
  );
}
