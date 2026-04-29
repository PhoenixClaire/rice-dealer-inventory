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

const getDailySalesSummary = async (req, res) => {
    try {
        
        const { date } = req.query;

        if(!date){
            return res.status(400).json({

                message: "Date query is required.",

            });
        }

        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);

        //look for sales within the day
        const sales = await Sale.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            },
        });

        let totalRevenue = 0;
        const itemMap = {};

        for (const sale of sales){

            //compute the total revenue
            totalRevenue += sale.totalAmount; 

            for (const item of sale.items){
                if(!itemMap[item.sku]){
                    itemMap[item.sku] = {
                        sku: item.sku,
                        productName: item.productName,
                        totalQuantity: 0,
                        totalSales: 0,
                    };
                }

                itemMap[item.sku].totalQuantity += item.quantity;
                itemMap[item.sku].totalSales += item.lineTotal;
            }
        }

        return res.status(200).json({
            message: "Daily sales summary fetched successfully",
            date,
            totalTransactions: sales.length,
            totalRevenue,
            itemSold: Object.values(itemMap),
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch daily sales summary",
            error: error.message,
        });
    }
};

module.exports = { createSale, getAllSales, getDailySalesSummary};