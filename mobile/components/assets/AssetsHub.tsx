import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { HQColors } from '../../constants/theme';
import {
  FolderOpen,
  Search,
  ShieldAlert,
  FileText,
  FileImage,
  Database,
  Lock,
  CheckCircle2,
  Download,
  Key,
} from 'lucide-react-native';

interface AssetItem {
  id: string;
  filename: string;
  fileSize: string;
  classification: 'CONFIDENTIAL' | 'RESTRICTED' | 'INTERNAL' | 'PUBLIC';
  isLegalHold: boolean;
  sha256: string;
  createdAt: string;
}

export function AssetsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CONFIDENTIAL' | 'RESTRICTED'>('ALL');

  const [assets] = useState<AssetItem[]>([
    {
      id: 'ast-1',
      filename: 'Q3_Executive_Logistics_Corridor_Strategy.pdf',
      fileSize: '4.2 MB',
      classification: 'CONFIDENTIAL',
      isLegalHold: true,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      createdAt: '2026-07-28',
    },
    {
      id: 'ast-2',
      filename: 'Enterprise_Boardroom_Audit_Ledger_2026.xlsx',
      fileSize: '1.8 MB',
      classification: 'RESTRICTED',
      isLegalHold: false,
      sha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      createdAt: '2026-07-15',
    },
    {
      id: 'ast-3',
      filename: 'HQ_Monorepo_System_Architecture_Blueprint.png',
      fileSize: '12.4 MB',
      classification: 'INTERNAL',
      isLegalHold: false,
      sha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      createdAt: '2026-07-02',
    },
  ]);

  const filteredAssets = assets.filter((ast) => {
    const matchesCategory = activeCategory === 'ALL' || ast.classification === activeCategory;
    const matchesSearch = ast.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View className="space-y-4">
      {/* Action Header */}
      <View className="flex-row items-center space-x-2">
        <View className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
          <FolderOpen size={18} color={HQColors.cyan} />
        </View>
        <View>
          <Text className="text-base font-black text-white tracking-tight">
            Corporate Asset & Knowledge Vault
          </Text>
          <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Tamper-Proof Document Repository
          </Text>
        </View>
      </View>

      {/* Filter Tabs & Search Bar */}
      <View className="space-y-2.5">
        <View className="flex-row bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'ALL', label: 'All Assets' },
            { id: 'CONFIDENTIAL', label: 'Confidential' },
            { id: 'RESTRICTED', label: 'Restricted' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveCategory(tab.id as any)}
              className={`flex-1 py-2 rounded-xl items-center ${
                activeCategory === tab.id
                  ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-sm'
                  : ''
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
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5">
          <Search size={16} color="#64748b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search corporate files & documents..."
            placeholderTextColor="#64748b"
            className="flex-1 text-xs text-white font-medium ml-2.5"
          />
        </View>
      </View>

      {/* Asset List */}
      <View className="space-y-3">
        {filteredAssets.map((ast) => (
          <View
            key={ast.id}
            className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2.5"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2 flex-1 pr-2">
                <FileText size={18} color={HQColors.cyan} />
                <Text className="text-xs font-bold text-white flex-1" numberOfLines={1}>
                  {ast.filename}
                </Text>
              </View>

              <View
                className={`px-2 py-0.5 rounded-md border ${
                  ast.classification === 'CONFIDENTIAL'
                    ? 'bg-rose-500/20 border-rose-400/40'
                    : 'bg-amber-500/20 border-amber-400/40'
                }`}
              >
                <Text
                  className={`text-[9px] font-black uppercase ${
                    ast.classification === 'CONFIDENTIAL' ? 'text-rose-300' : 'text-amber-300'
                  }`}
                >
                  {ast.classification}
                </Text>
              </View>
            </View>

            {/* SHA-256 Hashes & Legal Hold */}
            <View className="pt-2 border-t border-slate-800/80 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-[9px] font-mono text-slate-500" numberOfLines={1}>
                  SHA256: {ast.sha256}
                </Text>
                <Text className="text-[10px] text-slate-400 mt-0.5">
                  {ast.fileSize} &bull; Created {ast.createdAt}
                </Text>
              </View>

              {ast.isLegalHold && (
                <View className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 flex-row items-center space-x-1">
                  <ShieldAlert size={10} color="#f59e0b" />
                  <Text className="text-[9px] font-black text-amber-300">LEGAL HOLD</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
