'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge, Avatar, Input } from '@hq/ui';
import {
  ArrowLeft,
  Send,
  Zap,
  CheckCircle,
  FileText,
  Paperclip,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';
import { useGuideMode } from '../../../../contexts/guide-mode-context';

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'EXECUTIVE';
  content: string;
  timestamp: string;
}

interface Executive {
  id: string;
  name: string;
  roleKey: string;
  title: string;
  avatarUrl?: string;
}

interface Conversation {
  id: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  missionId?: string | null;
  messages: Message[];
}

export default function DiscussionWorkspacePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();

  const { guideModeEnabled, ftxStep, setFtxStep } = useGuideMode();
  const [showReasonerModal, setShowReasonerModal] = React.useState(false);
  const [checklist, setChecklist] = React.useState<boolean[]>([false, false, false, false, false, false]);

  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [executives, setExecutives] = React.useState<Executive[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Input state
  const [content, setContent] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [isDeliberating, setIsDeliberating] = React.useState(false);
  const [streamingMessageId, setStreamingMessageId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isDeliberating]);

  // Custom onboarding data
  const [ceoName, setCeoName] = React.useState('Elena Rostova');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  React.useEffect(() => {
    // Read onboarding draft
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

  const fetchDiscussionData = React.useCallback(async () => {
    if (!token || !id) return;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      // Fetch Executives list to map avatars/names
      const execRes = await fetch('/api/executives', { headers });
      if (execRes.ok) {
        const execsData = await execRes.json();
        setExecutives(execsData);
      }

      // Fetch specific conversation
      const convRes = await fetch(`/api/conversations/${id}`, { headers });
      if (convRes.ok) {
        const convData = await convRes.json();
        setConversation(convData);
      }
    } catch (e) {
      console.error('Error fetching boardroom discussion details:', e);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  React.useEffect(() => {
    if (token && id) {
      fetchDiscussionData();
    }
  }, [token, id, fetchDiscussionData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !token || !id) return;

    const messageText = content;
    setContent('');
    setSending(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // Pessimistic/Optimistic add message logic
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: messageText }),
      });

      if (res.ok) {
        setIsDeliberating(true);
        await new Promise((r) => setTimeout(r, 1800));
        await fetchDiscussionData();
        // Mark the latest executive message for typewriter reveal
        setStreamingMessageId('latest');
        setTimeout(() => setStreamingMessageId(null), 4000);
      }
    } catch (err) {
      console.error('Failed sending chat message:', err);
    } finally {
      setSending(false);
      setIsDeliberating(false);
    }
  };

  const handleQuickPillClick = (pillText: string) => {
    setContent(pillText);
  };

  const handleConvertToMission = async () => {
    if (!token || !id) return;

    if (guideModeEnabled && ftxStep === 'input') {
      setShowReasonerModal(true);
      setChecklist([false, false, false, false, false, false]);

      let currentIdx = 0;
      const interval = setInterval(() => {
        setChecklist((prev) => {
          const next = [...prev];
          next[currentIdx] = true;
          return next;
        });
        currentIdx += 1;

        if (currentIdx >= 6) {
          clearInterval(interval);
          setTimeout(async () => {
            try {
              const headers: Record<string, string> = {
                Authorization: `Bearer ${token}`,
              };
              const res = await fetch(`/api/conversations/${id}/convert-mission`, {
                method: 'POST',
                headers,
              });
              if (res.ok) {
                const data = await res.json();
                setFtxStep('executing');
                setShowReasonerModal(false);
                router.push(`/missions/${data.id}`);
              } else {
                setShowReasonerModal(false);
              }
            } catch (err) {
              console.error('FTX Mission conversion failed:', err);
              setShowReasonerModal(false);
            }
          }, 600);
        }
      }, 450);
      return;
    }

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      const res = await fetch(`/api/conversations/${id}/convert-mission`, {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        // Refresh to show orchestrated mission link
        await fetchDiscussionData();
      }
    } catch (err) {
      console.error('Mission conversion failed:', err);
    }
  };

  const getSenderDetails = (msg: Message) => {
    if (msg.senderType === 'USER') {
      return {
        name: 'Owner',
        title: 'HQ Owner',
        avatarFallback: 'OW',
        isUser: true,
      };
    }
    // Match specialist
    const exec = executives.find((e) => e.id === msg.senderId || e.roleKey === 'ceo');
    if (exec) {
      // Overwrite CEO name if matched
      const name = exec.roleKey === 'ceo' ? ceoName : exec.name;
      return {
        name,
        title: exec.title,
        avatarFallback: name.substring(0, 2).toUpperCase(),
        isUser: false,
      };
    }
    return {
      name: ceoName,
      title: 'Chief Executive Officer (CEO)',
      avatarFallback: 'CEO',
      isUser: false,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white select-none">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-hq-cyan border-t-transparent animate-spin"></div>
          <p className="text-xs text-foreground/50">Booting boardroom workspace...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-red-500">Boardroom discussion not found</h2>
        <Button onClick={() => router.push('/discussions')} className="mt-4">
          Back to Discussions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none text-foreground pb-12">
      {/* Back button and Pinned controls */}
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <div className="flex items-center space-x-3 text-left">
          <button
            onClick={() => router.push('/discussions')}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-foreground/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#1A1A1E] dark:text-white leading-tight">
              {conversation.title || 'Boardroom Discussion'}
            </h1>
            <p className="text-[10px] text-foreground/50 mt-0.5 font-semibold uppercase tracking-wider">
              Discussion Session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.isPinned && (
            <Badge
              variant="ai"
              className="bg-hq-cyan/10 text-hq-cyan border-hq-cyan/30 text-[10px]"
            >
              Pinned
            </Badge>
          )}
          {conversation.missionId && (
            <Badge variant="success" className="text-[10px]">
              Mission Active
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 items-start">
        {/* Chat Timeline (Main panel) */}
        <div className="lg:col-span-3 flex flex-col h-[650px] border border-card-border bg-card-bg shadow-[var(--card-shadow)] rounded-2xl overflow-hidden justify-between">
          {/* Active Participants Header bar */}
          <div className="border-b border-card-border p-3.5 bg-[#F9F9FB] dark:bg-[#0A0A0C] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block">
                Active Participants:
              </span>
              <div className="flex -space-x-1.5 overflow-hidden">
                <Avatar fallback="CEO" variant="executive" size="sm" />
                <Avatar fallback="ST" variant="executive" size="sm" />
                <Avatar fallback="TE" size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-foreground/60 font-semibold">
              <Activity className="h-3.5 w-3.5 text-hq-purple animate-pulse" />
              <span>Deliberating strategy path</span>
            </div>
          </div>

          {/* Messages History */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {conversation.messages.map((msg, idx) => {
              const sender = getSenderDetails(msg);
              const isLatestExec =
                streamingMessageId === 'latest' &&
                msg.senderType === 'EXECUTIVE' &&
                idx === conversation.messages.length - 1;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-left max-w-[85%] ${
                    sender.isUser ? 'ml-auto flex-row-reverse' : ''
                  } ${isLatestExec ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''}`}
                >
                  <Avatar
                    fallback={sender.avatarFallback}
                    variant={sender.isUser ? 'user' : 'executive'}
                    size="md"
                  />
                  <div className="space-y-1">
                    <div
                      className={`flex items-baseline gap-2 ${sender.isUser ? 'justify-end' : ''}`}
                    >
                      <span className="text-[11px] font-extrabold text-[#1A1A1E] dark:text-white">
                        {sender.name}
                      </span>
                      <span className="text-[9px] text-foreground/45 font-semibold">
                        {sender.title}
                      </span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                        sender.isUser
                          ? 'bg-hq-blue/10 border border-hq-blue/25 text-foreground'
                          : 'bg-black/5 dark:bg-[#1E1E24]/30 border border-card-border text-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Typewriter scroll anchor */}
            <div ref={messagesEndRef} />

            {isDeliberating && (
              <div className="flex gap-3 text-left max-w-[85%]">
                <Avatar fallback="CEO" variant="executive" size="md" />
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-extrabold text-[#1A1A1E] dark:text-white">
                      {ceoName}
                    </span>
                    <span className="text-[9px] text-hq-purple font-semibold animate-pulse">
                      thinking…
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-[#1E1E24]/30 border border-hq-purple/20 flex items-center gap-2">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 rounded-full bg-hq-purple animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                    <span className="text-[10px] text-hq-purple/70 font-semibold ml-1">Consulting the boardroom…</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form & suggested action pills */}
          <div className="p-4 border-t border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] shrink-0 flex flex-col gap-2.5">
            {/* Context query pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Outline B2B logistics risks',
                'Verify database schema types',
                'Calculate capital allocation budget',
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleQuickPillClick(pill)}
                  className="px-2.5 py-0.5 rounded-lg border border-card-border bg-card-bg hover:bg-black/5 dark:hover:bg-white/5 text-[9px] font-bold text-foreground/60 transition-all"
                >
                  + {pill}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ask Alistair or Elena for suggestions..."
                disabled={sending}
                className="bg-white dark:bg-black border-card-border text-xs flex-1 h-9"
              />
              <Button
                type="submit"
                disabled={sending || !content.trim()}
                className="h-9 px-4 text-white flex items-center justify-center"
                style={{ backgroundColor: brandColor }}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Action sidebar Panel */}
        <div className="space-y-6">
          {/* Orchestrated Campaign Card */}
          {conversation.missionId ? (
            <Card className="border border-green-500/25 bg-green-500/5 text-left p-4.5 space-y-3">
              <div>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                  Associated Mission
                </span>
                <h4 className="text-xs font-bold text-[#1A1A1E] dark:text-white mt-1 leading-snug">
                  Discussion successfully orchestrated into active campaign!
                </h4>
              </div>
              <Button
                onClick={() => router.push('/missions')}
                size="sm"
                className="w-full text-[10px] font-bold text-white flex items-center justify-center gap-1"
                style={{ backgroundColor: brandColor }}
              >
                Open Mission Control
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ) : (
            <Card className="border border-card-border bg-card-bg text-left p-4.5 space-y-3 shadow-[var(--card-shadow)]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                  Orchestrate Campaign
                </h3>
                <p className="text-[10px] text-foreground/60 mt-1 leading-relaxed">
                  Convert this debate into a structured mission task queue managed by Arthur (Chief
                  of Staff).
                </p>
              </div>
              <Button
                onClick={handleConvertToMission}
                size="sm"
                className="w-full text-[10px] font-bold text-white flex items-center justify-center gap-1.5 shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                <Zap className="h-3.5 w-3.5 animate-pulse" />
                Approve & Launch Mission
              </Button>
            </Card>
          )}

          {/* Discussion Actions Checklist */}
          <Card className="border border-card-border bg-card-bg text-left p-4.5 space-y-4 shadow-[var(--card-shadow)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 border-b border-card-border pb-1.5">
              Discussions Controls
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-[10px] font-bold border-card-border flex justify-start items-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Save Decisions to Knowledge
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-[10px] font-bold border-card-border flex justify-start items-center gap-1.5"
              >
                <FileText className="h-4 w-4 text-hq-purple" />
                Export Meeting Summary
              </Button>
            </div>
          </Card>

          {/* Attachments Section */}
          <Card className="border border-card-border bg-card-bg text-left p-4.5 space-y-4 shadow-[var(--card-shadow)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 border-b border-card-border pb-1.5 flex items-center justify-between">
              <span>Attachments</span>
              <Paperclip className="h-3.5 w-3.5 text-foreground/45" />
            </h3>
            <div className="border-2 border-dashed border-card-border rounded-xl p-6 text-center hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
              <p className="text-[10px] text-foreground/50 leading-snug">
                Drag and drop briefing files here to analyze them.
              </p>
            </div>
          </Card>
        </div>
      </div>
      {showReasonerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-hq-blue/30 bg-[#0B0B0E] p-8 text-center shadow-2xl relative space-y-6">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full border-2 border-t-hq-blue border-hq-graphite/30 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold tracking-tight text-white text-center">CEO Analyzing boardroom outcome...</h2>
              <p className="text-xs text-foreground/50 text-center">
                Elena is mapping structural components and compiling mission guidelines.
              </p>
            </div>

            <div className="w-full bg-hq-graphite/10 border border-hq-graphite/40 rounded-xl p-5 grid grid-cols-2 gap-4 text-xs font-semibold text-left">
              {[
                { label: 'Business Type', checked: checklist[0] },
                { label: 'Goal Alignment', checked: checklist[1] },
                { label: 'Timeline Estimator', checked: checklist[2] },
                { label: 'Required Departments', checked: checklist[3] },
                { label: 'Risks Matrix', checked: checklist[4] },
                { label: 'Deliverables Plan', checked: checklist[5] },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${item.checked ? 'border-hq-blue bg-hq-blue/10 text-hq-blue scale-105' : 'border-foreground/20 text-transparent'}`}
                  >
                    ✓
                  </span>
                  <span className={item.checked ? 'text-white' : 'text-foreground/40'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Extra Lucide icon placeholder wrapper to avoid compiler failures
function Loader2({ className }: { className?: string }) {
  return <Activity className={`${className} animate-pulse`} />;
}

function RefreshCw({ className }: { className?: string }) {
  return <Activity className={`${className} animate-spin`} />;
}
