import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { HQColors } from '../../constants/theme';
import { api } from '../../lib/api-client';
import {
  MessageSquare,
  Search,
  Plus,
  Pin,
  Archive,
  Clock,
  ChevronRight,
  X,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  isPinned: boolean;
  isArchived: boolean;
  missionId?: string | null;
}

interface DiscussionsHubProps {
  onSelectDiscussion: (id: string) => void;
}

export function DiscussionsHub({ onSelectDiscussion }: DiscussionsHubProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'pinned' | 'archived'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Discussion Modal State
  const [showModal, setShowModal] = useState(false);
  const [objective, setObjective] = useState('');
  const [selectedExecs, setSelectedExecs] = useState<string[]>([
    'ceo',
    'operations_director',
    'legal_compliance_director',
    'human_resources_director',
    'public_search_agent',
  ]);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableExecutives = [
    { key: 'ceo', name: 'Asad', title: 'Chief Executive Officer (CEO)' },
    { key: 'operations_director', name: 'Teema', title: 'Operations Director' },
    { key: 'legal_compliance_director', name: 'Legal', title: 'Legal & Compliance Director' },
    { key: 'human_resources_director', name: 'Resource Director', title: 'Human Resources Director' },
    { key: 'public_search_agent', name: 'Mr. Intelligence', title: 'Public Search & Research Agent' },
  ];

  useEffect(() => {
    fetchConversations();
  }, [activeTab, searchQuery]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      let endpoint = `/conversations?isArchived=${activeTab === 'archived'}`;
      if (activeTab === 'pinned') endpoint += '&isPinned=true';
      if (searchQuery.trim()) endpoint += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await api.get<ConversationItem[]>(endpoint, 3000);
      if (res.ok && Array.isArray(res.data)) {
        setConversations(res.data);
      } else {
        // Fallback sample boardroom discussions
        setConversations([
          {
            id: 'conv-1',
            title: 'Q3 Global Expansion & West African Logistics Corridor Strategy',
            createdAt: new Date().toISOString(),
            isPinned: true,
            isArchived: false,
          },
          {
            id: 'conv-2',
            title: 'Autonomous Executive AI Swarm Governance & Risk Audit',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            isPinned: false,
            isArchived: false,
          },
          {
            id: 'conv-3',
            title: 'Enterprise Subscription Billing & Revenue Optimization',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            isPinned: false,
            isArchived: false,
          },
        ]);
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExec = (key: string) => {
    setSelectedExecs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleStartDiscussion = async () => {
    if (!objective.trim()) {
      setErrorMsg('Please enter a clear boardroom discussion topic or objective.');
      return;
    }
    setErrorMsg(null);
    setStarting(true);

    try {
      const res = await api.post<{ id: string }>('/conversations', {
        objective: objective.trim(),
        specialistKeys: selectedExecs,
      });

      if (res.ok && res.data?.id) {
        setShowModal(false);
        setObjective('');
        onSelectDiscussion(res.data.id);
      } else {
        // Fallback local discussion ID creation
        const newId = `conv-new-${Date.now()}`;
        setShowModal(false);
        setObjective('');
        onSelectDiscussion(newId);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to start boardroom discussion');
    } finally {
      setStarting(false);
    }
  };

  return (
    <View className="flex-1 space-y-4">
      {/* Top Header Action Bar */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          <View className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
            <MessageSquare size={18} color={HQColors.cyan} />
          </View>
          <View>
            <Text className="text-base font-black text-white tracking-tight">
              Boardroom Discussions
            </Text>
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Executive AI Deliberation Stream
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowModal(true)}
          className="py-2 px-3 rounded-xl bg-cyan-500 border border-cyan-400/50 flex-row items-center space-x-1 shadow-md shadow-cyan-500/30"
        >
          <Plus size={14} color="#ffffff" />
          <Text className="text-xs font-black text-white">New Discussion</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs & Search Input */}
      <View className="space-y-2.5">
        <View className="flex-row bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'recent', label: 'Recent' },
            { id: 'pinned', label: 'Pinned' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-xl items-center ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-sm'
                  : ''
              }`}
            >
              <Text
                className={`text-xs font-extrabold ${
                  activeTab === tab.id ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5">
          <Search size={16} color="#64748b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search boardroom discussions..."
            placeholderTextColor="#64748b"
            className="flex-1 text-xs text-white font-medium ml-2.5"
          />
        </View>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator color={HQColors.cyan} size="large" />
          <Text className="text-xs text-slate-400 font-bold mt-3 tracking-wider">
            LOADING BOARDROOM DISCUSSIONS...
          </Text>
        </View>
      ) : conversations.length === 0 ? (
        <View className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 items-center justify-center text-center">
          <MessageSquare size={36} color="#64748b" className="mb-2" />
          <Text className="text-sm font-black text-white">No Discussions Found</Text>
          <Text className="text-xs text-slate-400 text-center mt-1">
            Start a new discussion to deliberate strategies with your AI Executive Directors.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
          {conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              activeOpacity={0.8}
              onPress={() => onSelectDiscussion(conv.id)}
              className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <View className="flex-row items-center space-x-2 mb-1">
                  {conv.isPinned && (
                    <View className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 flex-row items-center space-x-1">
                      <Pin size={10} color={HQColors.cyan} />
                      <Text className="text-[9px] font-black text-cyan-300">PINNED</Text>
                    </View>
                  )}
                  <Text className="text-[10px] text-slate-500 font-bold">
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text className="text-xs font-bold text-white leading-snug" numberOfLines={2}>
                  {conv.title}
                </Text>

                {/* Assigned Executive Avatars Badge */}
                <View className="flex-row items-center space-x-1.5 mt-2.5">
                  <Bot size={12} color={HQColors.cyan} />
                  <Text className="text-[10px] text-slate-400 font-medium">
                    AI Directors: CEO Elena, CTO Hiroshi, CFO Sophia
                  </Text>
                </View>
              </View>

              <ChevronRight size={18} color="#64748b" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* New Discussion Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/85 justify-end">
          <View className="w-full bg-[#0A0A0C] border-t border-slate-800 rounded-t-3xl p-6 space-y-4">
            <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
              <View className="flex-row items-center space-x-2">
                <Sparkles size={18} color={HQColors.cyan} />
                <Text className="text-base font-black text-white">Initiate Boardroom Discussion</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {errorMsg && (
              <View className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex-row items-center space-x-2">
                <AlertCircle size={16} color="#f43f5e" />
                <Text className="text-xs text-rose-300 font-medium flex-1">{errorMsg}</Text>
              </View>
            )}

            {/* Objective Input */}
            <View>
              <Text className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Strategic Topic / Objective
              </Text>
              <View className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                <TextInput
                  value={objective}
                  onChangeText={setObjective}
                  placeholder="e.g. Formulate expansion strategy for West African Logistics Corridors..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={3}
                  className="text-xs text-white font-medium text-top"
                />
              </View>
            </View>

            {/* Executive Selection */}
            <View>
              <Text className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Select AI Executive Directors
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {availableExecutives.map((exec) => {
                  const isSelected = selectedExecs.includes(exec.key);
                  return (
                    <TouchableOpacity
                      key={exec.key}
                      onPress={() => handleToggleExec(exec.key)}
                      className={`py-2 px-3 rounded-xl border flex-row items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-cyan-300' : 'text-slate-400'
                        }`}
                      >
                        {exec.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Action */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleStartDiscussion}
              disabled={starting}
              className="w-full py-4 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30"
            >
              {starting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-xs font-black text-white tracking-wider">
                    Start Boardroom Deliberation
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
