import api from './api';

const getDashboard = async () => {
  const response = await api.get('/dashboard/stock/kpi-stock');
  return response.data;
};

export default {
  getDashboard,
};
