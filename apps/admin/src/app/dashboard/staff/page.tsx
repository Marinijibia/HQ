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
  Sparkles,
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
      const activeToken =
        token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('hq_admin_token') || localStorage.getItem('hq_auth_token')
          : null);
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
    toast.success(`Re-dispatched invitation email to ${member.name} (${member.email})`);
  };

  const handleRevokeInvite = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    toast.success('Invitation revoked successfully');
  };

  const handleForcePasswordReset = (member: AdminStaffMember) => {
    toast.success(`Issued mandatory password reset for ${member.name}`);
  };

  const activeStaff = staffList.filter((s) => s.status === 'ACTIVE');
  const pendingStaff = staffList.filter((s) => s.status === 'PENDING');
  const superAdminCount = staffList.filter((s) => s.role === 'SUPER_ADMINISTRATOR').length;

  const currentList =
    activeTab === 'active' ? activeStaff : activeTab === 'pending' ? pendingStaff : staffList;
  const filteredList = currentList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-12 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-cyan-500/20 bg-gradient-to-r from-white via-slate-50 to-blue-50/40 dark:from-[#0B0F19] dark:via-[#0E1526] dark:to-indigo-950/30 p-8 shadow-xl backdrop-blur-2xl text-slate-900 dark:text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-black uppercase tracking-widest mb-3">
              <UserPlus className="h-3.5 w-3.5 text-cyan-500" />
              <span>Admin Staff &amp; Invitation Governance</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin Staff &amp; Invitations
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Dispatch invitations to new admin staff members, track pending invitation acceptances, manage executive rank assignments, and enforce platform role permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchStaffData}
              className="bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Roster
            </Button>

            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
            >
              <UserPlus size={16} /> Dispatch Invitation
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total Staff Members
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{staffList.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Active Staff
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{activeStaff.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Pending Invitations
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingStaff.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Super Administrators
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{superAdminCount}</div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 font-black shadow-xs'
                : 'bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active Staff ({activeStaff.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 font-black shadow-xs'
                : 'bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pending Invites ({pendingStaff.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-purple-500/15 border border-purple-500/40 text-purple-600 dark:text-purple-300 font-black shadow-xs'
                : 'bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Full Roster ({staffList.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="border border-slate-200/80 dark:border-white/[0.08] rounded-3xl overflow-hidden bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-lg">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Staff Member</th>
              <th className="p-4">Platform Role</th>
              <th className="p-4">Assigned Rank</th>
              <th className="p-4">Status</th>
              <th className="p-4">Invited / Active Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold">
            {filteredList.length > 0 ? (
              filteredList.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 flex items-center justify-center font-bold text-xs">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-bold uppercase">
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                      <Award size={13} className="text-amber-500" />
                      <span>{member.rank || 'Staff Officer'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        member.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : member.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {member.status === 'ACTIVE' ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(member.invitedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {member.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleResendInvite(member)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Send size={10} /> Re-send
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(member.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Revoke
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleForcePasswordReset(member)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Key size={10} /> Force Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                  No staff members match the specified filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <InviteUserModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
