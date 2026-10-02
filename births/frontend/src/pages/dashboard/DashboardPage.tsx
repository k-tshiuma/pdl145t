import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../../components/ui/Button';
import { Baby, Users, FileText, BarChart3, Plus } from 'lucide-react';
import api from '../../services/api';

/**
 * Tableau de bord principal — point d'entrée après connexion.
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState({
    birthsThisMonth: null as number | null,
    parentsRegistered: null as number | null,
    certificatesGenerated: null as number | null,
    certificatesDraft: null as number | null
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data?.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques', error);
      }
    }
    fetchStats();
  }, []);

  const canCreate = user?.roleName === 'AGENT_SANTE' ||
                    user?.roleName === 'SAGE_FEMME' ||
                    user?.roleName === 'ADMIN_NATIONAL';

  const formatStat = (val: number | null) => val !== null ? val.toString() : '—';

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-headline-lg text-primary-text font-bold">
          Tableau De Bord
        </h2>
        <p className="text-body-md text-secondary-text mt-1">
          Bienvenue, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
        </p>
      </div>

      {/* Action principale */}
      {canCreate && (
        <div className="bg-white rounded-3xl p-5 shadow-soft">
          <Button
            size="lg"
            fullWidth
            onClick={() => navigate('/births/new')}
            className="gap-2"
          >
            <Plus className="w-6 h-6" />
            Nouvel enregistrement de naissance
          </Button>
        </div>
      )}

      {/* Cartes statistiques rapides */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<Baby className="w-5 h-5" />}
          label="Naissances ce mois"
          value={formatStat(stats.birthsThisMonth)}
          bgClass="bg-gradient-pink-red"
          textClass="text-[#F0506E]"
          borderClass="border-[#F0506E]"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Parents enregistrés"
          value={formatStat(stats.parentsRegistered)}
          bgClass="bg-gradient-teal"
          textClass="text-[#2AA9B8]"
          borderClass="border-[#2AA9B8]"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Actes générés"
          value={formatStat(stats.certificatesGenerated)}
          bgClass="bg-gradient-orange"
          textClass="text-[#FF9224]"
          borderClass="border-[#FF9224]"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="En attente"
          value={formatStat(stats.certificatesDraft)}
          bgClass="bg-gradient-blue"
          textClass="text-[#3B7DFF]"
          borderClass="border-[#3B7DFF]"
        />
      </div>

      {/* Raccourcis (Recherches) */}
      <div className="grid grid-cols-1 gap-4">
        <SearchCard
          title="Rechercher un parent"
          description="Par numéro d'identité, nom ou prénom"
          onSearch={(q) => navigate(`/parents?search=${encodeURIComponent(q)}`)}
        />
        <SearchCard
          title="Dossiers en cours"
          description="Par numéro d'identité, nom ou prénom"
          onSearch={(q) => navigate(`/births?search=${encodeURIComponent(q)}`)}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgClass, textClass, borderClass }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-none flex justify-between items-center">
      <div className="flex flex-col gap-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${bgClass}`}>
          {icon}
        </div>
        <p className="text-body-sm text-secondary-text font-medium">{label}</p>
      </div>
      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${borderClass}`}>
        <span className={`text-2xl font-bold ${textClass}`}>{value}</span>
      </div>
    </div>
  );
}

function SearchCard({ title, description, onSearch }: {
  title: string;
  description: string;
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState('');
  
  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-none flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="md:w-[280px] shrink-0">
        <h3 className="text-headline-sm text-primary-text font-semibold">{title}</h3>
        <p className="text-body-sm text-secondary-text mt-1">{description}</p>
      </div>
      <div className="flex-1 flex gap-3">
        <input 
          type="text" 
          className="flex-1 border border-gray-300 rounded-full px-5 py-3 outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-body-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} className="px-8 shrink-0">
          Rechercher
        </Button>
      </div>
    </div>
  );
}
