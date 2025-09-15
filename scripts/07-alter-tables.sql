-- Alter tables to add missing columns for Sri Lankan E-commerce Platform

USE SriLankanEcommerce;
GO

-- Add FirstName and LastName to Addresses table
ALTER TABLE Addresses
ADD FirstName NVARCHAR(100) NOT NULL DEFAULT '',
    LastName NVARCHAR(100) NOT NULL DEFAULT '';

PRINT 'Addresses table altered successfully!';
