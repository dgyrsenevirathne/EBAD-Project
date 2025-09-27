# TODO: Fix Wholesale Quick Order Creation Errors - Unified Schema Approach

## Overview
Use main Products/ProductVariants for wholesale display and Orders with OrderType = 'wholesale' for orders. Fix SQL errors for successful order creation in quick order form using unified tables.

## Steps

1. [x] Update GET handler in `app/api/wholesale/orders/route.ts`:
   - Query `Orders` for user orders with OrderType = 'wholesale'.
   - Use `CreatedAt` for date and sorting (formatted as date).
   - Join `OrderItems` for item count.
   - Select relevant fields: id (OrderID), orderNumber, date (formatted CreatedAt), status, total, discount, invoiceNumber, items.

2. [x] Update POST handler in `app/api/wholesale/orders/route.ts`:
   - Generate `orderNumber = 'WH-${Date.now()}'`.
   - Add input bindings: @orderNumber.
   - INSERT into `Orders` (UserID, OrderNumber, TotalAmount, DiscountAmount, OrderType='wholesale', Status='processing') – CreatedAt defaults to GETDATE().
   - OUTPUT INSERTED.OrderID to get orderID.

3. [x] In POST, for each item in body.items:
   - Query `Products` by SKU to get ProductID (throw if not found).
   - Find VariantID by color/size if provided from ProductVariants.
   - INSERT into `OrderItems` (OrderID, ProductID, VariantID, Quantity, UnitPrice (from input price, wholesale), Color, Size).
   - UPDATE stock: ProductVariants if variant, else Products (subtract quantity if sufficient).

4. [x] Wrap POST operations in transaction for atomicity.
   - Handle errors: Rollback on failure, return 500 with message.

5. [x] Update /api/wholesale/products/route.ts for unified:
   - Query `Products` with total stock from ProductVariants.
   - Use `WholesalePrice` (or BasePrice if null) as wholesalePrice.
   - Omit tiered pricing loop (not applicable in unified schema; use fixed WholesalePrice, set pricing: []).
   - Filter active products with stock > 0.
   - Include primary image from ProductImages.

6. [x] Database: No changes needed; use existing Products/ProductVariants/Orders tables. (Separate wholesale tables dropped if present, but not required.)

7. [ ] Test:
   - (Skipped per user request)

## Dependencies
- Database has main tables with data in Products (including WholesalePrice) and ProductVariants.
- Quick order form sends {items: [{sku, quantity, color, size, price (wholesale)}], total, discount}.

## Notes
- Wholesale uses same products as retail, but with WholesalePrice for pricing and OrderType = 'wholesale'.
- Colors/sizes handled via ProductVariants for stock accuracy.
