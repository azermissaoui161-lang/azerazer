const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const StockMovement = require('../models/StockMovement');

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

const isEntryExpression = {
  $regexMatch: { input: { $ifNull: ['$type', ''] }, regex: /^entr/i },
};

const buildStockDashboard = async () => {
  const months = getMonthSeries();
  const firstMonth = months[0];
  const startDate = new Date(firstMonth.year, firstMonth.month - 1, 1);

  const activeProductMatch = { isActive: { $ne: false }, archived: { $ne: true } };

  const [
    totalProducts,
    produitsEnStock,
    produitsEnRupture,
    lowStock,
    nombreCategories,
    totalFournisseurs,
    movementTotals,
    stockValue,
    monthlyMovements,
    topProducts,
    categories,
    topFournisseurs,
  ] = await Promise.all([
    Product.countDocuments(activeProductMatch),
    Product.countDocuments({ ...activeProductMatch, stock: { $gt: 0 } }),
    Product.countDocuments({ ...activeProductMatch, stock: { $lte: 0 } }),
    Product.countDocuments({
      ...activeProductMatch,
      $expr: { $lte: ['$stock', { $ifNull: ['$minStock', 10] }] },
    }),
    Category.countDocuments(),
    Supplier.countDocuments({ status: { $ne: 'inactif' } }),
    StockMovement.aggregate([
      {
        $group: {
          _id: null,
          totalMouvements: { $sum: 1 },
          entreeMouvements: { $sum: { $cond: [isEntryExpression, 1, 0] } },
          sortieMouvements: { $sum: { $cond: [isEntryExpression, 0, 1] } },
          totalEntrees: { $sum: { $cond: [isEntryExpression, '$quantity', 0] } },
          totalSorties: { $sum: { $cond: [isEntryExpression, 0, '$quantity'] } },
        },
      },
    ]),
    Product.aggregate([
      { $match: activeProductMatch },
      {
        $group: {
          _id: null,
          value: { $sum: { $multiply: ['$stock', '$price'] } },
        },
      },
    ]),
    StockMovement.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            month: monthKeyExpression('$date'),
            isEntry: isEntryExpression,
          },
          quantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]),
    Product.aggregate([
      { $match: activeProductMatch },
      {
        $project: {
          name: 1,
          stock: 1,
          price: 1,
          value: { $multiply: ['$stock', '$price'] },
        },
      },
      { $sort: { value: -1, stock: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          name: 1,
          stock: 1,
          value: 1,
        },
      },
    ]),
    Product.aggregate([
      { $match: activeProductMatch },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$_id', 'Sans categorie'] },
          count: 1,
          totalStock: 1,
          totalValue: 1,
        },
      },
    ]),
    Product.aggregate([
      { $match: activeProductMatch },
      {
        $group: {
          _id: '$supplierId',
          total: { $sum: { $multiply: ['$stock', '$price'] } },
          commandes: { $sum: 1 },
          produits: {
            $push: {
              nom: '$name',
              achat: { $multiply: ['$stock', '$price'] },
            },
          },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          nom: { $ifNull: ['$supplier.name', 'Fournisseur'] },
          total: 1,
          commandes: 1,
          produits: { $slice: ['$produits', 4] },
        },
      },
    ]),
  ]);

  const movement = movementTotals[0] || {};
  const movementMap = new Map();
  monthlyMovements.forEach((row) => {
    movementMap.set(`${row._id.month}-${row._id.isEntry ? 'entry' : 'exit'}`, row.quantity || 0);
  });

  const monthly = months.map((month) => ({
    label: month.label,
    key: month.key,
    entree: movementMap.get(`${month.key}-entry`) || 0,
    sortie: movementMap.get(`${month.key}-exit`) || 0,
  }));

  const kpi = {
    totalProducts,
    produitsEnStock,
    produitsEnRupture,
    nombreCategories,
    totalMouvements: movement.totalMouvements || 0,
    entreeMouvements: movement.entreeMouvements || 0,
    sortieMouvements: movement.sortieMouvements || 0,
    totalEntrees: movement.totalEntrees || 0,
    totalSorties: movement.totalSorties || 0,
    totalFournisseurs,
    lowStock,
    stockValue: roundMoney(stockValue[0]?.value || 0),
  };

  return {
    kpi,
    monthlyMovements: monthly,
    topProducts: topProducts.map((item) => ({
      name: item.name,
      stock: item.stock || 0,
      value: roundMoney(item.value || 0),
    })),
    categories: categories.map((item) => ({
      ...item,
      totalValue: roundMoney(item.totalValue || 0),
    })),
    topFournisseurs: topFournisseurs.map((item, index) => ({
      id: item.id || index,
      nom: item.nom,
      total: roundMoney(item.total || 0),
      commandes: item.commandes || 0,
      produits: (item.produits || []).map((product) => ({
        nom: product.nom,
        achat: roundMoney(product.achat || 0),
      })),
    })),
  };
};

const getStockKpi = async (req, res) => {
  try {
    const dashboard = await buildStockDashboard();
    const { kpi } = dashboard;

    res.json({
      success: true,
      ...kpi,
      totalProducts: kpi.totalProducts,
      totalCategories: kpi.nombreCategories,
      totalSuppliers: kpi.totalFournisseurs,
      data: dashboard,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStockKpi,
};
