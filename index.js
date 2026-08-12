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
const { connectDB, getDB, closeDB } = require("./config/db");

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

// ===================== API Routes =====================
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

// ===================== Frontend Static Integration =====================
const rootPath = path.resolve(__dirname, ".."); // Serve static files directly from root domain folder where index.html and assets are located
app.use(express.static(rootPath)); // Fallback route for SPA (Single Page Application)

app.get(/^(?!\/api).*/, (req, res) => {
  const indexPath = path.join(rootPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  } else {
    return res
      .status(404)
      .send("Frontend index.html file not found on server!");
  }
});
// ===================== Error Handler =====================
app.use(errorHandler);

// ===================== Start Server =====================
const startServer = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`\n📚 Available Routes:`);
      console.log(`   POST    /api/auth/register`);
      console.log(`   POST    /api/auth/login`);
      console.log(`   POST    /api/auth/student/login`);
      console.log(`   GET     /api/courses`);
      console.log(`   GET     /api/assignments`);
      console.log(`   GET     /api/quizzes`);
      console.log(`   GET     /api/lessons\n`);
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
