const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCollection } = require("../config/db");

// =============================================
// ✅ STUDENT REGISTRATION (Separate Collection)
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

    // ✅ Get MongoDB Collections
    const studentsCollection = getCollection("students"); // ✅ আলাদা collection
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

    // ✅ Create student document
    const newStudent = {
      name: name.trim(),
      email: email ? email.trim() : "",
      phone: phone.trim(),
      password: hashedPassword,
      status: "Pending", // ✅ Admin needs to approve
      class: className.trim(),
      roll: "",
      username: "", // ✅ Admin will set username
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

    res.status(201).json({
      success: true,
      message: "✅ Registration successful! Waiting for admin approval.",
      user: insertedStudent,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    console.error("Error Details:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "রেজিস্ট্রেশন ব্যর্থ! আবার চেষ্টা করুন।",
    });
  }
});

// =============================================
// ✅ STUDENT LOGIN WITH USERNAME
// =============================================
router.post("/student/login", async (req, res) => {
  try {
    console.log("========================================");
    console.log("🔑 STUDENT LOGIN REQUEST");
    console.log("📝 Username:", req.body.username);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "ইউজারনেম এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    // ✅ Get students collection
    const studentsCollection = getCollection("students");

    // Find student by username
    const student = await studentsCollection.findOne({
      username: username,
    });

    if (!student) {
      console.log("❌ Student not found with username:", username);
      return res.status(401).json({
        success: false,
        message: "❌ ভুল ইউজারনেম বা পাসওয়ার্ড!",
      });
    }

    console.log("✅ Student found:", student.name);

    // Check status
    if (student.status === "Pending") {
      console.log("❌ Account pending approval");
      return res.status(403).json({
        success: false,
        message: "⏳ আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি!",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(401).json({
        success: false,
        message: "❌ ভুল ইউজারনেম বা পাসওয়ার্ড!",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: student._id,
        email: student.email,
        role: "student",
        username: student.username,
      },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" },
    );

    const { password: _, ...studentWithoutPassword } = student;

    console.log("✅ Login successful for:", student.username);
    console.log("========================================");

    res.status(200).json({
      success: true,
      message: "✅ Login successful!",
      token,
      user: studentWithoutPassword,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "লগইন ব্যর্থ!",
    });
  }
});

module.exports = router;
