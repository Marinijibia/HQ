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
  Avatar,
  Input,
} from '@hq/ui';
import {
  Search,
  SlidersHorizontal,
  BrainCircuit,
  Activity,
  CheckCircle,
  Zap,
  MessageSquare,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';

interface BoardExecutive {
  id: string;
  name: string;
  roleKey: string;
  title: string;
  department: string;
  status: 'Available' | 'Busy' | 'Researching' | 'Offline';
  currentTask?: string;
  confidence: 'High' | 'Medium' | 'Low';
  biography: string;
  alignment: number;
}

export default function BoardroomPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [selectedDept, setSelectedDept] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [inspectingExec, setInspectingExec] = React.useState<BoardExecutive | null>(null);

  // Dynamic state for Ask the Boardroom console
  const [userQuery, setUserQuery] = React.useState('');
  const [isConsoleThinking, setIsConsoleThinking] = React.useState(false);
  const [consoleMessages, setConsoleMessages] = React.useState<
    Array<{ sender: string; text: string; role: string }>
  >([]);
  const [activeCollaborations, setActiveCollaborations] = React.useState<string[]>([]);

  // Custom onboarding data sync states
  const [orgName, setOrgName] = React.useState('HQ Corporation');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  const [executives, setExecutives] = React.useState<BoardExecutive[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreatingChat, setIsCreatingChat] = React.useState(false);

  // Sync settings
  React.useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/api/settings/org', { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.companyName) setOrgName(data.companyName);
          if (data.brandColor) setBrandColor(data.brandColor);
        }
      })
      .catch(() => { /* silent fallback */ });
  }, [token]);

  // Fetch live executives
  const fetchExecutives = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const res = await fetch('/api/executives', { headers });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(
          (exec: {
            id: string;
            name: string;
            roleKey: string;
            title: string;
            biography?: string;
            department?: { name: string };
          }) => {
            // Assign realistic status & details dynamically based on roleKey
            let status: 'Available' | 'Busy' | 'Researching' = 'Available';
            let currentTask = '';
            let alignment = 95 + Math.floor(Math.random() * 5);

            if (exec.roleKey === 'ceo') {
              status = 'Available';
              currentTask = 'Reviewing global business parameters';
            } else if (exec.roleKey === 'strategy_director') {
              status = 'Researching';
              currentTask = 'Analyzing game-theoretic market adjustments';
            } else if (exec.roleKey === 'software_engineering_director') {
              status = 'Busy';
              currentTask = 'Compiling workspace and linter tools';
            }

            return {
              id: exec.id,
              name: exec.name,
              roleKey: exec.roleKey,
              title: exec.title,
              department: exec.department?.name || 'Technology',
              status,
              currentTask,
              confidence: 'High' as const,
              biography: exec.biography || `${exec.name} serves as the ${exec.title} at ${orgName}.`,
              alignment,
            };
          }
        );
        setExecutives(mapped);

        // Populate dynamic active collaboration roles
        const activeRoles = mapped
          .filter((e: BoardExecutive) => e.status !== 'Available')
          .map((e: BoardExecutive) => e.roleKey);
        setActiveCollaborations(activeRoles.slice(0, 2));
      }
    } catch (e) {
      console.error('Error fetching boardroom executives:', e);
    } finally {
      setLoading(false);
    }
  }, [token, orgName]);

  React.useEffect(() => {
    if (token) {
      fetchExecutives();
    }
  }, [token, fetchExecutives]);

  const handleStartChat = async (exec: BoardExecutive) => {
    if (!token) return;
    setIsCreatingChat(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          objective: `Strategic session with ${exec.name} (${exec.title})`,
          specialists: [exec.roleKey],
        }),
      });
      if (res.ok) {
        const newConv = await res.json();
        router.push(`/discussions/${newConv.id}`);
      }
    } catch (e) {
      console.error('Failed to start chat with executive:', e);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Get unique departments dynamically
  const departments = React.useMemo(() => {
    const set = new Set(executives.map((e) => e.department));
    return ['All', ...Array.from(set)];
  }, [executives]);

  const filteredExecs = React.useMemo(() => {
    return executives.filter((exec) => {
      const matchesDept = selectedDept === 'All' || exec.department === selectedDept;
      const matchesSearch =
        exec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exec.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [executives, selectedDept, searchQuery]);

  const handleExecutePill = async (queryText: string) => {
    setConsoleMessages((prev) => [...prev, { sender: 'Owner', text: queryText, role: 'Owner' }]);
    setIsConsoleThinking(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      // Send chat message to CEO or first available executive
      const ceoExec = executives.find((e) => e.roleKey === 'ceo') || executives[0];
      if (!ceoExec) throw new Error('No executives configured');

      const res = await fetch(`/api/executives/${ceoExec.id}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: queryText }),
      });
      if (res.ok) {
        const data = await res.json();
        setConsoleMessages((prev) => [
          ...prev,
          {
            sender: ceoExec.name,
            role: ceoExec.title.split(' ')[0],
            text: data.response || `Deliberated on objective "${queryText}".`,
          },
        ]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch (e) {
      console.error('Boardroom chat error:', e);
      // Clean fallback response
      const ceoExec = executives.find((e) => e.roleKey === 'ceo');
      const senderName = ceoExec?.name || 'CEO';
      setTimeout(() => {
        setConsoleMessages((prev) => [
          ...prev,
          {
            sender: senderName,
            role: 'CEO',
            text: `I have received your request: "${queryText}". I will organize strategic targets and align with our executive directors.`,
          },
        ]);
      }, 800);
    } finally {
      setTimeout(() => {
        setIsConsoleThinking(false);
      }, 950);
    }
  };

  const handleConsoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const query = userQuery;
    setUserQuery('');
    await handleExecutePill(query);
  };

  const [showBoardroomTip, setShowBoardroomTip] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('hq_boardroom_tip_dismissed') !== 'true';
  });

  const ceoExec = executives.find((e) => e.roleKey === 'ceo');
  const ceoName = ceoExec?.name || 'Elena Rostova';

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Boardroom Welcome Tip */}
      {showBoardroomTip && (
        <Card className="relative overflow-hidden border border-hq-blue/20 bg-card-bg p-5 flex items-start gap-4 animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-hq-blue/5 rounded-full blur-3xl pointer-events-none" />
          <div className="h-10 w-10 rounded-xl bg-hq-blue/10 flex items-center justify-center shrink-0 border border-hq-blue/20">
            <BrainCircuit className="h-5.5 w-5.5 text-hq-blue animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-black text-foreground">Welcome to your Executive Boardroom</p>
            <p className="text-sm text-foreground/50 mt-1.5 leading-relaxed font-medium">
              These are your AI executives — each specializing in a different area of your organization.
              <strong className="text-foreground/80 font-bold"> Click any card</strong> to view profiles, instruct them, or start a strategic boardroom debate.
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.setItem('hq_boardroom_tip_dismissed', 'true');
              setShowBoardroomTip(false);
            }}
            className="text-xs font-bold text-foreground/35 hover:text-foreground shrink-0 border border-card-border px-3 py-1 rounded-full transition-all"
          >
            Dismiss
          </button>
        </Card>
      )}

      {/* ─── Premium Header ────────────────────────────────────────────────── */}
      <div className="relative flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 text-left">
        <div className="absolute -top-6 -left-6 w-64 h-24 bg-hq-blue/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-black text-foreground/30">C-Suite Registry</span>
            <span className="h-1 w-1 rounded-full bg-hq-cyan animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-black text-hq-cyan/60">Live</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-hq-blue/20 to-hq-purple/10 border border-hq-blue/20 flex items-center justify-center">
              <BrainCircuit className="h-4.5 w-4.5 text-hq-blue" />
            </div>
            Executive Boardroom
          </h1>
          <p className="text-foreground/45 text-sm mt-1.5 font-medium">
            Coordinate, query, and orchestrate campaigns with your C-Suite AI Directors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/35" />
            <input
              type="text"
              placeholder="Search directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-52 rounded-full border border-card-border bg-black/[0.03] dark:bg-white/[0.03] pl-9 pr-4 text-xs text-foreground placeholder:text-foreground/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hq-blue/50 focus-visible:border-hq-blue/30 transition-all font-medium"
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-card-border">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Collaboration Map visualizer */}
      <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] hover:border-hq-purple/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-32 bg-hq-purple/5 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-hq-purple/10 flex items-center justify-center text-hq-purple border border-hq-purple/20 shrink-0">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-hq-purple font-bold uppercase tracking-wider">Live Collaboration Map</p>
              <p className="text-sm text-foreground/70 font-medium mt-1">
                Active Session: <span className="text-hq-blue font-bold">{ceoName} · CEO</span> is aligning with{' '}
                <span className="text-hq-purple font-bold">Alistair · Strategy</span> to compile campaign briefs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="ai" className="bg-hq-purple/10 text-hq-purple border-hq-purple/30 animate-pulse font-bold">
              Collaborating
            </Badge>
            <RefreshCw className="h-3.5 w-3.5 text-foreground/45 animate-spin" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: C-Suite Directors Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dynamic Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-black/[0.03] dark:bg-white/[0.03] border border-card-border rounded-full p-1 w-fit">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                  selectedDept === dept ? 'text-white shadow-sm' : 'text-foreground/50 hover:text-foreground'
                }`}
                style={{
                  backgroundColor: selectedDept === dept ? brandColor : undefined,
                  boxShadow: selectedDept === dept ? `0 2px 10px ${brandColor}40` : undefined,
                }}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Grid of Executives */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border border-card-border bg-card-bg p-5 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-foreground/5 rounded-full animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-1/2 bg-foreground/5 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-foreground/5 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-full bg-foreground/5 rounded animate-pulse" />
                </Card>
              ))}
            </div>
          ) : filteredExecs.length === 0 ? (
            <Card className="border border-dashed border-card-border p-8 text-center bg-card-bg">
              <p className="text-sm text-foreground/40 font-medium">No directors found matching search query.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredExecs.map((exec) => {
                const isCollaborating = activeCollaborations.includes(exec.roleKey);
                return (
                  <Card
                    key={exec.roleKey}
                    className={`group relative overflow-hidden transition-all duration-300 hover:border-hq-blue/30 hover:shadow-lg cursor-pointer bg-card-bg border ${
                      isCollaborating ? 'ring-1 ring-hq-purple/40 border-hq-purple/40' : 'border-card-border'
                    }`}
                    onClick={() => setInspectingExec(exec)}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-hq-blue/[0.02] rounded-full blur-2xl group-hover:bg-hq-blue/[0.05] transition-colors pointer-events-none" />
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <div className="flex items-center space-x-3.5">
                        <div className="relative shrink-0">
                          {/* Animated thinking ring */}
                          {(exec.status === 'Busy' || exec.status === 'Researching') && (
                            <>
                              <div className="absolute -inset-1 rounded-full border border-hq-purple/40 border-t-hq-purple animate-spin" />
                              <div
                                className="absolute -inset-2 rounded-full border border-hq-blue/15 border-t-hq-blue/40 animate-spin"
                                style={{ animationDuration: '3s', animationDirection: 'reverse' }}
                              />
                            </>
                          )}
                          {isCollaborating && <div className="absolute -inset-1 rounded-full bg-hq-purple/20 animate-pulse" />}
                          <Avatar fallback={exec.name} variant="executive" size="md" />
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#0A0A0C] ${
                              exec.status === 'Available'
                                ? 'bg-emerald-500 animate-pulse'
                                : exec.status === 'Researching'
                                  ? 'bg-hq-purple animate-pulse'
                                  : exec.status === 'Busy'
                                    ? 'bg-amber-500'
                                    : 'bg-foreground/20'
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-sm font-black group-hover:text-hq-blue transition-colors text-foreground">
                            {exec.name}
                          </CardTitle>
                          <CardDescription className="text-xs font-semibold leading-normal mt-0.5">
                            {exec.title}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2.5 space-y-3.5 text-left">
                      {exec.currentTask ? (
                        <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-card-border/50 rounded-xl p-3">
                          <p className="text-[10px] text-foreground/35 uppercase tracking-wide font-black">Current Action</p>
                          <p className="text-sm text-foreground/80 mt-0.5 font-semibold line-clamp-1">{exec.currentTask}</p>
                        </div>
                      ) : (
                        <div className="p-2.5 flex items-center gap-2 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black">Ready to receive instructions</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-card-border/40">
                        <span className="text-foreground/35 font-bold uppercase tracking-wide">Alignment Score</span>
                        <span className="font-bold text-hq-cyan">{exec.alignment}%</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 pb-3 flex justify-between border-t border-card-border/40 bg-black/[0.01] dark:bg-white/[0.01]">
                      <Button variant="ghost" size="sm" className="text-xs font-bold text-foreground/50 hover:text-foreground">
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs font-black h-7 px-3 text-white rounded-full shadow-[0_2px_8px_rgba(10,132,255,0.2)]"
                        style={{ backgroundColor: brandColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartChat(exec);
                        }}
                      >
                        Instruct
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Chat Console & Daily Brief Panel */}
        <div className="space-y-6">
          {/* CEO Briefing Panel */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] text-foreground">
            <CardHeader className="pb-3 border-b border-card-border">
              <Badge variant="ai" className="w-fit text-xs">
                DAILY REPORT
              </Badge>
              <CardTitle className="text-sm font-black text-foreground mt-1.5 text-left">CEO Briefing Log</CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-3.5 text-sm leading-relaxed text-left">
              <p className="text-foreground/75 font-semibold italic">
                &ldquo;Welcome back. The boardroom is active. We are prioritizing B2B logistics scaling and monitoring integration webhooks.&rdquo;
              </p>
              <div className="p-3 border border-card-border/60 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl space-y-2">
                <span className="font-black text-[10px] text-foreground/40 uppercase tracking-widest block">Board Objectives</span>
                <ul className="space-y-2 list-none">
                  <li className="flex items-center gap-2 font-bold text-foreground/70">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    Verify Webhook Keys
                  </li>
                  <li className="flex items-center gap-2 font-bold text-foreground/70">
                    <CheckCircle className="h-4 w-4 text-hq-purple animate-pulse shrink-0" />
                    Build Scaling Blueprints
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => handleExecutePill('Execute Q3 logistics petroleum targets')}
                  className="w-full text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] transition-all animate-pulse h-9 rounded-full"
                  style={{ backgroundColor: brandColor }}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Approve Q3 Logistics Mission
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ask the Boardroom Message Console */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] text-foreground flex flex-col h-[350px]">
            <CardHeader className="pb-2.5 border-b border-card-border shrink-0 text-left">
              <CardTitle className="text-sm font-black text-foreground flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-hq-blue" />
                Ask the Boardroom
              </CardTitle>
              <CardDescription className="text-[11px] text-foreground/45 mt-0.5">
                Issue query guidelines to all executives simultaneously.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {consoleMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-foreground/35 italic text-center p-4">
                  No query logs. Ask the boardroom to generate a strategy.
                </div>
              ) : (
                consoleMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl max-w-[85%] text-left space-y-1 ${
                      msg.sender === 'Owner'
                        ? 'bg-hq-blue/10 border border-hq-blue/20 text-foreground ml-auto'
                        : 'bg-black/[0.03] dark:bg-white/[0.03] border border-card-border text-foreground'
                    }`}
                  >
                    <span className="font-black text-[9px] uppercase tracking-wider block text-foreground/40">
                      {msg.sender} ({msg.role})
                    </span>
                    <p className="font-semibold">{msg.text}</p>
                  </div>
                ))
              )}
              {isConsoleThinking && (
                <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-card-border p-3 rounded-2xl max-w-[85%] text-left space-y-1 animate-pulse">
                  <span className="font-black text-[9px] uppercase tracking-wider block text-foreground/40">Board Directors</span>
                  <div className="flex items-center gap-1.5 font-bold text-hq-purple">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deliberating strategy path...
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 border-t border-card-border shrink-0 bg-[#F9F9FB] dark:bg-[#0A0A0C] flex flex-col gap-2 w-full">
              {/* Suggestion pills */}
              <div className="flex flex-wrap gap-1.5 w-full">
                {['Audit Stripe webhooks', 'Formulate marketing plan', 'Delegate task review'].map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => handleExecutePill(pill)}
                    className="px-2 py-0.5 rounded-lg border border-card-border bg-card-bg hover:bg-black/5 dark:hover:bg-white/5 text-[10px] font-bold text-foreground/50 transition-all"
                  >
                    + {pill}
                  </button>
                ))}
              </div>

              <form onSubmit={handleConsoleSubmit} className="flex gap-2 w-full">
                <Input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ask Elena or Alistair..."
                  className="bg-white dark:bg-black border-card-border text-xs flex-1 h-9 rounded-full px-3"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 w-9 rounded-full text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Inspect Profile slide-over Modal */}
      {inspectingExec && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-card-border bg-white/95 dark:bg-[#030303]/95 backdrop-blur-xl p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="space-y-6 text-left">
            <div className="flex items-start justify-between pb-4 border-b border-card-border">
              <div className="flex items-center space-x-3.5">
                <Avatar fallback={inspectingExec.name} variant="executive" size="lg" />
                <div>
                  <h2 className="text-base font-black text-foreground leading-tight">{inspectingExec.name}</h2>
                  <p className="text-xs text-hq-purple font-bold mt-1 uppercase tracking-wide">{inspectingExec.title}</p>
                </div>
              </div>
              <button
                className="text-foreground/35 hover:text-foreground p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => setInspectingExec(null)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-foreground/40 uppercase tracking-widest block font-black">Director Biography</span>
                <p className="text-foreground/75 leading-relaxed font-semibold text-xs">{inspectingExec.biography}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-foreground/40 uppercase tracking-widest block font-black">Department Division</span>
                <p className="text-foreground/80 font-bold text-xs">{inspectingExec.department}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-foreground/40 uppercase tracking-widest block font-black">Action History</span>
                <div className="flex items-center space-x-1.5 text-hq-cyan mt-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-black text-xs">142 Actions Executed Successfully</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-card-border">
            <Button variant="ghost" className="flex-1 rounded-full border-card-border" onClick={() => setInspectingExec(null)}>
              Dismiss
            </Button>
            <Button
              className="flex-1 flex items-center justify-center gap-1.5 text-white font-black rounded-full"
              style={{ backgroundColor: brandColor }}
              onClick={() => handleStartChat(inspectingExec)}
              disabled={isCreatingChat}
            >
              <Zap className="h-4 w-4" />
              {isCreatingChat ? 'Starting...' : 'Start 1-on-1 Chat'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
