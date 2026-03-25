'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AppointmentsConfigPage() {
  const { id } = useParams();
  const router = useRouter();
  const tenantId = useAuthStore((s) => s.tenantId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [duration, setDuration] = useState(30);
  const [timezone, setTimezone] = useState('America/New_York');
  const [days, setDays] = useState<Record<string, { enabled: boolean; start: string; end: string }>>(() => {
    const d: Record<string, { enabled: boolean; start: string; end: string }> = {};
    DAYS.forEach((day) => {
      d[day] = { enabled: day !== 'Saturday' && day !== 'Sunday', start: '09:00', end: '17:00' };
    });
    return d;
  });

  const headers = { 'x-tenant-id': tenantId };

  useEffect(() => {
    if (!tenantId || !id) return;
    apiClient.get(`/chatbots/${id}`, { headers }).then((res) => {
      setEnabled(res.data.appointmentEnabled || false);
      if (res.data.bookingConfig) {
        const config = res.data.bookingConfig;
        if (config.durationMinutes) setDuration(config.durationMinutes);
        if (config.timezone) setTimezone(config.timezone);
        if (config.availability) setDays(config.availability);
      }
    });
  }, [tenantId, id]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.patch(`/chatbots/${id}`, { appointmentEnabled: enabled }, { headers });
      await apiClient.post(`/chatbots/${id}/booking-config`, {
        durationMinutes: duration,
        timezone,
        availability: days,
      }, { headers });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day: string) {
    setDays({ ...days, [day]: { ...days[day], enabled: !days[day].enabled } });
  }

  function updateDay(day: string, field: 'start' | 'end', value: string) {
    setDays({ ...days, [day]: { ...days[day], [field]: value } });
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.push(`/chatbots/${id}`)} className="text-sm text-primary-600 hover:underline mb-1">
          &larr; Back to chatbot
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Appointment Booking</h1>
        <p className="text-gray-500 text-sm mt-1">Let visitors book appointments through the chatbot.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Enable toggle */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Enable Appointments</h3>
              <p className="text-sm text-gray-500 mt-1">Allow visitors to book time slots.</p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* General settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-medium text-gray-900">Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Berlin">Berlin (CET)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-medium text-gray-900">Weekly Availability</h3>
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-2 w-32">
                <input
                  type="checkbox"
                  checked={days[day].enabled}
                  onChange={() => toggleDay(day)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{day}</span>
              </label>
              {days[day].enabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={days[day].start}
                    onChange={(e) => updateDay(day, 'start', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={days[day].end}
                    onChange={(e) => updateDay(day, 'end', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Unavailable</span>
              )}
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
