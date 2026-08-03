import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { HQColors } from '../../constants/theme';
import { Bell, Mail, Smartphone, Clock, CheckCircle2, Save } from 'lucide-react-native';

export function NotificationSettingsView() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveNotifications = async () => {
    setSuccessMsg(null);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('Executive notification rules updated!');
    }, 400);
  };

  return (
    <View className="space-y-4">
      {/* Feedback Messages */}
      {successMsg && (
        <View className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex-row items-center space-x-2">
          <CheckCircle2 size={16} color="#10b981" />
          <Text className="text-xs text-emerald-300 font-medium flex-1">{successMsg}</Text>
        </View>
      )}

      {/* Notification Rules Form */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <View className="flex-row items-center space-x-2 mb-1">
          <Bell size={20} color={HQColors.cyan} />
          <Text className="text-xs font-black text-white">Notification & Alert Channels</Text>
        </View>

        {/* Email Alerts Toggle */}
        <View className="flex-row items-center justify-between py-2 border-b border-slate-800/60">
          <View className="flex-1 pr-3 flex-row items-center space-x-3">
            <Mail size={18} color="#64748b" />
            <View className="flex-1">
              <Text className="text-xs font-bold text-white">Email Mission Summaries</Text>
              <Text className="text-[10px] text-slate-400 mt-0.5">
                Receive daily digests and major strategic alerts via email.
              </Text>
            </View>
          </View>
          <Switch
            value={notifyEmail}
            onValueChange={setNotifyEmail}
            trackColor={{ false: '#1e293b', true: HQColors.cyan }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Mobile Push Notifications Toggle */}
        <View className="flex-row items-center justify-between py-2 border-b border-slate-800/60">
          <View className="flex-1 pr-3 flex-row items-center space-x-3">
            <Smartphone size={18} color={HQColors.cyan} />
            <View className="flex-1">
              <Text className="text-xs font-bold text-white">Mobile Push Notifications</Text>
              <Text className="text-[10px] text-slate-400 mt-0.5">
                Instant high-priority alerts when AI Directors require executive approval.
              </Text>
            </View>
          </View>
          <Switch
            value={notifyPush}
            onValueChange={setNotifyPush}
            trackColor={{ false: '#1e293b', true: HQColors.cyan }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Quiet Hours Window */}
        <View className="pt-2">
          <View className="flex-row items-center space-x-2 mb-2">
            <Clock size={16} color={HQColors.cyan} />
            <Text className="text-xs font-bold text-white">Executive Quiet Hours Schedule</Text>
          </View>
          <Text className="text-[10px] text-slate-400 mb-3 leading-relaxed">
            Suppress non-critical push notifications during rest hours.
          </Text>

          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Start Quiet Hours
              </Text>
              <View className="bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5">
                <Text className="text-xs font-bold text-white">{quietHoursStart} PM</Text>
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                End Quiet Hours
              </Text>
              <View className="bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5">
                <Text className="text-xs font-bold text-white">{quietHoursEnd} AM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Save Actions */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSaveNotifications}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-2 mt-3 shadow-lg shadow-cyan-500/30"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Save size={16} color="#ffffff" />
              <Text className="text-xs font-black text-white tracking-wider">
                Save Notification Rules
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
