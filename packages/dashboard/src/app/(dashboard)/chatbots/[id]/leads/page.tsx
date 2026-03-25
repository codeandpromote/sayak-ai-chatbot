'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

const defaultFields = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: false },
];

export default function LeadCapturePage() {
  const { id } = useParams();
  const router = useRouter();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [fields, setFields] = useState(defaultFields);
  const [triggerAfterMessages, setTriggerAfterMessages] = useState(3);
  const [triggerKeywords, setTriggerKeywords] = useState('');

  const headers = { 'x-tenant-id': tenantId };

  useEffect(() => {
    if (!tenantId || !id) return;
    apiClient.get(`/chatbots/${id}`, { headers }).then((res) => {
      setEnabled(res.data.leadCaptureEnabled || false);
      if (res.data.leadFormConfig) {
        const config = res.data.leadFormConfig;
        if (config.fields?.length) setFields(config.fields);
        if (config.triggerAfterMessages) setTriggerAfterMessages(config.triggerAfterMessages);
        if (config.triggerOnKeywords?.length) setTriggerKeywords(config.triggerOnKeywords.join(', '));
      }
    });
  }, [tenantId, id]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.patch(`/chatbots/${id}`, { leadCaptureEnabled: enabled }, { headers });
      await apiClient.post(`/chatbots/${id}/lead-form-config`, {
        fields,
        triggerAfterMessages,
        triggerOnKeywords: triggerKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      }, { headers });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function toggleField(index: number, key: string, value: any) {
    const updated = [...fields];
    (updated[index] as any)[key] = value;
    setFields(updated);
  }

  function addField() {
    setFields([...fields, { name: '', label: '', type: 'text', required: false }]);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.push(`/chatbots/${id}`)} className="text-sm text-primary-600 hover:underline mb-1">
          &larr; Back to chatbot
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Lead Capture</h1>
        <p className="text-gray-500 text-sm mt-1">Collect visitor information during conversations.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Enable toggle */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Enable Lead Capture</h3>
              <p className="text-sm text-gray-500 mt-1">Show a lead form during conversations.</p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Trigger settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-medium text-gray-900">Trigger Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Show form after N messages</label>
            <input
              type="number"
              min={1}
              max={20}
              value={triggerAfterMessages}
              onChange={(e) => setTriggerAfterMessages(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger on keywords (comma-separated)</label>
            <input
              type="text"
              value={triggerKeywords}
              onChange={(e) => setTriggerKeywords(e.target.value)}
              placeholder="pricing, demo, contact, buy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Form fields */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Form Fields</h3>
            <button onClick={addField} className="text-sm text-primary-600 hover:underline">
              + Add Field
            </button>
          </div>
          {fields.map((field, i) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => toggleField(i, 'label', e.target.value)}
                  placeholder="Field label"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex gap-2">
                  <select
                    value={field.type}
                    onChange={(e) => toggleField(i, 'type', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="number">Number</option>
                  </select>
                  <label className="flex items-center gap-1.5 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => toggleField(i, 'required', e.target.checked)}
                    />
                    Required
                  </label>
                </div>
              </div>
              <button onClick={() => removeField(i)} className="text-red-400 hover:text-red-600 text-sm mt-1">
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
