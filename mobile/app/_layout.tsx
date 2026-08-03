import '../global.css';
import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0C' }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0C' } }}>
        <Stack.Screen name="index" options={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0C' } }} />
      </Stack>
      <StatusBar style="light" backgroundColor="#0A0A0C" translucent={false} />
    </View>
  );
}
