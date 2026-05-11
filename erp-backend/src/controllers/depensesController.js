const Depenses = require('../models/depenses');
const Account = require('../models/Account');
const DepenseSettings = require('../models/DepenseSettings');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const mongoose = require('mongoose');
const json2csv = require('json2csv').Parser;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getMonthRange = (value = new Date()) => {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return {
    start: new Date(safeDate.getFullYear(), safeDate.getMonth(), 1),
    end: new Date(safeDate.getFullYear(), safeDate.getMonth() + 1, 1),
    key: `${safeDate.getFullYear()}-${String(safeDate.getMonth() + 1).padStart(2, '0')}`,
  };
};

const getMonthlyDepenseTotal = async ({ date, excludeId } = {}) => {
  const { start, end } = getMonthRange(date);
  const query = {
    date: {
      $gte: start.toISOString().split('T')[0],
      $lt: end.toISOString().split('T')[0],
    },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const result = await Depenses.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return result[0]?.total || 0;
};

const buildDepenseUsage = async ({ amount = 0, date, excludeId } = {}) => {
  const settings = await DepenseSettings.getGlobal();
  const currentTotal = await getMonthlyDepenseTotal({ date, excludeId });
  const projectedTotal = currentTotal + Math.abs(toNumber(amount));
  const maxMonthlyAmount = toNumber(settings.maxMonthlyAmount);
  const warningThresholdPercent = toNumber(settings.warningThresholdPercent, 80);
  const enabled = Boolean(settings.enabled && maxMonthlyAmount > 0);
  const percent = enabled ? Math.round((projectedTotal / maxMonthlyAmount) * 10000) / 100 : 0;

  return {
    settings,
    enabled,
    currentTotal,
    projectedTotal,
    maxMonthlyAmount,
    warningThresholdPercent,
    percent,
    monthKey: getMonthRange(date).key,
  };
};

const notifyDepenseLimitAdmins = async (usage, priority = 'haute') => {
  if (!usage.enabled) return;

  const admins = await User.find({
    role: { $in: ['admin_principal', 'admin_finance'] },
    isActive: true,
  }).select('_id');

  await Promise.all(admins.map((admin) => createNotification(
    admin._id,
    usage.projectedTotal > usage.maxMonthlyAmount ? 'depense_limit_exceeded' : 'depense_limit_warning',
    'Limite depenses',
    `Les depenses du mois ${usage.monthKey} sont a ${usage.percent}% du plafond (${usage.projectedTotal.toFixed(2)} / ${usage.maxMonthlyAmount.toFixed(2)}).`,
    {
      dedupeKey: `depense-limit-${usage.monthKey}`,
      month: usage.monthKey,
      currentTotal: usage.projectedTotal,
      maxMonthlyAmount: usage.maxMonthlyAmount,
      percent: usage.percent,
    },
    priority
  )));
};

const enforceDepenseLimit = async ({ amount, date, excludeId } = {}) => {
  const usage = await buildDepenseUsage({ amount, date, excludeId });

  if (!usage.enabled) {
    return usage;
  }

  if (usage.projectedTotal > usage.maxMonthlyAmount) {
    await notifyDepenseLimitAdmins(usage, 'urgente');
    const error = new Error(
      `Plafond depenses depasse: ${usage.projectedTotal.toFixed(2)} / ${usage.maxMonthlyAmount.toFixed(2)}`
    );
    error.statusCode = 400;
    error.usage = usage;
    throw error;
  }

  if (usage.percent >= usage.warningThresholdPercent) {
    await notifyDepenseLimitAdmins(usage, 'haute');
  }

  return usage;
};


// @desc    Récupérer toutes les dépenses (avec filtre par utilisateur si non-admin)
// @route   GET /api/depenses
// @access  Private
exports.getAllDepenses = async (req, res) => {
  try {
    // Mettre à jour les statuts en retard avant de récupérer
    await Depenses.updateOverdueStatus();
    
    let query = {};
    
    // Si l'utilisateur n'est pas admin finance ou admin principal, il ne voit que ses propres dépenses
    if (!['admin_finance', 'admin_principal'].includes(req.user.role)) {
      query.userId = req.user._id;
    }
    
    const depenses = await Depenses.find(query)
      .sort({ createdAt: -1 });
    
    // Formater les données pour le frontend
    const formattedDepenses = depenses.map(depense => ({
      ...depense.toObject(),
      id: depense._id,
      type: 'dépense',
      amount: -Math.abs(depense.amount)
    }));
    
    res.status(200).json({
      success: true,
      count: formattedDepenses.length,
      data: formattedDepenses,
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Erreur getAllDepenses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dépenses',
      error: error.message
    });
  }
};

// @desc    Récupérer une dépense par ID
// @route   GET /api/depenses/:id
// @access  Private
exports.getDepenseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de dépense invalide'
      });
    }
    
    const depense = await Depenses.findById(id);
    
    if (!depense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }
    
    // Vérifier si l'utilisateur a le droit de voir cette dépense
    if (!['admin_finance', 'admin_principal'].includes(req.user.role) && 
        depense.userId && depense.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette dépense'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...depense.toObject(),
        id: depense._id,
        amount: Math.abs(depense.amount)
      }
    });
  } catch (error) {
    console.error('Erreur getDepenseById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la dépense',
      error: error.message
    });
  }
};

