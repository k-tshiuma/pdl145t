import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useBirthDraftStore } from '../../../stores/birth-draft.store';
import { AlertTriangle } from 'lucide-react';
import type { ParentFormData } from '../../../types';

const nameRegex = /^[A-Za-zÀ-ÿ\s-]+$/;
const noSpecialCharsRegex = /^[A-Za-zÀ-ÿ0-9\s-]*$/; // Lettres, chiffres, espaces, tirets

const parentSchema = z.object({
  nin: z.string().regex(/^\d{9}$/, 'Le numéro doit contenir exactement 9 chiffres').optional().or(z.literal('')),
  first_names: z.string()
    .min(2, 'Prénom(s) requis — minimum 2 caractères')
    .regex(nameRegex, 'Le prénom ne doit contenir que des lettres'),
  last_name: z.string()
    .min(2, 'Nom requis — minimum 2 caractères')
    .regex(nameRegex, 'Le nom ne doit contenir que des lettres'),
  post_names: z.string()
    .regex(nameRegex, 'Le post-nom ne doit contenir que des lettres')
    .optional().or(z.literal('')),
  birth_date: z.string().optional(),
  gender: z.enum(['M', 'F']).optional(),
  civil_status: z.enum(['marie', 'celibataire', 'divorce', 'veuf']).optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().regex(/^[\d\s+]*$/, 'Téléphone invalide').optional().or(z.literal('')),
  profession: z.string().regex(noSpecialCharsRegex, 'Caractères non autorisés').optional().or(z.literal('')),
  address_avenue: z.string().regex(noSpecialCharsRegex, 'Caractères non autorisés').optional().or(z.literal('')),
  address_number: z.string().regex(noSpecialCharsRegex, 'Caractères non autorisés').optional().or(z.literal('')),
  address_quarter_village: z.string().regex(noSpecialCharsRegex, 'Caractères non autorisés').optional().or(z.literal('')),
  address_commune_sector: z.string().regex(noSpecialCharsRegex, 'Caractères non autorisés').optional().or(z.literal('')),
  address_territory: z.string().regex(noSpecialCharsRegex, 'Caractères non autorisés').optional().or(z.literal('')),
  address_city: z.string().regex(noSpecialCharsRegex, 'Caractères non autorisés').optional().or(z.literal('')),
  address_province: z.string().regex(noSpecialCharsRegex, 'Caractères non autorisés').optional().or(z.literal('')),
});

interface ParentFormStepProps {
  parentType: 'father' | 'mother';
  onNext: () => void;
}

export function ParentFormStep({ parentType, onNext }: ParentFormStepProps) {
  const store = useBirthDraftStore();
  const isFather = parentType === 'father';
  const existingData = isFather ? store.fatherData : store.motherData;
  const existingId = isFather ? store.fatherId : store.motherId;

  const { register, handleSubmit, formState: { errors } } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
    defaultValues: existingData ?? {},
  });

  const handleUnknown = () => {
    if (isFather) {
      store.setFatherUnknown(true);
    } else {
      store.setMotherUnknown(true);
    }
    onNext();
  };

  const onSubmit = (data: ParentFormData) => {
    // Capitalize names
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
    const formattedData = {
      ...data,
      gender: isFather ? 'M' : 'F' as 'M' | 'F',
      first_names: data.first_names.split(' ').map(capitalize).join(' '),
      last_name: capitalize(data.last_name),
      post_names: data.post_names ? data.post_names.split(' ').map(capitalize).join(' ') : data.post_names,
    };

    if (isFather) {
      store.setFatherData(formattedData);
    } else {
      store.setMotherData(formattedData);
    }
    onNext();
  };

  const title = isFather ? 'Informations du père' : 'Informations de la mère';
  const unknownLabel = isFather ? 'Père inconnu' : 'Mère inconnue';

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-headline-lg text-sovereign-navy">{title}</h2>
        {existingId && (
          <p className="text-body-sm text-validation-jade mt-1">
            ✓ Parent trouvé dans le système — données pré-remplies
          </p>
        )}
      </div>

      {/* Bouton parent inconnu */}
      <div className="bg-surface-container-low border border-border-struct rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-golden-yellow" />
          <span className="text-body-sm text-on-surface-variant">
            ⚠️ Cas particulier — Procédure à valider par l'autorité compétente
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleUnknown}>
          {unknownLabel}
        </Button>
      </div>

      <form id="step-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Identité */}
        <div className="bg-[#0B3C5D] border-none rounded-xl p-4 space-y-3 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Identité</h3>

          <Input
            label="Numéro d'Identité"
            isIdField
            placeholder="123456789"
            error={errors.nin?.message}
            hint="⚠️ Format (9 chiffres) — À valider par l'autorité compétente"
            {...register('nin')}
          />

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
              error={errors.post_names?.message}
              {...register('post_names')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Date de naissance"
              type="date"
              {...register('birth_date')}
            />
            <Select
              label="État civil"
              options={[
                { value: 'celibataire', label: 'Célibataire' },
                { value: 'marie', label: 'Marié(e)' },
                { value: 'divorce', label: 'Divorcé(e)' },
                { value: 'veuf', label: 'Veuf/Veuve' },
              ]}
              placeholder="Sélectionner"
              {...register('civil_status')}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#089083] border-none rounded-xl p-4 space-y-3 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Téléphone" type="tel" {...register('phone')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Profession" {...register('profession')} />
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-[#F2A900] border-none rounded-xl p-4 space-y-3 [&_label]:!text-white [&_p]:!text-white/80">
          <h3 className="text-headline-sm font-bold text-white">Adresse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Avenue/Rue" {...register('address_avenue')} />
            <Input label="Numéro" {...register('address_number')} />
            <Input label="Quartier/Village" {...register('address_quarter_village')} />
            <Input label="Commune/Secteur" {...register('address_commune_sector')} />
            <Input label="Territoire" {...register('address_territory')} />
            <Input label="Ville" {...register('address_city')} />
            <Input label="Province" {...register('address_province')} />
          </div>
        </div>
      </form>
    </div>
  );
}
