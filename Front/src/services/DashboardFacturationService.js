const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const getKpiFacture = async () => {

  const totalClients = await Customer.countDocuments();

  const totalFactures = await Invoice.countDocuments();

  const facturesPayees = await Invoice.countDocuments({
    status: 'payée'
  });

  const facturesImpayees = await Invoice.countDocuments({
    status: 'impayée'
  });

  const totalCommandes = await Order.countDocuments();

  return {
    totalClients,
    totalFactures,
    facturesPayees,
    facturesImpayees,
    totalCommandes,
  };
};

module.exports = {
  getKpiFacture
};