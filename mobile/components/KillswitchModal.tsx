import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ShieldAlert, AlertTriangle, Check, X } from 'lucide-react-native';

interface KillswitchModalProps {
  visible: boolean;
  isEmergencyActive: boolean;
  onClose: () => void;
  onConfirmToggle: () => void;
}

export function KillswitchModal({
  visible,
  isEmergencyActive,
  onClose,
  onConfirmToggle,
}: KillswitchModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center p-5">
        <View className="w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <View className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 items-center justify-center mb-4">
            <ShieldAlert size={26} color="#f43f5e" />
          </View>

          <Text className="text-xl font-extrabold text-white mb-2">
            {isEmergencyActive ? 'Resume Swarm Execution?' : 'Biometric Emergency Freeze?'}
          </Text>

          <Text className="text-sm text-gray-300 leading-relaxed mb-6">
            {isEmergencyActive
              ? 'This will reactivate automated C-Suite executive workflows and resume telemetry updates across all connected nodes.'
              : 'This will instantly freeze all active AI executive tasks, hold outgoing credit spending, and lock document write access.'}
          </Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="flex-1 py-3.5 rounded-xl bg-gray-800 border border-gray-700 items-center"
            >
              <Text className="text-sm font-bold text-gray-300">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onConfirmToggle();
                onClose();
              }}
              className={`flex-1 py-3.5 rounded-xl items-center ${
                isEmergencyActive ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              <Text className="text-sm font-extrabold text-white">
                {isEmergencyActive ? 'Resume' : 'Freeze Swarm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
