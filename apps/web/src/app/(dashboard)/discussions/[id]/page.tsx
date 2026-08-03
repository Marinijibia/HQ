'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Badge, Input } from '@hq/ui';
import {
  ArrowLeft,
  Send,
  Zap,
  CheckCircle2,
  FileText,
  Paperclip,
  Activity,
  ChevronRight,
  AlertTriangle,
  Rocket,
  Sparkles,
  Cpu,
  User,
  Copy,
  Pin,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Search,
  Plus,
  Layers,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';
import { toast } from '../../../../components/toast';
import { FormattedMessage } from '../../../../components/formatted-message';

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'EXECUTIVE';
  content: string;
  timestamp?: string;
  createdAt?: string;
}

interface Executive {
  id: string;
  name: string;
  roleKey: string;
  title: string;
}

interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  isPinned: boolean;
  isArchived: boolean;
  missionId?: string | null;
}

interface MissionItem {
  id: string;
  objective: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

interface ConversationDetail extends ConversationItem {
  messages: Message[];
}

export default function DiscussionThreadWorkspacePage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const router = useRouter();

  const [conversation, setConversation] = React.useState<ConversationDetail | null>(null);
  const [executives, setExecutives] = React.useState<Executive[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Left Sidebar States (Discussions & Missions lists)
  const [allConversations, setAllConversations] = React.useState<ConversationItem[]>([]);
  const [allMissions, setAllMissions] = React.useState<MissionItem[]>([]);
  const [sidebarTab, setSidebarTab] = React.useState<'discussions' | 'missions'>('discussions');
  const [sidebarSearch, setSidebarSearch] = React.useState('');

  // Message Input & Deliberation state
  const [content, setContent] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [isDeliberating, setIsDeliberating] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isDeliberating]);

  const fetchSidebarLists = React.useCallback(async () => {
    if (!token) return;
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      const [convRes, missRes] = await Promise.all([
        fetch('/api/conversations?isArchived=false', { headers }),
        fetch('/api/missions', { headers }),
      ]);

      if (convRes.ok) {
        const convData = await convRes.json();
        setAllConversations(Array.isArray(convData) ? convData : []);
      }
      if (missRes.ok) {
        const missData = await missRes.json();
        setAllMissions(Array.isArray(missData) ? missData : []);
      }
    } catch (e) {
      console.error('Error fetching sidebar lists:', e);
    }
  }, [token]);

  const fetchThreadData = React.useCallback(async () => {
    if (!token || !id) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      const execRes = await fetch('/api/executives', { headers });
      if (execRes.ok) {
        const execsData = await execRes.json();
        setExecutives(execsData);
      }

      const convRes = await fetch(`/api/conversations/${id}`, { headers });
      if (convRes.ok) {
        const convData = await convRes.json();
        setConversation(convData);
      }
    } catch (e) {
      console.error('Error fetching boardroom thread details:', e);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  React.useEffect(() => {
    if (token) {
      fetchSidebarLists();
    }
  }, [token, fetchSidebarLists]);

  React.useEffect(() => {
    if (token && id) {
      fetchThreadData();
    }
  }, [token, id, fetchThreadData]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || content;
    if (!textToSend.trim() || !token || !id) return;

    if (!customText) setContent('');
    setSending(true);
    setIsDeliberating(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: textToSend }),
      });

      if (!res.ok) {
        throw new Error('Failed to dispatch directive');
      }

      toast.info('⚡ Gemini AI Executive Agents deliberating query...');
      await fetchThreadData();
      await fetchSidebarLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error sending message');
    } finally {
      setSending(false);
      setIsDeliberating(false);
    }
  };

  const handleConvertToMission = async () => {
    if (!conversation || !token) return;
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          objective: conversation.title,
        }),
      });

      if (res.ok) {
        const mission = await res.json();
        toast.success('🚀 Discussion Converted to Autonomous Mission Task!');
        router.push(`/missions/${mission.id}`);
      }
    } catch {
      toast.error('Failed to convert discussion to mission');
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Text copied to clipboard!');
  };

  // Helper to map Executive sender info
  const getExecutiveInfo = (senderId: string) => {
    const found = executives.find((e) => e.id === senderId);
    if (found) {
      const rankTitle = found.name.includes('(') ? found.name : `${found.name} (${found.title})`;
      return {
        name: rankTitle,
        title: found.title,
        roleKey: found.roleKey,
      };
    }
    return {
      name: 'Elena Rostova (Chief Executive Officer)',
      title: 'Chief Executive Officer (CEO)',
      roleKey: 'ceo',
    };
  };

  const getRoleAccent = (roleKey: string) => {
    switch (roleKey) {
      case 'ceo':
        return {
          badge: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',
          gradient: 'from-cyan-500 via-blue-600 to-purple-600',
        };
      case 'cto':
        return {
          badge: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300',
          gradient: 'from-blue-600 via-cyan-500 to-indigo-600',
        };
      case 'cfo':
        return {
          badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
          gradient: 'from-emerald-500 via-teal-600 to-cyan-500',
        };
      case 'cmo':
        return {
          badge: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300',
          gradient: 'from-purple-600 via-pink-600 to-purple-500',
        };
      default:
        return {
          badge: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',
          gradient: 'from-cyan-500 via-blue-600 to-purple-600',
        };
    }
  };

  const filteredSidebarConversations = allConversations.filter((c) =>
    c.title.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const filteredSidebarMissions = allMissions.filter((m) =>
    m.objective.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center bg-background select-none">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative flex items-center justify-center">
            <Cpu className="h-10 w-10 text-cyan-500 animate-spin" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border border-cyan-500/40 animate-ping" />
          </div>
          <p className="text-xs text-foreground/60 font-black tracking-wider uppercase">Opening Boardroom Command Lounge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5.75rem)] -mx-8 -mt-8 -mb-8 w-[calc(100%+4rem)] select-none text-foreground bg-background overflow-hidden relative text-left">
      {/* Ambient Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* LEFT SIDEBAR: Integrated Discussions & Autonomous Missions Navigator */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-col w-80 border-r border-card-border bg-card/60 backdrop-blur-2xl flex-shrink-0 z-20">
        {/* Sidebar Header & Start Discussion Button */}
        <div className="p-4 border-b border-card-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> BOARDROOM NAVIGATOR
            </span>
            <Button
              onClick={() => router.push('/discussions')}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] h-7 px-2.5 rounded-lg flex items-center gap-1"
            >
              <Plus className="h-3 w-3 stroke-[3]" /> New
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-foreground/40" />
            <Input
              placeholder="Search threads & missions..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="pl-9 bg-muted/40 border-card-border text-xs h-8 rounded-xl focus-visible:ring-cyan-500"
            />
          </div>

          {/* Tab Switcher: Discussions / Missions */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-xl border border-card-border">
            <button
              onClick={() => setSidebarTab('discussions')}
              className={`py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1.5 ${
                sidebarTab === 'discussions'
                  ? 'bg-card text-cyan-600 dark:text-cyan-300 shadow-sm border border-card-border'
                  : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              <MessageSquare className="h-3 w-3" /> Threads ({allConversations.length})
            </button>
            <button
              onClick={() => setSidebarTab('missions')}
              className={`py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1.5 ${
                sidebarTab === 'missions'
                  ? 'bg-card text-cyan-600 dark:text-cyan-300 shadow-sm border border-card-border'
                  : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              <Rocket className="h-3 w-3" /> Missions ({allMissions.length})
            </button>
          </div>
        </div>

        {/* Sidebar Item List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {sidebarTab === 'discussions' ? (
            filteredSidebarConversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-foreground/50 font-medium">No threads found</div>
            ) : (
              filteredSidebarConversations.map((c) => {
                const isActive = c.id === id;
                return (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/discussions/${c.id}`)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-foreground font-black shadow-sm'
                        : 'bg-card/40 border-card-border hover:border-cyan-500/30 text-foreground/75 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-cyan-500 uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Thread
                      </span>
                      <span className="text-foreground/40">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs font-bold truncate">{c.title}</div>
                  </div>
                );
              })
            )
          ) : filteredSidebarMissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-foreground/50 font-medium">No active missions found</div>
          ) : (
            filteredSidebarMissions.map((m) => (
              <div
                key={m.id}
                onClick={() => router.push(`/missions/${m.id}`)}
                className="p-3 rounded-xl border border-card-border bg-card/40 hover:border-cyan-500/40 cursor-pointer transition-all space-y-1 text-left"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-[9px] font-black px-1.5 py-0">
                    {m.status}
                  </Badge>
                  <span className="text-foreground/40">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-xs font-bold truncate text-foreground">{m.objective}</div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Bottom Executive Status Footer */}
        <div className="p-3 border-t border-card-border bg-black/[0.02] dark:bg-white/[0.02] space-y-2 mt-auto">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-foreground/50">
            <span>Executive Board System</span>
            <span className="text-emerald-500 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> 100% ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-cyan-500" /> Gemini Multi-Agent</span>
            <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-500 bg-cyan-500/10">Active</Badge>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT MAIN CHAT LOUNGE WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Sticky Top Header Bar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between border-b border-card-border px-6 py-3.5 bg-card/90 backdrop-blur-2xl shadow-sm gap-4">
          <div className="flex items-center space-x-3.5">
            <Link
              href="/discussions"
              className="md:hidden text-xs text-foreground/60 hover:text-foreground flex items-center gap-1.5 font-extrabold transition-colors px-2.5 py-1 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 text-cyan-500" />
              <span>Back</span>
            </Link>

            <div className="flex items-center gap-2 max-w-md">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
              <h2 className="text-sm sm:text-base font-black text-foreground truncate tracking-tight">
                {conversation?.title || 'Boardroom Thread'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleConvertToMission}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs h-9 px-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center gap-2"
            >
              <Rocket className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Convert to Mission</span>
            </Button>
          </div>
        </div>

        {/* Active Board Presence Bar */}
        <div className="flex items-center justify-between px-6 py-2 bg-black/[0.02] dark:bg-white/[0.02] border-b border-card-border text-xs z-10">
          <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
            <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-widest flex items-center gap-1.5 flex-shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
              Active Board:
            </span>

            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Elena Rostova (Chief Executive Officer)', role: 'ceo' },
                { name: 'Marcus Vance (Chief Technology Officer)', role: 'cto' },
                { name: 'Arthur Pendelton (Chief Financial Officer)', role: 'cfo' },
              ].map((lead) => {
                const accent = getRoleAccent(lead.role);
                return (
                  <span
                    key={lead.name}
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 cursor-default ${accent.badge}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    {lead.name}
                  </span>
                );
              })}
            </div>
          </div>

          {isDeliberating && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-300 font-black flex items-center gap-1.5 animate-pulse flex-shrink-0">
              <Cpu className="h-3.5 w-3.5 text-cyan-500 animate-spin" />
              Gemini Multi-Agent Deliberating...
            </span>
          )}
        </div>

        {/* Scrollable Chat Thread Message Feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full z-10">
          {/* Executive Deliberation Context Banner */}
          <div className="p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 backdrop-blur-xl flex items-center justify-between shadow-sm text-left">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-black flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Executive Multi-Agent Lounge Active</h4>
                <p className="text-[11px] text-foreground/60 font-medium">Directives are evaluated by CEO, CTO, CFO, CMO & CRO in real-time with automated mission execution.</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex border-cyan-500/30 text-cyan-500 bg-cyan-500/10 text-[10px] font-bold">
              Gemini Powered
            </Badge>
          </div>
          {conversation?.messages.map((msg) => {
            const isUser = msg.senderType === 'USER';
            const execInfo = !isUser ? getExecutiveInfo(msg.senderId) : null;
            const accent = execInfo ? getRoleAccent(execInfo.roleKey) : getRoleAccent('ceo');

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 group ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Executive Avatar Ring */}
                <div
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-xs shadow-md transition-transform group-hover:scale-105 p-[2px] bg-gradient-to-tr ${
                    isUser
                      ? 'from-cyan-500 to-blue-600 text-white'
                      : accent.gradient
                  }`}
                >
                  <div className="h-full w-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-cyan-600 dark:text-cyan-300">
                    {isUser ? <User className="h-4 w-4 text-cyan-600 dark:text-cyan-300" /> : <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />}
                  </div>
                </div>

                {/* Message Content Box */}
                <div className={`space-y-1.5 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className={`text-[11px] font-black uppercase tracking-wider ${isUser ? 'text-cyan-600 dark:text-cyan-400' : 'text-purple-600 dark:text-purple-300'}`}>
                      {isUser ? user?.email?.split('@')[0] || 'Workspace Owner' : execInfo?.name}
                    </span>

                    <button
                      onClick={() => handleCopyMessage(msg.content)}
                      className="text-foreground/30 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Copy Text"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>

                  <div
                    className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed border transition-all ${
                      isUser
                        ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/30 text-slate-900 dark:text-foreground rounded-tr-none shadow-sm'
                        : 'bg-white dark:bg-card/90 backdrop-blur-2xl border-slate-200 dark:border-card-border text-slate-900 dark:text-foreground rounded-tl-none shadow-md hover:border-cyan-500/30'
                    }`}
                  >
                    <FormattedMessage content={msg.content} />
                  </div>
                </div>
              </div>
            );
          })}

          {isDeliberating && (
            <div className="flex items-center gap-3 text-xs text-cyan-600 dark:text-cyan-300 font-black py-3 px-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 animate-pulse text-left max-w-md">
              <Cpu className="h-4 w-4 text-cyan-500 animate-spin" />
              <span>AI Executive Board formulating multi-agent response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ========================================================================= */}
        {/* STICKY BOTTOM DIRECTIVE CONSOLE INPUT SECTION */}
        {/* ========================================================================= */}
        <div className="sticky bottom-0 z-20 border-t border-slate-200 dark:border-card-border bg-white/95 dark:bg-card/95 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl max-w-5xl mx-auto w-full space-y-3">
          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold text-foreground/50">
            <span className="flex-shrink-0 text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-black text-[10px]">Quick Directives:</span>
            {[
              'Audit security parameters & token rotation',
              'Run financial margin & cost projection model',
              'Optimize B2B growth campaign funnels',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(undefined, chip)}
                disabled={sending}
                className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] hover:bg-cyan-500/15 border border-slate-200 dark:border-card-border hover:border-cyan-500/40 text-slate-700 dark:text-foreground/75 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex-shrink-0 text-[11px]"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Sticky Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <Input
              placeholder="Ask your AI Executive Board or provide new corporate directives..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={sending}
              className="bg-white dark:bg-white/[0.04] border-slate-300 dark:border-card-border text-slate-900 dark:text-foreground text-xs sm:text-sm h-12 rounded-xl focus-visible:ring-cyan-500 flex-1 placeholder:text-slate-400 dark:placeholder:text-foreground/40 font-medium"
            />
            <Button
              type="submit"
              disabled={sending || !content.trim()}
              className="h-12 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center gap-2 disabled:opacity-40"
            >
              {sending ? <Cpu className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 stroke-[2.5]" />}
              <span>Send Directive</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
