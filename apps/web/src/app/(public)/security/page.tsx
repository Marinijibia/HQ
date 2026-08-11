'use client';

import * as React from 'react';
import { Card, Badge, Button, Input } from '@hq/ui';
import { ShieldAlert, Key, CheckSquare, FileText, Sparkles } from 'lucide-react';
import { toast } from '../../../components/toast';

export default function SecurityPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [requestType, setRequestType] = React.useState<'SOC2_REPORT' | 'SECURITY_DECK' | 'COMPLIANCE_AUDIT'>('SOC2_REPORT');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSecurityRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !companyName) return;
    setLoading(true);
    try {
      const res = await fetch('/api/public/security-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Security Reviewer',
          email,
          companyName,
          requestType,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        toast.success(`🛡️ Compliance package dispatched to ${email}`);
      } else {
        toast.error('Failed processing security request.');
      }
    } catch {
      toast.error('Network error submitting request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="ai" className="px-3.5 py-1 rounded-full text-xs tracking-widest font-bold">
          SECURITY & ZERO-TRUST COMPLIANCE
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Secure by Design
        </h1>
        <p className="text-foreground/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          HQ incorporates strict data protection policies and zero-trust verification rules at every
          workspace boundary.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-3 text-left">
        <Card className="p-6 space-y-4 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
          <div className="h-10 w-10 rounded-lg bg-hq-blue/10 flex items-center justify-center text-hq-blue border border-hq-blue/20">
            <Key className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
            Identity Protection
          </h3>
          <p className="text-sm text-foreground/50 leading-relaxed">
            All user authentications are validated via HMAC-SHA256 Cryptographic JWT Claims, assigning unique
            tokens for enterprise RBAC.
          </p>
        </Card>

        <Card className="p-6 space-y-4 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
          <div className="h-10 w-10 rounded-lg bg-hq-purple/10 flex items-center justify-center text-hq-purple border border-hq-purple/20">
            <CheckSquare className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
            SHA-256 Verification
          </h3>
          <p className="text-sm text-foreground/50 leading-relaxed">
            All uploaded files are sanitized, validated against size thresholds, and logged using
            cryptographic hash ledgers.
          </p>
        </Card>

        <Card className="p-6 space-y-4 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
          <div className="h-10 w-10 rounded-lg bg-hq-cyan/10 flex items-center justify-center text-hq-cyan border border-hq-cyan/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">Gatekeeper Audits</h3>
          <p className="text-sm text-foreground/50 leading-relaxed">
            API connections verify payload signatures for external Slack and GitHub webhook
            integrations, preventing spoofing.
          </p>
        </Card>
      </div>

      {/* SOC2 & Security Package Request Form */}
      <Card className="p-8 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition text-left space-y-6">
        <div className="flex items-center space-x-3 border-b border-card-border pb-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">Request Compliance Package</h3>
            <p className="text-xs text-foreground/50 font-semibold">
              Get official SOC2 Type II audit reports, zero-trust architecture decks, or legal security documentation.
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-2">
            <h4 className="text-sm font-black text-cyan-400">Compliance Package Dispatched!</h4>
            <p className="text-xs text-foreground/70">
              An encrypted package download link has been sent to <strong>{email}</strong>. Legal team notified (`legal@netify.ng`).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSecurityRequest} className="space-y-4 text-xs font-semibold">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-foreground/75 font-bold">Your Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asad"
                  required
                  className="bg-slate-50 dark:bg-[#0A0A0C] border-card-border text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground/75 font-bold">Work Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="security@company.com"
                  required
                  className="bg-slate-50 dark:bg-[#0A0A0C] border-card-border text-foreground"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-foreground/75 font-bold">Organization Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                  className="bg-slate-50 dark:bg-[#0A0A0C] border-card-border text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground/75 font-bold">Package Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-card-border bg-slate-50 dark:bg-[#0A0A0C] px-3 text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-hq-blue"
                >
                  <option value="SOC2_REPORT">SOC2 Type II Executive Summary Report</option>
                  <option value="SECURITY_DECK">Zero-Trust Architecture & Encryption Deck</option>
                  <option value="COMPLIANCE_AUDIT">Full Compliance & Data Protection Audit Package</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              {loading ? 'Generating Encrypted Link...' : 'Request Encrypted Package'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

