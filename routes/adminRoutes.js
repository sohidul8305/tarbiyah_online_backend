const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/db");
const { protect, authorize } = require("../middleware/auth");

// =============================================
// ✅ GET ALL STUDENTS (Admin only) - Debug
// =============================================
router.get("/students/all", protect, authorize("admin"), async (req, res) => {
  try {
    console.log("========================================");
    console.log("🔍 GET ALL STUDENTS REQUEST");
    console.log("👤 Admin ID:", req.user?.id);
    console.log("👤 Admin Email:", req.user?.email);

    // ✅ Get students collection
    const studentsCollection = getCollection("students");
    console.log("✅ Connected to students collection");

    // ✅ Get ALL students
    const students = await studentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${students.length} students in students collection`);

    // Log all students
    if (students.length > 0) {
      students.forEach((student, index) => {
        console.log(`📝 Student ${index + 1}:`, {
          id: student._id,
          name: student.name,
          phone: student.phone,
          status: student.status,
          class: student.class,
        });
      });
    } else {
      console.log("⚠️ No students found in students collection!");
    }

    // Remove passwords
    const sanitizedStudents = students.map((s) => {
      delete s.password;
      return s;
    });

    console.log("========================================");

    res.status(200).json({
      success: true,
      total: students.length,
      students: sanitizedStudents,
    });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack,
    });
  }
});

// =============================================
// ✅ APPROVE STUDENT (Admin only)
// =============================================
router.put(
  "/students/approve/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, roll } = req.body;

      console.log("========================================");
      console.log("✅ APPROVE STUDENT REQUEST");
      console.log(`📝 Student ID: ${id}`);
      console.log(`📝 Username: ${username}`);
      console.log(`📝 Roll: ${roll}`);

      if (!username || !password || !roll) {
        return res.status(400).json({
          success: false,
          message: "Username, password and roll number are required!",
        });
      }

      // ✅ Get students collection
      const studentsCollection = getCollection("students");

      // Check if student exists
      const student = await studentsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!student) {
        console.log("❌ Student not found in students collection");
        return res.status(404).json({
          success: false,
          message: "Student not found!",
        });
      }

      console.log(`📝 Student found: ${student.name}`);

      // Check if username already exists
      const existingUser = await studentsCollection.findOne({
        username: username,
        _id: { $ne: new ObjectId(id) },
      });

      if (existingUser) {
        console.log("❌ Username already exists");
        return res.status(400).json({
          success: false,
          message: "এই ইউজারনেম ইতিমধ্যে ব্যবহার করা হচ্ছে!",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update student
      const result = await studentsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            username: username,
            password: hashedPassword,
            roll: roll,
            status: "Active",
            approvedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        console.log("❌ Update failed - student not found");
        return res.status(404).json({
          success: false,
          message: "Student not found!",
        });
      }

      console.log(`✅ Student ${student.name} approved successfully`);
      console.log("========================================");

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
  },
);

// =============================================
// ✅ DELETE STUDENT (Admin only)
// =============================================
router.delete(
  "/students/delete/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const studentsCollection = getCollection("students");

      console.log(`🗑️ Deleting student: ${id}`);

      const result = await studentsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found!",
        });
      }

      console.log(`✅ Student deleted successfully`);

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
  },
);

module.exports = router;
