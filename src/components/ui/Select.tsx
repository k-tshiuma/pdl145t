import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, required, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={selectId}
          className={clsx(
            'block text-label-lg text-on-surface',
            required && 'required-dot'
          )}
        >
          {label}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'w-full min-h-touch px-4 py-3 pr-10 appearance-none',
              'border rounded bg-white text-body-md text-ink',
              'focus:outline-none focus:ring-2 focus:ring-congo-azure focus:border-congo-azure',
              'disabled:bg-surface-container-low disabled:text-on-surface-variant',
              'elevation-none',
              error
                ? 'border-republican-crimson focus:ring-republican-crimson'
                : 'border-border-struct',
              className
            )}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
        </div>

        {error && (
          <p className="text-body-sm text-republican-crimson" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
