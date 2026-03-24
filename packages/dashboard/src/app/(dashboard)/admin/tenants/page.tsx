'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  monthlyMessageQuota: number;
  messagesUsed: number;
  createdAt: string;
  _count: { users: number; chatbots: number };
}

export default function AdminTenantsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ plan: '', status: '', monthlyMessageQuota: 0 });

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/tenants', { params: { page, limit: 20, search: search || undefined } });
      setTenants(res.data.tenants);
      setTotal(res.data.total);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    if (!user?.isSuperAdmin) { router.push('/overview'); return; }
    fetchTenants();
  }, [user, router, fetchTenants]);

  const startEdit = (t: Tenant) => {
    setEditingId(t.id);
    setEditForm({ plan: t.plan, status: t.status, monthlyMessageQuota: t.monthlyMessageQuota });
  };

  const saveEdit = async (id: string) => {
    await apiClient.patch(`/admin/tenants/${id}`, editForm);
    setEditingId(null);
    fetchTenants();
  };

  const deleteTenant = async (id: string, name: string) => {
    if (!confirm(`Delete tenant "${name}"? This cannot be undone.`)) return;
    await apiClient.delete(`/admin/tenants/${id}`);
    fetchTenants();
  };

  if (!user?.isSuperAdmin) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Tenants</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tenants..."
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
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Users</th>
                  <th className="px-4 py-3 font-medium">Chatbots</th>
                  <th className="px-4 py-3 font-medium">Messages</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === t.id ? (
                        <select
                          value={editForm.plan}
                          onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO</option>
                          <option value="ENTERPRISE">ENTERPRISE</option>
                        </select>
                      ) : (
                        <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-1 rounded">{t.plan}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === t.id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          t.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>{t.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t._count.users}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t._count.chatbots}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {editingId === t.id ? (
                        <input
                          type="number"
                          value={editForm.monthlyMessageQuota}
                          onChange={(e) => setEditForm({ ...editForm, monthlyMessageQuota: parseInt(e.target.value) || 0 })}
                          className="w-20 text-sm border rounded px-2 py-1"
                        />
                      ) : (
                        `${t.messagesUsed} / ${t.monthlyMessageQuota}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editingId === t.id ? (
                          <>
                            <button onClick={() => saveEdit(t.id)} className="text-xs text-green-600 hover:text-green-800 font-medium">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(t)} className="text-xs text-primary-600 hover:text-primary-800 font-medium">Edit</button>
                            <button onClick={() => deleteTenant(t.id, t.name)} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">{total} total tenants</div>
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
                disabled={tenants.length < 20}
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
