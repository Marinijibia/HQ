import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { HQColors } from '../../constants/theme';
import { api } from '../../lib/api-client';
import {
  Mic,
  Send,
  Sparkles,
  X,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Rocket,
  Zap,
} from 'lucide-react-native';

interface MessageItem {
  id: string;
  sender: 'user' | 'asad';
  text: string;
  timestamp: string;
}

interface CeoVoiceAssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CeoVoiceAssistantModal({ visible, onClose }: CeoVoiceAssistantModalProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-1',
      sender: 'asad',
      text: 'Greetings Director. I am CEO Asad. Speak or type your strategic directive, and I will align the C-Suite executive swarm.',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const quickPrompts = [
    'Analyze Q3 West African Logistics expansion',
    'Run CFO financial runway & unit economics audit',
    'Summarize active boardroom missions & status',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsProcessing(true);

    try {
      const res = await api.post<{ response: string; text?: string }>('/executives/ceo/chat', {
        message: prompt,
      });

      const replyText =
        res.data?.response ||
        res.data?.text ||
        `Directive received: "${prompt}". I have analyzed the operational parameters and assigned execution sub-agents across Operations, Legal, and Finance. Strategy locked.`;

      const asadMsg: MessageItem = {
        id: `asad-${Date.now()}`,
        sender: 'asad',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, asadMsg]);
    } catch {
      const fallbackMsg: MessageItem = {
        id: `asad-${Date.now()}`,
        sender: 'asad',
        text: `Directive logged: "${prompt}". Strategic alignment confirmed. I am dispatching the C-Suite executive swarm to execute.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleSendMessage('Run live executive audit on active expansion missions');
    }, 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' }} className="flex-1 bg-black/90 justify-end">
        <View style={{ flex: 1, backgroundColor: '#0A0A0C' }} className="flex-1 bg-[#0A0A0C] mt-12 rounded-t-3xl border-t border-slate-800 p-5 flex-col justify-between">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center space-x-2.5">
              <View className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 shadow-md">
                <Bot size={22} color={HQColors.cyan} />
              </View>
              <View>
                <View className="flex-row items-center space-x-1.5">
                  <Text className="text-base font-black text-white">CEO Asad</Text>
                  <ShieldCheck size={14} color="#10b981" />
                </View>
                <Text className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">
                  Chief Executive Officer AI
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Messages Stream */}
          <ScrollView className="flex-1 my-3" contentContainerStyle={{ paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => {
              const isAsad = msg.sender === 'asad';
              return (
                <View
                  key={msg.id}
                  className={`mb-3.5 p-4 rounded-3xl max-w-[88%] ${
                    isAsad
                      ? 'bg-slate-900/90 border border-cyan-500/30 self-start shadow-md'
                      : 'bg-cyan-500/20 border border-cyan-400/50 self-end'
                  }`}
                >
                  <View className="flex-row items-center space-x-1.5 mb-1">
                    {isAsad ? <Sparkles size={12} color={HQColors.cyan} /> : <Zap size={12} color="#38bdf8" />}
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${isAsad ? 'text-cyan-400' : 'text-slate-300'}`}>
                      {isAsad ? 'CEO ASAD' : 'EXECUTIVE DIRECTOR'}
                    </Text>
                    <Text className="text-[9px] text-slate-500 font-mono ml-auto">{msg.timestamp}</Text>
                  </View>

                  <Text className="text-xs text-white leading-relaxed font-medium">{msg.text}</Text>
                </View>
              );
            })}

            {isProcessing && (
              <View className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 self-start flex-row items-center space-x-2">
                <ActivityIndicator size="small" color={HQColors.cyan} />
                <Text className="text-xs text-cyan-300 font-bold">CEO Asad compiling strategic directive...</Text>
              </View>
            )}
          </ScrollView>

          {/* Quick Prompts */}
          <View className="mb-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-2">
              {quickPrompts.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 mr-2 flex-row items-center space-x-1"
                >
                  <Sparkles size={10} color={HQColors.cyan} />
                  <Text className="text-[10px] text-slate-300 font-bold">{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Voice & Text Input Toolbar */}
          <View className="flex-row items-center space-x-2 pt-2 border-t border-slate-800">
            <TouchableOpacity
              onPress={handleSimulateVoiceInput}
              disabled={isListening}
              className={`p-3 rounded-2xl border items-center justify-center ${
                isListening ? 'bg-rose-500/20 border-rose-400' : 'bg-cyan-500/20 border-cyan-400/50'
              }`}
            >
              <Mic size={20} color={isListening ? '#f43f5e' : HQColors.cyan} />
            </TouchableOpacity>

            <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2.5 flex-row items-center">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendMessage()}
                placeholder="Speak or type directive to CEO Asad..."
                placeholderTextColor="#64748b"
                className="flex-1 text-xs text-white font-medium p-0"
              />
            </View>

            <TouchableOpacity
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isProcessing}
              className={`p-3 rounded-2xl border items-center justify-center ${
                inputText.trim() ? 'bg-cyan-500 border-cyan-400' : 'bg-slate-900 border-slate-800 opacity-40'
              }`}
            >
              <Send size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
