'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { ShieldAlert, Key, CheckSquare } from 'lucide-react';

export default function SecurityPage() {
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
            All user authentications are validated via Firebase Custom Claims, assigning unique
            tokens for RBAC.
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
    </div>
  );
}
