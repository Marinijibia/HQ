import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { FolderGit2, FileText, Shield, ShieldCheck, Lock, UploadCloud } from 'lucide-react-native';

interface AssetItem {
  id: string;
  filename: string;
  category: 'Strategic' | 'Financial' | 'Legal';
  size: string;
  classification: 'CONFIDENTIAL' | 'SECRET';
  hasLegalHold: boolean;
}

export default function AssetsTab() {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Strategic' | 'Financial' | 'Legal'>('All');

  const assets: AssetItem[] = [
    {
      id: 'a1',
      filename: 'Q3_Petroleum_Logistics_Audit.pdf',
      category: 'Strategic',
      size: '4.2 MB',
      classification: 'CONFIDENTIAL',
      hasLegalHold: true,
    },
    {
      id: 'a2',
      filename: 'HQ_Executive_Treasury_Balance.csv',
      category: 'Financial',
      size: '1.8 MB',
      classification: 'SECRET',
      hasLegalHold: false,
    },
    {
      id: 'a3',
      filename: 'GDPR_Legal_Compliance_Review.docx',
      category: 'Legal',
      size: '850 KB',
      classification: 'CONFIDENTIAL',
      hasLegalHold: true,
    },
  ];

  const filteredAssets = assets.filter((a) => activeCategory === 'All' || a.category === activeCategory);

  return (
    <SafeAreaView className="flex-1 bg-[#0b0f19]">
      <Header title="Asset Vault" subtitle="Classified Document Ledger" />

      {/* Category Filter */}
      <View className="px-4 py-3 flex-row space-x-2 border-b border-gray-800 bg-gray-950/60">
        {(['All', 'Strategic', 'Financial', 'Legal'] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full border ${
              activeCategory === cat
                ? 'bg-cyan-500/20 border-cyan-400'
                : 'bg-gray-900 border-gray-800'
            }`}
          >
            <Text className={`text-xs font-bold ${activeCategory === cat ? 'text-cyan-400' : 'text-gray-400'}`}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {filteredAssets.map((asset) => (
          <View key={asset.id} className="p-4 mb-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center space-x-2.5">
                <FileText size={20} color="#06b6d4" />
                <View className="max-w-[70%]">
                  <Text className="text-sm font-extrabold text-white" numberOfLines={1}>
                    {asset.filename}
                  </Text>
                  <Text className="text-[10px] text-gray-400">{asset.category} · {asset.size}</Text>
                </View>
              </View>

              <View
                className={`px-2 py-0.5 rounded-md border ${
                  asset.classification === 'SECRET'
                    ? 'bg-rose-500/20 border-rose-500/40'
                    : 'bg-cyan-500/20 border-cyan-400/40'
                }`}
              >
                <Text
                  className={`text-[9px] font-extrabold ${
                    asset.classification === 'SECRET' ? 'text-rose-400' : 'text-cyan-400'
                  }`}
                >
                  {asset.classification}
                </Text>
              </View>
            </View>

            <View className="mt-2 pt-3 border-t border-gray-800/80 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-1">
                <Lock size={12} color="#10b981" />
                <Text className="text-[11px] text-emerald-400 font-medium">GCS Bucket Verified</Text>
              </View>

              {asset.hasLegalHold && (
                <View className="flex-row items-center space-x-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Shield size={10} color="#f59e0b" />
                  <Text className="text-[9px] font-bold text-amber-400">Legal Hold</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
