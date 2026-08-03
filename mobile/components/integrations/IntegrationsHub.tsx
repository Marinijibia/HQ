import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { HQColors } from '../../constants/theme';
import {
  Plug2,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';

interface ConnectedApp {
  id: string;
  name: string;
  category: string;
  logo: string;
  status: 'Healthy' | 'Syncing' | 'Re-authorizing' | 'Error';
  lastSync: string;
  executives: string[];
}

export function IntegrationsHub() {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([
    {
      id: 'slack',
      name: 'Slack Workspace',
      category: 'Communication',
      logo: '💬',
      status: 'Healthy',
      lastSync: '10 mins ago',
      executives: ['CEO Elena', 'CMO Amara'],
    },
    {
      id: 'gdrive',
      name: 'Google Drive Enterprise',
      category: 'Storage & Docs',
      logo: '📁',
      status: 'Healthy',
      lastSync: '1 hour ago',
      executives: ['CEO Elena', 'CTO Hiroshi'],
    },
    {
      id: 'github',
      name: 'GitHub Monorepo',
      category: 'Development',
      logo: '🐙',
      status: 'Syncing',
      lastSync: 'Just now',
      executives: ['CTO Hiroshi'],
    },
    {
      id: 'notion',
      name: 'Notion Knowledge Base',
      category: 'Productivity',
      logo: '📝',
      status: 'Healthy',
      lastSync: '2 hours ago',
      executives: ['CPO Marcus'],
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Treasury',
      category: 'Finance & Tax',
      logo: '📊',
      status: 'Healthy',
      lastSync: '4 hours ago',
      executives: ['CFO Sophia'],
    },
  ]);

  const handleManualSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setConnectedApps((prev) =>
        prev.map((app) => (app.id === id ? { ...app, lastSync: 'Just now', status: 'Healthy' } : app))
      );
    }, 800);
  };

  return (
    <View className="space-y-4">
      {/* Top Action Header */}
      <View className="flex-row items-center space-x-2">
        <View className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
          <Plug2 size={18} color={HQColors.cyan} />
        </View>
        <View>
          <Text className="text-base font-black text-white tracking-tight">
            Integration Hub & SaaS Connectors
          </Text>
          <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Connected Enterprise Telemetry Nodes
          </Text>
        </View>
      </View>

      {/* Connected Apps Roster */}
      <View className="space-y-3">
        {connectedApps.map((app) => {
          const isSyncing = syncingId === app.id || app.status === 'Syncing';

          return (
            <View
              key={app.id}
              className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-3 flex-1 pr-2">
                  <View className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 items-center justify-center">
                    <Text className="text-lg">{app.logo}</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-xs font-bold text-white">{app.name}</Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">
                      {app.category} &bull; Last sync: {app.lastSync}
                    </Text>
                  </View>
                </View>

                {/* Health Badge */}
                <View
                  className={`px-2.5 py-0.5 rounded-full border flex-row items-center space-x-1 ${
                    isSyncing
                      ? 'bg-cyan-500/20 border-cyan-400/40'
                      : 'bg-emerald-500/20 border-emerald-400/40'
                  }`}
                >
                  <Text
                    className={`text-[9px] font-black uppercase ${
                      isSyncing ? 'text-cyan-300' : 'text-emerald-400'
                    }`}
                  >
                    {isSyncing ? 'SYNCING' : app.status}
                  </Text>
                </View>
              </View>

              {/* Bottom Actions & Assigned Executives */}
              <View className="pt-2 border-t border-slate-800/80 flex-row items-center justify-between">
                <Text className="text-[10px] text-slate-400 font-medium">
                  Assigned: {app.executives.join(', ')}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleManualSync(app.id)}
                  disabled={isSyncing}
                  className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 flex-row items-center space-x-1"
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color={HQColors.cyan} />
                  ) : (
                    <>
                      <RefreshCw size={12} color="#64748b" />
                      <Text className="text-[10px] font-bold text-slate-300">Sync Now</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
