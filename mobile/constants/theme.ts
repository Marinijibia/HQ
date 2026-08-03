import { Platform } from 'react-native';

export const HQColors = {
  blue: '#0A84FF',
  cyan: '#30D158',
  purple: '#BF5AF2',
  rose: '#F43F5E',
  dark: '#0A0A0C',
  card: '#161618',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#F2F2F7',
  subtext: '#94A3B8',
};

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8F9FA',
    tint: '#0A84FF',
    icon: '#475569',
    tabIconDefault: '#64748B',
    tabIconSelected: '#0A84FF',
  },
  dark: {
    text: '#F2F2F7',
    background: '#0A0A0C',
    tint: '#06B6D4',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#06B6D4',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter',
    mono: 'JetBrains Mono',
  },
  default: {
    sans: 'sans-serif',
    mono: 'monospace',
  },
});
