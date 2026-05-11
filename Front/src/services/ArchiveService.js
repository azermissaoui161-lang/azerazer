import api from './api';

const unwrap = (response) => response.data;

const ArchiveService = {
  getAll: async () => {
    const response = await api.get('/archive');
    return unwrap(response);
  },

  archive: async (invoiceId, reason = '') => {
    const response = await api.post(`/archive/${invoiceId}`, { reason });
    return unwrap(response);
  },

  restore: async (archiveId) => {
    const response = await api.post(`/archive/restore/${archiveId}`);
    return unwrap(response);
  },

  delete: async (archiveId) => {
    const response = await api.delete(`/archive/${archiveId}`);
    return unwrap(response);
  },
};

export default ArchiveService;
