const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

const dashboardFacturationService = require('../services/dashboardFacturationService');

const getKpiFacture = async (req, res) => {
  try {

    const data = await dashboardFacturationService.getKpiFacture();

    res.json(data);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};

module.exports = {
  getFactureDashboard,
  getInvoiceStats,
  getKpiFacture
};