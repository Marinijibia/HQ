import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { HQColors } from '../../constants/theme';
import {
  Fingerprint,
  Lock,
  ShieldCheck,
  Smartphone,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';

export function BiometricSecurityView() {
  const [hasHardware, setHasHardware] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [authTypes, setAuthTypes] = useState<string[]>([]);
  const [isCheckingHardware, setIsCheckingHardware] = useState(true);

  // Settings State
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(true);
  const [requireOnLaunch, setRequireOnLaunch] = useState(true);
  const [autoLockTimeout, setAutoLockTimeout] = useState<'immediate' | '1m' | '5m' | '15m'>('1m');
  const [passcodeEnabled, setPasscodeEnabled] = useState(true);

  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [isTestingBiometric, setIsTestingBiometric] = useState(false);

  useEffect(() => {
    checkBiometricCapability();
  }, []);

  const checkBiometricCapability = async () => {
    setIsCheckingHardware(true);
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setHasHardware(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const typeNames: string[] = [];
        types.forEach((t: any) => {
          if (t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
            typeNames.push('Face ID / Facial Recognition');
          } else if (t === LocalAuthentication.AuthenticationType.FINGERPRINT) {
            typeNames.push('Touch ID / Fingerprint');
          } else if (t === LocalAuthentication.AuthenticationType.IRIS) {
            typeNames.push('Iris Recognition');
          }
        });
        setAuthTypes(typeNames);
      }
    } catch (e) {
      setHasHardware(false);
    } finally {
      setIsCheckingHardware(false);
    }
  };

  const handleTestBiometrics = async () => {
    setAuthSuccessMsg(null);
    setAuthErrorMsg(null);
    setIsTestingBiometric(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID / Biometrics for HQ Access',
        fallbackLabel: 'Enter Security Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setAuthSuccessMsg('Biometric authentication verified successfully!');
      } else {
        if (result.error !== 'user_cancel') {
          setAuthErrorMsg(result.error || 'Biometric authentication failed');
        }
      }
    } catch (e: any) {
      setAuthErrorMsg(e.message || 'Biometric authentication error');
    } finally {
      setIsTestingBiometric(false);
    }
  };

  return (
    <View className="space-y-4">
      {/* Security Status Banner */}
      <View className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <View className="flex-row items-center space-x-3 mb-2">
          <View className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40">
            <Fingerprint size={24} color={HQColors.cyan} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-black text-white">Mobile Biometric Security</Text>
            <Text className="text-[11px] text-slate-400 font-medium mt-0.5">
              Face ID, Touch ID & Passcode Identity Protection
            </Text>
          </View>
        </View>

        {isCheckingHardware ? (
          <View className="flex-row items-center space-x-2 py-2">
            <ActivityIndicator size="small" color={HQColors.cyan} />
            <Text className="text-xs text-slate-400 font-bold">Checking device hardware...</Text>
          </View>
        ) : (
          <View className="mt-2 pt-2 border-t border-slate-800/80 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-1.5">
              <ShieldCheck size={14} color={hasHardware && isEnrolled ? '#10b981' : '#f59e0b'} />
              <Text className="text-xs font-extrabold text-white">
                {hasHardware
                  ? isEnrolled
                    ? authTypes.join(', ') || 'Hardware Ready'
                    : 'Hardware Available (Not Enrolled)'
                  : 'Biometrics Unavailable (Passcode Mode)'}
              </Text>
            </View>
            <TouchableOpacity onPress={checkBiometricCapability}>
              <RefreshCw size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Feedback Notifications */}
      {authSuccessMsg && (
        <View className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex-row items-center space-x-2">
          <CheckCircle2 size={16} color="#10b981" />
          <Text className="text-xs text-emerald-300 font-medium flex-1">{authSuccessMsg}</Text>
        </View>
      )}

      {authErrorMsg && (
        <View className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex-row items-center space-x-2">
          <AlertCircle size={16} color="#f43f5e" />
          <Text className="text-xs text-rose-300 font-medium flex-1">{authErrorMsg}</Text>
        </View>
      )}

      {/* Biometric Controls */}
      <View className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
          Identity Verification Toggles
        </Text>

        {/* Biometric Authentication Switch */}
        <View className="flex-row items-center justify-between py-2 border-b border-slate-800/60">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-bold text-white">Require Biometric Unlock</Text>
            <Text className="text-[10px] text-slate-400 mt-0.5">
              Authenticate via Face ID / Touch ID before opening HQ Command Center.
            </Text>
          </View>
          <Switch
            value={isBiometricsEnabled}
            onValueChange={setIsBiometricsEnabled}
            trackColor={{ false: '#1e293b', true: HQColors.cyan }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Require on App Launch */}
        <View className="flex-row items-center justify-between py-2 border-b border-slate-800/60">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-bold text-white">Re-Authenticate on Resume</Text>
            <Text className="text-[10px] text-slate-400 mt-0.5">
              Lock app immediately when switching to background.
            </Text>
          </View>
          <Switch
            value={requireOnLaunch}
            onValueChange={setRequireOnLaunch}
            trackColor={{ false: '#1e293b', true: HQColors.cyan }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Passcode Security */}
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-bold text-white">Security Passcode Fallback</Text>
            <Text className="text-[10px] text-slate-400 mt-0.5">
              Enforce 6-digit PIN lock if biometrics fail or are unavailable.
            </Text>
          </View>
          <Switch
            value={passcodeEnabled}
            onValueChange={setPasscodeEnabled}
            trackColor={{ false: '#1e293b', true: HQColors.cyan }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Test Biometrics Trigger Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTestBiometrics}
          disabled={isTestingBiometric}
          className="w-full py-3 rounded-2xl bg-slate-950 border border-cyan-500/40 flex-row items-center justify-center space-x-2 mt-2 shadow-sm"
        >
          {isTestingBiometric ? (
            <ActivityIndicator color={HQColors.cyan} size="small" />
          ) : (
            <>
              <Fingerprint size={16} color={HQColors.cyan} />
              <Text className="text-xs font-extrabold text-cyan-300 tracking-wider">
                Test Biometric Authentication
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Auto-Lock Timeout Selection */}
      <View className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <View className="flex-row items-center space-x-2 mb-3">
          <Clock size={16} color={HQColors.cyan} />
          <Text className="text-xs font-black text-white">Auto-Lock Inactivity Timeout</Text>
        </View>

        <View className="flex-row space-x-2">
          {[
            { id: 'immediate', label: 'Immediately' },
            { id: '1m', label: '1 Minute' },
            { id: '5m', label: '5 Minutes' },
            { id: '15m', label: '15 Minutes' },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setAutoLockTimeout(t.id as any)}
              className={`flex-1 py-2.5 rounded-xl items-center border ${
                autoLockTimeout === t.id
                  ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <Text
                className={`text-[10px] font-black ${
                  autoLockTimeout === t.id ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
