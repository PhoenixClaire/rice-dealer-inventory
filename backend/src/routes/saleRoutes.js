const express = require("express");

const{
    createSale,
    getAllSales,
    getDailySalesSummary,
} = require("../controllers/saleController");

const router = express.Router();

router.post("/", createSale);
router.get("/", getAllSales);
router.get("/daily-summary", getDailySalesSummary);

module.exports = router; 