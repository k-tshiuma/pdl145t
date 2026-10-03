import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapRDC({ data, selectedProvince }: { data: any[]; selectedProvince: string }) {
  const [geoJson, setGeoJson] = useState<any>(null);

  useEffect(() => {
    fetch('/rdc_provinces.geojson')
      .then((res) => res.json())
      .then((geoData) => setGeoJson(geoData))
      .catch((err) =>
        console.error('GeoJSON non trouvé. Veuillez ajouter rdc_provinces.geojson dans public/', err)
      );
  }, []);

  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '');

  const getProvinceStat = (provinceName: string) => {
    if (!provinceName) return null;
    const target = clean(provinceName);
    return data.find((p) => clean(p.province_name || '') === target);
  };

  const style = (feature: any) => {
    const provinceName = feature.properties.name || feature.properties.shapeName;
    const stat = getProvinceStat(provinceName);

    // Selected province highlight
    const isSelected = selectedProvince && stat?.id === selectedProvince;

    const population = stat?.population || stat?.parents_count || 0;

    // Population choropleth gradient (Geo-Ref 2020: 1.3M to 14.5M)
    const fillColor = isSelected
      ? '#D97706'
      : population >= 10000000
      ? '#0A2540' // > 10M (Kinshasa)
      : population >= 6000000
      ? '#1D4ED8' // 6M - 10M (Nord-Kivu, Sud-Kivu, Kongo-Central, Kwilu)
      : population >= 3500000
      ? '#3B82F6' // 3.5M - 6M (Haut-Katanga, Ituri, Kasaï-Central, Kasaï-Oriental...)
      : population >= 2000000
      ? '#60A5FA' // 2M - 3.5M (Maniema, Tshopo, Lualaba, Lomami...)
      : population > 0
      ? '#93C5FD' // < 2M (Bas-Uélé, Équateur, Nord-Ubangi, Tshuapa)
      : '#E2E8F0';

    return {
      fillColor,
      weight: isSelected ? 2.5 : 1,
      opacity: 1,
      color: isSelected ? '#78350F' : 'white',
      fillOpacity: isSelected ? 0.92 : 0.78,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const provinceName = feature.properties.name || feature.properties.shapeName;
    const stat = getProvinceStat(provinceName);

    const popStr = stat?.population
      ? new Intl.NumberFormat('fr-FR').format(stat.population) + ' habitants'
      : 'Population non disponible';
    const areaStr = stat?.area_km2
      ? new Intl.NumberFormat('fr-FR').format(stat.area_km2) + ' km²'
      : null;
    const densityStr = stat?.density ? `${stat.density} hab/km²` : null;
    const capitalStr = stat?.capital ? `Chef-lieu : ${stat.capital}` : null;

    layer.bindTooltip(
      `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 170px; padding: 6px 8px;">
        <div style="font-weight: 800; font-size: 14px; color: #0b3056; margin-bottom: 4px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 3px;">
          ${provinceName}
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #1d4ed8; margin-top: 2px;">
          👥 ${popStr}
        </div>
        ${densityStr ? `<div style="font-size: 11px; color: #334155; margin-top: 2px;">⚡ Densité : <strong>${densityStr}</strong></div>` : ''}
        ${areaStr ? `<div style="font-size: 11px; color: #64748b; margin-top: 1px;">📐 Superficie : ${areaStr}</div>` : ''}
        ${capitalStr ? `<div style="font-size: 11px; color: #475569; margin-top: 1px;">🏛️ ${capitalStr}</div>` : ''}
      </div>
    `,
      { sticky: true, opacity: 0.96 }
    );
  };

  // Central coordinates for DRC
  const center: [number, number] = [-4.0383, 21.7587];
  const zoom = 5;

  return (
    <div className="h-full w-full relative flex flex-col">
      <div className="flex-1 min-h-[420px] rounded-lg overflow-hidden border border-slate-200">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoJson && <GeoJSON data={geoJson} style={style} onEachFeature={onEachFeature} key={selectedProvince} />}
        </MapContainer>
      </div>

      {/* Population Choropleth Legend (Geo-Ref 2020) */}
      <div className="mt-3 p-3 bg-white/95 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span>Population par Province (RDC 2020) :</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#0A2540] inline-block shadow-xs"></span>
            <span className="font-medium text-slate-700">&gt; 10M (Kinshasa)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#1D4ED8] inline-block shadow-xs"></span>
            <span className="font-medium text-slate-700">6M – 10M</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#3B82F6] inline-block shadow-xs"></span>
            <span className="font-medium text-slate-700">3.5M – 6M</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#60A5FA] inline-block shadow-xs"></span>
            <span className="font-medium text-slate-700">2M – 3.5M</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-[#93C5FD] inline-block shadow-xs"></span>
            <span className="font-medium text-slate-700">&lt; 2M</span>
          </div>
        </div>
      </div>
    </div>
  );
}
