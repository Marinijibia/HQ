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
import { Settings, Users, Shield, Save, UserPlus, CheckCircle, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending';
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

  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('Member');
  const [showInviteSuccess, setShowInviteSuccess] = React.useState(false);

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

  return (
    <div className="space-y-8 select-none">
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
        {/* Core Profile Configurations */}
        <div className="lg:col-span-2 space-y-6">
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
            <CardFooter className="flex justify-end border-t border-hq-graphite/20 pt-4">
              <Button variant="primary" className="flex items-center gap-1.5 text-xs">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Members Directory */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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

        {/* Invite Member Drawer panel */}
        <div className="space-y-6">
          <Card>
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
        </div>
      </div>
    </div>
  );
}
