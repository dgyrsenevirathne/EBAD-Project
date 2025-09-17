-- Add Stock column to Products table

USE SriLankanEcommerce;
GO

-- Add Stock column to Products table
ALTER TABLE Products
ADD Stock INT DEFAULT 0;

PRINT 'Stock column added to Products table successfully!';
