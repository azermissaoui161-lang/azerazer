const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

// =====================
// DB CONNECTION
// =====================
mongoose.connect("mongodb://127.0.0.1:27017/erp");

// =====================
// MODELS
// =====================
const Product = require("../models/Product");
const Category = require("../models/Category");
const Client = require("../models/Client");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const StockMovement = require("../models/StockMovement");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Supplier = require("../models/Supplier");

// =====================
// CLEAN FUNCTIONS
// =====================
const cleanNumber = (v, def = 0) => {
  const n = parseFloat(v);
  return isNaN(n) ? def : n;
};

const cleanString = (v, def = "N/A") => {
  return v && v.trim() !== "" ? v.trim() : def;
};

const cleanDate = (v) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
};

// =====================
// CACHE (avoid duplicates)
// =====================
const categoryMap = {};
const clientMap = {};
const productMap = {};
const supplierMap = {};

// =====================
// CSV DATA
// =====================
const results = [];

fs.createReadStream("./data/SuperstoreOrders.csv")
  .pipe(csv())
  .on("data", (row) => results.push(row))
  .on("end", async () => {
    console.log(" CSV loaded");

    for (const row of results) {
      try {

        // =====================
        // 1. CATEGORY
        // =====================
        let category = categoryMap[row.category];

        if (!category) {
          category = await Category.create({
            name: cleanString(row.category),
            code: cleanString(row.category).substring(0, 3).toUpperCase(),
            description: cleanString(row.category)
          });

          categoryMap[row.category] = category;
        }

        // =====================
        // 2. SUPPLIER (default + linked)
        // =====================
        let supplier = supplierMap["default"];

        if (!supplier) {
          supplier = await Supplier.create({
            name: "Default Supplier",
            code: "SUP-001",
            contact: "system",
            email: "supplier@erp.com",
            phone: "00000000",
            address: "auto generated",
            status: "actif",
            rating: 4
          });

          supplierMap["default"] = supplier;
        }

        // =====================
        // 3. CLIENT
        // =====================
        let client = clientMap[row.customer_name];

        if (!client) {
          client = await Client.create({
            firstName: cleanString(row.customer_name),
            lastName: "Client",
            email: `${cleanString(row.customer_name).replace(/\s/g, "")}@mail.com`,
            phone: "00000000",
            city: cleanString(row.city, "Unknown"),
            country: cleanString(row.country, "Unknown")
          });

          clientMap[row.customer_name] = client;
        }

        // =====================
        // 4. PRODUCT + STOCK + SUPPLIER
        // =====================
        let product = productMap[row.product_name];

        if (!product) {
          const stock = cleanNumber(row.quantity, 0);
          const sales = cleanNumber(row.sales);

          product = await Product.create({
            name: cleanString(row.product_name),
            category: category._id,
            supplierId: supplier._id,
            stock,
            price: stock ? sales / stock : 0,
            minStock: 5,
            sku: cleanString(row.product_id)
          });

          productMap[row.product_name] = product;

          await StockMovement.create({
            productId: product._id,
            product: row.product_name,
            type: "entrée",
            quantity: stock,
            reason: "import dataset"
          });
        }

        // =====================
        // 5. ORDER
        // =====================
        const order = await Order.create({
          orderNumber: cleanString(row.order_id),
          customer: client._id,
          type: "vente",
          date: cleanDate(row.order_date),
          subtotalHT: cleanNumber(row.sales),
          totalTTC: cleanNumber(row.sales),
          status: "validée",
          paymentStatus: "payé"
        });

        // =====================
        // 6. INVOICE
        // =====================
        const invoice = await Invoice.create({
          type: "facture",
          customer: client._id,
          orderId: order.orderNumber,
          subtotalHT: cleanNumber(row.sales),
          totalTTC: cleanNumber(row.sales),
          amountPaid: cleanNumber(row.sales),
          amountDue: 0,
          status: "payée",
          invoiceNumber: `AUTO-${row.order_id}`
        });

        // =====================
        // 7. PAYMENT
        // =====================
        await Payment.create({
          invoice: invoice._id,
          customer: client._id,
          amount: cleanNumber(row.sales),
          method: "virement",
          status: "validé"
        });

        // =====================
        // 8. FINANCE TRANSACTION
        // =====================
        const revenueAccount = await Account.findOne({ type: "revenu" });
        const cashAccount = await Account.findOne({ category: "banque" });

        const amount = cleanNumber(row.sales);

        await Transaction.create({
          transactionNumber: `TR-${Date.now()}`,
          date: cleanDate(row.order_date),
          description: `Vente ${row.product_name}`,
          entries: [
            {
              account: cashAccount?._id,
              debit: amount,
              credit: 0,
              label: "Vente"
            },
            {
              account: revenueAccount?._id,
              debit: 0,
              credit: amount,
              label: "Revenue"
            }
          ],
          totalDebit: amount,
          totalCredit: amount,
          status: "validé"
        });

      } catch (err) {
        console.log("❌ Error:", err.message);
      }
    }

    console.log("🎉 IMPORT DONE SUCCESSFULLY");
    process.exit();
  });