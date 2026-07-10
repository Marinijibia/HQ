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
  RefreshCw,
} from 'lucide-react';

interface BoardExecutive {
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
  const [selectedDept, setSelectedDept] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [inspectingExec, setInspectingExec] = React.useState<BoardExecutive | null>(null);

  // Dynamic state for Ask the Boardroom console
  const [userQuery, setUserQuery] = React.useState('');
  const [isConsoleThinking, setIsConsoleThinking] = React.useState(false);
  const [consoleMessages, setConsoleMessages] = React.useState<
    Array<{ sender: string; text: string; role: string }>
  >([]);
  const [activeCollaborations, setActiveCollaborations] = React.useState<string[]>([
    'ceo',
    'strategy_director',
  ]);

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

  const seededExecutives: BoardExecutive[] = [
    {
      name: ceoName,
      roleKey: 'ceo',
      title: 'Chief Executive Officer (CEO)',
      department: 'Executive Office',
      status: 'Available',
      currentTask: 'Evaluating global operational targets',
      confidence: 'High',
      alignment: 99,
      biography: `${ceoName} is a visionary leader specializing in global operational scale and autonomous system alignment.`,
    },
    {
      name: 'Morgan Vance',
      roleKey: 'vision_director',
      title: 'Vision Director',
      department: 'Executive Office',
      status: 'Available',
      confidence: 'High',
      alignment: 95,
      biography:
        'Morgan focuses on multi-decade organizational trajectories and innovative future-proofing.',
    },
    {
      name: 'Alistair Thorne',
      roleKey: 'strategy_director',
      title: 'Strategy Director',
      department: 'Executive Office',
      status: 'Researching',
      currentTask: 'Analyzing game-theoretic market adjustments',
      confidence: 'High',
      alignment: 97,
      biography:
        'Alistair is an expert in game-theoretic corporate positioning and capital allocation strategies.',
    },
    {
      name: 'Dr. Hiroshi Tanaka',
      roleKey: 'technology_director',
      title: 'Technology Director (CTO)',
      department: 'Technology',
      status: 'Available',
      confidence: 'High',
      alignment: 94,
      biography:
        'Hiroshi has spent 20 years engineering distributed microservices and scalable cloud run environments.',
    },
    {
      name: 'Linus Kovacs',
      roleKey: 'software_engineering_director',
      title: 'Software Engineering Director',
      department: 'Technology',
      status: 'Busy',
      currentTask: 'Compiling Yarn workspace and lint configurations',
      confidence: 'High',
      alignment: 98,
      biography:
        'Linus is a compiler optimization engineer who loves clean, typed, modular code architectures.',
    },
    {
      name: 'Dr. Sarah Ndiaye',
      roleKey: 'ai_ml_director',
      title: 'AI & Machine Learning Director',
      department: 'Technology',
      status: 'Busy',
      currentTask: 'Testing context retrieval embeddings key',
      confidence: 'High',
      alignment: 96,
      biography:
        'Sarah specializes in transformer evaluations, context optimization, and retrieval-augmented generation.',
    },
    {
      name: 'Clara Oswald',
      roleKey: 'data_analytics_director',
      title: 'Data & Analytics Director',
      department: 'Technology',
      status: 'Available',
      confidence: 'Medium',
      alignment: 91,
      biography:
        'Clara specializes in pipeline instrumentation, vector embeddings, and dashboard metric ingestion.',
    },
    {
      name: 'Sienna Brooks',
      roleKey: 'ux_ui_design_director',
      title: 'UX/UI Design Director',
      department: 'Product & Design',
      status: 'Available',
      confidence: 'High',
      alignment: 97,
      biography:
        'Sienna is a designer devoted to glassmorphism, responsive styles, and micro-animations.',
    },
    {
      name: 'Sophia Sterling',
      roleKey: 'finance_director',
      title: 'Finance Director (CFO)',
      department: 'Finance',
      status: 'Available',
      confidence: 'High',
      alignment: 95,
      biography:
        'Sophia is a quantitative analyst managing corporate ledgers and Stripe billing events.',
    },
    {
      name: 'Jack Bauer',
      roleKey: 'security_director',
      title: 'Security Director (CISO)',
      department: 'Legal & Compliance',
      status: 'Available',
      currentTask: 'Verifying auth guard tokens validity',
      confidence: 'High',
      alignment: 98,
      biography:
        'Jack defends networks, manages HMAC signature decoders, and verifies authentication guards.',
    },
  ];

