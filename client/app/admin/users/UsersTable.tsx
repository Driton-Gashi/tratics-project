'use client';

import { useMemo, useState } from 'react';
import { adminApi, type AdminUser } from '@/src/lib/admin-api';

type UsersData = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

type UsersTableProps = {
  initialData: UsersData;
};

export default function UsersTable({ initialData }: UsersTableProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialData.users);
  const [total, setTotal] = useState(initialData.total);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({
    email: '',
    username: '',
    role: 'user' as 'user' | 'admin',
  });
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const usersById = useMemo(() => {
    return new Map(users.map(user => [user.id, user]));
  }, [users]);

  const startEdit = (user: AdminUser) => {
    setEditingUserId(user.id);
    setEditValues({
      email: user.email,
      username: user.username ?? '',
      role: user.role,
    });
    setActionError(null);
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setActionError(null);
  };

  const handleSave = async (userId: number) => {
    const original = usersById.get(userId);
    if (!original) {
      return;
    }

    const trimmedEmail = editValues.email.trim();
    if (!trimmedEmail) {
      setActionError('Email is required.');
      return;
    }

    const trimmedUsername = editValues.username.trim();
    const updates: { email?: string; username?: string | null; role?: 'user' | 'admin' } = {};

    if (trimmedEmail !== original.email) {
      updates.email = trimmedEmail;
    }

    if (trimmedUsername !== (original.username ?? '')) {
      updates.username = trimmedUsername.length > 0 ? trimmedUsername : null;
    }

    if (editValues.role !== original.role) {
      updates.role = editValues.role;
    }

    if (Object.keys(updates).length === 0) {
      setActionError('No changes to save.');
      return;
    }

    try {
      setSavingUserId(userId);
      setActionError(null);
      const updatedUser = await adminApi.updateUser(userId, updates);
      setUsers(current =>
        current.map(user => (user.id === userId ? updatedUser : user))
      );
      setEditingUserId(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to update user.');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDelete = async (userId: number) => {
    const confirmed = window.confirm('Delete this user? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(userId);
      setActionError(null);
      await adminApi.deleteUser(userId);
      setUsers(current => current.filter(user => user.id !== userId));
      setTotal(current => Math.max(0, current - 1));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total: {total} users
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Page {initialData.page} of {initialData.total_pages}
          </div>
        </div>
        {actionError && (
          <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
            {actionError}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-black/10 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {users.map(user => {
                const isEditing = editingUserId === user.id;
                const isSaving = savingUserId === user.id;
                const isDeleting = deletingUserId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                      {isEditing ? (
                        <input
                          className="w-full rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                          value={editValues.email}
                          onChange={event =>
                            setEditValues(current => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {isEditing ? (
                        <input
                          className="w-full rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                          value={editValues.username}
                          onChange={event =>
                            setEditValues(current => ({
                              ...current,
                              username: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        user.username || '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                          value={editValues.role}
                          onChange={event =>
                            setEditValues(current => ({
                              ...current,
                              role: event.target.value as 'user' | 'admin',
                            }))
                          }
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                              onClick={() => handleSave(user.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              onClick={cancelEdit}
                              disabled={isSaving}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              onClick={() => startEdit(user)}
                              disabled={deletingUserId !== null}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                              onClick={() => handleDelete(user.id)}
                              disabled={isDeleting || deletingUserId !== null}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {initialData.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {initialData.page > 1 && (
            <a
              href={`/admin/users?page=${initialData.page - 1}`}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Previous
            </a>
          )}
          {initialData.page < initialData.total_pages && (
            <a
              href={`/admin/users?page=${initialData.page + 1}`}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
