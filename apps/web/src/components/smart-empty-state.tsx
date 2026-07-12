'use client';

import * as React from 'react';
import { Button } from '@hq/ui';
import { LucideIcon } from 'lucide-react';

interface SmartEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: string;
  onCta?: () => void;
  ctaColor?: string;
  secondaryCta?: string;
  onSecondaryCta?: () => void;
  hints?: string[];
  compact?: boolean;
}

export function SmartEmptyState({
  icon: Icon,
  title,
  description,
  cta,
  onCta,
  ctaColor = '#0A84FF',
  secondaryCta,
  onSecondaryCta,
  hints = [],
  compact = false,
}: SmartEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10 px-6' : 'py-16 px-8'} space-y-4 animate-in fade-in duration-500`}>
      {/* Animated icon bubble */}
      <div className="relative">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${ctaColor}18`, border: `1.5px solid ${ctaColor}30` }}
        >
          <Icon className="h-7 w-7" style={{ color: ctaColor }} />
        </div>
        {/* Subtle pulse ring */}
        <div
          className="absolute inset-0 rounded-2xl animate-ping opacity-20"
          style={{ backgroundColor: ctaColor }}
        />
      </div>

      {/* Text */}
      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">{title}</h3>
        <p className="text-xs text-foreground/55 font-semibold leading-relaxed">{description}</p>
      </div>

      {/* Hint chips */}
      {hints.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-sm">
          {hints.map((hint, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-card-border text-foreground/60 bg-foreground/4 cursor-pointer hover:bg-foreground/8 transition-colors"
            >
              {hint}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {(cta || secondaryCta) && (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {cta && (
            <Button
              onClick={onCta}
              size="sm"
              className="text-white font-bold text-xs h-9 px-5"
              style={{ backgroundColor: ctaColor }}
            >
              {cta}
            </Button>
          )}
          {secondaryCta && (
            <Button
              onClick={onSecondaryCta}
              variant="outline"
              size="sm"
              className="font-bold text-xs h-9 px-5 border-card-border"
            >
              {secondaryCta}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
