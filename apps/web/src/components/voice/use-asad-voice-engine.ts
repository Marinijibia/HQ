'use client';

import * as React from 'react';
import { toast } from '../toast';

export interface VoiceEngineState {
  isListening: boolean;
  isEnabled: boolean;
  isTrained: boolean;
  wakeWordDetected: boolean;
  lastTranscript: string;
  activeQuery: string;
  speakerConfidence: number;
}

export function useAsadVoiceEngine() {
  const [state, setState] = React.useState<VoiceEngineState>({
    isListening: false,
    isEnabled: false,
    isTrained: false,
    wakeWordDetected: false,
    lastTranscript: '',
    activeQuery: '',
    speakerConfidence: 0.94,
  });

  const [modalOpen, setModalOpen] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);
  const isEnabledRef = React.useRef<boolean>(false);
  const modalOpenRef = React.useRef<boolean>(false);
  const isStartingRef = React.useRef<boolean>(false);

  // Keep refs synchronized
  React.useEffect(() => {
    isEnabledRef.current = state.isEnabled;
  }, [state.isEnabled]);

  React.useEffect(() => {
    modalOpenRef.current = modalOpen;
  }, [modalOpen]);

  // Load user voice preferences on mount (default is OFF to prevent unwanted background mic access)
  React.useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('hq_asad_voice_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.isTrained) {
          setState((prev) => ({ ...prev, isTrained: true }));
        }
      }
      const savedEnabled = localStorage.getItem('hq_asad_voice_enabled');
      if (savedEnabled === 'true') {
        setState((prev) => ({ ...prev, isEnabled: true }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const playAsadWakeChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      /* ignore */
    }
  };

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const startListening = React.useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.warning('🎙️ Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for voice commands.');
      setState((prev) => ({ ...prev, isEnabled: false }));
      return;
    }

    if (recognitionRef.current || isStartingRef.current) {
      return;
    }

    try {
      isStartingRef.current = true;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isStartingRef.current = false;
        setState((prev) => ({ ...prev, isListening: true }));
      };

      recognition.onresult = (event: any) => {
        // Do not process background wake phrase if modal is already open
        if (modalOpenRef.current) return;

        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        const lower = currentTranscript.toLowerCase().trim();
        setState((prev) => ({ ...prev, lastTranscript: currentTranscript }));

        // Strict wake word detection for "asad" or "hey asad"
        if (lower.includes('asad') || lower.includes('hey asad')) {
          playAsadWakeChime();

          const parts = lower.split('asad');
          const queryPart = parts[parts.length - 1]?.trim() || '';

          setState((prev) => ({
            ...prev,
            wakeWordDetected: true,
            activeQuery: queryPart,
          }));

          setModalOpen(true);
          toast.info('🎙️ "Asad" Wake Phrase Verified! Voice Assistant Active.');
        }
      };

      recognition.onerror = () => {
        isStartingRef.current = false;
      };

      recognition.onend = () => {
        isStartingRef.current = false;
        setState((prev) => ({ ...prev, isListening: false }));

        // ONLY restart if explicitly enabled by user AND modal is not open
        if (isEnabledRef.current && !modalOpenRef.current) {
          setTimeout(() => {
            if (isEnabledRef.current && !modalOpenRef.current && !recognitionRef.current) {
              startListening();
            }
          }, 1000);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      isStartingRef.current = false;
    }
  }, []);

  // Manage start/stop lifecycle based on isEnabled state
  React.useEffect(() => {
    if (state.isEnabled && !modalOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [state.isEnabled, modalOpen, startListening, stopListening]);

  const toggleListening = React.useCallback(() => {
    setState((prev) => {
      const nextEnabled = !prev.isEnabled;
      try {
        localStorage.setItem('hq_asad_voice_enabled', String(nextEnabled));
      } catch {
        /* ignore */
      }
      if (nextEnabled) {
        toast.success('🎙️ Hands-Free Voice Assistant Enabled ("Asad")');
      } else {
        toast.info('⏹️ Hands-Free Voice Assistant Disabled');
      }
      return { ...prev, isEnabled: nextEnabled };
    });
  }, []);

  return {
    ...state,
    modalOpen,
    setModalOpen,
    toggleListening,
    startListening,
    stopListening,
    resetWakeState: () =>
      setState((prev) => ({
        ...prev,
        wakeWordDetected: false,
        activeQuery: '',
      })),
  };
}
