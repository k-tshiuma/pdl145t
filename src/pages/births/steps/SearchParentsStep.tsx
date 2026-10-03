import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useBirthDraftStore } from '../../../stores/birth-draft.store';
import { api } from '../../../services/api';
import type { Parent, PaginatedResponse, ApiResponse } from '../../../types';

interface SearchParentsStepProps {
  onNext: () => void;
}

export function SearchParentsStep({ onNext }: SearchParentsStepProps) {
  const store = useBirthDraftStore();
  const [searchNin, setSearchNin] = useState('');
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState<Parent[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchNin) params.set('nin', searchNin);
      if (searchName) params.set('last_name', searchName);

      const { data } = await api.get<ApiResponse<PaginatedResponse<Parent>>>(`/parents?${params}`);
      setResults(data.data.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectParent = (parent: Parent, role: 'father' | 'mother') => {
    if (role === 'father') {
      store.setFatherId(parent.id);
      store.setFatherData({
        nin: parent.nin ?? undefined,
        first_names: parent.first_names,
        last_name: parent.last_name,
        post_names: parent.post_names ?? undefined,
        birth_date: parent.birth_date ?? undefined,
        gender: parent.gender ?? undefined,
      });
    } else {
      store.setMotherId(parent.id);
      store.setMotherData({
        nin: parent.nin ?? undefined,
        first_names: parent.first_names,
        last_name: parent.last_name,
        post_names: parent.post_names ?? undefined,
        birth_date: parent.birth_date ?? undefined,
        gender: parent.gender ?? undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg text-sovereign-navy">Recherche des parents</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Recherchez si les parents sont déjà enregistrés dans le système.
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="bg-white border border-border-struct rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Numéro d'Identité"
            isIdField
            placeholder="123456789"
            value={searchNin}
            onChange={(e) => setSearchNin(e.target.value)}
            hint="⚠️ Format (9 chiffres) — À valider par l'autorité compétente"
          />
          <Input
            label="Nom de famille"
            placeholder="Nom du parent"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <Button onClick={handleSearch} loading={loading} className="gap-2">
          <Search className="w-5 h-5" />
          Rechercher
        </Button>
      </div>

      {/* Résultats */}
      {searched && (
        <div className="space-y-3">
          <h3 className="text-headline-sm text-on-surface">
            {results.length} résultat{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}
          </h3>

          {results.map((parent) => (
            <div
              key={parent.id}
              className="bg-white border border-border-struct rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="text-body-lg font-semibold text-ink">
                  {parent.first_names} {parent.last_name}
                </p>
                {parent.nin && (
                  <p className="text-body-sm text-on-surface-variant font-id">Numéro d'Identité : {parent.nin}</p>
                )}
                {parent.birth_date && (
                  <p className="text-body-sm text-on-surface-variant">
                    Né(e) le {new Date(parent.birth_date).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { selectParent(parent, 'father'); onNext(); }}
                >
                  Père
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { selectParent(parent, 'mother'); onNext(); }}
                >
                  Mère
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton nouveau parent */}
      <div className="border-t border-border-struct pt-4 flex flex-col gap-3">
        <p className="text-body-sm text-on-surface-variant">
          Parent non trouvé ? Passez à l'étape suivante pour l'enregistrer.
        </p>
        <Button variant="info" onClick={onNext} className="gap-2">
          <UserPlus className="w-5 h-5" />
          Continuer sans recherche
        </Button>
      </div>
    </div>
  );
}
