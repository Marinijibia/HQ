'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@hq/ui';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Cpu,
  X,
  Send,
  User,
  Bot,
  Rocket,
  Compass,
} from 'lucide-react';
import { toast } from '../toast';

interface AsadVoiceBoardroomModalProps {
  initialQuery?: string;
  onClose: () => void;
}

interface VoiceMessage {
  id: string;
  sender: 'User' | 'Asad AI' | 'CEO Elena' | 'CTO Hiroshi' | 'CFO Sophia';
  text: string;
  timestamp: string;
}

export function AsadVoiceBoardroomModal({
  initialQuery = '',
  onClose,
}: AsadVoiceBoardroomModalProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);
  const [isSpeakingTTS, setIsSpeakingTTS] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [messages, setMessages] = React.useState<VoiceMessage[]>([
    {
      id: 'm-1',
      sender: 'Asad AI',
      text: 'Asad Assistant Active. Universal HQ Control engaged. Say "Open Analytics", "Deploy Mission", or "Check Security Posture".',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [orbPulse, setOrbPulse] = React.useState(1);

  // Audio Orb Pulse Simulation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setOrbPulse(Math.random() * 0.4 + 0.9);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Process initial query if provided
  React.useEffect(() => {
    if (initialQuery.trim()) {
      handleDispatchVoiceQuery(initialQuery.trim());
    }
  }, [initialQuery]);

  const speakTextTTS = (textToSpeak: string, executiveName: string = 'CEO Elena') => {
    if (!('speechSynthesis' in window)) return;

    const persona = localStorage.getItem('hq_asad_voice_persona') || 'Asad Male Executive';

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (persona.includes('Female') || executiveName.includes('Sophia')) {
      utterance.pitch = 1.25;
      utterance.rate = 1.0;
    } else if (persona.includes('British') || executiveName.includes('Hiroshi')) {
      utterance.pitch = 0.95;
      utterance.rate = 1.05;
    } else {
      utterance.pitch = 0.9;
      utterance.rate = 1.0;
    }

    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleDispatchVoiceQuery = async (textText: string) => {
    if (!textText.trim()) return;

    const title = localStorage.getItem('hq_user_title') || 'Alh';
    const name = localStorage.getItem('hq_user_display_name') || 'Umar';
    const userSalutation = `${title} ${name}`;

    const lower = textText.toLowerCase();
    const userMsg: VoiceMessage = {
      id: `u-${Date.now()}`,
      sender: 'User',
      text: textText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('hq_auth_token');
      let responseText = '';
      let senderName: 'CEO Elena' | 'CTO Hiroshi' | 'CFO Sophia' | 'Asad AI' = 'CEO Elena';

      // 1. UNIVERSAL NAVIGATION INTENT DISPATCH
      if (lower.includes('analytics') || lower.includes('telemetry')) {
        responseText = `Okay, ${userSalutation}, navigating to Executive Analytics & Telemetry workspace right now.`;
        speakTextTTS(responseText, 'Asad AI');
        setTimeout(() => {
          router.push('/analytics');
          onClose();
        }, 1300);
      } else if (lower.includes('asset') || lower.includes('vault') || lower.includes('documents')) {
        responseText = `Understood, ${userSalutation}, opening Corporate Asset & Knowledge Vault.`;
        speakTextTTS(responseText, 'Asad AI');
        setTimeout(() => {
          router.push('/assets');
          onClose();
        }, 1300);
      } else if (lower.includes('billing') || lower.includes('credits') || lower.includes('subscription')) {
        responseText = `Right away, ${userSalutation}, navigating to Billing & Credit Entitlements.`;
        senderName = 'CFO Sophia';
        speakTextTTS(responseText, 'CFO Sophia');
        setTimeout(() => {
          router.push('/billing');
          onClose();
        }, 1300);
      } else if (lower.includes('integration') || lower.includes('saas') || lower.includes('connectors')) {
        responseText = `Confirmed, ${userSalutation}, opening Enterprise SaaS Integration Hub.`;
        senderName = 'CTO Hiroshi';
        speakTextTTS(responseText, 'CTO Hiroshi');
        setTimeout(() => {
          router.push('/integration-hub');
          onClose();
        }, 1300);
      } else if (lower.includes('trust') || lower.includes('security posture') || lower.includes('audit')) {
        responseText = `Okay, ${userSalutation}, opening Trust Center & Zero-Trust Security posture.`;
        speakTextTTS(responseText, 'Asad AI');
        setTimeout(() => {
          router.push('/trust-center');
          onClose();
        }, 1300);
      } else if (lower.includes('intelligence') || lower.includes('twin')) {
        responseText = `Understood, ${userSalutation}, opening 8 Twin Layers Executive Intelligence Hub.`;
        speakTextTTS(responseText, 'Asad AI');
        setTimeout(() => {
          router.push('/intelligence');
          onClose();
        }, 1300);
      } else if (lower.includes('marketplace') || lower.includes('specialist')) {
        responseText = `Confirmed, ${userSalutation}, opening AI Specialist Marketplace catalog.`;
        speakTextTTS(responseText, 'Asad AI');
        setTimeout(() => {
          router.push('/marketplace');
          onClose();
        }, 1300);
      } else if (lower.includes('mission') || lower.includes('campaign')) {
        // 2. MISSION DIRECTIVE INTENT DISPATCH
        responseText = `Okay, ${userSalutation}, launching mission for "${textText}" right now. Dispatched to Chief of Staff for execution.`;
        if (token) {
          const res = await fetch('/api/missions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ objective: textText }),
          });
          if (res.ok) {
            const miss = await res.json();
            responseText = `Okay, ${userSalutation}, mission "${textText}" launched successfully! Opening execution inspector.`;
            setTimeout(() => {
              router.push(`/missions/${miss.id}`);
              onClose();
            }, 1400);
          }
        }
        speakTextTTS(responseText, 'CEO Elena');
      } else {
        // 3. BOARDROOM SWARM DELIBERATION INTENT DISPATCH
        responseText = `Understood, ${userSalutation}, executive directive "${textText}" received. CEO Elena and CTO Hiroshi are evaluating.`;
        if (token) {
          const res = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              objective: textText,
              specialistKeys: ['ceo', 'cto', 'cfo'],
            }),
          });
          if (res.ok) {
            responseText = `Okay, ${userSalutation}, Executive Boardroom convened for "${textText}". Deliberations underway.`;
          }
        }
        speakTextTTS(responseText, 'CEO Elena');
      }

      const aiMsg: VoiceMessage = {
        id: `ai-${Date.now()}`,
        sender: senderName,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast.error('Voice intent processing error');
    } finally {
      setIsProcessing(false);
      setQuery('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/95 backdrop-blur-3xl p-6 rounded-3xl space-y-6 shadow-2xl text-left relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Asad Universal Voice Control Chamber
              </h3>
              <p className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                Full-Suite Universal HQ Intent Dispatcher
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3D Glowing Audio Orb Visualizer */}
        <div className="py-6 flex flex-col items-center justify-center bg-slate-950/80 rounded-3xl border border-slate-800/80 relative overflow-hidden">
          <div className="relative flex items-center justify-center">
            {/* Outer Pulsing Wave Rings */}
            <div
              style={{ transform: `scale(${orbPulse * 1.25})` }}
              className="absolute w-28 h-28 rounded-full border-2 border-cyan-500/30 transition-transform duration-150"
            />
            <div
              style={{ transform: `scale(${orbPulse * 1.45})` }}
              className="absolute w-36 h-36 rounded-full border border-purple-500/20 transition-transform duration-150"
            />

            {/* Core Orb Center */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.6)] z-10">
              {isSpeakingTTS ? (
                <Volume2 className="h-8 w-8 text-white animate-bounce" />
              ) : isProcessing ? (
                <Cpu className="h-8 w-8 text-white animate-spin" />
              ) : (
                <Mic className="h-8 w-8 text-white animate-pulse" />
              )}
            </div>
          </div>

          <p className="text-xs font-black text-white mt-4 uppercase tracking-widest">
            {isSpeakingTTS
              ? 'Asad Executive TTS Speaking...'
              : isProcessing
              ? 'Routing Voice Intent Across HQ...'
              : 'Asad Listening for Spoken Commands...'}
          </p>
        </div>

        {/* Live Universal Intent Shortcut Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold">
          <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex-shrink-0">
            Voice Shortcuts:
          </span>
          {[
            'Open Analytics',
            'Deploy Security Audit Mission',
            'Open Asset Vault',
            'Check Billing & Credits',
            'Open Integration Hub',
            'Check 8 Twin Layers',
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleDispatchVoiceQuery(cmd)}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 text-[10px] font-bold flex-shrink-0 transition-all"
            >
              🎤 "{cmd}"
            </button>
          ))}
        </div>

        {/* Live Conversation Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-48 p-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                msg.sender === 'User'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-right text-cyan-200 ml-8'
                  : 'bg-slate-900 border-slate-800 text-left text-slate-100 mr-8'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                <span>{msg.sender}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="font-medium">{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Input Directive Field */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDispatchVoiceQuery(query)}
            placeholder="Say or type a command for Asad (e.g. 'Open Analytics', 'Deploy Mission')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Button
            onClick={() => handleDispatchVoiceQuery(query)}
            className="h-11 px-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black text-xs rounded-2xl shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
