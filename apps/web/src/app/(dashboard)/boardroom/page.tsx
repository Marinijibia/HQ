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
  Cpu,
  Sparkles,
  Shield,
  Rocket,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from '../../../components/toast';

interface BoardExecutive {
  id: string;
  name: string;
  roleKey: string;
  title: string;
  department: string;
  status: 'Available' | 'Busy' | 'Researching' | 'Offline';
  currentTask?: string;
  alignment: number;
}

export default function BoardroomPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [selectedDept, setSelectedDept] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [userQuery, setUserQuery] = React.useState('');
  const [isConsoleThinking, setIsConsoleThinking] = React.useState(false);

  const [executives, setExecutives] = React.useState<BoardExecutive[]>([
    {
      id: 'exec-ceo',
      name: 'Elena Rostova',
      roleKey: 'ceo',
      title: 'Chief Executive Officer (CEO)',
      department: 'Executive Leadership',
      status: 'Available',
      currentTask: 'Supervising corporate strategy and board alignment',
      alignment: 99,
    },
    {
      id: 'exec-cto',
      name: 'Marcus Vance',
      roleKey: 'cto',
      title: 'Chief Technology Officer (CTO)',
      department: 'Engineering & IT',
      status: 'Busy',
      currentTask: 'Enforcing type safety, compiler performance, and schema validation',
      alignment: 98,
    },
    {
      id: 'exec-cmo',
      name: 'Sophia Chen',
      roleKey: 'cmo',
      title: 'Chief Marketing Officer (CMO)',
      department: 'Sales & Marketing',
      status: 'Available',
      currentTask: 'Optimizing B2B conversion funnels and brand positioning',
      alignment: 96,
    },
    {
      id: 'exec-cfo',
      name: 'Arthur Pendelton',
      roleKey: 'cfo',
      title: 'Chief Financial Officer (CFO)',
      department: 'Executive Leadership',
      status: 'Researching',
      currentTask: 'Auditing SaaS margins and credit billing transactions',
      alignment: 97,
    },
    {
      id: 'exec-cro',
      name: 'Victor Vance',
      roleKey: 'cro',
      title: 'Chief Revenue Officer (CRO)',
      department: 'Sales & Marketing',
      status: 'Available',
      currentTask: 'Structuring enterprise sales pipelines and client accounts',
      alignment: 95,
    },
    {
      id: 'exec-coo',
      name: 'Diane Sterling',
      roleKey: 'coo',
      title: 'Chief Operating Officer (COO)',
      department: 'Executive Leadership',
      status: 'Busy',
      currentTask: 'Mitigating operational risk and reviewing SOC2 controls',
      alignment: 98,
    },
  ]);

  const handleConsoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || !token) return;

    const queryText = userQuery;
    setUserQuery('');
    setIsConsoleThinking(true);

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          objective: queryText,
          specialistKeys: ['ceo', 'cto', 'cfo'],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to convene boardroom');
      }

      const conv = await res.json();
      toast.success('⚡ Boardroom Convened! Executive agents responding.');
      router.push(`/discussions/${conv.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to launch boardroom console query');
    } finally {
      setIsConsoleThinking(false);
    }
  };

  const filteredExecs = executives.filter((e) => {
    const matchesDept = selectedDept === 'All' ? true : e.department === selectedDept;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-8 select-none text-foreground pb-12 animate-in fade-in duration-500 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
            <Cpu className="h-3.5 w-3.5" />
            AI BOARDROOM GOVERNANCE
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-2.5">
            Executive Boardroom Console
          </h1>
          <p className="text-xs text-slate-600 dark:text-foreground/50 leading-relaxed max-w-xl font-medium">
            Inspect executive agent availability, alignment scores, and dispatch real-time boardroom directives.
          </p>
        </div>

        <Button
          onClick={() => router.push('/discussions')}
          className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs h-11 px-6 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" /> Open Discussion Threads
        </Button>
      </div>

      {/* Boardroom Prompt Directive Console */}
      <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/90 backdrop-blur-3xl p-6 rounded-3xl space-y-4 shadow-sm dark:shadow-[0_0_50px_rgba(6,182,212,0.12)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Direct Boardroom Directive Console
          </span>
          {isConsoleThinking && (
            <span className="text-xs text-cyan-600 dark:text-cyan-300 font-bold flex items-center gap-1.5 animate-pulse">
              <Cpu className="h-3.5 w-3.5 animate-spin" /> Convening Executive Leads...
            </span>
          )}
        </div>

        <form onSubmit={handleConsoleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            placeholder="Issue a direct directive to your Chief Executive Officer and executive board..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            disabled={isConsoleThinking}
            className="bg-slate-50 dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm h-12 rounded-xl focus-visible:ring-cyan-500 flex-1 placeholder:text-slate-400 font-medium"
          />
          <Button
            type="submit"
            disabled={isConsoleThinking || !userQuery.trim()}
            className="w-full sm:w-auto h-12 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            Convening Board &rarr;
          </Button>
        </form>
      </Card>

      {/* Executives Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Executive Roster</h3>
          <span className="text-xs text-slate-500 font-bold">6 Certified AI Directors</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExecs.map((exec) => (
            <Card
              key={exec.id}
              className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 backdrop-blur-2xl hover:border-cyan-500/40 p-5 rounded-2xl transition-all duration-300 space-y-4 text-left shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{exec.name}</h4>
                  <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{exec.title}</div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    exec.status === 'Available'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : exec.status === 'Busy'
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300'
                      : 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300'
                  }`}
                >
                  {exec.status}
                </Badge>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-slate-500">Alignment Score:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{exec.alignment}%</span>
                </div>
                <p className="text-[11px] leading-relaxed line-clamp-2">{exec.currentTask}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
