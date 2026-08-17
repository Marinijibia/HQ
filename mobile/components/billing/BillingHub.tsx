import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { HQColors } from '../../constants/theme';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldCheck,
  ChevronRight,
  Check,
} from 'lucide-react-native';

interface Invoice {
  id: string;
  amount: string;
  status: 'Paid' | 'Pending';
  date: string;
  type: string;
}

export function BillingHub() {
  const [selectedPlanCode, setSelectedPlanCode] = useState('FREE');
  const [creditBalance] = useState(8420);
  const [creditLimit] = useState(10000);
  const [upgrading, setUpgrading] = useState(false);

  const [invoices] = useState<Invoice[]>([
    { id: 'INV-001', amount: '$10.00', status: 'Paid', date: 'Jul 01, 2026', type: 'Growth Scale Tier ($10/mo)' },
    { id: 'INV-002', amount: '$5.00', status: 'Paid', date: 'Jun 12, 2026', type: 'Extra Token Pack (+25,000)' },
    { id: 'INV-003', amount: '$10.00', status: 'Paid', date: 'Jun 01, 2026', type: 'Growth Scale Tier ($10/mo)' },
  ]);

  const handleSelectPlan = (code: string, price: string) => {
    setSelectedPlanCode(code);
    if (code === 'FREE') {
      Alert.alert('Free Starter Tier Active', 'You are currently on the Free Starter Tier ($0/mo) with 5,000 monthly AI tokens.');
    } else {
      Alert.alert(
        `Upgrade to ${code === 'PRO' ? 'Growth Scale Tier ($10/mo)' : 'Enterprise OS Tier ($50/mo)'}`,
        `Select payment method for ${price}:`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Paystack NGN/USD 💳',
            onPress: () => {
              setUpgrading(true);
              setTimeout(() => {
                setUpgrading(false);
                Alert.alert('Payment Initialized', `Opening Paystack portal for ${code} Tier (${price})...`);
              }, 600);
            },
          },
          {
            text: 'HQ Wallet USD 🏦',
            onPress: () => {
              setUpgrading(true);
              setTimeout(() => {
                setUpgrading(false);
                Alert.alert('Payment Successful', `Subscribed to ${code} Tier using HQ Virtual Wallet balance!`);
              }, 600);
            },
          },
        ]
      );
    }
  };

  const usagePercent = Math.round((creditBalance / creditLimit) * 100);

  return (
    <View className="space-y-4">
      {/* Active Subscription Hero Card */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <CreditCard size={20} color={HQColors.cyan} />
            <Text className="text-xs font-black text-white">Subscription & Entitlements</Text>
          </View>

          <View className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40">
            <Text className="text-[10px] font-black text-emerald-400">
              {selectedPlanCode === 'FREE' ? 'FREE TIER' : selectedPlanCode === 'PRO' ? 'GROWTH $10/MO' : 'ENTERPRISE $50/MO'}
            </Text>
          </View>
        </View>

        <View>
          <Text className="text-lg font-black text-white">
            {selectedPlanCode === 'FREE' ? 'Free Starter Tier' : selectedPlanCode === 'PRO' ? 'Growth Scale Tier ($10/mo)' : 'Enterprise OS Tier ($50/mo)'}
          </Text>
          <Text className="text-xs text-cyan-400 font-bold mt-0.5">
            {selectedPlanCode === 'FREE' ? '5,000 Monthly Tokens · 1 Active WBS Boardroom' : '50,000+ Monthly Tokens · Unlimited Swarm Missions'}
          </Text>
        </View>

        {/* Credit Balance Progress Bar */}
        <View className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-slate-300">Remaining Swarm Tokens</Text>
            <Text className="text-xs font-black text-white">
              {creditBalance.toLocaleString()} / {creditLimit.toLocaleString()} Tokens
            </Text>
          </View>

          <View className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <View
              style={{ width: `${usagePercent}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
            />
          </View>
        </View>
      </View>

      {/* Subscription Tier Cards Grid */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <View className="flex-row items-center space-x-2">
          <Sparkles size={18} color={HQColors.cyan} />
          <Text className="text-xs font-black text-white">Choose Workspace Plan Tier</Text>
        </View>

        <View className="space-y-2.5">
          {[
            {
              code: 'FREE',
              title: 'Free Starter Tier',
              price: '$0 / mo',
              desc: '5,000 Monthly Tokens · 1 Boardroom WBS · Standard Vector Search',
            },
            {
              code: 'PRO',
              title: 'Growth Scale Tier',
              price: '$10 / mo',
              desc: '50,000 Monthly Tokens · 5 Parallel Boardroom WBS · Circle USDC Wallet',
            },
            {
              code: 'ENTERPRISE',
              title: 'Enterprise OS Tier',
              price: '$50 / mo',
              desc: '200,000 Monthly Tokens · Unlimited Boardrooms · 6-Tier Killswitch',
            },
          ].map((tier) => {
            const isSelected = selectedPlanCode === tier.code;
            return (
              <TouchableOpacity
                key={tier.code}
                onPress={() => handleSelectPlan(tier.code, tier.price)}
                className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                  isSelected ? 'bg-cyan-500/10 border-cyan-400/60' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-xs font-black text-white">{tier.title}</Text>
                    <Text className="text-xs font-black text-cyan-400">{tier.price}</Text>
                  </View>
                  <Text className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</Text>
                </View>

                <View className={`px-3 py-1 rounded-xl border ${isSelected ? 'bg-cyan-500 border-cyan-400' : 'bg-slate-900 border-slate-800'}`}>
                  <Text className={`text-[10px] font-black ${isSelected ? 'text-black' : 'text-slate-300'}`}>
                    {isSelected ? 'Active' : 'Select'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Invoice Ledger History */}
      <View className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <View className="flex-row items-center space-x-2">
          <FileText size={18} color="#64748b" />
          <Text className="text-xs font-black text-white">Billing Ledger & Invoices</Text>
        </View>

        <View className="space-y-2.5 pt-1">
          {invoices.map((inv) => (
            <View
              key={inv.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-2">
                <Text className="text-xs font-bold text-white">{inv.type}</Text>
                <Text className="text-[10px] text-slate-400 mt-0.5">
                  {inv.id} &bull; {inv.date}
                </Text>
              </View>

              <View className="items-end space-y-1">
                <Text className="text-xs font-black text-white">{inv.amount}</Text>
                <View className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30">
                  <Text className="text-[9px] font-black text-emerald-400">{inv.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
