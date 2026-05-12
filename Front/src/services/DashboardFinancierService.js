import api from './api';

/**
 * Récupère les données du dashboard financier (KPIs, Recettes, Dépenses)
 * @param {string|number} period - Le nombre de jours à filtrer (ex: 7, 30, 90, 365)
 */
const getDashboard = async (period = '30') => {
  // On passe la période en query parameter pour que le backend puisse filtrer
  const response = await api.get(`/dashboard/finance/kpi-finance?period=${period}`);
  return response.data;
};

export default {
  getDashboard,
};