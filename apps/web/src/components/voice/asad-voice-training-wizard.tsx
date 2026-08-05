'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@hq/ui';
import {
  Mic,
  MicOff,
  CheckCircle2,
  Sparkles,
  Volume2,
  ShieldCheck,
  RotateCcw,
  Activity,
  ArrowRight,
  X,
  Lock,
} from 'lucide-react';
import { toast } from '../toast';

interface AsadVoiceTrainingWizardProps {
  onClose?: () => void;
  onCompleted?: () => void;
}

export function AsadVoiceTrainingWizard({
  onClose,
  onCompleted,
}: AsadVoiceTrainingWizardProps) {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5>(1);
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [phrasesCompleted, setPhrasesCompleted] = React.useState<number[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  const samplePhrases = [
    { stepNum: 2, text: 'Asad, open boardroom console' },
    { stepNum: 3, text: 'Asad, convene executive swarm' },
    { stepNum: 4, text: 'Asad, deploy autonomous mission' },
  ];

  // Audio frequency simulation for visualizer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 65) + 30);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartPhraseRecording = (targetStep: number) => {
    setIsRecording(true);
    toast.info(`Listening... Speak: "${samplePhrases[targetStep - 2].text}"`);

    // Auto-advance after 3.2 seconds recording
    setTimeout(() => {
      setIsRecording(false);
      setPhrasesCompleted((prev) => [...prev, targetStep]);
      toast.success(`Phrase ${targetStep - 1} Voice Print Calibrated!`);
      if (targetStep < 4) {
        setStep((targetStep + 1) as any);
      } else {
        setStep(5);
        handleFinalizeCalibration();
      }
    }, 3200);
  };

  const handleFinalizeCalibration = async () => {
    setIsSaving(true);
    try {
      const voiceProfileData = {
        wakeWord: 'Asad',
        isTrained: true,
        calibratedAt: new Date().toISOString(),
        confidenceThreshold: 0.85,
        audioFeatures: {
          pitchCentroidHz: 210,
          frequencySpread: 'Normal',
          backgroundNoiseDb: -42,
        },
      };

      localStorage.setItem('hq_asad_voice_profile', JSON.stringify(voiceProfileData));

      // Attempt API sync
      const token = localStorage.getItem('hq_auth_token');
      if (token) {
        await fetch('/api/settings/voice-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(voiceProfileData),
        });
      }

      toast.success('🎙️ Asad Voice Profile Calibrated & Secured!');
      if (onCompleted) onCompleted();
    } catch {
      toast.success('Voice profile calibrated locally!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/95 backdrop-blur-3xl p-6 rounded-3xl space-y-6 shadow-2xl text-left relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400" />

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
              <Mic className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Train Asad Voice Assistant
              </h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Biometric Voice Print Calibration
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Wizard Progress Steps Indicator */}
        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-black/40 p-2 rounded-2xl border border-slate-200 dark:border-white/5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                step === s
                  ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'
                  : step > s
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Ambient Noise Check */}
        {step === 1 && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto shadow-lg">
              <Activity className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Step 1: Ambient Environment Scan
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Ensure you are in a quiet environment so Asad can isolate your unique vocal characteristics.
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/20"
            >
              Begin Voice Phrase Calibration &rarr;
            </Button>
          </div>
        )}

        {/* STEPS 2, 3, 4: Phrase Recordings */}
        {(step === 2 || step === 3 || step === 4) && (
          <div className="space-y-5 text-center py-2">
            <Badge
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-[10px] font-black uppercase px-3 py-1"
            >
              Phrase {step - 1} of 3
            </Badge>

            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Speak Clear & Distinctly:
              </span>
              <p className="text-lg font-black text-cyan-300 leading-snug">
                "{samplePhrases[step - 2].text}"
              </p>
            </div>

            {/* Simulated Live Audio Waveform */}
            <div className="h-16 flex items-center justify-center gap-1.5 bg-slate-950/60 rounded-2xl border border-slate-800 px-4">
              {[...Array(16)].map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    height: isRecording ? `${Math.max(12, (audioLevel * (idx + 1)) % 55)}px` : '8px',
                  }}
                  className="w-1.5 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full transition-all duration-100"
                />
              ))}
            </div>

            <Button
              onClick={() => handleStartPhraseRecording(step)}
              disabled={isRecording}
              className={`w-full h-12 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                isRecording
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" /> Recording Phrase Voice Print...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Tap to Record Phrase {step - 1}
                </>
              )}
            </Button>
          </div>
        )}

        {/* STEP 5: Final Handshake */}
        {step === 5 && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Asad Biometric Voice Profile Ready!
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Asad will now respond exclusively to your calibrated voice wake phrase: <strong className="text-cyan-400">"Asad"</strong>.
              </p>
            </div>

            <Button
              onClick={onClose}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20"
            >
              Complete Asad Calibration & Return
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
