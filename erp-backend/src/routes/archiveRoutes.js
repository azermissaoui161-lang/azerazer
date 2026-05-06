const express = require('express');
const router = express.Router();

const {
  archiveInvoice,
  getArchives,
  restoreArchive,
  deleteArchive
} = require('../controllers/archiveController');

// 1. Static Routes (ijiw el loul dima)
router.get('/', getArchives);

// 2. Specific Routes (hatha yji 9bal el generic :id)
router.post('/restore/:id', restoreArchive);

// 3. Dynamic Routes (elli fihom :id ijiw le5er)
router.post('/:id', archiveInvoice); // Archiver
router.delete('/:id', deleteArchive); // Supprimer

module.exports = router;