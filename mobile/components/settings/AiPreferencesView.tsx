import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { HQColors } from '../../constants/theme';
import { Bot, Sliders, CheckCircle2, Sparkles, Save } from 'lucide-react-native';

export function AiPreferencesView() {
  const [aiTone, setAiTone] = useState<'Professional' | 'Executive' | 'Friendly' | 'Technical' | 'Creative'>('Executive');
  const [aiFormality, setAiFormality] = useState<'Formal' | 'Semi-Formal' | 'Casual'>('Formal');
  const [aiLength, setAiLength] = useState<'Concise' | 'Balanced' | 'Detailed'>('Balanced');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveAiPreferences = async () => {
    setSuccessMsg(null);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('AI Swarm Executive preferences updated successfully!');
    }, 400);
  };

  return (
    <View className="space-y-4">
      {/* Feedback Messages */}
      {successMsg && (
        <View className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex-row items-center space-x-2">
          <CheckCircle2 size={16} color="#10b981" />
          <Text className="text-xs text-emerald-300 font-medium flex-1">{successMsg}</Text>
        </View>
      )}

      {/* AI Swarm Executive Controls */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <View className="flex-row items-center space-x-2 mb-1">
          <Bot size={20} color={HQColors.cyan} />
          <Text className="text-xs font-black text-white">AI Swarm Persona & Communication Style</Text>
        </View>

        {/* AI Tone Selection */}
        <View>
          <Text className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            AI Executive Tone
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {['Executive', 'Professional', 'Technical', 'Friendly', 'Creative'].map((tone) => (
              <TouchableOpacity
                key={tone}
                onPress={() => setAiTone(tone as any)}
                className={`py-2 px-3.5 rounded-xl border ${
                  aiTone === tone
                    ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    aiTone === tone ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  {tone}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Formality Selection */}
        <View className="pt-1">
          <Text className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            Formality Standard
          </Text>
          <View className="flex-row space-x-2">
            {['Formal', 'Semi-Formal', 'Casual'].map((formality) => (
              <TouchableOpacity
                key={formality}
                onPress={() => setAiFormality(formality as any)}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  aiFormality === formality
                    ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    aiFormality === formality ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  {formality}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Response Length Selection */}
        <View className="pt-1">
          <Text className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            Response Depth & Length
          </Text>
          <View className="flex-row space-x-2">
            {['Concise', 'Balanced', 'Detailed'].map((length) => (
              <TouchableOpacity
                key={length}
                onPress={() => setAiLength(length as any)}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  aiLength === length
                    ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    aiLength === length ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  {length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Actions */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSaveAiPreferences}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-2 mt-3 shadow-lg shadow-cyan-500/30"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Save size={16} color="#ffffff" />
              <Text className="text-xs font-black text-white tracking-wider">
                Save AI Persona Preferences
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
