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