// @desc    Créer une nouvelle dépense
// @route   POST /api/depenses
// @access  Private (Finance uniquement)
exports.getDepenseSettings = async (req, res) => {
  try {
    const settings = await DepenseSettings.getGlobal();
    const usage = await buildDepenseUsage({ date: new Date() });

    res.status(200).json({
      success: true,
      data: {
        maxMonthlyAmount: usage.maxMonthlyAmount,
        warningThresholdPercent: usage.warningThresholdPercent,
        enabled: usage.enabled,
        currentMonthTotal: usage.currentTotal,
        projectedTotal: usage.currentTotal,
        percent: usage.enabled
          ? Math.round((usage.currentTotal / usage.maxMonthlyAmount) * 10000) / 100
          : 0,
        month: usage.monthKey,
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des parametres depenses',
      error: error.message,
    });
  }
};

exports.updateDepenseSettings = async (req, res) => {
  try {
    const settings = await DepenseSettings.getGlobal();
    const maxMonthlyAmount = Math.max(0, toNumber(req.body.maxMonthlyAmount));
    const warningThresholdPercent = Math.min(100, Math.max(1, toNumber(req.body.warningThresholdPercent, 80)));

    settings.maxMonthlyAmount = maxMonthlyAmount;
    settings.warningThresholdPercent = warningThresholdPercent;
    settings.enabled = req.body.enabled !== undefined ? Boolean(req.body.enabled) : maxMonthlyAmount > 0;
    settings.updatedBy = req.user._id;
    await settings.save();

    const usage = await buildDepenseUsage({ date: new Date() });

    if (usage.enabled && usage.percent >= usage.warningThresholdPercent) {
      await notifyDepenseLimitAdmins(usage, 'haute');
    }

    res.status(200).json({
      success: true,
      message: 'Parametres depenses mis a jour',
      data: {
        maxMonthlyAmount: usage.maxMonthlyAmount,
        warningThresholdPercent: usage.warningThresholdPercent,
        enabled: usage.enabled,
        currentMonthTotal: usage.currentTotal,
        percent: usage.percent,
        month: usage.monthKey,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour des parametres depenses',
      error: error.message,
    });
  }
};

exports.createDepense = async (req, res) => {
  try {
    const depenseData = {
      ...req.body,
      amount: Math.abs(parseFloat(req.body.amount) || 0),
      userId: req.user._id,
      createdBy: {
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role
      }
    };

    const budgetUsage = await enforceDepenseLimit({
      amount: depenseData.amount,
      date: depenseData.date,
    });

    let paymentAccount = null;
    if (depenseData.status === 'payÃ©' && depenseData.account) {
      paymentAccount = await Account.findById(depenseData.account);
      if (paymentAccount && paymentAccount.balance < depenseData.amount) {
        return res.status(400).json({
          success: false,
          message: 'Solde insuffisant: Vous avez atteint votre capital disponible.',
        });
      }
    }

    const depense = await Depenses.create(depenseData);

    // --- LOGIQUE BALANCE JDIID ---
    // Ken el dépense jet "payé" mel lowel, na9as mel compte
    if (depense.status === 'payé' && req.body.account) {
      const account = paymentAccount || await Account.findById(req.body.account);
      if (account) {
        await account.credit(depense.amount); // méthode credit mte3ek (balance -= amount)
      }
    }
    // ----------------------------

    res.status(201).json({
      success: true,
      message: 'Dépense créée avec succès',
      data: {
        ...depense.toObject(),
        id: depense._id,
        amount: -Math.abs(depense.amount)
      },
      budget: {
        maxMonthlyAmount: budgetUsage.maxMonthlyAmount,
        currentMonthTotal: budgetUsage.projectedTotal,
        percent: budgetUsage.percent,
        warningThresholdPercent: budgetUsage.warningThresholdPercent,
        enabled: budgetUsage.enabled,
      }
    });
  } catch (error) {
    console.error('Erreur createDepense:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        budget: error.usage,
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }

    if (error.message && error.message.includes('Solde insuffisant')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la dépense',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une dépense
// @route   PUT /api/depenses/:id
// @access  Private (Finance uniquement)
exports.updateDepense = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de dépense invalide'
      });
    }
    
    // Vérifier si la dépense existe
    const existingDepense = await Depenses.findById(id);
    if (!existingDepense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }
    
    const updateData = {
      ...req.body,
      amount: req.body.amount !== undefined
        ? Math.abs(parseFloat(req.body.amount) || 0)
        : existingDepense.amount,
      updatedAt: Date.now(),
      updatedBy: {
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        updatedAt: new Date()
      }
    };

    const budgetUsage = await enforceDepenseLimit({
      amount: updateData.amount,
      date: updateData.date || existingDepense.date,
      excludeId: existingDepense._id,
    });
    
    const depense = await Depenses.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Dépense mise à jour avec succès',
      data: {
        ...depense.toObject(),
        id: depense._id,
        amount: -Math.abs(depense.amount)
      },
      budget: {
        maxMonthlyAmount: budgetUsage.maxMonthlyAmount,
        currentMonthTotal: budgetUsage.projectedTotal,
        percent: budgetUsage.percent,
        warningThresholdPercent: budgetUsage.warningThresholdPercent,
        enabled: budgetUsage.enabled,
      }
    });
  } catch (error) {
    console.error('Erreur updateDepense:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        budget: error.usage,
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la dépense',
      error: error.message
    });
  }
};

