const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

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
    });
  }

  return months;
};

const monthKeyExpression = (dateField = '$date') => ({
  $concat: [
    { $toString: { $year: dateField } },
    '-',
    {
      $cond: [
        { $lt: [{ $month: dateField }, 10] },
        { $concat: ['0', { $toString: { $month: dateField } }] },
        { $toString: { $month: dateField } },
      ],
    },
  ],
});

const paidInvoiceExpression = {
  $or: [
    { $and: [{ $gt: ['$amountPaid', 0] }, { $lte: ['$amountDue', 0] }] },
    { $regexMatch: { input: { $ifNull: ['$status', ''] }, regex: /^pay/i } },
  ],
};

const customerNameProjection = {
  $let: {
    vars: {
      fallbackName: {
        $trim: {
          input: {
            $concat: [
              { $ifNull: ['$customer.firstName', ''] },
              ' ',
              { $ifNull: ['$customer.lastName', ''] },
            ],
          },
        },
      },
    },
    in: {
      $ifNull: [
        '$customer.company',
        {
          $cond: [
            { $eq: ['$$fallbackName', ''] },
            'Client',
            '$$fallbackName',
          ],
        },
      ],
    },
  },
};

const buildDashboardPayload = async () => {
  const months = getMonthSeries();
  const firstMonth = months[0];
  const startDate = new Date(firstMonth.year, firstMonth.month - 1, 1);

  const [
    totalClients,
    totalCommandes,
    invoiceTotals,
    monthlyOrders,
    monthlyInvoices,
    topCustomers,
    loyalCustomerMonths,
  ] = await Promise.all([
    Customer.countDocuments(),
    Order.countDocuments(),
    Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalFactures: { $sum: 1 },
          facturesPayees: { $sum: { $cond: [paidInvoiceExpression, 1, 0] } },
          chiffreAffaires: { $sum: '$totalTTC' },
          resteAPayer: { $sum: '$amountDue' },
        },
      },
    ]),
    Order.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: monthKeyExpression('$date'),
          count: { $sum: 1 },
          total: { $sum: '$totalTTC' },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: monthKeyExpression('$date'),
          paye: { $sum: { $cond: [paidInvoiceExpression, 1, 0] } },
          impaye: { $sum: { $cond: [paidInvoiceExpression, 0, 1] } },
        },
      },
    ]),
    Invoice.aggregate([
      {
        $group: {
          _id: '$customer',
          total: { $sum: '$totalTTC' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          customerId: '$_id',
          name: customerNameProjection,
          total: 1,
          count: 1,
        },
      },
    ]),
    Invoice.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            customer: '$customer',
            month: monthKeyExpression('$date'),
          },
          total: { $sum: '$totalTTC' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totals = invoiceTotals[0] || {};
  const orderMap = new Map(monthlyOrders.map((row) => [row._id, row]));
  const invoiceMap = new Map(monthlyInvoices.map((row) => [row._id, row]));

  const commandesParMois = months.map((month) => ({
    label: month.label,
    key: month.key,
    count: orderMap.get(month.key)?.count || 0,
    total: roundMoney(orderMap.get(month.key)?.total || 0),
  }));

  const factureStatus = months.map((month) => ({
    label: month.label,
    key: month.key,
    paye: invoiceMap.get(month.key)?.paye || 0,
    impaye: invoiceMap.get(month.key)?.impaye || 0,
  }));

  const monthlyByCustomer = new Map();
  loyalCustomerMonths.forEach((row) => {
    const customerId = String(row._id?.customer || '');
    if (!monthlyByCustomer.has(customerId)) {
      monthlyByCustomer.set(customerId, {
        values: new Map(),
        commandes: 0,
      });
    }

    const bucket = monthlyByCustomer.get(customerId);
    bucket.values.set(row._id.month, roundMoney(row.total));
    bucket.commandes += row.count || 0;
  });

  const loyalCustomers = topCustomers.slice(0, 5).map((customer) => {
    const customerId = String(customer.customerId || '');
    const bucket = monthlyByCustomer.get(customerId);

    return {
      name: customer.name,
      total: roundMoney(customer.total),
      commandes: bucket?.commandes || customer.count || 0,
      retour: 0,
      mois: months.map((month) => bucket?.values.get(month.key) || 0),
    };
  });

  const totalFactures = totals.totalFactures || 0;
  const facturesPayees = totals.facturesPayees || 0;
  const kpi = {
    totalClients,
    totalFactures,
    facturesPayees,
    facturesImpayees: Math.max(0, totalFactures - facturesPayees),
    totalCommandes,
    chiffreAffaires: roundMoney(totals.chiffreAffaires || 0),
    resteAPayer: roundMoney(totals.resteAPayer || 0),
  };

  return {
    kpi,
    labels: months.map((month) => month.label),
    commandesParMois,
    factureStatus,
    topCustomers: topCustomers.map((customer) => ({
      ...customer,
      total: roundMoney(customer.total),
    })),
    loyalCustomers,
  };
};

const sendDashboard = async (res) => {
  const dashboard = await buildDashboardPayload();

  res.json({
    success: true,
    ...dashboard.kpi,
    data: dashboard,
  });
};

const getKpiFacture = async (req, res) => {
  try {
    await sendDashboard(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFactureDashboard = async (req, res) => {
  try {
    await sendDashboard(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getInvoiceStats = async (req, res) => {
  try {
    const byStatus = await Invoice.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalTTC' } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: byStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFactureDashboard,
  getInvoiceStats,
  getKpiFacture,
};
