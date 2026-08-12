import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { HQColors } from '../../constants/theme';
import { api } from '../../lib/api-client';
import {
  Rocket,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react-native';

export interface MissionItem {
  id: string;
  objective: string;
  status: 'QUEUED' | 'PLANNING' | 'EXECUTING' | 'APPROVED' | 'DELIVERED' | 'ARCHIVED';
  healthScore?: string;
  deadline?: string;
  createdAt: string;
  taskCount?: number;
}

interface MissionsHubProps {
  onSelectMission: (id: string) => void;
}

export function MissionsHub({ onSelectMission }: MissionsHubProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXECUTING' | 'QUEUED' | 'DELIVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Deploy Mission Modal State
  const [showModal, setShowModal] = useState(false);
  const [objective, setObjective] = useState('');
  const [selectedLead, setSelectedLead] = useState('ceo');
  const [deploying, setDeploying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions();
  }, [activeTab, searchQuery]);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await api.get<MissionItem[]>('/missions', 3000);
      if (res.ok && Array.isArray(res.data)) {
        setMissions(res.data);
      } else {
        loadFallbackMissions();
      }
    } catch (e) {
      loadFallbackMissions();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackMissions = () => {
    setMissions([
      {
        id: 'miss-1',
        objective: 'Deploy Automated West African Logistics Corridor Tracking Telemetry',
        status: 'EXECUTING',
        healthScore: '98% Excellent',
        createdAt: new Date().toISOString(),
        taskCount: 6,
      },
      {
        id: 'miss-2',
        objective: 'Execute Boardroom Executive AI Memory Synchronization Protocol',
        status: 'EXECUTING',
        healthScore: '96% Excellent',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        taskCount: 4,
      },
      {
        id: 'miss-3',
        objective: 'Conduct Q3 Financial Audit & Treasury Tax Compliance Verification',
        status: 'QUEUED',
        healthScore: 'Standard',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        taskCount: 3,
      },
      {
        id: 'miss-4',
        objective: 'Re-align Brand Tone of Voice across Multi-Region Enterprise Sites',
        status: 'DELIVERED',
        healthScore: '100% Completed',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        taskCount: 5,
      },
    ]);
  };

  const handleDeployMission = async () => {
    if (!objective.trim()) {
      setErrorMsg('Please enter a clear mission directive objective.');
      return;
    }
    setErrorMsg(null);
    setDeploying(true);

    try {
      const res = await api.post<{ id: string }>('/missions', {
        objective: objective.trim(),
      });

      if (res.ok && res.data?.id) {
        setShowModal(false);
        setObjective('');
        onSelectMission(res.data.id);
      } else {
        // Fallback local mission creation
        const newId = `miss-new-${Date.now()}`;
        setShowModal(false);
        setObjective('');
        onSelectMission(newId);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to deploy autonomous mission');
    } finally {
      setDeploying(false);
    }
  };

  const filteredMissions = missions.filter((m) => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'EXECUTING'
        ? m.status === 'EXECUTING' || m.status === 'PLANNING'
        : activeTab === 'QUEUED'
        ? m.status === 'QUEUED'
        : m.status === 'DELIVERED' || m.status === 'APPROVED';

    const matchesSearch = m.objective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const executingCount = missions.filter(
    (m) => m.status === 'EXECUTING' || m.status === 'PLANNING'
  ).length;
  const deliveredCount = missions.filter(
    (m) => m.status === 'DELIVERED' || m.status === 'APPROVED'
  ).length;

  return (
    <View className="flex-1 space-y-4">
      {/* Top Action Header Bar */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          <View className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
            <Rocket size={18} color={HQColors.cyan} />
          </View>
          <View>
            <Text className="text-base font-black text-white tracking-tight">
              Mission Command Center
            </Text>
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Autonomous Execution Hub
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowModal(true)}
          className="py-2 px-3 rounded-xl bg-cyan-500 border border-cyan-400/50 flex-row items-center space-x-1 shadow-md shadow-cyan-500/30"
        >
          <Plus size={14} color="#ffffff" />
          <Text className="text-xs font-black text-white">Deploy Mission</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Summary Strip */}
      <View className="flex-row space-x-3">
        <View className="flex-1 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center space-x-3">
          <View className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30">
            <Cpu size={16} color={HQColors.cyan} />
          </View>
          <View>
            <Text className="text-lg font-black text-white">{executingCount}</Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase">EXECUTING</Text>
          </View>
        </View>

        <View className="flex-1 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex-row items-center space-x-3">
          <View className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
            <CheckCircle2 size={16} color="#10b981" />
          </View>
          <View>
            <Text className="text-lg font-black text-white">{deliveredCount}</Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase">DELIVERED</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs & Search Bar */}
      <View className="space-y-2.5">
        <View className="flex-row bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'EXECUTING', label: 'Executing' },
            { id: 'QUEUED', label: 'Queued' },
            { id: 'DELIVERED', label: 'Delivered' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-xl items-center ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-sm'
                  : ''
              }`}
            >
              <Text
                className={`text-[11px] font-extrabold ${
                  activeTab === tab.id ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5">
          <Search size={16} color="#64748b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search mission directives..."
            placeholderTextColor="#64748b"
            className="flex-1 text-xs text-white font-medium ml-2.5"
          />
        </View>
      </View>

      {/* Missions List */}
      {loading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator color={HQColors.cyan} size="large" />
          <Text className="text-xs text-slate-400 font-bold mt-3 tracking-wider">
            LOADING MISSIONS COMMAND HUB...
          </Text>
        </View>
      ) : filteredMissions.length === 0 ? (
        <View className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 items-center justify-center text-center">
          <Rocket size={36} color="#64748b" className="mb-2" />
          <Text className="text-sm font-black text-white">No Missions Found</Text>
          <Text className="text-xs text-slate-400 text-center mt-1">
            Deploy an autonomous mission directive to delegate tasks to your AI Chief of Staff.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
          {filteredMissions.map((miss) => {
            const isExecuting = miss.status === 'EXECUTING' || miss.status === 'PLANNING';
            const isDelivered = miss.status === 'DELIVERED' || miss.status === 'APPROVED';

            return (
              <TouchableOpacity
                key={miss.id}
                activeOpacity={0.8}
                onPress={() => onSelectMission(miss.id)}
                className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center space-x-2 mb-1.5">
                    {/* Status Badge */}
                    <View
                      className={`px-2 py-0.5 rounded-md border flex-row items-center space-x-1 ${
                        isExecuting
                          ? 'bg-cyan-500/20 border-cyan-400/40'
                          : isDelivered
                          ? 'bg-emerald-500/20 border-emerald-400/40'
                          : 'bg-amber-500/20 border-amber-400/40'
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-black uppercase ${
                          isExecuting
                            ? 'text-cyan-300'
                            : isDelivered
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                        }`}
                      >
                        {miss.status}
                      </Text>
                    </View>

                    {miss.healthScore && (
                      <View className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                        <Text className="text-[9px] font-bold text-slate-300">
                          {miss.healthScore}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-xs font-bold text-white leading-snug" numberOfLines={2}>
                    {miss.objective}
                  </Text>

                  <View className="flex-row items-center space-x-3 mt-2.5">
                    <View className="flex-row items-center space-x-1">
                      <Layers size={12} color="#64748b" />
                      <Text className="text-[10px] text-slate-400 font-bold">
                        {miss.taskCount || 4} Tasks (WBS)
                      </Text>
                    </View>

                    <View className="flex-row items-center space-x-1">
                      <Clock size={12} color="#64748b" />
                      <Text className="text-[10px] text-slate-500 font-bold">
                        {new Date(miss.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <ChevronRight size={18} color="#64748b" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Deploy Mission Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/85 justify-end">
          <View className="w-full bg-[#0A0A0C] border-t border-slate-800 rounded-t-3xl p-6 space-y-4">
            <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
              <View className="flex-row items-center space-x-2">
                <Rocket size={18} color={HQColors.cyan} />
                <Text className="text-base font-black text-white">Deploy Autonomous Mission</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {errorMsg && (
              <View className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex-row items-center space-x-2">
                <AlertCircle size={16} color="#f43f5e" />
                <Text className="text-xs text-rose-300 font-medium flex-1">{errorMsg}</Text>
              </View>
            )}

            {/* Objective Input */}
            <View>
              <Text className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Mission Objective / Directive
              </Text>
              <View className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                <TextInput
                  value={objective}
                  onChangeText={setObjective}
                  placeholder="e.g. Conduct automated security posture audit across primary API routes..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={3}
                  className="text-xs text-white font-medium text-top"
                />
              </View>
            </View>

            {/* Lead Executive Selection */}
            <View>
              <Text className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Assign Lead Executive Officer
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { key: 'ceo', name: 'Asad (CEO)' },
                  { key: 'operations_director', name: 'Teema (Operations)' },
                  { key: 'legal_compliance_director', name: 'Legal (Compliance)' },
                  { key: 'human_resources_director', name: 'Resource (HR)' },
                  { key: 'public_search_agent', name: 'Mr. Intelligence' },
                ].map((exec) => {
                  const isSelected = selectedLead === exec.key;
                  return (
                    <TouchableOpacity
                      key={exec.key}
                      onPress={() => setSelectedLead(exec.key)}
                      className={`py-2 px-3 rounded-xl border flex-row items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-cyan-300' : 'text-slate-400'
                        }`}
                      >
                        {exec.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Action */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDeployMission}
              disabled={deploying}
              className="w-full py-4 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30"
            >
              {deploying ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Rocket size={16} color="#ffffff" />
                  <Text className="text-xs font-black text-white tracking-wider uppercase">
                    Deploy Directive to Swarm
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
