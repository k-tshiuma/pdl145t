import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Bouton — Design System "Sovereign Clinical & Civil Infrastructure"
 * Min height: 52px (sm), 56px (md/lg) conformément au DESIGN.md
 * Radius: 4px, pas de box-shadow
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base
        'inline-flex items-center justify-center font-semibold rounded-full transition-transform duration-200 active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'shadow-soft',

        // Sizes
        size === 'sm' && 'min-h-[44px] px-4 text-body-sm',
        size === 'md' && 'min-h-[52px] px-6 text-body-md',
        size === 'lg' && 'min-h-[56px] px-8 text-body-lg',

        // Variants
        variant === 'primary' && 'bg-gradient-pink-red text-white hover:opacity-90 focus:ring-brand-purple border-none',
        variant === 'secondary' && 'bg-white border border-gray-200 text-primary-text hover:bg-gray-50 focus:ring-brand-purple',
        variant === 'ghost' && 'bg-transparent text-secondary-text shadow-none hover:bg-gray-100 focus:ring-brand-purple',
        variant === 'danger' && 'bg-gradient-crimson text-white hover:opacity-90 focus:ring-red-400 border-none',
        variant === 'info' && 'bg-gradient-blue text-white hover:opacity-90 focus:ring-blue-400 border-none',

        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
