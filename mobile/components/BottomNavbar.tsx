import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { UserContext } from '../lib/auth-service';
import { HQColors } from '../constants/theme';
import {
  LayoutDashboard,
  Cpu,
  Target,
  BrainCircuit,
  User as UserIcon,
} from 'lucide-react-native';

export type TabKey = 'home' | 'swarm' | 'missions' | 'intelligence' | 'profile';

interface BottomNavbarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  user: UserContext | null;
}

export function BottomNavbar({ activeTab, onSelectTab, user }: BottomNavbarProps) {
  // Helper to extract user initials for avatar fallback
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email && email.trim().length > 0) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'HQ';
  };

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
    { key: 'home', label: 'Command', icon: LayoutDashboard },
    { key: 'swarm', label: 'Swarm', icon: Cpu },
    { key: 'missions', label: 'Missions', icon: Target },
    { key: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
    { key: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <View className="w-full bg-[#0A0A0C]/95 border-t border-slate-800/80 px-2 py-2 flex-row justify-around items-center shadow-2xl shadow-cyan-950/40">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onSelectTab(tab.key)}
            className={`items-center justify-center py-1.5 px-3 rounded-2xl flex-1 mx-0.5 ${
              isActive ? 'bg-cyan-500/15 border border-cyan-400/40 shadow-sm' : ''
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <View className="absolute top-0 w-8 h-[2px] bg-cyan-400 rounded-full shadow-sm shadow-cyan-400/80" />
            )}

            {/* 5th Tab Special Avatar Display */}
            {tab.key === 'profile' ? (
              <View className="items-center justify-center my-0.5">
                {user?.photoUrl ? (
                  <View className={`rounded-full p-0.5 ${isActive ? 'border-2 border-cyan-400' : 'border border-slate-700'}`}>
                    <Image
                      source={{ uri: user.photoUrl }}
                      className="w-5 h-5 rounded-full"
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center shadow-md ${
                      isActive
                        ? 'bg-gradient-to-tr from-cyan-500 to-purple-600 border border-cyan-300'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                    style={{ backgroundColor: isActive ? HQColors.cyan : '#1e293b' }}
                  >
                    <Text className={`text-[10px] font-black ${isActive ? 'text-slate-950' : 'text-slate-300'}`}>
                      {getInitials(user?.displayName, user?.email)}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <IconComponent
                size={20}
                color={isActive ? HQColors.cyan : '#64748b'}
              />
            )}

            {/* Tab Label */}
            <Text
              className={`text-[10px] mt-1 tracking-wider ${
                isActive ? 'font-black text-cyan-300' : 'font-semibold text-slate-400'
              }`}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
