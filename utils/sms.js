const twilio = require("twilio")

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map()

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const sendOTP = async (phoneNumber) => {
  try {
    const otp = generateOTP()

    // Store OTP with 5-minute expiry
    otpStore.set(phoneNumber, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    })

    // Send SMS via Twilio
    await client.messages.create({
      body: `Your Sri Lankan Fashion Store verification code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    })

    console.log(`OTP sent to ${phoneNumber}: ${otp}`)
    return true
  } catch (error) {
    console.error("SMS sending error:", error)
    return false
  }
}

const verifyOTP = async (phoneNumber, otp) => {
  try {
    const storedData = otpStore.get(phoneNumber)

    if (!storedData) {
      return false
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(phoneNumber)
      return false
    }

    if (storedData.otp === otp) {
      otpStore.delete(phoneNumber)
      return true
    }

    return false
  } catch (error) {
    console.error("OTP verification error:", error)
    return false
  }
}

module.exports = {
  sendOTP,
  verifyOTP,
}
