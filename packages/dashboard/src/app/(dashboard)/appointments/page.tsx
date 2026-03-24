'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;
    apiClient
      .get('/appointments', { headers: { 'x-tenant-id': tenantId } })
      .then((res) => setAppointments(res.data.data));
  }, [tenantId]);

  async function updateStatus(id: string, status: string) {
    await apiClient.patch(`/appointments/${id}/status`, { status }, {
      headers: { 'x-tenant-id': tenantId },
    });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Appointments</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Visitor</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Date & Time</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm">{apt.visitorName}</td>
                <td className="p-4 text-sm">{apt.visitorEmail}</td>
                <td className="p-4 text-sm">
                  {new Date(apt.startTime).toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    apt.status === 'CONFIRMED' ? 'bg-green-50 text-green-600' :
                    apt.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                    apt.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {apt.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                        className="text-xs text-green-600 hover:underline"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, 'CANCELLED')}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <div className="p-8 text-center text-gray-400">No appointments booked yet</div>
        )}
      </div>
    </div>
  );
}
