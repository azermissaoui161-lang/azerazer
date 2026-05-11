const express = require('express');
const router = express.Router();
const {
  getAllDepenses,
  getDepenseById,
  createDepense,
  updateDepense,
  deleteDepense,
  getDepenseStats,
  getDepensesByCategory,
  getDepensesByStatus,
  updateOverdueStatus,
  markAsPaid,
  exportDepensesCSV,
  getDepenseSettings,
  updateDepenseSettings,
} = require('../controllers/depensesController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAllDepenses);

router.get('/settings', authorize('admin_finance', 'admin_principal'), getDepenseSettings);
router.put('/settings', authorize('admin_finance', 'admin_principal'), updateDepenseSettings);

router.get('/stats', getDepenseStats);
router.get('/stats/summary', getDepenseStats);
router.get('/stats/by-category', getDepenseStats);
router.get('/search', getAllDepenses);
router.get('/export/csv', authorize('admin_finance', 'admin_principal'), exportDepensesCSV);
router.put('/update-overdue', authorize('admin_finance', 'admin_principal'), updateOverdueStatus);

router.get('/category/:category', getDepensesByCategory);
router.get('/status/:status', getDepensesByStatus);
router.patch('/:id/pay', authorize('admin_finance', 'admin_principal'), markAsPaid);
router.get('/:id', getDepenseById);

router.post('/', authorize('admin_finance', 'admin_principal'), createDepense);
router.put('/:id', authorize('admin_finance', 'admin_principal'), updateDepense);
router.delete('/:id', authorize('admin_finance', 'admin_principal'), deleteDepense);

module.exports = router;
