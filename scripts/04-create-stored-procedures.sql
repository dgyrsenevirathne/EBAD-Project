-- Create stored procedures for Sri Lankan E-commerce Platform
-- Run this after creating tables and indexes

USE SriLankanEcommerce;
GO

-- Process Order and Update Points
CREATE PROCEDURE ProcessOrderAndPoints
    @UserID INT,
    @OrderID INT,
    @OrderAmount DECIMAL(10,2)
AS
BEGIN
    DECLARE @PointsEarned INT = FLOOR(@OrderAmount / 100); -- 1 point per LKR 100
    
    -- Add loyalty transaction
    INSERT INTO LoyaltyTransactions (UserID, Points, TransactionType, ReferenceID, Description)
    VALUES (@UserID, @PointsEarned, 'purchase', @OrderID, 'Points earned from order');
    
    -- Update loyalty balance
    UPDATE LoyaltyProgram 
    SET Points = Points + @PointsEarned,
        TotalEarned = TotalEarned + @PointsEarned
    WHERE UserID = @UserID;
    
    -- Update order with points earned
    UPDATE Orders 
    SET PointsEarned = @PointsEarned 
    WHERE OrderID = @OrderID;
END;
GO

-- Get Wholesale Pricing
CREATE PROCEDURE GetWholesalePricing
    @ProductID INT,
    @Quantity INT
AS
BEGIN
    SELECT p.*,
           CASE 
               WHEN @Quantity >= 100 THEN p.WholesalePrice * 0.8  -- 20% off for 100+
               WHEN @Quantity >= 50 THEN p.WholesalePrice * 0.9   -- 10% off for 50+
               ELSE p.WholesalePrice
           END AS FinalPrice
    FROM Products p
    WHERE p.ProductID = @ProductID;
END;
GO

-- Get Sales Analytics
CREATE PROCEDURE GetSalesAnalytics
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SELECT 
        COUNT(*) as TotalOrders,
        SUM(TotalAmount) as TotalRevenue,
        AVG(TotalAmount) as AvgOrderValue
    FROM Orders 
    WHERE CAST(CreatedAt AS DATE) >= @StartDate 
    AND CAST(CreatedAt AS DATE) <= @EndDate
    AND OrderStatus != 'cancelled';
END;
GO

-- Get Top Selling Products
CREATE PROCEDURE GetTopSellingProducts
    @TopCount INT = 10
AS
BEGIN
    SELECT TOP (@TopCount)
        p.ProductName,
        SUM(oi.Quantity) as TotalSold,
        SUM(oi.TotalPrice) as Revenue
    FROM OrderItems oi
    INNER JOIN Products p ON oi.ProductID = p.ProductID
    INNER JOIN Orders o ON oi.OrderID = o.OrderID
    WHERE o.OrderStatus != 'cancelled'
    GROUP BY p.ProductID, p.ProductName
    ORDER BY TotalSold DESC;
END;
GO

-- Get Low Stock Alerts
CREATE PROCEDURE GetLowStockAlerts
    @StockThreshold INT = 10
AS
BEGIN
    SELECT p.ProductName, pv.Size, pv.Color, pv.Stock
    FROM ProductVariants pv
    INNER JOIN Products p ON pv.ProductID = p.ProductID
    WHERE pv.Stock <= @StockThreshold AND pv.IsActive = 1
    ORDER BY pv.Stock ASC;
END;
GO

PRINT 'All stored procedures created successfully!';
