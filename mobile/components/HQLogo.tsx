import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { HQColors } from '../constants/theme';

interface HQLogoProps {
  size?: number;
  source?: ImageSourcePropType;
}

export function HQLogo({ size = 48, source }: HQLogoProps) {
  const iconSource = source || require('../assets/icon.png');

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        backgroundColor: '#06b6d4',
        borderWidth: 1.5,
        borderColor: '#38bdf8',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#06b6d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
      }}
    >
      {/* Background Glow Overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0284c7',
          opacity: 0.2,
        }}
      />
      {/* High-visibility Brand Monogram / Image */}
      <Image
        source={iconSource}
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: Math.round(size * 0.2),
        }}
        resizeMode="contain"
      />
    </View>
  );
}
