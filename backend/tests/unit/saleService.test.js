const saleService = require("../../src/services/saleService");

describe('calculateLineTotal', () => {

    it("should return the line total for a product", () => {
        expect(saleService.calculateLineTotal(6, 5)).toBe(30);
    })

    it("should return error when unit price is negative", () => {
        expect(() => {
            saleService.calculateLineTotal(6, -5);
        }).toThrow("Unit price must not be negative.");
    })

    it("should throw an error when sold quantity is 0", () => {
        expect(() => {
            saleService.calculateLineTotal(0, 5);
        }).toThrow("Sold quantity must be grater than 0.");
    })

    it("should throw an error when sold quantity is negative", () => {
        expect(() => {
            saleService.calculateLineTotal(-5, 5);
        }).toThrow("Sold quantity must be grater than 0.");
    })
})

describe('calculateSalesTotal', () => {

    it("should return the total of all line items", () => {

        let lineTotalList = [1, 2, 3];

        expect(saleService.calculateSalesTotal(lineTotalList)).toBe(6);
    });

    it("should throw an error when the list is empty", () => {

        expect(() => {
            saleService.calculateSalesTotal([]);
        }).toThrow("lineTotalList must be a non-empty array");
    })
      
 })

describe('canFulfillSale', () => {

    it("should return true if the sale can be done", () => {
        expect(saleService.canFulfillSale(1, 5, true)).toBe(true);
    })

    it("should return false if there is not enough available stock", () => {
        expect(saleService.canFulfillSale(6,5,true)).toBe(false);
    })

    it("should return false if the product does not exist", () => {
        expect(saleService.canFulfillSale(1,5,false)).toBe(false); 
    })

    it("should return false if the quantity is a negative", () => {
        expect(saleService.canFulfillSale(-1,5,true)).toBe(false);
    })
})

describe('deductStock', () => { 
    
    it("should deduct stock based on the sold quantity", () => {
        expect(saleService.deductStock(10, 5)).toBe(5);
    })

    it("should throw an error if the sold quantity is negative", () => {
        expect(() => {
            saleService.deductStock(10, -5);
        }).toThrow("Sold quantity must be greater than 0");
    })

    it("should throw an error if the sold quantity is 0", () => {
        expect(() => {
            saleService.deductStock(10, 0);
        }).toThrow("Sold quantity must be greater than 0");
    })

    it("should throw an error if the sold quantity is greater than current stock", () => {
        expect(() => {
            saleService.deductStock(10, 15);
        }).toThrow("Sold quantity cannot exceed current stock");
    })

 })
