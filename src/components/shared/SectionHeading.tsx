import { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeading({ title, subtitle, icon, action, className = '' }: SectionHeadingProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
