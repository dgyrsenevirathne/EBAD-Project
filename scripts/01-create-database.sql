-- Create Sri Lankan E-commerce Database
-- Run this script in SQL Server Management Studio

USE master;
GO

-- Drop database if exists (be careful in production!)
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'SriLankanEcommerce')
BEGIN
    ALTER DATABASE SriLankanEcommerce SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SriLankanEcommerce;
END
GO

-- Create new database
CREATE DATABASE SriLankanEcommerce
ON 
( NAME = 'SriLankanEcommerce_Data',
  FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\SriLankanEcommerce.mdf',
  SIZE = 100MB,
  MAXSIZE = 1GB,
  FILEGROWTH = 10MB )
LOG ON 
( NAME = 'SriLankanEcommerce_Log',
  FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\SriLankanEcommerce.ldf',
  SIZE = 10MB,
  MAXSIZE = 100MB,
  FILEGROWTH = 1MB );
GO

-- Use the new database
USE SriLankanEcommerce;
GO

PRINT 'Database SriLankanEcommerce created successfully!';
