import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HQLogo } from '../components/HQLogo';
import { AuthScreen } from '../components/AuthScreen';
import { BottomNavbar, TabKey } from '../components/BottomNavbar';
import { AsadVoiceButton } from '../components/voice/AsadVoiceButton';
import { HQColors } from '../constants/theme';
import { authService, UserContext } from '../lib/auth-service';

// Settings Sub-Views
import { BiometricSecurityView } from '../components/settings/BiometricSecurityView';
import { TrustCenterView } from '../components/settings/TrustCenterView';
import { OrgSettingsView } from '../components/settings/OrgSettingsView';
import { AiPreferencesView } from '../components/settings/AiPreferencesView';
import { NotificationSettingsView } from '../components/settings/NotificationSettingsView';

// Discussions & Missions Components
import { DiscussionsHub } from '../components/discussions/DiscussionsHub';
import { DiscussionThreadView } from '../components/discussions/DiscussionThreadView';
import { MissionsHub } from '../components/missions/MissionsHub';
import { MissionDetailView } from '../components/missions/MissionDetailView';

// Intelligence, Analytics, Marketplace, Assets, Integrations & Billing Components
import { IntelligenceHub } from '../components/intelligence/IntelligenceHub';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { MarketplaceView } from '../components/marketplace/MarketplaceView';
import { AssetsHub } from '../components/assets/AssetsHub';
import { IntegrationsHub } from '../components/integrations/IntegrationsHub';
import { BillingHub } from '../components/billing/BillingHub';

import {
  ShieldCheck,
  LogOut,
  Sparkles,
  Building2,
  User as UserIcon,
  Globe,
  Cpu,
  Target,
  BrainCircuit,
  Settings,
  ChevronRight,
  Fingerprint,
  Shield,
  Bot,
  Bell,
  MessageSquare,
  Rocket,
  Brain,
  BarChart3,
  FolderOpen,
  Plug2,
  CreditCard,
  ShoppingBag,
} from 'lucide-react-native';

export type SettingsTab = 'security' | 'trust' | 'org' | 'ai' | 'notifications';
export type IntelligenceSubTab = 'twin' | 'analytics' | 'marketplace' | 'assets' | 'integrations' | 'billing';

