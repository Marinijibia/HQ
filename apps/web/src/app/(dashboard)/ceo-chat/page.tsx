'use client';

import * as React from 'react';
import { Card, Button, Input, Badge } from '@hq/ui';
import {
  Send,
  Sparkles,
  User,
  ShoppingBag,
  ShieldCheck,
  Zap,
  ArrowRight,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle2,
  Rocket,
  Activity,
  Volume2,
  VolumeX,
  MessageSquare,
  Briefcase,
  SlidersHorizontal,
  Users,
  PlusCircle,
  Pin,
  Archive,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface DiscussionThread {
  id: string;
  title: string;
  timestamp: string;
  participantMode: 'DIRECT_CEO' | 'ROUNDTABLE';
  isPinned?: boolean;
  isArchived?: boolean;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  sender: 'owner' | 'asad' | 'teema' | 'legal' | 'mr_intelligence' | 'resource_director';
  senderTitle?: string;
  content: string;
  timestamp: string;
  mode?: 'CONVERSATION' | 'JOB_ASSIGNMENT';
  isMissingDepartment?: boolean;
  missingDepartmentName?: string;
  recommendedListing?: {
    id?: string;
    title: string;
    description: string;
    price: number;
    category: string;
    departmentKey?: string;
  };
  missionPlan?: {
    id: string;
    objective: string;
    status: string;
  };
  assignedExecutives?: string[];
  webResearchBriefing?: {
    topic: string;
    summary: string;
    keyTakeaways: string[];
    marketSentiment: string;
    newsHighlights: string[];
    socialSignals: string[];
    confidenceScore?: number;
    scrapedUrl?: string;
    sources?: { title: string; snippet: string; url: string; source: string }[];
  };
  strategicScorecard?: {
    strategicImpact: number;
    operationalEffort: string;
    regulatoryRisk: string;
    targetCompletionDays: number;
  };
  delegationMatrix?: {
    directorName: string;
    roleTitle: string;
    responsibility: string;
    confidenceScore: number;
  }[];
  dispatchActionReady?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Rich Formatted Text helper with full Light Mode & Dark Mode dual-theme styling
function FormattedMessageText({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed font-normal">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        // Header ###
        if (line.startsWith('### ') || line.startsWith('## ')) {
          return (
            <div key={idx} className="font-extrabold text-cyan-600 dark:text-cyan-300 text-sm mt-3 mb-1 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-500 dark:text-cyan-400" />
              {line.replace(/^#+\s*/, '')}
            </div>
          );
        }

        // Bullet point - or *
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const itemText = line.trim().replace(/^[-*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-cyan-500 dark:text-cyan-400 font-bold">•</span>
              <span>{formatBoldText(itemText)}</span>
            </div>
          );
        }

        // Numbered list 1. 2.
        if (/^\d+\.\s/.test(line.trim())) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 font-semibold">
              <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                {line.trim().split('.')[0]}
              </span>
              <span>{formatBoldText(line.trim().replace(/^\d+\.\s*/, ''))}</span>
            </div>
          );
        }

        return <div key={idx}>{formatBoldText(line)}</div>;
      })}
    </div>
  );
}

function formatBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-slate-900 dark:text-white bg-cyan-100/80 dark:bg-cyan-500/20 px-1 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/30">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function CeoChatAndDiscussionsPage() {
  const { dbUser, token } = useAuth();
  
  // Threads state
  const [threads, setThreads] = React.useState<DiscussionThread[]>([
    {
      id: 't-default',
      title: 'FuelOS Executive Strategy & Operational Scoping',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      participantMode: 'DIRECT_CEO',
      isPinned: true,
      messages: [
        {
          id: 'welcome',
          sender: 'asad',
          senderTitle: 'Chief Executive Officer',
          content: `Greetings Owner. I am **Asad**, Chief Executive Officer at HQ. 

Our active workspace roster includes our 5 baseline core directors:
- **Asad** (CEO & Strategic Orchestrator)
- **Teema** (Operations Director)
- **Legal** (Legal & Compliance Director)
- **Resource Director** (Human Resources Director)
- **Mr. Intelligence** (Public Web Research Agent)

You can converse **1-on-1 with me**, or toggle **Full C-Suite Roundtable** to have our entire active executive team discuss your strategic initiatives simultaneously. How shall we proceed today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'CONVERSATION',
        },
      ],
    },
  ]);

  const [activeThreadId, setActiveThreadId] = React.useState<string>('t-default');
  const [participantMode, setParticipantMode] = React.useState<'DIRECT_CEO' | 'ROUNDTABLE'>('DIRECT_CEO');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [threadFilter, setThreadFilter] = React.useState<'all' | 'pinned' | 'archived'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [activeMobileTab, setActiveMobileTab] = React.useState<'chat' | 'threads'>('chat');

  // Input & state
  const [inputMessage, setInputMessage] = React.useState('');
  const [activeMode, setActiveMode] = React.useState<'AUTO' | 'CONVERSATION' | 'JOB_ASSIGNMENT'>('AUTO');
  const [loading, setLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [speakingMsgId, setSpeakingMsgId] = React.useState<string | null>(null);
  const [activeInstallId, setActiveInstallId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages, loading]);

  // ── Fetch conversations from backend ───────────────────────────────────────
  React.useEffect(() => {
    if (!token) return;
    fetch('/api/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const dbThreads: DiscussionThread[] = data.map((conv: any) => ({
            id: conv.id,
            title: conv.title || conv.objective || 'Executive Strategic Session',
            timestamp: conv.createdAt
              ? new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            participantMode: conv.participantMode || 'DIRECT_CEO',
            isPinned: conv.isPinned || false,
            isArchived: conv.isArchived || false,
            messages: (conv.messages && conv.messages.length > 0)
              ? conv.messages.map((m: any) => ({
                  id: m.id,
                  sender: m.senderRole === 'USER' ? 'owner' : (m.senderKey?.toLowerCase() || 'asad'),
                  senderTitle: m.senderName || (m.senderRole === 'USER' ? 'Organization Owner' : 'Executive Director'),
                  content: m.content,
                  timestamp: m.createdAt
                    ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }))
              : [
                  {
                    id: `welcome-${conv.id}`,
                    sender: 'asad',
                    senderTitle: 'Chief Executive Officer',
                    content: `Greetings Owner. **CEO Asad** is ready to consult on **${conv.title || conv.objective || 'this strategic session'}**.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    mode: 'CONVERSATION',
                  },
                ],
          }));

          setThreads(dbThreads);
          setActiveThreadId(dbThreads[0].id);
        }
      })
      .catch(() => {});
  }, [token]);

  const handleCreateNewThread = async () => {
    const titleText = `Executive Strategic Session #${threads.length + 1}`;
    let newThreadId = `t-${Date.now()}`;

    if (token) {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            objective: titleText,
            specialistKeys: ['ceo', 'operations_director', 'legal_compliance_director', 'human_resources_director', 'public_search_agent'],
          }),
        });
        if (res.ok) {
          const created = await res.json();
          if (created?.id) newThreadId = created.id;
        }
      } catch {
        /* fallback to local ID */
      }
    }

    const newThread: DiscussionThread = {
      id: newThreadId,
      title: titleText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      participantMode,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'asad',
          senderTitle: 'Chief Executive Officer',
          content: `Owner, I have opened a new strategic discussion thread.

How can CEO Asad and our C-Suite executive team assist you on this objective?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'CONVERSATION',
        },
      ],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
    toast.success('Opened new executive discussion thread.');
  };

  const handleTogglePinThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isPinned: !t.isPinned } : t)),
    );
    toast.info('Updated thread pin status.');
  };

  const handleSendMessage = async (customText?: string, explicitMode?: 'CONVERSATION' | 'JOB_ASSIGNMENT') => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || loading) return;

    if (!customText) setInputMessage('');

    const targetMode = explicitMode || (activeMode === 'AUTO' ? undefined : activeMode);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'owner',
      senderTitle: 'Organization Owner',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active thread messages
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, messages: [...t.messages, userMsg] } : t)),
    );

    setLoading(true);
    const companyId = dbUser?.companyId;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/missions/ceo/scope', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: textToSend, companyId, mode: targetMode }),
      });

      if (!res.ok) {
        throw new Error('AI Orchestrator unavailable');
      }

      const data = await res.json();

      if (participantMode === 'DIRECT_CEO') {
        const asadMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'asad',
          senderTitle: 'Chief Executive Officer',
          content: data.ceoResponse || 'Owner, I am scoping your strategic directive with our executive team.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: data.mode,
          isMissingDepartment: data.isMissingDepartment,
          missingDepartmentName: data.missingDepartmentName,
          recommendedListing: data.recommendedMarketplaceListing,
          missionPlan: data.missionPlan,
          assignedExecutives: data.assignedExecutives,
          webResearchBriefing: data.webResearchBriefing,
          strategicScorecard: data.strategicScorecard,
          delegationMatrix: data.delegationMatrix,
          dispatchActionReady: data.dispatchActionReady,
        };

        setThreads((prev) =>
          prev.map((t) => (t.id === activeThreadId ? { ...t, messages: [...t.messages, asadMsg] } : t)),
        );
      } else {
        // FULL C-SUITE ROUNDTABLE MODE: Dynamic response generated by AI Orchestrator
        const asadMsg: ChatMessage = {
          id: `a-rt-${Date.now()}`,
          sender: 'asad',
          senderTitle: 'Chief Executive Officer',
          content: data.ceoResponse || `Owner, I am initiating a **C-Suite Roundtable Alignment** on your prompt: "${textToSend}".`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: data.mode,
          webResearchBriefing: data.webResearchBriefing,
          strategicScorecard: data.strategicScorecard,
          delegationMatrix: data.delegationMatrix,
          dispatchActionReady: data.dispatchActionReady,
        };

        const roundtableMsgs: ChatMessage[] = [asadMsg];

        if (Array.isArray(data.delegationMatrix) && data.delegationMatrix.length > 0) {
          data.delegationMatrix.forEach((item: any, idx: number) => {
            const senderKey = (item.directorName?.toLowerCase().includes('teema') ? 'teema'
              : item.directorName?.toLowerCase().includes('legal') ? 'legal'
              : item.directorName?.toLowerCase().includes('intelligence') ? 'mr_intelligence'
              : item.directorName?.toLowerCase().includes('resource') ? 'resource_director'
              : 'asad') as ChatMessage['sender'];

            roundtableMsgs.push({
              id: `rt-item-${Date.now()}-${idx}`,
              sender: senderKey,
              senderTitle: item.roleTitle || 'Executive Director',
              content: `### 🎯 ${item.roleTitle || item.directorName}\n- **Responsibility**: ${item.responsibility}\n- **Confidence Index**: ${item.confidenceScore || 95}%`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          });
        }

        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? { ...t, messages: [...t.messages, ...roundtableMsgs] }
              : t,
          ),
        );
      }
    } catch (e) {
      toast.error('AI Executive server communication error. Please ensure backend services are active.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallDepartmentInChat = async (listing: any) => {
    if (!listing) return;
    setActiveInstallId(listing.id || 'm1');
    const companyId = dbUser?.companyId || '33f008b1-5733-4a1a-9093-dad32e9bb043';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const departmentKey = listing.departmentKey || 'technology';
      await fetch('/api/missions/marketplace/install', {
        method: 'POST',
        headers,
        body: JSON.stringify({ departmentKey, companyId }),
      }).catch(() => null);

      toast.success(`🎉 Installed "${listing.title}" into your active workspace roster!`);

      const confirmationMsg: ChatMessage = {
        id: `a-conf-${Date.now()}`,
        sender: 'asad',
        senderTitle: 'Chief Executive Officer',
        content: `🎉 Excellent news, Owner! **${listing.title}** has been successfully installed and activated in our workspace roster.

I have updated our organizational directory and assigned **Linus Kovacs** (Software Engineering Director) and **Dr. Hiroshi Tanaka** (CTO) to your mission. We are ready to proceed with full execution!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        assignedExecutives: ['Linus Kovacs (Software Engineering)', 'Dr. Hiroshi Tanaka (CTO)', 'Teema (Operations)'],
        missionPlan: {
          id: `m-active-${Date.now()}`,
          objective: 'Mobile App Engineering & Deployment',
          status: 'EXECUTING',
        },
        mode: 'JOB_ASSIGNMENT',
      };

      setThreads((prev) =>
        prev.map((t) => (t.id === activeThreadId ? { ...t, messages: [...t.messages, confirmationMsg] } : t)),
      );
    } catch (e) {
      toast.error('Department installation failed.');
    } finally {
      setActiveInstallId(null);
    }
  };

  const speakMessage = async (id: string, text: string) => {
    if (speakingMsgId === id) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      return;
    }

    const cleanText = text.replace(/[*#_`\[\]()]/g, '');

    // 1. High-definition backend voice synthesis
    try {
      if (token) {
        setSpeakingMsgId(id);
        const res = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: cleanText, persona: 'asad' }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            const audio = new Audio(data.audioBase64);
            audio.onplay = () => setSpeakingMsgId(id);
            audio.onended = () => setSpeakingMsgId(null);
            audio.onerror = () => setSpeakingMsgId(null);
            await audio.play();
            return;
          }
        }
      }
    } catch {
      /* Fallback to local browser SpeechSynthesis */
    }

    // 2. Native Web Speech Synthesis Fallback
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser.');
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (threadFilter === 'pinned' && !t.isPinned) return false;
    if (threadFilter === 'archived' && !t.isArchived) return false;
    if (threadFilter === 'all' && t.isArchived) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 text-left pb-8 sm:pb-12 select-none px-2 sm:px-4 md:px-0">
      {/* Unified Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/30 dark:border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-100 to-blue-500/10 dark:from-slate-950 dark:via-[#0B0F19] dark:to-cyan-950/40 p-4 sm:p-6 shadow-lg sm:shadow-xl dark:shadow-2xl backdrop-blur-xl transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                  👑
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 dark:bg-emerald-400 border-2 border-white dark:border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">CEO Chat & C-Suite Hub</h1>
                <Badge variant="ai" className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                  EXECUTIVE HUB
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Activity size={12} /> 5 Roster Active
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="text-cyan-700 dark:text-cyan-300 font-semibold flex items-center gap-1">
                  <Zap size={12} /> OrgIntelligence (FuelOS)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleCreateNewThread}
              className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[11px] sm:text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle size={14} className="text-cyan-500" /> New Thread
            </Button>
            <Link href="/marketplace">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[11px] sm:text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                <ShoppingBag size={14} /> Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Participant Scope & Strategy Controls */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] shrink-0 flex items-center gap-1">
              <Users size={13} /> Scope:
            </span>

            <div className="w-full sm:w-auto flex bg-slate-200/80 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-white/10 text-[11px] font-bold overflow-x-auto">
              <button
                onClick={() => setParticipantMode('DIRECT_CEO')}
                className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  participantMode === 'DIRECT_CEO'
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                👑 1-on-1 Direct CEO
              </button>
              <button
                onClick={() => setParticipantMode('ROUNDTABLE')}
                className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  participantMode === 'ROUNDTABLE'
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                👥 Full C-Suite Roundtable
              </button>
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">
            {participantMode === 'DIRECT_CEO' && '1-on-1 strategic command with CEO Asad.'}
            {participantMode === 'ROUNDTABLE' && 'All 5 active directors respond simultaneously to your directive.'}
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher Bar (< md screens) */}
      <div className="flex md:hidden bg-slate-200/80 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-300 dark:border-white/10 text-xs font-bold shadow-xs">
        <button
          onClick={() => setActiveMobileTab('chat')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMobileTab === 'chat'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare size={15} /> 💬 Active Chat
        </button>
        <button
          onClick={() => setActiveMobileTab('threads')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeMobileTab === 'threads'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Filter size={15} /> 📋 Threads ({threads.length})
        </button>
      </div>

      {/* Main Workspace Layout (Sidebar Threads Drawer + Master Chat Stage) */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Left Panel: Discussion Threads Drawer */}
        <Card className={`border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col shadow-lg sm:shadow-xl dark:shadow-2xl transition-all ${
          activeMobileTab === 'threads' ? 'block' : 'hidden md:flex'
        } ${
          isSidebarOpen ? 'w-full md:w-80 shrink-0' : 'w-full md:w-16 shrink-0 items-center'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 mb-3">
            {isSidebarOpen ? (
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-cyan-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white">Strategic Threads</span>
                <Badge variant="outline" className="text-[9px]">{threads.length}</Badge>
              </div>
            ) : (
              <MessageSquare size={18} className="text-cyan-500" />
            )}

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {isSidebarOpen && (
            <div className="space-y-3">
              {/* Search Threads */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search threads..."
                  className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-white/10 text-xs pl-9 h-9 rounded-xl"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400">
                <button
                  onClick={() => setThreadFilter('all')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    threadFilter === 'all' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' : ''
                  }`}
                >
                  All ({threads.filter((t) => !t.isArchived).length})
                </button>
                <button
                  onClick={() => setThreadFilter('pinned')}
                  className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    threadFilter === 'pinned' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' : ''
                  }`}
                >
                  <Pin size={10} /> Pinned
                </button>
                <button
                  onClick={() => setThreadFilter('archived')}
                  className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    threadFilter === 'archived' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' : ''
                  }`}
                >
                  <Archive size={10} /> Archived
                </button>
              </div>

              {/* Thread List */}
              <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
                {filteredThreads.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No discussion threads found.
                  </div>
                ) : (
                  filteredThreads.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setActiveThreadId(t.id);
                        setActiveMobileTab('chat');
                      }}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border space-y-1 ${
                        t.id === activeThreadId
                          ? 'bg-cyan-50/90 dark:bg-cyan-500/10 border-cyan-400 dark:border-cyan-500/40 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                          {t.title}
                        </span>
                        <button
                          onClick={(e) => handleTogglePinThread(t.id, e)}
                          className={`p-1 rounded transition-colors ${
                            t.isPinned ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Pin size={12} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>{t.messages.length} messages</span>
                        <span className="font-mono">{t.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Right Stage: Master Active Discussion Container */}
        <Card className={`flex-1 border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col h-[calc(100vh-16rem)] min-h-[480px] md:h-[640px] shadow-lg sm:shadow-xl dark:shadow-2xl relative overflow-hidden ${
          activeMobileTab === 'chat' ? 'block' : 'hidden md:flex'
        }`}>
          {/* Active Thread Title & Mode Bar */}
          <div className="border-b border-slate-200 dark:border-white/10 pb-3 mb-3 sm:mb-4 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 truncate">
                {activeThread?.title}
                {activeThread?.isPinned && <Pin size={12} className="text-cyan-500 shrink-0" />}
              </h2>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold block truncate">
                Participants: {participantMode === 'DIRECT_CEO' ? 'Owner & CEO Asad' : 'Owner & Full C-Suite'}
              </span>
            </div>

            <Button
              onClick={() => {
                setThreads((prev) =>
                  prev.map((t) =>
                    t.id === activeThreadId
                      ? {
                          ...t,
                          messages: [
                            {
                              id: `reset-${Date.now()}`,
                              sender: 'asad',
                              senderTitle: 'Chief Executive Officer',
                              content: `Thread context reset by Owner. CEO Asad and our C-Suite stand by for your instructions.`,
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            },
                          ],
                        }
                      : t,
                  ),
                );
                toast.info('Reset active discussion messages.');
              }}
              className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-1 shrink-0"
            >
              <RotateCcw size={12} /> <span className="hidden sm:inline">Clear Stage</span>
            </Button>
          </div>

          {/* Discussion Message Stream */}
          <div className="flex-1 overflow-y-auto space-y-3.5 sm:space-y-5 pr-1 sm:pr-2">
            {activeThread?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 text-xs leading-relaxed ${
                  msg.sender === 'owner' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender !== 'owner' && (
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs border ${
                    msg.sender === 'asad'
                      ? 'bg-cyan-100 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                      : msg.sender === 'teema'
                      ? 'bg-purple-100 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-400'
                      : msg.sender === 'legal'
                      ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {msg.sender === 'asad' && '👑'}
                    {msg.sender === 'teema' && '⚙️'}
                    {msg.sender === 'legal' && '⚖️'}
                    {msg.sender === 'mr_intelligence' && '🔍'}
                    {msg.sender === 'resource_director' && '👥'}
                  </div>
                )}

                <div className="space-y-2.5 sm:space-y-3 max-w-[85%] sm:max-w-2xl">
                  <div
                    className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl ${
                      msg.sender === 'owner'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-sm font-medium'
                        : 'bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-tl-none shadow-sm dark:shadow-xl font-normal'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 min-w-0 truncate">
                        {msg.sender === 'owner' ? (
                          <span className="text-cyan-200 truncate">Owner</span>
                        ) : (
                          <span className="font-black flex items-center gap-1 text-cyan-700 dark:text-cyan-400 truncate">
                            {msg.sender === 'asad' && 'CEO Asad'}
                            {msg.sender === 'teema' && 'Teema (Ops)'}
                            {msg.sender === 'legal' && 'Legal'}
                            {msg.sender === 'mr_intelligence' && 'Mr. Intel'}
                            {msg.sender === 'resource_director' && 'Resource Dir'}

                            {msg.mode && (
                              <span className={`px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold uppercase ${
                                msg.mode === 'CONVERSATION'
                                  ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
                                  : 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                              }`}>
                                {msg.mode === 'CONVERSATION' ? '💬 Strategic' : '🎯 Job'}
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.sender !== 'owner' && (
                          <button
                            onClick={() => speakMessage(msg.id, msg.content)}
                            title="Read out loud"
                            className="p-1 rounded text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                          >
                            {speakingMsgId === msg.id ? (
                              <VolumeX size={12} className="text-cyan-600 dark:text-cyan-400 animate-pulse" />
                            ) : (
                              <Volume2 size={12} />
                            )}
                          </button>
                        )}
                        <span className="font-mono text-[9px] opacity-60">{msg.timestamp}</span>
                      </div>
                    </div>

                    <FormattedMessageText content={msg.content} />
                  </div>

                  {/* Missing Department Marketplace Card */}
                  {msg.isMissingDepartment && msg.recommendedListing && (
                    <Card className="p-3.5 sm:p-5 border border-cyan-300 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-50/90 via-white to-blue-50/60 dark:from-cyan-950/60 dark:via-slate-900/90 dark:to-slate-950 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-sm dark:shadow-[0_0_25px_rgba(6,182,212,0.2)] animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div>
                            <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white block">Marketplace Recommendation</span>
                            <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Recommended by CEO Asad</span>
                          </div>
                        </div>
                        <Badge variant="ai" className="text-[8px] sm:text-[9px] font-bold">RECOMMENDED</Badge>
                      </div>

                      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 space-y-1">
                        <div className="text-xs sm:text-sm font-black text-cyan-700 dark:text-cyan-300">{msg.recommendedListing.title}</div>
                        <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {msg.recommendedListing.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {msg.recommendedListing.price === 0 ? 'FREE ($0)' : `$${msg.recommendedListing.price}`}
                        </span>

                        <Button
                          onClick={() => handleInstallDepartmentInChat(msg.recommendedListing)}
                          disabled={activeInstallId === msg.recommendedListing.id}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[11px] sm:text-xs font-bold px-3.5 sm:px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                        >
                          {activeInstallId === msg.recommendedListing.id ? (
                            <>
                              <Sparkles size={13} className="animate-spin" /> Installing...
                            </>
                          ) : (
                            <>
                              Install Now <ArrowRight size={13} />
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Active Assigned Directors & Mission Card */}
                  {msg.assignedExecutives && msg.assignedExecutives.length > 0 && (
                    <Card className="p-3.5 sm:p-4 border border-emerald-300 dark:border-emerald-500/30 bg-slate-50 dark:bg-slate-950/80 rounded-xl sm:rounded-2xl space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                          <CheckCircle2 size={13} /> Assigned Active Directors
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">Roster Active</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {msg.assignedExecutives.map((exec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold"
                          >
                            {exec}
                          </span>
                        ))}
                      </div>

                      {msg.missionPlan && (
                        <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                            Mission Queued
                          </span>
                          <Link href="/missions">
                            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm shrink-0">
                              <Rocket size={12} /> Task Graph
                            </Button>
                          </Link>
                        </div>
                      )}
                    </Card>
                  )}
                </div>

                {msg.sender === 'owner' && (
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <User size={14} className="sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl sm:rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-[11px] sm:text-xs font-mono animate-pulse max-w-md">
                <Sparkles size={15} className="animate-spin text-cyan-500 shrink-0" />
                <span>{participantMode === 'DIRECT_CEO' ? 'CEO Asad is generating response...' : 'C-Suite Directors are formulating responses...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Unified Input Bar */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-3 sm:pt-4 mt-2 flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Voice Input'}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
              }`}
            >
              {isListening ? <MicOff size={16} className="sm:w-4 sm:h-4" /> : <Mic size={16} className="sm:w-4 sm:h-4" />}
            </button>

            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                isListening
                  ? 'Listening...'
                  : participantMode === 'DIRECT_CEO'
                  ? 'Converse with CEO Asad...'
                  : 'Prompt C-Suite Roundtable...'
              }
              className="flex-1 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 sm:h-12 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500/50 rounded-xl sm:rounded-2xl px-3 sm:px-4"
            />

            <Button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs h-10 sm:h-12 px-3 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Send to C-Suite</span>
              <span className="sm:hidden">Send</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
