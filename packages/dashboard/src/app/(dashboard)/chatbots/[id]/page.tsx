'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function ChatbotDetailPage() {
  const { id } = useParams();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [chatbot, setChatbot] = useState<any>(null);
  const [embedCode, setEmbedCode] = useState('');

  useEffect(() => {
    if (!tenantId || !id) return;
    apiClient
      .get(`/chatbots/${id}`, { headers: { 'x-tenant-id': tenantId } })
      .then((res) => setChatbot(res.data.data));
    apiClient
      .get(`/chatbots/${id}/embed-code`, { headers: { 'x-tenant-id': tenantId } })
      .then((res) => setEmbedCode(res.data.data.embedCode));
  }, [tenantId, id]);

  if (!chatbot) return <div className="text-gray-500">Loading...</div>;

  const tabs = [
    { name: 'Knowledge Base', href: `/chatbots/${id}/knowledge` },
    { name: 'Appearance', href: `/chatbots/${id}/appearance` },
    { name: 'AI Persona', href: `/chatbots/${id}/ai-mask` },
    { name: 'Lead Capture', href: `/chatbots/${id}/leads` },
    { name: 'Appointments', href: `/chatbots/${id}/appointments` },
    { name: 'Embed Code', href: `/chatbots/${id}/embed` },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{chatbot.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{chatbot.description || 'No description'}</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Conversations</span>
              <span className="font-medium">{chatbot._count?.conversations || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Knowledge Sources</span>
              <span className="font-medium">{chatbot._count?.knowledgeSources || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={chatbot.isActive ? 'text-green-600' : 'text-red-500'}>
                {chatbot.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">LLM Provider</span>
              <span className="font-medium">{chatbot.llmProvider}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-4">Embed Code</h3>
          <p className="text-sm text-gray-500 mb-3">
            Paste this snippet into your website to add the chatbot.
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
            {embedCode}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(embedCode)}
            className="mt-3 text-sm text-primary-600 hover:underline"
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
