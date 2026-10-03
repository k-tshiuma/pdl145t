import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface NavDockProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  formId?: string;
}

/**
 * NavDock — Barre de navigation inférieure fixe
 * DESIGN.md: fixed bottom, 76px min-height
 * Layout: Prev (35% / ghost) + Next (65% / congo-azure)
 * Pas de box-shadow — utilise une bordure supérieure
 */
export function NavDock({
  onPrev,
  onNext,
  prevLabel = 'Précédent',
  nextLabel = 'Suivant',
  prevDisabled = false,
  nextDisabled = false,
  nextLoading = false,
  formId,
}: NavDockProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-40 bg-white border-t border-gray-200 h-[76px] flex items-stretch shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      {/* Bouton Précédent — 35% */}
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled || !onPrev}
        className={clsx(
          'w-[35%] flex items-center justify-center gap-2',
          'text-body-md text-secondary-text',
          'hover:bg-gray-50 transition-colors',
          'disabled:opacity-30 disabled:cursor-not-allowed',
        )}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-semibold">{prevLabel}</span>
      </button>

      {/* Bouton Suivant — 65% */}
      <button
        type={formId ? 'submit' : 'button'}
        form={formId}
        onClick={formId ? undefined : onNext}
        disabled={nextDisabled || nextLoading || (!formId && !onNext)}
        className={clsx(
          'w-[65%] flex items-center justify-center gap-2',
          'bg-gradient-pink-red text-white font-semibold text-body-lg',
          'hover:opacity-90 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        <span>{nextLabel}</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
