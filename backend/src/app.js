const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const saleRoutes = require("./routes/saleRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({ message: "Rice dealer API is running"});
});

app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);

module.exports = app; 
