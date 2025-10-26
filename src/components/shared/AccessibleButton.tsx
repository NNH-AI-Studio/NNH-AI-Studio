import { motion } from 'framer-motion';
import { useState, ReactNode } from 'react';
import { Loader2, Check } from 'lucide-react';

interface AccessibleButtonProps {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export default function AccessibleButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  icon,
  fullWidth = false,
  ariaLabel,
  ariaDescribedBy,
}: AccessibleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    if (onClick) {
      const result = onClick();
      if (result instanceof Promise) {
        setIsLoading(true);
        try {
          await result;
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 2000);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-nnh-orange/10 text-white border border-neon-orange shadow-neon-orange hover:bg-nnh-orange/20',
    outline: 'bg-transparent text-white border border-neon-orange shadow-neon-orange hover:border-white/50 hover:bg-nnh-orange/5',
    ghost: 'bg-transparent text-white hover:bg-nnh-orange/10',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={isLoading}
      aria-disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg font-semibold
        inline-flex items-center justify-center space-x-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-ring
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center space-x-2">
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader2 className="w-5 h-5" />
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Check className="w-5 h-5" />
          </motion.div>
        ) : (
          icon && <span>{icon}</span>
        )}
        <span>{children}</span>
      </span>
    </motion.button>
  );
}
