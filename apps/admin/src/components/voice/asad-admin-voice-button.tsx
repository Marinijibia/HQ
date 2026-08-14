'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@hq/ui';
import {
  Mic,
  Volume2,
  Sparkles,
  ShieldCheck,
  Cpu,
  X,
  Send,
  UserPlus,
  Award,
  Settings,
} from 'lucide-react';
import { toast } from '../toast';

interface AsadAdminVoiceButtonProps {
  onOpenInviteModal?: () => void;
}

interface VoiceMessage {
  id: string;
  sender: 'User' | 'Asad Admin AI' | 'Super Admin Elena';
  text: string;
  timestamp: string;
}

export function AsadAdminVoiceButton({ onOpenInviteModal }: AsadAdminVoiceButtonProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [isSpeakingTTS, setIsSpeakingTTS] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [orbPulse, setOrbPulse] = React.useState(1);

  // Dynamic Super-Admin Rank & Name
  const [userRank, setUserRank] = React.useState('Director-General (DG)');
  const [userName, setUserName] = React.useState('Umar');

  React.useEffect(() => {
    const savedRank = localStorage.getItem('hq_admin_user_rank');
    const savedName = localStorage.getItem('hq_admin_user_name') || localStorage.getItem('hq_user_display_name');
    if (savedRank) setUserRank(savedRank);
    if (savedName) setUserName(savedName);
  }, [modalOpen]);

  const [messages, setMessages] = React.useState<VoiceMessage[]>([
    {
      id: 'm-1',
      sender: 'Asad Admin AI',
      text: `Asad Admin Voice Active. Addressing ${userRank} ${userName}. Say "Open Telemetry", "Invite Admin User", or "Open White Label".`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Orb animation loop
  React.useEffect(() => {
    const interval = setInterval(() => {
      setOrbPulse(Math.random() * 0.4 + 0.9);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const speakTextTTS = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.pitch = 0.95;
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleDispatchAdminVoiceQuery = async (textText: string) => {
    if (!textText.trim()) return;

    const lower = textText.toLowerCase();
    const userSalutation = `${userRank} ${userName}`;

    const userMsg: VoiceMessage = {
      id: `u-${Date.now()}`,
      sender: 'User',
      text: textText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      let responseText = '';

      if (lower.includes('invite') || lower.includes('user') || lower.includes('member')) {
        responseText = `Okay, ${userSalutation}, opening Admin User Invitation portal with Executive Rank assignment.`;
        speakTextTTS(responseText);
        setTimeout(() => {
          if (onOpenInviteModal) onOpenInviteModal();
          setModalOpen(false);
        }, 1300);
      } else if (lower.includes('white label') || lower.includes('branding')) {
        responseText = `Understood, ${userSalutation}, opening White-Label Branding & Domain Configuration portal.`;
        speakTextTTS(responseText);
        setTimeout(() => {
          router.push('/dashboard/white-label');
          setModalOpen(false);
        }, 1300);
      } else if (lower.includes('execution') || lower.includes('log') || lower.includes('soc2')) {
        responseText = `Confirmed, ${userSalutation}, opening System Execution & Compliance Logs.`;
        speakTextTTS(responseText);
        setTimeout(() => {
          router.push('/dashboard/execution-log');
          setModalOpen(false);
        }, 1300);
      } else if (lower.includes('compliance') || lower.includes('governance')) {
        responseText = `Right away, ${userSalutation}, opening Compliance & Audit Portal.`;
        speakTextTTS(responseText);
        setTimeout(() => {
          router.push('/dashboard/compliance');
          setModalOpen(false);
        }, 1300);
      } else if (lower.includes('telemetry') || lower.includes('revenue') || lower.includes('dashboard')) {
        responseText = `Okay, ${userSalutation}, opening Super-Admin Telemetry & Tenant Management.`;
        speakTextTTS(responseText);
        setTimeout(() => {
          router.push('/dashboard');
          setModalOpen(false);
        }, 1300);
      } else {
        responseText = `Confirmed, ${userSalutation}, directive "${textText}" dispatched to Super-Admin Control Engine.`;
        speakTextTTS(responseText);
      }

      const aiMsg: VoiceMessage = {
        id: `ai-${Date.now()}`,
        sender: 'Asad Admin AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast.error('Voice processing error');
    } finally {
      setIsProcessing(false);
      setQuery('');
    }
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-black uppercase tracking-wider hover:bg-blue-500/20 transition-all shadow-sm"
        title="Activate Asad Super-Admin Voice Assistant"
      >
        <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
        <Mic className="h-3.5 w-3.5 text-blue-400" />
        <span>Asad Voice ({userRank})</span>
        <ShieldCheck className="h-3 w-3 text-emerald-400 ml-0.5" />
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl border border-card-border bg-white/95 dark:bg-[#0A0B10]/95 backdrop-blur-3xl p-6 rounded-3xl space-y-6 shadow-2xl text-left relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/40">
                  <Award className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Asad Super-Admin Control Chamber
                  </h3>
                  <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    Addressing {userRank} {userName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 3D Audio Orb Visualizer */}
            <div className="py-6 flex flex-col items-center justify-center bg-black/80 rounded-3xl border border-card-border relative overflow-hidden">
              <div className="relative flex items-center justify-center">
                <div
                  style={{ transform: `scale(${orbPulse * 1.25})` }}
                  className="absolute w-28 h-28 rounded-full border-2 border-blue-500/30 transition-transform duration-150"
                />
                <div
                  style={{ transform: `scale(${orbPulse * 1.45})` }}
                  className="absolute w-36 h-36 rounded-full border border-purple-500/20 transition-transform duration-150"
                />

                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.6)] z-10">
                  {isSpeakingTTS ? (
                    <Volume2 className="h-8 w-8 text-slate-900 dark:text-white animate-bounce" />
                  ) : isProcessing ? (
                    <Cpu className="h-8 w-8 text-slate-900 dark:text-white animate-spin" />
                  ) : (
                    <Mic className="h-8 w-8 text-slate-900 dark:text-white animate-pulse" />
                  )}
                </div>
              </div>

              <p className="text-xs font-black text-slate-900 dark:text-white mt-4 uppercase tracking-widest">
                {isSpeakingTTS
                  ? `Asad Addressing ${userRank} ${userName}...`
                  : isProcessing
                  ? 'Executing Super-Admin Voice Directive...'
                  : `Asad Listening for ${userRank}'s Command...`}
              </p>
            </div>

            {/* Admin Shortcuts */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider flex-shrink-0">
                Admin Commands:
              </span>
              {[
                'Invite Admin User',
                'Open Telemetry',
                'Open White Label',
                'Open Execution Logs',
                'Open Compliance',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleDispatchAdminVoiceQuery(cmd)}
                  className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-blue-500/20 border border-slate-800 hover:border-blue-400/50 text-slate-600 dark:text-slate-300 hover:text-blue-300 text-[10px] font-bold flex-shrink-0 transition-all"
                >
                  🎤 "{cmd}"
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-48 p-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                    msg.sender === 'User'
                      ? 'bg-blue-500/10 border-blue-500/30 text-right text-blue-200 ml-8'
                      : 'bg-white dark:bg-slate-900 border-slate-800 text-left text-slate-100 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                    <span>{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="font-medium">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-card-border">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDispatchAdminVoiceQuery(query)}
                placeholder={`Speak or type command for Asad (e.g. 'Invite User', 'Open White Label')...`}
                className="flex-1 bg-slate-100 dark:bg-black/60 border border-card-border rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Button
                onClick={() => handleDispatchAdminVoiceQuery(query)}
                className="h-11 px-5 bg-gradient-to-r from-blue-600 to-purple-600 text-slate-900 dark:text-white font-black text-xs rounded-2xl shadow-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
