const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCollection } = require("../config/db");

// =============================================
// ✅ STUDENT REGISTRATION - FIXED
// =============================================
router.post("/register/student", async (req, res) => {
  try {
    console.log("========================================");
    console.log("📝 STUDENT REGISTRATION REQUEST");
    console.log("📦 Request Body:", req.body);

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

    // ✅ Validate required fields
    if (!name || !phone || !password || !className) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "নাম, ফোন নম্বর, পাসওয়ার্ড এবং ক্লাস আবশ্যক!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!",
      });
    }

    if (phone.length < 11) {
      return res.status(400).json({
        success: false,
        message: "ফোন নম্বরটি ১১ ডিজিটের হতে হবে!",
      });
    }

    // ✅ Get students collection
    const studentsCollection = getCollection("students");
    console.log("✅ Connected to students collection");

    // ✅ Check if phone already exists
    const existingPhone = await studentsCollection.findOne({ phone });
    if (existingPhone) {
      console.log("❌ Phone already exists:", phone);
      return res.status(400).json({
        success: false,
        message: "এই ফোন নম্বরটি ইতিমধ্যে রেজিস্টার করা আছে!",
      });
    }

    // ✅ Check if email exists (if provided)
    if (email) {
      const existingEmail = await studentsCollection.findOne({ email });
      if (existingEmail) {
        console.log("❌ Email already exists:", email);
        return res.status(400).json({
          success: false,
          message: "এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হচ্ছে!",
        });
      }
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create student document - FIXED: username = null instead of empty string
    const newStudent = {
      name: name.trim(),
      email: email ? email.trim() : "",
      phone: phone.trim(),
      password: hashedPassword,
      status: "Pending",
      class: className.trim(),
      roll: "", // ✅ Keep as empty string
      username: null, // ✅ IMPORTANT: Use null instead of empty string
      address: address ? address.trim() : "",
      guardianName: guardianName ? guardianName.trim() : "",
      guardianPhone: guardianPhone ? guardianPhone.trim() : "",
      enrolledCourses: [],
      progress: [],
      admissionDate: new Date(),
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("📝 Creating student document:");
    console.log("   - Name:", newStudent.name);
    console.log("   - Phone:", newStudent.phone);
    console.log("   - Class:", newStudent.class);
    console.log("   - Status:", newStudent.status);
    console.log("   - Username:", newStudent.username); // ✅ Will show null

    // ✅ Insert into students collection
    const result = await studentsCollection.insertOne(newStudent);
    console.log("✅ Student inserted with ID:", result.insertedId);

    // ✅ Verify insertion
    const insertedStudent = await studentsCollection.findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } },
    );

    if (insertedStudent) {
      console.log("✅ Student found in students collection:");
      console.log("   - ID:", insertedStudent._id);
      console.log("   - Name:", insertedStudent.name);
      console.log("   - Phone:", insertedStudent.phone);
      console.log("   - Status:", insertedStudent.status);
    } else {
      console.log("❌ Student NOT found after insertion!");
      return res.status(500).json({
        success: false,
        message: "Student registration failed! Please try again.",
      });
    }

    console.log("✅ Registration successful!");
    console.log("========================================");

    // ✅ Send success response
    res.status(201).json({
      success: true,
      message: "✅ Registration successful! Waiting for admin approval.",
      user: insertedStudent,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    console.error("Error Details:", error.stack);

    // ✅ Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "unknown";
      return res.status(400).json({
        success: false,
        message: `এই ${field} ইতিমধ্যে ব্যবহার করা হচ্ছে!`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "রেজিস্ট্রেশন ব্যর্থ! আবার চেষ্টা করুন।",
    });
  }
});

// =============================================
// ✅ GET ALL STUDENTS (For testing)
// =============================================
router.get("/students/all", async (req, res) => {
  try {
    console.log("🔍 GET ALL STUDENTS (Testing)");

    const studentsCollection = getCollection("students");
    const students = await studentsCollection.find({}).toArray();

    console.log(`✅ Found ${students.length} students`);

    const sanitized = students.map((s) => {
      delete s.password;
      return s;
    });

    res.status(200).json({
      success: true,
      count: students.length,
      students: sanitized,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
