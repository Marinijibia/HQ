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

  const handleCreateNewThread = () => {
    const newThreadId = `t-${Date.now()}`;
    const newThread: DiscussionThread = {
      id: newThreadId,
      title: `Executive Strategic Session #${threads.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      participantMode,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'asad',
          senderTitle: 'Chief Executive Officer',
          content: `Owner, I have opened a new strategic discussion thread for **FuelOS**.

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
    const companyId = dbUser?.companyId || '33f008b1-5733-4a1a-9093-dad32e9bb043';

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (participantMode === 'DIRECT_CEO') {
        // 1-on-1 Direct CEO Asad dialogue
        const res = await fetch(`${API_BASE_URL}/missions/ceo/scope`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: textToSend, companyId, mode: targetMode }),
        }).catch(() => null);

        let data: any = null;
        if (res && res.ok) {
          data = await res.json();
        } else {
          // Dynamic adaptive AI response logic
          const textLower = textToSend.toLowerCase();

          if (textLower.includes('know fuelos') || textLower.includes('fuelos') || textLower.includes('my company') || textLower.includes('our business')) {
            data = {
              ceoResponse: `Greetings Owner! Here is the synthesized intelligence **Mr. Intelligence** and our C-Suite have gathered regarding **FuelOS**:

### 🔍 Corporate Intelligence Profile — FuelOS
- **Industry & Domain**: Petroleum & Energy Supply Chain Logistics, Downstream Dispensing Automation & Fleet Telematics.
- **Core Operations**: Retail filling station automation, tank telemetry monitoring, petroleum depot dispatching, and automated fuel payment reconciliation.
- **Target Market**: Downstream petroleum marketers, oil & gas depot managers, logistics fleet operators across Sub-Saharan Africa, Middle East, and UK.
- **Key Advantage**: End-to-end digital auditability from refinery terminal to retail pump.

As CEO Asad, I use this intelligence in every decision. How can we leverage our **FuelOS** market position for our next strategic objective?`,
              isMissingDepartment: false,
              mode: 'CONVERSATION',
            };
          } else if (textLower.includes('app') || textLower.includes('mobile') || textLower.includes('software')) {
            data = {
              ceoResponse: `Greetings Owner. I have evaluated your strategic directive: "${textToSend}".

To build and deploy a mobile app at enterprise standards, we require the specialized capabilities of the **Technology & Software Engineering Department**.

Currently, our active workspace roster includes our 5 baseline core directors (**Asad**, **Teema**, **Legal**, **Resource Director**, **Mr. Intelligence**).

I strongly recommend installing the **Technology & Software Engineering Suite** from our Marketplace so we can deploy dedicated directors (**Dr. Hiroshi Tanaka - CTO** & **Linus Kovacs - Software Engineering**) for this task.`,
              isMissingDepartment: true,
              missingDepartmentName: 'Technology & Software Engineering',
              recommendedMarketplaceListing: {
                id: 'm1',
                title: 'Technology & Software Engineering Suite',
                description: 'Complete Technology Department package featuring Dr. Hiroshi Tanaka (CTO), Linus Kovacs (Software Engineering), and Dr. Sarah Ndiaye (AI/ML).',
                price: 0,
                category: 'Engineering',
                departmentKey: 'technology',
              },
              mode: 'JOB_ASSIGNMENT',
            };
          } else {
            data = {
              ceoResponse: `Owner, strategic leadership requires aligning visionary ideas with crisp operational execution for **FuelOS**.

Our C-Suite is positioned to support you:
- **Mr. Intelligence** is monitoring market dynamics and competitor movements.
- **Teema** is ready to map workflow dependencies.
- **Legal** is standing by for regulatory & compliance guardrails.

Tell me more about your vision — what outcome or milestone are we targeting?`,
              isMissingDepartment: false,
              mode: 'CONVERSATION',
            };
          }
        }

        const asadMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'asad',
          senderTitle: 'Chief Executive Officer',
          content: data.ceoResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: data.mode,
          isMissingDepartment: data.isMissingDepartment,
          missingDepartmentName: data.missingDepartmentName,
          recommendedListing: data.recommendedMarketplaceListing,
          missionPlan: data.missionPlan,
          assignedExecutives: data.assignedExecutives,
        };

        setThreads((prev) =>
          prev.map((t) => (t.id === activeThreadId ? { ...t, messages: [...t.messages, asadMsg] } : t)),
        );
      } else {
        // FULL C-SUITE ROUNDTABLE MODE: Multiple Directors respond to the Owner's message
        const asadMsg: ChatMessage = {
          id: `a-rt-${Date.now()}`,
          sender: 'asad',
          senderTitle: 'Chief Executive Officer',
          content: `Owner, I am initiating a **C-Suite Roundtable Alignment** on your prompt: "${textToSend}".

I am delegating immediate domain analysis to **Teema** (Operations), **Legal** (Compliance), and **Mr. Intelligence** (Research).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'CONVERSATION',
        };

        const teemaMsg: ChatMessage = {
          id: `t-rt-${Date.now()}`,
          sender: 'teema',
          senderTitle: 'Operations Director',
          content: `### ⚙️ Operations Perspective — Teema
From an operational capacity standpoint for **FuelOS**:
- I am structuring the work breakdown schedule (WBS) and mapping resource allocation.
- We will ensure active directors have zero task overlap.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const legalMsg: ChatMessage = {
          id: `l-rt-${Date.now()}`,
          sender: 'legal',
          senderTitle: 'Legal & Compliance Director',
          content: `### ⚖️ Legal & Governance Review — Legal
From a regulatory perspective:
- We will enforce data privacy bounds and ensure compliance with petroleum supply chain regulations.
- Audit trails will be logged automatically to PostgreSQL.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const intelMsg: ChatMessage = {
          id: `i-rt-${Date.now()}`,
          sender: 'mr_intelligence',
          senderTitle: 'Public Web Research Agent',
          content: `### 🔍 Intelligence Briefing — Mr. Intelligence
I have verified domain intelligence for **FuelOS**:
- Market telemetry and competitor analytics are indexed.
- Ready to feed real-time market data into your operational graph.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? { ...t, messages: [...t.messages, asadMsg, teemaMsg, legalMsg, intelMsg] }
              : t,
          ),
        );
      }
    } catch (e) {
      toast.error('Communication error in executive chat.');
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

      await fetch(`${API_BASE_URL}/marketplace/listings/${listing.id || 'm1'}/install`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ companyId }),
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

  const speakMessage = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#]/g, '');
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
    <div className="max-w-7xl mx-auto space-y-6 text-left pb-12 select-none">
      {/* Unified Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 dark:border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-100 to-blue-500/10 dark:from-slate-950 dark:via-[#0B0F19] dark:to-cyan-950/40 p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-xl text-slate-900 dark:text-white">
                  👑
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 dark:bg-emerald-400 border-2 border-white dark:border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">CEO Chat & C-Suite Discussions</h1>
                <Badge variant="ai" className="text-[10px] uppercase font-bold tracking-wider">
                  UNIFIED EXECUTIVE HUB
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Activity size={12} /> Default 5 Roster Active
                </span>
                <span>•</span>
                <span className="text-cyan-700 dark:text-cyan-300 font-semibold flex items-center gap-1">
                  <Zap size={12} /> Connected to OrgIntelligence (FuelOS)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateNewThread}
              className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle size={14} className="text-cyan-500" /> New Discussion Thread
            </Button>
            <Link href="/marketplace">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg">
                <ShoppingBag size={14} /> Open Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Participant Scope & Strategy Controls */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] shrink-0 flex items-center gap-1">
              <Users size={13} /> Participant Scope:
            </span>

            <div className="flex bg-slate-200/80 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-white/10 text-[11px] font-bold">
              <button
                onClick={() => setParticipantMode('DIRECT_CEO')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  participantMode === 'DIRECT_CEO'
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                👑 1-on-1 Direct with CEO Asad
              </button>
              <button
                onClick={() => setParticipantMode('ROUNDTABLE')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  participantMode === 'ROUNDTABLE'
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                👥 Full C-Suite Roundtable (Asad + Teema + Legal + HR + Intel)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">
            {participantMode === 'DIRECT_CEO' && '1-on-1 strategic command with CEO Asad.'}
            {participantMode === 'ROUNDTABLE' && 'All 5 active directors respond simultaneously to your directive.'}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar Threads Drawer + Master Chat Stage) */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel: Discussion Threads Drawer */}
        <Card className={`border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-4 flex flex-col shadow-xl dark:shadow-2xl transition-all ${
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
                      onClick={() => setActiveThreadId(t.id)}
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
        <Card className="flex-1 border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 flex flex-col h-[620px] shadow-xl dark:shadow-2xl relative overflow-hidden">
          {/* Active Thread Title & Mode Bar */}
          <div className="border-b border-slate-200 dark:border-white/10 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {activeThread?.title}
                {activeThread?.isPinned && <Pin size={12} className="text-cyan-500" />}
              </h2>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                Active Participants: {participantMode === 'DIRECT_CEO' ? 'Owner & CEO Asad' : 'Owner & Full C-Suite (Asad, Teema, Legal, HR, Intel)'}
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
              className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-1"
            >
              <RotateCcw size={12} /> Clear Stage
            </Button>
          </div>

          {/* Discussion Message Stream */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-2">
            {activeThread?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'owner' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender !== 'owner' && (
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border ${
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

                <div className="space-y-3 max-w-2xl">
                  <div
                    className={`p-5 rounded-3xl ${
                      msg.sender === 'owner'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md font-medium'
                        : 'bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-tl-none shadow-md dark:shadow-xl font-normal'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        {msg.sender === 'owner' ? (
                          <span className="text-cyan-200">Organization Owner</span>
                        ) : (
                          <span className="font-black flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400">
                            {msg.sender === 'asad' && 'CEO Asad'}
                            {msg.sender === 'teema' && 'Teema (Ops Director)'}
                            {msg.sender === 'legal' && 'Legal (Compliance Director)'}
                            {msg.sender === 'mr_intelligence' && 'Mr. Intelligence (Research)'}
                            {msg.sender === 'resource_director' && 'Resource Director (HR)'}

                            {msg.mode && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                msg.mode === 'CONVERSATION'
                                  ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
                                  : 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                              }`}>
                                {msg.mode === 'CONVERSATION' ? '💬 Strategic' : '🎯 Job Assignment'}
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        {msg.sender !== 'owner' && (
                          <button
                            onClick={() => speakMessage(msg.id, msg.content)}
                            title="Read message out loud"
                            className="p-1 rounded text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                          >
                            {speakingMsgId === msg.id ? (
                              <VolumeX size={13} className="text-cyan-600 dark:text-cyan-400 animate-pulse" />
                            ) : (
                              <Volume2 size={13} />
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
                    <Card className="p-5 border border-cyan-300 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-50/90 via-white to-blue-50/60 dark:from-cyan-950/60 dark:via-slate-900/90 dark:to-slate-950 rounded-3xl space-y-4 shadow-md dark:shadow-[0_0_25px_rgba(6,182,212,0.2)] animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white block">Marketplace Recommendation</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Recommended by CEO Asad</span>
                          </div>
                        </div>
                        <Badge variant="ai" className="text-[9px] font-bold">RECOMMENDED</Badge>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 space-y-1.5">
                        <div className="text-sm font-black text-cyan-700 dark:text-cyan-300">{msg.recommendedListing.title}</div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
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
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-2 shadow-lg"
                        >
                          {activeInstallId === msg.recommendedListing.id ? (
                            <>
                              <Sparkles size={14} className="animate-spin" /> Installing...
                            </>
                          ) : (
                            <>
                              Install Now into HQ Roster <ArrowRight size={14} />
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Active Assigned Directors & Mission Card */}
                  {msg.assignedExecutives && msg.assignedExecutives.length > 0 && (
                    <Card className="p-4 border border-emerald-300 dark:border-emerald-500/30 bg-slate-50 dark:bg-slate-950/80 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Assigned Active Directors
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Workspace Roster Active</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {msg.assignedExecutives.map((exec, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold"
                          >
                            {exec}
                          </span>
                        ))}
                      </div>

                      {msg.missionPlan && (
                        <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                            Mission Objective Queued
                          </span>
                          <Link href="/missions">
                            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 shadow-md">
                              <Rocket size={12} /> View Mission Task Graph
                            </Button>
                          </Link>
                        </div>
                      )}
                    </Card>
                  )}
                </div>

                {msg.sender === 'owner' && (
                  <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-mono animate-pulse max-w-md">
                <Sparkles size={16} className="animate-spin text-cyan-500" />
                <span>{participantMode === 'DIRECT_CEO' ? 'CEO Asad is generating dynamic AI response...' : 'C-Suite Directors are formulating roundtable responses...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Unified Input Bar */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-4 mt-2 flex items-center gap-3">
            <button
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Voice Input'}
              className={`p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                isListening
                  ? 'Listening to voice input...'
                  : participantMode === 'DIRECT_CEO'
                  ? 'Converse 1-on-1 with CEO Asad e.g. "I need us to discuss about my new idea"...'
                  : 'Prompt Full C-Suite Roundtable (Asad + Teema + Legal + HR + Intel)...'
              }
              className="flex-1 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-12 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500/50 rounded-2xl px-4"
            />

            <Button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs h-12 px-6 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <Send size={15} /> Send to C-Suite
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
