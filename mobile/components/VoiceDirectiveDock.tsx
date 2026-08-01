import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mic, MicOff, Sparkles, Volume2 } from 'lucide-react-native';

interface VoiceDirectiveDockProps {
  onSpeakDirective?: (prompt: string) => void;
}

export function VoiceDirectiveDock({ onSpeakDirective }: VoiceDirectiveDockProps) {
  const [isListening, setIsListening] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);

  const presets = [
    'Audit Q3 budget burn rate & fuel logistics',
    'Generate competitive intel scan on market share',
    'Review pending legal contracts for compliance',
  ];

  const toggleListening = () => {
    const nextState = !isListening;
    setIsListening(nextState);
    if (nextState) {
      setTimeout(() => {
        const prompt = presets[presetIndex % presets.length];
        setPresetIndex((prev) => prev + 1);
        setIsListening(false);
        if (onSpeakDirective) {
          onSpeakDirective(prompt);
        }
      }, 2000);
    }
  };

  return (
    <View className="mb-4 bg-gray-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          <View className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
            <Sparkles size={20} color="#06b6d4" />
          </View>
          <View>
            <Text className="text-sm font-bold text-white">Voice Directive Interface</Text>
            <Text className="text-xs text-gray-400 font-medium">
              {isListening ? 'Listening spoken directive...' : 'Tap mic to issue command'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleListening}
          className={`p-3 rounded-2xl ${
            isListening ? 'bg-rose-500 shadow-rose-500/50' : 'bg-cyan-500/20 border border-cyan-400/40'
          }`}
        >
          {isListening ? <Mic size={20} color="#ffffff" /> : <Mic size={20} color="#06b6d4" />}
        </TouchableOpacity>
      </View>

      {isListening && (
        <View className="mt-3 pt-3 border-t border-gray-800 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Volume2 size={16} color="#06b6d4" />
            <Text className="text-xs font-semibold text-cyan-300">Processing Voice Input...</Text>
          </View>
          <View className="flex-row space-x-1">
            <View className="w-1.5 h-4 bg-cyan-400 rounded-full" />
            <View className="w-1.5 h-6 bg-cyan-400 rounded-full" />
            <View className="w-1.5 h-3 bg-cyan-400 rounded-full" />
          </View>
        </View>
      )}
    </View>
  );
}
