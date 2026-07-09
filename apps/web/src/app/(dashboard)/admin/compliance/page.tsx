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
  Badge,
} from '@hq/ui';
import {
  ShieldAlert,
  Save,
  CheckCircle,
  Cpu,
  DollarSign,
  ShieldCheck,
  PlusCircle,
  XCircle,
} from 'lucide-react';

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  tier: 'Standard' | 'Premium';
}

interface IntegrationRequest {
  id: string;
  integration: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export default function CompliancePage() {
  const [models, setModels] = React.useState<ModelConfig[]>([
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'Google',
      enabled: true,
      tier: 'Standard',
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      provider: 'Google',
      enabled: true,
      tier: 'Standard',
    },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', enabled: true, tier: 'Premium' },
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      enabled: false,
      tier: 'Premium',
    },
  ]);

  const [requests, setRequests] = React.useState<IntegrationRequest[]>([
    {
      id: 'req-101',
      integration: 'Hubspot CRM OAuth Sync',
      requestedBy: 'Sophia Sterling',
      requestedAt: 'July 07, 2026',
      status: 'Pending',
    },
    {
      id: 'req-102',
      integration: 'Google Drive Asset Exporter',
      requestedBy: 'Alexander Carter',
      requestedAt: 'July 08, 2026',
      status: 'Pending',
    },
  ]);

  const [monthlyCap, setMonthlyCap] = React.useState('500.00');
  const [warningThreshold, setWarningThreshold] = React.useState('80');
  const [mfaEnforced, setMfaEnforced] = React.useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);

  const toggleModel = (id: string) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleAction = (id: string, _action: 'Approved' | 'Rejected') => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveConfigs = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 select-none text-white">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-hq-blue" />
          Compliance & Governance
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Set organization-wide AI bounds, spending ceilings, MFA rules, and authorize workspace
          integrations.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Policy Configurations */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Model Selection whitelist */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Cpu className="h-5 w-5 text-hq-cyan" />
                AI Model Whitelist
              </CardTitle>
              <CardDescription>
                Enable or restrict approved models. C-Suite routing redirects query loads
                accordingly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {models.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{m.name}</span>
                      <span className="text-[10px] text-foreground/45">by {m.provider}</span>
                    </div>
                    <p className="text-[10px] text-foreground/50 mt-0.5">
                      Routing priority:{' '}
                      {m.tier === 'Premium' ? 'High-Performance' : 'Standard Failover'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={m.tier === 'Premium' ? 'premium' : 'neutral'}
                      className="text-[9px]"
                    >
                      {m.tier}
                    </Badge>
                    <button
                      onClick={() => toggleModel(m.id)}
                      className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                        m.enabled
                          ? 'bg-hq-cyan/20 text-hq-cyan hover:bg-hq-cyan/30'
                          : 'bg-hq-graphite/45 text-foreground/45 hover:bg-hq-graphite/60'
                      }`}
                    >
                      {m.enabled ? 'Enabled' : 'Restricted'}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Budget Ceilings */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-hq-blue" />
                Tenant Budget Ceilings
              </CardTitle>
              <CardDescription>Define monthly token spending bounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-foreground/75">Monthly Budget Cap ($)</label>
                  <Input
                    type="number"
                    value={monthlyCap}
                    onChange={(e) => setMonthlyCap(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-foreground/75">Warning Threshold (%)</label>
                  <Input
                    type="number"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-hq-graphite/20 pt-4 bg-hq-graphite/10">
              <div className="flex items-center gap-3">
                {showSaveSuccess && (
                  <div className="flex items-center gap-1.5 text-hq-cyan font-semibold text-xs animate-pulse">
                    <CheckCircle className="h-4 w-4" />
                    <span>Governance updated!</span>
                  </div>
                )}
                <Button
                  variant="primary"
                  className="flex items-center gap-1.5 text-xs h-9"
                  onClick={handleSaveConfigs}
                >
                  <Save className="h-4 w-4" />
                  Save Configurations
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Integrations Approvals & MFA Security */}
        <div className="space-y-8">
          {/* Integration Approval Requests */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5 text-white">
                <ShieldAlert className="h-4 w-4 text-hq-cyan" />
                Integration Gatekeeper
              </CardTitle>
              <CardDescription>Approve oauth connectors requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {requests.length === 0 ? (
                <p className="text-[10px] text-foreground/45 leading-normal">
                  No pending integration requests. Gatekeeper workspace is secure.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-white leading-tight">{req.integration}</p>
                          <p className="text-[9px] text-foreground/45 mt-0.5">
                            By: {req.requestedBy} • {req.requestedAt}
                          </p>
                        </div>
                        <Badge variant="warning" className="text-[8px] py-0">
                          {req.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1 h-7 text-[10px] text-hq-cyan bg-hq-cyan/15 hover:bg-hq-cyan/35 px-2.5 w-1/2"
                          onClick={() => handleAction(req.id, 'Approved')}
                        >
                          <PlusCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1 h-7 text-[10px] text-red-400 bg-red-500/15 hover:bg-red-500/35 px-2.5 w-1/2"
                          onClick={() => handleAction(req.id, 'Rejected')}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* MFA Enforcement Audits */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5 text-white">
                <ShieldCheck className="h-4 w-4 text-hq-purple" />
                MFA Enforcements
              </CardTitle>
              <CardDescription>Require secondary verifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg">
                <div>
                  <span className="font-bold text-white block">Enforce Organization MFA</span>
                  <span className="text-[9px] text-foreground/45 mt-0.5 block">
                    Force users to enroll TOTP hardware/app keys
                  </span>
                </div>
                <button
                  onClick={() => setMfaEnforced(!mfaEnforced)}
                  className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                    mfaEnforced
                      ? 'bg-hq-purple/20 text-hq-purple hover:bg-hq-purple/30'
                      : 'bg-hq-graphite/45 text-foreground/45 hover:bg-hq-graphite/60'
                  }`}
                >
                  {mfaEnforced ? 'Enforced' : 'Optional'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
