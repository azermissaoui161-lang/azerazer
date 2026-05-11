import api from './api';

const getDashboard = async () => {
  const response = await api.get('/dashboard/finance/kpi-finance');
  return response.data;
};

export default {
  getDashboard,
};
