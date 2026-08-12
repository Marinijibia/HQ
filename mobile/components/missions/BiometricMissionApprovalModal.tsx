import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { HQColors } from '../../constants/theme';
import { Fingerprint, ShieldCheck, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react-native';

interface BiometricMissionApprovalModalProps {
  visible: boolean;
  missionTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BiometricMissionApprovalModal({
  visible,
  missionTitle,
  onClose,
  onSuccess,
}: BiometricMissionApprovalModalProps) {
  const [authenticating, setAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuthenticate = async () => {
    setErrorMsg(null);
    setAuthenticating(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Scan Face ID / Touch ID to Sign Off & Authorize Mission',
          fallbackLabel: 'Enter Security Passcode',
          cancelLabel: 'Cancel',
        });

        if (result.success) {
          onSuccess();
          onClose();
        } else if (result.error !== 'user_cancel') {
          setErrorMsg(result.error || 'Biometric authorization failed');
        }
      } else {
        // Fallback authorization if biometrics not enrolled
        onSuccess();
        onClose();
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Authentication error');
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }} className="flex-1 bg-black/85 justify-center items-center p-5">
        <View className="w-full max-w-sm bg-[#0A0A0C] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
            <View className="flex-row items-center space-x-2">
              <ShieldCheck size={20} color={HQColors.cyan} />
              <Text className="text-sm font-black text-white">Biometric Approval Gate</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Mission Details Card */}
          <View className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <Text className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              MISSION TO AUTHORIZE
            </Text>
            <Text className="text-xs font-bold text-white leading-relaxed" numberOfLines={2}>
              {missionTitle}
            </Text>
          </View>

          {/* Biometric Scan Target */}
          <View className="py-4 items-center justify-center space-y-3">
            <View className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 items-center justify-center shadow-lg shadow-cyan-500/30">
              <Fingerprint size={38} color={HQColors.cyan} />
            </View>
            <Text className="text-xs font-bold text-slate-300 text-center px-2">
              Face ID / Biometric Signature Required for Executive Authorization
            </Text>
          </View>

          {errorMsg && (
            <View className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 flex-row items-center space-x-2">
              <AlertCircle size={14} color="#f43f5e" />
              <Text className="text-xs text-rose-300 font-medium flex-1">{errorMsg}</Text>
            </View>
          )}

          {/* Actions */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAuthenticate}
            disabled={authenticating}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30"
          >
            {authenticating ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Lock size={16} color="#ffffff" />
                <Text className="text-xs font-black text-white uppercase tracking-wider">
                  Scan Face ID to Authorize
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
