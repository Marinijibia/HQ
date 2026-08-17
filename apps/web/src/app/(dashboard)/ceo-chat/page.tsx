'use client';

import * as React from 'react';
import { Card, Button, Input, Badge } from '@hq/ui';
import {
  Send,
  Sparkles,
  User,
  ShoppingBag,
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
  Users,
  PlusCircle,
  Pin,
  Archive,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Bot,
  Target,
  Shield,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

type ParticipantMode =
  | 'DIRECT_CEO'
  | 'DIRECT_TEEMA'
  | 'DIRECT_LEGAL'
  | 'DIRECT_INTELLIGENCE'
  | 'DIRECT_RESOURCE'
  | 'ROUNDTABLE';

const EXECUTIVE_CONFIG: Record<
  ParticipantMode,
  {
    key: ChatMessage['sender'];
    name: string;
    title: string;
    icon: string;
    placeholder: string;
    headerTitle: string;
    tag: string;
    description: string;
    suggestionChips: string[];
  }
> = {
  DIRECT_CEO: {
    key: 'asad',
    name: 'CEO Asad',
    title: 'Chief Executive Officer',
    icon: '👑',
    placeholder: 'Direct CEO Asad on corporate strategy...',
    headerTitle: 'CEO Asad • Strategic Directive',
    tag: '👑 CEO Asad',
    description: 'Direct strategic command, vision alignment, and company scaling.',
    suggestionChips: [
      'What is our top strategic priority today?',
      'How should we accelerate B2C revenue growth?',
      'Identify top operational bottlenecks in our workflow',
    ],
  },
  DIRECT_TEEMA: {
    key: 'teema',
    name: 'Teema (Ops)',
    title: 'Operations Director',
    icon: '⚙️',
    placeholder: 'Consult Teema on operational workflows & sprints...',
    headerTitle: 'Teema • Operations & Sprints',
    tag: '⚙️ Teema (Ops)',
    description: 'Sprint planning, resource orchestration, and daily execution.',
    suggestionChips: [
      'Draft an operational sprint roadmap',
      'Optimize our deployment pipeline turnaround time',
      'Allocate cross-departmental delivery milestones',
    ],
  },
  DIRECT_LEGAL: {
    key: 'legal',
    name: 'Legal Director',
    title: 'Compliance & Risk Director',
    icon: '⚖️',
    placeholder: 'Consult Legal on regulatory risk & compliance...',
    headerTitle: 'Legal & Risk Audit',
    tag: '⚖️ Legal (Risk)',
    description: 'Regulatory audits, risk mitigation, and compliance frameworks.',
    suggestionChips: [
      'Review compliance risks for user data retention',
      'Audit our SLA and partner vendor agreements',
      'Prepare enterprise security compliance checklist',
    ],
  },
  DIRECT_INTELLIGENCE: {
    key: 'mr_intelligence',
    name: 'Mr. Intelligence',
    title: 'Market Research & Signals',
    icon: '🔍',
    placeholder: 'Consult Mr. Intelligence on market intelligence...',
    headerTitle: 'Mr. Intelligence • Live Research',
    tag: '🔍 Mr. Intel',
    description: 'Web intelligence, market trend scouting, and competitive signals.',
    suggestionChips: [
      'Scout top emerging competitor trends in AI ops',
      'Analyze market sentiment around our product category',
      'Find recent technological breakthroughs in automated workflows',
    ],
  },
  DIRECT_RESOURCE: {
    key: 'resource_director',
    name: 'Resource Dir',
    title: 'Human Resources & Talent',
    icon: '👥',
    placeholder: 'Consult Resource Director on talent & headcount...',
    headerTitle: 'Resource & Talent Management',
    tag: '👥 Resource Dir',
    description: 'Team bandwidth, hiring needs, and specialist coordination.',
    suggestionChips: [
      'Assess current team bandwidth and capacity',
      'Recommend specialist hiring roadmap for next quarter',
      'Optimize departmental workload distribution',
    ],
  },
  ROUNDTABLE: {
    key: 'asad',
    name: 'C-Suite Roundtable',
    title: 'Executive Board',
    icon: '🌐',
    placeholder: 'Prompt all 5 directors simultaneously...',
    headerTitle: 'Full C-Suite Executive Roundtable',
    tag: '🌐 Roundtable',
    description: 'Simultaneous cross-functional deliberation across all directors.',
    suggestionChips: [
      'Align all departments on our primary quarterly mission',
      'Review risk, operational readiness, and talent for new launch',
      'Formulate comprehensive expansion strategy',
    ],
  },
};

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
    roleKey?: string;
  }[];
  dispatchActionReady?: boolean;
}

