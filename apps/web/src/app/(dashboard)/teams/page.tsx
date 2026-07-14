'use client';

import * as React from 'react';
import { Card, Button, Badge, Input } from '@hq/ui';
import {
  Users,
  UserPlus,
  GitBranch,
  Shield,
  Briefcase,
  Activity,
  Plus,
  Trash2,
  Mail,
  Send,
  CheckCircle,
  Clock,
  UserCheck,
  Building,
  Heart,
  Network,
  Bot,
  Sliders,
  Settings2,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'ORGANIZATION_OWNER' | 'ADMINISTRATOR' | 'MANAGER' | 'TEAM_LEAD' | 'MEMBER' | 'CONTRACTOR' | 'GUEST';
  department: string;
  team: string;
  assignedExecutives: string[];
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  invitedAt: string;
  expiresAt: string;
}

interface ProjectWorkspace {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  executives: string[];
}

export default function TeamManagementPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'directory' | 'chart' | 'workspaces' | 'invitations'>('directory');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Human Team Members State
  const [members, setMembers] = React.useState<TeamMember[]>([
    { id: 'usr-1', name: 'Elena Rostova', email: 'elena@hq.corp', role: 'ORGANIZATION_OWNER', department: 'Executive Office', team: 'Boardroom', assignedExecutives: ['Morgan Vance', 'Alistair Thorne'] },
    { id: 'usr-2', name: 'Sophia Sterling', email: 'sophia@hq.corp', role: 'MANAGER', department: 'Finance & Compliance', team: 'Audit Core', assignedExecutives: ['CFO Sophia', 'Legal Director'] },
    { id: 'usr-3', name: 'Alexander Carter', email: 'alex@hq.corp', role: 'TEAM_LEAD', department: 'Technology & Engineering', team: 'Backend Devs', assignedExecutives: ['CTO Hiroshi', 'QA Director'] },
    { id: 'usr-4', name: 'Yuki Sato', email: 'yuki@hq.corp', role: 'MEMBER', department: 'Customer Success', team: 'Enterprise Care', assignedExecutives: ['CSD Yuki'] },
    { id: 'usr-5', name: 'Amara Diop', email: 'amara@hq.corp', role: 'MANAGER', department: 'Growth & Marketing', team: 'Campaign Team', assignedExecutives: ['CMO Amara', 'Content Director'] },
    { id: 'usr-6', name: 'Jack Miller', email: 'jack.c@hq.corp', role: 'CONTRACTOR', department: 'Technology & Engineering', team: 'Frontend Devs', assignedExecutives: ['QA Director'] },
  ]);

  // Pending Invitations State
  const [invitations, setInvitations] = React.useState<PendingInvitation[]>([
    { id: 'inv-1', email: 'auditor@external.com', role: 'GUEST', invitedAt: '2026-07-10', expiresAt: '2026-07-17' },
    { id: 'inv-2', email: 'dev.partner@hq.corp', role: 'MEMBER', invitedAt: '2026-07-12', expiresAt: '2026-07-19' },
  ]);

  // Project Workspaces (Cross-functional clusters) State
  const [workspaces, setWorkspaces] = React.useState<ProjectWorkspace[]>([
    { id: 'ws-1', name: 'Product Growth Workspace', description: 'Cross-functional alignment for Product & Engineering.', membersCount: 5, executives: ['CTO Hiroshi', 'CMO Amara'] },
    { id: 'ws-2', name: 'West African Corridors Campaign', description: 'Operations and Logistics scaling task force.', membersCount: 3, executives: ['Morgan Vance', 'CFO Sophia'] },
  ]);

  // Invitation Form State
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<TeamMember['role']>('MEMBER');
  const [inviteDept, setInviteDept] = React.useState('Technology & Engineering');
  const [inviteTeam, setInviteTeam] = React.useState('Backend Devs');

  // Workspace Form State
  const [newWsName, setNewWsName] = React.useState('');
  const [newWsDesc, setNewWsDesc] = React.useState('');

  // Selected Member for inspecting/changing permissions
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  React.useEffect(() => {
    const draft = localStorage.getItem('hq_onboarding_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.brandColor) setBrandColor(d.brandColor);
        if (d.ownerName) {
          setMembers(prev => prev.map(m => m.id === 'usr-1' ? { ...m, name: d.ownerName } : m));
        }
      } catch { /* ignore */ }
    }
  }, []);

  const handleSendInvitation = () => {
    if (!inviteEmail.trim()) return;
    const newInv: PendingInvitation = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      invitedAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    setInvitations(prev => [...prev, newInv]);
    setInviteEmail('');
    toast.success(`✉️ Invitation sent successfully to: "${newInv.email}"`);
  };

  const handleCancelInvitation = (id: string, email: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
    toast.info(`🗑️ Invitation to "${email}" cancelled`);
  };

  const handleCreateWorkspace = () => {
    if (!newWsName.trim()) return;
    const newWs: ProjectWorkspace = {
      id: `ws-${Date.now()}`,
      name: newWsName,
      description: newWsDesc,
      membersCount: 1,
      executives: ['Morgan Vance'],
    };
    setWorkspaces(prev => [...prev, newWs]);
    setNewWsName('');
    setNewWsDesc('');
    toast.success(`🚀 Collaboration Workspace "${newWs.name}" initialized`);
  };

  const handleUpdateRole = (id: string, role: TeamMember['role']) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember(prev => prev ? { ...prev, role } : null);
    }
    toast.success('🔒 Access control role updated');
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-hq-blue" />
            Team & Workspace Directory
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Manage human roles, organize team workspaces, audit access permissions, and collaborate with AI executives.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border">
        {[
          { id: 'directory', label: 'Members Directory', icon: Users },
          { id: 'chart', label: 'Organizational Chart', icon: Network },
          { id: 'workspaces', label: 'Cross-functional Workspaces', icon: Briefcase },
          { id: 'invitations', label: 'Pending Invitations', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-current text-white'
                  : 'border-transparent text-foreground/55 hover:text-foreground'
              }`}
              style={activeTab === tab.id ? { borderColor: brandColor, color: brandColor } : {}}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ────────────────────────────────────────────────────── */}
      <div className="space-y-6">

        {/* 1. Members Directory Tab */}
        {activeTab === 'directory' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-2">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Active C-Suite human members</h3>
                <Badge variant="neutral" className="text-[9px]">Granular RBAC active</Badge>
              </div>

              <div className="space-y-3">
                {members.map(m => (
                  <Card
                    key={m.id}
                    className={`border p-4 shadow-[var(--card-shadow)] cursor-pointer transition-all hover:border-card-border-hover ${
                      selectedMember?.id === m.id ? 'border-hq-cyan bg-hq-cyan/5' : 'border-card-border bg-card-bg'
                    }`}
                    onClick={() => setSelectedMember(m)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-hq-graphite/40 flex items-center justify-center font-black text-xs text-white">
                          {m.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-[#1A1A1E] dark:text-white block">{m.name}</span>
                          <span className="text-[10px] text-foreground/45 block font-semibold">{m.email}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge variant="ai" className="text-[8px] uppercase tracking-wider font-bold">
                          {m.role.replace('_', ' ')}
                        </Badge>
                        <p className="text-[9px] text-foreground/40 font-semibold mt-1">{m.department} · {m.team}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Inspect Member Roles & Permissions panel */}
            <div className="space-y-6">
              {selectedMember ? (
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Access Control Panel</h4>
                    <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Inspect and adapt security clearances</p>
                  </div>

                  <div className="text-xs space-y-3 font-semibold">
                    <div>
                      <span className="text-foreground/45 text-[9px] uppercase tracking-wider block">Full Name</span>
                      <span className="text-white text-sm font-extrabold mt-0.5 block">{selectedMember.name}</span>
                    </div>

                    <div>
                      <span className="text-foreground/45 text-[9px] uppercase tracking-wider block">Assigned C-Suite Role</span>
                      <select
                        className="bg-card-bg border border-card-border rounded-lg w-full p-2 h-9 text-xs font-bold focus:outline-none mt-1 text-white"
                        value={selectedMember.role}
                        onChange={e => handleUpdateRole(selectedMember.id, e.target.value as any)}
                      >
                        <option value="ORGANIZATION_OWNER">Organization Owner</option>
                        <option value="ADMINISTRATOR">Administrator</option>
                        <option value="MANAGER">Manager</option>
                        <option value="TEAM_LEAD">Team Lead</option>
                        <option value="MEMBER">Member</option>
                        <option value="CONTRACTOR">Contractor</option>
                        <option value="GUEST">Guest</option>
                      </select>
                    </div>

                    <div className="border-t border-card-border pt-3 space-y-2.5">
                      <span className="text-foreground/45 text-[9px] uppercase tracking-wider block">Co-pilot AI Directors</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMember.assignedExecutives.map(exec => (
                          <Badge key={exec} variant="ai" className="text-[9px] gap-1 h-6">
                            <Bot className="h-3 w-3" />
                            {exec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-card-border pt-3 space-y-2.5">
                      <span className="text-foreground/45 text-[9px] uppercase tracking-wider block">Access Permissions Checklist</span>
                      {[
                        { label: 'Can initiate missions WBS', ok: selectedMember.role !== 'GUEST' },
                        { label: 'Can download/write assets', ok: selectedMember.role !== 'GUEST' },
                        { label: 'Can modify billing & settings', ok: selectedMember.role === 'ORGANIZATION_OWNER' || selectedMember.role === 'ADMINISTRATOR' },
                      ].map((perm, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px]">
                          <span className="text-foreground/60">{perm.label}</span>
                          <span className={perm.ok ? 'text-green-500' : 'text-foreground/35'}>
                            {perm.ok ? 'Authorized' : 'Restricted'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] h-full flex flex-col items-center justify-center py-12 text-center text-foreground/40 text-xs">
                  <Sliders className="h-8 w-8 text-foreground/20 mb-2" />
                  <span>Select a member to inspect access controls</span>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* 2. Organizational Chart Tab */}
        {activeTab === 'chart' && (
          <div className="grid gap-5 md:grid-cols-3 text-left">
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] md:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <Network className="h-4.5 w-4.5 text-hq-cyan" />
                  Interactive Human Reporting Structure
                </h3>
                <p className="text-[10px] text-foreground/50">Hierarchy structure resolved dynamically from roles and branches.</p>
              </div>

              {/* Visual chart tree */}
              <div className="border border-card-border bg-[#F9F9FB] dark:bg-[#08080A] rounded-2xl p-4 overflow-hidden h-90 relative">
                <svg className="w-full h-full" viewBox="0 0 500 320">
                  {/* Connectors lines */}
                  {[
                    { x1: 250, y1: 50, x2: 120, y2: 130 },
                    { x1: 250, y1: 50, x2: 380, y2: 130 },
                    { x1: 120, y1: 130, x2: 70, y2: 240 },
                    { x1: 120, y1: 130, x2: 170, y2: 240 },
                    { x1: 380, y1: 130, x2: 380, y2: 240 },
                  ].map((line, idx) => (
                    <line
                      key={idx}
                      x1={line.x1} y1={line.y1}
                      x2={line.x2} y2={line.y2}
                      stroke="#ffffff" strokeOpacity={0.12}
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Level 0: Owner */}
                  <g className="cursor-pointer" onClick={() => setSelectedMember(members[0])}>
                    <rect x={180} y={25} width={140} height={40} rx={8} fill="#0A0A0C" stroke={brandColor} strokeWidth={1.5} />
                    <text x={250} y={42} fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">{members[0].name}</text>
                    <text x={250} y={54} fill={brandColor} fontSize="7" fontWeight="bold" textAnchor="middle">Owner (CEO)</text>
                  </g>

                  {/* Level 1: Managers */}
                  <g className="cursor-pointer" onClick={() => setSelectedMember(members[4])}>
                    <rect x={50} y={110} width={140} height={40} rx={8} fill="#0A0A0C" stroke="#8B5CF6" strokeWidth={1.5} />
                    <text x={120} y={127} fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">{members[4].name}</text>
                    <text x={120} y={139} fill="#8B5CF6" fontSize="7" fontWeight="bold" textAnchor="middle">Marketing Manager</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedMember(members[1])}>
                    <rect x={310} y={110} width={140} height={40} rx={8} fill="#0A0A0C" stroke="#30D158" strokeWidth={1.5} />
                    <text x={380} y={127} fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">{members[1].name}</text>
                    <text x={380} y={139} fill="#30D158" fontSize="7" fontWeight="bold" textAnchor="middle">Finance Manager</text>
                  </g>

                  {/* Level 2: Leads & Members */}
                  <g className="cursor-pointer" onClick={() => setSelectedMember(members[2])}>
                    <rect x={10} y={220} width={120} height={35} rx={6} fill="#0A0A0C" stroke="#0EA5E9" strokeWidth={1.5} />
                    <text x={70} y={235} fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">{members[2].name}</text>
                    <text x={70} y={246} fill="#0EA5E9" fontSize="6.5" fontWeight="bold" textAnchor="middle">Engineering Lead</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedMember(members[3])}>
                    <rect x={320} y={220} width={120} height={35} rx={6} fill="#0A0A0C" stroke="#EC4899" strokeWidth={1.5} />
                    <text x={380} y={235} fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">{members[3].name}</text>
                    <text x={380} y={246} fill="#EC4899" fontSize="6.5" fontWeight="bold" textAnchor="middle">CS Specialist</text>
                  </g>
                </svg>
              </div>
            </Card>

            {/* Team Health Score matrix */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-hq-cyan" />
                  Workforce health Index
                </h4>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-foreground/60">Overall Team Health</span>
                      <span className="text-[#30D158] font-extrabold text-sm">Excellent</span>
                    </div>
                    <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: '92%' }}></div>
                    </div>
                  </div>

                  <div className="border-t border-card-border pt-3 space-y-2 text-[10px] font-bold">
                    <p className="uppercase text-foreground/45 tracking-widest text-[8.5px]">Utilization metrics</p>
                    <div className="flex justify-between">
                      <span className="text-foreground/40">Workload Balance</span>
                      <span className="text-white">94% (Stable)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/40">Approvals Latency</span>
                      <span className="text-white">&lt; 12 mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/40">Executive Interactions</span>
                      <span className="text-hq-cyan">182 interactions</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 3. Cross-functional Workspaces Tab */}
        {activeTab === 'workspaces' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <Briefcase className="h-4.5 w-4.5 text-hq-purple" />
                  Cross-functional project Workspaces
                </h3>
                <Badge variant="neutral" className="text-[9px]">Goal-based clusters</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {workspaces.map(ws => (
                  <Card key={ws.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white">{ws.name}</h4>
                      <p className="text-[10px] text-foreground/50 leading-relaxed font-semibold">{ws.description}</p>
                    </div>

                    <div className="border-t border-card-border pt-3 flex items-center justify-between text-[10px] font-bold text-foreground/55">
                      <span>Members: <span className="text-white">{ws.membersCount}</span></span>
                      <div className="flex gap-1">
                        {ws.executives.map(e => (
                          <Badge key={e} variant="ai" className="text-[8px] px-1.5 py-0 h-5 font-bold">
                            {e.split(' ')[1]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Create Workspace form */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Create Workspace</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Assemble a cross-functional alignment cluster</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Workspace Name</label>
                    <Input
                      placeholder="e.g. Campaign Workspace"
                      value={newWsName}
                      onChange={e => setNewWsName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Focus Area / Description</label>
                    <Input
                      placeholder="e.g. Content alignment"
                      value={newWsDesc}
                      onChange={e => setNewWsDesc(e.target.value)}
                    />
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5 gap-1"
                    style={{ backgroundColor: brandColor }}
                    onClick={handleCreateWorkspace}
                  >
                    <Plus className="h-4 w-4" />
                    Register Workspace
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 4. Pending Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <UserPlus className="h-4.5 w-4.5 text-hq-cyan" />
                  Invitation Gatekeeper WBS
                </h3>
              </div>

              {invitations.length === 0 ? (
                <div className="py-12 text-center text-xs text-foreground/40 font-semibold border border-dashed border-card-border rounded-xl">
                  No pending invitations.
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map(inv => (
                    <Card key={inv.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-hq-cyan shrink-0" />
                        <div>
                          <span className="text-xs font-extrabold text-white block">{inv.email}</span>
                          <p className="text-[9px] text-foreground/45 font-semibold mt-0.5">
                            Invited: {inv.invitedAt} • Expires: {inv.expiresAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" className="text-[8px] font-bold">{inv.role}</Badge>
                        <button
                          onClick={() => handleCancelInvitation(inv.id, inv.email)}
                          className="text-foreground/35 hover:text-red-500 p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Invite Member form */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Invite Human Member</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Extend secure access key to new hires</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Email Address</label>
                    <Input
                      placeholder="name@company.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Access Level (Role)</label>
                    <select
                      className="bg-card-bg border border-card-border rounded-lg w-full p-2 h-9 text-xs font-bold focus:outline-none text-white"
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value as any)}
                    >
                      <option value="ADMINISTRATOR">Administrator</option>
                      <option value="MANAGER">Manager</option>
                      <option value="TEAM_LEAD">Team Lead</option>
                      <option value="MEMBER">Member</option>
                      <option value="CONTRACTOR">Contractor</option>
                      <option value="GUEST">Guest</option>
                    </select>
                  </div>

                  <div className="grid gap-2 grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground/75">Department</label>
                      <Input value={inviteDept} onChange={e => setInviteDept(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground/75">Team</label>
                      <Input value={inviteTeam} onChange={e => setInviteTeam(e.target.value)} />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5 gap-1.5"
                    style={{ backgroundColor: brandColor }}
                    onClick={handleSendInvitation}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Invite Code
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
