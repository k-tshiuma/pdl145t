import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Set up Axios interceptor for JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { username, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const fetchKPIs = async (province_id?: string, territory_id?: string) => {
  const params = { province_id, territory_id };
  const response = await axios.get(`${API_URL}/stats/kpi`, { params });
  return response.data;
};

export const fetchGeo = async () => {
  const response = await axios.get(`${API_URL}/stats/geo`);
  return response.data;
};

export const fetchPyramid = async (province_id?: string, territory_id?: string) => {
  const params = { province_id, territory_id };
  const response = await axios.get(`${API_URL}/stats/pyramid`, { params });
  return response.data;
};

export const fetchMapData = async () => {
  const response = await axios.get(`${API_URL}/stats/map`);
  return response.data;
};

export const downloadCSV = async (province_id?: string, territory_id?: string) => {
  const params = { province_id, territory_id, format: 'csv' };
  const response = await axios.get(`${API_URL}/stats/export`, { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'statistiques.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

