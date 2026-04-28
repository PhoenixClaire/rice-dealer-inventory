const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const Product = require("../../src/models/product");
const Sale = require("../../src/models/sale");

let mongoServer;

//connect to test server
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
});

//cleanup
afterEach(async () => {
    await Product.deleteMany({});
    await Sale.deleteMany({});
});

//disconnect and close 
afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("POST /api/sales", () => {

    it("should create a sale and deduct product stock", async () => {
        //product in inventory
        await Product.create({
            name: "Jasmine Rice",
            sku: "rice001",
            unit: "kg",
            pricePerUnit: 100,
            stockQuantity: 10,
            lowStockThreshold: 2,
        });

        // create a sale item
        const response = await request(app).post("/api/sales").send({
            receiptNumber: "OR-001",
            customerName: "Juan Dela Cruz",
            items: [
                {
                    sku: "rice001",
                    quantity: 3,
                },
            ],
            receiptImagePath: "",
        });

        console.log(response.body);

        //verify that the sale was successful and a sale item was created 
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Sale created successfully");

        //verify the information
        expect(response.body.sale.receiptNumber).toBe("OR-001");
        expect(response.body.sale.totalAmount).toBe(300);
        expect(response.body.sale.items[0].lineTotal).toBe(300);

        //find the sold product and verify that the quantity was updated
        const updatedProduct = await Product.findOne({ sku: "rice001" });
        expect(updatedProduct.stockQuantity).toBe(7);
    });
});