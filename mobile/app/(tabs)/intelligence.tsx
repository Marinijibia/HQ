import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { BrainCircuit, Cpu, ShieldCheck, Zap, BarChart3, Lightbulb } from 'lucide-react-native';

export default function IntelligenceTab() {
  const telemetry = [
    { name: 'CEO Director', model: 'Gemini 1.5 Pro', load: '78%', confidence: 98, tokens: '142k' },
    { name: 'Technology Director', model: 'Claude 3.5 Sonnet', load: '92%', confidence: 96, tokens: '380k' },
    { name: 'Finance Director', model: 'GPT-4o', load: '45%', confidence: 99, tokens: '89k' },
    { name: 'Marketing Director', model: 'Gemini 1.5 Flash', load: '30%', confidence: 94, tokens: '54k' },
    { name: 'Legal Director', model: 'Claude 3 Opus', load: '62%', confidence: 97, tokens: '110k' },
  ];

  const recommendations = [
    { title: 'Optimize Marketing Burn', type: 'Cost Optimization', score: 95 },
    { title: 'Re-index GCS Document Vault', type: 'Performance', score: 98 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0b0f19]">
      <Header title="Intelligence" subtitle="Swarm Roster & Telemetry" />

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* System Load Summary Card */}
        <View className="p-4 mb-5 rounded-2xl bg-gray-900/90 border border-gray-800">
          <View className="flex-row items-center space-x-2 mb-3">
            <BarChart3 size={18} color="#06b6d4" />
            <Text className="text-base font-extrabold text-white">System Swarm Load</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-gray-400">Average Swarm Confidence</Text>
            <Text className="text-xs font-bold text-emerald-400">96.8%</Text>
          </View>
          <View className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <View className="h-full bg-emerald-400 rounded-full" style={{ width: '96.8%' }} />
          </View>

          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-400">Token Outflow (24h)</Text>
            <Text className="text-xs font-bold text-cyan-400">775,000 Tokens</Text>
          </View>
        </View>

        {/* AI Recommendations */}
        <Text className="text-sm font-bold text-white mb-3">Automated System Recommendations</Text>
        {recommendations.map((rec, i) => (
          <View key={i} className="p-3.5 mb-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2.5">
              <Lightbulb size={18} color="#06b6d4" />
              <View>
                <Text className="text-xs font-bold text-white">{rec.title}</Text>
                <Text className="text-[10px] text-cyan-300 font-medium">{rec.type}</Text>
              </View>
            </View>
            <Text className="text-xs font-extrabold text-cyan-400">{rec.score}% match</Text>
          </View>
        ))}

        {/* C-Suite Swarm Roster */}
        <Text className="text-sm font-bold text-white mb-3 mt-3">Executive Node Telemetry</Text>
        {telemetry.map((node) => (
          <View key={node.name} className="p-4 mb-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center space-x-2.5">
                <Cpu size={18} color="#06b6d4" />
                <View>
                  <Text className="text-sm font-extrabold text-white">{node.name}</Text>
                  <Text className="text-[11px] text-gray-400">{node.model}</Text>
                </View>
              </View>
              <View className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30">
                <Text className="text-[10px] font-bold text-cyan-400">{node.load} Load</Text>
              </View>
            </View>

            <View className="flex-row justify-between pt-2 border-t border-gray-800/80 mt-2">
              <Text className="text-xs text-gray-400">Confidence: <Text className="font-bold text-emerald-400">{node.confidence}%</Text></Text>
              <Text className="text-xs text-gray-400">Tokens: <Text className="font-bold text-white">{node.tokens}</Text></Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
