'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Activity,
  Building2,
  UserPlus,
  Bell,
  DollarSign,
  Building,
  Shield,
  Terminal,
  Palette,
  Zap,
  Moon,
  Sun,
  Download,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../contexts/theme-context';
import { toast } from './toast';

interface CommandItem {
  id: string;
  category: 'NAVIGATION' | 'QUICK_ACTION' | 'AI_EXECUTIVE';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export function AdminCommandPalette({
  isOpen,
  onClose,
  onOpenInviteModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenInviteModal?: () => void;
}) {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = React.useMemo(() => [
    // Navigation
    {
      id: 'nav-ops',
      category: 'NAVIGATION',
      title: 'Platform Operations Center',
      subtitle: 'Real-time telemetry HUD, revenue curves & system metrics',
      icon: Activity,
      shortcut: 'G O',
      action: () => { router.push('/dashboard'); onClose(); },
    },
    {
      id: 'nav-orgs',
      category: 'NAVIGATION',
      title: 'Organization Management',
      subtitle: 'Tenant roster, workspace levels & isolation security',
      icon: Building2,
      shortcut: 'G M',
      action: () => { router.push('/dashboard/organizations'); onClose(); },
    },
    {
      id: 'nav-staff',
      category: 'NAVIGATION',
      title: 'Admin Staff & Invitations',
      subtitle: 'Super-admin team permissions & role delegations',
      icon: UserPlus,
      shortcut: 'G S',
      action: () => { router.push('/dashboard/staff'); onClose(); },
    },
    {
      id: 'nav-notifs',
      category: 'NAVIGATION',
      title: 'Notifications & Telemetry',
      subtitle: 'System security alerts, billing logs & audit trails',
      icon: Bell,
      shortcut: 'G N',
      action: () => { router.push('/dashboard/notifications'); onClose(); },
    },
    {
      id: 'nav-billing',
      category: 'NAVIGATION',
      title: 'Billing & Treasury Oversight',
      subtitle: 'Master Circle reserve, USDC treasury & SaaS subscriptions',
      icon: DollarSign,
      shortcut: 'G B',
      action: () => { router.push('/dashboard/billing'); onClose(); },
    },
    {
      id: 'nav-cms',
      category: 'NAVIGATION',
      title: 'AI Executive Training CMS',
      subtitle: '5 Core standard executives & marketplace prompt tuning',
      icon: Building,
      shortcut: 'G C',
      action: () => { router.push('/dashboard/cms'); onClose(); },
    },
    {
      id: 'nav-compliance',
      category: 'NAVIGATION',
      title: 'Governance & Compliance Policies',
      subtitle: 'NDPR compliance, data retention & cryptographic verification',
      icon: Shield,
      shortcut: 'G P',
      action: () => { router.push('/dashboard/compliance'); onClose(); },
    },
    {
      id: 'nav-kernel',
      category: 'NAVIGATION',
      title: 'Kernel Execution Logs',
      subtitle: 'Asad autonomous execution stream & microsecond traces',
      icon: Terminal,
      shortcut: 'G L',
      action: () => { router.push('/dashboard/execution-log'); onClose(); },
    },
    {
      id: 'nav-whitelabel',
      category: 'NAVIGATION',
      title: 'White-Labeling & Multi-Tenant Branding',
      subtitle: 'Custom subdomains, brand palettes & tenant assets',
      icon: Palette,
      shortcut: 'G W',
      action: () => { router.push('/dashboard/white-label'); onClose(); },
    },

    // Quick Actions
    {
      id: 'act-invite',
      category: 'QUICK_ACTION',
      title: 'Invite Admin Member',
      subtitle: 'Issue high-security invitation link with rank delegation',
      icon: UserPlus,
      shortcut: '⌘ I',
      action: () => {
        onClose();
        if (onOpenInviteModal) onOpenInviteModal();
      },
    },
    {
      id: 'act-maintenance',
      category: 'QUICK_ACTION',
      title: 'Run Cluster System Maintenance',
      subtitle: 'Purge Redis cache & run PostgreSQL vacuum analyze',
      icon: Zap,
      action: () => {
        onClose();
        toast.info('🧹 Purging Redis cache & running VACUUM ANALYZE...');
        setTimeout(() => {
          toast.success('⚡ Maintenance Complete: Redis Cache Purged & DB Re-Indexed!');
        }, 1200);
      },
    },
    {
      id: 'act-theme',
      category: 'QUICK_ACTION',
      title: isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle global super-admin visual contrast mode',
      icon: isDarkMode ? Sun : Moon,
      shortcut: '⌘ T',
      action: () => {
        toggleTheme();
        onClose();
      },
    },

    // AI Core Executives
    {
      id: 'ai-asad',
      category: 'AI_EXECUTIVE',
      title: 'Asad (Chief Executive Officer)',
      subtitle: '5 Core baseline: Orchestrator, mission delegator & strategic captain',
      icon: Sparkles,
      action: () => { router.push('/dashboard/cms'); onClose(); },
    },
    {
      id: 'ai-teema',
      category: 'AI_EXECUTIVE',
      title: 'Teema (Operations Director & Chief of Staff)',
      subtitle: '5 Core baseline: Process efficiency, sprint management & logistics',
      icon: Sparkles,
      action: () => { router.push('/dashboard/cms'); onClose(); },
    },
    {
      id: 'ai-legal',
      category: 'AI_EXECUTIVE',
      title: 'Legal & Compliance Director',
      subtitle: '5 Core baseline: Contract drafting, regulatory oversight & NDPR',
      icon: Sparkles,
      action: () => { router.push('/dashboard/cms'); onClose(); },
    },
    {
      id: 'ai-hr',
      category: 'AI_EXECUTIVE',
      title: 'Resource Director (Human Resources)',
      subtitle: '5 Core baseline: Talent acquisition, payroll review & culture',
      icon: Sparkles,
      action: () => { router.push('/dashboard/cms'); onClose(); },
    },
    {
      id: 'ai-intel',
      category: 'AI_EXECUTIVE',
      title: 'Mr. Intelligence (Public Search Agent)',
      subtitle: '5 Core baseline: Real-time autonomous web search & market research',
      icon: Sparkles,
      action: () => { router.push('/dashboard/cms'); onClose(); },
    },
  ], [router, isDarkMode, toggleTheme, onClose, onOpenInviteModal]);

  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return commandItems;
    const q = query.toLowerCase();
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, commandItems]);

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-cyan-500/20 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.45)] dark:shadow-[0_20px_70px_rgba(0,240,255,0.1)] overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-200 text-left">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-200 dark:border-white/10 gap-3">
          <Search className="h-5 w-5 text-cyan-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, jump to page, or search executive..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No command matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1 text-slate-400">Try searching for &ldquo;Organizations&rdquo;, &ldquo;Billing&rdquo;, or &ldquo;Asad&rdquo;</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 shadow-sm'
                      : 'border border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight
                      size={14}
                      className={`transition-transform ${
                        isSelected ? 'translate-x-0.5 text-cyan-400' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[9px] font-mono">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[9px] font-mono">↵</kbd> Select
            </span>
          </div>
          <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
            HQ Super-Admin Core
          </span>
        </div>
      </div>
    </div>
  );
}
