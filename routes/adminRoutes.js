// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { getCollection } = require("../config/db");
const { protect, authorize } = require("../middleware/auth");

// =============================================
// Get All Students (Admin only)
// =============================================
router.get("/students/all", protect, authorize("admin"), async (req, res) => {
  try {
    const usersCollection = getCollection("users");

    // Get all students
    const students = await usersCollection
      .find({ role: "student" })
      .sort({ createdAt: -1 })
      .toArray();

    // Remove passwords
    const sanitizedStudents = students.map((s) => {
      delete s.password;
      return s;
    });

    res.status(200).json({
      success: true,
      students: sanitizedStudents,
    });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// Approve Student (Admin only)
// =============================================
router.put(
  "/students/approve/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, roll } = req.body;

      if (!username || !password || !roll) {
        return res.status(400).json({
          success: false,
          message: "Username, password and roll number are required!",
        });
      }

      const usersCollection = getCollection("users");

      // Check if username already exists
      const existingUser = await usersCollection.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "এই ইউজারনেম ইতিমধ্যে ব্যবহার করা হচ্ছে!",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update student
      const result = await usersCollection.updateOne(
        { _id: id, role: "student" },
        {
          $set: {
            username: username,
            password: hashedPassword,
            roll: roll,
            status: "Active",
            approvedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found!",
        });
      }

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
// Delete Student (Admin only)
// =============================================
router.delete(
  "/students/delete/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const usersCollection = getCollection("users");

      const result = await usersCollection.deleteOne({
        _id: id,
        role: "student",
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
  },
);

// =============================================
// Get Pending Students (Admin only)
// =============================================
router.get(
  "/students/pending",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const usersCollection = getCollection("users");
      const pendingStudents = await usersCollection
        .find({ role: "student", status: "Pending" })
        .sort({ createdAt: -1 })
        .toArray();

      const sanitized = pendingStudents.map((s) => {
        delete s.password;
        return s;
      });

      res.status(200).json({
        success: true,
        students: sanitized,
      });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

module.exports = router;
