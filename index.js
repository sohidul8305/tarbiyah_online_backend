// backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Import Database Connection
const { connectDB, getDB, getCollection, closeDB } = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");

// Import Middleware
const { errorHandler } = require("./middleware/errorHandler");

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    const db = getDB();
    await db.command({ ping: 1 });
    res.json({
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

// ===================== Test Routes =====================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// =============================================
// ✅ STUDENT ROUTES - Public (No Auth Required)
// =============================================
const { ObjectId } = require("mongodb");

// GET ALL STUDENTS (Public)
app.get("/api/students/all", async (req, res) => {
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

// REGISTER STUDENT (Public)
app.post("/api/students/register", async (req, res) => {
  try {
    console.log("📥 POST /api/students/register called");
    console.log("📝 Request body:", req.body);

    const {
      name,
      phone,
      email,
      class: className,
      guardianName,
      guardianPhone,
      address,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required!",
      });
    }

    const studentsCollection = getCollection("students");

    // Check if phone exists
    const existing = await studentsCollection.findOne({ phone });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already registered!",
      });
    }

    const newStudent = {
      name,
      phone,
      email: email || "",
      class: className || "Not Assigned",
      guardianName: guardianName || "",
      guardianPhone: guardianPhone || "",
      address: address || "",
      status: "Pending",
      roll: "",
      username: "",
      password: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await studentsCollection.insertOne(newStudent);
    console.log("✅ Student registered:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "Student registered successfully!",
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error in /register:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ADD TEST STUDENT (Public)
app.post("/api/students/add-test", async (req, res) => {
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

// GET SINGLE STUDENT (Public)
app.get("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
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

// =============================================
// ✅ API Routes
// =============================================
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

// ===================== Error Handler =====================
app.use(errorHandler);

// ===================== Start Server =====================
const startServer = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();

    // Check students collection after connection
    try {
      const studentsCollection = getCollection("students");
      const count = await studentsCollection.countDocuments();
      console.log(`📊 Total students in collection: ${count}`);

      if (count === 0) {
        console.log("⚠️ No students found in database!");
        console.log(
          "💡 Please register a student first or insert data manually.",
        );
        console.log(
          "📝 Use: POST /api/students/add-test to add a test student",
        );
      } else {
        const sample = await studentsCollection.find({}).limit(3).toArray();
        console.log(
          "📝 Sample students:",
          sample.map((s) => ({ name: s.name, phone: s.phone })),
        );
      }
    } catch (err) {
      console.error("❌ Error checking students:", err);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
      console.log(`\n📚 Student Routes (Public - No Auth Required):`);
      console.log(`   GET  http://localhost:${PORT}/api/students/all`);
      console.log(`   POST http://localhost:${PORT}/api/students/register`);
      console.log(`   POST http://localhost:${PORT}/api/students/add-test`);
      console.log(`   GET  http://localhost:${PORT}/api/students/:id`);
      console.log(`\n📚 Other Routes:`);
      console.log(`   POST /api/auth/register`);
      console.log(`   POST /api/auth/login`);
      console.log(`   POST /api/auth/student/login`);
      console.log(`   GET  /api/courses`);
      console.log(`   GET  /api/assignments`);
      console.log(`   GET  /api/quizzes`);
      console.log(`   GET  /api/lessons\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.log("\n💡 Please check:");
    console.log("1. MongoDB Atlas credentials in .env file");
    console.log("2. Network Access in MongoDB Atlas (whitelist 0.0.0.0/0)");
    console.log("3. Your internet connection");
    console.log("4. Check if cluster is active\n");
    process.exit(1);
  }
};

startServer();

// ===================== Graceful Shutdown ===================
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await closeDB();
  console.log("✅ Server closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await closeDB();
  console.log("✅ Server closed");
  process.exit(0);
});
