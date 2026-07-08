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
} from '@hq/ui';
import { Search, SlidersHorizontal, BrainCircuit, Activity, CheckCircle, Zap } from 'lucide-react';

interface BoardExecutive {
  name: string;
  roleKey: string;
  title: string;
  department: string;
  status: 'Available' | 'Busy' | 'Researching' | 'Offline';
  currentTask?: string;
  confidence: 'High' | 'Medium' | 'Low';
  biography: string;
}

const seededExecutives: BoardExecutive[] = [
  {
    name: 'Elena Rostova',
    roleKey: 'ceo',
    title: 'Chief Executive Officer (CEO)',
    department: 'Executive Office',
    status: 'Available',
    currentTask: 'Evaluating global operational targets',
    confidence: 'High',
    biography:
      'Elena is a visionary leader specializing in global operational scale and autonomous system alignment.',
  },
  {
    name: 'Morgan Vance',
    roleKey: 'vision_director',
    title: 'Vision Director',
    department: 'Executive Office',
    status: 'Available',
    confidence: 'High',
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
    biography:
      'Jack defends networks, manages HMAC signature decoders, and verifies authentication guards.',
  },
];

export default function BoardroomPage() {
  const [selectedDept, setSelectedDept] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [inspectingExec, setInspectingExec] = React.useState<BoardExecutive | null>(null);

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

  return (
    <div className="space-y-8 select-none">
      {/* Header and Title */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-hq-blue" />
            Executive Boardroom
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Coordinate, query, and review activities of your C-Suite AI Directors.
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
              className="h-9 w-60 rounded-md border border-hq-graphite/40 bg-hq-graphite/30 pl-9 pr-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hq-blue"
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thinking Indicator Banner */}
      <Card className="border border-hq-purple/30 bg-hq-purple/5 shadow-level-5 animate-pulse">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-hq-purple/20 flex items-center justify-center text-hq-purple">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-hq-purple font-semibold uppercase tracking-wider">
                Active Board Alignment
              </p>
              <p className="text-sm text-foreground/80 font-medium">
                CEO Elena is syncing with Alistair to compile Q3 strategic priorities.
              </p>
            </div>
          </div>
          <Badge variant="ai">Thinking</Badge>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedDept === dept
                ? 'bg-hq-blue text-white shadow'
                : 'bg-hq-graphite/40 border border-hq-graphite/20 hover:bg-hq-graphite/60 text-foreground/75'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Grid of Executives */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExecs.map((exec) => (
          <Card
            key={exec.roleKey}
            className="hover:border-hq-blue/50 transition-all cursor-pointer hover:shadow-level-2 group"
            onClick={() => setInspectingExec(exec)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <Avatar fallback={exec.name} variant="executive" size="md" />
                <div>
                  <CardTitle className="text-base group-hover:text-hq-blue transition-colors">
                    {exec.name}
                  </CardTitle>
                  <CardDescription className="text-[11px] leading-tight mt-0.5">
                    {exec.title}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={
                  exec.status === 'Available'
                    ? 'success'
                    : exec.status === 'Busy'
                      ? 'warning'
                      : 'info'
                }
              >
                {exec.status}
              </Badge>
            </CardHeader>
            <CardContent className="py-4 space-y-3">
              {exec.currentTask ? (
                <div className="bg-hq-graphite/20 border border-hq-graphite/30 rounded p-2 text-xs">
                  <p className="text-[10px] text-foreground/45 uppercase tracking-wider font-semibold">
                    Active Run
                  </p>
                  <p className="text-foreground/80 mt-0.5 line-clamp-1">{exec.currentTask}</p>
                </div>
              ) : (
                <div className="p-2 text-xs text-foreground/40 italic">
                  Idle - Ready to be assigned
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-foreground/45">Department</span>
                <span className="font-semibold text-foreground/80">{exec.department}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/45">Confidence Index</span>
                <Badge variant={exec.confidence === 'High' ? 'success' : 'warning'}>
                  {exec.confidence}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between border-t border-hq-graphite/20">
              <Button variant="ghost" size="sm" className="text-xs">
                View Profile
              </Button>
              <Button variant="primary" size="sm" className="text-xs h-7 px-3">
                Instruct
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Inspect Profile slide-over Modal */}
      {inspectingExec && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-hq-graphite/40 bg-hq-graphite/95 p-6 shadow-level-4 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar fallback={inspectingExec.name} variant="executive" size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {inspectingExec.name}
                  </h2>
                  <p className="text-xs text-hq-purple font-semibold">{inspectingExec.title}</p>
                </div>
              </div>
              <button
                className="text-foreground/50 hover:text-foreground"
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

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-foreground/45 uppercase tracking-wider block font-semibold">
                  Biography
                </span>
                <p className="text-foreground/80 mt-1 leading-relaxed">
                  {inspectingExec.biography}
                </p>
              </div>
              <div>
                <span className="text-xs text-foreground/45 uppercase tracking-wider block font-semibold">
                  Department
                </span>
                <p className="text-foreground/85 mt-0.5">{inspectingExec.department}</p>
              </div>
              <div>
                <span className="text-xs text-foreground/45 uppercase tracking-wider block font-semibold">
                  Decisions Handled
                </span>
                <div className="flex items-center space-x-1.5 text-hq-cyan mt-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold text-xs">142 Actions Executed Successfully</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-hq-graphite/40">
            <Button variant="secondary" className="flex-1" onClick={() => setInspectingExec(null)}>
              Dismiss
            </Button>
            <Button variant="accent" className="flex-1 flex items-center justify-center gap-1.5">
              <Zap className="h-4 w-4" />
              Direct Command
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
