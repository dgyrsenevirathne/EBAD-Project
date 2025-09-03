-- Insert sample data for testing
-- Run this after creating all tables, procedures, and triggers

USE SriLankanEcommerce;
GO

-- Insert Categories
INSERT INTO Categories (CategoryName, ParentCategoryID) VALUES
('Men''s Clothing', NULL),
('Women''s Clothing', NULL),
('Kids'' Clothing', NULL),
('Traditional Wear', NULL),
('Shirts', 1),
('Trousers', 1),
('Sarees', 2),
('Blouses', 2),
('Dresses', 2),
('Boys'' Wear', 3),
('Girls'' Wear', 3),
('Kandyan Sarees', 4),
('Batik Clothing', 4);

-- Insert Sample Products
INSERT INTO Products (ProductName, Description, CategoryID, BasePrice, WholesalePrice, SKU, IsFeatured) VALUES
('Traditional Kandyan Saree', 'Authentic Kandyan saree with intricate embroidery', 12, 15000.00, 12000.00, 'KS001', 1),
('Sri Lankan Batik Shirt', 'Handcrafted batik shirt with traditional patterns', 5, 3500.00, 2800.00, 'BS001', 1),
('Festival Kids Dress', 'Colorful traditional dress for children', 11, 2500.00, 2000.00, 'KD001', 1),
('Avurudu Sarong', 'Special sarong for New Year celebrations', 1, 2000.00, 1600.00, 'AS001', 0),
('Handloom Cotton Blouse', 'Pure cotton blouse with handloom fabric', 8, 1800.00, 1440.00, 'HB001', 1);

-- Insert Product Variants
INSERT INTO ProductVariants (ProductID, Size, Color, Stock, VariantSKU) VALUES
(1, 'S', 'Red', 25, 'KS001-S-RED'),
(1, 'M', 'Red', 30, 'KS001-M-RED'),
(1, 'L', 'Red', 20, 'KS001-L-RED'),
(1, 'S', 'Blue', 15, 'KS001-S-BLUE'),
(1, 'M', 'Blue', 25, 'KS001-M-BLUE'),
(2, 'S', 'Green', 40, 'BS001-S-GREEN'),
(2, 'M', 'Green', 35, 'BS001-M-GREEN'),
(2, 'L', 'Green', 30, 'BS001-L-GREEN'),
(2, 'XL', 'Green', 25, 'BS001-XL-GREEN'),
(3, '2-3Y', 'Pink', 20, 'KD001-2-3Y-PINK'),
(3, '4-5Y', 'Pink', 25, 'KD001-4-5Y-PINK'),
(3, '6-7Y', 'Pink', 15, 'KD001-6-7Y-PINK'),
(4, 'M', 'White', 50, 'AS001-M-WHITE'),
(4, 'L', 'White', 45, 'AS001-L-WHITE'),
(5, 'S', 'Cream', 30, 'HB001-S-CREAM'),
(5, 'M', 'Cream', 35, 'HB001-M-CREAM'),
(5, 'L', 'Cream', 25, 'HB001-L-CREAM');

-- Insert Product Images
INSERT INTO ProductImages (ProductID, ImageURL, IsPrimary, DisplayOrder) VALUES
(1, '/traditional-kandyan-saree.png', 1, 1),
(2, '/sri-lankan-batik-shirt.png', 1, 1),
(3, '/sri-lankan-kids-festival-dress.png', 1, 1),
(4, '/sri-lankan-sarong-avurudu.png', 1, 1),
(5, '/handloom-cotton-blouse.png', 1, 1);

-- Insert Sample Users
INSERT INTO Users (Email, Phone, Password, FirstName, LastName, UserType) VALUES
('admin@srilankafashion.com', '+94771234567', '$2b$10$hashedpassword1', 'Admin', 'User', 'admin'),
('customer1@email.com', '+94771234568', '$2b$10$hashedpassword2', 'Saman', 'Perera', 'customer'),
('wholesale1@business.com', '+94771234569', '$2b$10$hashedpassword3', 'Nimal', 'Silva', 'wholesale');

-- Insert Loyalty Programs for users
INSERT INTO LoyaltyProgram (UserID, Points, ReferralCode) VALUES
(2, 150, 'SAMAN2024'),
(3, 500, 'NIMAL2024');

-- Insert Sample Addresses
INSERT INTO Addresses (UserID, AddressLine1, AddressLine2, City, Province, PostalCode, IsDefault) VALUES
(2, '123 Galle Road', 'Colombo 03', 'Colombo', 'Western', '00300', 1),
(3, '456 Kandy Road', 'Peradeniya', 'Kandy', 'Central', '20400', 1);

-- Insert Sample Promotions
INSERT INTO Promotions (PromotionName, DiscountType, DiscountValue, MinOrderAmount, StartDate, EndDate) VALUES
('Avurudu Special', 'percentage', 20.00, 5000.00, '2024-04-01', '2024-04-30'),
('Vesak Day Sale', 'percentage', 15.00, 3000.00, '2024-05-01', '2024-05-31'),
('New Customer Discount', 'fixed', 500.00, 2000.00, '2024-01-01', '2024-12-31');

PRINT 'Sample data inserted successfully!';
PRINT 'Database setup complete! You can now connect your application.';
