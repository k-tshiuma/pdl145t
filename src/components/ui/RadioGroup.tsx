import { forwardRef } from 'react';
import clsx from 'clsx';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  options: RadioOption[];
  error?: string;
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ label, options, error, className, name, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        <span className="text-label-md font-medium text-on-surface-variant">
          {label}
        </span>
        <div className="flex flex-wrap gap-4 mt-1">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={opt.value}
                name={name}
                ref={ref}
                className="w-4 h-4 text-congo-azure border-gray-300 focus:ring-congo-azure"
                {...props}
              />
              <span className="text-body-md text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
        {error && <span className="text-label-sm text-error">{error}</span>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
