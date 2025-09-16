-- Update some products with festival tags
USE SriLankanEcommerce;
GO

-- Update products with festival tags based on names
UPDATE Products SET Festival = 'Avurudu' WHERE ProductName LIKE '%Avurudu%' OR ProductName LIKE '%New Year%';
UPDATE Products SET Festival = 'Vesak' WHERE ProductName LIKE '%Vesak%' OR ProductName LIKE '%Poya%';
UPDATE Products SET Festival = 'Christmas' WHERE ProductName LIKE '%Christmas%';
UPDATE Products SET Festival = 'Deepavali' WHERE ProductName LIKE '%Deepavali%' OR ProductName LIKE '%Diwali%';

-- Update specific products if they exist
UPDATE Products SET Festival = 'Avurudu' WHERE ProductID IN (1, 2, 3); -- Assuming some IDs
UPDATE Products SET Festival = 'Vesak' WHERE ProductID IN (4, 5);

PRINT 'Festival tags updated successfully!';
