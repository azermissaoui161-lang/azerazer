const Transaction = require('../models/Transaction');
const Depenses = require('../models/depenses');
const Account = require('../models/Account');
const Invoice = require('../models/Invoice');

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];

const roundMoney = (value = 0) => Math.round((Number(value) || 0) * 100) / 100;

const getMonthSeries = () => {
  const now = new Date();
  const months = [];

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;

    months.push({
      key,
      year,
      month,
      label: MONTH_LABELS[month - 1],
      recettes: 0,
      depenses: 0,
      net: 0,
    });
  }

  return months;
};

const mapByMonth = (rows = [], valueField) => {
  const map = new Map();

  rows.forEach((row) => {
    if (row?._id) {
      map.set(row._id, Number(row[valueField]) || 0);
    }
  });

  return map;
};

const buildFinanceDashboard = async () => {
  const months = getMonthSeries();
  const firstMonth = months[0];
  const startDate = new Date(firstMonth.year, firstMonth.month - 1, 1);
  const startMonthKey = firstMonth.key;

  const [
    invoiceTotals,
    transactionTotals,
    depenseTotals,
    accountTotals,
    invoiceMonthly,
    depenseMonthly,
    depensesByCategory,
  ] = await Promise.all([
    Invoice.aggregate([
      {
        $group: {
          _id: null,
          chiffreAffaire: { $sum: '$totalTTC' },
          recettesEncaissees: { $sum: '$amountPaid' },
          resteAPayer: { $sum: '$amountDue' },
          count: { $sum: 1 },
        },
      },
    ]),
    Transaction.aggregate([
      { $match: { status: { $regex: '^valid', $options: 'i' } } },
      {
        $group: {
          _id: null,
          totalDebit: { $sum: '$totalDebit' },
          totalCredit: { $sum: '$totalCredit' },
          count: { $sum: 1 },
        },
      },
    ]),
    Depenses.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Account.aggregate([
      { $match: { isActive: { $ne: false } } },
      { $group: { _id: null, totalBalance: { $sum: '$balance' }, count: { $sum: 1 } } },
    ]),
    Invoice.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $concat: [
              { $toString: { $year: '$date' } },
              '-',
              {
                $cond: [
                  { $lt: [{ $month: '$date' }, 10] },
                  { $concat: ['0', { $toString: { $month: '$date' } }] },
                  { $toString: { $month: '$date' } },
                ],
              },
            ],
          },
          total: { $sum: '$totalTTC' },
          paid: { $sum: '$amountPaid' },
        },
      },
    ]),
    Depenses.aggregate([
      { $match: { date: { $gte: startMonthKey } } },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] },
          total: { $sum: '$amount' },
        },
      },
    ]),
    Depenses.aggregate([
      {
        $group: {
          _id: '$category',
          montant: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { montant: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          type: { $ifNull: ['$_id', 'Autre'] },
          montant: 1,
          count: 1,
        },
      },
    ]),
  ]);

  const invoiceTotal = invoiceTotals[0] || {};
  const transactionTotal = transactionTotals[0] || {};
  const depenseTotal = depenseTotals[0] || {};
  const accountTotal = accountTotals[0] || {};

  const invoiceByMonth = mapByMonth(invoiceMonthly, 'total');
  const depenseByMonth = mapByMonth(depenseMonthly, 'total');

  const monthly = months.map((month) => {
    const recettes = roundMoney(invoiceByMonth.get(month.key) || 0);
    const depenses = roundMoney(depenseByMonth.get(month.key) || 0);

    return {
      ...month,
      recettes,
      depenses,
      net: roundMoney(recettes - depenses),
    };
  });

  const chiffreAffaire = roundMoney(invoiceTotal.chiffreAffaire || transactionTotal.totalCredit || 0);
  const depensesTotal = roundMoney(depenseTotal.total || 0);
  const recettesEncaissees = roundMoney(invoiceTotal.recettesEncaissees || 0);
  const beneficeNet = roundMoney((recettesEncaissees || chiffreAffaire) - depensesTotal);

  const kpi = {
    chiffreAffaire,
    recettesEncaissees,
    depensesTotal,
    depensesCount: depenseTotal.count || 0,
    transactionsTotal: transactionTotal.count || 0,
    totalDebit: roundMoney(transactionTotal.totalDebit || 0),
    totalCredit: roundMoney(transactionTotal.totalCredit || 0),
    totalAccounts: accountTotal.count || 0,
    totalBalance: roundMoney(accountTotal.totalBalance || 0),
    facturesTotal: invoiceTotal.count || 0,
    resteAPayer: roundMoney(invoiceTotal.resteAPayer || 0),
    beneficeNet,
  };

  return {
    kpi,
    monthly,
    depensesByCategory: depensesByCategory.map((item) => ({
      ...item,
      montant: roundMoney(item.montant),
    })),
  };
};

const getFinanceKpi = async (req, res) => {
  try {
    const dashboard = await buildFinanceDashboard();
    const { kpi } = dashboard;

    res.json({
      success: true,
      ...kpi,
      transactions: kpi.transactionsTotal,
      totalDepenses: kpi.depensesTotal,
      depensesCount: kpi.depensesCount,
      monthly: dashboard.monthly,
      depensesByCategory: dashboard.depensesByCategory,
      data: dashboard,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFinanceKpi,
};
