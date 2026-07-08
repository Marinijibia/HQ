'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@hq/ui';
import { CreditCard, ArrowUpRight, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface Invoice {
  id: string;
  amount: string;
  status: 'Paid' | 'Pending';
  date: string;
}

export default function BillingPage() {
  const invoices: Invoice[] = [
    { id: 'INV-001', amount: '$0.00', status: 'Paid', date: 'Jul 01, 2026' },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-hq-blue" />
          Billing & Subscriptions
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Review subscription invoices, check credits, and scale up your execution plans.
        </p>
      </div>

      {/* Upgrade Banner with message from AI CEO */}
      <Card className="border border-yellow-500/40 bg-yellow-500/5 shadow-level-5 animate-in fade-in duration-300">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3 text-left">
            <div className="h-9 w-9 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider">
                Board Limits Reached
              </p>
              <p className="text-sm font-semibold text-white mt-1 leading-snug">
                Message from Elena (CEO): &ldquo;Your Headquarters has reached today&apos;s mission
                capacity. Upgrade to continue expanding your business.&rdquo;
              </p>
            </div>
          </div>
          <Button variant="accent" className="flex items-center gap-1 text-xs px-4 h-9 shrink-0">
            <Sparkles className="h-4 w-4" />
            Scale to Growth Plan
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Plan Overview Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Free Starter Tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg">
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-semibold">
                    Mission Throttling
                  </span>
                  <span className="text-xl font-bold text-white mt-1 block">1 Active running</span>
                </div>
                <div className="p-4 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg">
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-semibold">
                    Cost limits
                  </span>
                  <span className="text-xl font-bold text-white mt-1 block">$0 / month</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-xs text-foreground/60">Subscription Benefits Included:</p>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="flex items-center gap-1.5 text-foreground/75">
                    <CheckCircle2 className="h-4 w-4 text-hq-cyan" />
                    <span>25 AI Executives Roster</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/75">
                    <CheckCircle2 className="h-4 w-4 text-hq-cyan" />
                    <span>Zero-Trust API Guards</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/75">
                    <CheckCircle2 className="h-4 w-4 text-hq-cyan" />
                    <span>Basic telemetry dashboards</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/75">
                    <CheckCircle2 className="h-4 w-4 text-hq-cyan" />
                    <span>Internal event bus routing</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Review all previous statements logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{inv.id}</p>
                      <p className="text-[10px] text-foreground/45 mt-0.5">{inv.date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{inv.amount}</span>
                      <span className="bg-hq-cyan/20 text-hq-cyan px-2 py-0.5 rounded text-[10px] font-semibold">
                        {inv.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground/40 hover:text-foreground"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plan Options summary inside sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Credit Balances</CardTitle>
              <CardDescription>Active billing cycles usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/45">Remaining Credits</span>
                <span className="font-bold text-white">9,420</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/45">Next Reset Date</span>
                <span className="font-semibold text-foreground/80">July 20, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/45">Weekly Credit Outflow</span>
                <span className="font-semibold text-hq-purple">580 credits</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
