'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

interface PlatformStats {
  totalTenants: number;
  totalUsers: number;
  totalChatbots: number;
  totalConversations: number;
  totalMessages: number;
  totalLeads: number;
  tenantsByPlan: Record<string, number>;
  tenantsByStatus: Record<string, number>;
  recentTenants: { id: string; name: string; slug: string; plan: string; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isSuperAdmin) {
      router.push('/overview');
      return;
    }
    apiClient.get('/admin/stats').then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, router]);

  if (!user?.isSuperAdmin) return null;
  if (loading) return <div className="text-gray-500">Loading platform stats...</div>;
  if (!stats) return <div className="text-red-500">Failed to load stats</div>;

  const statCards = [
    { label: 'Total Tenants', value: stats.totalTenants, color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-green-50 text-green-700' },
    { label: 'Total Chatbots', value: stats.totalChatbots, color: 'bg-purple-50 text-purple-700' },
    { label: 'Conversations', value: stats.totalConversations, color: 'bg-orange-50 text-orange-700' },
    { label: 'Messages', value: stats.totalMessages, color: 'bg-pink-50 text-pink-700' },
    { label: 'Leads', value: stats.totalLeads, color: 'bg-teal-50 text-teal-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Super Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
            <div className="text-sm opacity-80">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tenants by Plan</h3>
          <div className="space-y-3">
            {Object.entries(stats.tenantsByPlan).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{plan}</span>
                <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tenants by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.tenantsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Tenants</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentTenants.map((tenant) => (
            <div key={tenant.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{tenant.name}</div>
                <div className="text-sm text-gray-500">{tenant.slug}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-1 rounded">
                  {tenant.plan}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
