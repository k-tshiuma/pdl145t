import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  User,
  Users,
  Baby,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Download,
  Plus,
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  Heart,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface ChildRecord {
  id: string;
  system_id: string | null;
  first_names: string;
  last_name: string;
  post_names: string | null;
  full_name: string;
  birth_datetime: string;
  birth_place: string | null;
  gender: 'M' | 'F' | 'INDETERMINE' | null;
  birth_type: string;
  birth_order: number;
  birth_id?: string;
  birth_status?: string;
  certificate_id?: string;
  certificate_number?: string | null;
  other_parent_name?: string | null;
}

interface SpouseInfo {
  id?: string;
  nin?: string | null;
  first_names?: string;
  last_name?: string;
  post_names?: string | null;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  profession?: string | null;
  civil_status?: string | null;
  relationship?: string;
}

interface ParentDetails {
  id: string;
  nin: string | null;
  first_names: string;
  last_name: string;
  post_names: string | null;
  full_name: string;
  birth_date: string | null;
  gender: 'M' | 'F' | null;
  civil_status: string | null;
  email: string | null;
  phone: string | null;
  profession: string | null;
  address_avenue: string | null;
  address_number: string | null;
  address_city?: string | null;
  address_province?: string | null;
  spouse: SpouseInfo | null;
  children: ChildRecord[];
  children_count: number;
  created_at: string;
}

