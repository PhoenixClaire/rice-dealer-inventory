const Product = require("../models/product");
const Sale = require("../models/sale");
const {
    calculateLineTotal,
    calculateSalesTotal,
    canFulfillSale,
    deductStock,
} = require("../services/saleService");

const createSale = async (req, res) => {
    try {
        const {
            receiptNumber,
            customerName,
            items,
            receiptImagePath,
        } = req.body;

        const existingSale = await Sale.findOne({ receiptNumber });

        if (existingSale) {
            return res.status(409).json({
                message: "Receipt already exists in the database.",
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Sale must include at least one item.",
            });
        }

        const saleItems = [];
        const lineTotals = [];

        for (const item of items) {
            const product = await Product.findOne({ sku: item.sku });

            if (!product) {
                return res.status(404).json({
                    message: `Product with SKU ${item.sku} not found.`,
                });
            }

            const canSell = canFulfillSale(
                item.quantity,
                product.stockQuantity,
                true
            );

            if (!canSell) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}.`,
                });
            }

            const lineTotal = calculateLineTotal(
                item.quantity,
                product.pricePerUnit
            );

            product.stockQuantity = deductStock(
                product.stockQuantity,
                item.quantity
            );

            await product.save();

            saleItems.push({
                productId: product._id,
                productName: product.name,
                sku: product.sku,
                quantity: item.quantity,
                unitPrice: product.pricePerUnit,
                lineTotal,
            });

            lineTotals.push(lineTotal);
        }

        const totalAmount = calculateSalesTotal(lineTotals);

        const newSale = await Sale.create({
            receiptNumber,
            customerName,
            items: saleItems,
            totalAmount,
            receiptImagePath,
        });

        return res.status(201).json({
            message: "Sale created successfully",
            sale: newSale,
        });

    } catch (error) {
        return res.status(400).json({
            message: "Failed to create sale",
            error: error.message,
        });
    }
};

const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Sales fetched successfully",
            sales,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch sales",
            error: error.message,
        });
    }
};

module.exports = { createSale, getAllSales };