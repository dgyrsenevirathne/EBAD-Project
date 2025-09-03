const jwt = require("jsonwebtoken")
const { getPool, sql } = require("../config/database")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verify user still exists and is active
    const pool = getPool()
    const result = await pool
      .request()
      .input("userID", sql.Int, decoded.userID)
      .query("SELECT UserID, Email, UserType, IsActive FROM Users WHERE UserID = @userID AND IsActive = 1")

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      })
    }

    req.user = result.recordset[0]
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user.UserType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    })
  }
  next()
}

const requireWholesale = (req, res, next) => {
  if (req.user.UserType !== "wholesale" && req.user.UserType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Wholesale access required",
    })
  }
  next()
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireWholesale,
}
