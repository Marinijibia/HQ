'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let listeners: Array<(toasts: Toast[]) => void> = [];
let currentToasts: Toast[] = [];

function notifyListeners() {
  listeners.forEach(fn => fn([...currentToasts]));
}

export const toast = {
  success: (message: string, duration = 4000) => addToast(message, 'success', duration),
  error: (message: string, duration = 5000) => addToast(message, 'error', duration),
  warning: (message: string, duration = 4000) => addToast(message, 'warning', duration),
  info: (message: string, duration = 4000) => addToast(message, 'info', duration),
};

function addToast(message: string, type: ToastType, duration: number) {
  const id = `toast-${Date.now()}-${Math.random()}`;
  currentToasts = [{ id, message, type, duration }, ...currentToasts].slice(0, 5);
  notifyListeners();
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

function removeToast(id: string) {
  currentToasts = currentToasts.filter(t => t.id !== id);
  notifyListeners();
}

function useToastStore(): Toast[] {
  const [toasts, setToasts] = React.useState<Toast[]>(currentToasts);
  React.useEffect(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter(fn => fn !== setToasts); };
  }, []);
  return toasts;
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: '#22C55E', border: '#22C55E30', text: '#16A34A' },
  error: { bg: '#EF4444', border: '#EF444430', text: '#DC2626' },
  warning: { bg: '#F59E0B', border: '#F59E0B30', text: '#D97706' },
  info: { bg: '#0A84FF', border: '#0A84FF30', text: '#0069CC' },
};

export function ToastContainer() {
  const toasts = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = ICONS[t.type];
        const colors = COLORS[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl min-w-72 max-w-sm border backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-300"
            style={{
              backgroundColor: `${colors.bg}12`,
              borderColor: colors.border,
              background: 'var(--card-bg, #fff)',
            }}
          >
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: `${colors.bg}18` }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: colors.bg }} />
            </div>
            <p className="flex-1 text-xs font-semibold text-[#1A1A1E] dark:text-white leading-relaxed pt-0.5">
              {t.message}
            </p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 mt-0.5 h-5 w-5 rounded flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
