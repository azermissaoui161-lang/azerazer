const API_URL = '/api/archives'; // Thabet f el 's' mte3 archives kima f server.js

// Function bech tjib el token mel localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Wala el key elli testa3mel fih
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur serveur');
  return data;
};

const ArchiveService = {
  // 📥 Get All
  getAll: async () => {
    const res = await fetch(API_URL, {
      headers: getAuthHeaders() // Zid hathi
    });
    return handleResponse(res);
  },

  // 📦 Archive
  archive: async (invoiceId, reason) => {
    const res = await fetch(`${API_URL}/${invoiceId}`, {
      method: 'POST',
      headers: getAuthHeaders(), // Zid hathi
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  // 🔄 Restore
  restore: async (archiveId) => {
    const res = await fetch(`${API_URL}/restore/${archiveId}`, {
      method: 'POST',
      headers: getAuthHeaders() // Zid hathi
    });
    return handleResponse(res);
  },

  // ❌ Delete
  delete: async (archiveId) => {
    const res = await fetch(`${API_URL}/${archiveId}`, {
      method: 'DELETE',
      headers: getAuthHeaders() // Zid hathi
    });
    return handleResponse(res);
  }
};

export default ArchiveService;