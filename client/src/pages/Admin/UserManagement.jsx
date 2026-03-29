import { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import StatusChip from '../../components/ui/StatusChip';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import UserForm from '../../components/forms/UserForm';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers';

export default function UserManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useUsers({ role: roleFilter });
  const users = data?.data || data?.users || [];

  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateUser, isPending: updating } = useUpdateUser();
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser();

  const filtered = searchTerm
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const handleCreate = (data) => {
    createUser(data, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleUpdate = (data) => {
    updateUser(
      { id: editingUser.id, ...data },
      { onSuccess: () => setEditingUser(null) }
    );
  };

  const handleDelete = () => {
    deleteUser(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">User Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage team members and roles</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
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
            placeholder="Search users..."
          />
        </div>
        <div className="flex gap-2">
          {['', 'ADMIN', 'MANAGER', 'EMPLOYEE'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === role
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {role || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated p-0 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" message="Add users or adjust filters" />
        ) : (
          <Table headers={['User', 'Email', 'Role', 'Manager', { label: 'Actions', align: 'right' }]}>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <p className="font-medium text-sm">{user.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-on-surface-variant text-sm">{user.email}</p>
                </TableCell>
                <TableCell>
                  <StatusChip status={user.role} />
                </TableCell>
                <TableCell>
                  <p className="text-on-surface-variant text-sm">
                    {user.manager?.name || '—'}
                  </p>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => setDeleteId(user.id)}
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
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New User" size="md">
        <UserForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={creating}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        size="md"
      >
        <UserForm
          initialData={editingUser}
          onSubmit={handleUpdate}
          onCancel={() => setEditingUser(null)}
          loading={updating}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="This will permanently delete this user and all their associated data. This action cannot be undone."
        confirmLabel="Delete User"
        loading={deleting}
      />
    </div>
  );
}
