import { useConnectivityStore } from '../../stores/connectivity.store';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * ConnectivityBanner — Sticky top-0 z-50 (DESIGN.md)
 * Toujours visible quand authentifié.
 * - Vert (validation-jade) : en ligne
 * - Jaune (golden-yellow) : connectivité dégradée
 * - Rouge (republican-crimson) : hors ligne
 */
export function ConnectivityBanner() {
  const status = useConnectivityStore((s) => s.status);

  if (status === 'online') return null; // Masqué quand connecté normalement

  return (
    <div
      className={clsx(
        'sticky top-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-body-sm font-semibold',
        status === 'offline' && 'bg-republican-crimson text-white',
        status === 'degraded' && 'bg-golden-yellow text-ink',
      )}
      role="status"
      aria-live="polite"
    >
      {status === 'offline' && (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Mode hors-ligne — Les données seront synchronisées au retour de la connexion</span>
        </>
      )}
      {status === 'degraded' && (
        <>
          <AlertTriangle className="w-4 h-4" />
          <span>Connexion instable — Sauvegarde locale activée</span>
        </>
      )}
    </div>
  );
}
