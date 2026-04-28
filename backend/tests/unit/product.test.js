const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const product = require("../../src/models/product");

let mongoServer;

//connect to test server
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
});

//cleanup
afterEach(async () => {
    await product.deleteMany({});
});

//disconnect and close 
afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("POST /api/products", () => {
    it("should create a new product successfully", async () => {
        const response = await request(app).post("/api/products").send({
            name: "Jasmin Rice",
            sku: "rice001",
            unit: "kg",
            pricePerUnit: 100,
            stockQuantity: 3,
            lowStockThreshold: 2,
        });
        
        console.log(response.body);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Item created successfully");
        expect(response.body.product.name).toBe("jasmin rice");
        expect(response.body.product.sku).toBe("rice001");
        expect(response.body.product.stockQuantity).toBe(3);

    });

    it("should return 409 if SKU already exists", async () => {

        //create a product
        await product.create({
            name: "jasmine rice",
            sku: "rice001",
            unit: "kg",
            pricePerUnit: 100,
            stockQuantity: 3,
            lowStockThreshold: 2,
        });

        //attempt to create the same product
        const response = await request(app).post("/api/products").send({
            name: "jasmine rice",
            sku: "rice001",
            unit: "kg",
            pricePerUnit: 100,
            stockQuantity: 3,
            lowStockThreshold: 2,
        })

        //verify status code and error message
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("Item already exists in inventory.");
    });

    it("should return 400 if required fields are missing", async () => {

        //only supply the name
        const response = await request(app).post("/api/products").send({
            name: "jasmine rice",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Failed to create product");
    });

});

describe("GET /api/products", () => {

    it("should fetch all products successfully", async () => {
        await product.create([
            {
                name: "Jasmine Rice",
                sku: "rice001",
                unit: "kg",
                pricePerUnit: 100,
                stockQuantity: 3,
                lowStockThreshold: 2,
            },
            {
                name: "Dinorado Rice",
                sku: "rice002",
                unit: "kg",
                pricePerUnit: 95,
                stockQuantity: 10,
                lowStockThreshold: 3,
            },
        ]);


        const response = await request(app).get("/api/products");

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Products fetched successfully");

        const names = response.body.products.map((product) => product.name);

        expect(names).toContain("jasmine rice");
        expect(names).toContain("dinorado rice");
    });
});


