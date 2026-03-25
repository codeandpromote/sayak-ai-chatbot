'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function AiMaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    personaName: '',
    personality: '',
    systemPrompt: '',
    responseStyle: '',
    restrictions: '',
  });

  const headers = { 'x-tenant-id': tenantId };

  useEffect(() => {
    if (!tenantId || !id) return;
    apiClient.get(`/chatbots/${id}/ai-mask`, { headers }).then((res) => {
      if (res.data) {
        setForm({
          personaName: res.data.personaName || '',
          personality: res.data.personality || '',
          systemPrompt: res.data.systemPrompt || '',
          responseStyle: res.data.responseStyle || '',
          restrictions: res.data.restrictions || '',
        });
      }
    }).catch(() => {});
  }, [tenantId, id]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.post(`/chatbots/${id}/ai-mask`, form, { headers });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.push(`/chatbots/${id}`)} className="text-sm text-primary-600 hover:underline mb-1">
          &larr; Back to chatbot
        </button>
        <h1 className="text-2xl font-bold text-gray-900">AI Persona</h1>
        <p className="text-gray-500 text-sm mt-1">Customize how your chatbot behaves and responds.</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Persona Name</label>
          <input
            type="text"
            value={form.personaName}
            onChange={(e) => setForm({ ...form, personaName: e.target.value })}
            placeholder="e.g., Sarah, Support Assistant"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-400 mt-1">The name your chatbot will use to introduce itself.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
          <textarea
            value={form.personality}
            onChange={(e) => setForm({ ...form, personality: e.target.value })}
            rows={3}
            placeholder="e.g., Friendly, professional, and concise. Uses simple language."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
          <textarea
            value={form.systemPrompt}
            onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
            rows={5}
            placeholder="Custom instructions for the AI. This overrides the default system prompt."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">Advanced: Provide specific instructions for how the AI should behave.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Response Style</label>
          <input
            type="text"
            value={form.responseStyle}
            onChange={(e) => setForm({ ...form, responseStyle: e.target.value })}
            placeholder="e.g., concise, detailed, bullet-points"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restrictions</label>
          <textarea
            value={form.restrictions}
            onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
            rows={3}
            placeholder="e.g., Never discuss pricing. Don't make promises about delivery dates."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">Topics or behaviors the chatbot should avoid.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Persona'}
        </button>
      </div>
    </div>
  );
}
