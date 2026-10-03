import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { RadioGroup } from '../../../components/ui/RadioGroup';

import { useBirthDraftStore } from '../../../stores/birth-draft.store';

interface ClinicalExamStepProps {
  onNext: () => void;
}

/**
 * Étape 5 : Examen clinique du nouveau-né
 *
 * ⚠️ AVERTISSEMENT MÉDICAL :
 * Aucun seuil clinique n'est imposé par ce formulaire.
 * L'interprétation des résultats est de la responsabilité exclusive
 * du professionnel de santé qualifié.
 */
export function ClinicalExamStep({ onNext }: ClinicalExamStepProps) {
  const store = useBirthDraftStore();

  const { register, handleSubmit } = useForm({
    defaultValues: store.clinicalData ?? {},
  });

  const onSubmit = (data: Record<string, unknown>) => {
    store.setClinicalData(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg text-sovereign-navy">Examen clinique</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Résultats de l'examen clinique du nouveau-né.
        </p>
      </div>

      {/* Avertissement médical */}
      <div className="provisoire-banner">
        Les seuils cliniques et protocoles médicaux doivent être validés par le Ministère de la Santé RDC.
        Ce formulaire enregistre uniquement les données brutes sans interprétation automatique.
      </div>

      <form id="step-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Examen physique général */}
        <div className="bg-[#0B3C5D] border-none rounded-xl p-4 space-y-4 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Examen physique général</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RadioGroup
              label="Réalisé"
              options={[
                { value: 'yes', label: 'Oui' },
                { value: 'no', label: 'Non' },
              ]}
              {...register('physical_exam_done')}
            />
            <Input
              label="Date et heure de l'examen"
              type="datetime-local"
              {...register('exam_date')}
            />
          </div>
          <Input
            label="Professionnel ayant réalisé l'examen"
            {...register('exam_professional')}
          />
          <Input
            label="Observations / Résultats"
            {...register('physical_exam_notes')}
          />
        </div>

        {/* Score d'Apgar */}
        <div className="bg-[#089083] border-none rounded-xl p-4 space-y-4 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Score d'Apgar</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Apgar à 1 minute"
              type="number"
              min={0}
              max={10}
              placeholder="0-10"
              {...register('apgar_1min')}
            />
            <Input
              label="Apgar à 5 minutes"
              type="number"
              min={0}
              max={10}
              placeholder="0-10"
              {...register('apgar_5min')}
            />
          </div>
          <Input
            label="Notes Apgar"
            placeholder="Observations..."
            {...register('apgar_notes')}
          />
        </div>

        {/* Groupe sanguin */}
        <div className="bg-[#F2A900] border-none rounded-xl p-4 space-y-4 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Groupe sanguin</h3>
          <div className="grid grid-cols-2 gap-4">
            <RadioGroup
              label="Groupe"
              options={[
                { value: 'A', label: 'A' },
                { value: 'B', label: 'B' },
                { value: 'AB', label: 'AB' },
                { value: 'O', label: 'O' },
                { value: 'UNKNOWN', label: 'Non déterminé' },
              ]}
              {...register('blood_group')}
            />
            <RadioGroup
              label="Rhésus"
              options={[
                { value: 'POS', label: 'Rh+' },
                { value: 'NEG', label: 'Rh-' },
                { value: 'UNKNOWN', label: 'Non déterminé' },
              ]}
              {...register('blood_rhesus')}
            />
          </div>
        </div>

        {/* Oxymétrie de pouls */}
        <div className="bg-[#6D615C] border-none rounded-xl p-4 space-y-4 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Oxymétrie de pouls</h3>
          <Input
            label="SpO₂ (%)"
            type="number"
            min={0}
            max={100}
            placeholder="ex: 97"
            {...register('pulse_oximetry_value')}
          />
          <Input
            label="Notes"
            {...register('pulse_oximetry_notes')}
          />
        </div>
      </form>
    </div>
  );
}
