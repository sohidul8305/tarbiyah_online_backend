// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCollection } = require("../config/db");

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
      roll,
      address,
      guardianName,
      guardianPhone,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "নাম, ফোন নম্বর এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    // Get users collection
    const usersCollection = getCollection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email: email || "" }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "এই ইমেইল বা ফোন নম্বর ইতিমধ্যে রেজিস্টার করা আছে!",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    const newUser = {
      name,
      email: email || "",
      phone,
      password: hashedPassword,
      role: "student",
      class: className || "",
      roll: roll || "",
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

    // Generate JWT
    const token = jwt.sign(
      { id: result.insertedId, email: email || phone, role: "student" },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" },
    );

    // Remove password from response
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

    // Specific error handling
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "এই ফোন নম্বর বা ইমেইল ইতিমধ্যে রেজিস্টার করা আছে!",
      });
    }

    if (error.message && error.message.includes("buffering timed out")) {
      return res.status(503).json({
        success: false,
        message: "ডেটাবেস সংযোগ সমস্যা! দয়া করে MongoDB Atlas চেক করুন।",
      });
    }

    if (error.message && error.message.includes("not initialized")) {
      return res.status(503).json({
        success: false,
        message: "ডেটাবেস সংযোগ হয়নি! সার্ভার রিস্টার্ট করুন।",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "রেজিস্ট্রেশন ব্যর্থ! আবার চেষ্টা করুন।",
    });
  }
});

// =============================================
// Student Login
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

    // Find user by phone number
    const user = await usersCollection.findOne({ phone });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "এই ফোন নম্বরটি রেজিস্টার করা নেই!",
      });
    }

    // Check if user is a student
    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "এই অ্যাকাউন্টটি স্টুডেন্ট অ্যাকাউন্ট নয়!",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "ভুল পাসওয়ার্ড!",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: "student" },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" },
    );

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);

    if (error.message && error.message.includes("buffering timed out")) {
      return res.status(503).json({
        success: false,
        message: "ডেটাবেস সংযোগ সমস্যা! দয়া করে MongoDB চালু করুন।",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "লগইন ব্যর্থ! আবার চেষ্টা করুন।",
    });
  }
});

// =============================================
// Get Student Profile by Phone
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
