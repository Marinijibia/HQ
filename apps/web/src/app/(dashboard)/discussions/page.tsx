'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button, Badge } from '@hq/ui';
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
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { useGuideMode } from '../../../contexts/guide-mode-context';
import { SmartEmptyState } from '../../../components/smart-empty-state';
import { toast } from '../../../components/toast';
import { ListSkeleton } from '../../../components/skeletons';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  isPinned: boolean;
  isArchived: boolean;
  missionId?: string | null;
}

interface Executive {
  id: string;
  name: string;
  roleKey: string;
  title: string;
}

export default function DiscussionsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { guideModeEnabled, ftxStep, setFtxStep, startMission } = useGuideMode();

  // Tab & search states
  const [activeTab, setActiveTab] = React.useState<'recent' | 'pinned' | 'archived'>('recent');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showStartModal, setShowStartModal] = React.useState(false);

  // Form states
  const [objective, setObjective] = React.useState('');
  const [selectedExecs, setSelectedExecs] = React.useState<string[]>(['ceo']);

  // Dynamic onboarding variables
  const [ceoName, setCeoName] = React.useState('Elena Rostova');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [executives, setExecutives] = React.useState<Executive[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Sync settings & local draft
  React.useEffect(() => {
    const draftStr = localStorage.getItem('hq_onboarding_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.ceoName) setCeoName(draft.ceoName);
        if (draft.brandColor) setBrandColor(draft.brandColor);
      } catch { /* silent */ }
    }
  }, []);

  // Fetch live executives for start modal selector
  React.useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/api/executives', { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setExecutives(data);
        }
      })
      .catch((e) => console.error('Error fetching executives:', e));
  }, [token]);

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
      else params.push('isArchived=false'); // filter archived by default

      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);

      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
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

  const handleToggleExec = (key: string) => {
    setSelectedExecs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
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
          specialists: selectedExecs.filter((key) => key !== 'ceo'),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowStartModal(false);
        setObjective('');
        setSelectedExecs(['ceo']);
        toast.success('💬 Boardroom session initialized successfully');

        if (guideModeEnabled && ftxStep === 'arrival') {
          startMission(objective);
          setFtxStep('input');
        }

        router.push(`/discussions/${data.id}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(`❌ Failed to start boardroom session: ${errData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Failed starting discussion:', err);
      toast.error('❌ Failed to connect to server. Please check database connectivity.');
    }
  };

  const handleQuickDiscussion = (pillText: string) => {
    setObjective(pillText);
    setShowStartModal(true);
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/conversations/${id}/pin`, { method: 'POST', headers });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error('Pin action failed:', err);
    }
  };

  const handleToggleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/conversations/${id}/archive`, { method: 'POST', headers });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error('Archive action failed:', err);
    }
  };

  // Map real executives options dynamically
  const selectorOptions = React.useMemo(() => {
    if (executives.length === 0) {
      return [{ key: 'ceo', name: ceoName, title: 'Chief Executive Officer' }];
    }
    return executives.map((e) => ({
      key: e.roleKey,
      name: e.roleKey === 'ceo' ? ceoName : e.name,
      title: e.title,
    }));
  }, [executives, ceoName]);

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Guide Mode Welcome Banner */}
      {guideModeEnabled && ftxStep === 'arrival' ? (
        <Card className="relative overflow-hidden border border-hq-blue/20 bg-card-bg backdrop-blur-md p-6 sm:p-8 shadow-2xl animate-in fade-in duration-300 w-full text-left mb-6">
          <div className="absolute top-0 right-0 w-64 h-32 bg-hq-blue/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-[1.5px] bg-gradient-to-tr from-hq-blue via-[#bf5af2] to-hq-cyan rounded-full shadow-[0_0_15px_rgba(10,132,255,0.2)]">
              <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-sm font-black text-white select-none animate-pulse">
                HQ
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Welcome to HQ</h1>
              <p className="text-xs text-foreground/45 mt-0.5 font-medium">Your Executive Board is standing by.</p>
            </div>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed font-medium">
            I'm your Chief Executive Officer. Let's start our first boardroom discussion. Type a business objective or choose a prompt template below to consult your executive board.
          </p>
        </Card>
      ) : (
        /* Premium Standard Header */
        <div className="relative flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 text-left">
          <div className="absolute -top-6 -left-6 w-64 h-24 bg-hq-blue/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest font-black text-foreground/30">Executive Boardroom</span>
              <span className="h-1 w-1 rounded-full bg-hq-cyan animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-black text-hq-cyan/60">Live</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-hq-blue/20 to-hq-purple/10 border border-hq-blue/20 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-hq-blue" />
              </div>
              Boardroom Discussions
            </h1>
            <p className="text-foreground/45 text-sm mt-1.5 font-medium">
              Orchestrate strategic targets, debate operational parameters, and consult specialists.
            </p>
          </div>

          <Button
            onClick={() => setShowStartModal(true)}
            className="flex items-center gap-2.5 h-10 px-5 text-sm text-white font-bold rounded-full shadow-[0_4px_20px_rgba(10,132,255,0.3)] hover:shadow-[0_4px_28px_rgba(10,132,255,0.45)] transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: brandColor }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Discussion
          </Button>
        </div>
      )}

      {/* Premium Prompt Template Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Increase Profitability',
            desc: 'Analyze logistical overheads to optimize station conversion rates.',
            prompt: 'How can we increase profitability across West African logistics corridors?',
          },
          {
            title: 'Audit Stripe Hooks',
            desc: 'Verify webhook compliance and secure API key rotators.',
            prompt: 'Explain the security implications of webhook token rotations.',
          },
          {
            title: 'Design Q3 Roadmap',
            desc: 'Draft campaign targets and content schedules.',
            prompt: 'Draft an outreach campaign target outline for Q3 Petroleum Logistics.',
          },
        ].map((item, index) => (
          <Card
            key={index}
            onClick={() => handleQuickDiscussion(item.prompt)}
            className="group relative overflow-hidden border border-card-border bg-card-bg hover:border-hq-blue/30 hover:shadow-[0_8px_30px_rgba(10,132,255,0.08)] cursor-pointer transition-all duration-300 p-5 text-left"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-hq-cyan/[0.04] rounded-full blur-2xl group-hover:bg-hq-blue/[0.08] transition-colors pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-hq-cyan/80 flex items-center gap-1.5 bg-hq-cyan/10 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Prompt Template
              </span>
              <div className="h-6 w-6 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-card-border flex items-center justify-center group-hover:bg-hq-blue/10 group-hover:border-hq-blue/20 transition-all">
                <ArrowRight className="h-3 w-3 text-foreground/35 group-hover:text-hq-blue transition-colors" />
              </div>
            </div>
            <h4 className="text-sm font-black text-foreground group-hover:text-hq-blue transition-colors">{item.title}</h4>
            <p className="text-xs text-foreground/45 mt-1.5 leading-relaxed font-semibold">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* Premium Filter Toolbar */}
      {(!guideModeEnabled || ftxStep !== 'arrival') && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex gap-1.5 bg-black/[0.03] dark:bg-white/[0.03] border border-card-border rounded-full p-1 w-fit">
            {[
              { id: 'recent', label: 'All Discussions', icon: Clock },
              { id: 'pinned', label: 'Pinned', icon: Pin },
              { id: 'archived', label: 'Archived', icon: Archive },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'recent' | 'pinned' | 'archived')}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-white shadow-sm'
                      : 'text-foreground/50 hover:text-foreground'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? brandColor : undefined,
                    boxShadow: activeTab === tab.id ? `0 2px 10px ${brandColor}40` : undefined,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/35" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-56 rounded-full border border-card-border bg-black/[0.03] dark:bg-white/[0.03] pl-9 pr-4 text-xs text-foreground placeholder:text-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hq-blue/50 focus-visible:border-hq-blue/30 transition-all font-medium"
            />
          </div>
        </div>
      )}

      {/* Discussions Grid */}
      {(!guideModeEnabled || ftxStep !== 'arrival') && (
        loading ? (
          <div className="space-y-4 py-4">
            <ListSkeleton rows={5} />
          </div>
        ) : conversations.length === 0 ? (
          <SmartEmptyState
            icon={MessageSquare}
            title="No discussions started yet"
            description="Start a boardroom discussion to consult your AI executives on any topic — strategy, marketing, hiring, finance, and more."
            cta="Start First Discussion"
            onCta={() => setShowStartModal(true)}
            hints={[
              'Ask your executives: "What should our Q3 priorities be?"',
              'Get a second opinion on a big decision before you commit',
              'Use discussions to brief multiple executives simultaneously',
            ]}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                onClick={() => router.push(`/discussions/${conv.id}`)}
                className="group relative overflow-hidden hover:border-hq-blue/30 hover:shadow-[0_8px_30px_rgba(10,132,255,0.07)] transition-all duration-300 cursor-pointer bg-card-bg border border-card-border text-left flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-20 bg-hq-blue/[0.03] rounded-full blur-2xl group-hover:bg-hq-blue/[0.07] transition-colors pointer-events-none" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant={conv.missionId ? 'success' : 'ai'} className="text-xs">
                      {conv.missionId ? 'Orchestrated' : 'Active Discussion'}
                    </Badge>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleTogglePin(conv.id, e)}
                        className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                          conv.isPinned ? 'text-hq-cyan' : 'text-foreground/30 hover:text-foreground/60'
                        }`}
                      >
                        <Pin className="h-3 w-3 fill-current" />
                      </button>
                      <button
                        onClick={(e) => handleToggleArchive(conv.id, e)}
                        className="p-1.5 rounded-lg hover:bg-red-500/5 text-foreground/30 hover:text-red-400 transition-colors"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mt-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-hq-blue/20 to-hq-purple/10 border border-hq-blue/15 flex items-center justify-center font-black text-xs text-hq-blue uppercase shrink-0">
                      {(conv.title || 'BD').substring(0, 2)}
                    </div>
                    <CardTitle className="text-sm font-black text-foreground line-clamp-2 group-hover:text-hq-blue transition-colors leading-snug">
                      {conv.title || 'Untitled Boardroom Session'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardFooter className="pt-3 pb-3 text-xs text-foreground/35 font-bold border-t border-card-border/50 flex justify-between uppercase tracking-wide">
                  <span>{new Date(conv.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-hq-cyan animate-pulse" />
                    Active
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Premium Start Discussion Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-lg border border-white/10 dark:border-white/[0.06] bg-white/95 dark:bg-[#0a0a0f]/98 backdrop-blur-2xl p-0 shadow-[0_32px_64px_rgba(0,0,0,0.3)] rounded-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-200 text-left overflow-hidden">
            {/* Modal Header */}
            <div className="relative px-6 pt-6 pb-5 border-b border-card-border/60">
              <div className="absolute top-0 right-0 w-48 h-24 bg-hq-blue/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-hq-blue/20 to-hq-purple/10 border border-hq-blue/20 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-hq-blue" />
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground tracking-tight">Start Boardroom Discussion</h2>
                  <p className="text-xs text-foreground/40 font-medium mt-0.5">Convene specialist AI directors to evaluate your strategy.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleStartDiscussion} className="space-y-5 p-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Objective / Strategy Topic
                </label>
                <textarea
                  placeholder="e.g. How can we increase B2B refinery outreach conversion rates?"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  required
                  className="min-h-24 w-full rounded-xl border border-card-border bg-black/[0.02] dark:bg-white/[0.03] p-4 text-sm focus:outline-none focus:ring-1 focus:ring-hq-blue/50 focus:border-hq-blue/30 text-foreground placeholder:text-foreground/25 font-medium transition-all resize-none"
                />
              </div>

              {/* Dynamic selector options */}
              <div className="space-y-2.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 block">
                  Select Specialist Directors
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectorOptions.map((m) => {
                    const isSelected = selectedExecs.includes(m.key);
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => handleToggleExec(m.key)}
                        disabled={m.key === 'ceo'}
                        className="px-2.5 py-2 border rounded-xl transition-all duration-200 text-xs font-bold text-center flex items-center justify-center h-10 disabled:opacity-60"
                        style={{
                          borderColor: isSelected ? brandColor : undefined,
                          backgroundColor: isSelected ? brandColor + '12' : undefined,
                          color: isSelected ? brandColor : undefined,
                          boxShadow: isSelected ? `0 0 12px ${brandColor}20` : undefined,
                        }}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-card-border/60 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowStartModal(false)}
                  className="text-xs font-bold h-9 px-4 rounded-full text-foreground/50 hover:text-foreground border border-card-border hover:border-card-border transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="text-xs font-black text-white h-9 px-5 rounded-full shadow-[0_4px_14px_rgba(10,132,255,0.3)] hover:shadow-[0_4px_20px_rgba(10,132,255,0.4)] transition-all"
                  style={{ backgroundColor: brandColor }}
                >
                  Convene Boardroom
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
