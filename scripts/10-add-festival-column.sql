-- Add Festival column to Products table
USE SriLankanEcommerce;
GO

-- Add Festival column to Products table
ALTER TABLE Products
ADD Festival NVARCHAR(50) NULL;

PRINT 'Festival column added to Products table successfully!';
