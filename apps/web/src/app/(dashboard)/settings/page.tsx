'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
} from '@hq/ui';
import {
  Settings,
  Users,
  Shield,
  Save,
  UserPlus,
  CheckCircle,
  Trash2,
  Monitor,
  CalendarDays,
  Palette,
  Laptop,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending';
}

interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SettingsPage() {
  const [members, setMembers] = React.useState<TeamMember[]>([
    {
      id: '1',
      name: 'Elena Rostova',
      email: 'elena@hq.corp',
      role: 'Organization Owner',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Alexander Carter',
      email: 'alex@hq.corp',
      role: 'Administrator',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Sophia Sterling',
      email: 'sophia@hq.corp',
      role: 'Finance Director',
      status: 'Pending',
    },
  ]);

  const [sessions, setSessions] = React.useState<ActiveSession[]>([
    {
      id: 'sess-1',
      device: 'Chrome / macOS (15.4)',
      ip: '192.168.1.84',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'Safari / iPhone 15 Pro',
      ip: '72.190.43.21',
      lastActive: '3 hours ago',
      isCurrent: false,
    },
  ]);

  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('Member');
  const [showInviteSuccess, setShowInviteSuccess] = React.useState(false);

  const [briefingInterval, setBriefingInterval] = React.useState('weekly');
  const [whiteLabelTheme, setWhiteLabelTheme] = React.useState('cobalt');
  const [logoUrl, setLogoUrl] = React.useState('https://hq.corp/assets/logo.png');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending',
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteEmail('');
    setShowInviteSuccess(true);
    setTimeout(() => setShowInviteSuccess(false), 2000);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8 select-none text-white">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-8 w-8 text-hq-blue" />
          Settings & Directory
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Manage your organization workspaces, member directories, and zero-trust permissions.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Core Profile Configurations */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle>Organization Attributes</CardTitle>
              <CardDescription>Configure name details and workspace parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/75">
                    Organization Name
                  </label>
                  <Input defaultValue="HQ Corporation" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/75">
                    Organization Slug
                  </label>
                  <Input defaultValue="hq-corp" disabled />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/75">
                    Country / Region
                  </label>
                  <Input defaultValue="United States" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/75">
                    Default Language
                  </label>
                  <Input defaultValue="English" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-hq-graphite/20 pt-4 bg-hq-graphite/10">
              <Button variant="primary" className="flex items-center gap-1.5 text-xs h-9">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* White-Label Customization */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-5 w-5 text-hq-cyan" />
                White-Label Customization
              </CardTitle>
              <CardDescription>Configure brand overlays and formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/75">
                    Custom Logo URL
                  </label>
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/75">
                    Brand UI Color Theme
                  </label>
                  <select
                    value={whiteLabelTheme}
                    onChange={(e) => setWhiteLabelTheme(e.target.value)}
                    className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                  >
                    <option value="cobalt">HQ Cobalt (Default)</option>
                    <option value="graphite">HQ Graphite (Dark Classic)</option>
                    <option value="amethyst">HQ Amethyst (Purple Slate)</option>
                    <option value="emerald">HQ Emerald (BioTech Green)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Session Auditing */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Monitor className="h-5 w-5 text-hq-blue" />
                Session Device Auditing
              </CardTitle>
              <CardDescription>Monitor active sessions and revoke connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Laptop className="h-5 w-5 text-foreground/50" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{sess.device}</span>
                          {sess.isCurrent && (
                            <span className="bg-hq-cyan/20 text-hq-cyan px-1.5 py-0.5 rounded text-[9px] font-semibold">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-foreground/45 mt-0.5">
                          IP: {sess.ip} • Last Active: {sess.lastActive}
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <Button
                        variant="ghost"
                        className="text-red-400 hover:text-red-500 text-[10px] px-2 h-7"
                        onClick={() => handleRevokeSession(sess.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Members Directory */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-hq-blue" />
                Directory List
              </CardTitle>
              <CardDescription>Manage active user memberships and role levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="text-[10px] text-foreground/45">({m.email})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-foreground/50">
                        <Shield className="h-3 w-3 text-hq-purple" />
                        <span>{m.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          m.status === 'Active'
                            ? 'bg-hq-cyan/20 text-hq-cyan'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {m.status}
                      </span>
                      {m.role !== 'Organization Owner' && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-red-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Invite & Periodic Briefings */}
        <div className="space-y-6">
          {/* Invite Drawer */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-hq-cyan" />
                Invite Team Member
              </CardTitle>
              <CardDescription>Grant boardroom permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/75">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/75">Workspace Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Department Manager">Department Manager</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Member">Member</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                {showInviteSuccess && (
                  <div className="flex items-center gap-1.5 text-hq-cyan font-semibold text-xs py-1 animate-pulse">
                    <CheckCircle className="h-4 w-4" />
                    <span>Invitation Sent Successfully!</span>
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full text-xs h-9">
                  Send Invite
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Scheduled Periodic Reviews */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-hq-purple" />
                Periodic Briefings
              </CardTitle>
              <CardDescription>Schedule corporate review runs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/75">
                  Briefing Intervals
                </label>
                <select
                  value={briefingInterval}
                  onChange={(e) => setBriefingInterval(e.target.value)}
                  className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                >
                  <option value="daily">Daily operational summaries</option>
                  <option value="weekly">Weekly executive board reviews</option>
                  <option value="monthly">Monthly strategic evaluations</option>
                  <option value="quarterly">Quarterly security audits</option>
                </select>
              </div>
              <p className="text-[10px] text-foreground/45 leading-normal">
                Briefing summaries are compiled by Arthur Steward (Chief of Staff) and sent directly
                to your workspace.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
