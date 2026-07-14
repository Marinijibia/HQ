'use client';

import * as React from 'react';
import { Card, Button, Badge, Input } from '@hq/ui';
import {
  Building2,
  Globe,
  Users,
  Briefcase,
  GitBranch,
  TrendingUp,
  MapPin,
  Plus,
  ArrowRight,
  ShieldCheck,
  Award,
  Trash2,
  Activity,
  History,
  Archive,
  Layers,
  ChevronRight,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface OrgDetail {
  name: string;
  slug: string;
  legalName: string;
  website: string;
  industry: string;
  foundedDate: string;
  companySize: string;
  growthStage: 'Founder' | 'Startup' | 'Growing Business' | 'Scale-up' | 'Enterprise';
  mission: string;
  vision: string;
}

interface DepartmentNode {
  id: string;
  name: string;
  executive: string;
  teamCount: number;
  missionCount: number;
  status: 'Active' | 'Archived';
}

interface BranchNode {
  id: string;
  name: string;
  region: string;
  manager: string;
  memberCount: number;
}

export default function OrganizationPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'structure' | 'evolution' | 'branches'>('overview');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Org profile state
  const [profile, setProfile] = React.useState<OrgDetail>({
    name: 'Acme Corporation',
    slug: 'acme-corp',
    legalName: 'Acme Global Inc.',
    website: 'https://acme.corp',
    industry: 'Technology & Logistics',
    foundedDate: '2024-03-15',
    companySize: '15-50 employees',
    growthStage: 'Startup',
    mission: 'To orchestrate autonomous business platforms seamlessly.',
    vision: 'A unified global agency where humans and executives collaborate.',
  });

  // Departments state
  const [departments, setDepartments] = React.useState<DepartmentNode[]>([
    { id: 'dept-tech', name: 'Technology & Engineering', executive: 'CTO Hiroshi', teamCount: 4, missionCount: 3, status: 'Active' },
    { id: 'dept-mktg', name: 'Growth & Marketing', executive: 'CMO Amara', teamCount: 3, missionCount: 2, status: 'Active' },
    { id: 'dept-fin', name: 'Finance & Compliance', executive: 'CFO Sophia', teamCount: 2, missionCount: 1, status: 'Active' },
    { id: 'dept-cs', name: 'Customer Success', executive: 'CSD Yuki', teamCount: 3, missionCount: 2, status: 'Active' },
  ]);

  // Branches state
  const [branches, setBranches] = React.useState<BranchNode[]>([
    { id: 'br-1', name: 'Abuja Headquarters', region: 'Nigeria', manager: 'Elena Rostova', memberCount: 12 },
    { id: 'br-2', name: 'London Office', region: 'United Kingdom', manager: 'Sophia Sterling', memberCount: 8 },
    { id: 'br-3', name: 'Lagos Corridor Hub', region: 'Nigeria', manager: 'Alistair Thorne', memberCount: 15 },
  ]);

  // New Department Form State
  const [newDeptName, setNewDeptName] = React.useState('');
  const [newDeptExec, setNewDeptExec] = React.useState('');

  // New Branch Form State
  const [newBranchName, setNewBranchName] = React.useState('');
  const [newBranchRegion, setNewBranchRegion] = React.useState('');
  const [newBranchManager, setNewBranchManager] = React.useState('');

  React.useEffect(() => {
    const draft = localStorage.getItem('hq_onboarding_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.brandColor) setBrandColor(d.brandColor);
        if (d.hqName) setProfile(p => ({ ...p, name: d.hqName }));
        if (d.ceoName) setProfile(p => ({ ...p, legalName: `${d.hqName} (Managed by ${d.ceoName})` }));
      } catch { /* ignore */ }
    }
  }, []);

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    const newDept: DepartmentNode = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      executive: newDeptExec || 'Unassigned Executive',
      teamCount: 0,
      missionCount: 0,
      status: 'Active',
    };
    setDepartments(prev => [...prev, newDept]);
    setNewDeptName('');
    setNewDeptExec('');
    toast.success(`🏢 Department "${newDept.name}" added successfully`);
  };

  const handleArchiveDept = (id: string, name: string) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: 'Archived' } : d));
    toast.info(`📦 Archived department: "${name}"`);
  };

  const handleAddBranch = () => {
    if (!newBranchName.trim()) return;
    const newBr: BranchNode = {
      id: `br-${Date.now()}`,
      name: newBranchName,
      region: newBranchRegion || 'Global',
      manager: newBranchManager || 'Elena Rostova',
      memberCount: 1,
    };
    setBranches(prev => [...prev, newBr]);
    setNewBranchName('');
    setNewBranchRegion('');
    setNewBranchManager('');
    toast.success(`🌍 Branch "${newBr.name}" registered successfully`);
  };

  const handleStageUpgrade = () => {
    setProfile(p => ({ ...p, growthStage: 'Growing Business' }));
    toast.success('🎉 Upgrade stage: transition to "Growing Business" initialized!');
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Building2 className="h-8 w-8 text-hq-blue" />
            Organization & Hierarchy
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Model business units, map department structure, align branch offices, and audit growth trajectory.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border">
        {[
          { id: 'overview', label: 'Profile & Overview', icon: Globe },
          { id: 'structure', label: 'Departments & Teams', icon: GitBranch },
          { id: 'branches', label: 'Branch Offices', icon: MapPin },
          { id: 'evolution', label: 'Evolution Stage', icon: Award },
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

        {/* 1. Profile & Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Basic Details Card */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-hq-cyan" />
                  Corporate Identity profile
                </h3>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-foreground/45 font-bold uppercase tracking-wider block">Organization Name</span>
                    <span className="text-white font-extrabold text-sm">{profile.name}</span>
                  </div>
                  <div>
                    <span className="text-foreground/45 font-bold uppercase tracking-wider block">Slug</span>
                    <span className="text-white font-mono text-sm">{profile.slug}</span>
                  </div>
                  <div>
                    <span className="text-foreground/45 font-bold uppercase tracking-wider block">Legal entity</span>
                    <span className="text-white font-semibold">{profile.legalName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-foreground/45 font-bold uppercase tracking-wider block">Industry sector</span>
                    <span className="text-white font-semibold">{profile.industry}</span>
                  </div>
                  <div>
                    <span className="text-foreground/45 font-bold uppercase tracking-wider block">Founded date</span>
                    <span className="text-white font-semibold">{profile.foundedDate}</span>
                  </div>
                  <div>
                    <span className="text-foreground/45 font-bold uppercase tracking-wider block">Scale bracket</span>
                    <span className="text-white font-semibold">{profile.companySize}</span>
                  </div>
                </div>

                <div className="border-t border-card-border pt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-foreground/45 font-bold uppercase tracking-wider block">Mission Statement</span>
                    <p className="text-foreground/80 font-semibold mt-0.5 leading-relaxed">{profile.mission}</p>
                  </div>
                  <div>
                    <span className="text-foreground/45 font-bold uppercase tracking-wider block">Vision Statement</span>
                    <p className="text-foreground/80 font-semibold mt-0.5 leading-relaxed">{profile.vision}</p>
                  </div>
                </div>
              </Card>

              {/* Hierarchy Summary statistics */}
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <Card className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)]">
                  <span className="text-foreground/45 font-bold uppercase tracking-widest block">Active Depts</span>
                  <div className="text-2xl font-black mt-1 text-hq-cyan">{departments.filter(d => d.status === 'Active').length}</div>
                </Card>
                <Card className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)]">
                  <span className="text-foreground/45 font-bold uppercase tracking-widest block">Branch offices</span>
                  <div className="text-2xl font-black mt-1 text-hq-purple">{branches.length}</div>
                </Card>
                <Card className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)]">
                  <span className="text-foreground/45 font-bold uppercase tracking-widest block">Growth Stage</span>
                  <div className="text-2xl font-black mt-1 text-amber-500">{profile.growthStage}</div>
                </Card>
              </div>
            </div>

            {/* Health Matrix side panel */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-hq-cyan animate-pulse" />
                  Hierarchy Health Score
                </h4>

                <div className="space-y-3.5 text-[11px] font-bold">
                  {[
                    { label: 'Strategic Alignment', score: 94, color: 'text-hq-cyan' },
                    { label: 'Department Collaboration', score: 88, color: 'text-hq-purple' },
                    { label: 'Role Resource Allocation', score: 91, color: 'text-green-500' },
                    { label: 'Branch Sync Latency', score: 96, color: 'text-amber-500' },
                  ].map((h, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-foreground/60">{h.label}</span>
                        <span className={h.color}>{h.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${h.score}%`,
                            backgroundColor: h.color.includes('cyan') ? brandColor : h.color.includes('purple') ? '#8B5CF6' : h.color.includes('green') ? '#22C55E' : '#F59E0B'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 2. Departments & Teams Tab */}
        {activeTab === 'structure' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            {/* Left Column: Active departments list */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <Layers className="h-4.5 w-4.5 text-hq-purple" />
                  Active Departments & C-Suite Owners
                </h3>
                <Badge variant="neutral" className="text-[9px]">Editable Hierarchy</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {departments.filter(d => d.status === 'Active').map(dept => (
                  <Card key={dept.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white">{dept.name}</h4>
                        <button
                          onClick={() => handleArchiveDept(dept.id, dept.name)}
                          className="text-foreground/35 hover:text-red-500 p-1 rounded transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-[10px] text-foreground/50 font-semibold space-y-1">
                        <p className="flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-hq-cyan" />
                          Owner: <span className="text-[#1A1A1E] dark:text-white">{dept.executive}</span>
                        </p>
                        <p>Teams associated: <span className="text-[#1A1A1E] dark:text-white">{dept.teamCount}</span></p>
                        <p>Running missions: <span className="text-[#1A1A1E] dark:text-white">{dept.missionCount}</span></p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Column: Add Department form */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Create Department</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Deploy a new operations business block</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Department Name</label>
                    <Input
                      placeholder="e.g. Sales Division"
                      value={newDeptName}
                      onChange={e => setNewDeptName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Assigned AI Executive</label>
                    <Input
                      placeholder="e.g. CSD Yuki"
                      value={newDeptExec}
                      onChange={e => setNewDeptExec(e.target.value)}
                    />
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5 gap-1"
                    style={{ backgroundColor: brandColor }}
                    onClick={handleAddDepartment}
                  >
                    <Plus className="h-4 w-4" />
                    Register Department
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 3. Branch Offices Tab */}
        {activeTab === 'branches' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <MapPin className="h-4.5 w-4.5 text-hq-cyan" />
                  Geographical Branch & Regional Nodes
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {branches.map(br => (
                  <Card key={br.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] space-y-3">
                    <div>
                      <Badge variant="neutral" className="text-[8px] uppercase tracking-wider font-bold">{br.region}</Badge>
                      <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white mt-1.5">{br.name}</h4>
                    </div>
                    <div className="text-[10px] text-foreground/50 font-semibold space-y-1">
                      <p>Regional Manager: <span className="text-white">{br.manager}</span></p>
                      <p>Members on site: <span className="text-white">{br.memberCount}</span></p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Add Branch form */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Register Regional Branch</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Extend tenant node footprint</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Office/Branch Name</label>
                    <Input
                      placeholder="e.g. Lagos Corridor Hub"
                      value={newBranchName}
                      onChange={e => setNewBranchName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Country/Region</label>
                    <Input
                      placeholder="e.g. Nigeria"
                      value={newBranchRegion}
                      onChange={e => setNewBranchRegion(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Regional Manager</label>
                    <Input
                      placeholder="e.g. Alistair Thorne"
                      value={newBranchManager}
                      onChange={e => setNewBranchManager(e.target.value)}
                    />
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5 gap-1"
                    style={{ backgroundColor: brandColor }}
                    onClick={handleAddBranch}
                  >
                    <Plus className="h-4 w-4" />
                    Register Office
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 4. Evolution Stage Tab */}
        {activeTab === 'evolution' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground/45 uppercase tracking-widest">Growth Evolution Stage</h3>
                    <h2 className="text-base font-extrabold text-[#1A1A1E] dark:text-white mt-0.5">
                      Current Scale stage: <span className="text-amber-500 font-black">{profile.growthStage}</span>
                    </h2>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-foreground/50">
                    <span>Startup Milestone Completion</span>
                    <span>75% (3 of 4 met)</span>
                  </div>
                  <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>

                {/* Growth Stage Criteria Checklist */}
                <div className="border-t border-card-border pt-4 space-y-3 text-xs font-semibold">
                  <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Startup Exit Requirements</p>
                  
                  {[
                    { label: 'Register 3 distinct operational branches (Completed)', met: true },
                    { label: 'Align 4 department board owners (Completed)', met: true },
                    { label: 'Save 10+ long-term memories (Completed)', met: true },
                    { label: 'Reach 20+ active C-Suite members (Pending)', met: false },
                  ].map((req, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        req.met ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-foreground/40'
                      }`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                      <span className={req.met ? 'text-foreground/75' : 'text-foreground/45'}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* AI Recommendations for Scale Up */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">AI Evolution Insights</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Suggesting adaptations as you grow</p>
                </div>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 space-y-2">
                    <p className="text-[10px] font-black text-[#1A1A1E] dark:text-white">Suggest: Expand HR Division</p>
                    <p className="text-[9px] text-foreground/50 leading-relaxed font-semibold">
                      Your C-Suite team size is approaching 15. Standard governance suggestions suggest spawning a human resources department node to handle permissions.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 space-y-2">
                    <p className="text-[10px] font-black text-[#1A1A1E] dark:text-white">Suggest: Enforce Enterprise MFA</p>
                    <p className="text-[9px] text-foreground/50 leading-relaxed font-semibold">
                      As your operational footprint expands, strict governance policies mandate transitioning MFA controls from "Optional" to "Enforced" on the compliance console.
                    </p>
                  </div>

                  {profile.growthStage === 'Startup' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-bold border-card-border h-8.5"
                      onClick={handleStageUpgrade}
                    >
                      Initialize Stage Transition →
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