// @desc    Supprimer une dépense
// @route   DELETE /api/depenses/:id
// @access  Private (Admin Principal uniquement ou Finance avec permission spéciale)
exports.deleteDepense = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de dépense invalide'
      });
    }
    
    // Seul l'admin principal peut supprimer définitivement
    if (req.user.role !== 'admin_principal') {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'administrateur principal peut supprimer des dépenses'
      });
    }
    
    const depense = await Depenses.findByIdAndDelete(id);
    
    if (!depense) {
      return res.status(404).json({
        success: false,
        message: 'Dépense non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Dépense supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteDepense:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la dépense',
      error: error.message
    });
  }
};

// @desc    Récupérer les statistiques des dépenses
// @route   GET /api/depenses/stats/summary
// @access  Private
exports.getDepenseStats = async (req, res) => {
  try {
    let userId = null;
    
    // Si l'utilisateur n'est pas admin finance, ne voir que ses propres stats
    if (!['admin_finance', 'admin_principal'].includes(req.user.role)) {
      userId = req.user._id;
    }
    
    const stats = await Depenses.getStats(userId);
    
    res.status(200).json({
      success: true,
      data: stats,
      userRole: req.user.role
    });
  } catch (error) {
    console.error('Erreur getDepenseStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// @desc    Récupérer les dépenses par catégorie
// @route   GET /api/depenses/category/:category
// @access  Private
exports.getDepensesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    let query = { category };
    
    // Filtrer par utilisateur si non-admin
    if (!['admin_finance', 'admin_principal'].includes(req.user.role)) {
      query.userId = req.user._id;
    }
    
    const depenses = await Depenses.find(query)
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: depenses.length,
      data: depenses,
      userRole: req.user.role
    });
  } catch (error) {
    console.error('Erreur getDepensesByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dépenses par catégorie',
      error: error.message
    });
  }
};

