import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { HQColors } from '../../constants/theme';
import {
  Activity,
  Users,
  Zap,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Cpu,
  BarChart3,
} from 'lucide-react-native';

export function AnalyticsView() {
  const [execUtilization] = useState([
    { name: 'Elena Rostova', title: 'CEO', hours: 42, percentage: 90 },
    { name: 'Dr. Hiroshi Tanaka', title: 'CTO', hours: 38, percentage: 85 },
    { name: 'Sophia Sterling', title: 'CFO', hours: 31, percentage: 72 },
    { name: 'Amara Vance', title: 'CMO', hours: 28, percentage: 65 },
  ]);

  const [costDistribution] = useState([
    { category: 'Mission Directives', percentage: 46, credits: '4,333 Cr' },
    { category: 'Deep Research & Search', percentage: 22, credits: '2,072 Cr' },
    { category: 'Boardroom Discussions', percentage: 18, credits: '1,695 Cr' },
    { category: 'Knowledge Base Indexing', percentage: 14, credits: '1,320 Cr' },
  ]);

  const [recommendations] = useState([
    {
      id: 'rec-1',
      type: 'opportunity',
      title: 'Logistics Corridor Throughput Optimization',
      category: 'Operations',
      impact: 'High',
      description: 'Expand automated sub-agent watchers on West African corridors to increase throughput by 24%.',
    },
    {
      id: 'rec-2',
      type: 'risk',
      title: 'Q3 Treasury Reserve Re-allocation',
      category: 'Finance',
      impact: 'Medium',
      description: 'Re-align monthly SaaS credit caps to prevent unexpected surge during mission scaling.',
    },
  ]);

  return (
    <View className="space-y-4">
      {/* Top Utilization KPI Banner */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Users size={18} color={HQColors.cyan} />
            <Text className="text-xs font-black text-white">Executive Director Utilization</Text>
          </View>
          <View className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40">
            <Text className="text-[10px] font-black text-cyan-300">SWARM ACTIVE</Text>
          </View>
        </View>

        <View className="space-y-3 pt-1">
          {execUtilization.map((exec) => (
            <View key={exec.name} className="space-y-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-white">
                  {exec.name} <Text className="text-[10px] text-cyan-400">({exec.title})</Text>
                </Text>
                <Text className="text-[10px] font-black text-slate-300">
                  {exec.hours} hrs ({exec.percentage}%)
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <View
                  style={{ width: `${exec.percentage}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Credit & AI Outflow Breakdown */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <View className="flex-row items-center space-x-2">
          <Zap size={18} color="#f59e0b" />
          <Text className="text-xs font-black text-white">AI Credit & Token Consumption</Text>
        </View>

        <View className="space-y-2.5 pt-1">
          {costDistribution.map((item) => (
            <View
              key={item.category}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-2">
                <Text className="text-xs font-bold text-white">{item.category}</Text>
                <Text className="text-[10px] text-slate-400 mt-0.5">
                  {item.percentage}% Total Consumption
                </Text>
              </View>
              <Text className="text-xs font-black text-amber-400">{item.credits}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* AI Strategic Recommendations */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <View className="flex-row items-center space-x-2">
          <Lightbulb size={18} color="#10b981" />
          <Text className="text-xs font-black text-white">AI Chief of Staff Recommendations</Text>
        </View>

        <View className="space-y-2.5">
          {recommendations.map((rec) => (
            <View
              key={rec.id}
              className={`p-4 rounded-2xl border ${
                rec.type === 'opportunity'
                  ? 'bg-emerald-950/30 border-emerald-800/60'
                  : 'bg-amber-950/30 border-amber-800/60'
              }`}
            >
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center space-x-1.5">
                  {rec.type === 'opportunity' ? (
                    <CheckCircle2 size={14} color="#10b981" />
                  ) : (
                    <AlertTriangle size={14} color="#f59e0b" />
                  )}
                  <Text
                    className={`text-[10px] font-black uppercase ${
                      rec.type === 'opportunity' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {rec.category} &bull; {rec.impact} Impact
                  </Text>
                </View>
              </View>

              <Text className="text-xs font-bold text-white mb-1">{rec.title}</Text>
              <Text className="text-[11px] text-slate-300 leading-relaxed">
                {rec.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
