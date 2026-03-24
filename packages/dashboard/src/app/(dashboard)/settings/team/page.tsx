'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  sender: { name: string; email: string };
}

export default function TeamSettingsPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const tenantRole = useAuthStore((s) => s.tenantRole);
  const currentUser = useAuthStore((s) => s.user);
  const isAdminOrOwner = tenantRole === 'OWNER' || tenantRole === 'ADMIN';

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = tenantId ? { 'x-tenant-id': tenantId } : {};

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        apiClient.get('/team/members', { headers }),
        isAdminOrOwner ? apiClient.get('/team/invitations', { headers }) : Promise.resolve({ data: [] }),
      ]);
      setMembers(membersRes.data);
      setInvitations(invitationsRes.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [tenantId, isAdminOrOwner]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviting(true);
    try {
      await apiClient.post('/team/invite', { email: inviteEmail, role: inviteRole }, { headers });
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    }
    setInviting(false);
  };

  const changeRole = async (membershipId: string, newRole: string) => {
    try {
      await apiClient.patch(`/team/members/${membershipId}/role`, { role: newRole }, { headers });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const removeMember = async (membershipId: string, name: string) => {
    if (!confirm(`Remove ${name} from this team?`)) return;
    try {
      await apiClient.delete(`/team/members/${membershipId}`, { headers });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const cancelInvitation = async (id: string) => {
    try {
      await apiClient.delete(`/team/invitations/${id}`, { headers });
      fetchData();
    } catch { /* ignore */ }
  };

  if (loading) return <div className="text-gray-500">Loading team members...</div>;

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-50 text-purple-700',
    ADMIN: 'bg-blue-50 text-blue-700',
    MEMBER: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h1>

      {/* Invite Form */}
      {isAdminOrOwner && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Invite New Member</h3>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Members ({members.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {members.map((m) => (
            <div key={m.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                  {m.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {m.name}
                    {m.userId === currentUser?.id && (
                      <span className="ml-2 text-xs text-gray-400">(you)</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAdminOrOwner && m.userId !== currentUser?.id ? (
                  <select
                    value={m.role}
                    onChange={(e) => changeRole(m.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${roleColors[m.role] || ''}`}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    {tenantRole === 'OWNER' && <option value="OWNER">Owner</option>}
                  </select>
                ) : (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${roleColors[m.role] || ''}`}>
                    {m.role}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  Joined {new Date(m.joinedAt).toLocaleDateString()}
                </span>
                {isAdminOrOwner && m.userId !== currentUser?.id && (
                  <button
                    onClick={() => removeMember(m.id, m.name)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {isAdminOrOwner && invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">
              Pending Invitations ({invitations.filter((i) => i.status === 'PENDING').length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {invitations.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{inv.email}</div>
                  <div className="text-xs text-gray-500">
                    Invited by {inv.sender.name} &middot; Role: {inv.role}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    inv.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                    inv.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {inv.status}
                  </span>
                  {inv.status === 'PENDING' && (
                    <>
                      <span className="text-xs text-gray-400">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => cancelInvitation(inv.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
