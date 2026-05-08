const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const { authorize } = require('../middleware/roleMiddleware');

const {
  getFinanceKpi
} = require('../controllers/dashboardFinanceController');

router.use(protect);

router.use(authorize(
  'admin_finance',
  'admin_principal'
));

router.get('/kpi-finance', getFinanceKpi);

module.exports = router;