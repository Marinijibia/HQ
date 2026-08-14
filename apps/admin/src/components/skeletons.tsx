'use client';

import * as React from 'react';

// ─── Skeleton primitives ──────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-foreground/8 ${className}`}
      style={style}
    />
  );
}

// ─── Card skeleton ────────────────────────────────────────────────────────────
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="border border-card-border rounded-2xl p-5 space-y-3 bg-card-bg">
      <Skeleton className="h-3.5 w-24" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

// ─── KPI skeleton row ─────────────────────────────────────────────────────────
export function KpiRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid gap-4 grid-cols-2 lg:grid-cols-${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-card-border rounded-2xl p-4 space-y-2 bg-card-bg">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-7 w-16 mt-1" />
          <Skeleton className="h-2 w-28" />
        </div>
      ))}
    </div>
  );
}

// ─── Table / list skeleton ────────────────────────────────────────────────────
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border border-card-border rounded-xl p-3 bg-card-bg"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-2.5" style={{ width: `${50 + Math.random() * 30}%` }} />
            <Skeleton className="h-2" style={{ width: `${30 + Math.random() * 40}%` }} />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Briefing paragraph skeleton ──────────────────────────────────────────────
export function BriefingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

// ─── Dashboard skeleton ────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-card-border">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      {/* KPI row */}
      <KpiRowSkeleton count={4} />
      {/* Two column */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
      {/* List */}
      <ListSkeleton rows={4} />
    </div>
  );
}

// ─── Boardroom skeleton ────────────────────────────────────────────────────────
export function BoardroomSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="border border-card-border rounded-2xl p-5 space-y-3 bg-card-bg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-4/5" />
            <Skeleton className="h-8 w-full rounded-xl mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
