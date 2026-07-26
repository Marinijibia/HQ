import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Cpu, ShieldCheck, Zap } from "lucide-react-native";

interface ExecutiveProps {
  name: string;
  role: string;
  status: "active" | "idle" | "busy";
  confidence: number;
  onSelect?: () => void;
}

export function ExecutiveCard({ name, role, status, confidence, onSelect }: ExecutiveProps) {
  const statusColors = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    idle: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    busy: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      className="p-4 mb-3 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-lg"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center space-x-3">
          <View className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Cpu size={22} color="#06b6d4" />
          </View>
          <View>
            <Text className="text-lg font-bold text-white">{name}</Text>
            <Text className="text-xs text-gray-400 font-medium">{role}</Text>
          </View>
        </View>
        <View className={`px-2.5 py-1 rounded-full border ${statusColors[status]}`}>
          <Text className="text-xs font-semibold uppercase tracking-wider">{status}</Text>
        </View>
      </View>

      <View className="mt-2 flex-row items-center justify-between pt-3 border-t border-gray-800/80">
        <View className="flex-row items-center space-x-1.5">
          <ShieldCheck size={14} color="#10b981" />
          <Text className="text-xs text-gray-300">Confidence Score</Text>
        </View>
        <View className="flex-row items-center space-x-1">
          <Zap size={13} color="#06b6d4" />
          <Text className="text-xs font-bold text-cyan-400">{confidence}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
