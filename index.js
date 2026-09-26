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

// =============================================
// ✅ GRADES ROUTES (JSON File Based)
// =============================================
const GRADES_FILE = path.join(__dirname, "grades.json");

if (!fs.existsSync(GRADES_FILE)) {
  fs.writeFileSync(GRADES_FILE, JSON.stringify({ grades: [] }, null, 2));
  console.log("✅ grades.json created");
}

function readGradesData() {
  try {
    return JSON.parse(fs.readFileSync(GRADES_FILE, "utf8"));
  } catch {
    return { grades: [] };
  }
}
function writeGradesData(data) {
  fs.writeFileSync(GRADES_FILE, JSON.stringify(data, null, 2));
}

// =============================================
// ✅ ADMIN PROFILE ROUTES (JSON File Based)
// =============================================
const ADMIN_PROFILES_FILE = path.join(__dirname, "admin_profiles.json");

if (!fs.existsSync(ADMIN_PROFILES_FILE)) {
  fs.writeFileSync(
    ADMIN_PROFILES_FILE,
    JSON.stringify({ profiles: [] }, null, 2),
  );
  console.log("✅ admin_profiles.json created");
}

function readAdminProfiles() {
  try {
    return JSON.parse(fs.readFileSync(ADMIN_PROFILES_FILE, "utf8"));
  } catch {
    return { profiles: [] };
  }
}
function writeAdminProfiles(data) {
  fs.writeFileSync(ADMIN_PROFILES_FILE, JSON.stringify(data, null, 2));
}

// =============================================
// ✅ COURSE RESOURCES (PDF + Quiz)
// =============================================
const RESOURCES_FILE = path.join(__dirname, "course_resources.json");

if (!fs.existsSync(RESOURCES_FILE)) {
  fs.writeFileSync(RESOURCES_FILE, JSON.stringify({ resources: [] }, null, 2));
  console.log("✅ course_resources.json created");
}

function readResourcesData() {
  try {
    return JSON.parse(fs.readFileSync(RESOURCES_FILE, "utf8"));
  } catch {
    return { resources: [] };
  }
}
function writeResourcesData(data) {
  fs.writeFileSync(RESOURCES_FILE, JSON.stringify(data, null, 2));
}
// =============================================
// ✅ BATCH HELPERS — MUST BE HERE (hoisted)
// =============================================
const BATCHES_FILE = path.join(__dirname, "batches.json");

if (!fs.existsSync(BATCHES_FILE)) {
  fs.writeFileSync(BATCHES_FILE, JSON.stringify({ batches: [] }, null, 2));
  console.log("✅ batches.json created");
}

