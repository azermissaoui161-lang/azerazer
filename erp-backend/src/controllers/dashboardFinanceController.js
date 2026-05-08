const dashboardFinanceService = require('../services/dashboardFinanceService');

const getFinanceKpi = async (req, res) => {
  try {

    const data = await dashboardFinanceService.getFinanceKpi();

    res.json(data);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};

module.exports = {
  getFinanceKpi
};