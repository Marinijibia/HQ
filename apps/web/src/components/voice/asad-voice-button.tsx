'use client';

import * as React from 'react';
import { Mic, MicOff, ShieldCheck, Settings, Power } from 'lucide-react';
import { useAsadVoiceEngine } from './use-asad-voice-engine';
import { AsadVoiceBoardroomModal } from './asad-voice-boardroom-modal';
import { AsadVoiceTrainingWizard } from './asad-voice-training-wizard';

export function AsadVoiceButton() {
  const { isTrained, isEnabled, isListening, modalOpen, setModalOpen, toggleListening, activeQuery } =
    useAsadVoiceEngine();
  const [trainingOpen, setTrainingOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Open Voice Assistant Modal */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 text-[11px] font-black uppercase tracking-wider hover:bg-cyan-500/20 transition-all shadow-sm"
          title="Click to speak or chat with Asad Voice Assistant"
        >
          <Mic className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Asad Voice</span>
          {isTrained && <ShieldCheck className="h-3 w-3 text-emerald-500 dark:text-emerald-400 ml-0.5" />}
        </button>

        {/* Hands-Free Wake Phrase On/Off Toggle */}
        <button
          onClick={toggleListening}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider transition-all ${
            isEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title={isEnabled ? 'Hands-Free "Asad" Wake-Word Active. Click to Turn Off.' : 'Hands-Free "Asad" Wake-Word Disabled. Click to Turn On.'}
        >
          {isEnabled ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Mic ON</span>
            </>
          ) : (
            <>
              <MicOff className="h-3 w-3 text-slate-400" />
              <span>Mic OFF</span>
            </>
          )}
        </button>

        {/* Train Voice Button */}
        <button
          onClick={() => setTrainingOpen(true)}
          className="p-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Train Asad to recognize your voice"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Voice Chamber Modal */}
      {modalOpen && (
        <AsadVoiceBoardroomModal
          initialQuery={activeQuery}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Voice Training Wizard Modal */}
      {trainingOpen && (
        <AsadVoiceTrainingWizard
          onClose={() => setTrainingOpen(false)}
          onCompleted={() => setTrainingOpen(false)}
        />
      )}
    </>
  );
}
