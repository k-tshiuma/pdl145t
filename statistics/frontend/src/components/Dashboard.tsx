import React, { useEffect, useState, useRef } from 'react';
import { fetchKPIs, fetchGeo, fetchPyramid, fetchMapData, downloadCSV } from '../services/api';
import { Users, User, Baby, MapPin, Download, FileText } from 'lucide-react';
import AgePyramid from './AgePyramid';
import MapRDC from './MapRDC';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Dashboard() {
  const [kpi, setKpi] = useState({ population_totale: 0, hommes: 0, femmes: 0, enfants: 0 });
  const [geo, setGeo] = useState({ provinces: [], territoires: [] });
  const [pyramidData, setPyramidData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Filters
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('');

  // Dependent dropdowns
  const availableTerritories = geo.territoires.filter((t: any) => t.province_id === selectedProvince);

  const loadData = async () => {
    setLoading(true);
    try {
      const kpiData = await fetchKPIs(selectedProvince, selectedTerritory);
      const pyrData = await fetchPyramid(selectedProvince, selectedTerritory);
      setKpi(kpiData);
      setPyramidData(pyrData);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const geoData = await fetchGeo();
        const mapStats = await fetchMapData();
        setGeo(geoData);
        setMapData(mapStats);
      } catch (err) {}
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setSelectedTerritory('');
    }
    loadData();
  }, [selectedProvince, selectedTerritory]);

  const handleResetFilters = () => {
    setSelectedProvince('');
    setSelectedTerritory('');
  };

  const handleExportCSV = () => {
    downloadCSV(selectedProvince, selectedTerritory);
  };

  const handleExportPDF = async () => {
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('rapport_demographique.pdf');
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <aside className="w-80 border-r border-pdl-border bg-pdl-surface p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-pdl-primary flex items-center gap-2">Paramètres</h2>
          <button onClick={handleResetFilters} className="text-xs text-pdl-secondary hover:underline">Réinitialiser</button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-pdl-text-muted mb-2 tracking-widest uppercase">DÉCOUPAGE TERRITORIAL (PDL-145T)</label>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Province ({geo.provinces.length})</label>
              <select 
                className="w-full border border-pdl-border rounded p-2 text-sm focus:outline-none focus:border-pdl-primary"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">Toutes les provinces</option>
                {geo.provinces.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.province_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-pdl-text-muted">Territoire ({availableTerritories.length})</label>
              <select 
                className="w-full border border-pdl-border rounded p-2 text-sm focus:outline-none focus:border-pdl-primary disabled:bg-gray-100 disabled:opacity-50"
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                disabled={!selectedProvince}
              >
                <option value="">Tous les territoires</option>
                {availableTerritories.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-gray-50 border border-pdl-border rounded p-4 text-xs space-y-2">
            <p><strong>Base :</strong> pdl145t.db</p>
            <p><strong>Source :</strong> Données Centres de Santé</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto" ref={dashboardRef}>
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-pdl-primary">Tableau de bord de surveillance démographique nationale</h1>
            <p className="text-pdl-text-muted">
              Filtres actifs : {selectedProvince ? '1 Province' : 'National'} {selectedTerritory && '> 1 Territoire'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="flex items-center gap-1 bg-white border border-pdl-border px-3 py-2 text-sm font-semibold rounded hover:bg-gray-50 text-pdl-text">
              <FileText size={16} /> Rapport PDF
            </button>
            <button onClick={handleExportCSV} className="flex items-center gap-1 bg-white border border-pdl-border px-3 py-2 text-sm font-semibold rounded hover:bg-gray-50 text-pdl-text">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-pdl-text-muted animate-pulse">Synchronisation des données en cours...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <KPICard title="POPULATION TOTALE" value={kpi.population_totale} icon={<Users />} color="bg-pdl-primary" text="text-white" />
              <KPICard title="HOMMES (H)" value={kpi.hommes} icon={<User />} subtitle={kpi.population_totale > 0 ? `${((kpi.hommes / kpi.population_totale) * 100).toFixed(1)}% de la population` : '-'} />
              <KPICard title="FEMMES (F)" value={kpi.femmes} icon={<User className="text-pdl-secondary" />} subtitle={kpi.population_totale > 0 ? `${((kpi.femmes / kpi.population_totale) * 100).toFixed(1)}% de la population` : '-'} />
              <KPICard title="ENFANTS (< 15 ANS)" value={kpi.enfants} icon={<Baby />} subtitle="Nouveaux nés / Moins de 15 ans" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-pdl-surface border border-pdl-border rounded-lg p-4 flex flex-col">
                <h2 className="text-lg font-bold text-pdl-primary mb-4 flex items-center gap-2"><MapPin size={20} /> Cartographie Démographique RDC</h2>
                <div className="flex-1 min-h-[400px]">
                  <MapRDC data={mapData} selectedProvince={selectedProvince} />
                </div>
              </div>
              <div className="col-span-1 bg-pdl-surface border border-pdl-border rounded-lg p-4 flex flex-col">
                <h2 className="text-lg font-bold text-pdl-primary mb-4">Pyramide des Âges</h2>
                <div className="flex-1">
                  <AgePyramid data={pyramidData} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, subtitle, color = "bg-white", text = "text-pdl-text" }: any) {
  return (
    <div className={`${color} ${text} p-5 rounded-lg border border-pdl-border shadow-sm flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold tracking-wider opacity-80">{title}</span>
        <div className="opacity-70">{icon}</div>
      </div>
      <div>
        <div className="text-stat-value-lg font-bold">
          {new Intl.NumberFormat('fr-FR').format(value)}
        </div>
        {subtitle && <div className="text-xs opacity-70 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
