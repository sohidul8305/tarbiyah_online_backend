const express = require("express");
const router = express.Router();
const { getCollection } = require("../config/db");

console.log("✅ Student routes loaded");

// =============================================
// ✅ GET ALL STUDENTS (Public)
// =============================================
router.get("/all", async (req, res) => {
  try {
    console.log("📥 GET /api/students/all called");

    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
      console.error("❌ Students collection not found!");
      return res.status(500).json({
        success: false,
        message: "Database collection not found!",
      });
    }

    // Get all students
    const students = await studentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${students.length} students`);

    // Remove password field
    const sanitizedStudents = students.map((s) => {
      const { password, ...rest } = s;
      return rest;
    });

    res.status(200).json({
      success: true,
      total: students.length,
      students: sanitizedStudents,
    });
  } catch (error) {
    console.error("❌ Error in /all:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
});

// =============================================
// ✅ INSERT TEST STUDENT
// =============================================
router.post("/add-test", async (req, res) => {
  try {
    console.log("📥 POST /api/students/add-test called");

    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
      console.error("❌ Students collection not found!");
      return res.status(500).json({
        success: false,
        message: "Database collection not found!",
      });
    }

    const testStudent = {
      name: "Test Student " + new Date().toLocaleTimeString(),
      phone: "017" + Math.floor(Math.random() * 100000000),
      email: "test" + Date.now() + "@test.com",
      class: "Class 8",
      guardianName: "Test Guardian",
      guardianPhone: "017" + Math.floor(Math.random() * 100000000),
      address: "Dhaka, Bangladesh",
      status: "Pending",
      roll: "",
      username: "",
      password: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await studentsCollection.insertOne(testStudent);

    console.log("✅ Test student added:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "Test student added successfully!",
      student: {
        ...testStudent,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("❌ Error in /add-test:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// routes/studentRoutes.js - /register/student route

router.post("/register/student", async (req, res) => {
  try {
    console.log("📥 POST /api/students/register/student called");
    console.log("📤 Received Body:", req.body);

    const {
      // Personal Information
      name,
      email,
      phone,
      password,
      course,

      // Family Information
      fatherName,
      motherName,
      guardianName,
      guardianPhone,

      // Address
      presentAddress,
      permanentAddress,

      // Additional Information
      dobOrNid,
      gender,
      occupation,
      maritalStatus,
      age,

      // ✅ Payment Information - এই ফিল্ডগুলো আসছে কিনা চেক করুন
      paymentMethod,
      paymentType,
      transactionId,
      paidAmount,
      paymentRemarks,
      paymentStatus,

      // Status
      status = "Pending",
      admissionDate,
    } = req.body;

    // ✅ ডিবাগ করার জন্য কনসোল লগ - দেখুন ডেটা আসছে কিনা
    console.log("📤 ====== RECEIVED DATA ======");
    console.log("📤 Name:", name);
    console.log("📤 Email:", email);
    console.log("📤 Phone:", phone);
    console.log("📤 Course:", course);
    console.log("📤 Father Name:", fatherName);
    console.log("📤 Mother Name:", motherName);
    console.log("📤 Guardian Name:", guardianName);
    console.log("📤 Guardian Phone:", guardianPhone);
    console.log("📤 Present Address:", presentAddress);
    console.log("📤 Permanent Address:", permanentAddress);
    console.log("📤 Payment Method:", paymentMethod);
    console.log("📤 Transaction ID:", transactionId);
    console.log("📤 Payment Status:", paymentStatus);
    console.log("📤 Admission Date:", admissionDate);
    console.log("📤 ===========================");

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

    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
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

    // ✅ সব ডেটা সহ New Student
    const newStudent = {
      // Personal Information
      name,
      email,
      phone,
      password,
      course,

      // Family Information
      fatherName: fatherName || "",
      motherName: motherName || "",
      guardianName: guardianName || fatherName || "",
      guardianPhone: guardianPhone || phone,

      // Address
      presentAddress: presentAddress || "",
      permanentAddress: permanentAddress || "",

      // Additional Information
      dobOrNid: dobOrNid || "",
      gender: gender || "",
      occupation: occupation || "",
      maritalStatus: maritalStatus || "",
      age: age || "",

      // ✅ Payment Information - সব ফিল্ড সেভ হচ্ছে
      paymentMethod: paymentMethod || "",
      paymentType: paymentType || "",
      transactionId: transactionId || "",
      paidAmount: paidAmount || "",
      paymentRemarks: paymentRemarks || "",
      paymentStatus: paymentStatus || "Unpaid",

      // Status
      status: status || "Pending",
      admissionDate: admissionDate || new Date().toISOString(),

      // Login credentials
      username: "",
      roll: "",
      approvedAt: null,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("📤 ====== SAVING STUDENT ======");
    console.log("📤 Payment Method:", newStudent.paymentMethod);
    console.log("📤 Transaction ID:", newStudent.transactionId);
    console.log("📤 Payment Status:", newStudent.paymentStatus);
    console.log("📤 Admission Date:", newStudent.admissionDate);
    console.log("📤 ===========================");

    const result = await studentsCollection.insertOne(newStudent);
    console.log("✅ Student registered successfully:", result.insertedId);

    res.status(201).json({
      success: true,
      message:
        "আপনার ভর্তি আবেদন সফল হয়েছে! অ্যাডমিন অ্যাপ্রুভ করার পর আপনি লগইন করতে পারবেন।",
      studentId: result.insertedId,
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error in student registration:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// routes/studentRoutes.js - Login route আপডেট করুন

router.post("/login", async (req, res) => {
  try {
    console.log("📥 POST /api/students/login called");
    console.log("📤 Received Body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "ইমেইল এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
      return res.status(500).json({
        success: false,
        message: "Database collection not found!",
      });
    }

    // Find student by email (or username)
    const student = await studentsCollection.findOne({
      $or: [
        { email: email },
        { username: email }, // যদি username দিয়ে login করতে চায়
      ],
      status: "Active", // শুধু Active স্টুডেন্ট লগইন করতে পারবে
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message:
          "ইমেইল বা পাসওয়ার্ড ভুল! অথবা আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি।",
      });
    }

    // Check password
    if (student.password !== password) {
      return res.status(401).json({
        success: false,
        message: "ইমেইল বা পাসওয়ার্ড ভুল!",
      });
    }

    // Remove password from response
    const { password: _, ...studentWithoutPassword } = student;

    res.status(200).json({
      success: true,
      message: "লগইন সফল!",
      user: studentWithoutPassword,
      token: "student_" + Date.now() + "_" + student._id,
    });
  } catch (error) {
    console.error("❌ Student Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ GET SINGLE STUDENT
// =============================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require("mongodb");
    const studentsCollection = getCollection("students");

    const student = await studentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    delete student.password;

    res.status(200).json({
      success: true,
      student,
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
