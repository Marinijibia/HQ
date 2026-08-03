import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { HQColors } from '../../constants/theme';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Cpu,
  Key,
  Smartphone,
  Globe,
  Trash2,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react-native';

interface ActiveSession {
  id: string;
  identity: string;
  type: 'Human' | 'AI Executive' | 'Service';
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent?: boolean;
}

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  isActive: boolean;
}

export function TrustCenterView() {
  const [securityScore, setSecurityScore] = useState(98);
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-1',
      identity: 'Current Executive Device',
      type: 'Human',
      device: 'Mobile App Node',
      ip: '197.210.64.12',
      location: 'Lagos, Nigeria',
      lastActive: 'Active Now',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      identity: 'CFO Sophia',
      type: 'AI Executive',
      device: 'HQ Swarm Container v4',
      ip: '10.0.4.12',
      location: 'Cloud Node EU-West',
      lastActive: '3 mins ago',
    },
    {
      id: 'sess-3',
      identity: 'Web Console Gateway',
      type: 'Human',
      device: 'macOS · Chrome 126',
      ip: '102.89.34.88',
      location: 'London, UK',
      lastActive: '12 mins ago',
    },
    {
      id: 'sess-4',
      identity: 'GitHub Connector',
      type: 'Service',
      device: 'Webhook Receiver Gateway',
      ip: '140.82.115.4',
      location: 'GitHub IP Range',
      lastActive: 'Just now',
    },
  ]);

  const [apiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Stripe Webhook Signing Key',
      keyPrefix: 'whsec_e582...',
      lastUsedAt: '10 mins ago',
      isActive: true,
    },
    {
      id: 'key-2',
      name: 'OpenAI Gemini Routing Key',
      keyPrefix: 'sk-proj-4a91...',
      lastUsedAt: 'Just now',
      isActive: true,
    },
  ]);

  const handleRevokeSession = (id: string, identity: string) => {
    Alert.alert(
      'Revoke Session',
      `Are you sure you want to terminate session for "${identity}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => {
            setSessions((prev) => prev.filter((s) => s.id !== id));
          },
        },
      ]
    );
  };

  return (
    <View className="space-y-4">
      {/* Security Health Score Banner */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl items-center">
        <View className="flex-row items-center space-x-2 mb-2">
          <ShieldCheck size={20} color="#10b981" />
          <Text className="text-xs font-black text-emerald-400 uppercase tracking-widest">
            SOC2 TYPE II CERTIFIED
          </Text>
        </View>

        {/* Score Ring */}
        <View className="w-24 h-24 rounded-full border-4 border-emerald-500/40 items-center justify-center bg-slate-950 my-2 shadow-lg shadow-emerald-500/20">
          <Text className="text-3xl font-black text-white">{securityScore}%</Text>
          <Text className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
            POSTURE
          </Text>
        </View>

        <Text className="text-sm font-black text-white tracking-tight mt-1">
          Executive Security Posture: Excellent
        </Text>
        <Text className="text-[11px] text-slate-400 text-center mt-0.5 leading-relaxed">
          256-bit Encrypted Command Infrastructure with automated key rotation.
        </Text>
      </View>

      {/* Active Sessions Monitor */}
      <View className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Activity size={16} color={HQColors.cyan} />
            <Text className="text-xs font-black text-white">Active Sessions & Connected Nodes</Text>
          </View>
          <View className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40">
            <Text className="text-[10px] font-black text-cyan-300">
              {sessions.length} ACTIVE
            </Text>
          </View>
        </View>

        <View className="space-y-2.5 mt-1">
          {sessions.map((sess) => (
            <View
              key={sess.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex-row items-center justify-between"
            >
              <View className="flex-row items-center space-x-3 flex-1 pr-2">
                <View className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  {sess.type === 'AI Executive' ? (
                    <Cpu size={16} color={HQColors.cyan} />
                  ) : sess.type === 'Service' ? (
                    <Key size={16} color="#f59e0b" />
                  ) : (
                    <Smartphone size={16} color="#10b981" />
                  )}
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center space-x-1.5">
                    <Text className="text-xs font-bold text-white" numberOfLines={1}>
                      {sess.identity}
                    </Text>
                    {sess.isCurrent && (
                      <View className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/30">
                        <Text className="text-[9px] font-black text-cyan-300">THIS DEVICE</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[10px] text-slate-400 mt-0.5">
                    {sess.device} &bull; {sess.location} ({sess.ip})
                  </Text>
                </View>
              </View>

              {!sess.isCurrent && (
                <TouchableOpacity
                  onPress={() => handleRevokeSession(sess.id, sess.identity)}
                  className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/60"
                >
                  <Trash2 size={14} color="#f43f5e" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* API Credentials Vault */}
      <View className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <View className="flex-row items-center space-x-2">
          <Key size={16} color={HQColors.cyan} />
          <Text className="text-xs font-black text-white">API Credentials & Vault Secrets</Text>
        </View>

        <View className="space-y-2">
          {apiKeys.map((key) => (
            <View
              key={key.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-2">
                <Text className="text-xs font-bold text-white">{key.name}</Text>
                <Text className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {key.keyPrefix} &bull; Last used: {key.lastUsedAt}
                </Text>
              </View>

              <View className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40">
                <Text className="text-[9px] font-black text-emerald-400">ACTIVE</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
