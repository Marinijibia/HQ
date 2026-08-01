import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, MessageSquare, Rocket, BrainCircuit, FolderGit2, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#090d16',
          borderTopColor: '#1e293b',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Command',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="boardroom"
        options={{
          title: 'Boardroom',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missions',
          tabBarIcon: ({ color, size }) => <Rocket size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="intelligence"
        options={{
          title: 'Intelligence',
          tabBarIcon: ({ color, size }) => <BrainCircuit size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, size }) => <FolderGit2 size={size || 20} color={color} />,
        }}
      />
    </Tabs>
  );
}
