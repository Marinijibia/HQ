import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { HQColors } from '../../constants/theme';
import { Mic, ShieldCheck, Sparkles, X } from 'lucide-react-native';

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

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View className="flex-1 bg-black/85 justify-end">
          <View className="w-full bg-[#0A0A0C] border-t border-slate-800 rounded-t-3xl p-6 space-y-4">
            <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
              <View className="flex-row items-center space-x-2">
                <Sparkles size={18} color={HQColors.cyan} />
                <Text className="text-base font-black text-white">Asad Voice Assistant</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="py-8 items-center justify-center space-y-3">
              <View className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 items-center justify-center shadow-lg shadow-cyan-500/30">
                <Mic size={32} color={HQColors.cyan} />
              </View>
              <Text className="text-sm font-black text-white uppercase tracking-wider">
                Asad Listening for Spoken Directives...
              </Text>
              <Text className="text-xs text-slate-400 text-center px-4">
                Wake phrase: <Text className="text-cyan-300 font-bold">"Asad"</Text> &bull; Biometric voice print verified.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
