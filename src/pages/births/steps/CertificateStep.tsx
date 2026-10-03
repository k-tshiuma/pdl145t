import { useNavigate } from 'react-router-dom';
import { useBirthDraftStore } from '../../../stores/birth-draft.store';
import { Button } from '../../../components/ui/Button';
import { FileText, Download, Home, Plus } from 'lucide-react';
import { api } from '../../../services/api';

/**
 * Étape 8 : Acte de naissance généré — Écran de confirmation finale.
 *
 * ⚠️ Le document PDF généré est un PRÉ-ENREGISTREMENT.
 * Il ne constitue PAS un acte de naissance juridiquement valable.
 */
export function CertificateStep() {
  const navigate = useNavigate();
  const store = useBirthDraftStore();

  const handleDownloadPDF = async () => {
    if (!store.birthId) return;
    try {
      const response = await api.get(`/births/${store.birthId}/certificate/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `acte_naissance_${store.birthId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
    }
  };

  const handleNewBirth = () => {
    store.reset();
    navigate('/births/new');
  };

  const handleGoHome = () => {
    store.reset();
    navigate('/');
  };

  return (
    <div className="space-y-6 text-center max-w-lg mx-auto">
      {/* Icône de succès */}
      <div className="flex justify-center pt-8">
        <div className="w-20 h-20 rounded-full bg-validation-jade/20 flex items-center justify-center">
          <FileText className="w-10 h-10 text-validation-jade" />
        </div>
      </div>

      <div>
        <h2 className="text-headline-lg text-sovereign-navy">
          Enregistrement validé
        </h2>
        <p className="text-body-md text-on-surface-variant mt-2">
          Le dossier de naissance a été enregistré avec succès.
        </p>
      </div>

      {/* Identifiants officiels */}
      <div className="bg-surface-container border border-border-struct rounded-xl p-5 space-y-4">
        {store.childData?.nin && (
          <div className="pb-3 border-b border-border-struct/60">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">
              Numéro d'Identité National (NIN) du nouveau-né
            </p>
            <p className="text-2xl font-mono font-bold text-blue-900 tracking-widest">
              {store.childData.nin}
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              ✓ Numéro national unique à 9 chiffres attribué
            </p>
          </div>
        )}

        <div>
          <p className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
            Identifiant système (provisoire)
          </p>
          <p className="text-lg font-mono font-bold text-sovereign-navy">
            {store.childData?.system_id ?? 'En cours de génération...'}
          </p>
          <p className="text-body-sm text-golden-yellow mt-1">
            ⚠️ ID provisoire — À valider par l'autorité compétente
          </p>
        </div>
      </div>

      {/* Avertissement légal */}
      <div className="provisoire-banner text-left">
        Ce document est un PRÉ-ENREGISTREMENT et ne constitue pas un acte de naissance
        juridiquement valable au sens de la Loi n°87-010 du 1er août 1987 portant
        Code de la famille (RDC). La validation officielle par un officier d'état civil est requise.
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button fullWidth onClick={handleDownloadPDF} className="gap-2">
          <Download className="w-5 h-5" />
          Télécharger l'acte (PDF)
        </Button>

        <Button fullWidth variant="secondary" onClick={handleNewBirth} className="gap-2">
          <Plus className="w-5 h-5" />
          Nouvel enregistrement
        </Button>

        <Button fullWidth variant="ghost" onClick={handleGoHome} className="gap-2">
          <Home className="w-5 h-5" />
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
}
