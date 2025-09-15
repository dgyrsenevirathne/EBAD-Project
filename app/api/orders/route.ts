import { NextRequest, NextResponse } from 'next/server'
import sql from 'mssql'
import { sqlConfig } from '@/config/database'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  let pool: sql.ConnectionPool | null = null

  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    let userId = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        userId = decoded.userId
      } catch (error) {
        // Token invalid, treat as guest
      }
    }

    const body = await request.json()
    const {
      cartItems,
      shippingAddress,
      paymentMethod,
      promoCode,
      useLoyaltyPoints,
      loyaltyPointsAvailable,
    } = body

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 })
    }

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ success: false, message: 'Shipping address and payment method are required' }, { status: 400 })
    }

    // Create connection pool
    pool = await new sql.ConnectionPool(sqlConfig).connect()

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.BasePrice * item.Quantity, 0)

    // Calculate discounts
    let promoDiscount = 0
    if (promoCode) {
      // TODO: Validate promo code from Promotions table
      // For now, mock discount
      if (promoCode.toLowerCase() === 'avurudu2024') {
        promoDiscount = 1000
      } else if (promoCode.toLowerCase() === 'welcome10') {
        promoDiscount = subtotal * 0.1
      }
    }

    let pointsDiscount = 0
    let pointsUsed = 0
    if (useLoyaltyPoints && loyaltyPointsAvailable && userId) {
      pointsDiscount = Math.min(loyaltyPointsAvailable * 5, subtotal * 0.2)
      pointsUsed = Math.floor(pointsDiscount / 5)
    }

    // Calculate shipping cost
    const shippingCost = subtotal >= 5000 ? 0 : 500

    // Calculate total
    const total = subtotal - promoDiscount - pointsDiscount + shippingCost

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Insert shipping address
    let addressId = null
    if (userId) {
      const addressResult = await pool.request()
        .input('userId', sql.Int, userId)
        .input('addressLine1', sql.NVarChar, shippingAddress.addressLine1)
        .input('addressLine2', sql.NVarChar, shippingAddress.addressLine2 || '')
        .input('city', sql.NVarChar, shippingAddress.city)
        .input('province', sql.NVarChar, shippingAddress.province)
        .input('postalCode', sql.NVarChar, shippingAddress.postalCode)
        .input('phone', sql.NVarChar, shippingAddress.phone)
        .query(`
          INSERT INTO Addresses (UserID, AddressLine1, AddressLine2, City, Province, PostalCode, Country)
          OUTPUT INSERTED.AddressID
          VALUES (@userId, @addressLine1, @addressLine2, @city, @province, @postalCode, 'Sri Lanka')
        `)
      addressId = addressResult.recordset[0].AddressID
    }

    // Insert order
    const orderResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('orderNumber', sql.NVarChar, orderNumber)
      .input('totalAmount', sql.Decimal(10, 2), total)
      .input('discountAmount', sql.Decimal(10, 2), promoDiscount + pointsDiscount)
      .input('pointsUsed', sql.Int, pointsUsed)
      .input('pointsEarned', sql.Int, Math.floor(total / 100))
      .input('paymentMethod', sql.NVarChar, paymentMethod)
      .input('shippingAddressId', sql.Int, addressId)
      .query(`
        INSERT INTO Orders (UserID, OrderNumber, TotalAmount, DiscountAmount, PointsUsed, PointsEarned, PaymentMethod, ShippingAddressID)
        OUTPUT INSERTED.OrderID
        VALUES (@userId, @orderNumber, @totalAmount, @discountAmount, @pointsUsed, @pointsEarned, @paymentMethod, @shippingAddressId)
      `)

    const orderId = orderResult.recordset[0].OrderID

    // Insert order items
    for (const item of cartItems) {
      await pool.request()
        .input('orderId', sql.Int, orderId)
        .input('productId', sql.Int, item.ProductID)
        .input('variantId', sql.Int, item.VariantID || null)
        .input('quantity', sql.Int, item.Quantity)
        .input('unitPrice', sql.Decimal(10, 2), item.BasePrice)
        .input('totalPrice', sql.Decimal(10, 2), item.BasePrice * item.Quantity)
        .query(`
          INSERT INTO OrderItems (OrderID, ProductID, VariantID, Quantity, UnitPrice, TotalPrice)
          VALUES (@orderId, @productId, @variantId, @quantity, @unitPrice, @totalPrice)
        `)
    }

    // Update loyalty points if user is logged in
    if (userId) {
      // Deduct used points
      if (pointsUsed > 0) {
        await pool.request()
          .input('userId', sql.Int, userId)
          .input('pointsUsed', sql.Int, pointsUsed)
          .query(`
            UPDATE LoyaltyProgram
            SET Points = Points - @pointsUsed, TotalSpent = TotalSpent + @pointsUsed
            WHERE UserID = @userId
          `)
      }

      // Add earned points
      const pointsEarned = Math.floor(total / 100)
      if (pointsEarned > 0) {
        await pool.request()
          .input('userId', sql.Int, userId)
          .input('pointsEarned', sql.Int, pointsEarned)
          .query(`
            UPDATE LoyaltyProgram
            SET Points = Points + @pointsEarned, TotalEarned = TotalEarned + @pointsEarned
            WHERE UserID = @userId
          `)

        // Record loyalty transaction for earned points
        await pool.request()
          .input('userId', sql.Int, userId)
          .input('points', sql.Int, pointsEarned)
          .input('transactionType', sql.NVarChar, 'purchase')
          .input('referenceId', sql.Int, orderId)
          .input('description', sql.NVarChar, `Points earned from order ${orderNumber}`)
          .query(`
            INSERT INTO LoyaltyTransactions (UserID, Points, TransactionType, ReferenceID, Description)
            VALUES (@userId, @points, @transactionType, @referenceId, @description)
          `)
      }

      // Record loyalty transaction for spent points
      if (pointsUsed > 0) {
        await pool.request()
          .input('userId', sql.Int, userId)
          .input('points', sql.Int, -pointsUsed)
          .input('transactionType', sql.NVarChar, 'redemption')
          .input('referenceId', sql.Int, orderId)
          .input('description', sql.NVarChar, `Points redeemed for order ${orderNumber}`)
          .query(`
            INSERT INTO LoyaltyTransactions (UserID, Points, TransactionType, ReferenceID, Description)
            VALUES (@userId, @points, @transactionType, @referenceId, @description)
          `)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderId: orderId,
      orderNumber: orderNumber
    })
  } catch (error) {
    console.error('Failed to place order:', error)
    return NextResponse.json({ success: false, message: 'Failed to place order' }, { status: 500 })
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}
