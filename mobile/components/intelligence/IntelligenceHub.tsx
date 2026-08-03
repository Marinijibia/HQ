import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { HQColors } from '../../constants/theme';
import { api } from '../../lib/api-client';
import {
  Brain,
  Building2,
  Briefcase,
  Network,
  Target,
  Sliders,
  Palette,
  Users,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';

interface TwinLayer {
  id: number;
  name: string;
  key: string;
  icon: any;
  color: string;
  description: string;
  confidence: number;
  fields: { key: string; label: string; value: string }[];
}

export function IntelligenceHub() {
  const [maturityScore, setMaturityScore] = useState(92);
  const [selectedLayerId, setSelectedLayerId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [layers, setLayers] = useState<TwinLayer[]>([
    {
      id: 1,
      name: 'Identity Layer',
      key: 'identity',
      icon: Building2,
      color: HQColors.cyan,
      description: 'Core organizational metadata & headquarters identity',
      confidence: 96,
      fields: [
        { key: 'orgName', label: 'Organization Name', value: 'Headquarters Monorepo Enterprise' },
        { key: 'hqName', label: 'Headquarters Cluster', value: 'Abuja Primary Node' },
        { key: 'industry', label: 'Industry Domain', value: 'Artificial Intelligence & SaaS' },
        { key: 'businessStage', label: 'Business Stage', value: 'Growth Stage / Series A' },
      ],
    },
    {
      id: 2,
      name: 'Business Model Layer',
      key: 'businessModel',
      icon: Briefcase,
      color: '#8b5cf6',
      description: 'Revenue models, products, services & target market segments',
      confidence: 90,
      fields: [
        { key: 'products', label: 'Core Products', value: 'Autonomous Executive AI Swarm, Developer API' },
        { key: 'revenueModel', label: 'Revenue Model', value: 'SaaS Subscription & Token Credit Outflow' },
        { key: 'targetMarkets', label: 'Target Markets', value: 'United Kingdom, Nigeria, United States' },
      ],
    },
    {
      id: 3,
      name: 'Organization Layer',
      key: 'structure',
      icon: Network,
      color: '#0ea5e9',
      description: 'Departmental hierarchy, reporting lines & executive roles',
      confidence: 94,
      fields: [
        { key: 'departments', label: 'Active Departments', value: 'Engineering, Marketing, Finance, Customer Success' },
        { key: 'reportingLines', label: 'Reporting Structure', value: 'CEO -> C-Suite Swarm -> Team Leads' },
      ],
    },
    {
      id: 4,
      name: 'Strategic Direction',
      key: 'strategy',
      icon: Target,
      color: '#10b981',
      description: 'OKRs, strategic vision & competitive differentiators',
      confidence: 88,
      fields: [
        { key: 'vision', label: 'Strategic Vision', value: 'Autonomously manage enterprise workflows via AI Swarm' },
        { key: 'keyResult', label: 'Q3 Key Objective', value: 'Scale West African logistics corridors telemetry' },
      ],
    },
    {
      id: 5,
      name: 'Operations Layer',
      key: 'operations',
      icon: Sliders,
      color: '#f59e0b',
      description: 'Core workflows, SLAs, vendor mappings & compliance bounds',
      confidence: 91,
      fields: [
        { key: 'slaTarget', label: 'SLA Response Target', value: '99.95% System Uptime Guarantee' },
        { key: 'vendorStack', label: 'Cloud Infrastructure', value: 'GCP, Vercel, Supabase, Redis' },
      ],
    },
    {
      id: 6,
      name: 'Brand Identity Layer',
      key: 'brand',
      icon: Palette,
      color: '#ec4899',
      description: 'Corporate voice, tone standards, logo & color system',
      confidence: 95,
      fields: [
        { key: 'toneOfVoice', label: 'Tone of Voice', value: 'Executive, Authoritative, Professional' },
        { key: 'brandColor', label: 'Primary Brand Color', value: '#0A84FF (Electric Cyan)' },
      ],
    },
    {
      id: 7,
      name: 'Customer Intelligence',
      key: 'customer',
      icon: Users,
      color: '#06b6d4',
      description: 'Ideal Customer Profiles (ICPs), feedback & retention risks',
      confidence: 86,
      fields: [
        { key: 'icp', label: 'Ideal Customer Profile', value: 'C-Level Executives, VPs of Engineering & Operations' },
        { key: 'satisfactionScore', label: 'CSAT Rating', value: '4.9 / 5.0 (98% Satisfaction)' },
      ],
    },
    {
      id: 8,
      name: 'Market & Tech Intelligence',
      key: 'technology',
      icon: Cpu,
      color: '#a855f7',
      description: 'Technology stack, IP assets & market competitive threats',
      confidence: 93,
      fields: [
        { key: 'techStack', label: 'AI Engine Architecture', value: 'NestJS, Prisma, Next.js, React Native' },
        { key: 'ipAssets', label: 'Proprietary IP', value: 'Task DAG Graph WBS Generator Engine' },
      ],
    },
  ]);

  useEffect(() => {
    fetchIntelligenceData();
  }, []);

  const fetchIntelligenceData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/intelligence', 3000);
      if (res.ok && res.data) {
        if (res.data.overallConfidence) {
          setMaturityScore(Math.round(res.data.overallConfidence * 100));
        }
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFieldValue = (layerId: number, fieldKey: string, newValue: string) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id === layerId) {
          return {
            ...layer,
            fields: layer.fields.map((f) => (f.key === fieldKey ? { ...f, value: newValue } : f)),
          };
        }
        return layer;
      })
    );
  };

  const handleSaveIntelligence = async () => {
    setSuccessMsg(null);
    setSaving(true);
    try {
      const activeLayer = layers.find((l) => l.id === selectedLayerId);
      if (activeLayer) {
        const payload: Record<string, any> = {};
        activeLayer.fields.forEach((f) => {
          payload[f.key] = f.value;
        });
        await api.patch('/intelligence', { [activeLayer.key]: payload });
      }
      setSuccessMsg('Executive Intelligence twin layer updated successfully!');
    } catch (e) {
      setSuccessMsg('Twin layer updated locally!');
    } finally {
      setSaving(false);
    }
  };

  const activeLayer = layers.find((l) => l.id === selectedLayerId) || layers[0];
  const IconComponent = activeLayer.icon;

  return (
    <View className="space-y-4">
      {/* Executive Organizational Maturity Ring */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl items-center">
        <View className="flex-row items-center space-x-2 mb-2">
          <Brain size={20} color={HQColors.cyan} />
          <Text className="text-xs font-black text-cyan-400 uppercase tracking-widest">
            ORGANIZATION INTELLIGENCE TWIN
          </Text>
        </View>

        {/* Maturity Score Circular Gauge */}
        <View className="w-24 h-24 rounded-full border-4 border-cyan-500/40 items-center justify-center bg-slate-950 my-2 shadow-lg shadow-cyan-500/20">
          <Text className="text-3xl font-black text-white">{maturityScore}%</Text>
          <Text className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
            MATURITY
          </Text>
        </View>

        <Text className="text-sm font-black text-white tracking-tight mt-1">
          AI Twin Learning State: High Alignment
        </Text>
        <Text className="text-[11px] text-slate-400 text-center mt-0.5 leading-relaxed">
          8 Organizational Twin Layers continuously updated by Executive AI Swarm.
        </Text>
      </View>

      {/* Horizontal Twin Layers Switcher */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
        {layers.map((l) => {
          const isSelected = l.id === selectedLayerId;
          const LayerIcon = l.icon;
          return (
            <TouchableOpacity
              key={l.id}
              onPress={() => setSelectedLayerId(l.id)}
              className={`flex-row items-center space-x-1.5 py-2 px-3.5 rounded-2xl border mr-2 ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <LayerIcon size={14} color={isSelected ? HQColors.cyan : '#64748b'} />
              <Text
                className={`text-xs font-extrabold ${
                  isSelected ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                L{l.id}: {l.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Feedback Messages */}
      {successMsg && (
        <View className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex-row items-center space-x-2">
          <CheckCircle2 size={16} color="#10b981" />
          <Text className="text-xs text-emerald-300 font-medium flex-1">{successMsg}</Text>
        </View>
      )}

      {/* Selected Twin Layer Fields Form */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <View className="flex-row items-center justify-between border-b border-slate-800 pb-3">
          <View className="flex-row items-center space-x-2.5 flex-1 pr-2">
            <View className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <IconComponent size={18} color={activeLayer.color} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-black text-white">{activeLayer.name}</Text>
              <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                {activeLayer.description}
              </Text>
            </View>
          </View>

          <View className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40">
            <Text className="text-[9px] font-black text-emerald-400">
              {activeLayer.confidence}% CONFIDENCE
            </Text>
          </View>
        </View>

        {/* Dynamic Layer Fields */}
        <View className="space-y-3">
          {activeLayer.fields.map((field) => (
            <View key={field.key}>
              <Text className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                {field.label}
              </Text>
              <View className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5">
                <TextInput
                  value={field.value}
                  onChangeText={(val) => handleUpdateFieldValue(activeLayer.id, field.key, val)}
                  className="text-xs text-white font-medium"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Save Action */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSaveIntelligence}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-2 mt-2 shadow-lg shadow-cyan-500/30"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Save size={16} color="#ffffff" />
              <Text className="text-xs font-black text-white tracking-wider">
                Save Twin Layer Metadata
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
