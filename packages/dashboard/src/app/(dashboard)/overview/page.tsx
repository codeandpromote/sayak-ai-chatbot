'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

interface Summary {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  leadsGenerated: number;
  appointmentsBooked: number;
  handoffCount: number;
}

export default function OverviewPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;
    apiClient
      .get('/analytics/summary', { headers: { 'x-tenant-id': tenantId } })
      .then((res) => setSummary(res.data.data))
      .catch(console.error);
  }, [tenantId]);

  const stats = summary
    ? [
        { label: 'Total Conversations', value: summary.totalConversations },
        { label: 'Total Messages', value: summary.totalMessages },
        { label: 'Avg Messages/Conv', value: summary.avgMessagesPerConversation },
        { label: 'Leads Generated', value: summary.leadsGenerated },
        { label: 'Appointments', value: summary.appointmentsBooked },
        { label: 'Handoffs', value: summary.handoffCount },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {!summary && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      )}
    </div>
  );
}
