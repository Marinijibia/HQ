import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { HQColors } from '../../constants/theme';
import { api } from '../../lib/api-client';
import {
  ArrowLeft,
  Send,
  Rocket,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  Cpu,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'EXECUTIVE';
  content: string;
  timestamp?: string;
  createdAt?: string;
  senderName?: string;
  senderTitle?: string;
}

interface DiscussionThreadViewProps {
  discussionId: string;
  onBack: () => void;
  onConvertedToMission?: (missionId: string) => void;
}

export function DiscussionThreadView({
  discussionId,
  onBack,
  onConvertedToMission,
}: DiscussionThreadViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [converting, setConverting] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [title, setTitle] = useState('Boardroom Strategic Deliberation');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchThreadData();
  }, [discussionId]);

  const fetchThreadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>(`/conversations/${discussionId}`, 3000);
      if (res.ok && res.data) {
        setTitle(res.data.title || 'Boardroom Strategic Deliberation');
        if (Array.isArray(res.data.messages)) {
          setMessages(res.data.messages);
        } else {
          loadFallbackMessages();
        }
      } else {
        loadFallbackMessages();
      }
    } catch (e) {
      loadFallbackMessages();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackMessages = () => {
    setMessages([
      {
        id: 'msg-1',
        senderId: 'user-1',
        senderType: 'USER',
        content: 'Formulate expansion strategy for West African Logistics Corridors in Q3.',
        timestamp: '10:00 AM',
      },
      {
        id: 'msg-2',
        senderId: 'exec-ceo',
        senderType: 'EXECUTIVE',
        senderName: 'Elena Rostova',
        senderTitle: 'Chief Executive Officer',
        content:
          'Strategic alignment approved. We should prioritize Lagos & Abuja hubs first, establishing primary infrastructure routes before expanding into regional corridors.',
        timestamp: '10:01 AM',
      },
      {
        id: 'msg-3',
        senderId: 'exec-cto',
        senderType: 'EXECUTIVE',
        senderName: 'Dr. Hiroshi Tanaka',
        senderTitle: 'Chief Technology Officer',
        content:
          'Engineering telemetry ready. We can deploy automated fleet tracking sub-agents to monitor real-time corridor throughput and latency.',
        timestamp: '10:02 AM',
      },
      {
        id: 'msg-4',
        senderId: 'exec-cfo',
        senderType: 'EXECUTIVE',
        senderName: 'Sophia Sterling',
        senderTitle: 'Chief Financial Officer',
        content:
          'Capital allocation model completed. Estimated initial deployment budget required: $1.2M with projected 24% gross margin optimization.',
        timestamp: '10:03 AM',
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputContent.trim()) return;
    const text = inputContent.trim();
    setInputContent('');
    setSending(true);

    // Optimistic UI push
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      senderId: 'user',
      senderType: 'USER',
      content: text,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await api.post<any>(`/conversations/${discussionId}/messages`, {
        content: text,
      });

      if (res.ok && res.data) {
        // If server returns executive response
        if (Array.isArray(res.data.messages)) {
          setMessages(res.data.messages);
        }
      } else {
        // Simulated Executive Deliberation response
        setTimeout(() => {
          const aiReply: Message = {
            id: `ai-${Date.now()}`,
            senderId: 'exec-cto',
            senderType: 'EXECUTIVE',
            senderName: 'Dr. Hiroshi Tanaka',
            senderTitle: 'Chief Technology Officer',
            content: `Acknowledged directive: "${text}". I have dispatched automated sub-task telemetry analysis across our executive swarm containers.`,
            timestamp: 'Just now',
          };
          setMessages((prev) => [...prev, aiReply]);
        }, 600);
      }
    } catch (e) {
      // Keep optimistic message
    } finally {
      setSending(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleConvertToMission = async () => {
    Alert.alert(
      'Convert to Mission Directive',
      'Do you want to convert this boardroom discussion outcome directly into an executable Mission Directive?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deploy Mission Directive',
          onPress: async () => {
            setConverting(true);
            try {
              const res = await api.post<{ id: string }>(
                `/conversations/${discussionId}/convert-mission`,
                {}
              );
              const missionId = res.ok && res.data?.id ? res.data.id : `mission-${Date.now()}`;
              if (onConvertedToMission) {
                onConvertedToMission(missionId);
              }
            } catch (e) {
              if (onConvertedToMission) {
                onConvertedToMission(`mission-${Date.now()}`);
              }
            } finally {
              setConverting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 space-y-3">
      {/* Top Header Navigation */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
        <View className="flex-row items-center space-x-2 flex-1 pr-2">
          <TouchableOpacity
            onPress={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800"
          >
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xs font-black text-white" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              Boardroom Thread Workspace
            </Text>
          </View>
        </View>

        {/* Convert to Mission Action */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleConvertToMission}
          disabled={converting}
          className="py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex-row items-center space-x-1.5 shadow-sm"
        >
          {converting ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : (
            <>
              <Rocket size={14} color="#10b981" />
              <Text className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">
                Convert to Mission
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Messages Stream */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={HQColors.cyan} size="large" />
          <Text className="text-xs text-slate-400 font-bold mt-3 tracking-wider">
            LOADING BOARDROOM THREAD...
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 px-1 space-y-3"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isUser = msg.senderType === 'USER';
            return (
              <View
                key={msg.id}
                className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} my-1.5`}
              >
                <View
                  className={`max-w-[85%] p-4 rounded-3xl border shadow-lg ${
                    isUser
                      ? 'bg-cyan-600/30 border-cyan-400/50 rounded-tr-none'
                      : 'bg-slate-900/90 border-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Sender Header */}
                  <View className="flex-row items-center space-x-1.5 mb-1.5">
                    {isUser ? (
                      <User size={12} color={HQColors.cyan} />
                    ) : (
                      <Bot size={12} color="#10b981" />
                    )}
                    <Text className="text-[10px] font-black text-white">
                      {isUser
                        ? 'Executive Director'
                        : msg.senderName || 'AI Executive Director'}
                    </Text>
                    {msg.senderTitle && (
                      <Text className="text-[9px] text-cyan-400 font-bold">
                        ({msg.senderTitle})
                      </Text>
                    )}
                  </View>

                  <Text className="text-xs font-medium text-slate-100 leading-relaxed">
                    {msg.content}
                  </Text>

                  {msg.timestamp && (
                    <Text className="text-[9px] text-slate-500 font-bold text-right mt-1.5">
                      {msg.timestamp}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Message Input Box */}
      <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-2xl p-2 space-x-2">
        <TextInput
          value={inputContent}
          onChangeText={setInputContent}
          placeholder="Send directive to boardroom..."
          placeholderTextColor="#64748b"
          className="flex-1 text-xs text-white font-medium px-2 py-1.5"
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={sending || !inputContent.trim()}
          className={`p-3 rounded-xl ${
            inputContent.trim() ? 'bg-cyan-500' : 'bg-slate-800'
          }`}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Send size={16} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
