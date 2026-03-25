'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;
    apiClient
      .get('/chat/conversations', { headers: { 'x-tenant-id': tenantId } })
      .then((res) => setConversations(res.data));
  }, [tenantId]);

  async function selectConversation(id: string) {
    setSelected(id);
    const res = await apiClient.get(`/chat/conversations/${id}/messages`, {
      headers: { 'x-tenant-id': tenantId },
    });
    setMessages(res.data);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Conversations</h1>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`w-full p-4 text-left border-b border-gray-50 hover:bg-gray-50 ${
                selected === conv.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {conv.chatbot?.name || 'Unknown'}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  conv.status === 'ACTIVE' ? 'bg-green-50 text-green-600' :
                  conv.status === 'HANDED_OFF' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {conv.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">
                {conv.messages?.[0]?.content || 'No messages'}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {conv._count?.messages || 0} messages
              </p>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No conversations yet</div>
          )}
        </div>

        {/* Message View */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {selected ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : msg.role === 'system'
                        ? 'bg-gray-100 text-gray-500 italic'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-xs opacity-70 mb-1">{msg.role}</p>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