// @desc    Récupérer les dépenses par statut
// @route   GET /api/depenses/status/:status
// @access  Private
exports.getDepensesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const validStatus = ['payé', 'en attente', 'en retard'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Utilisez: payé, en attente, en retard'
      });
    }
    
    let query = { status };
    
    // Filtrer par utilisateur si non-admin
    if (!['admin_finance', 'admin_principal'].includes(req.user.role)) {
      query.userId = req.user._id;
    }
    
    const depenses = await Depenses.find(query)
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: depenses.length,
      data: depenses,
      userRole: req.user.role
    });
  } catch (error) {
    console.error('Erreur getDepensesByStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des dépenses par statut',
      error: error.message
    });
  }
};
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentDate, notes, accountId } = req.body; // Zid accountId mel body

    const depense = await Depenses.findById(id);
    if (!depense) return res.status(404).json({ success: false, message: 'Dépense non trouvée' });

    // Si déjà payée, on ne fait rien pour ne pas soustraire deux fois
    if (depense.status === 'payé') {
      return res.status(400).json({ success: false, message: 'Dépense déjà marquée comme payée' });
    }

    // 1. Mettre à jour la dépense
    depense.status = 'payé';
    depense.paymentMethod = paymentMethod;
    depense.paymentDate = paymentDate || Date.now();
    depense.notes = notes;
    depense.updatedAt = Date.now();
    await depense.save();

    // 2. Mettre à jour le compte (Balance)
    const targetAccountId = accountId || depense.account; // accountId mta3 el trésorerie
    if (targetAccountId) {
      const account = await Account.findById(targetAccountId);
      if (account) {
        await account.credit(depense.amount);
      }
    }

    res.status(200).json({ success: true, data: depense });
  } catch (error) {
    if (error.message && error.message.includes('Solde insuffisant')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportDepensesCSV = async (req, res) => {
  try {
    const depenses = await Depenses.find({}); // Ajoute des filtres selon req.query si besoin
    
    const fields = ['description', 'amount', 'category', 'status', 'date'];
    const opts = { fields };
    const parser = new json2csv(opts);
    const csv = parser.parse(depenses);

    res.header('Content-Type', 'text/csv');
    res.attachment(`export-depenses-${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur export", error: error.message });
  }
};

// @desc    Mettre à jour le statut des dépenses en retard
// @route   PUT /api/depenses/update-overdue
// @access  Private (Finance uniquement)
exports.updateOverdueStatus = async (req, res) => {
  try {
    let query = {};
    
    // Si non-admin, ne mettre à jour que ses propres dépenses
    if (!['admin_finance', 'admin_principal'].includes(req.user.role)) {
      query.userId = req.user._id;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const result = await Depenses.updateMany(
      {
        ...query,
        status: { $ne: 'payé' },
        dateEcheance: { $lt: today, $ne: '' }
      },
      {
        $set: { 
          status: 'en retard', 
          updatedAt: Date.now(),
          updatedBy: {
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'auto-update-overdue'
          }
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Statuts des dépenses en retard mis à jour',
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Erreur updateOverdueStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des statuts',
      error: error.message
    });
  }
};
