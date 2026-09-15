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

// ✅ SEED — সব ৩১টা Student একবারে যোগ করার জন্য
app.post("/api/basic-tazweed/seed", async (req, res) => {
  try {
    console.log("📥 POST /api/basic-tazweed/seed");
    const collection = getCollection("basic_tazweed_students");

    const seedData = [
      {
        studentId: "TET26FB6001",
        name: "Afeefa Nur",
        phone: "661293720",
        country: "France",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 5000,
        transactionId: "DGD9CFHU69",
        dueAmount: 0,
        julyAugust: 5000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6002",
        name: "Anjumara Ara Laila",
        phone: "3364473880",
        country: "France",
        scholarshipAmount: 2500,
        courseFee: 2500,
        paidAmount: 2500,
        transactionId: "DGD3CEKPV1",
        dueAmount: 0,
        julyAugust: 2500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6003",
        name: "Nasrin Akter",
        phone: "1986154624",
        country: "BD",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 5000,
        transactionId: "DGF5EULQ59",
        dueAmount: 0,
        julyAugust: 5000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6004",
        name: "Marufa Akter Sumi",
        phone: "1716765832",
        country: "BD",
        scholarshipAmount: 1500,
        courseFee: 3500,
        paidAmount: 3500,
        transactionId: "DGH6GQNR0O",
        dueAmount: 0,
        julyAugust: 3500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6005",
        name: "Aziza Afroz Asha",
        phone: "130542205",
        country: "BD",
        scholarshipAmount: 2000,
        courseFee: 3000,
        paidAmount: 1000,
        transactionId: "DGJ4JI1562",
        dueAmount: 2000,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6006",
        name: "Kashfia Amin",
        phone: "01630506600",
        country: "Qatar",
        scholarshipAmount: 0,
        courseFee: 4000,
        paidAmount: 4000,
        transactionId: "9626080400045271",
        dueAmount: 0,
        julyAugust: 3000,
        september: 1000,
        paymentMethodSept: "Bank",
        paymentDateSept: "02/09/2026",
        transactionIdSept: "9626090200064407",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6007",
        name: "Tanisha Amin",
        phone: "1886769107",
        country: "BD",
        scholarshipAmount: 1000,
        courseFee: 4000,
        paidAmount: 4000,
        transactionId: "9626080400047415",
        dueAmount: 0,
        julyAugust: 2000,
        september: 2000,
        paymentMethodSept: "Bank",
        paymentDateSept: "02/09/2026",
        transactionIdSept: "9626090200063745",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6008",
        name: "Khadijatul Cobra Lima",
        phone: "1619674213",
        country: "BD",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 2000,
        transactionId: "DH595MDLGH",
        dueAmount: 3000,
        julyAugust: 2000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6009",
        name: "Khadijatul Kobra",
        phone: "1324975882",
        country: "BD",
        scholarshipAmount: 1000,
        courseFee: 2000,
        paidAmount: 2000,
        transactionId: "DH525WBEZA",
        dueAmount: 0,
        julyAugust: 2000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6010",
        name: "Mymuna Najnin",
        phone: "880 1758-034582",
        country: "BD",
        scholarshipAmount: 4000,
        courseFee: 1000,
        paidAmount: 1000,
        transactionId: "DH575YY3KB",
        dueAmount: 0,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6011",
        name: "Jannatul Ferdos Hera",
        phone: "60168874284",
        country: "Malaysia",
        scholarshipAmount: 2000,
        courseFee: 3000,
        paidAmount: 3000,
        transactionId: "100007000000",
        dueAmount: 0,
        julyAugust: 3000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6012",
        name: "Tasneem Akter Tithy",
        phone: "1611940085",
        country: "BD",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 1000,
        transactionId: "1611T40085",
        dueAmount: 4000,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6013",
        name: "Sania Rahman",
        phone: "1760913428",
        country: "BD",
        scholarshipAmount: 2000,
        courseFee: 3000,
        paidAmount: 3000,
        transactionId: "DHC1DQC989",
        dueAmount: 1000,
        julyAugust: 1000,
        september: 1000,
        paymentMethodSept: "B kash",
        paymentDateSept: "12/0/2026",
        transactionIdSept: "DIC6FFD2LK",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6014",
        name: "Sanjida Akter",
        phone: "1972190196",
        country: "BD",
        scholarshipAmount: 1000,
        courseFee: 4000,
        paidAmount: 1000,
        transactionId: "75TVMM20",
        dueAmount: 3000,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6015",
        name: "Halima Bagum",
        phone: "-8049062163",
        country: "Japan",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 5000,
        transactionId: "46268080000000",
        dueAmount: 0,
        julyAugust: 5000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6016",
        name: "Tanjila Islam Rima",
        phone: "1996202248",
        country: "BD",
        scholarshipAmount: 2000,
        courseFee: 3000,
        paidAmount: 1000,
        transactionId: "DHH54C8AAB",
        dueAmount: 2000,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6017",
        name: "Jabin Tasnim",
        phone: "01786304084",
        country: "Australia",
        scholarshipAmount: 1500,
        courseFee: 3500,
        paidAmount: 3500,
        transactionId: "FT89872U37098773",
        dueAmount: 0,
        julyAugust: 3500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6018",
        name: "Most. Atara Khatun",
        phone: "1770831948",
        country: "BD",
        scholarshipAmount: 1000,
        courseFee: 4000,
        paidAmount: 4000,
        transactionId: "DHD6F5T3U4",
        dueAmount: 0,
        julyAugust: 4000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6019",
        name: "Ferdous Akter Poly",
        phone: "1329093243",
        country: "BD",
        scholarshipAmount: 3500,
        courseFee: 1500,
        paidAmount: 1500,
        transactionId: "75U6Y45",
        dueAmount: 0,
        julyAugust: 1500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6020",
        name: "Janat Islam",
        phone: "1743907164",
        country: "BD",
        scholarshipAmount: 1500,
        courseFee: 3500,
        paidAmount: 3500,
        transactionId: "DH3KMY7KF",
        dueAmount: 0,
        julyAugust: 3500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6021",
        name: "Ayesha Akter Humayra",
        phone: "01404-791953",
        country: "BD",
        scholarshipAmount: 1000,
        courseFee: 4000,
        paidAmount: 1000,
        transactionId: "DH585LCTLK",
        dueAmount: 3000,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6022",
        name: "Tahmina Begum",
        phone: "447508747682",
        country: "UK",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 5000,
        transactionId: "23236906905566268993",
        dueAmount: 0,
        julyAugust: 5000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6023",
        name: "Qaliha Anjum Liha",
        phone: "1635155101",
        country: "BD",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 1000,
        transactionId: "DHP7RQA9X1",
        dueAmount: 4000,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6024",
        name: "Bibi Joynab",
        phone: "1840411834",
        country: "BD",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 1000,
        transactionId: "DHR3TRZ293",
        dueAmount: 4000,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6025",
        name: "Bibi Fatema",
        phone: "1645141553",
        country: "BD",
        scholarshipAmount: 2500,
        courseFee: 2500,
        paidAmount: 2500,
        transactionId: "Dfr6qytbT2",
        dueAmount: 0,
        julyAugust: 2500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6026",
        name: "Jhorna Begum",
        phone: "01716-108191",
        country: "BD",
        scholarshipAmount: 2500,
        courseFee: 2500,
        paidAmount: 2500,
        transactionId: "DF59SJC6FP",
        dueAmount: 0,
        julyAugust: 2500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6027",
        name: "Sanzida Akter",
        phone: "0182486000",
        country: "BD",
        scholarshipAmount: 0,
        courseFee: 5000,
        paidAmount: 2500,
        transactionId: "DF5T5U1RAX",
        dueAmount: 2500,
        julyAugust: 2500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6028",
        name: "Sabrina",
        phone: "01795620324",
        country: "BD",
        scholarshipAmount: 2500,
        courseFee: 2500,
        paidAmount: 1000,
        transactionId: "01795620324",
        dueAmount: 1500,
        julyAugust: 1000,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6029",
        name: "Farhana Yeasmin Liza",
        phone: "01672776673",
        country: "BD",
        scholarshipAmount: 2500,
        courseFee: 2500,
        paidAmount: 2500,
        transactionId: "DFU1EX2IL",
        dueAmount: 0,
        julyAugust: 2500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6030",
        name: "Rahana Akter",
        phone: "39389063668",
        country: "Italy",
        scholarshipAmount: 2500,
        courseFee: 2500,
        paidAmount: 2500,
        transactionId: "2299738037531185749",
        dueAmount: 0,
        julyAugust: 2500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
      {
        studentId: "TET26FB6031",
        name: "Dollon Haidar",
        phone: "01842391934",
        country: "BD",
        scholarshipAmount: 2500,
        courseFee: 2500,
        paidAmount: 2500,
        transactionId: "DH595EM329",
        dueAmount: 0,
        julyAugust: 2500,
        september: 0,
        paymentMethodSept: "-",
        paymentDateSept: "-",
        transactionIdSept: "-",
        october: 0,
        paymentMethodOct: "-",
        paymentDateOct: "-",
        transactionIdOct: "-",
        november: 0,
        paymentMethodNov: "-",
        paymentDateNov: "-",
        transactionIdNov: "-",
      },
    ];

    // Clear existing and insert all
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
