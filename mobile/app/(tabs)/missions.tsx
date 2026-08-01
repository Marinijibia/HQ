import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Rocket, Clock, CheckCircle2, Plus, Activity, ChevronRight, Check } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';

interface MissionItem {
  id: string;
  title: string;
  lead: string;
  status: 'executing' | 'planning' | 'completed';
  progress: number;
  checkpoints: string[];
}

export default function MissionsTab() {
  const params = useLocalSearchParams();
  const [filter, setFilter] = useState<'all' | 'executing' | 'planning' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const [missions, setMissions] = useState<MissionItem[]>([
    {
      id: 'm1',
      title: 'Q3 Petroleum Logistics & Telemetry Audit',
      lead: 'CEO Director',
      status: 'executing',
      progress: 75,
      checkpoints: [
        'Collect supply chain telemetry data',
        'Verify GCS document audit integrity',
        'Deploy marketing press update',
      ],
    },
    {
      id: 'm2',
      title: 'Financial Treasury Holding Audit',
      lead: 'Finance Director',
      status: 'planning',
      progress: 40,
      checkpoints: ['Audit credit outflow parameters', 'Run Stripe balance verification'],
    },
    {
      id: 'm3',
      title: 'GDPR & SOC2 Compliance Verification',
      lead: 'Legal Director',
      status: 'completed',
      progress: 100,
      checkpoints: ['Scan classified document vault', 'Export legal hold summary report'],
    },
  ]);

  useEffect(() => {
    if (params.newMissionTitle && typeof params.newMissionTitle === 'string') {
      const created: MissionItem = {
        id: `m-${Date.now()}`,
        title: params.newMissionTitle,
        lead: 'CEO Director',
        status: 'executing',
        progress: 25,
        checkpoints: ['Initialize swarm consensus', 'Audit initial metrics'],
      };
      setMissions((prev) => [created, ...prev]);
    }
  }, [params.newMissionTitle]);

  const handleCreateMission = () => {
    if (!newTitle.trim()) return;
    const created: MissionItem = {
      id: `m-${Date.now()}`,
      title: newTitle,
      lead: 'CEO Director',
      status: 'executing',
      progress: 10,
      checkpoints: ['Initialize mission parameters'],
    };
    setMissions((prev) => [created, ...prev]);
    setNewTitle('');
    setIsModalOpen(false);
  };

  const filteredMissions = missions.filter((m) => filter === 'all' || m.status === filter);

  return (
    <SafeAreaView className="flex-1 bg-[#0b0f19]">
      <Header title="Mission Control" subtitle="Autonomous Task Execution" />

      {/* Filter Tabs */}
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800 bg-gray-950/60">
        <View className="flex-row space-x-2">
          {(['all', 'executing', 'planning', 'completed'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-full border ${
                filter === tab
                  ? 'bg-cyan-500/20 border-cyan-400'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              <Text className={`text-xs font-bold capitalize ${filter === tab ? 'text-cyan-400' : 'text-gray-400'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          className="p-2 rounded-xl bg-cyan-500 border border-cyan-400"
        >
          <Plus size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {filteredMissions.map((m) => (
          <View key={m.id} className="p-4 mb-4 rounded-2xl bg-gray-900/90 border border-gray-800">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center space-x-2">
                <Rocket size={16} color="#06b6d4" />
                <Text className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{m.lead}</Text>
              </View>
              <View
                className={`px-2.5 py-0.5 rounded-full border ${
                  m.status === 'executing'
                    ? 'bg-cyan-500/20 border-cyan-400'
                    : m.status === 'completed'
                    ? 'bg-emerald-500/20 border-emerald-400'
                    : 'bg-amber-500/20 border-amber-400'
                }`}
              >
                <Text
                  className={`text-[10px] font-bold uppercase ${
                    m.status === 'executing'
                      ? 'text-cyan-400'
                      : m.status === 'completed'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {m.status}
                </Text>
              </View>
            </View>

            <Text className="text-base font-extrabold text-white mb-2">{m.title}</Text>

            {/* Progress Bar */}
            <View className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-[11px] text-gray-400 font-medium">Checkpoint Completion</Text>
                <Text className="text-[11px] font-bold text-cyan-400">{m.progress}%</Text>
              </View>
              <View className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                <View className="h-full bg-cyan-400 rounded-full" style={{ width: `${m.progress}%` }} />
              </View>
            </View>

            {/* Sub-checkpoints */}
            <View className="pt-3 border-t border-gray-800/80 space-y-1.5">
              {m.checkpoints.map((cp, idx) => (
                <View key={idx} className="flex-row items-center space-x-2">
                  <Check size={12} color="#10b981" />
                  <Text className="text-xs text-gray-300 font-medium">{cp}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create Mission Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <View className="flex-1 bg-black/80 justify-center items-center p-5">
          <View className="w-full bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <Text className="text-lg font-extrabold text-white mb-3">Launch Autonomous Mission</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Q4 Marketing Campaign Audit"
              placeholderTextColor="#64748b"
              className="bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm font-medium mb-4"
            />
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 items-center"
              >
                <Text className="text-xs font-bold text-gray-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateMission}
                className="flex-1 py-3 rounded-xl bg-cyan-500 items-center"
              >
                <Text className="text-xs font-bold text-white">Launch Mission</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
