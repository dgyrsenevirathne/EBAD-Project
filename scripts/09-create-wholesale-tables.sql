-- Create wholesale-specific tables for Sri Lankan E-commerce Platform
-- Run this after creating the main tables

USE SriLankanEcommerce;
GO

-- Wholesale Products Table
CREATE TABLE WholesaleProducts (
    WholesaleProductID INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(255) NOT NULL,
    SKU NVARCHAR(100) UNIQUE NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    BasePrice DECIMAL(10,2) NOT NULL,
    MinOrderQty INT DEFAULT 10,
    Stock INT DEFAULT 0,
    ImageURL NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Wholesale Tiered Pricing Table
CREATE TABLE WholesaleTieredPricing (
    TierID INT IDENTITY(1,1) PRIMARY KEY,
    WholesaleProductID INT FOREIGN KEY REFERENCES WholesaleProducts(WholesaleProductID),
    MinQty INT NOT NULL,
    MaxQty INT NULL, -- NULL means unlimited
    Price DECIMAL(10,2) NOT NULL,
    Discount NVARCHAR(20) NOT NULL, -- e.g., '20%', '25%'
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Wholesale Orders Table
CREATE TABLE WholesaleOrders (
    WholesaleOrderID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    OrderNumber NVARCHAR(50) UNIQUE NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    DiscountAmount DECIMAL(10,2) DEFAULT 0,
    Status NVARCHAR(20) DEFAULT 'processing', -- 'processing', 'shipped', 'delivered', 'cancelled'
    InvoiceNumber NVARCHAR(50) NULL,
    OrderDate DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Wholesale Order Items Table
CREATE TABLE WholesaleOrderItems (
    WholesaleOrderItemID INT IDENTITY(1,1) PRIMARY KEY,
    WholesaleOrderID INT FOREIGN KEY REFERENCES WholesaleOrders(WholesaleOrderID),
    WholesaleProductID INT FOREIGN KEY REFERENCES WholesaleProducts(WholesaleProductID),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    Color NVARCHAR(50) NULL,
    Size NVARCHAR(50) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Wholesale Inquiries Table
CREATE TABLE WholesaleInquiries (
    InquiryID INT IDENTITY(1,1) PRIMARY KEY,
    CompanyName NVARCHAR(255) NOT NULL,
    ContactPerson NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NOT NULL,
    BusinessType NVARCHAR(100) NULL,
    ExpectedVolume NVARCHAR(100) NULL,
    Message NTEXT,
    Status NVARCHAR(20) DEFAULT 'pending', -- 'pending', 'contacted', 'qualified', 'rejected'
    InquiryDate DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Insert sample wholesale products
INSERT INTO WholesaleProducts (ProductName, SKU, Category, BasePrice, MinOrderQty, Stock, ImageURL) VALUES
('Traditional Kandyan Saree', 'TKS-001', 'Women', 12500.00, 10, 150, '/traditional-kandyan-saree.png'),
('Men''s Batik Shirt', 'MBS-002', 'Men', 3500.00, 20, 200, '/sri-lankan-batik-shirt.png'),
('Kids Festival Dress', 'KFD-003', 'Kids', 2800.00, 25, 180, '/sri-lankan-kids-festival-dress.png');

-- Insert tiered pricing for sample products
INSERT INTO WholesaleTieredPricing (WholesaleProductID, MinQty, MaxQty, Price, Discount) VALUES
(1, 10, 49, 10000.00, '20%'),
(1, 50, 99, 9375.00, '25%'),
(1, 100, NULL, 8750.00, '30%'),
(2, 20, 49, 2800.00, '20%'),
(2, 50, 99, 2625.00, '25%'),
(2, 100, NULL, 2450.00, '30%'),
(3, 25, 49, 2240.00, '20%'),
(3, 50, 99, 2100.00, '25%'),
(3, 100, NULL, 1960.00, '30%');

PRINT 'Wholesale tables created and sample data inserted successfully!';
