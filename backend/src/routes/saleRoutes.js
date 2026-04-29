const express = require("express");

const{
    createSale,
    getAllSales,
} = require("../controllers/saleController");

const router = express.Router();

router.post("/", createSale);
router.get("/", getAllSales);

module.exports = router; 