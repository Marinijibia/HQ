import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { KillswitchModal } from '../../components/KillswitchModal';
import { VoiceDirectiveDock } from '../../components/VoiceDirectiveDock';
import { ExecutiveCard } from '../../components/ExecutiveCard';
import { MissionPanel } from '../../components/MissionPanel';
import { Activity, ShieldCheck, Zap, ArrowRight, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CommandTab() {
  const router = useRouter();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isKillswitchModalVisible, setIsKillswitchModalVisible] = useState(false);

  const executives = [
    { name: 'CEO Director', role: 'Chief Executive Officer', status: 'active' as const, confidence: 98 },
    { name: 'Technology Director', role: 'Chief Technology Officer', status: 'busy' as const, confidence: 96 },
    { name: 'Finance Director', role: 'Chief Financial Officer', status: 'active' as const, confidence: 99 },
    { name: 'Marketing Director', role: 'Chief Marketing Officer', status: 'idle' as const, confidence: 94 },
    { name: 'Legal Director', role: 'General Counsel', status: 'active' as const, confidence: 97 },
  ];

  const handleVoiceDirective = (prompt: string) => {
    // Direct user to boardroom with spoken prompt
    router.push({ pathname: '/(tabs)/boardroom', params: { initialMessage: prompt } } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0b0f19]">
      <Header
        title="HQ Command"
        subtitle="Live Executive Telemetry"
        isEmergencyActive={isEmergencyActive}
        onToggleEmergency={() => setIsKillswitchModalVisible(true)}
      />

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Voice Directive Banner */}
        <VoiceDirectiveDock onSpeakDirective={handleVoiceDirective} />

        {/* Telemetry KPI Row */}
        <View className="flex-row space-x-3 mb-5">
          <View className="flex-1 p-4 rounded-2xl bg-gray-900/90 border border-gray-800">
            <Text className="text-xs text-gray-400 font-medium">Health Score</Text>
            <View className="flex-row items-center space-x-1.5 mt-1">
              <ShieldCheck size={18} color="#10b981" />
              <Text className="text-xl font-extrabold text-emerald-400">98.4%</Text>
            </View>
            <Text className="text-[10px] text-gray-400 mt-1">● 5 Nodes Verified</Text>
          </View>

          <View className="flex-1 p-4 rounded-2xl bg-gray-900/90 border border-gray-800">
            <Text className="text-xs text-gray-400 font-medium">Swarm Velocity</Text>
            <View className="flex-row items-center space-x-1.5 mt-1">
              <TrendingUp size={18} color="#06b6d4" />
              <Text className="text-xl font-extrabold text-cyan-400">+14.2%</Text>
            </View>
            <Text className="text-[10px] text-gray-400 mt-1">12 Missions Complete</Text>
          </View>
        </View>

        {/* Missions Overview */}
        <MissionPanel />

        {/* C-Suite Executive Roster Header */}
        <View className="flex-row items-center justify-between mb-3 mt-2">
          <Text className="text-base font-bold text-white">AI Executive Swarm</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/intelligence' as any)}>
            <Text className="text-xs text-cyan-400 font-semibold">View All →</Text>
          </TouchableOpacity>
        </View>

        {/* Executive Cards */}
        {executives.map((e) => (
          <ExecutiveCard
            key={e.name}
            name={e.name}
            role={e.role}
            status={e.status}
            confidence={e.confidence}
            onSelect={() => router.push('/(tabs)/boardroom' as any)}
          />
        ))}
      </ScrollView>

      {/* Emergency Killswitch Modal */}
      <KillswitchModal
        visible={isKillswitchModalVisible}
        isEmergencyActive={isEmergencyActive}
        onClose={() => setIsKillswitchModalVisible(false)}
        onConfirmToggle={() => setIsEmergencyActive(!isEmergencyActive)}
      />
    </SafeAreaView>
  );
}
