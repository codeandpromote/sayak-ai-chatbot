'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

interface Chatbot {
  id: string;
  name: string;
  isActive: boolean;
  primaryColor: string;
  _count: { conversations: number; knowledgeSources: number };
  createdAt: string;
}

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;
    loadChatbots();
  }, [tenantId]);

  async function loadChatbots() {
    const res = await apiClient.get('/chatbots', { headers: { 'x-tenant-id': tenantId } });
    setChatbots(res.data);
  }

  async function createChatbot() {
    if (!newName.trim()) return;
    await apiClient.post('/chatbots', { name: newName }, { headers: { 'x-tenant-id': tenantId } });
    setNewName('');
    setShowCreate(false);
    loadChatbots();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + New Chatbot
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-medium mb-3">Create New Chatbot</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Chatbot name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={createChatbot}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chatbots.map((bot) => (
          <Link
            key={bot.id}
            href={`/chatbots/${bot.id}`}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: bot.primaryColor }}
              >
                {bot.name[0]}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{bot.name}</h3>
                <span className={`text-xs ${bot.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {bot.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>{bot._count.conversations} conversations</span>
              <span>{bot._count.knowledgeSources} sources</span>
            </div>
          </Link>
        ))}
      </div>

      {chatbots.length === 0 && !showCreate && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">No chatbots yet. Create your first one!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            + Create Chatbot
          </button>
        </div>
      )}
    </div>
  );
}
