const crypto = require("crypto")

const generateReferralCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase()
}

const generateOrderNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `ORD${timestamp.slice(-6)}${random}`
}

const calculateLoyaltyPoints = (amount) => {
  return Math.floor(amount / 100) // 1 point per LKR 100
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount)
}

module.exports = {
  generateReferralCode,
  generateOrderNumber,
  calculateLoyaltyPoints,
  formatCurrency,
}
