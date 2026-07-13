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
  Badge,
  Input,
} from '@hq/ui';
import {
  Play,
  Pause,
  XCircle,
  Compass,
  Loader2,
  PlusCircle,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { SmartEmptyState } from '../../../components/smart-empty-state';
import { MissionLaunchPanel } from '../../../components/mission-launch-panel';

interface Mission {
  id: string;
  objective: string;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Analyzing' | 'Planning' | 'Running' | 'Paused' | 'Completed' | 'Cancelled';
  progress: number;
}

export default function MissionsPage() {
  const { token } = useAuth();
  const [missionPanelOpen, setMissionPanelOpen] = React.useState(false);

  const seededMissions: Mission[] = [
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
  ];

  const [missions, setMissions] = React.useState<Mission[]>(seededMissions);

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
  const [showBrief, setShowBrief] = React.useState(false);

  // Custom onboarding data sync states
  const [ceoName, setCeoName] = React.useState('Elena Rostova');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  React.useEffect(() => {
    // Read from onboarding draft if available
    const draftStr = localStorage.getItem('hq_onboarding_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.ceoName) setCeoName(draft.ceoName);
        if (draft.brandColor) setBrandColor(draft.brandColor);
      } catch (e) {
        console.warn('Error reading onboarding draft:', e);
      }
    }
  }, []);

  const fetchMissions = React.useCallback(async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/missions', { headers });
      if (res.ok) {
        const data = await res.json();
        // Map backend schema
        const mapped = data.map(
          (m: { id: string; objective: string; deadline?: string; status: string }) => {
            let mappedStatus: Mission['status'] = 'Running';
            if (m.status === 'DRAFT') mappedStatus = 'Draft';
            else if (m.status === 'PLANNING') mappedStatus = 'Planning';
            else if (m.status === 'APPROVED' || m.status === 'DELIVERED')
              mappedStatus = 'Completed';
            else if (m.status === 'ARCHIVED') mappedStatus = 'Cancelled';

            return {
              id: m.id,
              objective: m.objective,
              deadline: m.deadline ? m.deadline.split('T')[0] : '2026-12-31',
              priority: 'Medium',
              status: mappedStatus,
              progress: m.status === 'DELIVERED' || m.status === 'APPROVED' ? 100 : 45,
            };
          },
        );
        setMissions(mapped);
      } else {
        setMissions(seededMissions);
      }
    } catch (e) {
      setMissions(seededMissions);
    }
  }, [token]);

  React.useEffect(() => {
    if (token) {
      fetchMissions();
    } else {
      setMissions(seededMissions);
    }
  }, [token, fetchMissions]);

  const execCredits: Record<string, number> = {
    ceo: 50,
    vision_director: 40,
    strategy_director: 45,
    technology_director: 40,
    software_engineering_director: 35,
    ai_ml_director: 45,
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

  const triggerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective) return;
    setShowBrief(true);
  };

  const handleLaunchSequence = async () => {
    setShowBrief(false);
    setLaunching(true);
    setLaunchStep(1);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          objective,
          deadline: deadline || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Start the execution
        await fetch(`/api/missions/${data.id}/start`, { method: 'POST', headers });

        setLaunchStep(2);
        await new Promise((r) => setTimeout(r, 600));
        setLaunchStep(3);
        await new Promise((r) => setTimeout(r, 600));
        setLaunchStep(4);
        await new Promise((r) => setTimeout(r, 400));

        await fetchMissions();
      } else {
        throw new Error('API Launch Failed');
      }
    } catch (e) {
      // Local fallback
      await new Promise((r) => setTimeout(r, 800));
      setLaunchStep(2);
      await new Promise((r) => setTimeout(r, 800));
      setLaunchStep(3);
      await new Promise((r) => setTimeout(r, 800));
      setLaunchStep(4);
      await new Promise((r) => setTimeout(r, 500));

      const newMission: Mission = {
        id: `m${Date.now()}`,
        objective,
        deadline: deadline || '2026-12-31',
        priority,
        status: 'Running',
        progress: 5,
      };
      setMissions((prev) => [newMission, ...prev]);
    } finally {
      resetForm();
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          objective,
          deadline: deadline || undefined,
        }),
      });
      if (res.ok) {
        await fetchMissions();
      } else {
        throw new Error('API draft save failed');
      }
    } catch (e) {
      const newDraft: Mission = {
        id: `m${Date.now()}`,
        objective,
        deadline: deadline || '2026-12-31',
        priority,
        status: 'Draft',
        progress: 0,
      };
      setMissions((prev) => [newDraft, ...prev]);
    } finally {
      resetForm();
      setShowBrief(false);
    }
  };

  const handleCancelLaunch = () => {
    resetForm();
    setShowBrief(false);
  };

  const resetForm = () => {
    setObjective('');
    setDeadline('');
    setAudience('');
    setMetrics('');
    setSelectedExecs(['ceo']);
    setLaunching(false);
    setLaunchStep(0);
  };

  const handleOversightAction = async (id: string, action: 'pause' | 'cancel' | 'resume') => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/missions/${id}/${action}`, { method: 'POST', headers });
      if (res.ok) {
        await fetchMissions();
      } else {
        throw new Error('API action failed');
      }
    } catch (e) {
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
    }
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Mission Launch Panel */}
      <MissionLaunchPanel
        open={missionPanelOpen}
        onClose={() => setMissionPanelOpen(false)}
        onSubmit={({ objective, deadline, priority }) => {
          const newM: Mission = {
            id: `m${Date.now()}`,
            objective,
            deadline: deadline || '—',
            priority,
            status: 'Planning',
            progress: 0,
          };
          setMissions(prev => [newM, ...prev]);
          setMissionPanelOpen(false);
        }}
        brandColor={brandColor}
        token={token ?? undefined}
      />

      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
          <Compass className="h-8 w-8 text-hq-blue" />
          Mission Control
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Spawn, orchestrate, and guide active operations in real-time.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Intake Form or CEO Briefing Card */}
        <div className="lg:col-span-2 space-y-6">
          {showBrief ? (
            /* CEO pre-execution Mission Briefing log */
            <Card className="border border-card-border bg-card-bg shadow-lg animate-in zoom-in-95 duration-200">
              <CardHeader className="border-b border-card-border pb-4">
                <Badge variant="ai" className="w-fit text-[10px]">
                  PRE-FLIGHT BRIEFING
                </Badge>
                <CardTitle className="text-xl font-extrabold text-[#1A1A1E] dark:text-white mt-1">
                  CEO Briefing: Validate Intent
                </CardTitle>
                <CardDescription className="text-xs">
                  Review the execution blueprint formulated by CEO{' '}
                  <span className="font-bold" style={{ color: brandColor }}>
                    {ceoName}
                  </span>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="py-5 space-y-5 text-sm text-left">
                <div className="space-y-1">
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-bold">
                    Mission Objective
                  </span>
                  <p className="text-foreground/80 font-bold leading-relaxed">{objective}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-bold">
                    Why This Matters
                  </span>
                  <p className="text-foreground/70 font-semibold leading-relaxed text-xs">
                    This campaign directly targets client acquisition, aligns workgroups with B2B
                    logistic targets, and builds operational resilience.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-bold">
                      Expected Duration
                    </span>
                    <p className="text-foreground/80 font-bold text-xs">
                      {selectedExecs.length * 3} Days
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-bold">
                      Key Success Metric
                    </span>
                    <p className="text-hq-cyan font-bold text-xs">
                      {metrics || 'Verify copywriting deliverables'}
                    </p>
                  </div>
                </div>

                <div className="p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-xl flex gap-3 items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-[#1A1A1E] dark:text-white">
                      Orchestration Risk Factor
                    </h5>
                    <p className="text-[10px] text-foreground/50 mt-0.5">
                      Executing tasks on multiple directories carries a minor dependency risk if
                      checkout hooks or local keys rotate.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3 border-t border-card-border pt-4 bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-b-xl">
                <Button
                  variant="outline"
                  onClick={handleCancelLaunch}
                  className="border-card-border text-xs font-bold shrink-0"
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowBrief(false)}
                  className="text-xs font-bold shrink-0"
                >
                  Edit Mission
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  className="border-card-border text-xs font-bold shrink-0"
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={handleLaunchSequence}
                  className="flex-1 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-md"
                  style={{ backgroundColor: brandColor }}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Approve & Launch
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#1A1A1E] dark:text-white">
                  <PlusCircle className="h-5 w-5 text-hq-blue" />
                  Launch AI Mission
                </CardTitle>
                <CardDescription className="text-xs">
                  Enter objectives to orchestrate target workgroups
                </CardDescription>
              </CardHeader>
              <CardContent>
                {launching ? (
                  // Launching Animation Sequence Block
                  <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-300">
                    <Loader2 className="h-10 w-10 text-hq-blue animate-spin" />
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                        Launching Boardroom Flow
                      </h3>
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
                  <form onSubmit={triggerFormSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/75">Objective</label>
                      <textarea
                        placeholder="e.g. Compose strategic marketing proposal targeting West African petroleum trade routes..."
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        required
                        className="min-h-24 w-full rounded-xl border border-card-border bg-white dark:bg-black p-3 text-sm focus:outline-none focus:ring-1 focus:ring-hq-blue text-foreground"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/75">Deadline</label>
                        <input
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="h-9 w-full rounded-xl border border-card-border bg-white dark:bg-black px-3 text-sm text-foreground focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/75">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                          className="h-9 w-full rounded-xl border border-card-border bg-white dark:bg-black px-3 text-sm text-foreground focus:outline-none"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/75">
                          Target Audience
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. B2B Trading Managers"
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          className="h-9 w-full border-card-border text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/75">
                          Success Metric
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Churn reduction or 20% conversion"
                          value={metrics}
                          onChange={(e) => setMetrics(e.target.value)}
                          className="h-9 w-full border-card-border text-xs"
                        />
                      </div>
                    </div>

                    {/* Selection of Board Members to estimate credits */}
                    <div className="space-y-2 pt-2 text-left">
                      <label className="text-xs font-bold text-foreground/75 block">
                        Involved AI Directors
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { key: 'ceo', name: ceoName },
                          { key: 'vision_director', name: 'Morgan Vance' },
                          { key: 'strategy_director', name: 'Alistair Thorne' },
                          { key: 'technology_director', name: 'Hiroshi Tanaka' },
                          { key: 'software_engineering_director', name: 'Linus Kovacs' },
                          { key: 'ai_ml_director', name: 'Sarah Ndiaye' },
                          { key: 'finance_director', name: 'Sophia Sterling' },
                          { key: 'security_director', name: 'Jack Bauer' },
                        ].map((m) => {
                          const isSelected = selectedExecs.includes(m.key);
                          return (
                            <button
                              key={m.key}
                              type="button"
                              onClick={() => handleToggleExec(m.key)}
                              className="px-3 py-2 border rounded-xl transition-all text-xs font-semibold text-center leading-tight flex flex-col justify-center items-center h-12"
                              style={{
                                borderColor: isSelected ? brandColor : undefined,
                                backgroundColor: isSelected ? brandColor + '0d' : undefined,
                                color: isSelected ? brandColor : undefined,
                              }}
                            >
                              <span>{m.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-card-border/50">
                      <Button
                        type="submit"
                        className="text-xs font-bold text-white flex items-center gap-1 shadow-md"
                        style={{ backgroundColor: brandColor }}
                      >
                        <Play className="h-4.5 w-4.5" />
                        Launch Mission
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Credit Estimator & Active Missions Overview */}
        <div className="space-y-6">
          {/* Credit Ingest Estimator */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] text-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                Outflow Credit Estimator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center">
              <div className="text-3xl font-black text-[#1A1A1E] dark:text-white flex items-baseline gap-1">
                <span>{calculateCredits()}</span>
                <span className="text-xs text-foreground/45 font-bold uppercase tracking-widest">
                  credits
                </span>
              </div>
              <p className="text-[10px] text-foreground/45 mt-1 font-semibold">
                Based on {selectedExecs.length} assigned boardroom workgroups
              </p>
            </CardContent>
          </Card>

          {/* Active Missions overview list */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] text-foreground">
            <CardHeader className="pb-3 border-b border-card-border">
              <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">
                Active Boardroom Missions
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-4 text-left">
              {missions.length === 0 ? (
                <SmartEmptyState
                  icon={Compass}
                  title="No active missions yet"
                  description="Launch your first mission and your AI executive team will immediately begin working on it."
                  cta="Launch First Mission"
                  onCta={() => setMissionPanelOpen(true)}
                  hints={[
                    'Be specific — the more detail, the better the result',
                    'Your CEO executive will analyse and plan execution automatically',
                    'Track progress in real-time from this panel',
                  ]}
                />
              ) : missions.map((m) => (
                <div
                  key={m.id}
                  className="border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-xl p-3.5 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1E] dark:text-white line-clamp-2">
                        {m.objective}
                      </h4>
                      <div className="flex gap-2.5 items-center mt-1 text-[10px] text-foreground/45 font-semibold">
                        <span>Due: {m.deadline}</span>
                        <span>•</span>
                        <span
                          className={m.priority === 'High' ? 'text-red-400' : 'text-foreground/50'}
                        >
                          {m.priority}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        m.status === 'Completed'
                          ? 'success'
                          : m.status === 'Running'
                            ? 'ai'
                            : 'info'
                      }
                      className="text-[9px]"
                    >
                      {m.status}
                    </Badge>
                  </div>

                  {m.status !== 'Draft' && m.status !== 'Cancelled' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-foreground/50 font-bold">
                        <span>Progress</span>
                        <span>{m.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-[#1E1E24] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-hq-blue rounded-full transition-all duration-300"
                          style={{ width: `${m.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions buttons for oversight */}
                  <div className="flex justify-end gap-2 border-t border-card-border/50 pt-2.5">
                    {m.status === 'Running' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOversightAction(m.id, 'pause')}
                        className="text-[10px] h-7 px-2"
                      >
                        <Pause className="h-3 w-3 mr-1" /> Pause
                      </Button>
                    )}
                    {m.status === 'Paused' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOversightAction(m.id, 'resume')}
                        className="text-[10px] h-7 px-2"
                      >
                        <Play className="h-3 w-3 mr-1" /> Resume
                      </Button>
                    )}
                    {(m.status === 'Running' || m.status === 'Paused' || m.status === 'Draft') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOversightAction(m.id, 'cancel')}
                        className="text-[10px] h-7 px-2 text-red-500 hover:text-red-600"
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