interface DiscussionThread {
  id: string;
  title: string;
  timestamp: string;
  participantMode: ParticipantMode;
  isPinned?: boolean;
  isArchived?: boolean;
  messages: ChatMessage[];
}

// Markdown Formatted Text Renderer
function FormattedMessageText({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ### or ## or #
        if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
          return (
            <div
              key={idx}
              className="font-extrabold text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm mt-3 mb-1.5 flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-cyan-500 shrink-0" />
              {line.replace(/^#+\s*/, '')}
            </div>
          );
        }

        // Bullet point - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[-*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-cyan-500 dark:text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="text-slate-800 dark:text-slate-200">{formatBoldText(itemText)}</span>
            </div>
          );
        }

        // Numbered list 1. 2.
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.split('.')[0];
          const rest = trimmed.replace(/^\d+\.\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold shrink-0 mt-0.5">
                {num}
              </span>
              <span className="text-slate-800 dark:text-slate-200">{formatBoldText(rest)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-800 dark:text-slate-200">
            {formatBoldText(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={i}
          className="font-black text-slate-950 dark:text-white bg-cyan-100/70 dark:bg-cyan-500/20 px-1 py-0.2 rounded"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function CeoChatAndDiscussionsPageContent() {
  const { dbUser, token } = useAuth();
  const searchParams = useSearchParams();
  const execParam = searchParams.get('exec')?.toLowerCase();
  const companyName = (dbUser as any)?.company?.name || (dbUser as any)?.companyName || 'Organization';

  // Initial default thread
  const defaultInitialThread: DiscussionThread = {
    id: 'default-session',
    title: 'Strategic Briefing & Directives',
    timestamp: 'Active Now',
    participantMode: 'DIRECT_CEO',
    messages: [],
  };

  const [threads, setThreads] = React.useState<DiscussionThread[]>([defaultInitialThread]);
  const [activeThreadId, setActiveThreadId] = React.useState<string>('default-session');
  const [participantMode, setParticipantMode] = React.useState<ParticipantMode>('DIRECT_CEO');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [threadFilter, setThreadFilter] = React.useState<'all' | 'pinned' | 'archived'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [activeMobileTab, setActiveMobileTab] = React.useState<'chat' | 'threads'>('chat');

  // Input & action state
  const [inputMessage, setInputMessage] = React.useState('');
  const [activeMode, setActiveMode] = React.useState<'AUTO' | 'CONVERSATION' | 'JOB_ASSIGNMENT'>('AUTO');
  const [loading, setLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [speakingMsgId, setSpeakingMsgId] = React.useState<string | null>(null);
  const [activeInstallId, setActiveInstallId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Active thread lookup with reliable fallback
  const activeThread = React.useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || threads[0] || defaultInitialThread;
  }, [threads, activeThreadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages?.length, loading]);

  // Handle URL exec parameter (?exec=teema)
  React.useEffect(() => {
    if (!execParam) return;
    let targetMode: ParticipantMode = 'DIRECT_CEO';
    if (execParam.includes('teema') || execParam.includes('coo') || execParam.includes('op')) {
      targetMode = 'DIRECT_TEEMA';
    } else if (execParam.includes('legal') || execParam.includes('compliance')) {
      targetMode = 'DIRECT_LEGAL';
    } else if (execParam.includes('intel') || execParam.includes('research') || execParam.includes('search')) {
      targetMode = 'DIRECT_INTELLIGENCE';
    } else if (execParam.includes('resource') || execParam.includes('hr') || execParam.includes('team')) {
      targetMode = 'DIRECT_RESOURCE';
    } else if (execParam.includes('roundtable') || execParam.includes('board')) {
      targetMode = 'ROUNDTABLE';
    }

    setParticipantMode(targetMode);
  }, [execParam]);

  // Fetch threads from backend
  const loadConversations = React.useCallback(() => {
    if (!token) return;
    fetch('/api/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const dbThreads: DiscussionThread[] = data.map((conv: any) => ({
            id: conv.id,
            title: conv.title || conv.objective || 'Executive Strategic Session',
            timestamp: conv.createdAt
              ? new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Active',
            participantMode: conv.participantMode || 'DIRECT_CEO',
            isPinned: Boolean(conv.isPinned),
            isArchived: Boolean(conv.isArchived),
            messages: Array.isArray(conv.messages)
              ? conv.messages.map((m: any) => {
                  const isUser = m.senderType === 'USER' || m.senderRole === 'USER';
                  let senderKey: ChatMessage['sender'] = 'owner';
                  let senderTitle = 'Organization Owner';

                  if (!isUser) {
                    const typeLower = (m.senderType || '').toLowerCase();
                    const idLower = (m.senderId || '').toLowerCase();
                    if (idLower.includes('teema') || typeLower.includes('teema') || idLower.includes('ops') || typeLower.includes('operation')) {
                      senderKey = 'teema';
                      senderTitle = 'Operations Director';
                    } else if (idLower.includes('legal') || typeLower.includes('legal') || idLower.includes('compliance')) {
                      senderKey = 'legal';
                      senderTitle = 'Legal & Compliance Director';
                    } else if (idLower.includes('intel') || typeLower.includes('intel') || idLower.includes('research')) {
                      senderKey = 'mr_intelligence';
                      senderTitle = 'Public Search & Research Agent';
                    } else if (idLower.includes('resource') || typeLower.includes('resource') || idLower.includes('hr')) {
                      senderKey = 'resource_director';
                      senderTitle = 'Human Resources Director';
                    } else {
                      senderKey = 'asad';
                      senderTitle = 'Chief Executive Officer';
                    }
                  }

                  return {
                    id: m.id,
                    sender: senderKey,
                    senderTitle,
                    content: m.content,
                    timestamp: m.timestamp || m.createdAt
                      ? new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                })
              : [],
          }));

          setThreads(dbThreads);
          const savedActiveId = typeof window !== 'undefined' ? localStorage.getItem('hq_active_thread_id') : null;
          const matched = dbThreads.find((t) => t.id === savedActiveId);
          setActiveThreadId(matched ? matched.id : dbThreads[0].id);
        }
      })
      .catch(() => {});
  }, [token]);

  React.useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const selectActiveThread = (threadId: string) => {
    setActiveThreadId(threadId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hq_active_thread_id', threadId);
    }
  };

  const handleCreateNewThread = async () => {
    const titleText = `Strategic Session #${threads.length + 1}`;
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
      messages: [],
    };

    setThreads((prev) => [newThread, ...prev]);
    selectActiveThread(newThreadId);
    setInputMessage('');
    setActiveMobileTab('chat');
    toast.success('Started new strategic discussion session.');
  };

  const handleClearCurrentThread = async () => {
    const current = activeThread;
    if (!current) return;

    if (token && !current.id.startsWith('default-') && !current.id.startsWith('t-')) {
      try {
        await fetch(`/api/conversations/${current.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }

    setThreads((prev) => prev.map((t) => (t.id === current.id ? { ...t, messages: [] } : t)));
    toast.success('Conversation cleared');
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

    let targetThreadId = activeThreadId;

    // Immediately show user message in current active thread
    setThreads((prev) => {
      const exists = prev.some((t) => t.id === targetThreadId);
      if (!exists) {
        const fallback: DiscussionThread = {
          id: targetThreadId,
          title: textToSend.slice(0, 36) || 'Strategic Session',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          participantMode,
          messages: [userMsg],
        };
        return [fallback, ...prev];
      }
      return prev.map((t) => (t.id === targetThreadId ? { ...t, messages: [...t.messages, userMsg] } : t));
    });

    setLoading(true);
    const companyId = dbUser?.companyId || dbUser?.id || undefined;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Ensure conversation exists in DB
      if (token && (targetThreadId.startsWith('default-') || targetThreadId.startsWith('t-') || targetThreadId.startsWith('consult-'))) {
        try {
          const createRes = await fetch('/api/conversations', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              objective: textToSend.slice(0, 50) || 'Executive Strategic Session',
              specialistKeys: ['ceo', 'operations_director', 'legal_compliance_director', 'human_resources_director', 'public_search_agent'],
            }),
          });
          if (createRes.ok) {
            const created = await createRes.json();
            if (created?.id) {
              const oldId = targetThreadId;
              targetThreadId = created.id;
              selectActiveThread(targetThreadId);
              setThreads((prev) =>
                prev.map((t) => (t.id === oldId ? { ...t, id: targetThreadId, title: created.title || t.title } : t)),
              );
            }
          }
        } catch (e) {
          console.warn('Could not provision database conversation:', e);
        }
      }

      // 2. Persist user message to DB
      if (token && targetThreadId && !targetThreadId.startsWith('default-') && !targetThreadId.startsWith('t-')) {
        fetch(`/api/conversations/${targetThreadId}/messages/direct`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content: textToSend, senderType: 'USER' }),
        }).catch(() => {});
      }

      // 3. Trigger AI Executive Scoping with Persona awareness
      const res = await fetch('/api/missions/ceo/scope', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: textToSend,
          companyId,
          mode: targetMode,
          persona: participantMode,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const errText = errData?.message || (await res.text().catch(() => `HTTP ${res.status}`));
        throw new Error(errText || 'AI Executive Orchestrator unavailable');
      }

      const data = await res.json();

      if (participantMode !== 'ROUNDTABLE') {
        const cfg = EXECUTIVE_CONFIG[participantMode];
        const execMsg: ChatMessage = {
          id: `exec-${Date.now()}`,
          sender: cfg.key,
          senderTitle: cfg.title,
          content: data.ceoResponse || `Owner, I am addressing your strategic directive: "${textToSend}".`,
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
          prev.map((t) => (t.id === targetThreadId ? { ...t, messages: [...t.messages, execMsg] } : t)),
        );

        // Persist executive reply to DB
        if (token && targetThreadId && !targetThreadId.startsWith('default-') && !targetThreadId.startsWith('t-')) {
          fetch(`/api/conversations/${targetThreadId}/messages/direct`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content: execMsg.content, senderType: cfg.key.toUpperCase() }),
          }).catch(() => {});
        }
      } else {
        // Roundtable Mode
        const asadMsg: ChatMessage = {
          id: `a-rt-${Date.now()}`,
          sender: 'asad',
          senderTitle: 'Chief Executive Officer',
          content: data.ceoResponse || `Owner, I have convened our C-Suite Roundtable on: "${textToSend}".`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: data.mode,
          webResearchBriefing: data.webResearchBriefing,
          strategicScorecard: data.strategicScorecard,
          delegationMatrix: data.delegationMatrix,
          dispatchActionReady: data.dispatchActionReady,
        };

        const rMsgs: ChatMessage[] = [asadMsg];

        if (Array.isArray(data.delegationMatrix) && data.delegationMatrix.length > 0) {
          data.delegationMatrix.forEach((item: any, idx: number) => {
            const roleKey = (item.roleKey || '').toLowerCase();
            const senderKey = (roleKey.includes('ceo') ? 'asad'
              : roleKey.includes('operat') || roleKey.includes('coo') ? 'teema'
              : roleKey.includes('legal') || roleKey.includes('risk') ? 'legal'
              : roleKey.includes('intel') || roleKey.includes('research') ? 'mr_intelligence'
              : roleKey.includes('resource') || roleKey.includes('hr') ? 'resource_director'
              : 'asad') as ChatMessage['sender'];

            rMsgs.push({
              id: `rt-item-${Date.now()}-${idx}`,
              sender: senderKey,
              senderTitle: item.roleTitle || 'Executive Director',
              content: `### 🎯 ${item.roleTitle || item.directorName}\n- **Responsibility**: ${item.responsibility}\n- **Confidence Index**: ${item.confidenceScore || 95}%`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          });
        }

        setThreads((prev) =>
          prev.map((t) => (t.id === targetThreadId ? { ...t, messages: [...t.messages, ...rMsgs] } : t)),
        );

        if (token && targetThreadId && !targetThreadId.startsWith('default-') && !targetThreadId.startsWith('t-')) {
          fetch(`/api/conversations/${targetThreadId}/messages/direct`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content: asadMsg.content, senderType: 'EXECUTIVE' }),
          }).catch(() => {});
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Executive AI communication error. Please try again.';
      toast.error(errorMsg);

      // Fallback display so user never gets an empty screen
      const fallbackErrorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'asad',
        senderTitle: 'System Diagnostic',
        content: `**Notice from CEO Asad:**\n\nI was unable to complete the real-time AI scoping deliberation (${errorMsg}).\n\nPlease ensure backend services are running, or try resending your prompt.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setThreads((prev) =>
        prev.map((t) => (t.id === targetThreadId ? { ...t, messages: [...t.messages, fallbackErrorMsg] } : t)),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInstallDepartmentInChat = async (listing: any) => {
    if (!listing) return;
    setActiveInstallId(listing.id);
    try {
      if (token) {
        await fetch(`/api/marketplace/listings/${listing.id}/install`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      toast.success(`Successfully installed ${listing.title}!`);

      const assignedExecs =
        listing.departmentKey === 'technology'
          ? ['Marcus Vance (VP Engineering)', 'Elena Rostova (Lead Architect)']
          : listing.departmentKey === 'sales_marketing'
          ? ['Chloe Bennett (CMO)', 'David Vance (Growth Lead)']
          : ['Julian Sterling (CFO)', 'Sarah Jenkins (Controller)'];

      const confirmationMsg: ChatMessage = {
        id: `inst-conf-${Date.now()}`,
        sender: 'asad',
        senderTitle: 'Chief Executive Officer',
        content: [
          `**Update from CEO Asad:**\n\n`,
          `The **${listing.title}** has been installed into **${companyName}**'s workspace.\n\n`,
          `New leadership added to active roster:\n`,
          assignedExecs.map((e) => `- ${e}`).join('\n'),
          `\n\nWe are ready to proceed with full execution.`,
        ].join(''),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        assignedExecutives: assignedExecs,
        mode: 'JOB_ASSIGNMENT',
      };

      setThreads((prev) =>
        prev.map((t) => (t.id === activeThreadId ? { ...t, messages: [...t.messages, confirmationMsg] } : t)),
      );
    } catch {
      toast.error('Department installation failed.');
    } finally {
      setActiveInstallId(null);
    }
  };

  const speakMessage = (id: string, text: string) => {
    if (speakingMsgId === id) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast.error('Voice playback not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`\[\]()]/g, '');
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
      toast.error('Voice recognition is not supported in this browser.');
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
    } catch {
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
    <div className="h-[calc(100vh-7.5rem)] min-h-[580px] max-w-[1600px] mx-auto flex flex-col text-left">
      {/* Mobile Tab Switcher Bar */}
      <div className="flex md:hidden bg-slate-200/80 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold mb-2 shrink-0">
        <button
          onClick={() => setActiveMobileTab('chat')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'chat'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow font-black'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MessageSquare size={14} /> 💬 Active Chat
        </button>
        <button
          onClick={() => setActiveMobileTab('threads')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'threads'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow font-black'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Filter size={14} /> 📋 Threads & Scope ({threads.length})
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 sm:gap-4">
        {/* Left Column: Integrated Header Card (1) + Threads Drawer (2) */}
        <div
          className={`flex-col gap-3 shrink-0 ${
            activeMobileTab === 'threads' ? 'flex w-full' : 'hidden md:flex'
          } ${isSidebarOpen ? 'w-full md:w-80' : 'w-full md:w-16 items-center'}`}
        >
          {/* Card 1: Executive Hub & Direct Scope Selector */}
          <Card className="border border-cyan-500/20 dark:border-cyan-500/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-3.5 shadow-sm shrink-0 transition-all">
            {isSidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 p-[1.5px] shadow-sm flex items-center justify-center text-base">
                        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[9px] flex items-center justify-center font-bold">
                          👑
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h2 className="text-xs font-black text-slate-900 dark:text-white truncate">CEO & C-Suite Hub</h2>
                        <Badge variant="ai" className="text-[8px] font-bold px-1 py-0">AI</Badge>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Activity size={10} /> 5 Active Directors
                      </span>
                    </div>
                  </div>

                  <Link href="/marketplace">
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs h-7">
                      <ShoppingBag size={11} /> <span>Market</span>
                    </Button>
                  </Link>
                </div>

                {/* Scope Selector Grid */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users size={11} /> Direct Scope:
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold truncate max-w-[130px]">
                      {EXECUTIVE_CONFIG[participantMode]?.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200/80 dark:border-white/5">
                    {(Object.keys(EXECUTIVE_CONFIG) as ParticipantMode[]).map((mode) => {
                      const cfg = EXECUTIVE_CONFIG[mode];
                      const isActive = participantMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => setParticipantMode(mode)}
                          className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold truncate text-left ${
                            isActive
                              ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 shadow-xs font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span className="truncate">{cfg.tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-1">
                <span className="text-lg">👑</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            )}
          </Card>

          {/* Card 2: Strategic Threads Drawer */}
          <Card className={`flex-1 min-h-0 border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 flex flex-col shadow-sm overflow-hidden ${
            isSidebarOpen ? '' : 'items-center'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2 mb-2 shrink-0">
              {isSidebarOpen ? (
                <div className="flex items-center gap-2">
                  <MessageSquare size={13} className="text-cyan-500" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Strategic Threads</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">{threads.length}</Badge>
                </div>
              ) : (
                <MessageSquare size={15} className="text-cyan-500" />
              )}

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>

            {isSidebarOpen && (
              <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                <Button
                  onClick={handleCreateNewThread}
                  className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shrink-0 h-8"
                >
                  <PlusCircle size={13} />
                  <span>New Chat</span>
                </Button>

                <div className="relative shrink-0">
                  <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search threads..."
                    className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-white/10 text-xs pl-7 h-7 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
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
                    className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-0.5 ${
                      threadFilter === 'pinned' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' : ''
                    }`}
                  >
                    <Pin size={9} /> Pinned
                  </button>
                  <button
                    onClick={() => setThreadFilter('archived')}
                    className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-0.5 ${
                      threadFilter === 'archived' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' : ''
                    }`}
                  >
                    <Archive size={9} /> Archived
                  </button>
                </div>

                <div className="space-y-1 flex-1 min-h-0 overflow-y-auto pr-1">
                  {filteredThreads.length === 0 ? (
                    <div className="text-center py-6 space-y-1">
                      <div className="text-lg">💬</div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">No threads match</div>
                    </div>
                  ) : (
                    filteredThreads.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          selectActiveThread(t.id);
                          setActiveMobileTab('chat');
                        }}
                        className={`p-2 rounded-xl cursor-pointer transition-all border space-y-0.5 ${
                          t.id === activeThread.id
                            ? 'bg-cyan-50/90 dark:bg-cyan-500/10 border-cyan-400 dark:border-cyan-500/40 shadow-xs'
                            : 'bg-slate-50/50 dark:bg-white/5 border-slate-200/70 dark:border-white/5 hover:border-cyan-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {t.title}
                          </span>
                          <button
                            onClick={(e) => handleTogglePinThread(t.id, e)}
                            className={`p-0.5 rounded transition-colors shrink-0 ${
                              t.isPinned ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Pin size={10} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{t.messages.length} messages</span>
                          <span className="font-mono text-[9px]">{t.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Master Chat Console (3) Submerging the Remaining Space */}
        <Card className={`flex-1 min-w-0 border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl flex flex-col h-full shadow-lg dark:shadow-2xl overflow-hidden relative ${
          activeMobileTab === 'chat' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Active Discussion Top Bar */}
          <div className="h-14 border-b border-slate-200 dark:border-white/10 px-4 flex items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  {activeThread.title}
                </h2>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 hidden sm:inline-flex">
                  {EXECUTIVE_CONFIG[participantMode]?.tag}
                </Badge>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                Consultation with <strong className="text-cyan-700 dark:text-cyan-300 font-bold">{EXECUTIVE_CONFIG[participantMode]?.name}</strong> • {companyName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                onClick={handleCreateNewThread}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs h-7"
              >
                <PlusCircle size={11} />
                <span>New</span>
              </Button>

              <Button
                onClick={() => {
                  setThreads((prev) =>
                    prev.map((t) =>
                      t.id === activeThread.id
                        ? {
                            ...t,
                            messages: [
                              {
                                id: `reset-${Date.now()}`,
                                sender: 'asad',
                                senderTitle: 'CEO Asad',
                                content: `Thread context reset by Owner. CEO Asad and our C-Suite stand ready for your directives.`,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              },
                            ],
                          }
                        : t,
                    ),
                  );
                  toast.info('Cleared discussion messages.');
                }}
                size="sm"
                className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-1 h-7"
              >
                <RotateCcw size={11} />
                <span>Clear</span>
              </Button>
            </div>
          </div>

          {/* Message Stream Canvas */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 pr-2 flex flex-col">
            {activeThread.messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto animate-in fade-in">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-2xl shadow-xs">
                  {EXECUTIVE_CONFIG[participantMode]?.icon}
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {EXECUTIVE_CONFIG[participantMode]?.name} ({EXECUTIVE_CONFIG[participantMode]?.title})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {EXECUTIVE_CONFIG[participantMode]?.description}
                  </p>
                </div>

                {/* Prompt Suggestion Chips */}
                <div className="w-full max-w-lg space-y-1.5 pt-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Directives:
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {EXECUTIVE_CONFIG[participantMode]?.suggestionChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 hover:border-cyan-400 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center justify-between group"
                      >
                        <span className="truncate">{chip}</span>
                        <ArrowRight size={12} className="text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 text-xs leading-relaxed ${
                  msg.sender === 'owner' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender !== 'owner' && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border ${
                    msg.sender === 'asad'
                      ? 'bg-cyan-100 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                      : msg.sender === 'teema'
                      ? 'bg-purple-100 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-400'
                      : msg.sender === 'legal'
                      ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : msg.sender === 'mr_intelligence'
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-100 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {msg.sender === 'asad' && '👑'}
                    {msg.sender === 'teema' && '⚙️'}
                    {msg.sender === 'legal' && '⚖️'}
                    {msg.sender === 'mr_intelligence' && '🔍'}
                    {msg.sender === 'resource_director' && '👥'}
                  </div>
                )}

                <div className="space-y-2 max-w-[88%] sm:max-w-2xl">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl ${
                      msg.sender === 'owner'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-md font-medium'
                        : 'bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-sm font-normal'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 min-w-0 truncate">
                        {msg.sender === 'owner' ? (
                          <span className="text-cyan-200 font-bold truncate">You (Organization Owner)</span>
                        ) : (
                          <span className="font-black flex items-center gap-1 text-cyan-700 dark:text-cyan-400 truncate">
                            {msg.sender === 'asad' && '👑 CEO Asad'}
                            {msg.sender === 'teema' && '⚙️ Teema (Ops)'}
                            {msg.sender === 'legal' && '⚖️ Legal Director'}
                            {msg.sender === 'mr_intelligence' && '🔍 Mr. Intelligence'}
                            {msg.sender === 'resource_director' && '👥 Resource Director'}

                            {msg.mode && (
                              <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-extrabold uppercase ${
                                msg.mode === 'CONVERSATION'
                                  ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
                                  : 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                              }`}>
                                {msg.mode === 'CONVERSATION' ? 'Strategic' : 'Mission'}
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

                  {/* Strategic Scorecard */}
                  {msg.strategicScorecard && (
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/20 text-[10px]">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-bold">Impact Index</span>
                        <span className="font-black text-cyan-600 dark:text-cyan-400 text-xs">
                          {msg.strategicScorecard.strategicImpact}/100
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-bold">Effort</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-xs">
                          {msg.strategicScorecard.operationalEffort}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-bold">Risk Index</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                          {msg.strategicScorecard.regulatoryRisk}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Missing Department Marketplace Recommendation */}
                  {msg.isMissingDepartment && msg.recommendedListing && (
                    <Card className="p-3.5 border border-cyan-300 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-50 via-white to-blue-50 dark:from-cyan-950/60 dark:via-slate-900 dark:to-slate-950 rounded-2xl space-y-2 shadow-sm animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs">
                            <ShoppingBag size={12} />
                          </div>
                          <div>
                            <span className="text-[11px] font-black text-slate-900 dark:text-white block">Marketplace Recommendation</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">Recommended by CEO Asad</span>
                          </div>
                        </div>
                        <Badge variant="ai" className="text-[8px] font-bold">RECOMMENDED</Badge>
                      </div>

                      <div className="p-2 rounded-xl bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 space-y-0.5">
                        <div className="text-xs font-black text-cyan-700 dark:text-cyan-300">{msg.recommendedListing.title}</div>
                        <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
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
                          size="sm"
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-xl flex items-center gap-1 shadow-md h-7"
                        >
                          {activeInstallId === msg.recommendedListing.id ? (
                            <>
                              <Sparkles size={11} className="animate-spin" /> Installing...
                            </>
                          ) : (
                            <>
                              Install Now <ArrowRight size={11} />
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>

                {msg.sender === 'owner' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-mono animate-pulse max-w-md">
                <Sparkles size={14} className="animate-spin text-cyan-500 shrink-0" />
                <span>
                  {participantMode === 'DIRECT_CEO'
                    ? 'CEO Asad is formulating executive response...'
                    : 'C-Suite Directors are formulating responses...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer / Input Box */}
          <div className="border-t border-slate-200 dark:border-white/10 p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-950/60 backdrop-blur-md flex items-center gap-2 shrink-0">
            <button
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Voice Input'}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={loading}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : EXECUTIVE_CONFIG[participantMode]?.placeholder || 'Converse with your Executive Board...'
              }
              className="flex-1 bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 focus:outline-none focus:border-cyan-500 rounded-xl px-3"
            />

            <Button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send size={13} />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CeoChatAndDiscussionsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-2.5 text-xs text-cyan-600 dark:text-cyan-400 font-mono animate-pulse">
            <Sparkles size={16} className="animate-spin text-cyan-500" />
            <span>Connecting to AI Executive Board...</span>
          </div>
        </div>
      }
    >
      <CeoChatAndDiscussionsPageContent />
    </React.Suspense>
  );
}
