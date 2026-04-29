const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const Product = require("../../src/models/product");
const Sale = require("../../src/models/sale");
const expectCookies = require("supertest/lib/cookies");

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

describe("GET /api/sales", () => {

    it("should fetch all sales successfully", async () => {

            await Sale.create([
            {
                receiptNumber: "OR-001",
                customerName: "Juan",
                items: [
                    {
                        productId: new mongoose.Types.ObjectId(),
                        productName: "Jasmine Rice",
                        sku: "rice001",
                        quantity: 2,
                        unitPrice: 100,
                        lineTotal: 200,
                    }, 
                ],
                totalAmount: 200,
            },
            {
                receiptNumber: "OR-002",
                customerName: "Maria",
                items: [
                    {
                        productId: new mongoose.Types.ObjectId(),
                        productName: "Dinorado Rice",
                        sku: "rice002",
                        quantity: 1,
                        unitPrice: 120,
                        lineTotal: 120,
                    },
                ],
                totalAmount: 120,
            },
        ]);

        const response = await request(app).get("/api/sales");

        //verify that the 2 sales are fetched successfully
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Sales fetched successfully");
        expect(response.body.sales.length).toBe(2);

        const receiptNumbers = response.body.sales.map((sale) => sale.receiptNumber);

        //verify the receipt numbers
        expect(receiptNumbers).toContain("OR-001");
        expect(receiptNumbers).toContain("OR-002");
    });
});

describe("GET /api/sales/daily-summary", () => {

    it("should return daily sales summary", async () => {
        const today = new Date("2026-04-29T10:00:00.000Z");

        await Sale.create([
            {
                receiptNumber: "OR-001",
                customerName: "Juan",
                items: [
                {
                    productId: new mongoose.Types.ObjectId(),
                    productName: "Jasmine Rice",
                    sku: "rice001",
                    quantity: 2,
                    unitPrice: 100,
                    lineTotal: 200,
                },
                ],
                totalAmount: 200,
                createdAt: today,
                updatedAt: today,
            },
            {
                receiptNumber: "OR-002",
                customerName: "Maria",
                items: [
                {
                    productId: new mongoose.Types.ObjectId(),
                    productName: "Jasmine Rice",
                    sku: "rice001",
                    quantity: 3,
                    unitPrice: 100,
                    lineTotal: 300,
                },
                ],
                totalAmount: 300,
                createdAt: today,
                updatedAt: today,
            },
        ]);

        const response = await request(app).get(
            "/api/sales/daily-summary?date=2026-04-29"
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Daily sales summary fetched successfully");

        expect(response.body.totalTransactions).toBe(2);
        expect(response.body.totalRevenue).toBe(500);
        expect(response.body.itemSold[0].sku).toBe("rice001");
        expect(response.body.itemSold[0].totalQuantity).toBe(5);
        expect(response.body.itemSold[0].totalSales).toBe(500);
    });

    it("should return 400 if date query is missing", async () => {
        const response = await request(app).get("/api/sales/daily-summary");

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Date query is required.");
    });
});