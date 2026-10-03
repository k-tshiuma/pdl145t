import api from './api';

export const fetchKPIs = async (province_id?: string, territory_id?: string) => {
  const params = { province_id, territory_id };
  const response = await api.get('/stats/kpi', { params });
  return response.data;
};

export const fetchGeo = async () => {
  const response = await api.get('/stats/geo');
  return response.data;
};

export const fetchPyramid = async (province_id?: string, territory_id?: string) => {
  const params = { province_id, territory_id };
  const response = await api.get('/stats/pyramid', { params });
  return response.data;
};

export const fetchMapData = async () => {
  const response = await api.get('/stats/map');
  return response.data;
};

export const downloadCSV = async (province_id?: string, territory_id?: string) => {
  const params = { province_id, territory_id, format: 'csv' };
  const response = await api.get('/stats/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'statistiques_pdl145t.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