  const departments = [
    'All',
    'Executive Office',
    'Technology',
    'Product & Design',
    'Finance',
    'Legal & Compliance',
  ];

  const filteredExecs = seededExecutives.filter((exec) => {
    const matchesDept = selectedDept === 'All' || exec.department === selectedDept;
    const matchesSearch =
      exec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exec.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleExecutePill = (queryText: string) => {
    setConsoleMessages((prev) => [...prev, { sender: 'Owner', text: queryText, role: 'Owner' }]);
    setIsConsoleThinking(true);
    setTimeout(() => {
      setConsoleMessages((prev) => [
        ...prev,
        {
          sender: ceoName,
          role: 'CEO',
          text: `Owner, I am initiating task deliberation on "${queryText}". The corresponding parameters have been delegated to relevant C-Suite directors.`,
        },
      ]);
      setIsConsoleThinking(false);
      setActiveCollaborations(['strategy_director', 'software_engineering_director']);
    }, 2000);
  };

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const query = userQuery;
    setUserQuery('');
    setConsoleMessages((prev) => [...prev, { sender: 'Owner', text: query, role: 'Owner' }]);
    setIsConsoleThinking(true);

    // Simulate boardroom agents exchanging data and formulating a response plan
    setTimeout(() => {
      // CEO responds back
      setConsoleMessages((prev) => [
        ...prev,
        {
          sender: ceoName,
          role: 'CEO',
          text: `Owner, I have received your request. I am convening Alistair (Strategy) and Linus (Tech) to formulate a blueprint. Direct actions have been seeded into the backlog.`,
        },
      ]);
      setIsConsoleThinking(false);
      // Update active connection paths to Strategy & Tech
      setActiveCollaborations(['strategy_director', 'software_engineering_director']);
    }, 2000);
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Header and Title */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-hq-blue" />
            Executive Boardroom
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Coordinate, query, and review activities of your C-Suite AI Directors in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/45" />
            <input
              type="text"
              placeholder="Search Directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-60 rounded-md border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] pl-9 pr-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hq-blue"
            />
          </div>
          <Button variant="outline" size="icon" className="border-card-border">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dynamic Collaboration visualizer banner */}
      <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
        <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-hq-purple/10 flex items-center justify-center text-hq-purple border border-hq-purple/20">
              <Activity className="h-5.5 w-5.5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-hq-purple font-bold uppercase tracking-wider">
                Live Collaboration Map
              </p>
              <p className="text-sm text-foreground/80 font-medium mt-0.5">
                Active Path: <span className="text-hq-blue font-bold">{ceoName} (CEO)</span> is
                aligning with <span className="text-hq-purple font-bold">Alistair (Strategy)</span>{' '}
                to compile daily briefings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="ai"
              className="bg-hq-purple/10 text-hq-purple border-hq-purple/30 animate-pulse font-bold"
            >
              Collaborating
            </Badge>
            <RefreshCw className="h-4 w-4 text-foreground/45 animate-spin" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: C-Suite Directors Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  selectedDept === dept
                    ? 'text-white border-transparent'
                    : 'bg-card-bg border-card-border hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 text-foreground/75'
                }`}
                style={{
                  backgroundColor: selectedDept === dept ? brandColor : undefined,
                  boxShadow: selectedDept === dept ? `0 4px 15px ${brandColor}2b` : undefined,
                }}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Grid of Executives */}
          <div className="grid gap-5 md:grid-cols-2">
            {filteredExecs.map((exec) => {
              const isCollaborating = activeCollaborations.includes(exec.roleKey);
              return (
                <Card
                  key={exec.roleKey}
                  className={`hover:border-hq-blue/50 transition-all cursor-pointer hover:shadow-lg group bg-card-bg border ${
                    isCollaborating
                      ? 'ring-2 ring-hq-purple/40 border-hq-purple'
                      : 'border-card-border'
                  }`}
                  onClick={() => setInspectingExec(exec)}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar fallback={exec.name} variant="executive" size="md" />
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#0A0A0C] ${
                            exec.status === 'Available'
                              ? 'bg-emerald-500 animate-pulse'
                              : exec.status === 'Researching'
                                ? 'bg-hq-purple'
                                : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold group-hover:text-hq-blue transition-colors text-[#1A1A1E] dark:text-white">
                          {exec.name}
                        </CardTitle>
                        <CardDescription className="text-[10px] leading-tight mt-0.5 font-medium">
                          {exec.title}
                        </CardDescription>
                      </div>
                    </div>
                    {isCollaborating && (
                      <Badge
                        variant="ai"
                        className="bg-hq-purple/10 text-hq-purple border-hq-purple/30 text-[9px] animate-pulse"
                      >
                        Active
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="py-3.5 space-y-3">
                    {exec.currentTask ? (
                      <div className="bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border rounded-xl p-2.5 text-xs">
                        <p className="text-[9px] text-foreground/45 uppercase tracking-wider font-bold">
                          Current Action
                        </p>
                        <p className="text-foreground/80 mt-0.5 line-clamp-1 font-semibold">
                          {exec.currentTask}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 text-xs text-foreground/40 italic">
                        Idle - Ready to delegate
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-card-border/50">
                      <span className="text-foreground/45 font-medium">Alignment Score</span>
                      <span className="font-bold text-hq-cyan">{exec.alignment}%</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between border-t border-card-border/50">
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold">
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      className="text-[10px] font-bold h-7 px-3 text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      Instruct
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive C-Suite Chat Console & Briefing Panel */}
        <div className="space-y-6">
          {/* Dynamic Daily Brief Panel */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] text-foreground">
            <CardHeader className="pb-3 border-b border-card-border">
              <Badge variant="ai" className="w-fit text-[10px]">
                DAILY REPORT
              </Badge>
              <CardTitle className="text-md font-extrabold text-[#1A1A1E] dark:text-white mt-1">
                CEO Briefing Log
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-3.5 text-xs leading-relaxed text-left">
              <p className="text-foreground/85 font-medium italic">
                &ldquo;Welcome back, Owner. The boardroom is active. We are prioritizing B2B
                logistic targets and monitoring Stripe gateway hooks.&rdquo;
              </p>
              <div className="p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-xl space-y-2">
                <span className="font-bold text-[10px] text-foreground/45 uppercase tracking-wider">
                  Board Objectives
                </span>
                <ul className="space-y-1.5 list-none">
                  <li className="flex items-center gap-1.5 font-bold text-foreground/75">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    Verify Webhook Keys
                  </li>
                  <li className="flex items-center gap-1.5 font-bold text-foreground/75">
                    <CheckCircle className="h-3.5 w-3.5 text-hq-purple animate-pulse" />
                    Build Scaling Blueprints
                  </li>
                </ul>
              </div>
              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => handleExecutePill('Execute corporate Q3 petroleum targets')}
                  className="w-full text-[10px] font-bold text-white flex items-center justify-center gap-1 shadow-md hover:scale-[1.01] transition-all animate-pulse"
                  style={{ backgroundColor: brandColor }}
                >
                  <Zap className="h-3 w-3" />
                  Approve Q3 Logistics Mission
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ask the Boardroom Message Console */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] text-foreground flex flex-col h-[350px]">
            <CardHeader className="pb-2.5 border-b border-card-border shrink-0">
              <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-hq-blue" />
                Ask the Boardroom
              </CardTitle>
              <CardDescription className="text-[10px]">
                Issue direct instructions or queries to the board.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {consoleMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-foreground/40 italic text-center p-4">
                  No query logs. Ask the boardroom to generate a strategy.
                </div>
              ) : (
                consoleMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl max-w-[90%] text-left space-y-1 ${
                      msg.sender === 'Owner'
                        ? 'bg-hq-blue/10 border border-hq-blue/20 text-foreground ml-auto'
                        : 'bg-black/5 dark:bg-[#1E1E24]/30 border border-card-border text-foreground'
                    }`}
                  >
                    <span className="font-bold text-[9px] uppercase tracking-wider block text-foreground/45">
                      {msg.sender} ({msg.role})
                    </span>
                    <p className="font-medium">{msg.text}</p>
                  </div>
                ))
              )}
              {isConsoleThinking && (
                <div className="bg-black/5 dark:bg-[#1E1E24]/30 border border-card-border p-3 rounded-2xl max-w-[90%] text-left space-y-1 animate-pulse">
                  <span className="font-bold text-[9px] uppercase tracking-wider block text-foreground/45">
                    Board Directors
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-hq-purple">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Deliberating strategy...
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-3 border-t border-card-border shrink-0 bg-[#F9F9FB] dark:bg-[#0A0A0C] flex flex-col gap-2 w-full">
              {/* Usability Suggestion Pills */}
              <div className="flex flex-wrap gap-1.5 w-full">
                {['Audit Stripe webhooks', 'Formulate marketing plan', 'Delegate task review'].map(
                  (pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => handleExecutePill(pill)}
                      className="px-2 py-0.5 rounded-lg border border-card-border bg-card-bg hover:bg-black/5 dark:hover:bg-white/5 text-[9px] font-bold text-foreground/60 transition-all"
                    >
                      + {pill}
                    </button>
                  ),
                )}
              </div>

              <form onSubmit={handleConsoleSubmit} className="flex gap-2 w-full">
                <Input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="e.g. Audit checkout security hooks..."
                  className="bg-white dark:bg-black border-card-border text-xs flex-1 h-9"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-3 text-white flex items-center justify-center"
                  style={{ backgroundColor: brandColor }}
                >
                  <ArrowRight className="h-4.5 w-4.5" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Inspect Profile slide-over Modal */}
      {inspectingExec && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-card-border bg-[#F9F9FB]/95 dark:bg-[#030303]/95 backdrop-blur-xl p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-card-border">
              <div className="flex items-center space-x-3.5">
                <Avatar fallback={inspectingExec.name} variant="executive" size="lg" />
                <div>
                  <h2 className="text-lg font-extrabold text-[#1A1A1E] dark:text-white leading-tight">
                    {inspectingExec.name}
                  </h2>
                  <p className="text-xs text-hq-purple font-bold mt-0.5">{inspectingExec.title}</p>
                </div>
              </div>
              <button
                className="text-foreground/50 hover:text-foreground p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                onClick={() => setInspectingExec(null)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 text-sm text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-bold">
                  Director Bio
                </span>
                <p className="text-foreground/80 leading-relaxed font-semibold text-xs">
                  {inspectingExec.biography}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-bold">
                  Department Division
                </span>
                <p className="text-foreground/85 font-semibold text-xs">
                  {inspectingExec.department}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-foreground/45 uppercase tracking-wider block font-bold">
                  Action History
                </span>
                <div className="flex items-center space-x-1.5 text-hq-cyan mt-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-bold text-xs">142 Actions Executed Successfully</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-card-border">
            <Button variant="secondary" className="flex-1" onClick={() => setInspectingExec(null)}>
              Dismiss
            </Button>
            <Button
              className="flex-1 flex items-center justify-center gap-1.5 text-white"
              style={{ backgroundColor: brandColor }}
            >
              <Zap className="h-4 w-4" />
              Direct Command
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
