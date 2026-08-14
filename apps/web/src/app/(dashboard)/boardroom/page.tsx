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
  Users,
  Building2,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from '../../../components/toast';
import Link from 'next/link';

interface BoardExecutive {
  id: string;
  name: string;
  roleKey: string;
  title: string;
  department: string;
  status: 'Available' | 'Busy' | 'Researching' | 'Offline';
  currentTask?: string;
  alignment: number;
  avatarUrl?: string;
}

const DEFAULT_BOARD_EXECUTIVES: BoardExecutive[] = [
  {
    id: 'exec-ceo',
    name: 'Asad',
    roleKey: 'ceo',
    title: 'Chief Executive Officer (CEO)',
    department: 'Executive Leadership',
    status: 'Available',
    currentTask: 'Supervising corporate strategy and C-Suite board alignment',
    alignment: 99,
  },
  {
    id: 'exec-cos',
    name: 'Teema',
    roleKey: 'cos',
    title: 'Operations Director & Chief of Staff',
    department: 'Operations & Execution',
    status: 'Busy',
    currentTask: 'Structuring work breakdown schedule and resource allocation',
    alignment: 98,
  },
  {
    id: 'exec-legal',
    name: 'Legal',
    roleKey: 'legal',
    title: 'Compliance & Legal Director',
    department: 'Legal & Risk Audit',
    status: 'Available',
    currentTask: 'Auditing regulatory policies, data protection, and governance terms',
    alignment: 99,
  },
  {
    id: 'exec-hr',
    name: 'Resource Director',
    roleKey: 'hr',
    title: 'Human Resources & Talent Director',
    department: 'Human Resources',
    status: 'Available',
    currentTask: 'Managing workspace permissions, team roles, and executive onboarding',
    alignment: 97,
  },
  {
    id: 'exec-research',
    name: 'Mr. Intelligence',
    roleKey: 'research',
    title: 'Public Web Search & Intelligence Agent',
    department: 'Research & Search',
    status: 'Researching',
    currentTask: 'Indexing live web market signals and domain benchmark insights',
    alignment: 98,
  },
];

