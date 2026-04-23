/**
 * 
 * @param {float} soldQuantity - how many units are being sold
 * @param {float} unitPrice - price per unit
 * @returns LineTotal
 */
function calculateLineTotal (soldQuantity, unitPrice){

    if(unitPrice < 0){
        throw new Error("Unit price must not be negative.");
    }

    if(soldQuantity <= 0){
        throw new Error("Sold quantity must be grater than 0.");
    }

    return soldQuantity * unitPrice; 

}

/**
 * 
 * @param {Array} lineTotalList - array of all lineTotals
 * @returns sum of all lineTotals
 */
function calculateSalesTotal (lineTotalList){
    
    if(lineTotalList.length == 0){
        throw new Error("lineTotalList must be a non-empty array");
    }
    
    //use "let" for it to become a local variable
    let totalSales = 0;  

    for (const line of lineTotalList){
        totalSales += line; 
    }

    return totalSales; 
}

/**
 * 
 * @param {float} soldQuantity - how many units is being sold
 * @param {float} availableStock - how many units are in stock
 * @param {boolean} productExists - if product exists in the inventory
 * @returns - boolean if the sale can proceed or not
 */
function canFulfillSale (soldQuantity, availableStock, productExists){
    if(productExists){
        if (soldQuantity <= availableStock && soldQuantity > 0){
            return true; 
        }
    }

    return false; 
}

/**
 * 
 * @param {float} currentStock - current units in stock
 * @param {float} soldQuantity - units being sold 
 * @returns - updated units in stock
 */
function deductStock (currentStock, soldQuantity){
    if (soldQuantity <= 0){
        throw new Error("Sold quantity must be greater than 0");
    }

    if(soldQuantity > currentStock){
        throw new Error("Sold quantity cannot exceed current stock");
    }

    return currentStock - soldQuantity; 
}

module.exports = {calculateLineTotal, calculateSalesTotal, canFulfillSale, deductStock}; 