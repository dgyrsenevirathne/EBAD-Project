-- Create indexes for better performance
-- Run this after creating tables

USE SriLankanEcommerce;
GO

-- Users table indexes
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Phone ON Users(Phone);
CREATE INDEX IX_Users_UserType ON Users(UserType);

-- Products table indexes
CREATE INDEX IX_Products_CategoryID ON Products(CategoryID);
CREATE INDEX IX_Products_SKU ON Products(SKU);
CREATE INDEX IX_Products_IsFeatured ON Products(IsFeatured);
CREATE INDEX IX_Products_IsActive ON Products(IsActive);

-- Product Variants indexes
CREATE INDEX IX_ProductVariants_ProductID ON ProductVariants(ProductID);
CREATE INDEX IX_ProductVariants_VariantSKU ON ProductVariants(VariantSKU);

-- Orders table indexes
CREATE INDEX IX_Orders_UserID ON Orders(UserID);
CREATE INDEX IX_Orders_OrderNumber ON Orders(OrderNumber);
CREATE INDEX IX_Orders_OrderStatus ON Orders(OrderStatus);
CREATE INDEX IX_Orders_CreatedAt ON Orders(CreatedAt);

-- Order Items indexes
CREATE INDEX IX_OrderItems_OrderID ON OrderItems(OrderID);
CREATE INDEX IX_OrderItems_ProductID ON OrderItems(ProductID);

-- Shopping Cart indexes
CREATE INDEX IX_ShoppingCart_UserID ON ShoppingCart(UserID);

-- Loyalty Transactions indexes
CREATE INDEX IX_LoyaltyTransactions_UserID ON LoyaltyTransactions(UserID);
CREATE INDEX IX_LoyaltyTransactions_TransactionType ON LoyaltyTransactions(TransactionType);

PRINT 'All indexes created successfully!';
