import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { RadioGroup } from '../../../components/ui/RadioGroup';

import { useBirthDraftStore } from '../../../stores/birth-draft.store';

const nameRegex = /^[A-Za-zÀ-ÿ\s-]+$/;
const noSpecialCharsRegex = /^[A-Za-zÀ-ÿ0-9\s-]*$/;

const childSchema = z.object({
  first_names: z.string()
    .min(2, 'Prénom(s) requis — minimum 2 caractères')
    .regex(nameRegex, 'Le prénom ne doit contenir que des lettres'),
  last_name: z.string()
    .min(2, 'Nom requis — minimum 2 caractères')
    .regex(nameRegex, 'Le nom ne doit contenir que des lettres'),
  post_names: z.string()
    .regex(nameRegex, 'Le post-nom ne doit contenir que des lettres')
    .optional().or(z.literal('')),
  birth_datetime: z.string().min(1, 'Date de naissance requise'),
  birth_place: z.string()
    .regex(noSpecialCharsRegex, 'Caractères non autorisés')
    .optional().or(z.literal('')),
  gender: z.enum(['M', 'F', 'INDETERMINE'], { required_error: 'Sexe requis' }),
  birth_type: z.enum(['SINGLE', 'TWIN', 'TRIPLET', 'OTHER']).optional(),
  birth_order: z.string().transform(Number).optional(),
});

interface ChildInfoStepProps {
  onNext: () => void;
}

export function ChildInfoStep({ onNext }: ChildInfoStepProps) {
  const store = useBirthDraftStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(childSchema),
    defaultValues: {
      ...store.childData,
      birth_order: store.childData?.birth_order?.toString() ?? '1',
    },
  });

  const birthType = watch('birth_type');

  const onSubmit = (data: any) => {
    // Capitalize names
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
    const formattedData = {
      ...data,
      first_names: data.first_names.split(' ').map(capitalize).join(' '),
      last_name: capitalize(data.last_name),
      post_names: data.post_names ? data.post_names.split(' ').map(capitalize).join(' ') : data.post_names,
    };
    store.setChildData(formattedData);
    onNext();
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-headline-lg text-sovereign-navy">Informations du nouveau-né</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Enregistrez les données d'identification de l'enfant.
        </p>
      </div>

      <form id="step-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Identité */}
        <div className="bg-[#0B3C5D] border-none rounded-xl p-4 space-y-3 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Identité</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Prénom(s)"
              required
              error={errors.first_names?.message}
              {...register('first_names')}
            />
            <Input
              label="Nom"
              required
              error={errors.last_name?.message}
              {...register('last_name')}
            />
            <Input
              label="Post-nom(s)"
              {...register('post_names')}
            />
          </div>

          <RadioGroup
            label="Sexe"
            required
            options={[
              { value: 'M', label: 'Masculin' },
              { value: 'F', label: 'Féminin' },
              { value: 'INDETERMINE', label: 'Indéterminé' },
            ]}
            error={errors.gender?.message}
            {...register('gender')}
          />
        </div>

        {/* Naissance */}
        <div className="bg-[#32B8C6] border-none rounded-xl p-4 space-y-3 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Naissance</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Date et heure de naissance"
              type="datetime-local"
              required
              error={errors.birth_datetime?.message}
              {...register('birth_datetime')}
            />
            <Input
              label="Lieu de naissance"
              placeholder="Nom du centre ou de la localité"
              {...register('birth_place')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RadioGroup
              label="Type de naissance"
              options={[
                { value: 'SINGLE', label: 'Unique' },
                { value: 'TWIN', label: 'Jumeaux' },
                { value: 'TRIPLET', label: 'Triplés' },
                { value: 'OTHER', label: 'Autre' },
              ]}
              {...register('birth_type')}
            />
            {birthType !== 'SINGLE' && (
              <Input
                label="Ordre de naissance"
                type="number"
                min={1}
                max={10}
                hint="Position parmi les jumeaux/triplés"
                {...register('birth_order')}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
