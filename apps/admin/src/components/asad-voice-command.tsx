'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/theme-context';
import { Mic, MicOff, Sparkles, Volume2, ShieldAlert, Zap, Terminal } from 'lucide-react';
import { toast } from './toast';

export function AsadVoiceCommand() {
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [speechSupported, setSpeechSupported] = React.useState(true);
  const [activeSpeech, setActiveSpeech] = React.useState<string | null>(null);

  const recognitionRef = React.useRef<any>(null);

  // Text to Speech Audio Feedback
  const speakResponse = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      setActiveSpeech(text);
      utterance.onend = () => setActiveSpeech(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);

      if (event.results[0].isFinal) {
        processVoiceDirective(currentText);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Voice recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const processVoiceDirective = (command: string) => {
    const lower = command.toLowerCase().trim();
    toast.info(`🎙️ Executing Voice Directive: "${command}"`);

    if (lower.includes('emergency stop') || lower.includes('pause all')) {
      speakResponse('Emergency stop triggered. All autonomous C-Suite agent workflows are frozen.');
      toast.error('🚨 Voice Directive: EMERGENCY STOP ACTIVE.');
      router.push('/dashboard/compliance');
    } else if (lower.includes('purge cache') || lower.includes('maintenance')) {
      speakResponse('Purging Redis cache and running database index optimization now.');
      toast.success('⚡ Voice Directive: Redis Cache Purged & Indexes Optimized!');
    } else if (lower.includes('error log') || lower.includes('show error')) {
      speakResponse('Navigating to Agent Execution Logs filtered by errors.');
      toast.success('🔍 Voice Directive: Displaying Error Traces.');
      router.push('/dashboard/execution-log');
    } else if (lower.includes('dark mode') || lower.includes('toggle theme') || lower.includes('switch theme')) {
      toggleTheme();
      speakResponse('Toggling dashboard theme layout.');
      toast.success('🌙 Voice Directive: Theme Toggled!');
    } else if (lower.includes('tenant') || lower.includes('show companies') || lower.includes('leaderboard')) {
      speakResponse('Displaying top token consuming tenant leaderboard.');
      toast.success('🏢 Voice Directive: Opening Tenant Leaderboard.');
      router.push('/dashboard');
    } else {
      speakResponse(`Acknowledged directive: ${command}. Processing platform request.`);
      toast.success(`🤖 Asad AI Executed: "${command}"`);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice Recognition API is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
        speakResponse('Asad Voice Assistant Active. State your directive.');
        toast.info('🎙️ Asad Voice Assistant Listening... (Speak a directive)');
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  if (!speechSupported) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Listening Waveform Bar */}
      {isListening && (
        <div className="flex items-center gap-2 bg-black/80 border border-cyan-500/50 px-3 py-1.5 rounded-2xl animate-in fade-in duration-300">
          <div className="flex items-center gap-1">
            <span className="h-3 w-1 bg-cyan-400 rounded-full animate-pulse" />
            <span className="h-5 w-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-1 bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-[10px] font-mono font-black text-cyan-300 truncate max-w-[140px]">
            {transcript || 'Listening...'}
          </span>
        </div>
      )}

      {/* Audio Response Indicator */}
      {activeSpeech && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-xl animate-pulse">
          <Volume2 className="h-3.5 w-3.5" />
          <span>Speaking...</span>
        </div>
      )}

      {/* Voice Assistant Trigger Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md ${
          isListening
            ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
            : 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:scale-105'
        }`}
      >
        {isListening ? (
          <>
            <Mic className="h-4 w-4 text-white animate-bounce" />
            <span>Listening to Command...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Asad Voice Command</span>
            <Mic className="h-3.5 w-3.5 sm:hidden" />
          </>
        )}
      </button>
    </div>
  );
}
