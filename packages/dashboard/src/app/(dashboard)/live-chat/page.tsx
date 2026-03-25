'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function LiveChatPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, [tenantId]);

  async function loadSessions() {
    const res = await apiClient.get('/handoff/pending', {
      headers: { 'x-tenant-id': tenantId },
    });
    setSessions(res.data);
  }

  async function claimSession(conversationId: string) {
    await apiClient.post(`/handoff/${conversationId}/claim`, {}, {
      headers: { 'x-tenant-id': tenantId },
    });
    loadSessions();
  }

  async function resolveSession(conversationId: string) {
    await apiClient.post(`/handoff/${conversationId}/resolve`, {}, {
      headers: { 'x-tenant-id': tenantId },
    });
    setSelected(null);
    loadSessions();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Live Chat - Human Handoff</h1>

      <div className="flex gap-6">
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium">Pending Sessions ({sessions.length})</h3>
          </div>
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelected(session)}
            >
              <p className="font-medium text-sm">{session.conversation?.chatbot?.name}</p>
              <p className="text-xs text-gray-500 mt-1">{session.reason}</p>
              <button
                onClick={(e) => { e.stopPropagation(); claimSession(session.conversationId); }}
                className="mt-2 text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
              >
                Claim
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No pending handoff sessions
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selected ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  Conversation from {selected.conversation?.chatbot?.name}
                </h3>
                <button
                  onClick={() => resolveSession(selected.conversationId)}
                  className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700"
                >
                  Resolve
                </button>
              </div>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {selected.conversation?.messages?.map((msg: any) => (
                  <div key={msg.id} className={`text-sm p-2 rounded ${
                    msg.role === 'user' ? 'bg-blue-50 text-right' : 'bg-gray-50'
                  }`}>
                    <span className="text-xs text-gray-400">{msg.role}: </span>
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              Select a session to view and respond
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
