'use client';

import * as React from 'react';
import { Button } from '@hq/ui';
import { X, Rocket, Calendar, AlignLeft, Flag, Sparkles } from 'lucide-react';
import { toast } from './toast';

interface MissionLaunchPanelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (mission: { objective: string; deadline: string; priority: 'Low' | 'Medium' | 'High' }) => void;
  brandColor?: string;
  token?: string;
}

const PRIORITY_OPTIONS = [
  { value: 'High', label: 'High Priority', color: '#EF4444', description: 'Urgent — executives focus immediately' },
  { value: 'Medium', label: 'Medium Priority', color: '#F59E0B', description: 'Important — scheduled in current cycle' },
  { value: 'Low', label: 'Low Priority', color: '#22C55E', description: 'Standard — queued for next available slot' },
] as const;

const MISSION_SUGGESTIONS = [
  'Create a Q3 marketing strategy',
  'Build an investor pitch deck',
  'Write a customer onboarding guide',
  'Develop a product launch plan',
  'Draft a company social media strategy',
  'Analyse our competitive positioning',
];

export function MissionLaunchPanel({ open, onClose, onSubmit, brandColor = '#0A84FF', token }: MissionLaunchPanelProps) {
  const [objective, setObjective] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [priority, setPriority] = React.useState<'Low' | 'Medium' | 'High'>('High');
  const [submitting, setSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (open) {
      setObjective('');
      setDeadline('');
      setPriority('High');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Escape key to close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSubmit = async () => {
    if (!objective.trim()) return;
    setSubmitting(true);
    try {
      if (token) {
        await fetch('/api/missions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ objective: objective.trim(), deadline: deadline || undefined, priority }),
        });
      }
      localStorage.setItem('hq_first_mission_done', 'true');
      onSubmit({ objective: objective.trim(), deadline, priority });
      toast.success('🚀 Mission launched — your executive team is briefing now');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col bg-background border-l border-card-border shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
              <Rocket className="h-4.5 w-4.5" style={{ color: brandColor }} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Launch a Mission</h2>
              <p className="text-xs text-foreground/50 font-semibold">Your AI executives will take it from here</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-foreground/8 transition-colors">
            <X className="h-4 w-4 text-foreground/50" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Objective */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <AlignLeft className="h-3 w-3" style={{ color: brandColor }} />
              Mission Objective *
            </label>
            <textarea
              ref={inputRef}
              className="w-full min-h-28 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-4 py-3 text-sm font-semibold text-[#1A1A1E] dark:text-white focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-all"
              style={{ '--tw-ring-color': `${brandColor}40` } as React.CSSProperties}
              placeholder="Describe what you want your AI executive team to achieve..."
              value={objective}
              onChange={e => setObjective(e.target.value)}
            />
            <p className="text-xs text-foreground/40 font-semibold">Be specific — the clearer the objective, the better the result</p>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Quick start — tap to use
            </p>
            <div className="flex flex-wrap gap-2">
              {MISSION_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setObjective(s)}
                  className="px-2.5 py-1 rounded-full text-xs font-bold border border-card-border text-foreground/60 bg-foreground/4 hover:bg-foreground/8 hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="h-3 w-3" style={{ color: brandColor }} />
              Target Deadline <span className="text-foreground/30 font-semibold normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="date"
              className="w-full h-10 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-4 text-sm font-semibold text-[#1A1A1E] dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': `${brandColor}40` } as React.CSSProperties}
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <Flag className="h-3 w-3" style={{ color: brandColor }} />
              Priority Level
            </label>
            <div className="space-y-2">
              {PRIORITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    priority === opt.value
                      ? 'border-current bg-opacity-10'
                      : 'border-card-border hover:border-foreground/20'
                  }`}
                  style={priority === opt.value ? { borderColor: opt.color, backgroundColor: `${opt.color}10` } : {}}
                >
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">{opt.label}</p>
                    <p className="text-xs text-foreground/45 font-semibold">{opt.description}</p>
                  </div>
                  {priority === opt.value && (
                    <div className="h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: opt.color }}>
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: opt.color }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-card-border space-y-2">
          <Button
            onClick={handleSubmit}
            disabled={!objective.trim() || submitting}
            className="w-full text-white font-bold h-11"
            style={{ backgroundColor: objective.trim() ? brandColor : undefined }}
          >
            <Rocket className="h-4 w-4 mr-2" />
            {submitting ? 'Briefing your executives...' : 'Launch Mission'}
          </Button>
          <p className="text-center text-xs text-foreground/35 font-semibold">
            Your AI executive team will analyse and begin within seconds
          </p>
        </div>
      </div>
    </>
  );
}
