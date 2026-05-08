const Transaction = require('../models/Transaction');
const Depense = require('../models/Depense');

const getFinanceKpi = async () => {

  try {

    const chiffreAffaireAgg = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$montant' }
        }
      }
    ]);

    const depensesAgg = await Depense.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$montant' }
        }
      }
    ]);

    const transactionsTotal =
      await Transaction.countDocuments();

    return {
      chiffreAffaire: chiffreAffaireAgg[0]?.total || 0,
      depensesTotal: depensesAgg[0]?.total || 0,
      transactionsTotal,
    };

  } catch (err) {

    throw new Error(err.message);

  }

};

module.exports = {
  getFinanceKpi
};