// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCollection } = require("../config/db");

// =============================================
// Generate OTP
// =============================================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP temporarily
let otpStore = {};

// =============================================
// SEND OTP
// =============================================
router.post("/send-otp", async (req, res) => {
  try {
    console.log("========================================");
    console.log("📱 SEND OTP Request Received");
    console.log("📝 Request Body:", req.body);

    const { phone } = req.body;
    console.log("📱 Phone Number:", phone);

    if (!phone) {
      console.log("❌ Phone number is missing");
      return res.status(400).json({
        success: false,
        message: "ফোন নম্বর আবশ্যক!",
      });
    }

    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne({ phone });
    console.log("👤 User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ User not found for phone:", phone);
      return res.status(404).json({
        success: false,
        message: "এই ফোন নম্বরটি রেজিস্টার করা নেই!",
      });
    }

    const otp = generateOTP();
    console.log("🔑 Generated OTP:", otp);

    otpStore[phone] = {
      otp: otp,
      expiresAt: Date.now() + 300000,
    };

    console.log("========================================");
    console.log(`✅ OTP for ${phone}: ${otp}`);
    console.log(`⏰ Expires in: 5 minutes`);
    console.log("========================================");

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your phone!",
      otp: otp,
    });
  } catch (error) {
    console.error("❌ OTP Send Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "OTP পাঠানো সম্ভব হয়নি!",
    });
  }
});

// =============================================
// VERIFY OTP
// =============================================
router.post("/verify-otp", async (req, res) => {
  try {
    console.log("========================================");
    console.log("🔍 VERIFY OTP Request Received");
    console.log("📝 Request Body:", req.body);

    const { phone, otp } = req.body;
    console.log("📱 Phone:", phone);
    console.log("🔑 OTP:", otp);

    if (!phone || !otp) {
      console.log("❌ Phone or OTP missing");
      return res.status(400).json({
        success: false,
        message: "ফোন নম্বর এবং OTP আবশ্যক!",
      });
    }

    const storedData = otpStore[phone];
    console.log("📦 Stored Data:", storedData);

    if (!storedData) {
      console.log("❌ OTP not found for phone:", phone);
      return res.status(400).json({
        success: false,
        message: "OTP পাওয়া যায়নি! নতুন OTP রিকোয়েস্ট করুন।",
      });
    }

    const currentTime = Date.now();
    if (currentTime > storedData.expiresAt) {
      console.log("❌ OTP Expired");
      delete otpStore[phone];
      return res.status(400).json({
        success: false,
        message: "OTP এর মেয়াদ শেষ! নতুন OTP রিকোয়েস্ট করুন।",
      });
    }

    if (storedData.otp !== otp) {
      console.log("❌ OTP Mismatch");
      return res.status(400).json({
        success: false,
        message: "ভুল OTP! আবার চেষ্টা করুন।",
      });
    }

    console.log("✅ OTP Verified Successfully");

    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne(
      { phone },
      { projection: { password: 0 } },
    );

    if (!user) {
      console.log("❌ User not found after OTP verification");
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    delete otpStore[phone];
    console.log("🗑️ OTP Removed from Store");

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" },
    );

    console.log("✅ Login Successful!");
    console.log("========================================");

    res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
      token: token,
      user: user,
    });
  } catch (error) {
    console.error("❌ OTP Verify Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "OTP ভেরিফাই করা সম্ভব হয়নি!",
    });
  }
});

// =============================================
// Student Registration
// =============================================
router.post("/register/student", async (req, res) => {
  try {
    console.log("📝 Registration Request Received:", {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    });

    const {
      name,
      email,
      phone,
      password,
      class: className,
      address,
      guardianName,
      guardianPhone,
    } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "নাম, ফোন নম্বর এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    const usersCollection = getCollection("users");

    const existingUser = await usersCollection.findOne({
      $or: [{ email: email || "" }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "এই ইমেইল বা ফোন নম্বর ইতিমধ্যে রেজিস্টার করা আছে!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      email: email || "",
      phone,
      password: hashedPassword,
      role: "student",
      status: "Pending",
      class: className || "",
      roll: "",
      address: address || "",
      guardianName: guardianName || "",
      guardianPhone: guardianPhone || "",
      enrolledCourses: [],
      progress: [],
      admissionDate: new Date(),
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    console.log("✅ Student Registered:", {
      id: result.insertedId,
      phone,
      name,
    });

    const token = jwt.sign(
      { id: result.insertedId, email: email || phone, role: "student" },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" },
    );

    delete newUser.password;

    res.status(201).json({
      success: true,
      message: "Student registered successfully!",
      token,
      user: {
        id: result.insertedId,
        ...newUser,
      },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);

    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "এই ফোন নম্বর বা ইমেইল ইতিমধ্যে রেজিস্টার করা আছে!",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "রেজিস্ট্রেশন ব্যর্থ! আবার চেষ্টা করুন।",
    });
  }
});

// =============================================
// Student Login with Phone
// =============================================
router.post("/login/student", async (req, res) => {
  try {
    console.log("🔑 Login Request Received:", { phone: req.body.phone });

    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "ফোন নম্বর এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne({ phone });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "এই ফোন নম্বরটি রেজিস্টার করা নেই!",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "এই অ্যাকাউন্টটি স্টুডেন্ট অ্যাকাউন্ট নয়!",
      });
    }

    if (user.status === "Pending") {
      return res.status(403).json({
        success: false,
        message:
          "আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি! অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "ভুল পাসওয়ার্ড!",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: "student" },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" },
    );

    delete user.password;

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "লগইন ব্যর্থ! আবার চেষ্টা করুন।",
    });
  }
});

// =============================================
// Student Login with Username (Admin created)
// =============================================
router.post("/student/login", async (req, res) => {
  try {
    console.log("🔑 Student Login with Username:", {
      username: req.body.username,
    });

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "ইউজারনেম এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    const usersCollection = getCollection("users");

    const user = await usersCollection.findOne({
      $or: [{ username: username }, { phone: username }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "ভুল ইউজারনেম বা পাসওয়ার্ড!",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "এই অ্যাকাউন্টটি স্টুডেন্ট অ্যাকাউন্ট নয়!",
      });
    }

    if (user.status === "Pending") {
      return res.status(403).json({
        success: false,
        message:
          "আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি! অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "আপনার অ্যাকাউন্ট নিষ্ক্রিয়! অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "ভুল ইউজারনেম বা পাসওয়ার্ড!",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: "student" },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" },
    );

    delete user.password;

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "লগইন ব্যর্থ! আবার চেষ্টা করুন।",
    });
  }
});

// =============================================
// Get Student Profile
// =============================================
router.get("/student/profile/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    console.log("📱 Fetching Profile for:", phone);

    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne(
      { phone, role: "student" },
      { projection: { password: 0 } },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "প্রোফাইল লোড করতে ব্যর্থ!",
    });
  }
});

module.exports = router;
