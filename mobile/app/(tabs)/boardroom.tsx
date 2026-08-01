import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Send, Mic, Sparkles, Cpu, Rocket } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Message {
  id: string;
  sender: string;
  role: string;
  isUser: boolean;
  content: string;
  timestamp: string;
}

export default function BoardroomTab() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activeRole, setActiveRole] = useState<'All' | 'CEO' | 'CTO' | 'CFO' | 'CMO' | 'Legal'>('All');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'CEO Director',
      role: 'Chief Executive Officer',
      isUser: false,
      content: 'Welcome to the Executive Boardroom. State your operational objective or query to dispatch the C-Suite swarm.',
      timestamp: '10:00 AM',
    },
  ]);

  useEffect(() => {
    if (params.initialMessage && typeof params.initialMessage === 'string') {
      handleSendMessage(params.initialMessage);
    }
  }, [params.initialMessage]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'Executive Owner',
      role: 'Board Chair',
      isUser: true,
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsSending(true);

    // Simulate AI C-Suite Deliberation response
    setTimeout(() => {
      const execMsg: Message = {
        id: `e-${Date.now()}`,
        sender: activeRole === 'All' ? 'CEO Director' : `${activeRole} Director`,
        role: activeRole === 'All' ? 'Chief Executive Officer' : 'Swarm Lead',
        isUser: false,
        content: `Deliberation complete on "${query}". The Finance & Technology Directors have aligned on an automated execution strategy.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, execMsg]);
      setIsSending(false);
    }, 1200);
  };

  const handleConvertToMission = () => {
    router.push({
      pathname: '/(tabs)/missions',
      params: { newMissionTitle: messages[messages.length - 1]?.content.slice(0, 40) || 'New Strategy' },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0b0f19]">
      <Header title="Boardroom" subtitle="C-Suite Swarm Deliberation" />

      {/* Role Filter Selector */}
      <View className="px-4 py-2 border-b border-gray-800 bg-gray-950/60">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
          {(['All', 'CEO', 'CTO', 'CFO', 'CMO', 'Legal'] as const).map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => setActiveRole(role)}
              className={`px-3 py-1.5 rounded-full border ${
                activeRole === role
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
            >
              <Text className={`text-xs font-bold ${activeRole === role ? 'text-cyan-400' : 'text-gray-400'}`}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {/* Chat Messages List */}
        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map((m) => (
            <View
              key={m.id}
              className={`mb-4 max-w-[85%] p-3.5 rounded-2xl ${
                m.isUser
                  ? 'bg-cyan-600 self-end rounded-tr-sm'
                  : 'bg-gray-900/90 border border-gray-800 self-start rounded-tl-sm'
              }`}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className={`text-[10px] font-bold ${m.isUser ? 'text-cyan-200' : 'text-cyan-400'}`}>
                  {m.sender} · {m.role}
                </Text>
                <Text className={`text-[9px] ${m.isUser ? 'text-cyan-200' : 'text-gray-400'}`}>{m.timestamp}</Text>
              </View>

              <Text className={`text-sm leading-relaxed ${m.isUser ? 'text-white font-medium' : 'text-gray-200'}`}>
                {m.content}
              </Text>
            </View>
          ))}

          {isSending && (
            <View className="p-3 bg-gray-900/90 border border-gray-800 rounded-2xl self-start mb-4 flex-row items-center space-x-2">
              <Sparkles size={16} color="#06b6d4" />
              <Text className="text-xs font-semibold text-cyan-300">C-Suite Deliberating...</Text>
            </View>
          )}
        </ScrollView>

        {/* Action Bar & Message Input */}
        <View className="p-4 border-t border-gray-800/90 bg-gray-950/90">
          <TouchableOpacity
            onPress={handleConvertToMission}
            className="mb-3 py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex-row items-center justify-center space-x-2"
          >
            <Rocket size={14} color="#06b6d4" />
            <Text className="text-xs font-bold text-cyan-300">Convert Deliberation to Active Mission</Text>
          </TouchableOpacity>

          <View className="flex-row items-center space-x-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Direct executive swarm..."
              placeholderTextColor="#64748b"
              className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-2xl px-4 py-3 text-sm font-medium"
            />

            <TouchableOpacity
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className={`p-3.5 rounded-2xl ${inputText.trim() ? 'bg-cyan-500' : 'bg-gray-800'}`}
            >
              <Send size={18} color={inputText.trim() ? '#ffffff' : '#64748b'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
