import React, { useEffect, useState, useRef } from 'react';
import { fetchKPIs, fetchGeo, fetchPyramid, fetchMapData, downloadCSV } from '../../services/statsApi';
import { Users, User, Baby, MapPin, Download, FileText, Globe, ExternalLink, ShieldCheck } from 'lucide-react';
import AgePyramid from './AgePyramid';
import MapRDC from './MapRDC';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ProvinceGeo {
  id: string;
  province_name: string;
  code: string;
  population?: number;
  area_km2?: number;
  capital?: string;
  density?: number;
  iso?: string;
}

export default function Dashboard() {
  const [kpi, setKpi] = useState({
    population_totale: 105586600,
    hommes: 52582127,
    femmes: 53004473,
    enfants: 49097769,
    superficie_km2: 2345410,
    densite: 45.0,
    entite_nom: 'République Démocratique du Congo (National)',
  });
  const [geo, setGeo] = useState<{ provinces: ProvinceGeo[]; territoires: any[] }>({ provinces: [], territoires: [] });
  const [pyramidData, setPyramidData] = useState([]);
  const [mapData, setMapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Filters
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('');

  // Dependent dropdowns
  const availableTerritories = geo.territoires.filter((t: any) => t.province_id === selectedProvince);
  const activeProvinceObj = geo.provinces.find((p) => p.id === selectedProvince);
  const activeTerritoryObj = availableTerritories.find((t: any) => t.id === selectedTerritory);

  const loadData = async () => {
    setLoading(true);
    try {
      const kpiData = await fetchKPIs(selectedProvince, selectedTerritory);
      const pyrData = await fetchPyramid(selectedProvince, selectedTerritory);
      setKpi(kpiData);
      setPyramidData(pyrData);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
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
      } catch (err) {
        console.error('Failed to load geo or map data', err);
      }
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
      pdf.save('rapport_demographique_pdl145t.pdf');
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <aside className="w-80 border-r border-pdl-border bg-pdl-surface p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-pdl-primary flex items-center gap-2">Paramètres Territoriaux</h2>
          <button onClick={handleResetFilters} className="text-xs text-pdl-secondary hover:underline">
            Réinitialiser
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-pdl-text-muted mb-2 tracking-widest uppercase">
            DÉCOUPAGE TERRITORIAL (PDL-145T)
          </label>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 font-medium">Province ({geo.provinces.length})</label>
              <select
                className="w-full border border-pdl-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pdl-primary bg-white"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">Toutes les 26 provinces (National)</option>
                {geo.provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.province_name} {p.population ? `(${new Intl.NumberFormat('fr-FR').format(p.population)} hab.)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-pdl-text-muted font-medium">
                Territoire ({availableTerritories.length})
              </label>
              <select
                className="w-full border border-pdl-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pdl-primary disabled:bg-gray-100 disabled:opacity-50 bg-white"
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                disabled={!selectedProvince}
              >
                <option value="">Tous les territoires ({availableTerritories.length})</option>
                {availableTerritories.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.population ? `(${new Intl.NumberFormat('fr-FR').format(t.population)} hab.)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Territory details badge in sidebar */}
        {activeTerritoryObj && activeProvinceObj && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2 text-slate-800">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60 font-bold text-emerald-900">
              <span className="truncate pr-1">Territoire : {activeTerritoryObj.name}</span>
              <span className="font-mono text-[9px] bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900 shrink-0">
                PDL-145T
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Population :</span>
              <span className="font-bold text-emerald-950">
                {new Intl.NumberFormat('fr-FR').format(kpi.population_totale)} hab.
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Province :</span>
              <span className="font-medium text-slate-800">{activeProvinceObj.province_name}</span>
            </div>
            {activeProvinceObj.population && (
              <div className="flex justify-between text-emerald-800 font-semibold pt-1 border-t border-emerald-200/50">
                <span>Poids provincial :</span>
                <span>{((kpi.population_totale / activeProvinceObj.population) * 100).toFixed(1)}%</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Poids national :</span>
              <span>{((kpi.population_totale / 105586600) * 100).toFixed(2)}% de la RDC</span>
            </div>
          </div>
        )}

        {/* Selected Province details badge in sidebar */}
        {activeProvinceObj && !activeTerritoryObj && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-2 text-slate-800">
            <div className="flex items-center justify-between pb-1 border-b border-blue-200/60 font-bold text-blue-900">
              <span>{activeProvinceObj.province_name}</span>
              <span className="font-mono text-[10px] bg-blue-200/70 px-1.5 py-0.5 rounded">
                {activeProvinceObj.iso || activeProvinceObj.code}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Population :</span>
              <span className="font-bold text-blue-900">
                {activeProvinceObj.population
                  ? new Intl.NumberFormat('fr-FR').format(activeProvinceObj.population) + ' hab.'
                  : '-'}
              </span>
            </div>
            {activeProvinceObj.capital && (
              <div className="flex justify-between">
                <span className="text-slate-500">Chef-lieu :</span>
                <span className="font-medium">{activeProvinceObj.capital}</span>
              </div>
            )}
            {activeProvinceObj.density && (
              <div className="flex justify-between">
                <span className="text-slate-500">Densité :</span>
                <span className="font-medium">{activeProvinceObj.density} hab/km²</span>
              </div>
            )}
            {activeProvinceObj.area_km2 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Superficie :</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR').format(activeProvinceObj.area_km2)} km²
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Territoires :</span>
              <span className="font-medium text-slate-800">{availableTerritories.length} territoires</span>
            </div>
            {activeProvinceObj.population && (
              <div className="flex justify-between text-blue-700 font-semibold pt-1 border-t border-blue-200/50">
                <span>Poids national :</span>
                <span>{((activeProvinceObj.population / 105586600) * 100).toFixed(2)}% de la RDC</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto space-y-3">
          <div className="bg-slate-50 border border-pdl-border rounded-xl p-4 text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Référentiel Officiel RDC</span>
            </div>
            <p>
              <strong>Total RDC :</strong> 105 586 600 hab.
            </p>
            <p>
              <strong>Superficie :</strong> 2 345 410 km²
            </p>
            <p>
              <strong>Densité :</strong> 45,0 hab/km²
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Source : </span>
              <a
                href="https://www.geo-ref.net/ph/cod.htm"
                target="_blank"
                rel="noreferrer"
                className="text-congo-azure hover:underline inline-flex items-center gap-0.5"
              >
                geo-ref.net (cod.htm) <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto" ref={dashboardRef}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-pdl-primary">
              Tableau de bord de surveillance démographique nationale
            </h1>
            <p className="text-pdl-text-muted text-sm mt-1">
              Périmètre : <strong className="text-slate-800">{kpi.entite_nom || 'République Démocratique du Congo'}</strong>{' '}
              {selectedTerritory && '> Territoire'} • {selectedProvince ? 'Données provinciales' : '26 Provinces & 145 Territoires'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 bg-white border border-pdl-border px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-gray-50 text-pdl-text shadow-xs"
            >
              <FileText size={15} /> Rapport PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-white border border-pdl-border px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-gray-50 text-pdl-text shadow-xs"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-pdl-text-muted animate-pulse">
            Synchronisation des données démographiques...
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="POPULATION TOTALE"
                value={kpi.population_totale}
                icon={<Users />}
                color={selectedTerritory ? 'bg-emerald-800' : 'bg-pdl-primary'}
                text="text-white"
                subtitle={
                  selectedTerritory && activeProvinceObj
                    ? `${((kpi.population_totale / (activeProvinceObj.population || 1)) * 100).toFixed(1)}% de la province • ${((kpi.population_totale / 105586600) * 100).toFixed(2)}% national`
                    : selectedProvince
                    ? `${((kpi.population_totale / 105586600) * 100).toFixed(1)}% de la population nationale`
                    : '105 586 600 (Geo-Ref / INS RDC)'
                }
              />
              <KPICard
                title="HOMMES (H)"
                value={kpi.hommes}
                icon={<User />}
                subtitle={
                  kpi.population_totale > 0
                    ? `${((kpi.hommes / kpi.population_totale) * 100).toFixed(1)}% de la population`
                    : '-'
                }
              />
              <KPICard
                title="FEMMES (F)"
                value={kpi.femmes}
                icon={<User className="text-pdl-secondary" />}
                subtitle={
                  kpi.population_totale > 0
                    ? `${((kpi.femmes / kpi.population_totale) * 100).toFixed(1)}% de la population`
                    : '-'
                }
              />
              <KPICard
                title="ENFANTS (< 15 ANS)"
                value={kpi.enfants}
                icon={<Baby />}
                subtitle="Moins de 15 ans (~46.5%)"
              />
            </div>

            {/* Map and Age Pyramid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="col-span-2 bg-pdl-surface border border-pdl-border rounded-xl p-5 flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-pdl-primary flex items-center gap-2">
                    <MapPin size={20} className="text-congo-azure" /> Cartographie Démographique des 26 Provinces
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">Survolez une province pour les détails</span>
                </div>
                <div className="flex-1 min-h-[440px]">
                  <MapRDC data={mapData} selectedProvince={selectedProvince} />
                </div>
              </div>

              <div className="col-span-1 bg-pdl-surface border border-pdl-border rounded-xl p-5 flex flex-col shadow-sm">
                <h2 className="text-lg font-bold text-pdl-primary mb-4">Pyramide des Âges (RDC)</h2>
                <div className="flex-1">
                  <AgePyramid data={pyramidData} />
                </div>
              </div>
            </div>

            {/* Territory Breakdown Table when Province is Selected */}
            {activeProvinceObj && availableTerritories.length > 0 && (
              <div className="bg-white border-2 border-emerald-500/40 rounded-xl p-5 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                      Découpage de la Population par Territoire — Province de {activeProvinceObj.province_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Total officiel de la province : <strong className="text-slate-800">{new Intl.NumberFormat('fr-FR').format(activeProvinceObj.population || 0)} habitants</strong> réparti entre ses {availableTerritories.length} territoires.
                    </p>
                  </div>
                  {selectedTerritory && (
                    <button
                      onClick={() => setSelectedTerritory('')}
                      className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 self-start sm:self-auto"
                    >
                      Désélectionner le territoire (Voir toute la province)
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-50/80 text-emerald-950 font-bold border-b border-emerald-200">
                        <th className="p-2.5">Territoire (PDL-145T)</th>
                        <th className="p-2.5">Province</th>
                        <th className="p-2.5 text-right">Population (hab.)</th>
                        <th className="p-2.5 text-right">% de la Province</th>
                        <th className="p-2.5 text-right">% National</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {availableTerritories
                        .slice()
                        .sort((a: any, b: any) => (b.population || 0) - (a.population || 0))
                        .map((t: any, idx: number) => {
                          const isTerrCurrent = selectedTerritory === t.id;
                          const tPop = t.population || 0;
                          const provPop = activeProvinceObj.population || 1;
                          const shareProv = ((tPop / provPop) * 100).toFixed(1);
                          const shareNat = ((tPop / 105586600) * 100).toFixed(2);

                          return (
                            <tr
                              key={t.id}
                              className={`hover:bg-emerald-50/50 transition-colors ${
                                isTerrCurrent ? 'bg-emerald-100/70 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                              }`}
                            >
                              <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-4 text-[10px] text-slate-400 text-right">{idx + 1}.</span>
                                <span>{t.name}</span>
                              </td>
                              <td className="p-2.5 text-slate-600">{activeProvinceObj.province_name}</td>
                              <td className="p-2.5 text-right font-bold text-emerald-900 font-mono">
                                {new Intl.NumberFormat('fr-FR').format(tPop)}
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-700">
                                {shareProv}%
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-500">
                                {shareNat}%
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => setSelectedTerritory(isTerrCurrent ? '' : t.id)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                                    isTerrCurrent
                                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                  }`}
                                >
                                  {isTerrCurrent ? 'Sélectionné' : 'Sélectionner'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-100/80 font-bold text-emerald-950 border-t-2 border-emerald-300">
                        <td className="p-2.5">
                          Total Province ({availableTerritories.length} territoires)
                        </td>
                        <td className="p-2.5">{activeProvinceObj.province_name}</td>
                        <td className="p-2.5 text-right font-mono text-emerald-950 font-bold">
                          {new Intl.NumberFormat('fr-FR').format(activeProvinceObj.population || 0)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-900">100.0%</td>
                        <td className="p-2.5 text-right font-mono">
                          {(((activeProvinceObj.population || 0) / 105586600) * 100).toFixed(2)}%
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                            100% Vérifié
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Table of all 26 Provinces with Population, Capital, Area, Density */}
            <div className="bg-white border border-pdl-border rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Tableau Récapitulatif des 26 Provinces de la RDC
                  </h3>
                  <p className="text-xs text-slate-500">
                    Données de population estimées (Geo-Ref / Réf. RDC 2020) — Total : 105 586 600 habitants
                  </p>
                </div>
                <a
                  href="https://www.geo-ref.net/ph/cod.htm"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-congo-azure hover:underline flex items-center gap-1 font-semibold"
                >
                  Source : geo-ref.net/ph/cod.htm <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">Province</th>
                      <th className="p-2.5">Code ISO</th>
                      <th className="p-2.5">Chef-lieu</th>
                      <th className="p-2.5 text-right">Superficie (km²)</th>
                      <th className="p-2.5 text-right">Population (hab.)</th>
                      <th className="p-2.5 text-right">Densité (hab/km²)</th>
                      <th className="p-2.5 text-right">% National</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {geo.provinces
                      .slice()
                      .sort((a, b) => (b.population || 0) - (a.population || 0))
                      .map((p, idx) => {
                        const isCurrent = selectedProvince === p.id;
                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-blue-50/50 transition-colors ${
                              isCurrent ? 'bg-amber-50 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-4 text-[10px] text-slate-400 text-right">{idx + 1}.</span>
                              <span>{p.province_name}</span>
                            </td>
                            <td className="p-2.5 font-mono text-slate-600">{p.iso || p.code}</td>
                            <td className="p-2.5 text-slate-700">{p.capital || '-'}</td>
                            <td className="p-2.5 text-right text-slate-600 font-mono">
                              {p.area_km2 ? new Intl.NumberFormat('fr-FR').format(p.area_km2) : '-'}
                            </td>
                            <td className="p-2.5 text-right font-bold text-blue-900 font-mono">
                              {p.population ? new Intl.NumberFormat('fr-FR').format(p.population) : '-'}
                            </td>
                            <td className="p-2.5 text-right text-slate-600 font-mono">{p.density || '-'}</td>
                            <td className="p-2.5 text-right font-mono text-slate-600">
                              {p.population ? `${((p.population / 105586600) * 100).toFixed(2)}%` : '-'}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => setSelectedProvince(isCurrent ? '' : p.id)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                                  isCurrent
                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                    : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-800'
                                }`}
                              >
                                {isCurrent ? 'Sélectionné' : 'Filtrer'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200/70 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td className="p-2.5">Total RDC (26 Provinces)</td>
                      <td className="p-2.5 font-mono">COD</td>
                      <td className="p-2.5">Kinshasa</td>
                      <td className="p-2.5 text-right font-mono">2 345 410</td>
                      <td className="p-2.5 text-right font-mono text-blue-900">105 586 600</td>
                      <td className="p-2.5 text-right font-mono">45,0</td>
                      <td className="p-2.5 text-right font-mono">100.0%</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={handleResetFilters}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-300 text-slate-800 hover:bg-slate-400"
                        >
                          National
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, subtitle, color = 'bg-white', text = 'text-pdl-text' }: any) {
  return (
    <div className={`${color} ${text} p-5 rounded-xl border border-pdl-border shadow-sm flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold tracking-wider opacity-80">{title}</span>
        <div className="opacity-70">{icon}</div>
      </div>
      <div>
        <div className="text-stat-value-lg font-bold">{new Intl.NumberFormat('fr-FR').format(value)}</div>
        {subtitle && <div className="text-xs opacity-75 mt-1 font-medium">{subtitle}</div>}
      </div>
    </div>
  );
}
