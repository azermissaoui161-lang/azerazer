const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const { authorize } = require('../middleware/roleMiddleware');

const {
  getStockKpi
} = require('../controllers/dashboardStockController');

router.use(protect);

router.use(authorize(
  'admin_stock',
  'admin_principal'
));

router.get('/kpi-stock', getStockKpi);

module.exports = router;