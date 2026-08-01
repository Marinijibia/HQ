import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Building2, ShieldAlert, Wifi, Sparkles } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  isEmergencyActive?: boolean;
  onToggleEmergency?: () => void;
}

export function Header({
  title = "HQ Mobile",
  subtitle = "Autonomous C-Suite Swarm",
  isEmergencyActive = false,
  onToggleEmergency,
}: HeaderProps) {
  return (
    <View className="px-4 pt-4 pb-3 flex-row items-center justify-between border-b border-gray-800/90 bg-gray-950/80">
      <View className="flex-row items-center space-x-3">
        <View className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
          <Building2 size={20} color="#06b6d4" />
        </View>
        <View>
          <View className="flex-row items-center space-x-1.5">
            <Text className="text-lg font-extrabold text-white tracking-wide">{title}</Text>
            <View className="w-2 h-2 rounded-full bg-emerald-400" />
          </View>
          <Text className="text-xs text-gray-400 font-medium">{subtitle}</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggleEmergency}
        className={`px-3 py-1.5 rounded-xl flex-row items-center space-x-1.5 border ${
          isEmergencyActive
            ? 'bg-rose-600/30 border-rose-500/60'
            : 'bg-gray-900 border-gray-800'
        }`}
      >
        <ShieldAlert size={14} color={isEmergencyActive ? '#f43f5e' : '#9ca3af'} />
        <Text
          className={`text-xs font-bold ${
            isEmergencyActive ? 'text-rose-400' : 'text-gray-300'
          }`}
        >
          {isEmergencyActive ? 'FROZEN' : 'OVERRIDE'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
