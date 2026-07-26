import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Mic, MicOff, Sparkles, Volume2 } from "lucide-react-native";

export function VoiceDock() {
  const [isListening, setIsListening] = useState(false);

  return (
    <View className="absolute bottom-6 left-4 right-4 bg-gray-900/95 border border-cyan-500/30 rounded-3xl p-4 shadow-2xl backdrop-blur-xl">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          <View className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40">
            <Sparkles size={20} color="#06b6d4" />
          </View>
          <View>
            <Text className="text-sm font-bold text-white">AI Voice Assistant</Text>
            <Text className="text-xs text-gray-400">
              {isListening ? "Listening for command..." : "Tap mic to speak"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsListening(!isListening)}
          className={`p-3.5 rounded-full ${
            isListening ? "bg-cyan-500 shadow-cyan-500/50" : "bg-gray-800 border border-gray-700"
          }`}
        >
          {isListening ? <Mic size={22} color="#0b0f19" /> : <MicOff size={22} color="#9ca3af" />}
        </TouchableOpacity>
      </View>

      {isListening && (
        <View className="mt-3 flex-row items-center justify-center space-x-1.5 pt-2 border-t border-gray-800">
          <Volume2 size={16} color="#06b6d4" />
          <Text className="text-xs text-cyan-400 font-medium">Ready: Say "Summarize boardroom status"</Text>
        </View>
      )}
    </View>
  );
}
