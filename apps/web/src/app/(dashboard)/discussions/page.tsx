'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button, Badge, Input } from '@hq/ui';
import {
  Search,
  MessageSquare,
  Pin,
  Archive,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Loader2,
  Rocket,
  Users,
  X,
  Plus,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  isPinned: boolean;
  isArchived: boolean;
  missionId?: string | null;
}

export default function DiscussionsPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Tab & search states
  const [activeTab, setActiveTab] = React.useState<'recent' | 'pinned' | 'archived'>('recent');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showStartModal, setShowStartModal] = React.useState(false);

  // Form states
  const [objective, setObjective] = React.useState('');
  const [selectedExecRoles, setSelectedExecRoles] = React.useState<string[]>(['ceo', 'cto']);
  const [starting, setStarting] = React.useState(false);

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchConversations = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      let url = '/api/conversations';
      const params = [];
      if (activeTab === 'pinned') params.push('isPinned=true');
      if (activeTab === 'archived') params.push('isArchived=true');
      else params.push('isArchived=false');

      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);

      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching conversations:', e);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, searchQuery]);

  React.useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, activeTab, searchQuery, fetchConversations]);

  const handleToggleExecRole = (roleKey: string) => {
    setSelectedExecRoles((prev) =>
      prev.includes(roleKey) ? prev.filter((r) => r !== roleKey) : [...prev, roleKey]
    );
  };

  const handleStartDiscussion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!objective.trim()) {
      toast.error('Please enter an objective or strategy topic.');
      return;
    }
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    setStarting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          objective,
          specialistKeys: selectedExecRoles,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to start boardroom discussion');
      }

      const newConv = await res.json();
      toast.success('💬 Boardroom Discussion Initiated! Executive responses dispatched.');
      setShowStartModal(false);
      setObjective('');

      if (newConv.id) {
        router.push(`/discussions/${newConv.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error starting discussion');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12 animate-in fade-in duration-500 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
            <MessageSquare className="h-3.5 w-3.5" />
            EXECUTIVE BOARDROOM DISCUSSIONS
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-foreground flex items-center gap-2.5">
            Boardroom Deliberation Threads
          </h1>
          <p className="text-xs text-slate-600 dark:text-foreground/50 leading-relaxed max-w-xl font-medium">
            Consult your AI Executive Board in familiar, intuitive deliberation threads with rank-first titles.
          </p>
        </div>

        <Button
          onClick={() => setShowStartModal(true)}
          className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs h-11 px-6 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Start New Discussion
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-card-border pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 w-full sm:w-auto">
          {[
            { id: 'recent', label: 'Recent Discussions' },
            { id: 'pinned', label: 'Pinned Threads' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-blue-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-foreground/50 hover:text-slate-900 dark:hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-foreground/40 text-xs h-10 rounded-xl focus-visible:ring-cyan-500"
          />
        </div>
      </div>

      {/* Discussion List Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mx-auto" />
          <p className="text-xs text-foreground/60 font-semibold">Loading Boardroom Threads...</p>
        </div>
      ) : conversations.length === 0 ? (
        <Card className="border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg/60 p-12 text-center rounded-3xl space-y-4 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mx-auto">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-foreground">No Discussions Found</h3>
            <p className="text-xs text-slate-600 dark:text-foreground/50 max-w-sm mx-auto">
              Initiate a boardroom topic to consult your Chief Executive Officer and specialized board leads.
            </p>
          </div>
          <Button
            onClick={() => setShowStartModal(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs h-10 px-5 rounded-xl"
          >
            Start First Discussion
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversations.map((c) => (
            <Card
              key={c.id}
              onClick={() => router.push(`/discussions/${c.id}`)}
              className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 backdrop-blur-2xl hover:border-cyan-500/40 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    BOARDROOM THREAD
                  </Badge>
                  <span className="text-[10px] text-slate-500 dark:text-foreground/45">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {c.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                <span>Elena Rostova (Chief Executive Officer) & Board</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Thread <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Start Discussion Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in">
          <Card className="w-full max-w-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10] p-6 rounded-3xl space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowStartModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                BOARDROOM DELIBERATION WIZARD
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Start Executive Discussion</h2>
              <p className="text-xs text-slate-600 dark:text-foreground/50 font-medium">
                Specify your objective to consult your executive leads.
              </p>
            </div>

            <form onSubmit={handleStartDiscussion} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Strategic Objective / Business Topic *</label>
                <Input
                  placeholder="e.g. Formulate Q3 marketing strategy, audit billing API security, and optimize revenue pipelines"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs h-12 focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Select Executive Board Participants</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'ceo', name: 'Elena Rostova', title: 'Chief Executive Officer (CEO)' },
                    { key: 'cto', name: 'Marcus Vance', title: 'Chief Technology Officer (CTO)' },
                    { key: 'cmo', name: 'Sophia Chen', title: 'Chief Marketing Officer (CMO)' },
                    { key: 'cfo', name: 'Arthur Pendelton', title: 'Chief Financial Officer (CFO)' },
                    { key: 'cro', name: 'Victor Vance', title: 'Chief Revenue Officer (CRO)' },
                    { key: 'coo', name: 'Diane Sterling', title: 'Chief Operating Officer (COO)' },
                  ].map((exec) => {
                    const isSelected = selectedExecRoles.includes(exec.key);
                    return (
                      <button
                        key={exec.key}
                        type="button"
                        onClick={() => handleToggleExecRole(exec.key)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-600 dark:text-cyan-300 font-bold'
                            : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="font-extrabold text-slate-900 dark:text-white text-[11px]">{exec.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{exec.title}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                disabled={starting}
                className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all"
              >
                {starting ? 'Convening Boardroom...' : 'Dispatch Objective & Notify Executives'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
