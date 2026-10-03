import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Baby,
  Users,
  FileText,
  Download,
  Plus,
  ShieldCheck,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface BirthRecord {
  birth_id: string;
  birth_status: 'DRAFT' | 'IN_PROGRESS' | 'VALIDATED' | 'CANCELLED';
  registration_date: string;
  validated_at?: string;
  child_id: string;
  child_nin: string | null;
  child_system_id: string | null;
  child_first_names: string;
  child_last_name: string;
  child_post_names: string | null;
  child_full_name: string;
  birth_datetime: string;
  birth_place: string | null;
  child_gender: 'M' | 'F' | 'INDETERMINE' | null;
  birth_type: string;
  birth_order: number;
  certificate_id?: string;
  certificate_number?: string | null;
  certificate_status?: string;
  certificate_legal_status?: string;
  father_id?: string | null;
  father_first_names?: string;
  father_last_name?: string;
  father_nin?: string | null;
  father_full_name?: string;
  mother_id?: string | null;
  mother_first_names?: string;
  mother_last_name?: string;
  mother_nin?: string | null;
  mother_full_name?: string;
  health_center_name?: string | null;
}

export function BirthsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [births, setBirths] = useState<BirthRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALIDATED' | 'DRAFT'>('ALL');

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }
      const response = await api.get(`/births?${params.toString()}`);
      if (response.data?.success) {
        setBirths(response.data.data || []);
      } else {
        setBirths([]);
      }
      setSearched(true);
    } catch (err: any) {
      console.error('Erreur recherche dossiers de naissance:', err);
      setError('Impossible de charger les dossiers de naissance.');
      setBirths([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ search: query.trim() });
    } else {
      setSearchParams({});
    }
    performSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
    performSearch('');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadPDF = async (birthId: string) => {
    try {
      const response = await api.get(`/births/${birthId}/certificate/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `acte_naissance_${birthId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
    }
  };

  const filteredBirths = births.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.birth_status === statusFilter;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-lg text-sovereign-navy font-bold flex items-center gap-2">
            <Baby className="w-8 h-8 text-congo-azure" />
            Dossiers de Naissance & Nouveau-nés
          </h2>
          <p className="text-body-md text-secondary-text mt-1">
            Recherche par Numéro d'Identité National (NIN à 9 chiffres), prénom ou nom de famille.
          </p>
        </div>
        <Button onClick={() => navigate('/births/new')} className="gap-2 shrink-0">
          <Plus className="w-5 h-5" />
          Nouvel enregistrement
        </Button>
      </div>

      {/* Search Bar Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par NIN (ex: 123456789), prénom ou nom de famille..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button type="submit" loading={loading} className="gap-2 flex-1 sm:flex-initial">
            <Search className="w-4 h-4" />
            Rechercher
          </Button>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Effacer
            </button>
          )}
        </div>
      </form>

      {/* Tabs and Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-sovereign-navy text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous les dossiers ({births.length})
          </button>
          <button
            onClick={() => setStatusFilter('VALIDATED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'VALIDATED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Validés ({births.filter((b) => b.birth_status === 'VALIDATED').length})
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'DRAFT'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En attente / Brouillons ({births.filter((b) => b.birth_status === 'DRAFT').length})
          </button>
        </div>

        {searched && query && (
          <p className="text-xs text-slate-600">
            Résultats pour &laquo; <strong className="text-slate-900">{query}</strong> &raquo; :{' '}
            <span className="font-bold text-blue-700">{filteredBirths.length}</span> nouveau-né(s)
          </p>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16 text-slate-500 animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Recherche des dossiers en cours...</p>
        </div>
      )}

      {/* Empty results */}
      {!loading && searched && filteredBirths.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Baby className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Aucun nouveau-né trouvé</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Aucun dossier ne correspond à votre recherche &laquo; {query} &raquo;. Assurez-vous d'avoir saisi
            le NIN à 9 chiffres exact, le prénom ou le nom de famille.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="secondary" onClick={handleClear} size="sm">
              Réinitialiser la recherche
            </Button>
            <Button onClick={() => navigate('/births/new')} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Créer un enregistrement
            </Button>
          </div>
        </div>
      )}

      {/* Results List */}
      {!loading && filteredBirths.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredBirths.map((b) => {
            const isMale = b.child_gender === 'M';
            const genderLabel = isMale ? 'Garçon' : b.child_gender === 'F' ? 'Fille' : 'Indéterminé';
            const statusColor =
              b.birth_status === 'VALIDATED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300';
            const statusText = b.birth_status === 'VALIDATED' ? 'Enregistrement Validé' : 'Brouillon en cours';

            return (
              <div
                key={b.birth_id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Top Row: Name, NIN, and Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {b.child_full_name?.trim() || `${b.child_first_names} ${b.child_last_name}`}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          isMale
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-pink-50 text-pink-800 border-pink-200'
                        }`}
                      >
                        {genderLabel}
                      </span>
                    </div>

                    {/* NIN and System ID badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {b.child_nin && (
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1 rounded-lg">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-slate-600">NIN Nouveau-né :</span>
                          <span className="text-sm font-mono font-bold tracking-wider text-blue-900">
                            {b.child_nin}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(b.child_nin!, `nin-${b.child_id}`)}
                            className="text-slate-400 hover:text-blue-700 p-0.5 rounded transition-colors"
                            title="Copier le NIN"
                          >
                            {copiedField === `nin-${b.child_id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {b.child_system_id && (
                        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                          ID : {b.child_system_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Cert Number */}
                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor}`}>
                      {statusText}
                    </span>
                    {b.certificate_number && (
                      <span className="text-xs font-mono text-slate-500 font-medium">
                        {b.certificate_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Naissance */}
                  <div className="space-y-1">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Date & Heure
                    </p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {b.birth_datetime
                        ? new Date(b.birth_datetime).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Non renseignée'}
                    </p>
                    <p className="text-slate-500">{b.birth_type === 'SINGLE' ? 'Naissance simple' : 'Naissance multiple'}</p>
                  </div>

                  {/* Centre de santé / Lieu */}
                  <div className="space-y-1">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Lieu de naissance
                    </p>
                    <p className="font-semibold text-slate-800 text-sm">
                      {b.birth_place || 'Maternité Centrale'}
                    </p>
                    <p className="text-slate-500 truncate" title={b.health_center_name || ''}>
                      {b.health_center_name || 'Centre de santé de référence'}
                    </p>
                  </div>

                  {/* Père */}
                  <div className="space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-teal-600" /> Père
                    </p>
                    <p className="font-bold text-slate-800">
                      {b.father_full_name || (b.father_first_names ? `${b.father_first_names} ${b.father_last_name}` : 'Père non renseigné')}
                    </p>
                    {b.father_nin ? (
                      <Link
                        to={`/parents?search=${encodeURIComponent(b.father_nin)}`}
                        className="text-[11px] font-mono font-medium text-congo-azure hover:underline block"
                      >
                        NIN : {b.father_nin} &rarr;
                      </Link>
                    ) : (
                      <p className="text-[11px] text-slate-400">NIN non précisé</p>
                    )}
                  </div>

                  {/* Mère */}
                  <div className="space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-600" /> Mère
                    </p>
                    <p className="font-bold text-slate-800">
                      {b.mother_full_name || (b.mother_first_names ? `${b.mother_first_names} ${b.mother_last_name}` : 'Mère non renseignée')}
                    </p>
                    {b.mother_nin ? (
                      <Link
                        to={`/parents?search=${encodeURIComponent(b.mother_nin)}`}
                        className="text-[11px] font-mono font-medium text-congo-azure hover:underline block"
                      >
                        NIN : {b.mother_nin} &rarr;
                      </Link>
                    ) : (
                      <p className="text-[11px] text-slate-400">NIN non précisé</p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Enregistré le{' '}
                      {b.registration_date ? new Date(b.registration_date).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.birth_status === 'VALIDATED' && (
                      <button
                        onClick={() => handleDownloadPDF(b.birth_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold rounded-lg text-xs transition-colors border border-blue-200"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        Télécharger l'acte (PDF)
                      </button>
                    )}

                    {(b.father_nin || b.mother_nin) && (
                      <Link
                        to={`/parents?search=${encodeURIComponent(b.father_nin || b.mother_nin || '')}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Fiche famille
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BirthsPage;
