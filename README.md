# rice-dealer-inventory

## Rice data model
- name
- sku
- unit
- pricePerUnit
- stockQuantity
- lowStockThreshold

## Sale data model
- receiptNumber
- date
- customerName [optional]
- items
- totalAmount
- receiptImagePath

## Item
- productId
- productName
- quantity
- unitPrice
- lineTotal

## Business Rules
- lineTotal = quantity * unitPrice

- saleTotal = sum of all line totals

- newStock = currentStock - soldQuantity 

## Error Handling
- product does not exist
- sold quantity = 0 
- sold quantity > available
