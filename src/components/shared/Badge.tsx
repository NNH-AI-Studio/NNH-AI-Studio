import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-white/5 text-white border-white/10',
    success: 'bg-green-500/10 text-green-300 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-300 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  };

  const sizes: Record<NonNullable<BadgeProps['size']>, string> = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
