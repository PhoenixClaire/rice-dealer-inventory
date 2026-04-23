const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true, "Item name is required"],
            trim: true,
            unique: true,
            lowercase: true,

        },
        sku:{
            type: String,
            unique: true,
            required: [true, "Stock keeping unit is required"],
            index: true,
        },
        unit: {
            type: String,
            default: "kg",
            trim: true
        },
        pricePerUnit: {
            type: Number,
            required: [true, "Price per unit is required"],
            min: [0, "Unit price cannot be negative"],
        },
        stockQuantity: {
            type: Number,
            required: [true, "Stock quantity is required"],
            min: [0, "Stock quantity cannot be negative"],
            default: 0,
        },
        lowStockThreshold: {
            type: Number,
            min: [0, "Threshold cannot be negative"],
            required: [true, "Stock threshold is required"],
        },


    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);