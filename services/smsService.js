// backend/services/smsService.js
const axios = require("axios");

// =============================================
// Send SMS using SSL Wireless API
// =============================================
const sendSMS = async (phone, otp) => {
  try {
    // Get API credentials from .env
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID;
    const apiUrl =
      process.env.SMS_API_URL ||
      "https://sms.sslwireless.com/pushapi/dynamic/server.php";

    // Check if credentials exist
    if (!apiKey || !senderId) {
      console.error("❌ SMS API credentials not configured!");
      return {
        success: false,
        message: "SMS service not configured",
      };
    }

    // Format phone number (remove leading 0 and add 880)
    let formattedPhone = phone;
    if (phone.startsWith("0")) {
      formattedPhone = "88" + phone.substring(1);
    } else if (!phone.startsWith("880")) {
      formattedPhone = "880" + phone;
    }

    // Message content
    const message = `Your Tarabiyah verification code is: ${otp}. This code will expire in 5 minutes.`;

    console.log(`📱 Sending SMS to: ${formattedPhone}`);
    console.log(`📝 Message: ${message}`);

    // SSL Wireless API Request
    const response = await axios.post(
      apiUrl,
      {
        api_token: apiKey,
        sid: senderId,
        msisdn: formattedPhone,
        sms: message,
        csms_id: Date.now().toString(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    console.log("📨 SMS API Response:", response.data);

    // Check response
    if (
      response.data.status === "SUCCESS" ||
      response.data.status === "success"
    ) {
      return {
        success: true,
        message: "SMS sent successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "SMS sending failed",
      };
    }
  } catch (error) {
    console.error("❌ SMS Send Error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.message || "SMS sending failed",
    };
  }
};

// =============================================
// Test SMS (Development Mode)
// =============================================
const sendTestSMS = async (phone, otp) => {
  console.log(`📱 [TEST] OTP for ${phone}: ${otp}`);
  return {
    success: true,
    message: "Test SMS sent (development mode)",
    otp: otp,
  };
};

module.exports = {
  sendSMS,
  sendTestSMS,
};
