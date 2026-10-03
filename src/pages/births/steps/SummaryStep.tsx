import { useBirthDraftStore } from '../../../stores/birth-draft.store';
import { api } from '../../../services/api';
import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Étape 7 : Récapitulatif — Revue complète avant validation.
 */
export function SummaryStep() {
  const store = useBirthDraftStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      // 1. S'assurer qu'un birthId valide existe (le créer si absent)
      let currentBirthId = store.birthId;
      if (!currentBirthId) {
        try {
          const resDraft = await api.post('/births/draft', {});
          currentBirthId = resDraft.data?.data?.id;
          if (currentBirthId) {
            store.setBirthId(currentBirthId);
          }
        } catch {
          currentBirthId = crypto.randomUUID();
          store.setBirthId(currentBirthId);
        }
      }

      // 2. Traitement du père (existant ou nouveau)
      let finalFatherId = store.fatherId;
      if (!store.fatherUnknown && !finalFatherId && store.fatherData) {
        const res = await api.post('/parents', store.fatherData);
        finalFatherId = res.data?.data?.id;
        if (finalFatherId) {
          store.setFatherId(finalFatherId);
        }
      }

      // 3. Traitement de la mère (existante ou nouvelle)
      let finalMotherId = store.motherId;
      if (!store.motherUnknown && !finalMotherId && store.motherData) {
        const res = await api.post('/parents', store.motherData);
        finalMotherId = res.data?.data?.id;
        if (finalMotherId) {
          store.setMotherId(finalMotherId);
        }
      }

      // 4. Validation finale et création de l'enfant + acte de naissance
      const response = await api.post(`/births/${currentBirthId}/confirm`, {
        child: {
          first_names: store.childData?.first_names ?? '',
          last_name: store.childData?.last_name ?? '',
          post_names: store.childData?.post_names,
          birth_datetime: store.childData?.birth_datetime ?? new Date().toISOString(),
          birth_place: store.childData?.birth_place || 'Maternité Centrale',
          gender: store.childData?.gender || 'F',
          birth_type: store.childData?.birth_type ?? 'SINGLE',
          birth_order: store.childData?.birth_order ?? 1,
          father_id: finalFatherId,
          mother_id: finalMotherId,
          father_unknown: store.fatherUnknown,
          mother_unknown: store.motherUnknown,
        },
        province_code: 'KIN',
      });

      if (response.data?.data?.child) {
        store.setChildData({
          ...store.childData!,
          system_id: response.data.data.child.system_id,
          nin: response.data.data.child.nin,
        });
      }

      // 5. Passer à l'étape finale (certificat)
      store.nextStep();
    } catch (err: any) {
      console.error('Erreur lors de la validation du dossier:', err);
      const serverMsg = err?.response?.data?.error?.message;
      setError(serverMsg || err?.message || 'Erreur lors de la validation du dossier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      id="step-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleConfirm();
      }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-headline-lg text-sovereign-navy">Récapitulatif</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Vérifiez les informations avant de valider l'enregistrement.
        </p>
      </div>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Validation de l'enregistrement en cours...</p>
            <p className="text-xs text-blue-700">Création de l'identifiant national et génération de l'acte officiel provisoire.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error-container text-error p-4 rounded-lg text-body-md font-medium border border-error/50 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Échec de la validation :</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Résumé enfant */}
      <SummarySection title="Nouveau-né" colorClass="bg-[#0B3C5D]">
        <SummaryField
          label="Nom complet"
          value={
            `${store.childData?.first_names ?? ''} ${store.childData?.last_name ?? ''} ${store.childData?.post_names ?? ''}`
              .replace(/\s+/g, ' ')
              .trim() || 'Non renseigné'
          }
        />
        <SummaryField
          label="Date/heure de naissance"
          value={store.childData?.birth_datetime ?? 'Non renseigné'}
        />
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
            <SummaryField
              label="Nom complet"
              value={
                `${store.fatherData?.first_names ?? ''} ${store.fatherData?.last_name ?? ''} ${store.fatherData?.post_names ?? ''}`
                  .replace(/\s+/g, ' ')
                  .trim() || 'Non renseigné'
              }
            />
            <SummaryField
              label="Numéro d'Identité"
              value={store.fatherData?.nin ?? 'Non renseigné'}
              isId
            />
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
            <SummaryField
              label="Nom complet"
              value={
                `${store.motherData?.first_names ?? ''} ${store.motherData?.last_name ?? ''} ${store.motherData?.post_names ?? ''}`
                  .replace(/\s+/g, ' ')
                  .trim() || 'Non renseigné'
              }
            />
            <SummaryField
              label="Numéro d'Identité"
              value={store.motherData?.nin ?? 'Non renseigné'}
              isId
            />
          </>
        )}
      </SummarySection>

      <div className="provisoire-banner">
        L'acte généré sera un document de PRÉ-ENREGISTREMENT. Il ne constitue pas un acte de naissance
        juridiquement valable sans validation officielle.
      </div>
    </form>
  );
}

function SummarySection({
  title,
  children,
  colorClass,
}: {
  title: string;
  children: React.ReactNode;
  colorClass: string;
}) {
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
