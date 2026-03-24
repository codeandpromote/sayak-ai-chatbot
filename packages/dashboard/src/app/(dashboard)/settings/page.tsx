'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/settings/team" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md">
          <h3 className="font-medium text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your team and roles</p>
        </Link>
        <Link href="/settings/billing" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md">
          <h3 className="font-medium text-gray-900">Billing & Plan</h3>
          <p className="text-sm text-gray-500 mt-1">View usage and upgrade your plan</p>
        </Link>
        <Link href="/settings/whitelabel" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md">
          <h3 className="font-medium text-gray-900">White Label</h3>
          <p className="text-sm text-gray-500 mt-1">Custom branding and domain</p>
        </Link>
      </div>
    </div>
  );
}
