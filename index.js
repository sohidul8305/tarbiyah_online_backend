// backend/index.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(express.json());
app.use(cors());

// =============================================
// ✅ JSON FILE DATABASE
// =============================================
const DATA_FILE = path.join(__dirname, "courses.json");

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ courses: [] }, null, 2));
  console.log("✅ courses.json created");
}

const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { courses: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// =============================================
// ✅ TEST ROUTE
// =============================================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// =============================================
// ✅ CREATE COURSE
// =============================================
app.post("/api/courses/create", (req, res) => {
  try {
    console.log("📥 POST /api/courses/create");
    console.log("📝 Body:", req.body);

    const {
      title,
      code,
      description,
      className,
      startDate,
      status,
      department,
      teacher,
      duration,
      endDate,
      schedule,
    } = req.body;

    // Validation
    if (!title || !code || !className || !startDate) {
      return res.status(400).json({
        success: false,
        message: "শিরোনাম, কোড, ক্লাস এবং শুরুর তারিখ আবশ্যক!",
      });
    }

    const data = readData();

    // Check duplicate code
    const existing = data.courses.find((c) => c.code === code);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "এই কোডটি ইতিমধ্যে ব্যবহার করা হচ্ছে!",
      });
    }

    const newCourse = {
      _id: Date.now().toString(),
      title,
      code,
      description: description || "",
      category: department || "Islamic Studies",
      department: department || "Islamic Studies",
      className,
      teacher: teacher || "Ustadh Ahmad",
      duration: duration || "",
      status: status || "Draft",
      startDate,
      endDate: endDate || "",
      schedule: schedule || "",
      students: 0,
      progress: 0,
      videos: 0,
      assignments: 0,
      quizzes: 0,
      materials: 0,
      sessions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.courses.push(newCourse);
    writeData(data);

    console.log("✅ Course created:", newCourse.title);

    res.status(201).json({
      success: true,
      message: "কোর্স তৈরি হয়েছে!",
      course: newCourse,
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
// ✅ GET TEACHER COURSES
// =============================================
app.get("/api/courses/teacher/:teacherId", (req, res) => {
  try {
    const data = readData();
    res.json({
      success: true,
      courses: data.courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ GET STATS
// =============================================
app.get("/api/courses/stats/:teacherId", (req, res) => {
  try {
    const data = readData();
    const courses = data.courses;

    const stats = {
      totalCourses: courses.length,
      activeCourses: courses.filter((c) => c.status === "Active").length,
      draftCourses: courses.filter((c) => c.status === "Draft").length,
      completedCourses: courses.filter((c) => c.status === "Completed").length,
      archivedCourses: courses.filter((c) => c.status === "Archived").length,
      totalStudents: courses.reduce((sum, c) => sum + (c.students || 0), 0),
      totalSessions: courses.reduce((sum, c) => sum + (c.sessions || 0), 0),
      avgProgress:
        courses.length > 0
          ? Math.round(
              courses.reduce((sum, c) => sum + (c.progress || 0), 0) /
                courses.length,
            )
          : 0,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ UPDATE COURSE
// =============================================
app.put("/api/courses/update/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();

    const index = data.courses.findIndex((c) => c._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "কোর্স পাওয়া যায়নি!",
      });
    }

    data.courses[index] = {
      ...data.courses[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    writeData(data);

    res.json({
      success: true,
      message: "কোর্স আপডেট হয়েছে!",
      course: data.courses[index],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ DELETE COURSE
// =============================================
app.delete("/api/courses/delete/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();

    const filtered = data.courses.filter((c) => c._id !== id);
    if (filtered.length === data.courses.length) {
      return res.status(404).json({
        success: false,
        message: "কোর্স পাওয়া যায়নি!",
      });
    }

    data.courses = filtered;
    writeData(data);

    res.json({
      success: true,
      message: "কোর্স ডিলিট করা হয়েছে!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ START SERVER
// =============================================
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(
    `📚 Create Course: POST http://localhost:${PORT}/api/courses/create`,
  );
  console.log(`📂 Data stored in: courses.json`);
  console.log(`${"=".repeat(50)}\n`);
});
