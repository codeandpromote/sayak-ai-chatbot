'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function AnalyticsPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!tenantId) return;
    apiClient
      .get('/analytics/summary', { headers: { 'x-tenant-id': tenantId } })
      .then((res) => setSummary(res.data));
  }, [tenantId]);

  if (!summary) return <div className="text-gray-500">Loading analytics...</div>;

  const cards = [
    { label: 'Total Conversations', value: summary.totalConversations, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Messages', value: summary.totalMessages, color: 'bg-purple-50 text-purple-600' },
    { label: 'Avg Msgs/Conversation', value: summary.avgMessagesPerConversation, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Leads Generated', value: summary.leadsGenerated, color: 'bg-green-50 text-green-600' },
    { label: 'Appointments Booked', value: summary.appointmentsBooked, color: 'bg-amber-50 text-amber-600' },
    { label: 'Human Handoffs', value: summary.handoffCount, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-3 ${card.color}`}>
              {card.label}
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