export function ParentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [parent, setParent] = useState<ParentDetails | null>(null);
  const [multipleResults, setMultipleResults] = useState<ParentDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setParent(null);
    setMultipleResults([]);

    try {
      const response = await api.get('/parents', {
        params: { search: searchTerm.trim() },
      });

      const list: ParentDetails[] = response.data?.data?.data || [];

      if (list.length === 0) {
        setParent(null);
      } else if (list.length === 1) {
        // Direct full view
        setParent(list[0]);
      } else {
        // Check for exact NIN match
        const exactMatch = list.find((p) => p.nin?.trim() === searchTerm.trim());
        if (exactMatch) {
          setParent(exactMatch);
        } else {
          setMultipleResults(list);
        }
      }
    } catch (err: any) {
      console.error('Error fetching parent:', err);
      setError(err?.response?.data?.error?.message || 'Erreur lors de la recherche du parent.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ search: query.trim() });
    performSearch(query.trim());
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const calculateAge = (birthDateString: string | null) => {
    if (!birthDateString) return null;
    const birth = new Date(birthDateString);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const downloadAct = async (birthId?: string, childName?: string) => {
    if (!birthId) return;
    try {
      const response = await api.get(`/births/${birthId}/certificate/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `acte_naissance_${childName || birthId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] pb-16">
      {/* Top Banner with Sovereign styling */}
      <div className="bg-sovereign-navy text-white relative shadow-sm border-b border-white/10">
        <div className="absolute top-0 left-0 w-full h-1 flex">
          <div className="flex-1 bg-republican-crimson"></div>
          <div className="flex-1 bg-golden-yellow"></div>
          <div className="flex-1 bg-congo-azure"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-200 uppercase tracking-wider mb-1 font-semibold">
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Tableau de bord
                </Link>
                <span>•</span>
                <span>Registre National d'Identité des Parents (PDL-145T)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fiche Parentale & Filiation</h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Consultation de la fiche individuelle, filiation, conjoint(e) et actes des enfants rattachés.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
                className="bg-white/10 text-white hover:bg-white/20 gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimer</span>
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/births/new')}
                className="bg-gradient-pink-red text-white gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Naissance</span>
              </Button>
            </div>
          </div>

          {/* Search bar inside header */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Entrez le numéro d'identité (NIN ex: 327086583), nom ou prénom..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white text-gray-900 rounded-xl border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-congo-azure text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-congo-azure hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
            </button>
          </form>

          {/* Quick example chip */}
          <div className="mt-2.5 flex items-center gap-2 text-xs text-blue-200">
            <span className="opacity-80">Recherche rapide :</span>
            <button
              type="button"
              onClick={() => {
                setQuery('327086583');
                setSearchParams({ search: '327086583' });
                performSearch('327086583');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] transition-colors border border-white/15"
            >
              <Sparkles className="w-3 h-3 text-golden-yellow" />
              <span>NIN: 327086583 (Patrick Kapuya Tshiuma)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-soft border border-slate-200/80 max-w-lg mx-auto">
            <div className="w-12 h-12 border-4 border-congo-azure border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-800">Recherche dans le Registre National...</h3>
            <p className="text-sm text-slate-500 mt-1">Interrogation de la base PDL-145T pour {query}</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm max-w-2xl mx-auto mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Not found state */}
        {!loading && searched && !parent && multipleResults.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-soft border border-slate-200 max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Aucun parent trouvé</h3>
              <p className="text-sm text-slate-500 mt-1">
                Aucun enregistrement ne correspond au numéro ou nom <span className="font-semibold text-slate-800">« {query} »</span>.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuery('327086583');
                  setSearchParams({ search: '327086583' });
                  performSearch('327086583');
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                Tester avec le parent témoin (327086583)
              </button>
              <Button onClick={() => navigate('/births/new')} className="w-full sm:w-auto text-xs">
                Enregistrer ce parent dans un dossier
              </Button>
            </div>
          </div>
        )}

        {/* Multiple results found */}
        {!loading && multipleResults.length > 1 && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {multipleResults.length} résultats trouvés pour « {query} »
              </h2>
              <span className="text-xs text-slate-500">Sélectionnez un parent pour ouvrir la fiche</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {multipleResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setParent(p)}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-congo-azure hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-sovereign-navy text-white font-bold flex items-center justify-center text-sm">
                      {p.first_names?.charAt(0)}
                      {p.last_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-congo-azure transition-colors">
                        {p.first_names} {p.last_name} {p.post_names || ''}
                      </h3>
                      <p className="text-xs font-mono text-slate-500">NIN: {p.nin || 'Non renseigné'}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Téléphone : {p.phone || 'Non renseigné'}</p>
                    <p>Enfants : {p.children_count || p.children?.length || 0}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-congo-azure font-medium">
                    <span>Consulter la fiche</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Parent Detail Card */}
        {!loading && parent && (
          <div className="space-y-6">
            {/* Action Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sovereign-navy to-[#1a3a60] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white">
                    {parent.first_names?.charAt(0)}
                    {parent.last_name?.charAt(0)}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white"
                    title="Identité vérifiée"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Parent Enregistré
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Réf: {parent.gender === 'M' ? 'Père' : 'Mère'}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {parent.first_names} {parent.last_name} {parent.post_names || ''}
                  </h2>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-slate-500">Numéro d'Identité Nationale (NIN) :</span>
                    <span className="font-mono font-bold text-base text-sovereign-navy bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      {parent.nin || 'Non renseigné'}
                    </span>
                    {parent.nin && (
                      <button
                        onClick={() => copyToClipboard(parent.nin!, 'nin')}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                        title="Copier le NIN"
                      >
                        {copiedField === 'nin' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Pill & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/births/new')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-pink-red text-white text-xs font-bold hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une naissance</span>
                </button>
              </div>
            </div>

            {/* Two Column Grid: Parent Details + Spouse */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Full Parent Details (2 spans) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Information Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-base font-bold text-sovereign-navy flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <User className="w-5 h-5 text-congo-azure" />
                    <span>Détails & Informations Civiles</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoTile
                      icon={<Calendar className="w-4 h-4 text-slate-500" />}
                      label="Date de naissance & Âge"
                      value={
                        parent.birth_date
                          ? `${new Date(parent.birth_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })} ${calculateAge(parent.birth_date) ? `(${calculateAge(parent.birth_date)} ans)` : ''}`
                          : 'Non renseigné'
                      }
                    />

                    <InfoTile
                      icon={<User className="w-4 h-4 text-slate-500" />}
                      label="Sexe"
                      value={
                        parent.gender === 'M'
                          ? 'Masculin (Homme)'
                          : parent.gender === 'F'
                          ? 'Féminin (Femme)'
                          : 'Indéterminé'
                      }
                    />

                    <InfoTile
                      icon={<Heart className="w-4 h-4 text-slate-500" />}
                      label="État Civil"
                      value={
                        parent.civil_status === 'marie'
                          ? 'Marié(e)'
                          : parent.civil_status === 'celibataire'
                          ? 'Célibataire'
                          : parent.civil_status === 'divorce'
                          ? 'Divorcé(e)'
                          : parent.civil_status === 'veuf'
                          ? 'Veuf/Veuve'
                          : parent.civil_status || 'Non précisé'
                      }
                      badge={
                        parent.civil_status === 'marie'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }
                    />

                    <InfoTile
                      icon={<Briefcase className="w-4 h-4 text-slate-500" />}
                      label="Profession"
                      value={parent.profession || 'Non renseignée'}
                    />

                    <InfoTile
                      icon={<Phone className="w-4 h-4 text-slate-500" />}
                      label="Numéro de Téléphone"
                      value={parent.phone || 'Non renseigné'}
                      isLink={parent.phone ? `tel:${parent.phone}` : undefined}
                    />

                    <InfoTile
                      icon={<Mail className="w-4 h-4 text-slate-500" />}
                      label="Adresse Email"
                      value={parent.email || 'Non renseignée'}
                      isLink={parent.email ? `mailto:${parent.email}` : undefined}
                    />

                    <div className="sm:col-span-2">
                      <InfoTile
                        icon={<MapPin className="w-4 h-4 text-slate-500" />}
                        label="Adresse Résidentielle"
                        value={
                          parent.address_avenue
                            ? `Avenue ${parent.address_avenue}${
                                parent.address_number ? `, N° ${parent.address_number}` : ''
                              } ${parent.address_city ? `— ${parent.address_city}` : ''} ${
                                parent.address_province ? `(${parent.address_province})` : ''
                              }`
                            : 'Non renseignée'
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Children Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Baby className="w-5 h-5 text-congo-azure" />
                      <h3 className="text-base font-bold text-sovereign-navy">
                        Enfants Rattachés ({parent.children?.length || 0})
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      Filiation certifiée
                    </span>
                  </div>

                  {(!parent.children || parent.children.length === 0) ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Baby className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-600">Aucun enfant actuellement rattaché</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Utilisez le workflow de maternité pour enregistrer une nouvelle naissance.
                      </p>
                      <button
                        onClick={() => navigate('/births/new')}
                        className="mt-3 px-4 py-1.5 text-xs font-semibold bg-congo-azure text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Enregistrer une naissance
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {parent.children.map((child, idx) => (
                        <div
                          key={child.id || idx}
                          className="p-4 rounded-xl border border-slate-200/90 bg-gradient-to-r from-white to-slate-50/50 hover:border-congo-azure transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shrink-0 ${
                                child.gender === 'F' ? 'bg-gradient-pink-red' : 'bg-gradient-blue'
                              }`}
                            >
                              {child.first_names?.charAt(0) || 'E'}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-base">
                                  {child.first_names} {child.last_name} {child.post_names || ''}
                                </h4>
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                    child.gender === 'F'
                                      ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  {child.gender === 'F' ? 'Fille' : child.gender === 'M' ? 'Garçon' : 'Indéterminé'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-600">
                                <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                                  <span className="text-slate-400 font-sans font-normal">ID :</span>
                                  <span>{child.system_id || 'ID-PROVISOIRE'}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>
                                    {child.birth_datetime
                                      ? new Date(child.birth_datetime).toLocaleDateString('fr-FR', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : 'Date non renseignée'}
                                  </span>
                                </div>

                                {child.birth_place && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{child.birth_place}</span>
                                  </div>
                                )}
                              </div>

                              {child.other_parent_name && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Autre parent : <span className="font-medium text-slate-700">{child.other_parent_name}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Child actions */}
                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            {child.birth_id ? (
                              <button
                                type="button"
                                onClick={() => downloadAct(child.birth_id, child.first_names)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-congo-azure hover:text-congo-azure text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
                                title="Télécharger l'Acte de Naissance officiel"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Acte PDF</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Acte en cours</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Spouse Card + Verification Info */}
              <div className="space-y-6">
                {/* Spouse Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h3 className="text-base font-bold text-sovereign-navy flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <span>Conjoint(e) / Filiation</span>
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium">
                      Lien direct
                    </span>
                  </div>

                  {parent.spouse ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-pink-red text-white flex items-center justify-center font-bold text-base shadow-sm">
                          {parent.spouse.first_names?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base leading-tight">
                            {parent.spouse.full_name}
                          </h4>
                          <p className="text-xs text-rose-600 font-semibold mt-0.5">
                            {parent.spouse.relationship || 'Mère des enfants / Conjointe'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
                        {parent.spouse.nin && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">NIN Conjoint(e) :</span>
                            <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              {parent.spouse.nin}
                            </span>
                          </div>
                        )}

                        {parent.spouse.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Téléphone :</span>
                            <a
                              href={`tel:${parent.spouse.phone}`}
                              className="font-medium text-congo-azure hover:underline"
                            >
                              {parent.spouse.phone}
                            </a>
                          </div>
                        )}

                        {parent.spouse.profession && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Profession :</span>
                            <span className="font-medium text-slate-800">{parent.spouse.profession}</span>
                          </div>
                        )}

                        {parent.spouse.civil_status && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Statut Civil :</span>
                            <span className="font-medium text-slate-800 capitalize">{parent.spouse.civil_status}</span>
                          </div>
                        )}
                      </div>

                      {parent.spouse.nin && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery(parent.spouse!.nin!);
                            setSearchParams({ search: parent.spouse!.nin! });
                            performSearch(parent.spouse!.nin!);
                          }}
                          className="w-full mt-2 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Voir la fiche de {parent.spouse.first_names || 'la conjointe'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                      <Heart className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="font-medium text-slate-700">Aucun conjoint formellement rattaché</p>
                      <p className="mt-1">
                        Statut : <span className="font-semibold">{parent.civil_status || 'Célibataire'}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Official Certificate Warning Notice */}
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <FileText className="w-4 h-4" />
                    <span>Valeur Juridique (RDC)</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    Cette fiche consolidée regroupe les données civiles issues du Programme de Développement Local des 145
                    Territoires (PDL-145T) sous le contrôle du Ministère de la Santé et des Officiers d'État Civil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  isLink,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: string;
  badge?: string;
}) {
  return (
    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {isLink ? (
          <a
            href={isLink}
            className="text-sm font-semibold text-congo-azure hover:underline truncate max-w-full"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm font-semibold text-slate-900 truncate max-w-full">{value}</span>
        )}
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

export default ParentPage;
