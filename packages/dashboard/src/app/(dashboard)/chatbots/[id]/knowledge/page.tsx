'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

interface KnowledgeSource {
  id: string;
  type: string;
  name: string;
  status: string;
  chunkCount: number;
  createdAt: string;
}

export default function KnowledgePage() {
  const { id: chatbotId } = useParams();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [textName, setTextName] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'text'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headers = { 'x-tenant-id': tenantId };

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    const res = await apiClient.get(`/chatbots/${chatbotId}/knowledge`, { headers });
    setSources(res.data);
  }

  async function addUrl() {
    if (!url.trim()) return;
    await apiClient.post(`/chatbots/${chatbotId}/knowledge/url`, { url }, { headers });
    setUrl('');
    loadSources();
  }

  async function addText() {
    if (!text.trim() || !textName.trim()) return;
    await apiClient.post(`/chatbots/${chatbotId}/knowledge/text`, { text, name: textName }, { headers });
    setText('');
    setTextName('');
    loadSources();
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    await apiClient.post(`/chatbots/${chatbotId}/knowledge/file`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' },
    });
    loadSources();
  }

  async function removeSource(sourceId: string) {
    await apiClient.delete(`/chatbots/${chatbotId}/knowledge/${sourceId}`, { headers });
    loadSources();
  }

  const statusColors: Record<string, string> = {
    COMPLETED: 'text-green-600 bg-green-50',
    PROCESSING: 'text-yellow-600 bg-yellow-50',
    PENDING: 'text-gray-600 bg-gray-50',
    FAILED: 'text-red-600 bg-red-50',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Base</h1>

      {/* Add Source */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-2 mb-4">
          {(['url', 'file', 'text'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab === 'url' ? 'Website URL' : tab === 'file' ? 'Upload File' : 'Raw Text'}
            </button>
          ))}
        </div>

        {activeTab === 'url' && (
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={addUrl}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Add URL
            </button>
          </div>
        )}

        {activeTab === 'file' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Choose File (PDF, DOCX)
            </button>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-3">
            <input
              type="text"
              value={textName}
              onChange={(e) => setTextName(e.target.value)}
              placeholder="Source name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text content here..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <button
              onClick={addText}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Add Text
            </button>
          </div>
        )}
      </div>

      {/* Sources List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Sources ({sources.length})</h3>
        </div>
        {sources.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No knowledge sources yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sources.map((source) => (
              <div key={source.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{source.name}</p>
                  <div className="flex gap-3 mt-1 text-sm">
                    <span className="text-gray-400">{source.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[source.status]}`}>
                      {source.status}
                    </span>
                    {source.chunkCount > 0 && (
                      <span className="text-gray-400">{source.chunkCount} chunks</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeSource(source.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
