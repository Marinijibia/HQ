import * as React from 'react';

interface HQLogoProps {
  size?: number;
  className?: string;
}

export function HQLogo({ size = 32, className = '' }: HQLogoProps) {
  const borderRadius = Math.round(size * 0.28);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius,
        background: 'linear-gradient(135deg, #0A84FF, #8B5CF6, #06B6D4)',
        padding: '1.5px',
        boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center bg-[#0A0A0C] relative overflow-hidden"
        style={{ borderRadius: borderRadius - 1 }}
      >
        {/* Glow overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #06B6D4, transparent 70%)',
          }}
        />

        {/* Monogram emblem */}
        <span
          className="font-black tracking-tighter text-white font-sans flex items-baseline justify-center"
          style={{ fontSize: Math.round(size * 0.44), lineHeight: 1 }}
        >
          HQ
          <span className="text-cyan-400 font-black" style={{ fontSize: Math.round(size * 0.5) }}>
            .
          </span>
        </span>
      </div>
    </div>
  );
}
