import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  isIdField?: boolean; // Active JetBrains Mono pour NNI/codes
}

/**
 * Champ de saisie — Min height 52px (DESIGN.md)
 * Les champs obligatoires utilisent un "sovereign flag accent dot"
 * au lieu du traditionnel astérisque rouge.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, hint, isIdField, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className={clsx(
            'block text-label-lg text-on-surface',
            required && 'required-dot'
          )}
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          className={clsx(
            // Base
            'w-full min-h-[52px] px-4 py-3',
            'border rounded-2xl bg-white text-body-md text-primary-text',
            'focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple',
            'placeholder:text-secondary-text/60',
            'disabled:bg-gray-100 disabled:text-secondary-text',
            'transition-colors shadow-sm',

            // Erreur
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-200',

            // Champ ID (NNI, codes)
            isIdField && 'font-id tracking-wider',

            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {hint && !error && (
          <p className="text-body-sm text-on-surface-variant">{hint}</p>
        )}

        {error && (
          <p id={`${inputId}-error`} className="text-body-sm text-republican-crimson" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
