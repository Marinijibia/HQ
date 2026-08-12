import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { HQColors } from '../../constants/theme';
import { Mic, ShieldCheck } from 'lucide-react-native';
import { CeoVoiceAssistantModal } from './CeoVoiceAssistantModal';

export function AsadVoiceButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isTrained] = useState(true);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalOpen(true)}
        className="flex-row items-center space-x-1.5 py-1.5 px-3 rounded-full bg-cyan-500/20 border border-cyan-400/50 shadow-sm"
      >
        <Mic size={14} color={HQColors.cyan} />
        <Text className="text-xs font-black text-cyan-300 uppercase tracking-wider">
          Asad Voice
        </Text>
        {isTrained && <ShieldCheck size={12} color="#10b981" />}
      </TouchableOpacity>

      <CeoVoiceAssistantModal visible={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
