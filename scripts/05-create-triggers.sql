-- Create triggers for automatic operations
-- Run this after creating tables and stored procedures

USE SriLankanEcommerce;
GO

-- Restock Notification Trigger
CREATE TRIGGER RestockNotificationTrigger
ON ProductVariants
AFTER UPDATE
AS
BEGIN
    IF UPDATE(Stock)
    BEGIN
        INSERT INTO RestockNotifications (UserID, ProductID, VariantID)
        SELECT rn.UserID, i.ProductID, i.VariantID
        FROM inserted i
        INNER JOIN RestockNotifications rn ON i.VariantID = rn.VariantID
        WHERE i.Stock > 0 AND rn.IsNotified = 0;
        
        UPDATE RestockNotifications 
        SET IsNotified = 1
        FROM RestockNotifications rn
        INNER JOIN inserted i ON rn.VariantID = i.VariantID
        WHERE i.Stock > 0;
    END
END;
GO

-- Update timestamp trigger for Users
CREATE TRIGGER UpdateUserTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
    UPDATE Users 
    SET UpdatedAt = GETDATE()
    FROM Users u
    INNER JOIN inserted i ON u.UserID = i.UserID;
END;
GO

-- Update timestamp trigger for Products
CREATE TRIGGER UpdateProductTimestamp
ON Products
AFTER UPDATE
AS
BEGIN
    UPDATE Products 
    SET UpdatedAt = GETDATE()
    FROM Products p
    INNER JOIN inserted i ON p.ProductID = i.ProductID;
END;
GO

-- Update timestamp trigger for Orders
CREATE TRIGGER UpdateOrderTimestamp
ON Orders
AFTER UPDATE
AS
BEGIN
    UPDATE Orders 
    SET UpdatedAt = GETDATE()
    FROM Orders o
    INNER JOIN inserted i ON o.OrderID = i.OrderID;
END;
GO

PRINT 'All triggers created successfully!';
