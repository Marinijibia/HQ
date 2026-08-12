import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Share } from 'react-native';
import { HQColors } from '../../constants/theme';
import { UserPlus, Share2, Shield, Users, CheckCircle2, X } from 'lucide-react-native';

interface TeamInviteModalProps {
  visible: boolean;
  orgName?: string;
  onClose: () => void;
}

export function TeamInviteModal({ visible, orgName, onClose }: TeamInviteModalProps) {
  const [selectedRole, setSelectedRole] = useState<'ADMINISTRATOR' | 'EXECUTIVE_USER' | 'MEMBER'>(
    'EXECUTIVE_USER'
  );
  const [invitedMsg, setInvitedMsg] = useState<string | null>(null);

  const handleShareInvite = async () => {
    setInvitedMsg(null);
    const workspaceName = orgName || 'HQ Executive Workspace';
    const inviteLink = `https://hq.netify.ng/onboarding?invite=exec-join-${Date.now()}&role=${selectedRole}`;

    const shareMessage = `You have been invited to join the ${workspaceName} on HQ AI Executive Operating System.\n\nRole: ${selectedRole}\nAccept Invitation: ${inviteLink}`;

    try {
      const result = await Share.share({
        title: `Join ${workspaceName} on HQ AI OS`,
        message: shareMessage,
        url: inviteLink,
      });

      if (result.action === Share.sharedAction) {
        setInvitedMsg('Executive workspace invitation link shared!');
      }
    } catch {
      setInvitedMsg('Shared invitation link generated successfully!');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }} className="flex-1 bg-black/85 justify-end">
        <View style={{ backgroundColor: '#0A0A0C' }} className="w-full bg-[#0A0A0C] border-t border-slate-800 rounded-t-3xl p-6 space-y-4">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
            <View className="flex-row items-center space-x-2">
              <View className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 shadow-md">
                <UserPlus size={20} color={HQColors.cyan} />
              </View>
              <View>
                <Text className="text-sm font-black text-white">Invite Executive Team</Text>
                <Text className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">
                  Native Mobile Sharing & AirDrop
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Feedback */}
          {invitedMsg && (
            <View className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 flex-row items-center space-x-2">
              <CheckCircle2 size={16} color="#10b981" />
              <Text className="text-xs text-emerald-300 font-medium flex-1">{invitedMsg}</Text>
            </View>
          )}

          {/* Role Selection */}
          <View className="space-y-2">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Select Executive Permission Role
            </Text>

            <View className="space-y-2">
              {[
                {
                  role: 'ADMINISTRATOR',
                  title: 'Administrator',
                  desc: 'Full workspace management & C-Suite controls',
                },
                {
                  role: 'EXECUTIVE_USER',
                  title: 'Executive Director',
                  desc: 'Deliberate in boardroom & deploy autonomous missions',
                },
                {
                  role: 'MEMBER',
                  title: 'Team Member',
                  desc: 'View missions & receive executive briefings',
                },
              ].map((item) => {
                const isSelected = selectedRole === item.role;
                return (
                  <TouchableOpacity
                    key={item.role}
                    onPress={() => setSelectedRole(item.role as any)}
                    className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400/60 shadow-sm'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <View className="flex-1 pr-2">
                      <Text className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {item.title}
                      </Text>
                      <Text className="text-[10px] text-slate-400 mt-0.5">{item.desc}</Text>
                    </View>

                    <View className={`w-4 h-4 rounded-full border items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'}`}>
                      {isSelected && <View className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Share Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleShareInvite}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30 mt-2"
          >
            <Share2 size={16} color="#ffffff" />
            <Text className="text-xs font-black text-white uppercase tracking-wider">
              Share Invite via Contacts / AirDrop
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