export default function Homepage() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('security');
  const [activeIntelTab, setActiveIntelTab] = useState<IntelligenceSubTab>('twin');

  // Selected detail states
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  useEffect(() => {
    // Check initial authentication session
    const checkSession = async () => {
      try {
        const res = await authService.fetchMe();
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch (e) {
        // Session check failed
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSession();
  }, []);

  const handleAuthSuccess = (authedUser: UserContext) => {
    setUser(authedUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  const handleOpenWebOnboarding = async () => {
    await authService.openWebOnboarding();
  };

  const handleConvertedDiscussionToMission = (missionId: string) => {
    setSelectedDiscussionId(null);
    setSelectedMissionId(missionId);
    setActiveTab('missions');
  };

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0C' }} className="flex-1 bg-[#0A0A0C] justify-center items-center">
        <ActivityIndicator size="large" color={HQColors.cyan} />
        <Text className="text-xs text-slate-400 font-bold mt-3 tracking-wider">
          AUTHENTICATING SESSION...
        </Text>
      </View>
    );
  }

  // If unauthenticated, present the Auth Screen
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Authenticated State: Main Executive Application Screen
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0C' }} className="flex-1 bg-[#0A0A0C]">
      {/* Dynamic Content View Area */}
      <View className="flex-1 px-4 pt-2">
        {activeTab === 'home' && (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
            className="pt-2"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Executive Header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <View className="flex-row items-center space-x-3">
                <HQLogo size={40} />
                <View>
                  <Text className="text-lg font-black text-white tracking-tight">HEADQUARTERS</Text>
                  <Text className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">
                    {user.organizationName || 'Primary Monorepo Cluster'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center space-x-2">
                <AsadVoiceButton />

                <TouchableOpacity
                  onPress={handleOpenWebOnboarding}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <Globe size={16} color={HQColors.cyan} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogout}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <LogOut size={16} color="#f43f5e" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Executive Boardroom Hero Card */}
            <View className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 mb-5 shadow-xl items-center">
              <View className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 mb-3 shadow-md">
                <Sparkles size={28} color={HQColors.cyan} />
              </View>

              <Text className="text-2xl font-black text-white tracking-tight text-center">
                Welcome to HQ
              </Text>
              <Text className="text-xs font-semibold text-slate-400 mt-1 tracking-wider text-center">
                Autonomous C-Suite Swarm Platform
              </Text>

              {/* User Context Card */}
              <View className="w-full mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <View className="flex-row items-center space-x-2.5 mb-2">
                  <UserIcon size={16} color={HQColors.cyan} />
                  <Text className="text-xs font-bold text-white flex-1" numberOfLines={1}>
                    {user.email}
                  </Text>
                  <View className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40">
                    <Text className="text-[10px] font-black text-emerald-400">
                      {user.role || 'DIRECTOR'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center space-x-2.5">
                  <Building2 size={16} color="#64748b" />
                  <Text className="text-xs font-medium text-slate-400">
                    {user.organizationName || 'Primary Monorepo Cluster'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Access Grid */}
            <View className="flex-row space-x-3 mb-3">
              <TouchableOpacity
                onPress={() => setActiveTab('swarm')}
                className="flex-1 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg"
              >
                <View className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30 w-fit">
                  <MessageSquare size={18} color={HQColors.cyan} />
                </View>
                <Text className="text-xs font-black text-white">Boardroom</Text>
                <Text className="text-[10px] text-slate-400">AI Deliberations</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('missions')}
                className="flex-1 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg"
              >
                <View className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 w-fit">
                  <Rocket size={18} color="#10b981" />
                </View>
                <Text className="text-xs font-black text-white">Missions</Text>
                <Text className="text-[10px] text-slate-400">Task Directives</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setActiveIntelTab('twin');
                  setActiveTab('intelligence');
                }}
                className="flex-1 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-lg"
              >
                <View className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 w-fit">
                  <Brain size={18} color="#a855f7" />
                </View>
                <Text className="text-xs font-black text-white">Intelligence</Text>
                <Text className="text-[10px] text-slate-400">8 Twin Layers</Text>
              </TouchableOpacity>
            </View>

            {/* Web Onboarding Handshake Card */}
            <TouchableOpacity
              onPress={handleOpenWebOnboarding}
              activeOpacity={0.8}
              className="p-4 rounded-3xl bg-slate-900/60 border border-cyan-500/30 flex-row items-center justify-between shadow-lg"
            >
              <View className="flex-row items-center space-x-3 flex-1 pr-2">
                <Globe size={20} color={HQColors.cyan} />
                <View className="flex-1">
                  <Text className="text-xs font-black text-white">Manage HQ Web Settings</Text>
                  <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Launch web onboarding & executive swarm setup
                  </Text>
                </View>
              </View>
              <View className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
                <Text className="text-[10px] font-black text-cyan-300">Open Web</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Tab 2: Swarm / Boardroom Discussions */}
        {activeTab === 'swarm' && (
          <View className="flex-1">
            {selectedDiscussionId ? (
              <DiscussionThreadView
                discussionId={selectedDiscussionId}
                onBack={() => setSelectedDiscussionId(null)}
                onConvertedToMission={handleConvertedDiscussionToMission}
              />
            ) : (
              <DiscussionsHub onSelectDiscussion={setSelectedDiscussionId} />
            )}
          </View>
        )}

        {/* Tab 3: Mission Command Center */}
        {activeTab === 'missions' && (
          <View className="flex-1">
            {selectedMissionId ? (
              <MissionDetailView
                missionId={selectedMissionId}
                onBack={() => setSelectedMissionId(null)}
              />
            ) : (
              <MissionsHub onSelectMission={setSelectedMissionId} />
            )}
          </View>
        )}

        {/* Tab 4: Intelligence, Analytics, Marketplace, Assets, Integrations & Billing */}
        {activeTab === 'intelligence' && (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Intelligence Sub-Tab Switcher */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 pb-1"
            >
              {[
                { id: 'twin', label: '8 Twin Layers', icon: Brain },
                { id: 'analytics', label: 'Analytics & Telemetry', icon: BarChart3 },
                { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
                { id: 'assets', label: 'Asset Vault', icon: FolderOpen },
                { id: 'integrations', label: 'Integrations', icon: Plug2 },
                { id: 'billing', label: 'Billing & Credits', icon: CreditCard },
              ].map((sub) => {
                const isSelected = activeIntelTab === sub.id;
                const SubIcon = sub.icon;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    onPress={() => setActiveIntelTab(sub.id as IntelligenceSubTab)}
                    className={`flex-row items-center space-x-1.5 py-2 px-3.5 rounded-2xl border mr-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <SubIcon size={14} color={isSelected ? HQColors.cyan : '#64748b'} />
                    <Text
                      className={`text-xs font-extrabold ${
                        isSelected ? 'text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      {sub.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Dynamic Intelligence View Renderer */}
            <View className="flex-1">
              {activeIntelTab === 'twin' && <IntelligenceHub />}
              {activeIntelTab === 'analytics' && <AnalyticsView />}
              {activeIntelTab === 'marketplace' && <MarketplaceView />}
              {activeIntelTab === 'assets' && <AssetsHub />}
              {activeIntelTab === 'integrations' && <IntegrationsHub />}
              {activeIntelTab === 'billing' && <BillingHub />}
            </View>
          </ScrollView>
        )}

        {/* Tab 5: Profile & Executive Settings */}
        {activeTab === 'profile' && (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Executive Profile Header */}
            <View className="items-center mb-5">
              <View className="p-1 rounded-full bg-cyan-500/20 border-2 border-cyan-400 mb-2 shadow-lg shadow-cyan-500/30">
                {user.photoUrl ? (
                  <Image
                    source={{ uri: user.photoUrl }}
                    className="w-16 h-16 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 items-center justify-center">
                    <Text className="text-xl font-black text-white">
                      {(user.displayName || user.email).slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-lg font-black text-white tracking-tight">
                {user.displayName || 'Executive Director'}
              </Text>
              <Text className="text-xs text-cyan-400 font-bold mt-0.5 tracking-wider">
                {user.email}
              </Text>
              <View className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 mt-1.5">
                <Text className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  {user.role || 'DIRECTOR'} &bull; {user.organizationName || 'HQ ORG'}
                </Text>
              </View>
            </View>

            {/* Horizontal Settings Sub-Tab Switcher */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 pb-1"
            >
              {[
                { id: 'security', label: 'Security & Face ID', icon: Fingerprint },
                { id: 'trust', label: 'Trust Center', icon: Shield },
                { id: 'org', label: 'Organization', icon: Building2 },
                { id: 'ai', label: 'AI Swarm', icon: Bot },
                { id: 'notifications', label: 'Notifications', icon: Bell },
              ].map((s) => {
                const isSelected = activeSettingsTab === s.id;
                const IconComponent = s.icon;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setActiveSettingsTab(s.id as SettingsTab)}
                    className={`flex-row items-center space-x-1.5 py-2 px-3.5 rounded-2xl border mr-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <IconComponent
                      size={14}
                      color={isSelected ? HQColors.cyan : '#64748b'}
                    />
                    <Text
                      className={`text-xs font-extrabold ${
                        isSelected ? 'text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Dynamic Settings Sub-View Renderer */}
            <View className="mb-4">
              {activeSettingsTab === 'security' && <BiometricSecurityView />}
              {activeSettingsTab === 'trust' && <TrustCenterView />}
              {activeSettingsTab === 'org' && <OrgSettingsView />}
              {activeSettingsTab === 'ai' && <AiPreferencesView />}
              {activeSettingsTab === 'notifications' && <NotificationSettingsView />}
            </View>

            {/* Footer Sign Out Action */}
            <View className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 mb-2 shadow-xl">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center justify-between py-2"
              >
                <View className="flex-row items-center space-x-3">
                  <LogOut size={18} color="#f43f5e" />
                  <Text className="text-xs font-black text-rose-400">Sign Out of Headquarters</Text>
                </View>
                <ChevronRight size={16} color="#f43f5e" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Premium Executive Bottom Navbar */}
      <BottomNavbar activeTab={activeTab} onSelectTab={setActiveTab} user={user} />
    </SafeAreaView>
  );
}
