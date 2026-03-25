'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function AppearancePage() {
  const { id } = useParams();
  const router = useRouter();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    primaryColor: '#6366f1',
    widgetPosition: 'bottom-right',
    welcomeMessage: 'Hello! How can I help you?',
    placeholderText: 'Type a message...',
    avatarUrl: '',
  });

  const headers = { 'x-tenant-id': tenantId };

  useEffect(() => {
    if (!tenantId || !id) return;
    apiClient.get(`/chatbots/${id}`, { headers }).then((res) => {
      const bot = res.data;
      setForm({
        primaryColor: bot.primaryColor || '#6366f1',
        widgetPosition: bot.widgetPosition || 'bottom-right',
        welcomeMessage: bot.welcomeMessage || '',
        placeholderText: bot.placeholderText || '',
        avatarUrl: bot.avatarUrl || '',
      });
    });
  }, [tenantId, id]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.patch(`/chatbots/${id}`, form, { headers });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push(`/chatbots/${id}`)} className="text-sm text-primary-600 hover:underline mb-1">
            &larr; Back to chatbot
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Widget Appearance</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Widget Position</label>
            <select
              value={form.widgetPosition}
              onChange={(e) => setForm({ ...form, widgetPosition: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
            <textarea
              value={form.welcomeMessage}
              onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder Text</label>
            <input
              type="text"
              value={form.placeholderText}
              onChange={(e) => setForm({ ...form, placeholderText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL (optional)</label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-4">Preview</h3>
          <div className="bg-gray-100 rounded-xl p-6 min-h-[400px] flex flex-col justify-end">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm ml-auto">
              <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: form.primaryColor }}>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <span className="text-white font-medium text-sm">AI Assistant</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="px-3 py-2 rounded-lg text-sm max-w-[80%]" style={{ backgroundColor: form.primaryColor + '15', color: form.primaryColor }}>
                  {form.welcomeMessage || 'Hello!'}
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400">
                  {form.placeholderText || 'Type a message...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