function readBatchesData() {
  try {
    const raw = fs.readFileSync(BATCHES_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("❌ readBatchesData error:", err.message);
    return { batches: [] };
  }
}

function writeBatchesData(data) {
  try {
    fs.writeFileSync(BATCHES_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ writeBatchesData error:", err.message);
  }
}

// ✅ Extra helpers (future-proof, no crash)
const FIXED_TEACHERS = [];
const ATT_DATA_FILE = path.join(__dirname, "attendance_data.json");
if (!fs.existsSync(ATT_DATA_FILE)) {
  fs.writeFileSync(ATT_DATA_FILE, JSON.stringify({ attendance: [] }, null, 2));
}
function readAttData() {
  try {
    return JSON.parse(fs.readFileSync(ATT_DATA_FILE, "utf8"));
  } catch {
    return { attendance: [] };
  }
}
function writeAttData(data) {
  fs.writeFileSync(ATT_DATA_FILE, JSON.stringify(data, null, 2));
}

const TEACHERS_FILE = path.join(__dirname, "teachers.json");
if (!fs.existsSync(TEACHERS_FILE)) {
  fs.writeFileSync(TEACHERS_FILE, JSON.stringify({ teachers: [] }, null, 2));
}
function readTeachers() {
  try {
    return JSON.parse(fs.readFileSync(TEACHERS_FILE, "utf8"));
  } catch {
    return { teachers: [] };
  }
}
function writeTeachers(data) {
  fs.writeFileSync(TEACHERS_FILE, JSON.stringify(data, null, 2));
}

function calcStudentDue(courseFee, scholarshipAmount, paidAmount) {
  return (
    (Number(courseFee) || 0) -
    (Number(scholarshipAmount) || 0) -
    (Number(paidAmount) || 0)
  );
}

const DEFAULT_ATT_TEACHERS = [
  {
    _id: "TCH_FIXED_001",
    id: 1,
    teacherId: "TCH001",
    name: "Jubayer Ahmad",
    designation: "Senior Teacher",
    subject: "Quran For Elders",
    department: "Quran Studies",
    phone: "+880 1712 345678",
    email: "jubayer@tarabiyah.com",
    joinDate: "2024-01-15",
    status: "Active",
    isDefault: true,
  },
  {
    _id: "TCH_FIXED_002",
    id: 2,
    teacherId: "TCH002",
    name: "Sumaiya Afrin Mim",
    designation: "Junior Teacher",
    subject: "Quran For Elders",
    department: "Quran Studies",
    phone: "+880 1723 456789",
    email: "sumaiya@tarabiyah.com",
    joinDate: "2024-02-01",
    status: "Active",
    isDefault: true,
  },
];

// ✅ Teachers file for attendance
const ATT_TEACHERS_FILE = path.join(__dirname, "attendance_teachers.json");

if (!fs.existsSync(ATT_TEACHERS_FILE)) {
  fs.writeFileSync(
    ATT_TEACHERS_FILE,
    JSON.stringify({ customTeachers: [] }, null, 2),
  );
  console.log("✅ attendance_teachers.json created");
}

const readAttTeachers = () => {
  try {
    const data = fs.readFileSync(ATT_TEACHERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { customTeachers: [] };
  }
};

const writeAttTeachers = (data) => {
  fs.writeFileSync(ATT_TEACHERS_FILE, JSON.stringify(data, null, 2));
};

// ✅ Get full teacher list (defaults + custom)
const getFullAttTeachers = () => {
  const data = readAttTeachers();
  const customs = data.customTeachers || [];
  return [...DEFAULT_ATT_TEACHERS, ...customs];
};

// =============================================
// ✅ JSON FILE DATABASE (MongoDB এর বিকল্প)
// =============================================
const DATA_FILE = path.join(__dirname, "courses.json");

// Initialize courses.json file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ courses: [] }, null, 2));
  console.log("✅ courses.json created");
}

// =============================================
// ✅ TODAY'S CLASSES — File Setup + Helper Functions
// =============================================
const TODAY_CLASSES_FILE = path.join(__dirname, "today_classes.json");

if (!fs.existsSync(TODAY_CLASSES_FILE)) {
  fs.writeFileSync(
    TODAY_CLASSES_FILE,
    JSON.stringify({ classes: [] }, null, 2),
  );
  console.log("✅ today_classes.json created");
}

// ✅ Function declaration (hoisted — সব জায়গায় call করা যাবে)
function readClassesData() {
  try {
    const data = fs.readFileSync(TODAY_CLASSES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { classes: [] };
  }
}

function writeClassesData(data) {
  fs.writeFileSync(TODAY_CLASSES_FILE, JSON.stringify(data, null, 2));
}

// =============================================
// ✅ STUDENT SUPPORT ROUTES (JSON File Based)
// =============================================

// ✅ Student Support File Path
const SUPPORT_FILE = path.join(__dirname, "support_tickets.json");

// Initialize support_tickets.json file
if (!fs.existsSync(SUPPORT_FILE)) {
  fs.writeFileSync(SUPPORT_FILE, JSON.stringify({ tickets: [] }, null, 2));
  console.log("✅ support_tickets.json created");
}

const readSupportData = () => {
  try {
    const data = fs.readFileSync(SUPPORT_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { tickets: [] };
  }
};

const writeSupportData = (data) => {
  fs.writeFileSync(SUPPORT_FILE, JSON.stringify(data, null, 2));
};

// ✅ Student Submit Support Ticket
app.post("/api/support/submit", async (req, res) => {
  try {
    console.log("📥 POST /api/support/submit");
    console.log("📝 Body:", req.body);

    const {
      department,
      phone,
      email,
      name,
      gender,
      studentId,
      reference,
      subject,
      problemDetails,
    } = req.body;

    // ✅ Validate required fields
    if (
      !department ||
      !phone ||
      !email ||
      !name ||
      !subject ||
      !problemDetails
    ) {
      return res.status(400).json({
        success: false,
        message:
          "ডিপার্টমেন্ট, ফোন, ইমেইল, নাম, সাবজেক্ট এবং সমস্যা বিবরণ আবশ্যক!",
      });
    }

    const data = readSupportData();

    const newTicket = {
      _id: Date.now().toString(),
      department,
      phone,
      email,
      name,
      gender: gender || "",
      studentId: studentId || "",
      reference: reference || "",
      subject,
      problemDetails,
      status: "Pending", // Pending, In Progress, Resolved, Closed
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.tickets.push(newTicket);
    writeSupportData(data);

    console.log("✅ Support ticket submitted:", newTicket._id);

    res.status(201).json({
      success: true,
      message: "আপনার সাপোর্ট টিকেট সফলভাবে জমা হয়েছে! অ্যাডমিন শীঘ্রই দেখবেন।",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("❌ Support Submit Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// একদম ওপরের দিকে (যাতে কোনো মিডলওয়্যার বা অথেন্টিকেশন চেক করার আগেই এটি রেসপন্স দেয়)
app.get("/api/test-data", (req, res) => {
  res.json({ success: true, message: "Server is working perfectly!" });
});
// ✅ Get All Support Tickets (Admin)
app.get("/api/support/tickets", async (req, res) => {
  try {
    console.log("📥 GET /api/support/tickets");
    const data = readSupportData();

    // Sort by newest first
    const tickets = data.tickets.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    // Unread count
    const unreadCount = tickets.filter((t) => !t.isRead).length;

    res.status(200).json({
      success: true,
      total: tickets.length,
      unread: unreadCount,
      tickets: tickets,
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
// ✅ GET RESOURCES BY COURSE (Flexible: ID → Title → Code)
// =============================================
app.get("/api/course-resources/course/:identifier", (req, res) => {
  try {
    const { identifier } = req.params;
    const decoded = decodeURIComponent(identifier).trim();
    console.log("════════════════════════════════════════");
    console.log("📥 GET /api/course-resources/course/", decoded);

    const resourcesData = readResourcesData();
    const allResources = resourcesData.resources || [];

    console.log(`📦 Total resources in DB: ${allResources.length}`);
    allResources.forEach((r, i) => {
      console.log(
        `   ${i + 1}. type=${r.type} title="${r.title}" courseId="${r.courseId}" courseTitle="${r.courseTitle}" courseCode="${r.courseCode}"`,
      );
    });

    let matched = [];

    // ✅ Step 1: Exact ID match
    matched = allResources.filter(
      (r) => String(r.courseId) === String(decoded),
    );
    console.log(`   Step 1 (by ID): matched ${matched.length}`);

    // ✅ Step 2: If no ID match — try title match (courseTitle)
    if (matched.length === 0) {
      const lower = decoded.toLowerCase();
      matched = allResources.filter((r) => {
        const rTitle = (r.courseTitle || "").toLowerCase().trim();
        return (
          rTitle === lower || rTitle.includes(lower) || lower.includes(rTitle)
        );
      });
      console.log(`   Step 2 (by Title): matched ${matched.length}`);
    }

    // ✅ Step 3: If still no match — try by course code
    if (matched.length === 0) {
      const lower = decoded.toLowerCase();
      matched = allResources.filter((r) => {
        const rCode = (r.courseCode || "").toLowerCase().trim();
        return (
          rCode === lower || rCode.includes(lower) || lower.includes(rCode)
        );
      });
      console.log(`   Step 3 (by Code): matched ${matched.length}`);
    }

    // ✅ Step 4: Word-level match (e.g., "Tajweed" in both)
    if (matched.length === 0) {
      const searchWords = decoded
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      matched = allResources.filter((r) => {
        const rTitle = (r.courseTitle || "").toLowerCase();
        const rCode = (r.courseCode || "").toLowerCase();
        const rWords = [...rTitle.split(/\s+/), ...rCode.split(/\s+/)].filter(
          (w) => w.length > 3,
        );
        return searchWords.some((w) => rWords.includes(w));
      });
      console.log(`   Step 4 (word match): matched ${matched.length}`);
    }

    const pdfs = matched.filter((r) => r.type === "pdf");
    const quizzes = matched.filter((r) => r.type === "quiz");

    console.log(`✅ FINAL → PDFs: ${pdfs.length}, Quizzes: ${quizzes.length}`);
    console.log("════════════════════════════════════════");

    res.json({
      success: true,
      searchedFor: decoded,
      totalResourcesInDB: allResources.length,
      matched: matched.length,
      pdfsCount: pdfs.length,
      quizzesCount: quizzes.length,
      pdfs,
      quizzes,
      all: matched,
      // Debug info
      debug: {
        allResources: allResources.map((r) => ({
          type: r.type,
          title: r.title,
          courseId: r.courseId,
          courseTitle: r.courseTitle,
          courseCode: r.courseCode,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ CREATE resource (type: "pdf" | "quiz")
app.post("/api/course-resources/create", (req, res) => {
  try {
    console.log("📥 POST /api/course-resources/create");
    console.log("📝 Body:", req.body);

    const { courseId, courseTitle, courseCode, type, title, url, description } =
      req.body;

    if (!courseId || !type || !title || !url) {
      return res.status(400).json({
        success: false,
        message: "Course, Type, Title এবং URL আবশ্যক!",
      });
    }
    if (!["pdf", "quiz"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'pdf' or 'quiz'",
      });
    }

    const data = readResourcesData();

    const newResource = {
      _id: Date.now().toString() + Math.floor(Math.random() * 1000),
      courseId,
      courseTitle: courseTitle || "",
      courseCode: courseCode || "",
      type,
      title: title.trim(),
      url: url.trim(),
      description: description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.resources.push(newResource);
    writeResourcesData(data);

    console.log("✅ Resource created:", newResource._id);
    res.status(201).json({
      success: true,
      message: `✅ ${type === "pdf" ? "PDF" : "Quiz"} added!`,
      resource: newResource,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET ALL resources
app.get("/api/course-resources/all", (req, res) => {
  try {
    const data = readResourcesData();
    const resources = (data.resources || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    res.json({ success: true, total: resources.length, resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE resource
app.delete("/api/course-resources/delete/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = readResourcesData();
    const filtered = data.resources.filter((r) => r._id !== id);
    if (filtered.length === data.resources.length) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }
    data.resources = filtered;
    writeResourcesData(data);
    res.json({ success: true, message: "✅ Deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get Unread Support Tickets Count (For Notification Badge)
app.get("/api/support/unread-count", async (req, res) => {
  try {
    const data = readSupportData();
    const unreadCount = data.tickets.filter((t) => !t.isRead).length;

    res.status(200).json({
      success: true,
      unread: unreadCount,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Mark Ticket as Read
app.put("/api/support/ticket/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const data = readSupportData();

    const index = data.tickets.findIndex((t) => t._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "টিকেট পাওয়া যায়নি!",
      });
    }

    data.tickets[index].isRead = true;
    data.tickets[index].updatedAt = new Date().toISOString();
    writeSupportData(data);

    res.status(200).json({
      success: true,
      message: "টিকেট রিড হিসাবে মার্ক করা হয়েছে!",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Update Ticket Status
app.put("/api/support/ticket/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Resolved", "Closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "সঠিক স্ট্যাটাস দিন! (Pending, In Progress, Resolved, Closed)",
      });
    }

    const data = readSupportData();
    const index = data.tickets.findIndex((t) => t._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "টিকেট পাওয়া যায়নি!",
      });
    }

    data.tickets[index].status = status;
    data.tickets[index].updatedAt = new Date().toISOString();
    writeSupportData(data);

    res.status(200).json({
      success: true,
      message: "টিকেট স্ট্যাটাস আপডেট হয়েছে!",
      ticket: data.tickets[index],
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ➕ রিপ্লাই দেওয়ার রাউট (Admin)
app.post("/api/support/ticket/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message)
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });

    const data = readSupportData();
    const index = data.tickets.findIndex((t) => t._id === id);
    if (index === -1)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    if (!data.tickets[index].replies) data.tickets[index].replies = [];

    data.tickets[index].replies.push({
      role: "admin",
      message: message,
      date: new Date().toLocaleString(),
    });

    data.tickets[index].status = "In Progress";
    data.tickets[index].updatedAt = new Date().toISOString();

    writeSupportData(data);

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      ticket: data.tickets[index],
    });
  } catch (error) {
    console.error("❌ Reply Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ স্টুডেন্ট স্ট্যাটাস সার্চ (JSON ফাইল থেকে ডাটা আনা হচ্ছে)
app.get("/api/support/status", async (req, res) => {
  try {
    const { type, value } = req.query;
    if (!type || !value)
      return res.status(400).json({
        success: false,
        message: "Search type and value are required",
      });

    const data = readSupportData();
    let foundTickets = [];

    if (type === "phone") {
      foundTickets = data.tickets.filter((t) => t.phone === value.trim());
    } else if (type === "email") {
      foundTickets = data.tickets.filter(
        (t) => t.email.toLowerCase() === value.trim().toLowerCase(),
      );
    } else if (type === "ticket") {
      foundTickets = data.tickets.filter((t) => t._id === value.trim());
    }

    if (foundTickets.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No records found", data: [] });
    }

    // ✅ Frontend-এর জন্য ডাটা ফরম্যাট করা
    const formattedData = foundTickets.map((ticket) => ({
      supportNo: ticket._id,
      dept: ticket.department,
      desc: ticket.problemDetails,
      date: new Date(ticket.createdAt).toLocaleString(),
      status: ticket.status,
      name: ticket.name,
      phone: ticket.phone,
      email: ticket.email,
      subject: ticket.subject,
      description: ticket.problemDetails,
      replies: ticket.replies || [],
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("❌ Status Search Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Delete Support Ticket
app.delete("/api/support/ticket/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = readSupportData();

    const filtered = data.tickets.filter((t) => t._id !== id);
    if (filtered.length === data.tickets.length) {
      return res.status(404).json({
        success: false,
        message: "টিকেট পাওয়া যায়নি!",
      });
    }

    data.tickets = filtered;
    writeSupportData(data);

    res.status(200).json({
      success: true,
      message: "টিকেট ডিলিট করা হয়েছে!",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

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

// Import Database Connection (MongoDB)
const { connectDB, getDB, getCollection, closeDB } = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
// const courseRoutes = require("./routes/courseRoutes"); // ❌ কমেন্ট করুন
const assignmentRoutes = require("./routes/assignmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");

// Import Middleware
const { errorHandler } = require("./middleware/errorHandler");

// =============================================
// ✅ MONGODB OBJECT ID
// =============================================
const { ObjectId } = require("mongodb");

// =============================================
// ✅ HEALTH CHECK
// =============================================
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

// মডেলটি আপনার প্রজেক্ট অনুযায়ী সঠিক নাম দিন

// ✅ Student Support Status Check (JSON File Based)
app.get("/api/support/status", async (req, res) => {
  try {
    const { type, value } = req.query;

    if (!type || !value) {
      return res.status(400).json({
        success: false,
        message: "Search type and value are required",
      });
    }

    // JSON ফাইল থেকে ডাটা পড়া হচ্ছে
    const data = readSupportData();
    const allTickets = data.tickets;

    // ডাটা ফিল্টার করা (কেস-ইনসেনসিটিভ)
    let filteredTickets = [];
    const trimmedValue = value.trim().toLowerCase();

    if (type === "phone") {
      filteredTickets = allTickets.filter((t) => t.phone === value.trim());
    } else if (type === "email") {
      filteredTickets = allTickets.filter((t) =>
        t.email.toLowerCase().includes(trimmedValue),
      );
    } else if (type === "ticket") {
      // JSON ফাইলে supportNo নেই, তাই _id দিয়ে খোঁজা হচ্ছে
      filteredTickets = allTickets.filter((t) => t._id === value.trim());
    }

    if (filteredTickets.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No records found",
        data: [],
      });
    }

    // ✅ ডাটাকে Frontend-এ ঠিকমতো দেখানোর জন্য ম্যাপ করা
    const formattedData = filteredTickets.map((ticket) => ({
      supportNo: ticket._id, // _id কে supportNo হিসেবে দেখানো হচ্ছে
      dept: ticket.department,
      desc: ticket.problemDetails,
      date: new Date(ticket.createdAt).toLocaleString(),
      status: ticket.status,
      name: ticket.name,
      phone: ticket.phone,
      email: ticket.email,
      subject: ticket.subject,
      description: ticket.problemDetails,
      replies: ticket.replies || [],
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("❌ Status Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});
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

// ✅ GET ALL BATCHES
app.get("/api/batches/all", (req, res) => {
  try {
    console.log("📥 GET /api/batches/all");
    const data = readBatchesData();
    const batches = (data.batches || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    res.status(200).json({
      success: true,
      total: batches.length,
      batches,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ CREATE BATCH
app.post("/api/batches/create", (req, res) => {
  try {
    console.log("📥 POST /api/batches/create");
    console.log("📝 Body:", req.body);

    const {
      name,
      course,
      students,
      schedule,
      teacher,
      videoUrl,
      description,
      status,
    } = req.body;

    if (!name || !course) {
      return res.status(400).json({
        success: false,
        message: "Batch Name এবং Course আবশ্যক!",
      });
    }

    const data = readBatchesData();

    const newBatch = {
      _id: Date.now().toString() + Math.floor(Math.random() * 1000),
      id: Date.now(),
      name: name.trim(),
      course: course.trim(),
      students: parseInt(students) || 0,
      schedule: schedule || "",
      teacher: teacher || "",
      videoUrl: videoUrl || "",
      description: description || "",
      status: status || "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.batches.push(newBatch);
    writeBatchesData(data);

    console.log("✅ Batch created:", newBatch._id);

    res.status(201).json({
      success: true,
      message: "✅ Batch created successfully!",
      batch: newBatch,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE BATCH
app.put("/api/batches/update/:id", (req, res) => {
  try {
    console.log("📥 PUT /api/batches/update/:id", req.params.id);

    const { id } = req.params;
    const data = readBatchesData();
    const index = data.batches.findIndex((b) => b._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Batch not found!",
      });
    }

    data.batches[index] = {
      ...data.batches[index],
      ...req.body,
      students:
        parseInt(req.body.students) || data.batches[index].students || 0,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    writeBatchesData(data);

    console.log("✅ Batch updated:", id);

    res.status(200).json({
      success: true,
      message: "✅ Batch updated successfully!",
      batch: data.batches[index],
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE BATCH
app.delete("/api/batches/delete/:id", (req, res) => {
  try {
    console.log("📥 DELETE /api/batches/delete/:id", req.params.id);

    const { id } = req.params;
    const data = readBatchesData();
    const filtered = data.batches.filter((b) => b._id !== id);

    if (filtered.length === data.batches.length) {
      return res.status(404).json({
        success: false,
        message: "Batch not found!",
      });
    }

    data.batches = filtered;
    writeBatchesData(data);

    console.log("✅ Batch deleted:", id);

    res.status(200).json({
      success: true,
      message: "✅ Batch deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ STUDENT ROUTES
// =============================================

// GET ALL STUDENTS
app.get("/api/students/all", async (req, res) => {
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

// REGISTER STUDENT
// REGISTER STUDENT
app.post("/api/students/register/student", async (req, res) => {
  try {
    console.log("📥 POST /api/students/register/student");
    console.log("📝 Body:", req.body);

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
      fatherName,
      motherName,
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
    const existingStudent = await studentsCollection.findOne({
      $or: [{ phone: phone }, { email: email }],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message:
          "এই ফোন নম্বর অথবা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রেজিস্টার্ড করা আছে!",
      });
    }

    // ============================================================
    // ✅ AUTO-CREATE COURSES in courses.json
    // Student যেসব কোর্সে enroll করেছে সেগুলো courses.json-এ add
    // ============================================================
    const courseNames = String(course)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log("📚 Student enrolled in:", courseNames);

    const coursesData = readData();
    const enrolledIds = [];

    courseNames.forEach((courseName) => {
      // এই নামের কোর্স আগে থেকেই আছে কি?
      let existingCourse = coursesData.courses.find(
        (c) =>
          (c.title || "").toLowerCase() === courseName.toLowerCase() ||
          (c.code || "").toLowerCase() === courseName.toLowerCase(),
      );

      if (existingCourse) {
        console.log(`✅ Found existing: ${courseName}`);
      } else {
        // নতুন কোর্স তৈরি
        const newCourseId =
          Date.now().toString() + Math.floor(Math.random() * 1000);
        existingCourse = {
          _id: newCourseId,
          title: courseName,
          code: courseName
            .substring(0, 8)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, ""),
          description: `${courseName} course`,
          category: "Admission Enrolled",
          department: "General",
          className: courseName,
          teacher: "",
          duration: "",
          status: "Active",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          schedule: "",
          students: 1,
          progress: 0,
          videos: 0,
          assignments: 0,
          quizzes: 0,
          materials: 0,
          sessions: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        coursesData.courses.push(existingCourse);
        console.log(`✅ Created new: ${courseName} → ${newCourseId}`);
      }

      enrolledIds.push(existingCourse._id);
    });

    writeData(coursesData);
    console.log("📚 Enrolled IDs:", enrolledIds);

    // ============================================================
    // ✅ নতুন Student ডকুমেন্ট — enrolledCourses সহ
    // ============================================================
    const newStudent = {
      name,
      email,
      phone,
      password,
      course,
      enrolledCourses: enrolledIds, // ⬅️ এখানে save হবে
      presentAddress: presentAddress || "",
      permanentAddress: permanentAddress || "",
      dobOrNid: dobOrNid || "",
      guardianName: guardianName || fatherName || "",
      guardianPhone: guardianPhone || phone,
      fatherName: fatherName || "",
      motherName: motherName || "",
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
    console.log("✅ Student registered:", result.insertedId);
    console.log("📚 With courses:", enrolledIds);

    res.status(201).json({
      success: true,
      message:
        "রেজিস্ট্রেশন সফল! অ্যাডমিন approve করার পর আপনি লগইন করতে পারবেন।",
      studentId: result.insertedId,
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// APPROVE STUDENT
// APPROVE STUDENT
app.put("/api/students/approve/:id", async (req, res) => {
  try {
    console.log("📥 PUT /api/students/approve/:id called");
    const { id } = req.params;
    const { username, password, roll, enrolledCourses } = req.body;

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

    const student = await studentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

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

    await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          username: username,
          password: password,
          roll: roll || "",
          status: "Active",
          approvedAt: new Date(),
          updatedAt: new Date(),
          enrolledCourses: enrolledCourses || [],
        },
      },
    );

    console.log(`✅ Student ${student.name} approved`);
    console.log(`📚 Enrolled Courses:`, enrolledCourses);

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
// ✅ STUDENT LOGIN (Fixed)
// =============================================
app.post("/api/students/login", async (req, res) => {
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

    // ✅ Username দিয়ে Student খুঁজুন (case insensitive)
    const student = await studentsCollection.findOne({
      username: { $regex: new RegExp("^" + username + "$", "i") },
    });

    console.log("📝 Student found:", student ? student.name : "Not found");

    if (!student) {
      return res.status(401).json({
        success: false,
        message:
          "ইউজারনেম বা পাসওয়ার্ড ভুল! অথবা আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি।",
      });
    }

    // ✅ Check if student is approved
    if (student.status !== "Active") {
      return res.status(401).json({
        success: false,
        message:
          "আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি। দয়া করে অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });
    }

    // ✅ Password চেক করুন
    if (student.password !== password) {
      console.log("❌ Password mismatch");
      return res.status(401).json({
        success: false,
        message: "ইউজারনেম বা পাসওয়ার্ড ভুল!",
      });
    }

    // =============================================
    // ✅ TEACHER PROFILE ROUTES (JSON File Based)
    // =============================================

    // ✅ Get Teacher Profile
    app.get("/api/teacher/profile/:email", async (req, res) => {
      try {
        const { email } = req.params;
        console.log("📥 GET /api/teacher/profile/:email", email);

        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email is required!",
          });
        }

        const PROFILE_FILE = path.join(__dirname, "teacher_profiles.json");
        let profiles = {};

        if (fs.existsSync(PROFILE_FILE)) {
          try {
            const data = fs.readFileSync(PROFILE_FILE, "utf8");
            profiles = JSON.parse(data);
          } catch (error) {
            profiles = {};
          }
        }

        // যদি প্রোফাইল থাকে
        if (profiles[email]) {
          return res.json({
            success: true,
            teacher: profiles[email],
          });
        }

        // ডিফল্ট প্রোফাইল
        const defaultProfile = {
          name: "শায়খ ড. মাওলানা মুহাম্মদ আব্দুল্লাহ",
          title:
            "প্রধান উস্তাদ ও বিভাগীয় প্রধান - তারবিয়াহ আলেমিয়াহ প্রোগ্রাম",
          email: email,
          phone: "+৮৮০ ১৭০০ ১২৩৪৫৬",
          bio: "আল-আজহার বিশ্ববিদ্যালয় থেকে হাদিস ও শরিয়াহর ওপর উচ্চতর ডিগ্রি অর্জন করেছেন। দীর্ঘ ১৫ বছরেরও বেশি সময় ধরে কওমি মাদরাসা এবং অনলাইন প্ল্যাটফর্মে ইসলামিক স্টাডিজ ও আরবি ভাষা শিক্ষাদানে নিয়োজিত আছেন।",
          joinDate: "জানুয়ারি ২০২০",
          totalStudents: "১৫০+",
          totalCourses: "৮টি",
          rating: "৪.৯",
          photo: "",
          education: [
            {
              degree: "পিএইচডি (Hadith & Islamic Studies)",
              institution: "আল-আজহার বিশ্ববিদ্যালয়, মিসর",
              year: "২০১৮",
            },
            {
              degree: "মাস্টার্স (Tafseer & Quranic Sciences)",
              institution: "ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া",
              year: "২০১২",
            },
            {
              degree: "দাওরায়ে হাদিস (তাকমীল)",
              institution: "জামিয়া আরামিয়া দারুল উলুম",
              year: "২০০৯",
            },
          ],
          expertise: [
            "হাদিস শাস্ত্র",
            "উসূলে ফিকহ",
            "আরবি ব্যাকরণ (নাহু-সরফ)",
            "তাফসিরুল কুরআন",
          ],
          courses: [
            {
              title: "তারবিয়াহ আলেমিয়াহ প্রোগ্রাম",
              students: "৪৫ জন",
              duration: "৪ বছর",
              icon: "📚",
            },
            {
              title: "ডিপ্লোমা ইন ইসলামিক স্টাডিজ",
              students: "৬০ জন",
              duration: "১ বছর",
              icon: "🎓",
            },
            {
              title: "কুরআন ফর এল্ডারস",
              students: "২৫ জন",
              duration: "৬ মাস",
              icon: "📖",
            },
          ],
          achievements: [
            "বেস্ট অনলাইন শিক্ষক পুরস্কার ২০২৩",
            "হাদিস গবেষণায় স্বর্ণপদক - ২০১৮",
            "শিক্ষাক্ষেত্রে অবদানের জন্য সম্মাননা - ২০২১",
          ],
        };

        res.json({
          success: true,
          teacher: defaultProfile,
        });
      } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // ✅ Update Teacher Profile
    app.put("/api/teacher/profile/:email", async (req, res) => {
      try {
        const { email } = req.params;
        console.log("📥 PUT /api/teacher/profile/:email", email);
        console.log("📝 Body:", req.body);

        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email is required!",
          });
        }

        const PROFILE_FILE = path.join(__dirname, "teacher_profiles.json");
        let profiles = {};

        if (fs.existsSync(PROFILE_FILE)) {
          try {
            const data = fs.readFileSync(PROFILE_FILE, "utf8");
            profiles = JSON.parse(data);
          } catch (error) {
            profiles = {};
          }
        }

        profiles[email] = {
          ...req.body,
          email: email,
          updatedAt: new Date().toISOString(),
        };

        fs.writeFileSync(PROFILE_FILE, JSON.stringify(profiles, null, 2));
        console.log("✅ Profile updated for:", email);

        res.json({
          success: true,
          message: "প্রোফাইল আপডেট হয়েছে!",
          teacher: profiles[email],
        });
      } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // ✅ Update Profile Photo
    app.post("/api/teacher/profile/:email/photo", async (req, res) => {
      try {
        const { email } = req.params;
        const { photoUrl } = req.body;

        if (!email || !photoUrl) {
          return res.status(400).json({
            success: false,
            message: "Email and photo URL are required!",
          });
        }

        const PROFILE_FILE = path.join(__dirname, "teacher_profiles.json");
        let profiles = {};

        if (fs.existsSync(PROFILE_FILE)) {
          try {
            const data = fs.readFileSync(PROFILE_FILE, "utf8");
            profiles = JSON.parse(data);
          } catch (error) {
            profiles = {};
          }
        }

        if (profiles[email]) {
          profiles[email].photo = photoUrl;
          profiles[email].updatedAt = new Date().toISOString();
        } else {
          profiles[email] = {
            email: email,
            photo: photoUrl,
            updatedAt: new Date().toISOString(),
          };
        }

        fs.writeFileSync(PROFILE_FILE, JSON.stringify(profiles, null, 2));

        res.json({
          success: true,
          message: "ছবি আপডেট হয়েছে!",
          photo: photoUrl,
        });
      } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // ✅ Remove password from response
    const { password: _, ...studentWithoutPassword } = student;

    console.log(`✅ Student ${student.name} logged in successfully`);

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

// DELETE STUDENT
app.delete("/api/students/delete/:id", async (req, res) => {
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

// GET SINGLE STUDENT
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

// GET STUDENT WITH PASSWORD
app.get("/api/students/details/:id", async (req, res) => {
  try {
    console.log("📥 GET /api/students/details/:id called");
    const { id } = req.params;
    const studentsCollection = getCollection("students");

    if (!studentsCollection) {
      return res.status(500).json({
        success: false,
        message: "Database collection not found!",
      });
    }

    const student = await studentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    res.status(200).json({
      success: true,
      student: student,
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
// ✅ TEACHER COURSE ROUTES (JSON File Based)
// =============================================

// Create Course
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

    if (!title || !code || !className || !startDate) {
      return res.status(400).json({
        success: false,
        message: "শিরোনাম, কোড, ক্লাস এবং শুরুর তারিখ আবশ্যক!",
      });
    }

    const data = readData();
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

// Get Teacher Courses
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

// Get Stats
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

// Update Course
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
    console.error("❌ Update Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete Course
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
    console.error("❌ Delete Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =============================================
// ✅ GET ALL TEACHERS (Fixed 2)
// =============================================
app.get("/api/teacher-attendance/teachers", (req, res) => {
  try {
    console.log("📥 GET /api/teacher-attendance/teachers");
    res.status(200).json({
      success: true,
      total: FIXED_TEACHERS.length,
      teachers: FIXED_TEACHERS,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ GET ALL ATTENDANCE
// =============================================
app.get("/api/teacher-attendance/all", (req, res) => {
  try {
    console.log("📥 GET /api/teacher-attendance/all");
    const data = readAttData();
    const attendance = (data.attendance || []).sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    res.status(200).json({
      success: true,
      total: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ GET ATTENDANCE BY DATE
// =============================================
app.get("/api/teacher-attendance/by-date/:date", (req, res) => {
  try {
    const { date } = req.params;
    console.log("📥 GET by-date:", date);

    const data = readAttData();
    const records = (data.attendance || []).filter((r) => r.date === date);

    res.status(200).json({
      success: true,
      total: records.length,
      attendance: records,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ GET ATTENDANCE FOR TEACHER (by month)
// =============================================
app.get("/api/teacher-attendance/teacher/:teacherId", (req, res) => {
  try {
    const { teacherId } = req.params;
    const { month, year } = req.query;
    console.log("📥 GET teacher attendance:", teacherId, month, year);

    const data = readAttData();
    let records = (data.attendance || []).filter(
      (r) => String(r.teacherId) === String(teacherId),
    );

    if (month !== undefined && year !== undefined) {
      records = records.filter((r) => {
        const d = new Date(r.date);
        return (
          d.getMonth() === parseInt(month) && d.getFullYear() === parseInt(year)
        );
      });
    }

    res.status(200).json({
      success: true,
      total: records.length,
      attendance: records,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ MARK / CREATE ATTENDANCE
// =============================================
app.post("/api/teacher-attendance/mark", (req, res) => {
  try {
    console.log("📥 POST /api/teacher-attendance/mark");
    console.log("📝 Body:", req.body);

    const { teacherId, teacherName, date, status, checkIn, checkOut, note } =
      req.body;

    if (!teacherId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "teacherId, date, and status are required!",
      });
    }

    const data = readAttData();

    // Check if exists for same teacher + date
    const existingIndex = data.attendance.findIndex(
      (r) => String(r.teacherId) === String(teacherId) && r.date === date,
    );

    if (existingIndex !== -1) {
      // UPDATE existing
      data.attendance[existingIndex] = {
        ...data.attendance[existingIndex],
        status,
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        note: note || "",
        updatedAt: new Date().toISOString(),
      };

      writeAttData(data);

      console.log("✅ Attendance updated:", data.attendance[existingIndex]._id);

      return res.status(200).json({
        success: true,
        message: "✅ Attendance updated!",
        attendance: data.attendance[existingIndex],
        updated: true,
      });
    }

    // CREATE new
    const newRecord = {
      _id: Date.now().toString() + Math.floor(Math.random() * 1000),
      teacherId,
      teacherName: teacherName || "",
      date,
      status,
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      note: note || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.attendance.push(newRecord);
    writeAttData(data);

    console.log("✅ Attendance created:", newRecord._id);

    res.status(201).json({
      success: true,
      message: "✅ Attendance marked successfully!",
      attendance: newRecord,
    });
  } catch (error) {
    console.error("❌ Mark Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ BULK MARK (multiple teachers same date)
// =============================================
app.post("/api/teacher-attendance/bulk-mark", (req, res) => {
  try {
    console.log("📥 POST /api/teacher-attendance/bulk-mark");
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "records array is required!",
      });
    }

    const data = readAttData();
    const results = [];

    records.forEach((rec) => {
      const existingIndex = data.attendance.findIndex(
        (r) =>
          String(r.teacherId) === String(rec.teacherId) && r.date === rec.date,
      );

      if (existingIndex !== -1) {
        data.attendance[existingIndex] = {
          ...data.attendance[existingIndex],
          status: rec.status,
          checkIn: rec.checkIn || "",
          checkOut: rec.checkOut || "",
          note: rec.note || "",
          updatedAt: new Date().toISOString(),
        };
        results.push(data.attendance[existingIndex]);
      } else {
        const newRecord = {
          _id: Date.now().toString() + Math.floor(Math.random() * 1000),
          teacherId: rec.teacherId,
          teacherName: rec.teacherName || "",
          date: rec.date,
          status: rec.status,
          checkIn: rec.checkIn || "",
          checkOut: rec.checkOut || "",
          note: rec.note || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        data.attendance.push(newRecord);
        results.push(newRecord);
      }
    });

    writeAttData(data);

    res.status(201).json({
      success: true,
      message: `✅ ${results.length} attendance records saved!`,
      attendance: results,
    });
  } catch (error) {
    console.error("❌ Bulk Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ UPDATE ATTENDANCE
// =============================================
app.put("/api/teacher-attendance/update/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = readAttData();
    const index = data.attendance.findIndex((r) => r._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Record not found!",
      });
    }

    data.attendance[index] = {
      ...data.attendance[index],
      ...req.body,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    writeAttData(data);

    res.status(200).json({
      success: true,
      message: "✅ Updated!",
      attendance: data.attendance[index],
    });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ DELETE ATTENDANCE
// =============================================
app.delete("/api/teacher-attendance/delete/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = readAttData();
    const filtered = data.attendance.filter((r) => r._id !== id);

    if (filtered.length === data.attendance.length) {
      return res.status(404).json({
        success: false,
        message: "Record not found!",
      });
    }

    data.attendance = filtered;
    writeAttData(data);

    res.status(200).json({
      success: true,
      message: "✅ Deleted!",
    });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ STATS — GET /api/teacher-attendance/stats
// =============================================
app.get("/api/teacher-attendance/stats", (req, res) => {
  try {
    const { month, year } = req.query;
    const data = readAttData();
    let records = data.attendance || [];
    const allTeachers = getFullAttTeachers();

    if (month !== undefined && year !== undefined) {
      records = records.filter((r) => {
        const d = new Date(r.date);
        return (
          d.getMonth() === parseInt(month) && d.getFullYear() === parseInt(year)
        );
      });
    }

    const stats = allTeachers.map((t) => {
      const tr = records.filter((r) => String(r.teacherId) === String(t.id));
      const present = tr.filter((r) => r.status === "Present").length;
      const absent = tr.filter((r) => r.status === "Absent").length;
      const late = tr.filter((r) => r.status === "Late").length;
      const leave = tr.filter((r) => r.status === "Leave").length;
      const total = tr.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        teacherId: t.id,
        teacherName: t.name,
        teacherCode: t.teacherId,
        total,
        present,
        absent,
        late,
        leave,
        percentage,
      };
    });

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// =============================================
// ✅ SEED SAMPLE DATA (optional)
// =============================================
app.post("/api/teacher-attendance/seed", (req, res) => {
  try {
    const data = { attendance: [] };
    const statuses = [
      "Present",
      "Present",
      "Present",
      "Present",
      "Late",
      "Absent",
      "Leave",
    ];

    // Last 30 days
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      // Skip Friday
      if (d.getDay() === 5) continue;

      const dateStr = d.toISOString().split("T")[0];

      FIXED_TEACHERS.forEach((teacher) => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        data.attendance.push({
          _id: `${dateStr}-${teacher.id}-${Date.now()}-${Math.random()}`,
          teacherId: teacher.id,
          teacherName: teacher.name,
          date: dateStr,
          status,
          checkIn:
            status === "Present" || status === "Late"
              ? `${8 + Math.floor(Math.random() * 2)}:00 AM`
              : "",
          checkOut: status === "Present" || status === "Late" ? "4:00 PM" : "",
          note:
            status === "Late"
              ? "Arrived late"
              : status === "Absent"
                ? "No notification"
                : "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    writeAttData(data);

    res.status(201).json({
      success: true,
      message: `✅ Seeded ${data.attendance.length} records`,
      total: data.attendance.length,
    });
  } catch (error) {
    console.error("❌ Seed Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// =============================================
// ✅ GET STUDENT'S ENROLLED COURSES
// =============================================
// =============================================
// =============================================
// ✅ GET STUDENT'S ENROLLED COURSES
// Student যে কোর্সে enroll করেছে, শুধু সেগুলোই দেখাবে
// =============================================
// =============================================
// ✅ GET STUDENT'S ENROLLED COURSES
// Fallback: enrolledCourses খালি হলে student.course থেকে auto-create
// =============================================
app.get("/api/students/my-courses/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("========================================");
    console.log("📥 GET my-courses for:", studentId);

    const studentsCollection = getCollection("students");
    const student = await studentsCollection.findOne({
      _id: new ObjectId(studentId),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    console.log("👤 Student:", student.name);
    console.log("📚 enrolledCourses:", student.enrolledCourses);
    console.log("📚 student.course:", student.course);

    const coursesData = readData();
    let allCourses = coursesData.courses || [];

    let enrolledCourseIds = student.enrolledCourses || [];
    let myCourses = [];

    // ✅ Step 1: enrolledCourses IDs দিয়ে match
    if (enrolledCourseIds.length > 0) {
      myCourses = allCourses.filter((c) => enrolledCourseIds.includes(c._id));
      console.log(`✅ Step 1: Matched ${myCourses.length} by IDs`);
    }

    // ✅ Step 2: Fallback — student.course string থেকে auto-create/match
    if (myCourses.length === 0 && student.course) {
      console.log("⚠️ Fallback: Processing student.course string");

      const courseNames = String(student.course)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      console.log("🔍 Course names:", courseNames);

      const newIds = [];

      courseNames.forEach((courseName) => {
        // আগে existing course খুঁজি (partial match)
        const lowerName = courseName.toLowerCase();
        let existing = allCourses.find((c) => {
          const title = (c.title || "").toLowerCase();
          const code = (c.code || "").toLowerCase();
          return (
            title === lowerName ||
            code === lowerName ||
            title.includes(lowerName) ||
            lowerName.includes(title)
          );
        });

        // না পেলে নতুন তৈরি
        if (!existing) {
          const newCourseId =
            Date.now().toString() + Math.floor(Math.random() * 10000);
          existing = {
            _id: newCourseId,
            title: courseName,
            code: courseName
              .substring(0, 8)
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, ""),
            description: `${courseName} course`,
            category: "Admission Enrolled",
            department: "General",
            className: courseName,
            teacher: "",
            duration: "",
            status: "Active",
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            schedule: "",
            students: 1,
            progress: 0,
            videos: 0,
            assignments: 0,
            quizzes: 0,
            materials: 0,
            sessions: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          allCourses.push(existing);
          console.log(`✅ Auto-created: ${courseName} → ${newCourseId}`);
        } else {
          console.log(`✅ Found existing: ${courseName} → ${existing._id}`);
        }

        newIds.push(existing._id);
      });

      // courses.json-এ save
      coursesData.courses = allCourses;
      writeData(coursesData);

      // Student-এর ডকুমেন্টে enrolledCourses save
      await studentsCollection.updateOne(
        { _id: new ObjectId(studentId) },
        {
          $set: {
            enrolledCourses: newIds,
            updatedAt: new Date(),
          },
        },
      );

      console.log("💾 Saved enrolledCourses:", newIds);

      myCourses = allCourses.filter((c) => newIds.includes(c._id));
      console.log(`✅ Step 2: Matched ${myCourses.length} courses`);
    }

    console.log(`🎯 Final: ${myCourses.length} courses`);
    console.log("========================================");

    res.status(200).json({
      success: true,
      studentName: student.name,
      studentId: student._id,
      total: myCourses.length,
      courses: myCourses,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// =============================================
// ✅ TODAY'S CLASSES — API ROUTES
// =============================================

// GET ALL
app.get("/api/today-classes", async (req, res) => {
  try {
    console.log("📥 GET /api/today-classes");
    const data = readClassesData();
    const classes = data.classes.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    res.status(200).json({
      success: true,
      total: classes.length,
      classes: classes,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE
app.post("/api/today-classes", async (req, res) => {
  try {
    console.log("📥 POST /api/today-classes");
    console.log("📝 Body:", req.body);

    const {
      name,
      subject,
      class: classLevel,
      teacher,
      time,
      days,
      room,
      status,
      link,
      department,
      totalStudents,
    } = req.body;

    if (!name || !subject || !teacher || !time) {
      return res.status(400).json({
        success: false,
        message: "Class Name, Subject, Teacher, and Time are required!",
      });
    }

    const data = readClassesData();

    const newClass = {
      _id: Date.now().toString(),
      id: data.classes.length + 1,
      name,
      subject,
      class: classLevel || "",
      teacher,
      time,
      days: days || [],
      room: room || "",
      status: status || "Upcoming",
      link: link || "",
      department: department || "",
      students: parseInt(totalStudents) || 0,
      totalStudents: parseInt(totalStudents) || 0,
      attendance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.classes.push(newClass);
    writeClassesData(data);

    console.log("✅ Class created:", newClass.name);

    res.status(201).json({
      success: true,
      message: "Class created successfully!",
      class: newClass,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE
app.put("/api/today-classes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/today-classes/:id", id);

    const data = readClassesData();
    const index = data.classes.findIndex((c) => c._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Class not found!",
      });
    }

    data.classes[index] = {
      ...data.classes[index],
      ...req.body,
      students:
        parseInt(req.body.totalStudents) || data.classes[index].students,
      totalStudents:
        parseInt(req.body.totalStudents) || data.classes[index].totalStudents,
      updatedAt: new Date().toISOString(),
    };

    writeClassesData(data);

    res.status(200).json({
      success: true,
      message: "Class updated successfully!",
      class: data.classes[index],
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE
app.delete("/api/today-classes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/today-classes/:id", id);

    const data = readClassesData();
    const filtered = data.classes.filter((c) => c._id !== id);

    if (filtered.length === data.classes.length) {
      return res.status(404).json({
        success: false,
        message: "Class not found!",
      });
    }

    data.classes = filtered;
    writeClassesData(data);

    res.status(200).json({
      success: true,
      message: "Class deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE ATTENDANCE
app.put("/api/today-classes/:id/attendance", async (req, res) => {
  try {
    const { id } = req.params;
    const { attendance } = req.body;

    const data = readClassesData();
    const index = data.classes.findIndex((c) => c._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Class not found!",
      });
    }

    const total = data.classes[index].totalStudents || 0;
    const att = parseInt(attendance) || 0;

    if (att < 0 || att > total) {
      return res.status(400).json({
        success: false,
        message: `Attendance must be between 0 and ${total}`,
      });
    }

    data.classes[index].attendance = att;
    data.classes[index].updatedAt = new Date().toISOString();
    writeClassesData(data);

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully!",
      class: data.classes[index],
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE STATUS
app.put("/api/today-classes/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status!",
      });
    }

    const data = readClassesData();
    const index = data.classes.findIndex((c) => c._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Class not found!",
      });
    }

    data.classes[index].status = status;
    data.classes[index].updatedAt = new Date().toISOString();
    writeClassesData(data);

    res.status(200).json({
      success: true,
      message: "Status updated successfully!",
      class: data.classes[index],
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// basic tajweed payment over view added api
// ✅ GET ALL BASIC TAZWEED STUDENTS
// =============================================
// ✅ BASIC TAZWEED — API Routes
// =============================================

// ✅ GET ALL
app.get("/api/basic-tazweed/all", async (req, res) => {
  try {
    console.log("📥 GET /api/basic-tazweed/all");
    const collection = getCollection("basic_tazweed_students");
    if (!collection) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }
    const students = await collection.find({}).sort({ studentId: 1 }).toArray();
    console.log(`✅ Found ${students.length} students`);
    res.status(200).json({ success: true, total: students.length, students });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ ADD
app.post("/api/basic-tazweed/add", async (req, res) => {
  try {
    console.log("📥 POST /api/basic-tazweed/add");
    const body = req.body;
    if (!body.studentId || !body.name || !body.phone) {
      return res.status(400).json({
        success: false,
        message: "Student ID, Name, and Phone are required!",
      });
    }
    const collection = getCollection("basic_tazweed_students");
    const existing = await collection.findOne({ studentId: body.studentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student ID ${body.studentId} already exists!`,
      });
    }

    const newStudent = {
      studentId: body.studentId,
      name: body.name,
      phone: body.phone,
      country: body.country || "BD",
      scholarshipAmount: Number(body.scholarshipAmount) || 0,
      courseFee: Number(body.courseFee) || 0,
      paidAmount: Number(body.paidAmount) || 0,
      transactionId: body.transactionId || "---",
      dueAmount: Number(body.dueAmount) || 0,
      julyAugust: Number(body.julyAugust) || 0,
      september: Number(body.september) || 0,
      paymentMethodSept: body.paymentMethodSept || "---",
      paymentDateSept: body.paymentDateSept || "---",
      transactionIdSept: body.transactionIdSept || "---",
      october: Number(body.october) || 0,
      paymentMethodOct: body.paymentMethodOct || "---",
      paymentDateOct: body.paymentDateOct || "---",
      transactionIdOct: body.transactionIdOct || "---",
      november: Number(body.november) || 0,
      paymentMethodNov: body.paymentMethodNov || "---",
      paymentDateNov: body.paymentDateNov || "---",
      transactionIdNov: body.transactionIdNov || "---",
      december: Number(body.december) || 0,
      paymentMethodDec: body.paymentMethodDec || "---",
      paymentDateDec: body.paymentDateDec || "---",
      transactionIdDec: body.transactionIdDec || "---",
      comments: body.comments || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newStudent);
    console.log("✅ Student added:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "Student added successfully!",
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE
app.put("/api/basic-tazweed/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const collection = getCollection("basic_tazweed_students");
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updated = await collection.findOne({ _id: new ObjectId(id) });
    res
      .status(200)
      .json({ success: true, message: "Updated!", student: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE
app.delete("/api/basic-tazweed/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const collection = getCollection("basic_tazweed_students");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ SEED — সব ৩১টা data একবারে insert
app.post("/api/basic-tazweed/seed", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.join(__dirname, "basic_tazweed_data.json");

    if (!fs.existsSync(jsonPath)) {
      return res.status(404).json({
        success: false,
        message: "basic_tazweed_data.json file not found in backend folder!",
      });
    }

    const rawData = fs.readFileSync(jsonPath, "utf8");
    const seedData = JSON.parse(rawData);

    const collection = getCollection("basic_tazweed_students");
    await collection.deleteMany({});
    const result = await collection.insertMany(seedData);

    console.log(`✅ Seeded ${result.insertedCount} students`);
    res.status(201).json({
      success: true,
      message: `${result.insertedCount} students seeded successfully!`,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("❌ Seed Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ NAJERA BATCH — API Routes
// =============================================

// ✅ GET ALL
app.get("/api/najera-batch/all", async (req, res) => {
  try {
    console.log("📥 GET /api/najera-batch/all");
    const collection = getCollection("najera_batch_students");
    if (!collection) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }
    const students = await collection.find({}).sort({ studentId: 1 }).toArray();
    console.log(`✅ Found ${students.length} students`);
    res.status(200).json({ success: true, total: students.length, students });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ ADD
app.post("/api/najera-batch/add", async (req, res) => {
  try {
    console.log("📥 POST /api/najera-batch/add");
    const body = req.body;
    if (!body.studentId || !body.name || !body.phone) {
      return res.status(400).json({
        success: false,
        message: "Student ID, Name, and Phone are required!",
      });
    }
    const collection = getCollection("najera_batch_students");
    const existing = await collection.findOne({ studentId: body.studentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student ID ${body.studentId} already exists!`,
      });
    }

    const newStudent = {
      studentId: body.studentId,
      name: body.name,
      phone: body.phone,
      country: body.country || "BD",
      scholarshipAmount: Number(body.scholarshipAmount) || 0,
      courseFee: Number(body.courseFee) || 0,
      paidAmount: Number(body.paidAmount) || 0,
      transactionId: body.transactionId || "---",
      dueAmount: Number(body.dueAmount) || 0,
      julyAugust: Number(body.julyAugust) || 0,
      september: Number(body.september) || 0,
      paymentMethodSept: body.paymentMethodSept || "---",
      paymentDateSept: body.paymentDateSept || "---",
      transactionIdSept: body.transactionIdSept || "---",
      october: Number(body.october) || 0,
      paymentMethodOct: body.paymentMethodOct || "---",
      paymentDateOct: body.paymentDateOct || "---",
      transactionIdOct: body.transactionIdOct || "---",
      november: Number(body.november) || 0,
      paymentMethodNov: body.paymentMethodNov || "---",
      paymentDateNov: body.paymentDateNov || "---",
      transactionIdNov: body.transactionIdNov || "---",
      december: Number(body.december) || 0,
      paymentMethodDec: body.paymentMethodDec || "---",
      paymentDateDec: body.paymentDateDec || "---",
      transactionIdDec: body.transactionIdDec || "---",
      comments: body.comments || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newStudent);
    console.log("✅ Student added:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "Student added successfully!",
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE
app.put("/api/najera-batch/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const collection = getCollection("najera_batch_students");
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updated = await collection.findOne({ _id: new ObjectId(id) });
    res
      .status(200)
      .json({ success: true, message: "Updated!", student: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE
app.delete("/api/najera-batch/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const collection = getCollection("najera_batch_students");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ SEED — সব ৭টা data একবারে insert
app.post("/api/najera-batch/seed", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.join(__dirname, "najera_batch_data.json");

    if (!fs.existsSync(jsonPath)) {
      return res.status(404).json({
        success: false,
        message: "najera_batch_data.json file not found!",
      });
    }

    const rawData = fs.readFileSync(jsonPath, "utf8");
    const seedData = JSON.parse(rawData);

    const collection = getCollection("najera_batch_students");
    await collection.deleteMany({});
    const result = await collection.insertMany(seedData);

    console.log(`✅ Seeded ${result.insertedCount} students`);
    res.status(201).json({
      success: true,
      message: `${result.insertedCount} students seeded successfully!`,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("❌ Seed Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ CREATE NEW BASIC TAZWEED STUDENT
app.post("/api/basic-tazweed/add", async (req, res) => {
  try {
    console.log("📥 POST /api/basic-tazweed/add");
    console.log("📝 Body:", req.body);

    const {
      studentId,
      name,
      phone,
      country,
      scholarshipAmount,
      courseFee,
      paidAmount,
      transactionId,
      dueAmount,
      julyAugust,
      september,
      paymentMethodSept,
      paymentDateSept,
      transactionIdSept,
      october,
      paymentMethodOct,
      paymentDateOct,
      transactionIdOct,
      november,
      paymentMethodNov,
      paymentDateNov,
      transactionIdNov,
    } = req.body;

    // Validation
    if (!studentId || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Student ID, Name, and Phone are required!",
      });
    }

    const collection = getCollection("basic_tazweed_students");

    // Check for duplicate studentId
    const existing = await collection.findOne({ studentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student ID ${studentId} already exists!`,
      });
    }

    const newStudent = {
      studentId,
      name,
      phone,
      country: country || "BD",
      scholarshipAmount: Number(scholarshipAmount) || 0,
      courseFee: Number(courseFee) || 0,
      paidAmount: Number(paidAmount) || 0,
      transactionId: transactionId || "-",
      dueAmount: Number(dueAmount) || 0,
      julyAugust: Number(julyAugust) || 0,
      september: Number(september) || 0,
      paymentMethodSept: paymentMethodSept || "-",
      paymentDateSept: paymentDateSept || "-",
      transactionIdSept: transactionIdSept || "-",
      october: Number(october) || 0,
      paymentMethodOct: paymentMethodOct || "-",
      paymentDateOct: paymentDateOct || "-",
      transactionIdOct: transactionIdOct || "-",
      november: Number(november) || 0,
      paymentMethodNov: paymentMethodNov || "-",
      paymentDateNov: paymentDateNov || "-",
      transactionIdNov: transactionIdNov || "-",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newStudent);
    console.log("✅ Student added:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "Student added successfully!",
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE BASIC TAZWEED STUDENT
app.put("/api/basic-tazweed/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/basic-tazweed/update/:id", id);

    const collection = getCollection("basic_tazweed_students");
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: "Student updated successfully!",
      student: updated,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE BASIC TAZWEED STUDENT
app.delete("/api/basic-tazweed/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/basic-tazweed/delete/:id", id);

    const collection = getCollection("basic_tazweed_students");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

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
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ CREATE STUDENT — POST /api/admin-students/create
// =============================================
app.post("/api/admin-students/create", async (req, res) => {
  try {
    console.log("📥 POST /api/admin-students/create");
    console.log("📝 Body:", req.body);

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
      fatherName,
      motherName,
      gender,
      bloodGroup,
      nationality,
      religion,
      previousSchool,
      paymentStatus,
      status,
      admissionDate,

      // ✅ Image Fields
      studentId,
      country,
      batch,
      scholarshipAmount,
      courseFee,
      paidAmount,
      transactionId,
      dueAmount,
      julyAugust,
      september,
      paymentMethodSept,
      paymentDateSept,
      transactionIdSept,
      october,
      paymentMethodOct,
      paymentDateOct,
      transactionIdOct,
      november,
      paymentMethodNov,
      paymentDateNov,
      transactionIdNov,
      december,
      paymentMethodDec,
      paymentDateDec,
      transactionIdDec,
      comments,
    } = req.body;

    // Validation
    if (!name || !phone || !course) {
      return res.status(400).json({
        success: false,
        message: "নাম, ফোন নম্বর এবং কোর্স আবশ্যক!",
      });
    }

    const studentsCollection = getCollection("students");

    // Duplicate check
    const duplicateQuery = [];
    if (phone) duplicateQuery.push({ phone });
    if (studentId) duplicateQuery.push({ studentId });
    if (email) duplicateQuery.push({ email });

    if (duplicateQuery.length > 0) {
      const existing = await studentsCollection.findOne({
        $or: duplicateQuery,
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "এই ফোন/স্টুডেন্ট আইডি/ইমেইল দিয়ে ইতিমধ্যে রেজিস্টার করা আছে!",
        });
      }
    }

    // Auto-calculate due
    const finalDue =
      dueAmount !== undefined && dueAmount !== ""
        ? Number(dueAmount)
        : calcStudentDue(courseFee, scholarshipAmount, paidAmount);

    // Enroll Courses in courses.json
    const courseNames = String(course)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const coursesData = readData();
    const enrolledIds = [];

    courseNames.forEach((courseName) => {
      let existingCourse = coursesData.courses.find(
        (c) =>
          (c.title || "").toLowerCase() === courseName.toLowerCase() ||
          (c.code || "").toLowerCase() === courseName.toLowerCase(),
      );

      if (!existingCourse) {
        const newCourseId =
          Date.now().toString() + Math.floor(Math.random() * 1000);
        existingCourse = {
          _id: newCourseId,
          title: courseName,
          code: courseName
            .substring(0, 8)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, ""),
          description: `${courseName} course`,
          category: "Admission Enrolled",
          department: "General",
          className: courseName,
          teacher: "",
          duration: "",
          status: "Active",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          schedule: "",
          students: 1,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        coursesData.courses.push(existingCourse);
      }

      enrolledIds.push(existingCourse._id);
    });

    writeData(coursesData);

    // ✅ NEW STUDENT OBJECT
    const newStudent = {
      // Personal
      name,
      email: email || "",
      phone,
      password: password || "default123",
      course,
      enrolledCourses: enrolledIds,
      presentAddress: presentAddress || "",
      permanentAddress: permanentAddress || "",
      dobOrNid: dobOrNid || "",
      guardianName: guardianName || fatherName || "",
      guardianPhone: guardianPhone || phone,
      fatherName: fatherName || "",
      motherName: motherName || "",
      gender: gender || "Male",
      bloodGroup: bloodGroup || "",
      nationality: nationality || "Bangladeshi",
      religion: religion || "Islam",
      previousSchool: previousSchool || "",

      // ✅ Image Fields
      studentId: studentId || "",
      country: country || "BD",
      batch: batch || "",
      scholarshipAmount: Number(scholarshipAmount) || 0,
      courseFee: Number(courseFee) || 0,
      paidAmount: Number(paidAmount) || 0,
      transactionId: transactionId || "---",
      dueAmount: finalDue,
      julyAugust: Number(julyAugust) || 0,

      september: Number(september) || 0,
      paymentMethodSept: paymentMethodSept || "---",
      paymentDateSept: paymentDateSept || "---",
      transactionIdSept: transactionIdSept || "---",

      october: Number(october) || 0,
      paymentMethodOct: paymentMethodOct || "---",
      paymentDateOct: paymentDateOct || "---",
      transactionIdOct: transactionIdOct || "---",

      november: Number(november) || 0,
      paymentMethodNov: paymentMethodNov || "---",
      paymentDateNov: paymentDateNov || "---",
      transactionIdNov: transactionIdNov || "---",

      december: Number(december) || 0,
      paymentMethodDec: paymentMethodDec || "---",
      paymentDateDec: paymentDateDec || "---",
      transactionIdDec: transactionIdDec || "---",

      comments: comments || "",

      // Status
      paymentStatus: paymentStatus || "Unpaid",
      status: status || "Pending",
      admissionDate: admissionDate || new Date().toISOString().split("T")[0],
      username: "",
      roll: "",
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await studentsCollection.insertOne(newStudent);
    console.log("✅ Student created:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "✅ স্টুডেন্ট সফলভাবে রেজিস্টার হয়েছে!",
      studentId: result.insertedId,
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Create Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ GET ALL STUDENTS — GET /api/admin-students/all
// =============================================
app.get("/api/admin-students/all", async (req, res) => {
  try {
    console.log("📥 GET /api/admin-students/all");
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

    // Password hide
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
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ GET SINGLE STUDENT — GET /api/admin-students/details/:id
// =============================================
app.get("/api/admin-students/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 GET /api/admin-students/details/:id →", id);

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

    res.status(200).json({
      success: true,
      student: student, // Password সহ (Admin এর জন্য)
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ APPROVE STUDENT — PUT /api/admin-students/approve/:id
// =============================================
app.put("/api/admin-students/approve/:id", async (req, res) => {
  try {
    console.log("📥 PUT /api/admin-students/approve/:id");
    const { id } = req.params;
    const { username, password, roll, enrolledCourses } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required!",
      });
    }

    const studentsCollection = getCollection("students");

    // Check username already exists
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

    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          username,
          password,
          roll: roll || "",
          status: "Active",
          approvedAt: new Date(),
          updatedAt: new Date(),
          enrolledCourses: enrolledCourses || [],
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
      message: "✅ Student approved successfully!",
    });
  } catch (error) {
    console.error("❌ Approve Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ DELETE STUDENT — DELETE /api/admin-students/delete/:id
// =============================================
app.delete("/api/admin-students/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/admin-students/delete/:id →", id);

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
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ UPDATE STUDENT — PUT /api/admin-students/update/:id
// =============================================
app.put("/api/admin-students/update/:id", async (req, res) => {
  try {
    console.log("📥 PUT /api/admin-students/update/:id");
    const { id } = req.params;

    const studentsCollection = getCollection("students");

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    // Auto re-calc due if fee/paid/scholarship updated
    if (
      updateData.courseFee !== undefined ||
      updateData.paidAmount !== undefined ||
      updateData.scholarshipAmount !== undefined
    ) {
      const existing = await studentsCollection.findOne({
        _id: new ObjectId(id),
      });
      if (existing) {
        updateData.dueAmount = calcStudentDue(
          updateData.courseFee ?? existing.courseFee,
          updateData.scholarshipAmount ?? existing.scholarshipAmount,
          updateData.paidAmount ?? existing.paidAmount,
        );
      }
    }

    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found!",
      });
    }

    const updated = await studentsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      success: true,
      message: "Student updated successfully!",
      student: updated,
    });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ STUDENT LOGIN — POST /api/admin-students/login
// =============================================
app.post("/api/admin-students/login", async (req, res) => {
  try {
    console.log("📥 POST /api/admin-students/login");
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "ইউজারনেম এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    const studentsCollection = getCollection("students");

    const student = await studentsCollection.findOne({
      username: { $regex: new RegExp("^" + username + "$", "i") },
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "ইউজারনেম বা পাসওয়ার্ড ভুল!",
      });
    }

    if (student.status !== "Active") {
      return res.status(401).json({
        success: false,
        message: "আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি!",
      });
    }

    if (student.password !== password) {
      return res.status(401).json({
        success: false,
        message: "ইউজারনেম বা পাসওয়ার্ড ভুল!",
      });
    }

    const { password: _, ...studentWithoutPassword } = student;

    res.status(200).json({
      success: true,
      message: "লগইন সফল!",
      user: studentWithoutPassword,
      token: "student_" + Date.now() + "_" + student._id,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ SEARCH STUDENT — GET /api/admin-students/search
// =============================================
app.get("/api/admin-students/search", async (req, res) => {
  try {
    const { q, batch, status: stuStatus } = req.query;
    const studentsCollection = getCollection("students");

    const query = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { studentId: { $regex: q, $options: "i" } },
      ];
    }
    if (batch) query.batch = batch;
    if (stuStatus) query.status = stuStatus;

    const students = await studentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const sanitized = students.map((s) => {
      const { password, ...rest } = s;
      return rest;
    });

    res.status(200).json({
      success: true,
      total: sanitized.length,
      students: sanitized,
    });
  } catch (error) {
    console.error("❌ Search Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ GET BATCH SUMMARY — GET /api/admin-students/batch-summary
// =============================================
app.get("/api/admin-students/batch-summary", async (req, res) => {
  try {
    const studentsCollection = getCollection("students");
    const students = await studentsCollection.find({}).toArray();

    const batches = {};
    students.forEach((s) => {
      const key = s.batch || "Unassigned";
      if (!batches[key]) {
        batches[key] = {
          batch: key,
          totalStudents: 0,
          totalCourseFee: 0,
          totalPaid: 0,
          totalDue: 0,
          totalScholarship: 0,
        };
      }
      batches[key].totalStudents += 1;
      batches[key].totalCourseFee += Number(s.courseFee) || 0;
      batches[key].totalPaid += Number(s.paidAmount) || 0;
      batches[key].totalDue += Number(s.dueAmount) || 0;
      batches[key].totalScholarship += Number(s.scholarshipAmount) || 0;
    });

    res.status(200).json({
      success: true,
      batches: Object.values(batches),
    });
  } catch (error) {
    console.error("❌ Batch Summary Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ QUICK ADD TEACHER (only name + optional fields)
// POST /api/teachers-manage/quick-add
// =============================================
app.post("/api/teachers-manage/quick-add", (req, res) => {
  try {
    console.log("📥 POST /api/teachers-manage/quick-add");
    console.log("📝 Body:", req.body);

    const { name, specialization, experience, phone, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Teacher name is required!",
      });
    }

    const data = readTeachers();
    const trimmedName = name.trim();

    // Duplicate check (case insensitive)
    const existing = data.teachers.find(
      (t) => (t.name || "").toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existing) {
      // Already exists — return existing teacher
      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: `Teacher "${trimmedName}" already exists!`,
        teacher: existing,
      });
    }

    // Auto generate ID
    const totalTeachers = data.teachers.length;
    const newTeacherId = `TCH${String(totalTeachers + 1).padStart(3, "0")}`;

    const newTeacher = {
      _id: Date.now().toString() + Math.floor(Math.random() * 1000),
      id: newTeacherId,
      name: trimmedName,
      email: email || "",
      phone: phone || "",
      specialization: specialization || "General",
      experience: experience || "0 years",
      qualification: "",
      designation: "Teacher",
      gender: "",
      address: "",
      bio: "",
      status: "Active",
      isQuickAdded: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.teachers.push(newTeacher);
    writeTeachers(data);

    console.log("✅ Quick teacher added:", newTeacherId, trimmedName);

    res.status(201).json({
      success: true,
      message: `✅ Teacher "${trimmedName}" added successfully!`,
      teacher: newTeacher,
    });
  } catch (error) {
    console.error("❌ Quick Add Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ HEALTH CHECK
// =============================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// =============================================
// ✅ BATCH ROUTES
// =============================================

// GET ALL BATCHES
// ---- GET ALL ----

// GET ALL BATCHES

// ✅ GET ALL BATCHES
app.get("/api/batches/all", (req, res) => {
  try {
    console.log("📥 GET /api/batches/all");
    const data = readBatchesData();
    const batches = (data.batches || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    res.status(200).json({ success: true, total: batches.length, batches });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ CREATE BATCH
app.post("/api/batches/create", (req, res) => {
  try {
    console.log("📥 POST /api/batches/create");
    console.log("📝 Body:", req.body);

    const {
      name,
      course,
      students,
      schedule,
      teacher,
      videoUrl,
      description,
      status,
    } = req.body;

    if (!name || !course) {
      return res.status(400).json({
        success: false,
        message: "Batch Name এবং Course আবশ্যক!",
      });
    }

    const data = readBatchesData();

    const newBatch = {
      _id: Date.now().toString() + Math.floor(Math.random() * 1000),
      id: Date.now(),
      name: String(name).trim(),
      course: String(course).trim(),
      students: parseInt(students) || 0,
      schedule: schedule || "",
      teacher: teacher || "",
      videoUrl: videoUrl || "",
      videos: [], // ✅ Multiple videos array
      description: description || "",
      status: status || "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.batches.push(newBatch);
    writeBatchesData(data);

    console.log("✅ Batch created:", newBatch._id);

    res.status(201).json({
      success: true,
      message: "✅ Batch created successfully!",
      batch: newBatch,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE BATCH
app.put("/api/batches/update/:id", (req, res) => {
  try {
    console.log("📥 PUT /api/batches/update/:id", req.params.id);

    const { id } = req.params;
    const data = readBatchesData();
    const index = data.batches.findIndex((b) => b._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Batch not found!",
      });
    }

    data.batches[index] = {
      ...data.batches[index],
      ...req.body,
      students:
        parseInt(req.body.students) || data.batches[index].students || 0,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    writeBatchesData(data);

    console.log("✅ Batch updated:", id);

    res.status(200).json({
      success: true,
      message: "✅ Batch updated successfully!",
      batch: data.batches[index],
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE BATCH
app.delete("/api/batches/delete/:id", (req, res) => {
  try {
    console.log("📥 DELETE /api/batches/delete/:id", req.params.id);

    const { id } = req.params;
    const data = readBatchesData();
    const filtered = data.batches.filter((b) => b._id !== id);

    if (filtered.length === data.batches.length) {
      return res.status(404).json({
        success: false,
        message: "Batch not found!",
      });
    }

    data.batches = filtered;
    writeBatchesData(data);

    console.log("✅ Batch deleted:", id);

    res.status(200).json({
      success: true,
      message: "✅ Batch deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ GET COURSE VIDEOS (Student View)
// Batch এর videos গুলো course name দিয়ে খুঁজে বের করে
// =============================================
// =============================================
// ✅ BATCH: GET VIDEOS BY COURSE (Student View)
// =============================================
app.get("/api/batches/course-videos/:courseName", (req, res) => {
  try {
    const decoded = decodeURIComponent(req.params.courseName || "").trim();
    console.log("════════════════════════════════════════");
    console.log("📥 GET /api/batches/course-videos");
    console.log("🔍 Searching for course:", `"${decoded}"`);

    const data = readBatchesData();
    const allBatches = data.batches || [];

    console.log(`📦 Total batches in DB: ${allBatches.length}`);
    allBatches.forEach((b, i) => {
      const vidCount = (b.videos || []).length + (b.videoUrl ? 1 : 0);
      console.log(
        `   ${i + 1}. name="${b.name}" course="${b.course}" totalVideos=${vidCount}`,
      );
    });

    const searchLower = decoded.toLowerCase();

    // ✅ Flexible matching
    const matching = allBatches.filter((b) => {
      const bCourse = (b.course || "").toLowerCase().trim();
      const bName = (b.name || "").toLowerCase().trim();

      if (!bCourse && !bName) return false;
      if (bCourse === searchLower || bName === searchLower) return true;
      if (bCourse.includes(searchLower) || searchLower.includes(bCourse))
        return true;
      if (bName.includes(searchLower) || searchLower.includes(bName))
        return true;

      // Word-level match
      const sw = searchLower.split(/\s+/).filter((w) => w.length > 3);
      const bw = bCourse.split(/\s+/).filter((w) => w.length > 3);
      if (sw.some((w) => bw.includes(w))) return true;

      return false;
    });

    console.log(`✅ Matched batches: ${matching.length}`);

    // Build videos list
    const videos = [];
    matching.forEach((batch) => {
      // Primary video
      if (batch.videoUrl && batch.videoUrl.trim()) {
        videos.push({
          _id: batch._id + "_p",
          title: `${batch.name} - Primary Video`,
          url: batch.videoUrl.trim(),
          batchName: batch.name,
          teacher: batch.teacher || "",
          addedAt: batch.createdAt || "",
        });
      }
      // Multiple videos
      (batch.videos || []).forEach((v, i) => {
        if (v && v.url && v.url.trim()) {
          videos.push({
            _id: `${batch._id}_v${i}`,
            title: v.title || `Video ${i + 1}`,
            url: v.url.trim(),
            batchName: batch.name,
            teacher: batch.teacher || "",
            addedAt: v.addedAt || batch.createdAt || "",
          });
        }
      });
    });

    console.log(`🎯 Total videos to return: ${videos.length}`);
    console.log("════════════════════════════════════════");

    res.status(200).json({
      success: true,
      searchedCourse: decoded,
      totalBatches: allBatches.length,
      matchedBatches: matching.length,
      total: videos.length,
      videos,
      // Debug info
      debug: {
        allBatchCourses: allBatches.map((b) => ({
          name: b.name,
          course: b.course,
          videoCount: (b.videos || []).length + (b.videoUrl ? 1 : 0),
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ DEBUG: List all batches with courses + video counts
// =============================================
app.get("/api/batches/debug", (req, res) => {
  try {
    const data = readBatchesData();
    const summary = (data.batches || []).map((b) => ({
      _id: b._id,
      name: b.name,
      course: b.course,
      primaryVideo: b.videoUrl || "(none)",
      videosCount: (b.videos || []).length,
      videos: (b.videos || []).map((v) => ({
        title: v.title,
        url: v.url,
      })),
    }));

    res.status(200).json({
      success: true,
      totalBatches: summary.length,
      batches: summary,
    });
  } catch (error) {
    console.error("❌", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ DEBUG: List all batches
// =============================================
app.get("/api/batches/debug-list", (req, res) => {
  try {
    const data = readBatchesData();
    const list = (data.batches || []).map((b) => ({
      _id: b._id,
      name: b.name,
      course: b.course,
      hasPrimaryVideo: !!b.videoUrl,
      videosCount: (b.videos || []).length,
      videos: (b.videos || []).map((v) => ({
        title: v.title,
        url: v.url,
      })),
    }));
    res.json({ success: true, totalBatches: list.length, batches: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ CREATE / UPSERT grade
app.post("/api/grades/create", (req, res) => {
  try {
    console.log("📥 POST /api/grades/create");
    console.log("📝 Body:", req.body);

    const {
      studentId,
      studentName,
      studentRoll,
      courseId,
      courseTitle,
      courseCode,
      grad,
      classTest,
      midTerm,
      finalExam,
      teacher,
      remarks,
    } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Student এবং Course আবশ্যক!",
      });
    }

    const data = readGradesData();

    // ✅ Check if grade already exists for this student+course
    const existingIndex = data.grades.findIndex(
      (g) => g.studentId === studentId && g.courseId === courseId,
    );

    if (existingIndex !== -1) {
      // Update existing
      data.grades[existingIndex] = {
        ...data.grades[existingIndex],
        studentName: studentName || data.grades[existingIndex].studentName,
        studentRoll: studentRoll || data.grades[existingIndex].studentRoll,
        courseTitle: courseTitle || data.grades[existingIndex].courseTitle,
        courseCode: courseCode || data.grades[existingIndex].courseCode,
        grad: grad !== undefined ? grad : data.grades[existingIndex].grad,
        classTest:
          classTest !== undefined
            ? classTest
            : data.grades[existingIndex].classTest,
        midTerm:
          midTerm !== undefined ? midTerm : data.grades[existingIndex].midTerm,
        finalExam:
          finalExam !== undefined
            ? finalExam
            : data.grades[existingIndex].finalExam,
        teacher:
          teacher !== undefined ? teacher : data.grades[existingIndex].teacher,
        remarks:
          remarks !== undefined ? remarks : data.grades[existingIndex].remarks,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      writeGradesData(data);
      console.log("✅ Grade updated:", data.grades[existingIndex]._id);
      return res.status(200).json({
        success: true,
        message: "✅ Grade updated successfully!",
        grade: data.grades[existingIndex],
        updated: true,
      });
    }

    const newGrade = {
      _id: Date.now().toString() + Math.floor(Math.random() * 1000),
      studentId,
      studentName: studentName || "",
      studentRoll: studentRoll || "",
      courseId,
      courseTitle: courseTitle || "",
      courseCode: courseCode || "",
      grad: grad || "N/A",
      classTest: classTest || "N/A",
      midTerm: midTerm || "N/A",
      finalExam: finalExam || "Pending",
      teacher: teacher || "",
      remarks: remarks || "",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.grades.push(newGrade);
    writeGradesData(data);
    console.log("✅ Grade created:", newGrade._id);

    res.status(201).json({
      success: true,
      message: "✅ Grade published successfully!",
      grade: newGrade,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET ALL GRADES
app.get("/api/grades/all", (req, res) => {
  try {
    const data = readGradesData();
    const grades = (data.grades || []).sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
    );
    res.json({ success: true, total: grades.length, grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET GRADES FOR STUDENT
app.get("/api/grades/student/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("📥 GET grades for student:", studentId);
    const data = readGradesData();
    const grades = (data.grades || []).filter(
      (g) => String(g.studentId) === String(studentId),
    );
    res.json({ success: true, total: grades.length, grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET GRADE FOR STUDENT + COURSE
app.get("/api/grades/student/:studentId/course/:courseId", (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    console.log("📥 GET grade:", studentId, courseId);
    const data = readGradesData();
    const grade = (data.grades || []).find(
      (g) =>
        String(g.studentId) === String(studentId) &&
        String(g.courseId) === String(courseId),
    );
    res.json({ success: true, grade: grade || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE GRADE
app.put("/api/grades/update/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = readGradesData();
    const index = data.grades.findIndex((g) => g._id === id);
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Grade not found!" });
    }
    data.grades[index] = {
      ...data.grades[index],
      ...req.body,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    writeGradesData(data);
    res.json({
      success: true,
      message: "✅ Grade updated!",
      grade: data.grades[index],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE GRADE
app.delete("/api/grades/delete/:id", (req, res) => {
  try {
    const { id } = req.params;
    const data = readGradesData();
    const filtered = data.grades.filter((g) => g._id !== id);
    if (filtered.length === data.grades.length) {
      return res
        .status(404)
        .json({ success: false, message: "Grade not found!" });
    }
    data.grades = filtered;
    writeGradesData(data);
    res.json({ success: true, message: "✅ Grade deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET ADMIN PROFILE by email
app.get("/api/admin-profile/:email", (req, res) => {
  try {
    const { email } = req.params;
    const decoded = decodeURIComponent(email).toLowerCase().trim();
    console.log("📥 GET /api/admin-profile/", decoded);

    const data = readAdminProfiles();
    const profile = (data.profiles || []).find(
      (p) => (p.email || "").toLowerCase().trim() === decoded,
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    console.log("✅ Profile found for:", decoded);
    res.json({ success: true, profile });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ CREATE or UPDATE admin profile (UPSERT)
app.post("/api/admin-profile/save", (req, res) => {
  try {
    console.log("📥 POST /api/admin-profile/save");
    console.log("📝 Body:", req.body);

    const {
      email,
      name,
      phone,
      designation,
      department,
      joinDate,
      bio,
      address,
      website,
      profileImage,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email আবশ্যক!",
      });
    }

    const lowerEmail = email.toLowerCase().trim();
    const data = readAdminProfiles();

    const existingIndex = data.profiles.findIndex(
      (p) => (p.email || "").toLowerCase().trim() === lowerEmail,
    );

    const profileData = {
      email: lowerEmail,
      name: name || "",
      phone: phone || "",
      designation: designation || "",
      department: department || "",
      joinDate: joinDate || "",
      bio: bio || "",
      address: address || "",
      website: website || "",
      profileImage: profileImage || "",
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      // Update
      data.profiles[existingIndex] = {
        ...data.profiles[existingIndex],
        ...profileData,
      };
      writeAdminProfiles(data);
      console.log("✅ Profile updated:", lowerEmail);
      return res.json({
        success: true,
        message: "✅ Profile updated successfully!",
        profile: data.profiles[existingIndex],
        updated: true,
      });
    }

    // Create new
    const newProfile = {
      _id: Date.now().toString() + Math.floor(Math.random() * 1000),
      ...profileData,
      createdAt: new Date().toISOString(),
    };

    data.profiles.push(newProfile);
    writeAdminProfiles(data);
    console.log("✅ Profile created:", lowerEmail);

    res.status(201).json({
      success: true,
      message: "✅ Profile created successfully!",
      profile: newProfile,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE single field
app.put("/api/admin-profile/update/:email", (req, res) => {
  try {
    const { email } = req.params;
    const lowerEmail = decodeURIComponent(email).toLowerCase().trim();
    console.log("📥 PUT /api/admin-profile/update/", lowerEmail);

    const data = readAdminProfiles();
    const index = data.profiles.findIndex(
      (p) => (p.email || "").toLowerCase().trim() === lowerEmail,
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Profile not found!",
      });
    }

    data.profiles[index] = {
      ...data.profiles[index],
      ...req.body,
      email: lowerEmail,
      updatedAt: new Date().toISOString(),
    };

    writeAdminProfiles(data);
    console.log("✅ Profile updated:", lowerEmail);

    res.json({
      success: true,
      message: "✅ Profile updated!",
      profile: data.profiles[index],
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE admin profile
app.delete("/api/admin-profile/delete/:email", (req, res) => {
  try {
    const { email } = req.params;
    const lowerEmail = decodeURIComponent(email).toLowerCase().trim();
    console.log("📥 DELETE /api/admin-profile/delete/", lowerEmail);

    const data = readAdminProfiles();
    const filtered = (data.profiles || []).filter(
      (p) => (p.email || "").toLowerCase().trim() !== lowerEmail,
    );

    if (filtered.length === data.profiles.length) {
      return res.status(404).json({
        success: false,
        message: "Profile not found!",
      });
    }

    data.profiles = filtered;
    writeAdminProfiles(data);

    console.log("✅ Profile deleted:", lowerEmail);
    res.json({ success: true, message: "✅ Profile deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET ALL admin profiles (debug)
app.get("/api/admin-profiles/all", (req, res) => {
  try {
    const data = readAdminProfiles();
    res.json({
      success: true,
      total: (data.profiles || []).length,
      profiles: data.profiles || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// =============================================
// ✅ GET COURSE VIDEOS — IMPROVED MATCHING
// =============================================
app.get("/api/batches/course-videos/:courseName", (req, res) => {
  try {
    const { courseName } = req.params;
    const decoded = decodeURIComponent(courseName).trim();
    console.log("========================================");
    console.log("📥 GET /api/batches/course-videos/", decoded);

    const data = readBatchesData();
    const allBatches = data.batches || [];

    console.log(`📦 Total batches in DB: ${allBatches.length}`);
    allBatches.forEach((b, i) => {
      console.log(
        `   ${i + 1}. name="${b.name}" | course="${b.course}" | videos=${(b.videos || []).length} | primary="${b.videoUrl ? "yes" : "no"}"`,
      );
    });

    const searchLower = decoded.toLowerCase();

    // ✅ Flexible matching
    const matching = allBatches.filter((b) => {
      const bCourse = (b.course || "").toLowerCase().trim();
      const bName = (b.name || "").toLowerCase().trim();

      // Exact
      if (bCourse === searchLower || bName === searchLower) return true;
      // One contains other
      if (bCourse.includes(searchLower)) return true;
      if (searchLower.includes(bCourse) && bCourse.length > 2) return true;
      // Both share a word (>3 chars) - e.g., "Tajweed" in both
      const searchWords = searchLower.split(/\s+/).filter((w) => w.length > 3);
      const batchWords = bCourse.split(/\s+/).filter((w) => w.length > 3);
      if (searchWords.some((w) => batchWords.includes(w))) return true;

      return false;
    });

    console.log(`✅ Matched ${matching.length} batches`);

    const videos = [];
    matching.forEach((batch) => {
      // Primary
      if (batch.videoUrl && batch.videoUrl.trim()) {
        videos.push({
          _id: batch._id + "_primary",
          title: `${batch.name} - Primary Video`,
          url: batch.videoUrl,
          batchName: batch.name,
          teacher: batch.teacher || "",
          addedAt: batch.createdAt,
        });
      }
      // Multiple videos
      (batch.videos || []).forEach((v, i) => {
        videos.push({
          _id: `${batch._id}_v${i}`,
          title: v.title || `Video ${i + 1}`,
          url: v.url,
          batchName: batch.name,
          teacher: batch.teacher || "",
          addedAt: v.addedAt || batch.createdAt,
        });
      });
    });

    console.log(`🎯 Returning ${videos.length} videos`);
    console.log("========================================");

    res.status(200).json({
      success: true,
      searchedCourse: decoded,
      totalBatchesInDB: allBatches.length,
      matchedBatches: matching.length,
      total: videos.length,
      videos,
      // ✅ Debug info for frontend
      debug: {
        allBatchCourses: allBatches.map((b) => ({
          name: b.name,
          course: b.course,
          videosCount: (b.videos || []).length,
          hasPrimary: !!b.videoUrl,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// =============================================
// ✅ 404 HANDLER
// =============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
  });
});

// =============================================
// ✅ API Routes
// =============================================
app.use("/api/auth", authRoutes);

// =============================================
// ✅ API Routes
// =============================================
app.use("/api/auth", authRoutes);
// app.use("/api/courses", courseRoutes); //
app.use("/api/assignments", assignmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/admin-profile", adminProfileRoutes);

// =============================================
// ✅ ERROR HANDLER
// =============================================
app.use(errorHandler);

// =============================================
// ✅ START SERVER
// =============================================
const startServer = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
      console.log(`\n📚 Student Routes (No Auth Required):`);
      console.log(`   GET  http://localhost:${PORT}/api/students/all`);
      console.log(`   PUT  http://localhost:${PORT}/api/students/approve/:id`);
      console.log(`   POST http://localhost:${PORT}/api/students/login`);
      console.log(
        `   POST http://localhost:${PORT}/api/students/register/student`,
      );
      console.log(`\n📚 Teacher Course Routes:`);
      console.log(`   POST http://localhost:${PORT}/api/courses/create`);
      console.log(`   GET  http://localhost:${PORT}/api/courses/teacher/:id`);
      console.log(`   GET  http://localhost:${PORT}/api/courses/stats/:id`);
      console.log(`\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// =============================================

// ✅ GRACEFUL SHUTDOWN
// =============================================
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
