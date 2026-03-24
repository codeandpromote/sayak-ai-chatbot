'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Overview', href: '/overview', icon: '📊' },
  { name: 'Chatbots', href: '/chatbots', icon: '🤖' },
  { name: 'Conversations', href: '/conversations', icon: '💬' },
  { name: 'Leads', href: '/leads', icon: '📋' },
  { name: 'Appointments', href: '/appointments', icon: '📅' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Live Chat', href: '/live-chat', icon: '🎧' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

const adminNavItems = [
  { name: 'Admin Dashboard', href: '/admin', icon: '🛡️' },
  { name: 'Manage Tenants', href: '/admin/tenants', icon: '🏢' },
  { name: 'Manage Users', href: '/admin/users', icon: '👥' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const tenantRole = useAuthStore((s) => s.tenantRole);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">AI Chatbot</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.name || 'Dashboard'}</p>
          {tenantRole && (
            <span className="text-xs text-gray-400 mt-0.5 block">{tenantRole}</span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}

          {/* Super Admin Section */}
          {user?.isSuperAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Super Admin
                </div>
              </div>
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
