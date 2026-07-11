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
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';

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
  const [selectedExecs, setSelectedExecs] = React.useState<string[]>(['ceo']);

  // Dynamic onboarding variables
  const [ceoName, setCeoName] = React.useState('Elena Rostova');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Read from onboarding draft
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
      else params.push('isArchived=false'); // don't show archived by default

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
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleStartDiscussion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!objective.trim() || !token) return;

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
        router.push(`/discussions/${data.id}`);
      }
    } catch (err) {
      console.error('Failed starting discussion:', err);
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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      const res = await fetch(`/api/conversations/${id}/archive`, { method: 'POST', headers });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error('Archive action failed:', err);
    }
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Title Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-hq-blue" />
            Boardroom Discussions
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Debate operational models, review assets, and direct specialists prior to launching
            campaigns.
          </p>
        </div>

        <Button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 h-9 text-xs text-white"
          style={{ backgroundColor: brandColor }}
        >
          <PlusCircle className="h-4 w-4" />
          New Discussion
        </Button>
      </div>

      {/* Suggested prompts cards */}
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
            className="border border-card-border bg-card-bg hover:border-hq-blue/40 cursor-pointer card-transition p-5 text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-hq-cyan flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Prompt Template
              </span>
              <ArrowRight className="h-4 w-4 text-foreground/45" />
            </div>
            <h4 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">{item.title}</h4>
            <p className="text-[11px] text-foreground/60 mt-1">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex gap-2">
          {[
            { id: 'recent', label: 'All Discussions', icon: Clock },
            { id: 'pinned', label: 'Pinned Only', icon: Pin },
            { id: 'archived', label: 'Archived discussions', icon: Archive },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'recent' | 'pinned' | 'archived')}
                className={`rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  activeTab === tab.id
                    ? 'text-white border-transparent'
                    : 'bg-card-bg border-card-border hover:bg-black/5 dark:hover:bg-white/5 text-foreground/75'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? brandColor : undefined,
                  boxShadow: activeTab === tab.id ? `0 4px 15px ${brandColor}2b` : undefined,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/45" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-60 rounded-md border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] pl-9 pr-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hq-blue"
          />
        </div>
      </div>

      {/* Discussions Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-hq-blue border-t-transparent animate-spin"></div>
          <p className="text-xs text-foreground/50">Retrieving boardroom sessions...</p>
        </div>
      ) : conversations.length === 0 ? (
        <Card className="border border-card-border bg-card-bg p-12 text-center">
          <MessageSquare className="h-10 w-10 text-foreground/25 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#1A1A1E] dark:text-white">No discussions found</h3>
          <p className="text-xs text-foreground/50 mt-1 max-w-sm mx-auto">
            Spawn a boardroom discussion to direct executives and analyze goals.
          </p>
          <Button
            onClick={() => setShowStartModal(true)}
            size="sm"
            className="mt-4 text-white font-bold text-xs"
            style={{ backgroundColor: brandColor }}
          >
            Start First Discussion
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              onClick={() => router.push(`/discussions/${conv.id}`)}
              className="hover:border-hq-blue/50 transition-all cursor-pointer bg-card-bg border border-card-border text-left hover:shadow-lg flex flex-col justify-between"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant={conv.missionId ? 'success' : 'ai'} className="text-[9px]">
                    {conv.missionId ? 'Orchestrated' : 'Active Discussion'}
                  </Badge>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => handleTogglePin(conv.id, e)}
                      className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${
                        conv.isPinned ? 'text-hq-cyan' : 'text-foreground/45'
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <button
                      onClick={(e) => handleToggleArchive(conv.id, e)}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground/45 hover:text-red-400"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white mt-2 line-clamp-2">
                  {conv.title || 'Untitled Boardroom Session'}
                </CardTitle>
              </CardHeader>
              <CardFooter className="pt-2 text-[10px] text-foreground/45 font-semibold border-t border-card-border/50 bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-b-xl flex justify-between">
                <span>Created: {new Date(conv.createdAt).toLocaleDateString()}</span>
                <span>Active</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Start Discussion Dialog Overlay */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <CardHeader className="p-0 pb-4 border-b border-card-border">
              <CardTitle className="text-lg font-extrabold text-[#1A1A1E] dark:text-white">
                Start Boardroom Discussion
              </CardTitle>
              <CardDescription className="text-xs">
                Convening specialist AI directors to evaluate campaign targets.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleStartDiscussion} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/75">
                  Objective / Strategy Topic
                </label>
                <textarea
                  placeholder="e.g. How can we increase B2B refinery outreach conversion rates?"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  required
                  className="min-h-20 w-full rounded-xl border border-card-border bg-white dark:bg-black p-3 text-xs focus:outline-none focus:ring-1 focus:ring-hq-blue text-foreground"
                />
              </div>

              {/* Specialist executive selectors */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/75 block">
                  Select Specialist Directors
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'ceo', name: ceoName },
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
                        disabled={m.key === 'ceo'}
                        className="px-2.5 py-1.5 border rounded-xl transition-all text-[11px] font-bold text-center flex flex-col justify-center items-center h-10 disabled:opacity-50"
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

              <div className="flex gap-2.5 pt-4 border-t border-card-border justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowStartModal(false)}
                  className="text-xs font-bold h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="text-xs font-bold text-white h-9 px-4"
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
