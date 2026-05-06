const Archive = require('../models/Archive');
const Invoice = require('../models/Invoice');

// 📦 Archiver une facture
const archiveInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer');

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    const archive = await Archive.create({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer 
        ? `${invoice.customer.firstName} ${invoice.customer.lastName}` 
        : 'Inconnu',
      amount: invoice.totalTTC,
      reason: req.body.reason || '',
      data: invoice.toObject(), // On convertit en objet pur
      archivedBy: req.user?._id || null, // Thabet f req.user._id wala req.user.id
      archivedAt: new Date()
    });

    await invoice.deleteOne();

    res.status(201).json({
      message: 'Facture archivée avec succès',
      data: archive
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur archivage', error: error.message });
  }
};

// 📥 Get all archives
const getArchives = async (req, res) => {
  try {
    const archives = await Archive.find().sort({ archivedAt: -1 });
    res.json(archives);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération archives', error: error.message });
  }
};

const restoreArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) return res.status(404).json({ message: 'Archive non trouvée' });

    // ⏳ Check délai 7 jours (Kima 3malt enti, mrigel)
    const days = (Date.now() - new Date(archive.archivedAt)) / (1000 * 60 * 60 * 24);
    if (days > 7) {
      return res.status(400).json({ message: `Délai dépassé (${Math.floor(days)} jours)` });
    }

    // ♻️ Nettoyage strict
    let invoiceData = archive.data instanceof Map ? Object.fromEntries(archive.data) : archive.data;
    
    // Na7iw ay 7aja t-causi conflict
    const { _id, __v, createdAt, updatedAt, ...cleanData } = invoiceData;

    // 🚀 Création avec gestion d'erreur spécifique
    const restoredInvoice = new Invoice(cleanData);
    await restoredInvoice.save();

    await archive.deleteOne();

    res.json({ message: 'Facture restaurée', data: restoredInvoice });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: 'Erreur restauration', error: error.message });
  }
};

// ❌ Supprimer l'archive
const deleteArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) return res.status(404).json({ message: 'Archive non trouvée' });
    await archive.deleteOne();
    res.json({ message: 'Archive supprimée définitivement' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression', error: error.message });
  }
};

module.exports = {
  archiveInvoice,
  getArchives,
  restoreArchive,
  deleteArchive
};