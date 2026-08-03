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
} from 'lucide-react-native';

interface Invoice {
  id: string;
  amount: string;
  status: 'Paid' | 'Pending';
  date: string;
  type: string;
}

export function BillingHub() {
  const [planName] = useState('Professional Executive Tier');
  const [creditBalance] = useState(8420);
  const [creditLimit] = useState(10000);
  const [upgrading, setUpgrading] = useState(false);

  const [invoices] = useState<Invoice[]>([
    { id: 'INV-001', amount: '$150.00', status: 'Paid', date: 'Jul 01, 2026', type: 'Professional Subscription' },
    { id: 'INV-002', amount: '$45.00', status: 'Paid', date: 'Jun 12, 2026', type: 'Credit Pack (5,000 Cr)' },
    { id: 'INV-003', amount: '$150.00', status: 'Paid', date: 'Jun 01, 2026', type: 'Professional Subscription' },
  ]);

  const handleBuyCredits = () => {
    Alert.alert(
      'Purchase Credit Pack',
      'Select payment gateway to purchase 10,000 AI Credits ($90.00):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay with Paystack 💳',
          onPress: () => {
            setUpgrading(true);
            setTimeout(() => {
              setUpgrading(false);
              Alert.alert('Payment Initialized', 'Opening Paystack checkout portal...');
            }, 600);
          },
        },
        {
          text: 'Pay with Stripe 💳',
          onPress: () => {
            setUpgrading(true);
            setTimeout(() => {
              setUpgrading(false);
              Alert.alert('Payment Initialized', 'Opening Stripe checkout portal...');
            }, 600);
          },
        },
      ]
    );
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
            <Text className="text-[10px] font-black text-emerald-400">ACTIVE</Text>
          </View>
        </View>

        <View>
          <Text className="text-lg font-black text-white">{planName}</Text>
          <Text className="text-xs text-cyan-400 font-bold mt-0.5">
            Unlimited AI Executive Swarm & Autonomous Missions
          </Text>
        </View>

        {/* Credit Balance Progress Bar */}
        <View className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-slate-300">Remaining Swarm Credits</Text>
            <Text className="text-xs font-black text-white">
              {creditBalance.toLocaleString()} / {creditLimit.toLocaleString()} Cr
            </Text>
          </View>

          <View className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <View
              style={{ width: `${usagePercent}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
            />
          </View>
        </View>

        {/* Purchase Credits Action */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBuyCredits}
          disabled={upgrading}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 border border-cyan-400/50 flex-row items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30"
        >
          {upgrading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Zap size={16} color="#ffffff" />
              <Text className="text-xs font-black text-white tracking-wider uppercase">
                Purchase Credit Pack ($90.00)
              </Text>
            </>
          )}
        </TouchableOpacity>
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
