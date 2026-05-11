const Archive = require('../models/Archive');
const Invoice = require('../models/Invoice');

const archiveInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvee' });
    }

    const existingArchive = await Archive.findOne({ invoiceId: invoice._id });
    if (existingArchive) {
      return res.status(409).json({
        success: false,
        message: 'Cette facture est deja archivee',
        data: existingArchive,
      });
    }

    const archive = await Archive.create({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer
        ? `${invoice.customer.firstName} ${invoice.customer.lastName}`.trim()
        : 'Inconnu',
      amount: invoice.totalTTC,
      reason: req.body.reason || '',
      data: invoice.toObject(),
      archivedBy: req.user?._id || null,
      archivedAt: new Date(),
    });

    await invoice.deleteOne();

    res.status(201).json({
      success: true,
      message: 'Facture archivee avec succes',
      data: archive,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur archivage',
      error: error.message,
    });
  }
};

const getArchives = async (req, res) => {
  try {
    const archives = await Archive.find().sort({ archivedAt: -1 });
    res.json({
      success: true,
      data: archives,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur recuperation archives',
      error: error.message,
    });
  }
};

const restoreArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);

    if (!archive) {
      return res.status(404).json({ success: false, message: 'Archive non trouvee' });
    }

    const days = (Date.now() - new Date(archive.archivedAt)) / (1000 * 60 * 60 * 24);
    if (days > 7) {
      return res.status(400).json({
        success: false,
        message: `Delai depasse (${Math.floor(days)} jours)`,
      });
    }

    const invoiceData = archive.data instanceof Map
      ? Object.fromEntries(archive.data)
      : archive.data;

    if (!invoiceData) {
      return res.status(400).json({
        success: false,
        message: 'Archive sans donnees facture',
      });
    }

    const restoredId = invoiceData?._id || archive.invoiceId;
    const existingInvoice = await Invoice.findOne({
      $or: [
        { _id: restoredId },
        { invoiceNumber: archive.invoiceNumber },
      ],
    });

    if (existingInvoice) {
      return res.status(409).json({
        success: false,
        message: 'Cette facture existe deja dans la page factures',
      });
    }

    const { __v, ...cleanData } = invoiceData;
    cleanData._id = restoredId;
    cleanData.invoiceNumber = cleanData.invoiceNumber || archive.invoiceNumber;

    const restoredInvoice = await Invoice.create(cleanData);
    await archive.deleteOne();

    res.json({
      success: true,
      message: 'Facture restauree',
      data: restoredInvoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur restauration',
      error: error.message,
    });
  }
};

const deleteArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);

    if (!archive) {
      return res.status(404).json({ success: false, message: 'Archive non trouvee' });
    }

    await archive.deleteOne();
    res.json({ success: true, message: 'Archive supprimee definitivement' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur suppression',
      error: error.message,
    });
  }
};

module.exports = {
  archiveInvoice,
  getArchives,
  restoreArchive,
  deleteArchive,
};
