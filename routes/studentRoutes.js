// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const { getCollection } = require("../config/db");
const { ObjectId } = require("mongodb");

console.log("✅ Student routes loaded (No Auth)");

// =============================================
// ✅ GET ALL STUDENTS (Public - No Token)
// =============================================
router.get("/all", async (req, res) => {
  try {
    console.log("📥 GET /api/students/all called");

    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
      return res.status(500).json({
        success: false,
        message: "Database collection not found!",
      });
    }

    const students = await studentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${students.length} students`);

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
    });
  }
});

// =============================================
// ✅ REGISTER STUDENT (Public - No Token)
// =============================================
router.post("/register/student", async (req, res) => {
  try {
    console.log("📥 POST /api/students/register/student called");
    console.log("📤 Received Body:", req.body);

    const {
      name,
      email,
      phone,
      password,
      course,
      fatherName,
      motherName,
      guardianName,
      guardianPhone,
      presentAddress,
      permanentAddress,
      dobOrNid,
      gender,
      occupation,
      maritalStatus,
      age,
      paymentMethod,
      paymentType,
      transactionId,
      paidAmount,
      paymentRemarks,
      paymentStatus,
      status = "Pending",
      admissionDate,
    } = req.body;

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

    const newStudent = {
      name,
      email,
      phone,
      password,
      course,
      fatherName: fatherName || "",
      motherName: motherName || "",
      guardianName: guardianName || fatherName || "",
      guardianPhone: guardianPhone || phone,
      presentAddress: presentAddress || "",
      permanentAddress: permanentAddress || "",
      dobOrNid: dobOrNid || "",
      gender: gender || "",
      occupation: occupation || "",
      maritalStatus: maritalStatus || "",
      age: age || "",
      paymentMethod: paymentMethod || "",
      paymentType: paymentType || "",
      transactionId: transactionId || "",
      paidAmount: paidAmount || "",
      paymentRemarks: paymentRemarks || "",
      paymentStatus: paymentStatus || "Unpaid",
      status: status || "Pending",
      admissionDate: admissionDate || new Date().toISOString(),
      username: "",
      roll: "",
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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

// =============================================
// ✅ APPROVE STUDENT (Public - No Token)
// =============================================
router.put("/approve/:id", async (req, res) => {
  try {
    console.log("📥 PUT /api/students/approve/:id called");
    console.log("📝 ID:", req.params.id);
    console.log("📝 Body:", req.body);

    const { id } = req.params;
    const { username, password } = req.body;

    // ✅ Validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required!",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required!",
      });
    }

    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
      return res.status(500).json({
        success: false,
        message: "Database collection not found!",
      });
    }

    // ✅ Check if student exists
    const student = await studentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    console.log(`📝 Student found: ${student.name}`);

    // ✅ Check if username already exists
    const existingUser = await studentsCollection.findOne({
      username: username,
      _id: { $ne: new ObjectId(id) },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "এই ইউজারনেম ইতিমধ্যে ব্যবহার করা হচ্ছে!",
      });
    }

    // ✅ Update student
    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          username: username,
          password: password,
          status: "Active",
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    console.log(`✅ Student ${student.name} approved successfully`);

    res.status(200).json({
      success: true,
      message: "Student approved successfully!",
    });
  } catch (error) {
    console.error("❌ Approve Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ STUDENT LOGIN (Public - No Token)
// =============================================
// routes/studentRoutes.js - Login Route

// =============================================
// ✅ STUDENT LOGIN
// =============================================
router.post("/login", async (req, res) => {
  try {
    console.log("📥 POST /api/students/login called");
    console.log("📤 Received Body:", req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "ইউজারনেম এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
      return res.status(500).json({
        success: false,
        message: "Database collection not found!",
      });
    }

    // ✅ Username এবং Status Active চেক করুন
    const student = await studentsCollection.findOne({
      username: username,
      status: "Active",
    });

    console.log("📝 Student found:", student ? student.name : "Not found");

    if (!student) {
      return res.status(401).json({
        success: false,
        message:
          "ইউজারনেম বা পাসওয়ার্ড ভুল! অথবা আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি।",
      });
    }

    // ✅ Password চেক করুন
    if (student.password !== password) {
      return res.status(401).json({
        success: false,
        message: "ইউজারনেম বা পাসওয়ার্ড ভুল!",
      });
    }

    // ✅ Remove password from response
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
// ✅ DELETE STUDENT (Public - No Token)
// =============================================
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const studentsCollection = getCollection("students");

    const result = await studentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// ═══════════════════════════════════════════════════════
// ✅ PATCH — Update Student Info (Admin)
// ═══════════════════════════════════════════════════════
router.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    console.log("📥 PATCH /api/students/update/", id);
    console.log("📝 Updates:", Object.keys(updates));

    const studentsColl = getCollection("students");
    if (!studentsColl) {
      return res
        .status(500)
        .json({ success: false, message: "DB not connected" });
    }

    // ── Allowlist — other fields ignored ──
    const ALLOWED_FIELDS = [
      "name",
      "phone",
      "email",
      "country",
      "nationalId",
      "dateOfBirth",
      "age",
      "gender",
      "maritalStatus",
      "occupation",
      "fatherName",
      "motherName",
      "guardianPhone",
      "guardianName",
      "presentAddress",
      "permanentAddress",
      "course",
      "department",
      "batchType",
      "batchSchedule",
      "courseFee",
      "paidAmount",
      "dueAmount",
      "scholarshipAmount",
      "paymentStatus",
      "paymentMethod",
      "paymentType",
      "transactionId",
      "paymentRemarks",
      "status",
    ];

    const filtered = {};
    Object.keys(updates).forEach((k) => {
      if (ALLOWED_FIELDS.includes(k)) filtered[k] = updates[k];
    });

    if (Object.keys(filtered).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    filtered.updatedAt = new Date();

    // ── Try _id first, then studentId ──
    const { ObjectId } = require("mongodb");
    let filter = {};
    try {
      filter = { _id: new ObjectId(id) };
    } catch {
      filter = { studentId: id };
    }

    let result = await studentsColl.updateOne(filter, { $set: filtered });

    if (result.matchedCount === 0) {
      result = await studentsColl.updateOne(
        { studentId: id },
        { $set: filtered },
      );
      filter = { studentId: id };
    }

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // ── Auto-recalc due if fee/paid changed ──
    if (
      filtered.courseFee !== undefined ||
      filtered.paidAmount !== undefined ||
      filtered.scholarshipAmount !== undefined
    ) {
      const student = await studentsColl.findOne(filter);
      if (student) {
        const fee = Number(student.courseFee) || 0;
        const paid = Number(student.paidAmount) || 0;
        const sch = Number(student.scholarshipAmount) || 0;
        const due = Math.max(fee - paid - sch, 0);
        let paymentStatus = "Unpaid";
        if (fee > 0 && due === 0) paymentStatus = "Paid";
        else if (paid > 0) paymentStatus = "Partial";
        await studentsColl.updateOne(filter, {
          $set: { dueAmount: due, paymentStatus },
        });
      }
    }

    console.log("✅ Student updated:", Object.keys(filtered).join(", "));
    return res.json({
      success: true,
      message: "Student information updated successfully",
      updatedFields: Object.keys(filtered),
    });
  } catch (error) {
    console.error("❌ Update student error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
