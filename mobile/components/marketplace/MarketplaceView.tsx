import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { HQColors } from '../../constants/theme';
import {
  Rocket,
  Search,
  Plus,
  Star,
  CheckCircle2,
  Bot,
  Layers,
  Sparkles,
  Download,
  ShieldCheck,
} from 'lucide-react-native';

interface MarketplaceItem {
  id: string;
  name: string;
  publisher: string;
  category: 'AI Executives' | 'Workflow Templates' | 'Knowledge Packs';
  logo: string;
  price: string;
  rating: number;
  installCount: string;
  description: string;
  isInstalled: boolean;
}

export function MarketplaceView() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [catalog, setCatalog] = useState<MarketplaceItem[]>([
    {
      id: 'agent-legal',
      name: 'Legal Compliance Director',
      publisher: 'HQ Executive Systems',
      category: 'AI Executives',
      logo: '⚖️',
      price: 'Free',
      rating: 4.9,
      installCount: '1.2k',
      description: 'Automates contract risk audits, legal hold monitoring, and regulatory filings.',
      isInstalled: true,
    },
    {
      id: 'agent-growth',
      name: 'Head of Growth & Performance Marketing',
      publisher: 'GrowthSwarm Inc.',
      category: 'AI Executives',
      logo: '🚀',
      price: '$49/mo',
      rating: 4.8,
      installCount: '850',
      description: 'Executes automated ad campaign budget reallocation and CAC optimization.',
      isInstalled: false,
    },
    {
      id: 'template-logistics',
      name: 'Corridor Logistics Telemetry Pack',
      publisher: 'HQ Global Ops',
      category: 'Workflow Templates',
      logo: '📦',
      price: 'Free',
      rating: 5.0,
      installCount: '2.4k',
      description: 'Pre-configured WBS DAG tasks for West African & EU logistics corridor tracking.',
      isInstalled: true,
    },
    {
      id: 'pack-sec',
      name: 'SOC2 Type II Audit Knowledge Pack',
      publisher: 'TrustSec Labs',
      category: 'Knowledge Packs',
      logo: '🛡️',
      price: 'Free',
      rating: 4.9,
      installCount: '3.1k',
      description: 'Indexes 500+ security compliance requirements directly into AI twin memory.',
      isInstalled: false,
    },
  ]);

  const handleToggleInstall = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isInstalled: !item.isInstalled } : item))
    );
  };

  const filteredCatalog = catalog.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View className="space-y-4">
      {/* Top Action Header */}
      <View className="flex-row items-center space-x-2">
        <View className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
          <Rocket size={18} color={HQColors.cyan} />
        </View>
        <View>
          <Text className="text-base font-black text-white tracking-tight">
            AI Executive Specialist Marketplace
          </Text>
          <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Agent Personas & Workflow Templates
          </Text>
        </View>
      </View>

      {/* Filter Tabs & Search Bar */}
      <View className="space-y-2.5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
          {[
            { id: 'ALL', label: 'All Catalog' },
            { id: 'AI Executives', label: 'AI Executives' },
            { id: 'Workflow Templates', label: 'Workflows' },
            { id: 'Knowledge Packs', label: 'Knowledge Packs' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveCategory(tab.id)}
              className={`py-2 px-3.5 rounded-2xl border mr-2 ${
                activeCategory === tab.id
                  ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <Text
                className={`text-xs font-extrabold ${
                  activeCategory === tab.id ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5">
          <Search size={16} color="#64748b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search AI specialists & templates..."
            placeholderTextColor="#64748b"
            className="flex-1 text-xs text-white font-medium ml-2.5"
          />
        </View>
      </View>

      {/* Marketplace Catalog Roster */}
      <View className="space-y-3">
        {filteredCatalog.map((item) => (
          <View
            key={item.id}
            className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3 flex-1 pr-2">
                <View className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 items-center justify-center">
                  <Text className="text-xl">{item.logo}</Text>
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-bold text-white">{item.name}</Text>
                  <Text className="text-[10px] text-cyan-400 font-bold mt-0.5">
                    {item.publisher} &bull; {item.price}
                  </Text>
                </View>
              </View>

              {/* Install Toggle Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleToggleInstall(item.id)}
                className={`py-1.5 px-3 rounded-xl border flex-row items-center space-x-1 ${
                  item.isInstalled
                    ? 'bg-emerald-500/20 border-emerald-400/40'
                    : 'bg-cyan-500 border-cyan-400/50 shadow-sm'
                }`}
              >
                {item.isInstalled ? (
                  <>
                    <CheckCircle2 size={12} color="#10b981" />
                    <Text className="text-[10px] font-black text-emerald-300">Installed</Text>
                  </>
                ) : (
                  <>
                    <Download size={12} color="#ffffff" />
                    <Text className="text-[10px] font-black text-white">Install</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-medium text-slate-300 leading-relaxed">
              {item.description}
            </Text>

            {/* Rating & Stats Footer */}
            <View className="pt-2 border-t border-slate-800/80 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-1">
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text className="text-[10px] font-black text-amber-400">{item.rating}</Text>
                <Text className="text-[10px] text-slate-500">({item.installCount} installs)</Text>
              </View>

              <View className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                <Text className="text-[9px] font-bold text-slate-400">{item.category}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
