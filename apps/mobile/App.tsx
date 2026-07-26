import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ExecutiveCard } from "./components/ExecutiveCard";
import { MissionPanel } from "./components/MissionPanel";
import { VoiceDock } from "./components/VoiceDock";
import { Building2, Sparkles, LayoutDashboard, ShieldCheck } from "lucide-react-native";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-[#0b0f19]">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-gray-800/80 bg-gray-900/60">
        <View className="flex-row items-center space-x-2.5">
          <View className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
            <Building2 size={20} color="#06b6d4" />
          </View>
          <View>
            <Text className="text-xl font-extrabold text-white tracking-wide">HQ Mobile</Text>
            <Text className="text-xs text-gray-400 font-medium">Autonomous Executive Suite</Text>
          </View>
        </View>

        <TouchableOpacity className="p-2 rounded-xl bg-gray-800 border border-gray-700">
          <LayoutDashboard size={20} color="#06b6d4" />
        </TouchableOpacity>
      </View>

      {/* Main Scroll Content */}
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Banner */}
        <View className="p-4 mb-5 rounded-2xl bg-gradient-to-r from-cyan-900/40 to-violet-900/40 border border-cyan-500/30">
          <View className="flex-row items-center space-x-2 mb-1">
            <Sparkles size={18} color="#06b6d4" />
            <Text className="text-sm font-bold text-cyan-300">Boardroom Active</Text>
          </View>
          <Text className="text-xs text-gray-300 leading-relaxed">
            AI Executives are currently orchestrating automated workflows and analyzing platform telemetry in real-time.
          </Text>
        </View>

        {/* System Overview Stats */}
        <View className="flex-row space-x-3 mb-5">
          <View className="flex-1 p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800">
            <Text className="text-xs text-gray-400">System Status</Text>
            <View className="flex-row items-center space-x-1.5 mt-1">
              <ShieldCheck size={16} color="#10b981" />
              <Text className="text-base font-extrabold text-emerald-400">Operational</Text>
            </View>
          </View>
          <View className="flex-1 p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800">
            <Text className="text-xs text-gray-400">Active Executives</Text>
            <Text className="text-base font-extrabold text-cyan-400 mt-1">4 Online</Text>
          </View>
        </View>

        {/* AI Executives Section */}
        <Text className="text-base font-bold text-white mb-3 tracking-wide">AI Executive Team</Text>
        <ExecutiveCard name="Chief Executive Officer" role="Strategy & Governance" status="active" confidence={98} />
        <ExecutiveCard name="Chief Financial Officer" role="Capital & Billing Intelligence" status="busy" confidence={95} />
        <ExecutiveCard name="Chief Technology Officer" role="Infrastructure & Telemetry" status="active" confidence={99} />
        <ExecutiveCard name="Chief Legal Officer" role="Compliance & Audit" status="idle" confidence={94} />

        {/* Mission Feed */}
        <View className="mt-2">
          <MissionPanel />
        </View>
      </ScrollView>

      {/* Floating Voice Assistant Dock */}
      <VoiceDock />
    </SafeAreaView>
  );
}
