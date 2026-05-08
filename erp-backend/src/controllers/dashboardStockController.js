const dashboardStockService = require('../services/dashboardStockService');

const getStockKpi = async (req, res) => {

  try {

    const data = await dashboardStockService.getStockKpi();

    res.json(data);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

module.exports = {
  getStockKpi
};