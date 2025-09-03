-- Create all tables for Sri Lankan E-commerce Platform
-- Run this after creating the database

USE SriLankanEcommerce;
GO

-- Users Table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    Phone NVARCHAR(20) UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    UserType NVARCHAR(20) DEFAULT 'customer', -- 'customer', 'wholesale', 'admin'
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Loyalty Program Table
CREATE TABLE LoyaltyProgram (
    LoyaltyID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Points INT DEFAULT 0,
    TotalEarned INT DEFAULT 0,
    TotalSpent INT DEFAULT 0,
    ReferralCode NVARCHAR(20) UNIQUE,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Categories Table
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL,
    ParentCategoryID INT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Products Table
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(255) NOT NULL,
    Description NTEXT,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    BasePrice DECIMAL(10,2) NOT NULL,
    WholesalePrice DECIMAL(10,2),
    SKU NVARCHAR(100) UNIQUE NOT NULL,
    IsActive BIT DEFAULT 1,
    IsFeatured BIT DEFAULT 0,
    IsPreOrder BIT DEFAULT 0,
    PreOrderDate DATETIME NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Product Variants (Size, Color)
CREATE TABLE ProductVariants (
    VariantID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    Size NVARCHAR(10),
    Color NVARCHAR(50),
    Stock INT DEFAULT 0,
    VariantSKU NVARCHAR(100) UNIQUE NOT NULL,
    IsActive BIT DEFAULT 1
);

-- Product Images
CREATE TABLE ProductImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    ImageURL NVARCHAR(500) NOT NULL,
    IsPrimary BIT DEFAULT 0,
    DisplayOrder INT DEFAULT 0
);

-- Addresses Table
CREATE TABLE Addresses (
    AddressID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    AddressLine1 NVARCHAR(255) NOT NULL,
    AddressLine2 NVARCHAR(255),
    City NVARCHAR(100) NOT NULL,
    Province NVARCHAR(100) NOT NULL,
    PostalCode NVARCHAR(10),
    Country NVARCHAR(50) DEFAULT 'Sri Lanka',
    IsDefault BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Orders Table
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    OrderNumber NVARCHAR(50) UNIQUE NOT NULL,
    OrderType NVARCHAR(20) DEFAULT 'retail', -- 'retail', 'wholesale'
    TotalAmount DECIMAL(10,2) NOT NULL,
    DiscountAmount DECIMAL(10,2) DEFAULT 0,
    PointsUsed INT DEFAULT 0,
    PointsEarned INT DEFAULT 0,
    PaymentMethod NVARCHAR(50) NOT NULL, -- 'COD', 'Card', 'FriMi', 'eZCash', 'SampathPay'
    PaymentStatus NVARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    OrderStatus NVARCHAR(20) DEFAULT 'processing', -- 'processing', 'shipped', 'delivered', 'cancelled'
    ShippingAddressID INT FOREIGN KEY REFERENCES Addresses(AddressID),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Order Items Table
CREATE TABLE OrderItems (
    OrderItemID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    VariantID INT FOREIGN KEY REFERENCES ProductVariants(VariantID),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL
);

-- Shopping Cart Table
CREATE TABLE ShoppingCart (
    CartID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    VariantID INT FOREIGN KEY REFERENCES ProductVariants(VariantID),
    Quantity INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Wishlist Table
CREATE TABLE Wishlist (
    WishlistID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Loyalty Transactions Table
CREATE TABLE LoyaltyTransactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Points INT NOT NULL, -- Positive for earned, negative for spent
    TransactionType NVARCHAR(50) NOT NULL, -- 'purchase', 'referral', 'review', 'redemption'
    ReferenceID INT, -- OrderID or other reference
    Description NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Promotions Table
CREATE TABLE Promotions (
    PromotionID INT IDENTITY(1,1) PRIMARY KEY,
    PromotionName NVARCHAR(255) NOT NULL,
    DiscountType NVARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    DiscountValue DECIMAL(10,2) NOT NULL,
    MinOrderAmount DECIMAL(10,2) DEFAULT 0,
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Restock Notifications Table
CREATE TABLE RestockNotifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    VariantID INT FOREIGN KEY REFERENCES ProductVariants(VariantID),
    IsNotified BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

PRINT 'All tables created successfully!';
