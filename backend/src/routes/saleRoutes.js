const express = require("express");

const{
    createSale,
} = require("../controllers/saleController");

const router = express.Router();

router.post("/", createSale);

module.exports = router; 