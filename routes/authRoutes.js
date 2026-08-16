// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { getCollection } = require("../config/db");

console.log("✅ Auth routes loaded");

// =============================================
// ✅ STUDENT REGISTRATION (via auth route)
// =============================================
router.post("/register/student", async (req, res) => {
  try {
    console.log("📥 POST /api/auth/register/student called");
    console.log("📤 Received Body:", req.body);

    const {
      name,
      email,
      phone,
      password,
      course,
      presentAddress,
      permanentAddress,
      dobOrNid,
      guardianName,
      guardianPhone,
    } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !course) {
      return res.status(400).json({
        success: false,
        message: "নাম, ইমেইল, ফোন নম্বর, পাসওয়ার্ড এবং কোর্স আবশ্যক!",
      });
    }

    if (phone.length < 11) {
      return res.status(400).json({
        success: false,
        message: "ফোন নম্বরটি ১১ ডিজিটের হতে হবে!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!",
      });
    }

    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
      console.error("❌ Students collection not found!");
      return res.status(500).json({
        success: false,
        message: "Database collection not found!",
      });
    }

    // Check if phone or email exists
    const existingStudent = await studentsCollection.findOne({
      $or: [{ phone: phone }, { email: email }],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message:
          "এই ফোন নম্বর অথবা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রেজিস্টার্ড করা আছে!",
      });
    }

    // Create new student
    const newStudent = {
      name,
      email,
      phone,
      password,
      course,
      presentAddress: presentAddress || "",
      permanentAddress: permanentAddress || "",
      dobOrNid: dobOrNid || "",
      guardianName: guardianName || "",
      guardianPhone: guardianPhone || "",
      status: "Pending",
      roll: "",
      username: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await studentsCollection.insertOne(newStudent);
    console.log("✅ Student registered successfully:", result.insertedId);

    res.status(201).json({
      success: true,
      message:
        "রেজিস্ট্রেশন সফল হয়েছে! অ্যাডমিন অ্যাপ্রুভ করার পর আপনি লগইন করতে পারবেন।",
      studentId: result.insertedId,
    });
  } catch (error) {
    console.error("❌ Error in student registration:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
