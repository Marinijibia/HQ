import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { HQColors } from '../../constants/theme';
import { api } from '../../lib/api-client';
import { BiometricMissionApprovalModal } from './BiometricMissionApprovalModal';
import {
  ArrowLeft,
  Rocket,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  Activity,
  Check,
  Fingerprint,
} from 'lucide-react-native';

interface WbsTask {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  executiveName?: string;
}

interface MissionDetailViewProps {
  missionId: string;
  onBack: () => void;
}

export function MissionDetailView({ missionId, onBack }: MissionDetailViewProps) {
  const [mission, setMission] = useState<any>(null);
  const [tasks, setTasks] = useState<WbsTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const handleBiometricApprovalSuccess = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/missions/${missionId}`, { status: 'APPROVED' });
      setMission((prev: any) => ({ ...prev, status: 'APPROVED' }));
    } catch {
      setMission((prev: any) => ({ ...prev, status: 'APPROVED' }));
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionDetails();
  }, [missionId]);

  const fetchMissionDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>(`/missions/${missionId}`, 3000);
      if (res.ok && res.data) {
        setMission(res.data);
        if (Array.isArray(res.data.tasks)) {
          setTasks(res.data.tasks);
        } else {
          loadFallbackTasks();
        }
      } else {
        loadFallbackDetails();
      }
    } catch (e) {
      loadFallbackDetails();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackDetails = () => {
    setMission({
      id: missionId,
      objective: 'Deploy Automated West African Logistics Corridor Tracking Telemetry',
      status: 'EXECUTING',
      healthScore: '98% Excellent',
      createdAt: new Date().toISOString(),
    });
    loadFallbackTasks();
  };

  const loadFallbackTasks = () => {
    setTasks([
      {
        id: 't-1',
        name: 'Analyze Telemetry Route Data & Corridor Bandwidth',
        status: 'COMPLETED',
        executiveName: 'Dr. Hiroshi Tanaka (CTO)',
      },
      {
        id: 't-2',
        name: 'Deploy Real-Time Sub-Agent Watchers on Cloud EU-West',
        status: 'RUNNING',
        executiveName: 'Dr. Hiroshi Tanaka (CTO)',
      },
      {
        id: 't-3',
        name: 'Conduct Treasury Capital Allocation & Budget Sanity Check',
        status: 'PENDING',
        executiveName: 'Sophia Sterling (CFO)',
      },
      {
        id: 't-4',
        name: 'Synthesize Regional Compliance & Legal Hold Audits',
        status: 'PENDING',
        executiveName: 'Elena Rostova (CEO)',
      },
    ]);
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await api.post(`/missions/${missionId}/start`, {});
      setMission((prev: any) => ({ ...prev, status: 'EXECUTING' }));
    } catch (e) {
      setMission((prev: any) => ({ ...prev, status: 'EXECUTING' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await api.post(`/missions/${missionId}/pause`, {});
      setMission((prev: any) => ({ ...prev, status: 'PLANNING' }));
    } catch (e) {
      setMission((prev: any) => ({ ...prev, status: 'PLANNING' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await api.post(`/missions/${missionId}/resume`, {});
      setMission((prev: any) => ({ ...prev, status: 'EXECUTING' }));
    } catch (e) {
      setMission((prev: any) => ({ ...prev, status: 'EXECUTING' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert('Cancel Mission', 'Are you sure you want to cancel this mission directive?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancel Mission',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.delete(`/missions/${missionId}`);
          } catch (e) {
            // ignore
          } finally {
            setActionLoading(false);
            onBack();
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color={HQColors.cyan} size="large" />
        <Text className="text-xs text-slate-400 font-bold mt-3 tracking-wider">
          LOADING MISSION DIRECTIVE...
        </Text>
      </View>
    );
  }

  const isExecuting = mission?.status === 'EXECUTING';
  const isPlanning = mission?.status === 'PLANNING' || mission?.status === 'QUEUED';

  return (
    <View className="flex-1 space-y-4">
      {/* Navigation Header */}
      <View className="flex-row items-center space-x-2 pb-2 border-b border-slate-800">
        <TouchableOpacity
          onPress={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowLeft size={18} color="#ffffff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xs font-black text-white" numberOfLines={1}>
            {mission?.objective}
          </Text>
          <Text className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            Mission Execution Inspector
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
        {/* Mission Status & Health Hero Card */}
        <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <ShieldCheck size={18} color="#10b981" />
              <Text className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                {mission?.healthScore || '98% Excellent'}
              </Text>
            </View>

            <View className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40">
              <Text className="text-[10px] font-black text-cyan-300 uppercase">
                {mission?.status}
              </Text>
            </View>
          </View>

          <Text className="text-sm font-black text-white leading-snug">
            {mission?.objective}
          </Text>

          {/* Execution Control Action Toolbar */}
          <View className="pt-2 border-t border-slate-800/80 flex-row space-x-2">
            {isPlanning && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleStart}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-1.5 shadow-md shadow-cyan-500/30"
              >
                <Play size={14} color="#ffffff" />
                <Text className="text-xs font-black text-white uppercase">Start Execution</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowBiometricModal(true)}
              disabled={actionLoading}
              className="py-3 px-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex-row items-center justify-center space-x-1.5"
            >
              <Fingerprint size={16} color={HQColors.cyan} />
              <Text className="text-xs font-black text-cyan-300 uppercase">Sign Off (Face ID)</Text>
            </TouchableOpacity>

            {isExecuting && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePause}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex-row items-center justify-center space-x-1.5"
              >
                <Pause size={14} color="#f59e0b" />
                <Text className="text-xs font-black text-amber-300 uppercase">Pause</Text>
              </TouchableOpacity>
            )}

            {!isExecuting && !isPlanning && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleResume}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex-row items-center justify-center space-x-1.5"
              >
                <RotateCcw size={14} color={HQColors.cyan} />
                <Text className="text-xs font-black text-cyan-300 uppercase">Resume</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCancel}
              disabled={actionLoading}
              className="px-4 py-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex-row items-center justify-center"
            >
              <Trash2 size={16} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </View>

        <BiometricMissionApprovalModal
          visible={showBiometricModal}
          missionTitle={mission?.objective || 'Directive Authorization'}
          onClose={() => setShowBiometricModal(false)}
          onSuccess={handleBiometricApprovalSuccess}
        />

        {/* WBS Task DAG Graph Breakdown */}
        <View className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <Layers size={16} color={HQColors.cyan} />
              <Text className="text-xs font-black text-white">
                Work Breakdown Structure (WBS Tasks)
              </Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
              <Text className="text-[10px] font-bold text-slate-400">
                {tasks.length} Sub-Tasks
              </Text>
            </View>
          </View>

          <View className="space-y-2.5 mt-1">
            {tasks.map((task) => {
              const isDone = task.status === 'COMPLETED';
              const isRunning = task.status === 'RUNNING';

              return (
                <View
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center space-x-3 flex-1 pr-2">
                    <View
                      className={`p-2 rounded-xl border ${
                        isDone
                          ? 'bg-emerald-500/20 border-emerald-400/40'
                          : isRunning
                          ? 'bg-cyan-500/20 border-cyan-400/40'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      {isDone ? (
                        <Check size={14} color="#10b981" />
                      ) : isRunning ? (
                        <ActivityIndicator size="small" color={HQColors.cyan} />
                      ) : (
                        <Clock size={14} color="#64748b" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-xs font-bold text-white" numberOfLines={2}>
                        {task.name}
                      </Text>
                      {task.executiveName && (
                        <Text className="text-[10px] text-slate-400 mt-0.5">
                          Assigned: {task.executiveName}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View
                    className={`px-2 py-0.5 rounded-md border ${
                      isDone
                        ? 'bg-emerald-500/20 border-emerald-400/30'
                        : isRunning
                        ? 'bg-cyan-500/20 border-cyan-400/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <Text
                      className={`text-[9px] font-black uppercase ${
                        isDone
                          ? 'text-emerald-400'
                          : isRunning
                          ? 'text-cyan-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {task.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
