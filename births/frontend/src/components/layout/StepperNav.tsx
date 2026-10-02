import { clsx } from 'clsx';
import { Check } from 'lucide-react';

import { WORKFLOW_STEPS } from '../../types';

interface StepperNavProps {
  stepIndex: number;
}

/**
 * Stepper horizontal pour le workflow d'enregistrement.
 * Affiche les 8 étapes avec indicateur visuel de progression.
 */
export function StepperNav({ stepIndex }: StepperNavProps) {
  return (
    <div className="bg-white border-b border-border-struct px-4 py-3 overflow-x-auto flex justify-center">
      <div className="flex items-start gap-1 min-w-max mx-auto">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isCurrent = idx === stepIndex;
          const isCompleted = idx < stepIndex;
          const isFuture = idx > stepIndex;

          return (
            <div key={step.key} className="flex items-start">
              {/* Dot / checkmark */}
              <div className="flex flex-col items-center gap-1 h-full">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-label-md font-bold transition-colors shrink-0',
                    isCompleted && 'bg-validation-jade text-white',
                    isCurrent && 'bg-congo-azure text-white',
                    isFuture && 'bg-surface-container text-on-surface-variant',
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={clsx(
                    'text-label-sm text-center max-w-[70px] leading-tight',
                    isCurrent && 'text-congo-azure font-bold',
                    isCompleted && 'text-validation-jade',
                    isFuture && 'text-on-surface-variant',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={clsx(
                    'w-4 sm:w-6 h-0.5 mx-0.5 mt-[15px]',
                    idx < stepIndex ? 'bg-validation-jade' : 'bg-surface-container',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
