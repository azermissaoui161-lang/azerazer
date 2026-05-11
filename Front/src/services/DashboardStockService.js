import api from './api';

const getDashboard = async (period = '30') => {
  // Zid el period houni bch i-t-ba3th f-el query string
  const response = await api.get(`/dashboard/stock/kpi-stock?period=${period}`);
  return response.data;
};

export default { getDashboard };
