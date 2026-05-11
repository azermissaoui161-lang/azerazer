import api from './api';

const getDashboard = async () => {
  const response = await api.get('/dashboard/facture');
  return response.data;
};

const getKpiFacture = async () => {
  const response = await api.get('/dashboard/facture/kpi-facture');
  return response.data;
};

export default {
  getDashboard,
  getKpiFacture,
};
