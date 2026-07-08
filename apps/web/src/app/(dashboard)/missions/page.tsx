'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@hq/ui';
import {
  Play,
  Pause,
  XCircle,
  Calculator,
  Compass,
  ArrowRight,
  Loader2,
  CalendarDays,
  PlusCircle,
} from 'lucide-react';

interface Mission {
  id: string;
  objective: string;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Analyzing' | 'Planning' | 'Running' | 'Paused' | 'Completed' | 'Cancelled';
  progress: number;
}

export default function MissionsPage() {
  const [missions, setMissions] = React.useState<Mission[]>([
    {
      id: 'm1',
      objective: 'Q3 Petroleum Logistics Outreach Strategy',
      deadline: '2026-08-15',
      priority: 'High',
      status: 'Running',
      progress: 80,
    },
    {
      id: 'm2',
      objective: 'Compose copy for Q2 Social Media Campaign',
      deadline: '2026-07-20',
      priority: 'Medium',
      status: 'Completed',
      progress: 100,
    },
  ]);

  // Form states
  const [objective, setObjective] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [priority, setPriority] = React.useState<'Low' | 'Medium' | 'High'>('Medium');
  const [audience, setAudience] = React.useState('');
  const [metrics, setMetrics] = React.useState('');

  // Selected Executives for Credit Estimation
  const [selectedExecs, setSelectedExecs] = React.useState<string[]>(['ceo']);

  // Launching sequence states
  const [launchStep, setLaunchStep] = React.useState<number>(0); // 0: idle, 1: submit, 2: ceo analysis, 3: wbs planning, 4: completed
  const [launching, setLaunching] = React.useState(false);

  const execCredits: Record<string, number> = {
    ceo: 50,
    vision_director: 40,
    strategy_director: 45,
    technology_director: 40,
    software_engineering_director: 35,
    ai_ml_director: 45,
    petroleum_industry_director: 60,
    finance_director: 40,
    security_director: 35,
  };

  const calculateCredits = () => {
    return selectedExecs.reduce((acc, exec) => acc + (execCredits[exec] || 0), 0);
  };

  const handleToggleExec = (exec: string) => {
    setSelectedExecs((prev) =>
      prev.includes(exec) ? prev.filter((e) => e !== exec) : [...prev, exec],
    );
  };

  const handleLaunchSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective) return;

    setLaunching(true);
    setLaunchStep(1); // Details Submitted

    // Step 2: CEO Strategic Analysis
    await new Promise((r) => setTimeout(r, 1200));
    setLaunchStep(2);

    // Step 3: WBS Planning
    await new Promise((r) => setTimeout(r, 1200));
    setLaunchStep(3);

    // Step 4: Mission Activated
    await new Promise((r) => setTimeout(r, 1200));
    setLaunchStep(4);
    await new Promise((r) => setTimeout(r, 800));

    // Append to missions list
    const newMission: Mission = {
      id: `m${Date.now()}`,
      objective,
      deadline: deadline || '2026-12-31',
      priority,
      status: 'Running',
      progress: 5,
    };
    setMissions((prev) => [newMission, ...prev]);

    // Reset Form
    setObjective('');
    setDeadline('');
    setAudience('');
    setMetrics('');
    setSelectedExecs(['ceo']);
    setLaunching(false);
    setLaunchStep(0);
  };

  const handleOversightAction = (id: string, action: 'pause' | 'cancel' | 'resume') => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          if (action === 'pause') return { ...m, status: 'Paused' };
          if (action === 'resume') return { ...m, status: 'Running' };
          if (action === 'cancel') return { ...m, status: 'Cancelled', progress: 0 };
        }
        return m;
      }),
    );
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Compass className="h-8 w-8 text-hq-blue" />
          Mission Control
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Spawn, orchestrate, and guide active operations in real-time.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Intake Intake Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-hq-blue" />
                Launch AI Mission
              </CardTitle>
              <CardDescription>Enter objectives to orchestrate target workgroups</CardDescription>
            </CardHeader>
            <CardContent>
              {launching ? (
                // Launching Animation Sequence Block
                <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-300">
                  <Loader2 className="h-10 w-10 text-hq-blue animate-spin" />
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">Launching Boardroom Flow</h3>
                    <div className="flex flex-col space-y-1.5 text-xs text-foreground/60 max-w-xs mx-auto">
                      <span className={launchStep >= 1 ? 'text-hq-cyan font-semibold' : ''}>
                        ✓ Step 1: Submit Objective Details
                      </span>
                      <span className={launchStep >= 2 ? 'text-hq-cyan font-semibold' : ''}>
                        {launchStep >= 2 ? '✓' : '•'} Step 2: CEO Strategic Analysis
                      </span>
                      <span className={launchStep >= 3 ? 'text-hq-cyan font-semibold' : ''}>
                        {launchStep >= 3 ? '✓' : '•'} Step 3: Chief of Staff task planning
                      </span>
                      <span className={launchStep >= 4 ? 'text-hq-cyan font-semibold' : ''}>
                        {launchStep >= 4 ? '✓' : '•'} Step 4: Mission Activated!
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLaunchSequence} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/75">Objective</label>
                    <textarea
                      placeholder="e.g. Compose strategic marketing proposal targeting West African petroleum trade routes..."
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      required
                      className="min-h-24 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-hq-blue text-foreground"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Deadline</label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                        className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B2B Trading Managers"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">
                        Success Metric
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Churn reduction or 20% conversion"
                        value={metrics}
                        onChange={(e) => setMetrics(e.target.value)}
                        className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Selection of Board Members to estimate credits */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-foreground/75 block">
                      Involved AI Directors
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(execCredits).map((exec) => {
                        const isSelected = selectedExecs.includes(exec);
                        return (
                          <button
                            type="button"
                            key={exec}
                            onClick={() => handleToggleExec(exec)}
                            className={`rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                              isSelected
                                ? 'bg-hq-purple text-white shadow'
                                : 'bg-hq-graphite/40 border border-hq-graphite/20 text-foreground/60'
                            }`}
                          >
                            {exec.replace('_', ' ')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" variant="primary" className="flex items-center gap-1.5">
                      Launch Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credit preview & active status logs */}
        <div className="space-y-6">
          {/* Credit Preview */}
          <Card className="border border-yellow-500/20 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-yellow-500 flex items-center gap-1.5">
                <Calculator className="h-4 w-4" />
                Credit Estimation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-foreground/60">Estimated Cost</span>
                <span className="text-2xl font-bold text-white">{calculateCredits()} credits</span>
              </div>
              <p className="text-[10px] text-foreground/50 leading-relaxed">
                Credits are computed dynamically based on the complexity multipliers of the active
                Board Directors selected.
              </p>
            </CardContent>
          </Card>

          {/* Oversight Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Active Oversight</CardTitle>
              <CardDescription>Real-time human oversight operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className="border border-hq-graphite/40 bg-hq-graphite/10 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{m.objective}</h4>
                      <div className="flex items-center space-x-1.5 text-[10px] text-foreground/50 mt-0.5">
                        <CalendarDays className="h-3 w-3" />
                        <span>Ends: {m.deadline}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        m.status === 'Running'
                          ? 'success'
                          : m.status === 'Paused'
                            ? 'warning'
                            : m.status === 'Completed'
                              ? 'default'
                              : 'error'
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>

                  {/* Progress Slider */}
                  <div className="w-full h-1.5 bg-hq-graphite rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hq-blue rounded-full transition-all duration-300"
                      style={{ width: `${m.progress}%` }}
                    ></div>
                  </div>

                  {/* Oversight Action Trigger Buttons */}
                  {m.status !== 'Completed' && m.status !== 'Cancelled' && (
                    <div className="flex gap-2 pt-1">
                      {m.status === 'Running' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-[10px] flex-1 flex items-center justify-center gap-1"
                          onClick={() => handleOversightAction(m.id, 'pause')}
                        >
                          <Pause className="h-3 w-3" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-7 text-[10px] flex-1 flex items-center justify-center gap-1"
                          onClick={() => handleOversightAction(m.id, 'resume')}
                        >
                          <Play className="h-3 w-3" />
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] border-red-500/20 hover:bg-red-500/10 text-red-400 flex-1 flex items-center justify-center gap-1"
                        onClick={() => handleOversightAction(m.id, 'cancel')}
                      >
                        <XCircle className="h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
