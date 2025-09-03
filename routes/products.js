const express = require("express")
const { query, param } = require("express-validator")
const { getPool, sql } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get all products with filters
router.get(
  "/",
  [
    query("category").optional().isInt(),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("search").optional().trim(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("sortBy").optional().isIn(["name", "price", "created", "featured"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  async (req, res) => {
    try {
      const {
        category,
        minPrice,
        maxPrice,
        search,
        page = 1,
        limit = 20,
        sortBy = "created",
        sortOrder = "desc",
      } = req.query

      const pool = getPool()
      const whereConditions = ["p.IsActive = 1"]
      const queryParams = {}

      // Build WHERE conditions
      if (category) {
        whereConditions.push("p.CategoryID = @category")
        queryParams.category = { type: sql.Int, value: Number.parseInt(category) }
      }

      if (minPrice) {
        whereConditions.push("p.BasePrice >= @minPrice")
        queryParams.minPrice = { type: sql.Decimal(10, 2), value: Number.parseFloat(minPrice) }
      }

      if (maxPrice) {
        whereConditions.push("p.BasePrice <= @maxPrice")
        queryParams.maxPrice = { type: sql.Decimal(10, 2), value: Number.parseFloat(maxPrice) }
      }

      if (search) {
        whereConditions.push("(p.ProductName LIKE @search OR p.Description LIKE @search)")
        queryParams.search = { type: sql.NVarChar, value: `%${search}%` }
      }

      // Build ORDER BY clause
      let orderBy = "p.CreatedAt DESC"
      switch (sortBy) {
        case "name":
          orderBy = `p.ProductName ${sortOrder.toUpperCase()}`
          break
        case "price":
          orderBy = `p.BasePrice ${sortOrder.toUpperCase()}`
          break
        case "featured":
          orderBy = `p.IsFeatured DESC, p.CreatedAt ${sortOrder.toUpperCase()}`
          break
      }

      const offset = (page - 1) * limit

      const query = `
      SELECT 
        p.*,
        c.CategoryName,
        pi.ImageURL as PrimaryImage,
        (SELECT COUNT(*) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) as VariantCount,
        (SELECT SUM(pv.Stock) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) as TotalStock
      FROM Products p
      LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
      LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY ${orderBy}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `

      const countQuery = `
      SELECT COUNT(*) as total
      FROM Products p
      WHERE ${whereConditions.join(" AND ")}
    `

      const request = pool.request()

      // Add parameters
      Object.entries(queryParams).forEach(([key, param]) => {
        request.input(key, param.type, param.value)
      })

      request.input("offset", sql.Int, offset)
      request.input("limit", sql.Int, Number.parseInt(limit))

      const [productsResult, countResult] = await Promise.all([request.query(query), request.query(countQuery)])

      const totalProducts = countResult.recordset[0].total
      const totalPages = Math.ceil(totalProducts / limit)

      res.json({
        success: true,
        data: {
          products: productsResult.recordset,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages,
            totalProducts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      })
    } catch (error) {
      console.error("Get products error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      })
    }
  },
)

// Get single product with variants
router.get("/:id", [param("id").isInt()], async (req, res) => {
  try {
    const { id } = req.params
    const pool = getPool()

    // Get product details
    const productResult = await pool
      .request()
      .input("productID", sql.Int, Number.parseInt(id))
      .query(`
        SELECT 
          p.*,
          c.CategoryName
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE p.ProductID = @productID AND p.IsActive = 1
      `)

    if (productResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const product = productResult.recordset[0]

    // Get product variants
    const variantsResult = await pool
      .request()
      .input("productID", sql.Int, Number.parseInt(id))
      .query(`
        SELECT *
        FROM ProductVariants
        WHERE ProductID = @productID AND IsActive = 1
        ORDER BY Size, Color
      `)

    // Get product images
    const imagesResult = await pool
      .request()
      .input("productID", sql.Int, Number.parseInt(id))
      .query(`
        SELECT *
        FROM ProductImages
        WHERE ProductID = @productID
        ORDER BY IsPrimary DESC, DisplayOrder
      `)

    res.json({
      success: true,
      data: {
        ...product,
        variants: variantsResult.recordset,
        images: imagesResult.recordset,
      },
    })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    })
  }
})

// Get featured products
router.get("/featured/list", async (req, res) => {
  try {
    const pool = getPool()

    const result = await pool.request().query(`
        SELECT TOP 12
          p.*,
          c.CategoryName,
          pi.ImageURL as PrimaryImage,
          (SELECT SUM(pv.Stock) FROM ProductVariants pv WHERE pv.ProductID = p.ProductID AND pv.IsActive = 1) as TotalStock
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        LEFT JOIN ProductImages pi ON p.ProductID = pi.ProductID AND pi.IsPrimary = 1
        WHERE p.IsFeatured = 1 AND p.IsActive = 1
        ORDER BY p.CreatedAt DESC
      `)

    res.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error("Get featured products error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
    })
  }
})

// Get categories
router.get("/categories/list", async (req, res) => {
  try {
    const pool = getPool()

    const result = await pool.request().query(`
        SELECT 
          c.*,
          COUNT(p.ProductID) as ProductCount
        FROM Categories c
        LEFT JOIN Products p ON c.CategoryID = p.CategoryID AND p.IsActive = 1
        WHERE c.IsActive = 1
        GROUP BY c.CategoryID, c.CategoryName, c.ParentCategoryID, c.IsActive, c.CreatedAt
        ORDER BY c.CategoryName
      `)

    res.json({
      success: true,
      data: result.recordset,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    })
  }
})

// Request restock notification
router.post(
  "/notify-restock",
  authenticateToken,
  [query("productId").isInt(), query("variantId").optional().isInt()],
  async (req, res) => {
    try {
      const { productId, variantId } = req.body
      const userID = req.user.UserID
      const pool = getPool()

      // Check if notification already exists
      const existingResult = await pool
        .request()
        .input("userID", sql.Int, userID)
        .input("productID", sql.Int, Number.parseInt(productId))
        .input("variantID", sql.Int, variantId ? Number.parseInt(variantId) : null)
        .query(`
        SELECT NotificationID 
        FROM RestockNotifications 
        WHERE UserID = @userID AND ProductID = @productID 
        AND (@variantID IS NULL OR VariantID = @variantID)
        AND IsNotified = 0
      `)

      if (existingResult.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Restock notification already requested",
        })
      }

      // Add notification request
      await pool
        .request()
        .input("userID", sql.Int, userID)
        .input("productID", sql.Int, Number.parseInt(productId))
        .input("variantID", sql.Int, variantId ? Number.parseInt(variantId) : null)
        .query(`
        INSERT INTO RestockNotifications (UserID, ProductID, VariantID)
        VALUES (@userID, @productID, @variantID)
      `)

      res.json({
        success: true,
        message: "Restock notification requested successfully",
      })
    } catch (error) {
      console.error("Restock notification error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to request restock notification",
      })
    }
  },
)

module.exports = router
