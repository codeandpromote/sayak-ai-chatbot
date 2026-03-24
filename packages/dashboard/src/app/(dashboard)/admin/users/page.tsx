'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  tenants: { role: string; tenant: { id: string; name: string; slug: string } }[];
}

export default function AdminUsersPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/users', { params: { page, limit: 20, search: search || undefined } });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    if (!currentUser?.isSuperAdmin) { router.push('/overview'); return; }
    fetchUsers();
  }, [currentUser, router, fetchUsers]);

  const toggleSuperAdmin = async (userId: string, current: boolean) => {
    if (userId === currentUser?.id) { alert('Cannot change your own super admin status'); return; }
    await apiClient.patch(`/admin/users/${userId}`, { isSuperAdmin: !current });
    fetchUsers();
  };

  const toggleActive = async (userId: string, current: boolean) => {
    if (userId === currentUser?.id) { alert('Cannot deactivate yourself'); return; }
    await apiClient.patch(`/admin/users/${userId}`, { isActive: !current });
    fetchUsers();
  };

  const deleteUser = async (userId: string, email: string) => {
    if (userId === currentUser?.id) { alert('Cannot delete yourself'); return; }
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    await apiClient.delete(`/admin/users/${userId}`);
    fetchUsers();
  };

  if (!currentUser?.isSuperAdmin) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-sm text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Tenants</th>
                  <th className="px-4 py-3 font-medium">Super Admin</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.tenants.map((t) => (
                          <span key={t.tenant.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {t.tenant.name} ({t.role})
                          </span>
                        ))}
                        {u.tenants.length === 0 && <span className="text-xs text-gray-400">No tenants</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSuperAdmin(u.id, u.isSuperAdmin)}
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          u.isSuperAdmin
                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {u.isSuperAdmin ? 'Super Admin' : 'Regular'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(u.id, u.isActive)}
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          u.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteUser(u.id, u.email)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">{total} total users</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={users.length < 20}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
