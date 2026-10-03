import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { RadioGroup } from '../../../components/ui/RadioGroup';

import { useBirthDraftStore } from '../../../stores/birth-draft.store';
import { AlertCircle } from 'lucide-react';

interface VaccinesCareStepProps {
  onNext: () => void;
}

/**
 * Étape 6 : Vaccins et soins préventifs
 *
 * ⚠️ IMPORTANT — Design system rule :
 * La Vitamine K doit être affichée dans la section "Soins préventifs"
 * et NON dans la section "Vaccins".
 * Le banner suivant DOIT être affiché :
 * "La vitamine K est un soin préventif et non un vaccin."
 */
export function VaccinesCareStep({ onNext }: VaccinesCareStepProps) {
  const store = useBirthDraftStore();

  const { register, handleSubmit } = useForm({
    defaultValues: store.vaccinesData ?? {},
  });

  const onSubmit = (data: Record<string, unknown>) => {
    store.setVaccinesData(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg text-sovereign-navy">Vaccins et soins préventifs</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Enregistrement des vaccins administrés et des soins préventifs initiaux.
        </p>
      </div>

      <div className="provisoire-banner">
        Les protocoles médicaux (produits, doses, délais) doivent être validés
        par le Ministère de la Santé RDC avant toute mise en production.
      </div>

      <form id="step-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Section Vaccins */}
        <div className="bg-[#0B3C5D] border-none rounded-xl p-4 space-y-4 [&_label]:!text-white [&_p]:!text-white">
          <h3 className="text-headline-sm font-bold text-white">Vaccins</h3>

          {/* Hépatite B */}
          <div className="space-y-3 border-b border-white/20 pb-4">
            <p className="text-body-lg font-semibold">Hépatite B</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RadioGroup
                label="Administré"
                options={[
                  { value: 'yes', label: 'Oui' },
                  { value: 'no', label: 'Non' },
                ]}
                {...register('hepatitis_b_administered')}
              />
              <Input
                label="Date et heure d'administration"
                type="datetime-local"
                {...register('hepatitis_b_date')}
              />
            </div>
            <Input
              label="Numéro de lot"
              placeholder="Traçabilité pharmacovigilance"
              {...register('hepatitis_b_batch')}
            />
            <Input
              label="Si non administré, raison"
              {...register('hepatitis_b_reason')}
            />
          </div>

          {/* BCG */}
          <div className="space-y-3">
            <p className="text-body-lg font-semibold">BCG</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RadioGroup
                label="Administré"
                options={[
                  { value: 'yes', label: 'Oui' },
                  { value: 'no', label: 'Non' },
                ]}
                {...register('bcg_administered')}
              />
              <Input
                label="Date d'administration"
                type="date"
                {...register('bcg_date')}
              />
            </div>
            <Input
              label="Numéro de lot"
              {...register('bcg_batch')}
            />
          </div>
        </div>

        {/* Section Soins préventifs — SÉPARÉE des vaccins */}
        <div className="bg-[#089083] border-none rounded-xl p-4 space-y-4 [&_label]:!text-white [&_p]:!text-white">
          <h3 className="text-headline-sm font-bold text-white">Soins préventifs</h3>

          {/* ⚠️ Banner OBLIGATOIRE (DESIGN.md rule) */}
          <div className="bg-white/20 border border-white/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <p className="text-body-sm text-white font-medium">
              La vitamine K est un soin préventif et non un vaccin.
            </p>
          </div>

          {/* Vitamine K */}
          <div className="space-y-3 border-b border-white/20 pb-4">
            <p className="text-body-lg font-semibold">Vitamine K</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RadioGroup
                label="Administrée"
                options={[
                  { value: 'yes', label: 'Oui' },
                  { value: 'no', label: 'Non' },
                ]}
                {...register('vitamin_k_administered')}
              />
              <Input
                label="Date et heure"
                type="datetime-local"
                {...register('vitamin_k_date')}
              />
            </div>
            <Input
              label="Produit utilisé"
              {...register('vitamin_k_product')}
            />
          </div>

          {/* Pommade ophtalmique */}
          <div className="space-y-3">
            <p className="text-body-lg font-semibold">Pommade ophtalmique</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RadioGroup
                label="Administrée"
                options={[
                  { value: 'yes', label: 'Oui' },
                  { value: 'no', label: 'Non' },
                ]}
                {...register('ophthalmic_administered')}
              />
              <Input
                label="Date et heure"
                type="datetime-local"
                {...register('ophthalmic_date')}
              />
            </div>
            <Input
              label="Notes"
              {...register('ophthalmic_notes')}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
