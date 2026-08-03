import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

// ==========================================
// 1. BADGES
// ==========================================
const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-hq-blue text-white shadow',
        success: 'bg-hq-cyan/20 text-hq-cyan border border-hq-cyan/30',
        warning: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
        error: 'bg-red-500/20 text-red-500 border border-red-500/30',
        info: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
        neutral: 'bg-hq-graphite text-foreground/80 border border-hq-graphite/40',
        ai: 'bg-hq-purple/20 text-hq-purple border border-hq-purple/30 shadow-level-5 animate-pulse',
        premium: 'bg-yellow-500 text-background font-bold shadow-md',
        outline: 'border border-card-border bg-transparent text-foreground/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// ==========================================
// 2. AVATARS
// ==========================================
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'user' | 'executive' | 'org';
}

export function Avatar({
  className,
  src,
  fallback,
  size = 'md',
  variant = 'user',
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-lg',
  };

  const ringClasses = {
    user: 'border-hq-graphite/30',
    executive: 'border-hq-purple/50 shadow-level-5',
    org: 'border-hq-blue/50 rounded-lg',
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full border bg-hq-graphite/50 select-none items-center justify-center font-semibold text-foreground',
        sizeClasses[size],
        ringClasses[variant],
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={fallback}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
      <span className="uppercase">{fallback.slice(0, 2)}</span>
    </div>
  );
}

// ==========================================
// 3. SWITCH
// ==========================================
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ className, checked, onCheckedChange, ...props }: SwitchProps) {
  return (
    <label className={cn('inline-flex items-center cursor-pointer select-none', className)}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      <div className="relative w-9 h-5 bg-hq-graphite rounded-full peer peer-focus:ring-1 peer-focus:ring-hq-blue peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-hq-blue"></div>
    </label>
  );
}

// ==========================================
// 4. MODALS & DIALOG PANELS
// ==========================================
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative w-full max-w-lg rounded-xl border border-hq-graphite/40 bg-hq-graphite/90 p-6 shadow-level-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight text-foreground">
            {title}
          </h2>
          {description && <p className="text-sm text-foreground/60">{description}</p>}
        </div>
        <div className="my-4">{children}</div>
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
