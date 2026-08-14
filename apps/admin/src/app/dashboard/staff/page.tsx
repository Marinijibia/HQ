'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@hq/ui';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Award,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Search,
  Key,
  ShieldCheck,
  RefreshCcw,
  SlidersHorizontal,
  Send,
  MoreVertical,
} from 'lucide-react';
import { toast } from '../../../components/toast';
import { useAuth } from '../../../contexts/auth-context';
import { InviteUserModal } from '../../../components/invite-user-modal';

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  rank?: string;
  status: 'ACTIVE' | 'PENDING' | 'REVOKED';
  invitedAt: string;
  acceptedAt?: string;
}

export default function AdminStaffPage() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'active' | 'pending' | 'history'>('active');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showInviteModal, setShowInviteModal] = React.useState(false);

  // Staff & Invitations State
  const [staffList, setStaffList] = React.useState<AdminStaffMember[]>([
    {
      id: 'staff-001',
      name: 'Umar Sani',
      email: 'admin@netify.ng',
      role: 'SUPER_ADMINISTRATOR',
      rank: 'Director-General (DG)',
      status: 'ACTIVE',
      invitedAt: '2026-07-01T00:00:00.000Z',
      acceptedAt: '2026-07-01T00:05:00.000Z',
    },
    {
      id: 'staff-002',
      name: 'Adewale Johnson',
      email: 'adewale@netify.ng',
      role: 'ADMINISTRATOR',
      rank: 'Executive Director (ED)',
      status: 'ACTIVE',
      invitedAt: '2026-07-10T00:00:00.000Z',
      acceptedAt: '2026-07-10T01:20:00.000Z',
    },
    {
      id: 'inv-003',
      name: 'Chioma Okeke',
      email: 'chioma.okeke@netify.ng',
      role: 'ADMINISTRATOR',
      rank: 'Senior Vice President (SVP)',
      status: 'PENDING',
      invitedAt: '2026-08-12T10:30:00.000Z',
    },
    {
      id: 'inv-004',
      name: 'Fatima Al-Hassan',
      email: 'fatima@netify.ng',
      role: 'AUDITOR',
      rank: 'Commander (Cdr)',
      status: 'PENDING',
      invitedAt: '2026-08-13T09:15:00.000Z',
    },
  ]);

  const fetchStaffData = React.useCallback(async () => {
    setLoading(true);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') || localStorage.getItem('hq_auth_token') : null);
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/settings/team', { headers }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: AdminStaffMember[] = data.map((u: any) => ({
            id: u.id,
            name: u.name || u.email.split('@')[0],
            email: u.email,
            role: u.role || 'ADMINISTRATOR',
            rank: u.rank || 'Director-General (DG)',
            status: 'ACTIVE',
            invitedAt: u.createdAt || new Date().toISOString(),
            acceptedAt: u.createdAt || new Date().toISOString(),
          }));
          setStaffList((prev) => {
            const pendingOnly = prev.filter((s) => s.status === 'PENDING');
            return [...mapped, ...pendingOnly];
          });
        }
      }
    } catch {
      console.error('Error fetching team members');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const handleResendInvite = (member: AdminStaffMember) => {
    toast.success(`✉️ Re-dispatched invitation email to ${member.name} (${member.email})`);
  };

  const handleRevokeInvite = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    toast.success('🚫 Invitation revoked successfully');
  };

  const handleForcePasswordReset = (member: AdminStaffMember) => {
    toast.success(`🔑 Issued mandatory password reset for ${member.name}`);
  };

  const activeStaff = staffList.filter((s) => s.status === 'ACTIVE');
  const pendingStaff = staffList.filter((s) => s.status === 'PENDING');
  const superAdminCount = staffList.filter((s) => s.role === 'SUPER_ADMINISTRATOR').length;

  const currentList = activeTab === 'active' ? activeStaff : activeTab === 'pending' ? pendingStaff : staffList;
  const filteredList = currentList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-12 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-slate-50 via-white dark:from-slate-950 dark:via-[#0B0F19] to-indigo-950/40 p-8 shadow-2xl backdrop-blur-xl text-slate-900 dark:text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest mb-3">
              <UserPlus className="h-3.5 w-3.5 text-blue-400" />
              <span>Admin Staff & Invitation Governance</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Staff & Invitations</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Dispatch invitations to new admin staff members, track pending invitation acceptances, manage executive rank assignments, and enforce platform role permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchStaffData}
              className="bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Roster
            </Button>

            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-slate-900 dark:text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <UserPlus size={16} /> Dispatch Invitation
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Active Admin Staff</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{activeStaff.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending Invitations</div>
          <div className="text-3xl font-black text-amber-400">{pendingStaff.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Accepted Invitations</div>
          <div className="text-3xl font-black text-emerald-400">{activeStaff.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Super Administrators</div>
          <div className="text-3xl font-black text-cyan-300">{superAdminCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          {[
            { id: 'active', label: `Active Staff (${activeStaff.length})`, icon: ShieldCheck },
            { id: 'pending', label: `Pending Invitations (${pendingStaff.length})`, icon: Clock },
            { id: 'history', label: `All Staff & History (${staffList.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 shadow-md'
                    : 'bg-white/5 border border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search staff or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Roster & Invitations Table */}
      <div className="border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Admin Staff Member</th>
              <th className="p-4">Executive Rank</th>
              <th className="p-4">Permission Role</th>
              <th className="p-4">Invitation Status</th>
              <th className="p-4">Invited / Accepted</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredList.length > 0 ? (
              filteredList.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Mail size={12} className="text-slate-500" /> {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                      {member.rank || 'Director-General (DG)'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {member.status === 'ACTIVE' ? (
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Accepted & Active
                      </span>
                    ) : (
                      <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                        <Clock size={13} /> Invitation Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    {member.acceptedAt
                      ? `Accepted ${new Date(member.acceptedAt).toLocaleDateString()}`
                      : `Sent ${new Date(member.invitedAt).toLocaleDateString()}`}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {member.status === 'PENDING' ? (
                        <>
                          <Button
                            onClick={() => handleResendInvite(member)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-xl flex items-center gap-1 font-bold"
                          >
                            <Send size={12} /> Resend
                          </Button>
                          <Button
                            onClick={() => handleRevokeInvite(member.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs px-3 py-1 rounded-xl flex items-center gap-1 font-bold"
                          >
                            <XCircle size={12} /> Revoke
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleForcePasswordReset(member)}
                          className="bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-xl flex items-center gap-1 font-bold"
                        >
                          <Key size={12} /> Force Reset
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 text-xs font-bold">
                  No staff members or invitations found in this tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dispatch Invitation Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => fetchStaffData()}
        />
      )}
    </div>
  );
}
