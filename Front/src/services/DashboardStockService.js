const Product = require('../models/Product');
const Category = require('../models/Category');
const Movement = require('../models/Movement');
const Supplier = require('../models/Supplier');

const getStockKpi = async () => {

  const produitsEnStock = await Product.countDocuments({
    quantity: { $gt: 0 }
  });

  const produitsEnRupture = await Product.countDocuments({
    quantity: 0
  });

  const nombreCategories = await Category.countDocuments();

  const totalMouvements = await Movement.countDocuments();

  const entreeMouvements = await Movement.countDocuments({
    type: 'entrée'
  });

  const sortieMouvements = await Movement.countDocuments({
    type: 'sortie'
  });

  const totalFournisseurs = await Supplier.countDocuments();

  return {
    produitsEnStock,
    produitsEnRupture,
    nombreCategories,
    totalMouvements,
    entreeMouvements,
    sortieMouvements,
    totalFournisseurs,
  };
};

module.exports = {
  getStockKpi
};