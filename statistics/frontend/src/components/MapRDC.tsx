import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapRDC({ data, selectedProvince }: { data: any[], selectedProvince: string }) {
  const [geoJson, setGeoJson] = useState<any>(null);

  useEffect(() => {
    // Dans un environnement de production hors-ligne, ce fichier sera mis en cache par le Service Worker.
    // Vous devez placer le fichier "rdc_provinces.geojson" dans le dossier "public".
    fetch('/rdc_provinces.geojson')
      .then(res => res.json())
      .then(data => setGeoJson(data))
      .catch(err => console.error("GeoJSON non trouvé. Veuillez ajouter rdc_provinces.geojson dans public/", err));
  }, []);

  const getProvinceStat = (provinceName: string) => {
    return data.find(p => p.province_name?.toLowerCase() === provinceName?.toLowerCase());
  };

  const style = (feature: any) => {
    const provinceName = feature.properties.name;
    const stat = getProvinceStat(provinceName);
    
    // Si la province est sélectionnée, on la met en surbrillance (Or PDL-145T)
    const isSelected = selectedProvince && stat?.id === selectedProvince;

    // Calcul bidon de couleur en fonction de la population pour la carte choroplèthe
    const population = stat ? stat.parents_count : 0;
    const fillColor = isSelected ? '#D97706' :
                      population > 50 ? '#0B3056' :
                      population > 10 ? '#3B82F6' :
                      population > 0  ? '#93C5FD' : '#E2E8F0';

    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: isSelected ? 0.9 : 0.7
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const provinceName = feature.properties.name;
    const stat = getProvinceStat(provinceName);
    
    layer.bindTooltip(`
      <div class="text-sm">
        <strong class="text-pdl-primary">${provinceName}</strong><br/>
        Population enregistrée: ${stat ? stat.parents_count : 'Données non dispo'}
      </div>
    `, { sticky: true });
  };

  // Coordonnées centrales de la RDC
  const center: [number, number] = [-4.0383, 21.7587];
  const zoom = 5;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJson && (
          <GeoJSON 
            data={geoJson} 
            style={style} 
            onEachFeature={onEachFeature} 
          />
        )}
      </MapContainer>
      
      {!geoJson && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-[1000] rounded-lg">
          <div className="text-center p-4 border border-pdl-border bg-white rounded shadow-sm">
            <p className="text-pdl-danger font-semibold mb-2">Fichier GeoJSON manquant</p>
            <p className="text-xs text-pdl-text-muted">Placez `rdc_provinces.geojson` dans le dossier `public/`</p>
          </div>
        </div>
      )}
    </div>
  );
}
