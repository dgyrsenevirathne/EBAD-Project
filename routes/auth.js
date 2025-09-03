const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const { getPool, sql } = require("../config/database")
const { sendOTP, verifyOTP } = require("../utils/sms")
const { generateReferralCode } = require("../utils/helpers")

const router = express.Router()

// Register new user
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("phone").isMobilePhone("any"),
    body("password").isLength({ min: 6 }),
    body("firstName").trim().isLength({ min: 1 }),
    body("lastName").trim().isLength({ min: 1 }),
    body("userType").optional().isIn(["customer", "wholesale"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        })
      }

      const { email, phone, password, firstName, lastName, userType = "customer", referralCode } = req.body
      const pool = getPool()

      // Check if user already exists
      const existingUser = await pool
        .request()
        .input("email", sql.NVarChar, email)
        .input("phone", sql.NVarChar, phone)
        .query("SELECT UserID FROM Users WHERE Email = @email OR Phone = @phone")

      if (existingUser.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email or phone",
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)
      const newReferralCode = generateReferralCode()

      // Create user
      const userResult = await pool
        .request()
        .input("email", sql.NVarChar, email)
        .input("phone", sql.NVarChar, phone)
        .input("password", sql.NVarChar, hashedPassword)
        .input("firstName", sql.NVarChar, firstName)
        .input("lastName", sql.NVarChar, lastName)
        .input("userType", sql.NVarChar, userType)
        .query(`
        INSERT INTO Users (Email, Phone, Password, FirstName, LastName, UserType)
        OUTPUT INSERTED.UserID
        VALUES (@email, @phone, @password, @firstName, @lastName, @userType)
      `)

      const userID = userResult.recordset[0].UserID

      // Create loyalty account
      await pool
        .request()
        .input("userID", sql.Int, userID)
        .input("referralCode", sql.NVarChar, newReferralCode)
        .query("INSERT INTO LoyaltyProgram (UserID, ReferralCode) VALUES (@userID, @referralCode)")

      // Process referral if provided
      if (referralCode) {
        const referrer = await pool
          .request()
          .input("referralCode", sql.NVarChar, referralCode)
          .query("SELECT UserID FROM LoyaltyProgram WHERE ReferralCode = @referralCode")

        if (referrer.recordset.length > 0) {
          const referrerID = referrer.recordset[0].UserID

          // Add referral points to referrer
          await pool
            .request()
            .input("userID", sql.Int, referrerID)
            .input("points", sql.Int, 50)
            .input("transactionType", sql.NVarChar, "referral")
            .input("description", sql.NVarChar, `Referral bonus for inviting ${firstName}`)
            .query(`
            INSERT INTO LoyaltyTransactions (UserID, Points, TransactionType, Description)
            VALUES (@userID, @points, @transactionType, @description)
          `)

          await pool
            .request()
            .input("userID", sql.Int, referrerID)
            .input("points", sql.Int, 50)
            .query(`
            UPDATE LoyaltyProgram 
            SET Points = Points + @points, TotalEarned = TotalEarned + @points
            WHERE UserID = @userID
          `)
        }
      }

      // Generate JWT token
      const token = jwt.sign({ userID, email, userType }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          token,
          user: {
            userID,
            email,
            firstName,
            lastName,
            userType,
            referralCode: newReferralCode,
          },
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Registration failed",
      })
    }
  },
)

// Login with email/password
router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").exists()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { email, password } = req.body
    const pool = getPool()

    // Find user
    const userResult = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT u.UserID, u.Email, u.Password, u.FirstName, u.LastName, u.UserType, u.IsActive,
               lp.Points, lp.ReferralCode
        FROM Users u
        LEFT JOIN LoyaltyProgram lp ON u.UserID = lp.UserID
        WHERE u.Email = @email AND u.IsActive = 1
      `)

    if (userResult.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const user = userResult.recordset[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.Password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userID: user.UserID, email: user.Email, userType: user.UserType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          userID: user.UserID,
          email: user.Email,
          firstName: user.FirstName,
          lastName: user.LastName,
          userType: user.UserType,
          points: user.Points || 0,
          referralCode: user.ReferralCode,
        },
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Login failed",
    })
  }
})

// Send OTP for phone login
router.post("/send-otp", [body("phone").isMobilePhone("any")], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      })
    }

    const { phone } = req.body

    // Send OTP via SMS
    const otpSent = await sendOTP(phone)

    if (otpSent) {
      res.json({
        success: true,
        message: "OTP sent successfully",
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      })
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    })
  }
})

// Verify OTP and login
router.post(
  "/verify-otp",
  [body("phone").isMobilePhone("any"), body("otp").isLength({ min: 4, max: 6 })],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        })
      }

      const { phone, otp } = req.body

      // Verify OTP
      const isValidOTP = await verifyOTP(phone, otp)
      if (!isValidOTP) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        })
      }

      const pool = getPool()

      // Find user by phone
      const userResult = await pool
        .request()
        .input("phone", sql.NVarChar, phone)
        .query(`
        SELECT u.UserID, u.Email, u.FirstName, u.LastName, u.UserType, u.IsActive,
               lp.Points, lp.ReferralCode
        FROM Users u
        LEFT JOIN LoyaltyProgram lp ON u.UserID = lp.UserID
        WHERE u.Phone = @phone AND u.IsActive = 1
      `)

      if (userResult.recordset.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      const user = userResult.recordset[0]

      // Generate JWT token
      const token = jwt.sign(
        { userID: user.UserID, email: user.Email, userType: user.UserType },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )

      res.json({
        success: true,
        message: "OTP verification successful",
        data: {
          token,
          user: {
            userID: user.UserID,
            email: user.Email,
            firstName: user.FirstName,
            lastName: user.LastName,
            userType: user.UserType,
            points: user.Points || 0,
            referralCode: user.ReferralCode,
          },
        },
      })
    } catch (error) {
      console.error("OTP verification error:", error)
      res.status(500).json({
        success: false,
        message: "OTP verification failed",
      })
    }
  },
)

module.exports = router
