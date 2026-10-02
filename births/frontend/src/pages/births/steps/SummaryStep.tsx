import { useBirthDraftStore } from '../../../stores/birth-draft.store';
import { api } from '../../../services/api';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Étape 7 : Récapitulatif — Revue complète avant validation.
 */
export function SummaryStep() {
  const store = useBirthDraftStore();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!store.birthId) return;
    setError(null);

    try {
      let finalFatherId = store.fatherId;
      if (!store.fatherUnknown && !finalFatherId && store.fatherData) {
        // Create father
        const res = await api.post('/parents', store.fatherData);
        finalFatherId = res.data.data.id;
        store.setFatherId(finalFatherId);
      }

      let finalMotherId = store.motherId;
      if (!store.motherUnknown && !finalMotherId && store.motherData) {
        // Create mother
        const res = await api.post('/parents', store.motherData);
        finalMotherId = res.data.data.id;
        store.setMotherId(finalMotherId);
      }

      const response = await api.post(`/births/${store.birthId}/confirm`, {
        child: {
          first_names: store.childData?.first_names ?? '',
          last_name: store.childData?.last_name ?? '',
          post_names: store.childData?.post_names,
          birth_datetime: store.childData?.birth_datetime ?? new Date().toISOString(),
          birth_place: store.childData?.birth_place,
          gender: store.childData?.gender,
          birth_type: store.childData?.birth_type ?? 'SINGLE',
          birth_order: store.childData?.birth_order ?? 1,
          father_id: finalFatherId,
          mother_id: finalMotherId,
          father_unknown: store.fatherUnknown,
          mother_unknown: store.motherUnknown,
        },
        province_code: 'KIN', // TODO: extraire du centre de santé
      });
      if (response.data?.data?.child?.system_id) {
        store.setChildData({
          ...store.childData!,
          system_id: response.data.data.child.system_id,
        });
      }
      store.nextStep(); // → certificate step
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Erreur lors de la validation');
    }
  };

  return (
    <form id="step-form" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} className="space-y-6">
      <div>
        <h2 className="text-headline-lg text-sovereign-navy">Récapitulatif</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Vérifiez les informations avant de valider l'enregistrement.
        </p>
      </div>

      {error && (
        <div className="bg-error-container text-error p-4 rounded-lg text-body-md font-medium border border-error/50">
          ⚠️ {error}
        </div>
      )}

      {/* Résumé enfant */}
      <SummarySection title="Nouveau-né" colorClass="bg-[#0B3C5D]">
        <SummaryField label="Nom complet" value={`${store.childData?.first_names ?? ''} ${store.childData?.last_name ?? ''} ${store.childData?.post_names ?? ''}`.replace(/\s+/g, ' ').trim() || 'Non renseigné'} />
        <SummaryField label="Date/heure de naissance" value={store.childData?.birth_datetime ?? 'Non renseigné'} />
        <SummaryField label="Sexe" value={store.childData?.gender ?? 'Non renseigné'} />
        <SummaryField label="Type de naissance" value={store.childData?.birth_type ?? 'SINGLE'} />
      </SummarySection>

      {/* Résumé père */}
      <SummarySection title="Père" colorClass="bg-[#089083]">
        {store.fatherUnknown ? (
          <div className="flex items-center gap-2 text-white/90">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-body-md">Père inconnu — ⚠️ À valider par l'autorité compétente</span>
          </div>
        ) : (
          <>
            <SummaryField label="Nom complet" value={`${store.fatherData?.first_names ?? ''} ${store.fatherData?.last_name ?? ''} ${store.fatherData?.post_names ?? ''}`.replace(/\s+/g, ' ').trim() || 'Non renseigné'} />
            <SummaryField label="Numéro d'Identité" value={store.fatherData?.nin ?? 'Non renseigné'} isId />
          </>
        )}
      </SummarySection>

      {/* Résumé mère */}
      <SummarySection title="Mère" colorClass="bg-[#F2A900]">
        {store.motherUnknown ? (
          <div className="flex items-center gap-2 text-white/90">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-body-md">Mère inconnue — ⚠️ À valider par l'autorité compétente</span>
          </div>
        ) : (
          <>
            <SummaryField label="Nom complet" value={`${store.motherData?.first_names ?? ''} ${store.motherData?.last_name ?? ''} ${store.motherData?.post_names ?? ''}`.replace(/\s+/g, ' ').trim() || 'Non renseigné'} />
            <SummaryField label="Numéro d'Identité" value={store.motherData?.nin ?? 'Non renseigné'} isId />
          </>
        )}
      </SummarySection>

      <div className="provisoire-banner">
        L'acte généré sera un document de PRÉ-ENREGISTREMENT. Il ne constitue pas
        un acte de naissance juridiquement valable sans validation officielle.
      </div>
    </form>
  );
}

function SummarySection({ title, children, colorClass }: { title: string; children: React.ReactNode; colorClass: string }) {
  return (
    <div className={`${colorClass} border-none rounded-xl p-4 space-y-3`}>
      <h3 className="text-headline-sm font-bold text-white">{title}</h3>
      {children}
    </div>
  );
}

function SummaryField({ label, value, isId }: { label: string; value: string; isId?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-label-lg text-white/80 min-w-[140px]">{label} :</span>
      <span className={`text-body-md text-white font-medium ${isId ? 'font-id' : ''}`}>{value}</span>
    </div>
  );
}
