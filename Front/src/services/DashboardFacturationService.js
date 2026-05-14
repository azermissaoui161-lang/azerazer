
import api from './api';

/**
 * Récupère les données complètes du dashboard avec filtrage par période
 * @param {string|number} period - Nombre de jours (7, 30, 90, etc.)
 */
const getDashboard = async (period = '30') => {
  // On ajoute ?period=X à la fin de l'URL
  const response = await api.get(`/dashboard/facture?period=${period}`);
  return response.data;
};

/**
 * Récupère uniquement les KPIs avec filtrage par période
 * @param {string|number} period
 */
const getKpiFacture = async (period = '30') => {
  const response = await api.get(`/dashboard/facture/kpi-facture?period=${period}`);
  return response.data;
};

export default {
  getDashboard,
  getKpiFacture,
};