'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function LeadsPage() {
  const [data, setData] = useState<{ leads: any[]; total: number }>({ leads: [], total: 0 });
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;
    apiClient
      .get('/leads', { headers: { 'x-tenant-id': tenantId } })
      .then((res) => setData(res.data));
  }, [tenantId]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leads ({data.total})</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Phone</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Source</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm">{lead.name || '-'}</td>
                <td className="p-4 text-sm">{lead.email || '-'}</td>
                <td className="p-4 text-sm">{lead.phone || '-'}</td>
                <td className="p-4 text-sm text-gray-500">
                  {lead.conversation?.chatbot?.name || '-'}
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(lead.capturedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.leads.length === 0 && (
          <div className="p-8 text-center text-gray-400">No leads captured yet</div>
        )}
      </div>
    </div>
  );
}