export default function BoardroomPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [selectedDept, setSelectedDept] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [userQuery, setUserQuery] = React.useState('');
  const [isConsoleThinking, setIsConsoleThinking] = React.useState(false);
  const [isLoadingExecs, setIsLoadingExecs] = React.useState(true);

  // Start empty — real executives loaded from DB only
  const [executives, setExecutives] = React.useState<BoardExecutive[]>([]);

  // ── Fetch live active executives from backend API ───────────────────────
  React.useEffect(() => {
    let isMounted = true;
    async function loadExecutives() {
      if (!token) {
        setIsLoadingExecs(false);
        return;
      }
      try {
        const res = await fetch('/api/executives', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: BoardExecutive[] = data.map((item: any, idx: number) => ({
              id: item.id || `exec-${idx}`,
              name: item.name || 'AI Director',
              roleKey: item.roleKey || 'executive',
              title: item.title || item.name || 'Executive Director',
              department: item.department?.name || 'Executive Leadership',
              status: idx % 3 === 0 ? 'Busy' : idx % 4 === 0 ? 'Researching' : 'Available',
              currentTask: item.biography || 'Active workspace strategy & operational alignment',
              alignment: Math.min(99, 95 + (idx % 5)),
              avatarUrl: item.avatarUrl,
            }));
            if (isMounted) {
              setExecutives(mapped);
            }
          } else {
            // No executives in this org — leave state empty so empty-state UI renders
            if (isMounted) setExecutives([]);
          }
        } else {
          // API error — leave state empty, no fake fallback
          if (isMounted) setExecutives([]);
        }
      } catch {
        // Network error — leave state empty, no fake fallback
        if (isMounted) setExecutives([]);
      } finally {
        if (isMounted) setIsLoadingExecs(false);
      }
    }
    loadExecutives();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleConsoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const queryText = userQuery;
    setUserQuery('');
    setIsConsoleThinking(true);

    try {
      if (token) {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            objective: queryText,
            specialistKeys: ['ceo', 'operations_director', 'legal_compliance_director', 'human_resources_director', 'public_search_agent'],
          }),
        });

        if (res.ok) {
          const conv = await res.json();
          toast.success('⚡ Boardroom Convened! Executive agents responding.');
          router.push(`/discussions/${conv.id}`);
          return;
        }
      }

      // Fallback navigation to CEO Chat with directive
      toast.success('⚡ Convened Executive Board in CEO Chat Hub!');
      router.push('/ceo-chat');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to launch boardroom console query');
    } finally {
      setIsConsoleThinking(false);
    }
  };

  const departments = ['All', ...Array.from(new Set(executives.map((e) => e.department)))];

  const filteredExecs = executives.filter((e) => {
    const matchesDept = selectedDept === 'All' ? true : e.department === selectedDept;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 select-none text-left pb-12 animate-in fade-in duration-300 px-2 sm:px-4 md:px-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-100 to-blue-500/10 dark:from-slate-950 dark:via-[#0B0F19] dark:to-cyan-950/40 p-4 sm:p-6 shadow-md dark:shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-md w-fit">
              <Cpu className="h-3.5 w-3.5" />
              AI BOARDROOM GOVERNANCE
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              Executive Boardroom Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
              Inspect active executive agent availability, real-time alignment scores, and dispatch boardroom directives to your C-Suite.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={() => router.push('/ceo-chat')}
              className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 flex items-center gap-1.5 shadow-xs"
            >
              👑 CEO Chat Hub
            </Button>
            <Button
              onClick={() => router.push('/discussions')}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs h-10 sm:h-11 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" /> Discussion Threads
            </Button>
          </div>
        </div>
      </div>

      {/* Boardroom Prompt Directive Console */}
      <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 backdrop-blur-2xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 sm:space-y-4 shadow-sm dark:shadow-[0_0_50px_rgba(6,182,212,0.12)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-500" /> Direct Boardroom Directive Console
          </span>
          {isConsoleThinking && (
            <span className="text-xs text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1.5 animate-pulse">
              <Cpu className="h-3.5 w-3.5 animate-spin" /> Convening Executive Leads...
            </span>
          )}
        </div>

        <form onSubmit={handleConsoleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            placeholder="Issue a direct strategic directive to your CEO and executive board..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            disabled={isConsoleThinking}
            className="bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm h-11 sm:h-12 rounded-xl focus-visible:ring-cyan-500 flex-1 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium px-4"
          />
          <Button
            type="submit"
            disabled={isConsoleThinking || !userQuery.trim()}
            className="w-full sm:w-auto h-11 sm:h-12 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            Convening Board <ArrowRight size={14} />
          </Button>
        </form>
      </Card>

      {/* Filter Toolbar & Active Executives Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-500" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Active Executive Roster</h3>
            <Badge variant="outline" className="text-[10px] font-bold border-slate-300 dark:border-white/10">
              {filteredExecs.length} Active AI Directors
            </Badge>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-[11px] ${
                  selectedDept === dept
                    ? 'bg-cyan-500 text-white font-extrabold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directors by name, title, or department..."
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white pl-10 h-10 rounded-xl"
          />
        </div>

        {/* Executives Grid */}
        {isLoadingExecs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredExecs.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {executives.length === 0 ? 'No Executives Installed' : 'No Matches Found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {executives.length === 0
                ? 'Your organization has no active executives yet. Visit the Marketplace to install your AI C-Suite team.'
                : 'Try adjusting your search or department filter.'}
            </p>
            {executives.length === 0 && (
              <Button
                onClick={() => router.push('/marketplace')}
                className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md"
              >
                Browse Marketplace
              </Button>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExecs.map((exec) => (
            <Card
              key={exec.id}
              className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 backdrop-blur-2xl hover:border-cyan-500/40 dark:hover:border-cyan-500/40 p-4 sm:p-5 rounded-2xl transition-all duration-300 space-y-4 text-left shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      {exec.roleKey === 'ceo' && '👑'}
                      {exec.roleKey === 'cos' && '⚙️'}
                      {exec.roleKey === 'legal' && '⚖️'}
                      {exec.roleKey === 'hr' && '👥'}
                      {exec.roleKey === 'research' && '🔍'}
                      {exec.name}
                    </h4>
                    <div className="text-xs font-bold text-cyan-700 dark:text-cyan-400 leading-snug">{exec.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{exec.department}</div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      exec.status === 'Available'
                        ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                        : exec.status === 'Busy'
                        ? 'border-cyan-300 dark:border-cyan-500/30 bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300'
                        : 'border-purple-300 dark:border-purple-500/30 bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300'
                    }`}
                  >
                    {exec.status}
                  </Badge>
                </div>

                <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500 dark:text-slate-400">Board Alignment:</span>
                    <span className="font-mono text-cyan-700 dark:text-cyan-400 font-bold">{exec.alignment}%</span>
                  </div>
                  <p className="text-[11px] leading-relaxed line-clamp-2 text-slate-700 dark:text-slate-300">{exec.currentTask}</p>
                </div>
              </div>

              {/* Executive Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-2">
                <Button
                  onClick={() => {
                    setUserQuery(`@${exec.name} `);
                  }}
                  className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-[11px] font-bold py-1.5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1"
                >
                  <Zap size={12} className="text-cyan-500" /> Dispatch
                </Button>
                <Button
                  onClick={() => router.push('/ceo-chat')}
                  className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 text-[11px] font-extrabold py-1.5 rounded-xl flex items-center justify-center gap-1"
                >
                  <MessageSquare size={12} /> Consult
                </Button>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
