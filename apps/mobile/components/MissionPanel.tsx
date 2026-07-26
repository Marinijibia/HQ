import React from "react";
import { View, Text } from "react-native";
import { Activity, CheckCircle2, Clock } from "lucide-react-native";

export function MissionPanel() {
  const missions = [
    { id: "M1", name: "Market Intelligence Scan", status: "running", time: "2m ago" },
    { id: "M2", name: "Quarterly Audit Verification", status: "completed", time: "1h ago" },
  ];

  return (
    <View className="p-4 mb-4 rounded-2xl bg-gray-900/90 border border-gray-800">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center space-x-2">
          <Activity size={18} color="#06b6d4" />
          <Text className="text-base font-bold text-white">Active Missions</Text>
        </View>
        <Text className="text-xs text-cyan-400 font-semibold">{missions.length} Tasks</Text>
      </View>

      {missions.map((m) => (
        <View key={m.id} className="p-3 mb-2 rounded-xl bg-gray-800/60 border border-gray-700/50 flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2.5">
            {m.status === "running" ? (
              <Clock size={16} color="#06b6d4" />
            ) : (
              <CheckCircle2 size={16} color="#10b981" />
            )}
            <Text className="text-sm font-medium text-gray-200">{m.name}</Text>
          </View>
          <Text className="text-xs text-gray-400">{m.time}</Text>
        </View>
      ))}
    </View>
  );
}
