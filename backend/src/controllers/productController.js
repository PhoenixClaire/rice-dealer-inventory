const product = require("../models/product");

const createProduct = async(req, res) => {
    try {
        
        const{
            name,
            sku,
            unit,
            pricePerUnit,
            stockQuantity,
            lowStockThreshold
        } = req.body; 

        //verify if the product already exists
        const exists = await product.findOne({ sku });

        if(exists){
            return res.status(409).json({
                message: "Item already exists in inventory."
            });
        }

        //save the new product
        const newProduct = await product.create({
            name: name?.trim(),
            sku,
            unit,
            pricePerUnit,
            stockQuantity,
            lowStockThreshold
        });

        //return OK and save 
        return res.status(201).json({
            product: newProduct,
            message: "Item created successfully"
        });

    } catch (error) {
        return res.status(400).json ({
            message: "Failed to create product",
            error: error.message,
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await product.find();

        return res.status(200).json({
            message: "Products fetched successfully",
            products: products
        });

    } catch (error) {
        return res.status(500).json ({
            message: "Failed to fetch products",
            error: error.message,
        });
    }
}

module.exports = {createProduct, getAllProducts};

