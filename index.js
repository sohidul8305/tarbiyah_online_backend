// backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const axios = require("axios");

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
// ✅ STUDENT ATTENDANCE REPORT — JSON File Based
// =============================================
const STUDENT_ATT_FILE = path.join(__dirname, "student_attendance.json");

if (!fs.existsSync(STUDENT_ATT_FILE)) {
  fs.writeFileSync(
    STUDENT_ATT_FILE,
    JSON.stringify({ attendance: [] }, null, 2),
  );
  console.log("✅ student_attendance.json created");
}

function readStudentAtt() {
  try {
    return JSON.parse(fs.readFileSync(STUDENT_ATT_FILE, "utf8"));
  } catch {
    return { attendance: [] };
  }
}
function writeStudentAtt(data) {
  fs.writeFileSync(STUDENT_ATT_FILE, JSON.stringify(data, null, 2));
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

// ✅ GET ALL ATTENDANCE (with optional filters)
app.get("/api/attendance-report/all", async (req, res) => {
  try {
    const { date, status, class: cls, subject, department } = req.query;
    console.log("📥 GET /api/attendance-report/all");

    const data = readStudentAtt();
    let records = data.attendance || [];

    // Apply filters
    if (date) records = records.filter((r) => r.date === date);
    if (status && status !== "All")
      records = records.filter((r) => r.status === status);
    if (cls && cls !== "All") records = records.filter((r) => r.class === cls);
    if (subject && subject !== "All")
      records = records.filter((r) => r.subject === subject);
    if (department && department !== "All") {
      const s = department.toLowerCase();
      records = records.filter(
        (r) =>
          (r.subject || "").toLowerCase().includes(s) ||
          (r.course || "").toLowerCase().includes(s),
      );
    }

    // Sort newest first
    records.sort((a, b) => {
      if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    // Stats
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = records.filter((r) => r.date === today);
    const presentToday = todayRecords.filter(
      (r) => r.status === "Present",
    ).length;
    const absentToday = todayRecords.filter(
      (r) => r.status === "Absent",
    ).length;
    const lateToday = todayRecords.filter((r) => r.status === "Late").length;
    const leaveToday = todayRecords.filter((r) => r.status === "Leave").length;
    const totalPresent = records.filter((r) => r.status === "Present").length;
    const overall =
      records.length > 0
        ? Math.round((totalPresent / records.length) * 100)
        : 0;

    // Unique values for filters
    const uniqueClasses = [
      ...new Set(records.map((r) => r.class).filter(Boolean)),
    ];
    const uniqueSubjects = [
      ...new Set(records.map((r) => r.subject).filter(Boolean)),
    ];
    const uniqueStatuses = [
      ...new Set(records.map((r) => r.status).filter(Boolean)),
    ];

    res.json({
      success: true,
      total: records.length,
      records,
      stats: {
        totalRecords: records.length,
        presentToday,
        absentToday,
        lateToday,
        leaveToday,
        overallAttendance: overall,
      },
      uniqueClasses,
      uniqueSubjects,
      uniqueStatuses,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ CREATE ATTENDANCE
app.post("/api/attendance-report/create", (req, res) => {
  try {
    console.log("📥 POST /api/attendance-report/create");
    const body = req.body;

    if (!body.studentName || !body.class || !body.subject || !body.date) {
      return res.status(400).json({
        success: false,
        message: "Student, Class, Subject, Date আবশ্যক!",
      });
    }

    const data = readStudentAtt();

    const newRecord = {
      _id: Date.now().toString() + Math.floor(Math.random() * 1000),
      id: Date.now(),
      studentName: body.studentName,
      studentId: body.studentId || "",
      class: body.class,
      subject: body.subject,
      date: body.date,
      status: body.status || "Present",
      checkIn: body.status !== "Absent" ? body.checkIn || "" : "",
      checkOut: body.status !== "Absent" ? body.checkOut || "" : "",
      teacher: body.teacher || "",
      note: body.note || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.attendance.push(newRecord);
    writeStudentAtt(data);

    console.log("✅ Attendance created:", newRecord._id);
    res.status(201).json({ success: true, record: newRecord });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ১. পেমেন্ট শুরু করার API (Frontend এখানে কল করবে)
app.post("/api/payment/sslcommerz/initiate", async (req, res) => {
  try {
    console.log("📥 POST /api/payment/sslcommerz/initiate");
    const {
      total_amount,
      cus_name,
      cus_email,
      cus_phone,
      product_name,
      studentData,
    } = req.body;

    // SSLCommerz থেকে পাওয়া আপনার ক্রেডেনশিয়াল
    const store_id = "tarbiyahedu0live";
    const store_passwd = "64D21B6E4766C94844";
    const is_live = true; // Live Environment

    // ইউনিক ট্রানজেকশন আইডি তৈরি
    const tran_id = "TARBIYAH_" + Date.now();

    // SSLCommerz এ পাঠানোর ডাটা
    const sslData = {
      store_id: store_id,
      store_passwd: store_passwd,
      total_amount: total_amount,
      currency: "BDT",
      tran_id: tran_id,
      success_url: `https://api.tarbiyahonline.com/api/payment/sslcommerz/success`,
      fail_url: `https://api.tarbiyahonline.com/api/payment/sslcommerz/fail`,
      cancel_url: `https://api.tarbiyahonline.com/api/payment/sslcommerz/cancel`,
      ipn_url: `https://api.tarbiyahonline.com/api/payment/sslcommerz/ipn`,
      cus_name: cus_name,
      cus_email: cus_email,
      cus_phone: cus_phone,
      cus_add1: studentData.presentAddress || "N/A",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_name: product_name,
      product_category: "Education",
      product_profile: "general",
    };

    // 💾 ডাটাবেজে সাময়িকভাবে স্টুডেন্ট ডাটা সেভ করা (যাতে পেমেন্ট সফল হলে ট্রানজেকশন আইডি দিয়ে খুঁজে পাওয়া যায়)
    const pendingColl = getCollection("pending_admissions");
    if (pendingColl) {
      await pendingColl.insertOne({
        tran_id: tran_id,
        studentData: studentData,
        amount: total_amount,
        status: "Pending",
        createdAt: new Date(),
      });
    }

    // SSLCommerz API তে রিকোয়েস্ট পাঠানো
    const response = await axios.post(
      "https://securepay.sslcommerz.com/gwprocess/v4/api.php",
      new URLSearchParams(sslData).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    console.log("✅ SSLCommerz Response:", response.data);

    if (response.data && response.data.GatewayPageURL) {
      res.status(200).json({ GatewayPageURL: response.data.GatewayPageURL });
    } else {
      res
        .status(400)
        .json({ success: false, message: "পেমেন্ট গেটওয়ে URL পাওয়া যায়নি!" });
    }
  } catch (error) {
    console.error("❌ SSLCommerz Initiate Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ২. পেমেন্ট সফল হলে SSLCommerz এখানে ডাটা পাঠাবে (POST)
// ২. পেমেন্ট সফল হলে SSLCommerz এখানে ডাটা পাঠাবে (POST)
app.post("/api/payment/sslcommerz/success", async (req, res) => {
  try {
    const { val_id, tran_id, amount } = req.body;
    console.log("════════════════════════════════════════");
    console.log("✅ Payment Success Callback:", tran_id);
    console.log("📦 Body:", { val_id, tran_id, amount });

    // ✅ SSLCommerz Validation API কল করে পেমেন্ট ভেরিফাই করা
    const validationUrl = `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=tarbiyahedu0live&store_passwd=64D21B6E4766C94844&format=json`;
    const valResponse = await axios.get(validationUrl);

    console.log("🔍 Validation Status:", valResponse.data.status);

    if (
      valResponse.data.status === "VALID" ||
      valResponse.data.status === "VALIDATED"
    ) {
      // ✅ পেমেন্ট ভ্যালিড! এখন ডাটাবেজে স্টুডেন্টকে অ্যাড করুন
      const pendingColl = getCollection("pending_admissions");
      const pendingData = await pendingColl.findOne({ tran_id: tran_id });

      // ✅ newStudent কে block-এর বাইরে declare — redirect-এ access করার জন্য
      let newStudent = null;

      if (pendingData) {
        const studentsColl = getCollection("students");

        // ✅ স্টুডেন্ট ডাটা তৈরি
        newStudent = {
          ...pendingData.studentData,
          transactionId: tran_id,
          paidAmount: amount,
          paymentStatus: "Paid",
          paymentMethod: "SSLCommerz",
          status: "Pending", // অ্যাডমিন অ্যাপ্রুভ করলে Active হবে
          admissionDate: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await studentsColl.insertOne(newStudent);
        await pendingColl.updateOne(
          { tran_id },
          { $set: { status: "Completed" } },
        );

        console.log("✅ New student saved:", newStudent.name);
        console.log("🆔 Student ID:", newStudent.studentId || "(none)");
        console.log(
          "🔑 Password:",
          newStudent.password ? "✓ set" : "✗ missing",
        );
      } else {
        console.warn("⚠️ No pending data found for tran_id:", tran_id);
      }

      // ✅ ফ্রন্টএন্ডের সাকসেস পেজে রিডাইরেক্ট — credentials সহ
      const qs = new URLSearchParams({
        tran_id: tran_id,
        studentId: newStudent?.studentId || "",
        password: newStudent?.password || "",
        name: newStudent?.name || "",
        status: "success",
      });

      console.log("🔁 Redirecting to success page...");
      console.log("════════════════════════════════════════");

      return res.redirect(
        `https://tarbiyahonline.com/payment/success?${qs.toString()}`,
      );
    } else {
      console.log("❌ Validation failed!");
      return res.redirect(`https://tarbiyahonline.com/payment/fail`);
    }
  } catch (error) {
    console.error("❌ Success Validation Error:", error.message);
    console.error("Stack:", error.stack);
    res.redirect(`https://tarbiyahonline.com/payment/fail`);
  }
});
// ৩. পেমেন্ট ফেইল হলে
app.post("/api/payment/sslcommerz/fail", async (req, res) => {
  console.log("❌ Payment Failed:", req.body.tran_id);
  res.redirect(`https://tarbiyahonline.com/payment/fail`);
});

// ৪. পেমেন্ট ক্যান্সেল হলে
app.post("/api/payment/sslcommerz/cancel", async (req, res) => {
  console.log("🚫 Payment Cancelled:", req.body.tran_id);
  res.redirect(`https://tarbiyahonline.com/payment/cancel`);
});

// ৫. IPN (Instant Payment Notification) Listener
app.post("/api/payment/sslcommerz/ipn", async (req, res) => {
  try {
    const { val_id, tran_id, status } = req.body;
    console.log("🔔 IPN Received:", tran_id, status);

    // এখানেও ভ্যালিডেশন করা ভালো, তবে সাকসেস কলব্যাক থাকলে এটি মূলত ব্যাকআপ হিসেবে কাজ করে।
    res.status(200).send("IPN Received");
  } catch (error) {
    console.error("❌ IPN Error:", error);
    res.status(500).send("IPN Error");
  }
});

// ✅ UPDATE
app.put("/api/attendance-report/update/:id", (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/attendance-report/update/", id);

    const data = readStudentAtt();
    const index = data.attendance.findIndex((r) => r._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    data.attendance[index] = {
      ...data.attendance[index],
      ...req.body,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    writeStudentAtt(data);
    res.json({ success: true, record: data.attendance[index] });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE
app.delete("/api/attendance-report/delete/:id", (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/attendance-report/delete/", id);

    const data = readStudentAtt();
    const filtered = data.attendance.filter((r) => r._id !== id);
    if (filtered.length === data.attendance.length) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    data.attendance = filtered;
    writeStudentAtt(data);
    res.json({ success: true, message: "✅ Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ BULK CREATE (mark attendance for many students at once)
app.post("/api/attendance-report/bulk-create", (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "records আবশ্যক!" });
    }

    const data = readStudentAtt();
    const created = [];

    records.forEach((body) => {
      if (!body.studentName || !body.class || !body.subject || !body.date)
        return;

      const newRecord = {
        _id: Date.now().toString() + Math.floor(Math.random() * 100000),
        id: Date.now() + Math.random(),
        studentName: body.studentName,
        studentId: body.studentId || "",
        class: body.class,
        subject: body.subject,
        date: body.date,
        status: body.status || "Present",
        checkIn: body.status !== "Absent" ? body.checkIn || "" : "",
        checkOut: body.status !== "Absent" ? body.checkOut || "" : "",
        teacher: body.teacher || "",
        note: body.note || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.attendance.push(newRecord);
      created.push(newRecord);
    });

    writeStudentAtt(data);
    res
      .status(201)
      .json({ success: true, total: created.length, records: created });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ DEBUG: সব collection-এর sample data
// =============================================
app.get("/api/debug-collections", async (req, res) => {
  try {
    const results = {
      students: { count: 0, samples: [] },
      tazweed: { count: 0, samples: [] },
      najera: { count: 0, samples: [] },
    };

    // Students collection
    const studentsColl = getCollection("students");
    if (studentsColl) {
      results.students.count = await studentsColl.countDocuments();
      const samples = await studentsColl
        .find({})
        .project({
          _id: 1,
          name: 1,
          studentId: 1,
          status: 1,
          password: 1,
        })
        .limit(10)
        .toArray();
      results.students.samples = samples;
    }

    // Tazweed collection
    const tazweedColl = getCollection("basic_tazweed_students");
    if (tazweedColl) {
      results.tazweed.count = await tazweedColl.countDocuments();
      const samples = await tazweedColl
        .find({})
        .project({
          _id: 1,
          name: 1,
          studentId: 1,
          password: 1,
        })
        .limit(10)
        .toArray();
      results.tazweed.samples = samples;
    }

    // Najera collection
    const najeraColl = getCollection("najera_batch_students");
    if (najeraColl) {
      results.najera.count = await najeraColl.countDocuments();
      const samples = await najeraColl
        .find({})
        .project({
          _id: 1,
          name: 1,
          studentId: 1,
          password: 1,
        })
        .limit(10)
        .toArray();
      results.najera.samples = samples;
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ success: false, message: error.message });
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

// ✅ CREATE BATCH — with full LMS fields
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
      // ✅ LMS fields
      studentsList,
      classesList,
      materialsList,
      videos,
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
      students: Number(students) || 0,
      schedule: schedule || "",
      teacher: teacher || "",
      videoUrl: videoUrl || "",
      description: description || "",
      status: status || "Active",

      // ✅ LMS arrays (empty if not provided)
      studentsList: Array.isArray(studentsList) ? studentsList : [],
      classesList: Array.isArray(classesList) ? classesList : [],
      materialsList: Array.isArray(materialsList) ? materialsList : [],
      videos: Array.isArray(videos) ? videos : [],

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

// ✅ UPDATE BATCH — safely handles LMS fields, videos, students arrays
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

    const existing = data.batches[index];
    const body = { ...req.body };
    delete body._id; // never let client override _id

    // ✅ students count: accept 0 as valid number
    let studentsCount = existing.students || 0;
    if (body.students !== undefined && body.students !== "") {
      const parsed = Number(body.students);
      if (!Number.isNaN(parsed)) studentsCount = parsed;
    }
    // If studentsList is sent, auto-sync count
    if (Array.isArray(body.studentsList)) {
      studentsCount = body.studentsList.length;
    }

    data.batches[index] = {
      ...existing,
      ...body,
      students: studentsCount,
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

// ✅ DELETE ALL students of a batch (when deleting batch)
app.delete("/api/batch-students/delete-by-batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const coll = getCollection("batch_students");
    const result = await coll.deleteMany({ batchId: String(batchId) });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/batch-students/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/batch-students/update/", id);

    const coll = getCollection("batch_students");
    const existing = await coll.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;
    delete updateData.batchId;

    // ✅ Duplicate studentId check
    if (updateData.studentId && updateData.studentId !== existing.studentId) {
      const dup = await coll.findOne({
        studentId: updateData.studentId,
        _id: { $ne: new ObjectId(id) },
      });
      if (dup) {
        return res.status(400).json({
          success: false,
          message: `Student ID "${updateData.studentId}" ইতিমধ্যে ব্যবহৃত!`,
        });
      }
    }

    // ✅ Auto-recalc due (আপনার আগের কোড থেকে অপরিবর্তিত)
    const willRecalc =
      updateData.paidMonths !== undefined ||
      updateData.scholarshipAmount !== undefined ||
      updateData.courseFee !== undefined;

    if (willRecalc) {
      const paidMonths = updateData.paidMonths ?? existing.paidMonths ?? [];
      const totalPaid = paidMonths.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
      );
      const fee = Number(updateData.courseFee ?? existing.courseFee ?? 0);
      const scholarship = Number(
        updateData.scholarshipAmount ?? existing.scholarshipAmount ?? 0,
      );
      const due = Math.max(fee - scholarship - totalPaid, 0);

      updateData.paidAmount = totalPaid;
      updateData.dueAmount = due;

      if (!updateData.paymentStatus) {
        if (due === 0 && totalPaid > 0) updateData.paymentStatus = "Paid";
        else if (totalPaid > 0) updateData.paymentStatus = "Partial";
        else updateData.paymentStatus = "Unpaid";
      }
    }

    await coll.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    const updated = await coll.findOne({ _id: new ObjectId(id) });

    console.log(
      `✅ Updated | Paid: ${updated.paidAmount} | Due: ${updated.dueAmount} | Pwd: ${updated.password ? "✓" : "✗"}`,
    );
    res.status(200).json({ success: true, student: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ✅ ONE-TIME: fix old batch_students
app.get("/api/batch-students/fix-old", async (req, res) => {
  try {
    const coll = getCollection("batch_students");
    const all = await coll.find({}).toArray();
    let fixed = 0;

    for (const s of all) {
      const updates = {};

      // Missing fee fields → default 0
      if (s.courseFee === undefined) updates.courseFee = 0;
      if (s.monthlyFee === undefined) updates.monthlyFee = 0;
      if (s.scholarshipAmount === undefined) updates.scholarshipAmount = 0;
      if (s.scholarshipNote === undefined) updates.scholarshipNote = "";
      if (s.paidAmount === undefined) updates.paidAmount = 0;
      if (s.dueAmount === undefined) updates.dueAmount = 0;
      if (!s.paidMonths) updates.paidMonths = [];

      // Fix inconsistent status
      const fee = Number(s.courseFee) || 0;
      const scholarship = Number(s.scholarshipAmount) || 0;
      const paid = Number(s.paidAmount) || 0;
      const due = Math.max(fee - scholarship - paid, 0);

      if (s.paymentStatus === "Paid" && due > 0) {
        updates.paymentStatus = paid > 0 ? "Partial" : "Unpaid";
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await coll.updateOne({ _id: s._id }, { $set: updates });
        fixed++;
      }
    }

    res.json({
      success: true,
      message: `✅ Fixed ${fixed} / ${all.length} students`,
      total: all.length,
      fixed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE batch student
app.delete("/api/batch-students/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/batch-students/delete/", id);

    const coll = getCollection("batch_students");
    const result = await coll.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "✅ Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE ALL students of a batch (when deleting batch)
app.delete("/api/batch-students/delete-by-batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const coll = getCollection("batch_students");
    const result = await coll.deleteMany({ batchId: String(batchId) });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE batch student
app.put("/api/batch-students/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/batch-students/update/", id);

    const coll = getCollection("batch_students");
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updated = await coll.findOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, student: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/batch-students/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/batch-students/update/", id);

    const coll = getCollection("batch_students");
    const existing = await coll.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;
    delete updateData.batchId;

    // ✅ Duplicate studentId check
    if (updateData.studentId && updateData.studentId !== existing.studentId) {
      const dup = await coll.findOne({
        studentId: updateData.studentId,
        _id: { $ne: new ObjectId(id) },
      });
      if (dup) {
        return res.status(400).json({
          success: false,
          message: `Student ID "${updateData.studentId}" ইতিমধ্যে ব্যবহৃত!`,
        });
      }
    }

    // ✅ Auto-recalc due (আপনার আগের কোড থেকে অপরিবর্তিত)
    const willRecalc =
      updateData.paidMonths !== undefined ||
      updateData.scholarshipAmount !== undefined ||
      updateData.courseFee !== undefined;

    if (willRecalc) {
      const paidMonths = updateData.paidMonths ?? existing.paidMonths ?? [];
      const totalPaid = paidMonths.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
      );
      const fee = Number(updateData.courseFee ?? existing.courseFee ?? 0);
      const scholarship = Number(
        updateData.scholarshipAmount ?? existing.scholarshipAmount ?? 0,
      );
      const due = Math.max(fee - scholarship - totalPaid, 0);

      updateData.paidAmount = totalPaid;
      updateData.dueAmount = due;

      if (!updateData.paymentStatus) {
        if (due === 0 && totalPaid > 0) updateData.paymentStatus = "Paid";
        else if (totalPaid > 0) updateData.paymentStatus = "Partial";
        else updateData.paymentStatus = "Unpaid";
      }
    }

    await coll.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    const updated = await coll.findOne({ _id: new ObjectId(id) });

    console.log(
      `✅ Updated | Paid: ${updated.paidAmount} | Due: ${updated.dueAmount} | Pwd: ${updated.password ? "✓" : "✗"}`,
    );
    res.status(200).json({ success: true, student: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE batch student
app.delete("/api/batch-students/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/batch-students/delete/", id);

    const coll = getCollection("batch_students");
    const result = await coll.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "✅ Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE ALL students of a batch (optional — when deleting batch)
app.delete("/api/batch-students/delete-by-batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const coll = getCollection("batch_students");
    const result = await coll.deleteMany({ batchId: String(batchId) });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
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

// =============================================
// ✅ DEBUG: সব collections এর count দেখা
// =============================================
app.get("/api/debug-all-collections", async (req, res) => {
  try {
    console.log("📥 GET /api/debug-all-collections");

    const studentsCollection = getCollection("students");
    const tazweedCollection = getCollection("basic_tazweed_students");
    const najeraCollection = getCollection("najera_batch_students");

    if (!studentsCollection) {
      return res.status(500).json({
        success: false,
        message: "students collection পাওয়া যায়নি!",
      });
    }

    // Count সব
    const studentsCount = await studentsCollection.countDocuments();
    const tazweedCount = tazweedCollection
      ? await tazweedCollection.countDocuments()
      : 0;
    const najeraCount = najeraCollection
      ? await najeraCollection.countDocuments()
      : 0;

    // Sample data (first 2)
    const studentsSample = await studentsCollection.find({}).limit(2).toArray();
    const tazweedSample = tazweedCollection
      ? await tazweedCollection.find({}).limit(2).toArray()
      : [];
    const najeraSample = najeraCollection
      ? await najeraCollection.find({}).limit(2).toArray()
      : [];

    res.json({
      success: true,
      counts: {
        students: studentsCount,
        basicTazweed: tazweedCount,
        najeraBatch: najeraCount,
        total: studentsCount + tazweedCount + najeraCount,
      },
      samples: {
        students: studentsSample,
        basicTazweed: tazweedSample,
        najeraBatch: najeraSample,
      },
    });
  } catch (error) {
    console.error("❌ Debug Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
});
// =============================================
// ✅ APPROVE STUDENT — সব collection (students + tazweed + najera)
// =============================================
// =============================================
// ✅ APPROVE STUDENT — ৩টি collection-এ কাজ করবে
// =============================================
app.put("/api/students/approve/:id", async (req, res) => {
  try {
    console.log("📥 PUT /api/students/approve/:id");
    console.log("📝 Body:", req.body);

    const { id } = req.params;
    const { studentId, password, roll } = req.body;

    if (!studentId || !studentId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student ID আবশ্যক!",
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password আবশ্যক!",
      });
    }

    const collectionNames = [
      "students",
      "basic_tazweed_students",
      "najera_batch_students",
    ];

    let foundCollection = null;
    let foundCollectionName = null;
    let student = null;

    // ✅ ৩টি collection-এ খুঁজব
    for (const name of collectionNames) {
      const coll = getCollection(name);
      if (!coll) continue;

      try {
        const found = await coll.findOne({ _id: new ObjectId(id) });
        if (found) {
          foundCollection = coll;
          foundCollectionName = name;
          student = found;
          console.log(`✅ Found in "${name}":`, student.name);
          break;
        }
      } catch (e) {
        // Invalid ObjectId — skip
      }
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in any collection!",
      });
    }

    // ✅ Duplicate studentId check — সব collection-এ
    for (const name of collectionNames) {
      const coll = getCollection(name);
      if (!coll) continue;
      const existing = await coll.findOne({
        studentId: studentId.trim(),
        _id: { $ne: new ObjectId(id) },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Student ID "${studentId}" ইতিমধ্যে অন্য একজন ব্যবহার করছে!`,
        });
      }
    }

    // ✅ Update
    await foundCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          studentId: studentId.trim(),
          password: password.trim(),
          roll: roll || "",
          status: "Active",
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    console.log(`✅ Approved in "${foundCollectionName}"`);
    console.log(`🆔 Student ID: ${studentId}`);

    res.status(200).json({
      success: true,
      message: "Student approved successfully!",
      studentId: studentId.trim(),
      collection: foundCollectionName,
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
// ✅ STUDENT LOGIN — ৪টি collection-এ খুঁজবে
// ✅ প্রতিটি student এর নিজস্ব password থাকতে হবে (কোনো default নয়)
// =============================================
app.post("/api/students/login", async (req, res) => {
  try {
    console.log("════════════════════════════════");
    console.log("📥 POST /api/students/login");
    console.log("📤 Body:", req.body);

    const { studentId, username, password } = req.body;
    const loginId = (studentId || username || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "স্টুডেন্ট আইডি এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    const collectionNames = [
      "students",
      "batch_students",
      "basic_tazweed_students",
      "najera_batch_students",
    ];

    const regex = new RegExp("^" + loginId + "$", "i");
    let student = null;
    let studentCollectionName = null;

    for (const name of collectionNames) {
      const coll = getCollection(name);
      if (!coll) continue;

      const found = await coll.findOne({
        $or: [
          { studentId: loginId },
          { studentId: regex },
          { username: loginId },
          { username: regex },
          { roll: loginId },
          { phone: loginId },
        ],
      });

      if (found) {
        student = found;
        studentCollectionName = name;
        console.log(`✅ Found in "${name}":`, student.name);
        break;
      }
    }

    if (!student) {
      console.log("❌ Student not found in any collection");
      return res.status(401).json({
        success: false,
        message:
          "স্টুডেন্ট আইডি বা পাসওয়ার্ড ভুল! অথবা আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি।",
      });
    }

    // ✅ Active চেক — শুধু students collection-এর জন্য
    if (studentCollectionName === "students" && student.status !== "Active") {
      return res.status(401).json({
        success: false,
        message:
          "আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি। দয়া করে অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });
    }

    // ✅ মূল পরিবর্তন: password না থাকলে login নাকচ
    const storedPassword = (student.password || "").trim();

    if (!storedPassword) {
      return res.status(401).json({
        success: false,
        message:
          "আপনার অ্যাকাউন্টে এখনও পাসওয়ার্ড সেট করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });
    }

    if (storedPassword !== password.trim()) {
      return res.status(401).json({
        success: false,
        message: "স্টুডেন্ট আইডি বা পাসওয়ার্ড ভুল!",
      });
    }

    const { password: _, ...studentWithoutPassword } = student;

    console.log(`✅ Login success: ${student.name} (${studentCollectionName})`);
    console.log("════════════════════════════════");

    res.status(200).json({
      success: true,
      message: "লগইন সফল!",
      user: {
        ...studentWithoutPassword,
        loginSource: studentCollectionName,
      },
      token: "student_" + Date.now() + "_" + student._id,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ CAMPUS LOGIN — Due থাকলে Login Allow নয়
// =============================================
app.post("/api/students/campus-login", async (req, res) => {
  try {
    console.log("════════════════════════════════════════");
    console.log("📥 POST /api/students/campus-login");
    console.log("📤 Body:", {
      studentId: req.body.studentId || req.body.username,
      password: "***",
    });

    const { studentId, username, password } = req.body;
    const loginId = (studentId || username || "").trim();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "স্টুডেন্ট আইডি এবং পাসওয়ার্ড আবশ্যক!",
      });
    }

    const collectionNames = [
      "students",
      "batch_students",
      "basic_tazweed_students",
      "najera_batch_students",
    ];

    const regex = new RegExp("^" + loginId + "$", "i");
    let student = null;
    let studentCollectionName = null;

    for (const name of collectionNames) {
      const coll = getCollection(name);
      if (!coll) continue;

      const found = await coll.findOne({
        $or: [
          { studentId: loginId },
          { studentId: regex },
          { username: loginId },
          { username: regex },
          { roll: loginId },
          { phone: loginId },
        ],
      });

      if (found) {
        student = found;
        studentCollectionName = name;
        console.log(`✅ Found in "${name}":`, student.name);
        break;
      }
    }

    if (!student) {
      return res.status(401).json({
        success: false,
        message:
          "স্টুডেন্ট আইডি বা পাসওয়ার্ড ভুল! অথবা আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি।",
      });
    }

    // Active check
    if (studentCollectionName === "students" && student.status !== "Active") {
      return res.status(401).json({
        success: false,
        message:
          "আপনার অ্যাকাউন্ট এখনও অ্যাপ্রুভ হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।",
      });
    }

    // Password check
    const storedPassword = (student.password || "").trim();
    if (!storedPassword) {
      return res.status(401).json({
        success: false,
        message: "আপনার অ্যাকাউন্টে পাসওয়ার্ড সেট করা হয়নি।",
      });
    }
    if (storedPassword !== password.trim()) {
      return res.status(401).json({
        success: false,
        message: "স্টুডেন্ট আইডি বা পাসওয়ার্ড ভুল!",
      });
    }

    // ============================================
    // ✅ DUE CHECK — এখানেই Campus block হবে
    // ============================================
    const fromMonths = (student.paidMonths || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const paid =
      fromMonths > 0 ? fromMonths : Number(student.paidAmount) || 0;
    const fee =
      Number(student.courseFee) || Number(student.monthlyFee) || 0;
    const scholarship = Number(student.scholarshipAmount) || 0;

    let due;
    if (
      student.dueAmount !== undefined &&
      student.dueAmount !== null &&
      student.dueAmount !== ""
    ) {
      due = Math.max(Number(student.dueAmount), 0);
    } else {
      due = Math.max(fee - scholarship - paid, 0);
    }

    console.log(`💰 Fee: ${fee} | Paid: ${paid} | Due: ${due}`);

    if (due > 0) {
      // ✅ Due আছে → Login Allow নয়
      console.log(`❌ BLOCKED: Due ৳${due}`);
      console.log("════════════════════════════════════════");

      return res.status(403).json({
        success: false,
        blocked: true,
        dueAmount: due,
        message: `আপনার বকেয়া ৳${due} পরিশোধ করা হয়নি। Campus-এ প্রবেশের আগে monthly payment সম্পূর্ণ করুন।`,
        studentName: student.name,
        studentId: student.studentId || student.roll || "",
      });
    }

    const { password: _, ...studentWithoutPassword } = student;

    console.log(`✅ Campus Login OK: ${student.name}`);
    console.log("════════════════════════════════════════");

    res.status(200).json({
      success: true,
      message: "লগইন সফল!",
      user: {
        ...studentWithoutPassword,
        loginSource: studentCollectionName,
      },
      token: "campus_" + Date.now() + "_" + student._id,
    });
  } catch (error) {
    console.error("❌ Campus Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/students/approve/:id", async (req, res) => {
  try {
    console.log("📥 PUT /api/students/approve/:id");
    console.log("📝 Body:", req.body);

    const { id } = req.params;
    const { studentId, password, roll } = req.body;

    if (!studentId || !studentId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student ID আবশ্যক!",
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password আবশ্যক!",
      });
    }

    // ✅ batch_students যোগ করা হয়েছে
    const collectionNames = [
      "students",
      "batch_students",
      "basic_tazweed_students",
      "najera_batch_students",
    ];

    let foundCollection = null;
    let foundCollectionName = null;
    let student = null;

    for (const name of collectionNames) {
      const coll = getCollection(name);
      if (!coll) continue;
      try {
        const found = await coll.findOne({ _id: new ObjectId(id) });
        if (found) {
          foundCollection = coll;
          foundCollectionName = name;
          student = found;
          console.log(`✅ Found in "${name}":`, student.name);
          break;
        }
      } catch (e) {}
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in any collection!",
      });
    }

    // ✅ Duplicate studentId check — সব collection-এ
    for (const name of collectionNames) {
      const coll = getCollection(name);
      if (!coll) continue;
      const existing = await coll.findOne({
        studentId: studentId.trim(),
        _id: { $ne: new ObjectId(id) },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Student ID "${studentId}" ইতিমধ্যে অন্য একজন ব্যবহার করছে!`,
        });
      }
    }

    await foundCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          studentId: studentId.trim(),
          password: password.trim(), // ✅ এখানে unique password save হবে
          roll: roll || "",
          status: "Active",
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    console.log(`✅ Approved in "${foundCollectionName}"`);
    console.log(`🆔 Student ID: ${studentId} | 🔑 Password: ${password}`);

    res.status(200).json({
      success: true,
      message: "Student approved successfully!",
      studentId: studentId.trim(),
      collection: foundCollectionName,
    });
  } catch (error) {
    console.error("❌ Approve Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ✅ CAMPUS DATA — Student এর সব courses, batches, materials
// Campus page + My Courses + Campus Dashboard এর জন্য
// ============================================================
app.get("/api/student/campus-data/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("════════════════════════════════════════");
    console.log("📥 GET /api/student/campus-data/", studentId);

    // ─── STEP 1: batch_students এ খুঁজো ───
    const bsColl = getCollection("batch_students");
    let studentData = null;
    let sourceCollection = null;

    if (bsColl) {
      const found = await bsColl.findOne({
        $or: [
          { studentId: studentId },
          { studentId: { $regex: `^${studentId}$`, $options: "i" } },
          { studentDbId: studentId },
        ],
      });
      if (found) {
        studentData = found;
        sourceCollection = "batch_students";
      }
    }

    // ─── STEP 2: না পেলে students ───
    if (!studentData) {
      const sColl = getCollection("students");
      if (sColl) {
        const found = await sColl.findOne({
          $or: [
            { studentId: studentId },
            { username: studentId },
            {
              _id: (() => {
                try {
                  return new ObjectId(studentId);
                } catch {
                  return null;
                }
              })(),
            },
          ].filter((c) => c._id !== null),
        });
        if (found) {
          studentData = found;
          sourceCollection = "students";
        }
      }
    }

    // ─── STEP 3: না পেলে tazweed/najera ───
    if (!studentData) {
      for (const cn of ["basic_tazweed_students", "najera_batch_students"]) {
        const c = getCollection(cn);
        if (!c) continue;
        const found = await c.findOne({
          $or: [
            { studentId: studentId },
            {
              _id: (() => {
                try {
                  return new ObjectId(studentId);
                } catch {
                  return null;
                }
              })(),
            },
          ].filter((c) => c._id !== null),
        });
        if (found) {
          studentData = found;
          sourceCollection = cn;
          break;
        }
      }
    }

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    console.log(`✅ Found: ${studentData.name} in ${sourceCollection}`);

    // ─── STEP 4: Enrolled Courses ───
    const courses = [];

    // (a) batch_students হলে — batch এর course যোগ করো
    if (sourceCollection === "batch_students" && studentData.batchId) {
      const batchesData = readBatchesData();
      const parentBatch = (batchesData.batches || []).find(
        (b) => String(b._id) === String(studentData.batchId),
      );

      if (parentBatch) {
        // Batch এর সব materials যোগ করো
        const materialsColl = getCollection("batch_materials");
        const videosColl = getCollection("batch_videos");
        const classesColl = getCollection("batch_classes");

        let materials = [];
        let videos = [];
        let classes = [];

        if (materialsColl) {
          materials = await materialsColl
            .find({ batchId: String(studentData.batchId) })
            .toArray();
        }
        if (videosColl) {
          videos = await videosColl
            .find({ batchId: String(studentData.batchId) })
            .toArray();
        }
        if (classesColl) {
          classes = await classesColl
            .find({ batchId: String(studentData.batchId) })
            .toArray();
        }

        courses.push({
          id: parentBatch._id,
          titleEn: parentBatch.course || parentBatch.name,
          titleBn: parentBatch.course || parentBatch.name,
          batchName: parentBatch.name,
          course: parentBatch.course,
          instructor: parentBatch.teacher || "Not Assigned",
          schedule: parentBatch.schedule || "",
          status: parentBatch.status || "Active",
          progress: "0%",
          semester: "Current",
          image:
            parentBatch.image ||
            "https://i.ibb.co.com/W4Xxdqs9/Najeraadlatsbanner.png",
          outcomeEn:
            parentBatch.description ||
            `${parentBatch.course} course designed for comprehensive learning.`,
          outcomeBn:
            parentBatch.description ||
            `${parentBatch.course} কোর্সটি পূর্ণাঙ্গ শিক্ষার জন্য ডিজাইন করা হয়েছে।`,
          // Stats
          totalMaterials: materials.length,
          totalVideos: videos.length,
          totalClasses: classes.length,
          // Detailed lists
          materials,
          videos,
          classes,
        });
      }
    }

    // (b) courses.json এ enrolledCourses থাকলে
    if (sourceCollection === "students" && studentData.enrolledCourses) {
      const coursesData = readData();
      const allCourses = coursesData.courses || [];

      studentData.enrolledCourses.forEach((cid) => {
        const found = allCourses.find((c) => String(c._id) === String(cid));
        if (found) {
          courses.push({
            id: found._id,
            titleEn: found.title || "Untitled",
            titleBn: found.title || "Untitled",
            course: found.title,
            instructor: found.teacher || "Not Assigned",
            schedule: found.schedule || "",
            status: found.status || "Active",
            progress: `${found.progress || 0}%`,
            semester: found.duration || "Current",
            image:
              found.image ||
              "https://i.ibb.co.com/W4Xxdqs9/Najeraadlatsbanner.png",
            outcomeEn: found.description || "",
            outcomeBn: found.description || "",
            totalMaterials: found.materials || 0,
            totalVideos: found.videos || 0,
            totalClasses: found.sessions || 0,
          });
        }
      });
    }

    // ─── STEP 5: Payment info ───
    const fromMonths = (studentData.paidMonths || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const paid =
      fromMonths > 0 ? fromMonths : Number(studentData.paidAmount) || 0;
    const fee =
      Number(studentData.courseFee) || Number(studentData.monthlyFee) || 0;
    const scholarship = Number(studentData.scholarshipAmount) || 0;
    const due = Math.max(fee - scholarship - paid, 0);

    let autoStatus = studentData.paymentStatus;
    if (!autoStatus) {
      if (due === 0 && paid > 0) autoStatus = "Paid";
      else if (paid > 0) autoStatus = "Partial";
      else autoStatus = "Unpaid";
    }

    const { password: _, ...safeStudent } = studentData;

    console.log(`🎯 Courses: ${courses.length}`);
    console.log("════════════════════════════════════════");

    res.status(200).json({
      success: true,
      source: sourceCollection,
      student: {
        ...safeStudent,
        paidAmount: paid,
        dueAmount: due,
        courseFee: fee,
        scholarshipAmount: scholarship,
        paymentStatus: autoStatus,
      },
      courses,
    });
  } catch (error) {
    console.error("❌ Campus-data error:", error);
    res.status(500).json({ success: false, message: error.message });
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
      classNo: finalClassNo,
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
      batchId: String(batchId),
      name: String(name).trim(),
      day: day || "Saturday",
      time: String(time).trim(),
      gender: gender || "Male",
      teachers: teachersList, // ✅ add this
      teacher: teachersList[0] || "", // backward compat
      meetingLink: meetingLink || "",
      attendance: [],
      createdAt: new Date(),
      updatedAt: new Date(),
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
// ✅ ADMISSION REPORT — Dynamic from students
// =============================================
// =============================================
// ✅ ADMISSION REPORT — With Department Filter
// =============================================
app.get("/api/admission-report/all", async (req, res) => {
  try {
    const { department } = req.query;
    console.log(
      "📥 GET /api/admission-report/all | department:",
      department || "All",
    );

    const studentsCollection = getCollection("students");
    if (!studentsCollection) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    let students = await studentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // ✅ Filter by department (if provided)
    if (department && department !== "All") {
      const search = department.toLowerCase().trim();
      students = students.filter((s) => {
        const sDept = (s.department || "").toLowerCase();
        const sCourse = String(s.course || "").toLowerCase();
        const sBatch = (s.batch || "").toLowerCase();
        // Match department field OR course names OR batch
        return (
          sDept === search ||
          sCourse.includes(search) ||
          sBatch.includes(search) ||
          sCourse.split(",").some((c) => c.trim() === search)
        );
      });
      console.log(
        `🎯 Filtered to ${students.length} students for "${department}"`,
      );
    }

    const records = students.map((s) => {
      const rawStatus = s.status || "Pending";
      let uiStatus = "Pending";
      if (rawStatus === "Active") uiStatus = "Approved";
      else if (rawStatus === "Rejected" || rawStatus === "Inactive")
        uiStatus = "Rejected";

      const admissionDate = s.admissionDate
        ? new Date(s.admissionDate).toISOString().split("T")[0]
        : s.createdAt
          ? new Date(s.createdAt).toISOString().split("T")[0]
          : "";

      return {
        id: s._id.toString(),
        _id: s._id.toString(),
        studentName: s.name || "Unknown",
        studentId:
          s.studentId ||
          s.username ||
          s.roll ||
          s._id.toString().slice(-6).toUpperCase(),
        class: s.class || s.course || "N/A",
        course: s.course || "",
        department: s.department || "",
        batch: s.batch || "",
        subject: s.course || "General",
        applicationDate: admissionDate,
        status: uiStatus,
        rawStatus: rawStatus,
        parentName: s.guardianName || s.fatherName || "",
        parentPhone: s.guardianPhone || s.phone || "",
        email: s.email || "",
        address: s.presentAddress || s.address || "",
        previousSchool: s.previousSchool || "",
        notes: s.comments || "",
        gender: s.gender || "N/A",
        country: s.country || "BD",
      };
    });

    const total = records.length;
    const approved = records.filter((r) => r.status === "Approved").length;
    const pending = records.filter((r) => r.status === "Pending").length;
    const rejected = records.filter((r) => r.status === "Rejected").length;

    const now = new Date();
    const newThisMonth = records.filter((r) => {
      if (!r.applicationDate) return false;
      const d = new Date(r.applicationDate);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthlyMap = {};
    records.forEach((r) => {
      if (!r.applicationDate) return;
      const d = new Date(r.applicationDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: monthNames[d.getMonth()],
          year: d.getFullYear(),
          applications: 0,
          approved: 0,
          rejected: 0,
          sortKey: d.getFullYear() * 12 + d.getMonth(),
        };
      }
      monthlyMap[key].applications++;
      if (r.status === "Approved") monthlyMap[key].approved++;
      if (r.status === "Rejected") monthlyMap[key].rejected++;
    });
    const monthlyData = Object.values(monthlyMap).sort(
      (a, b) => a.sortKey - b.sortKey,
    );

    const classMap = {};
    records.forEach((r) => {
      const cls = r.class || "Unknown";
      if (!classMap[cls]) {
        classMap[cls] = {
          class: cls,
          applications: 0,
          approved: 0,
          enrolled: 0,
        };
      }
      classMap[cls].applications++;
      if (r.status === "Approved") {
        classMap[cls].approved++;
        classMap[cls].enrolled++;
      }
    });
    const classWiseData = Object.values(classMap);

    const genderCount = { Male: 0, Female: 0, Other: 0 };
    records.forEach((r) => {
      const g = (r.gender || "").toLowerCase();
      if (g === "male") genderCount.Male++;
      else if (g === "female") genderCount.Female++;
      else if (g) genderCount.Other++;
    });

    const subjectMap = {};
    records.forEach((r) => {
      const subjects = String(r.course || r.subject || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      subjects.forEach((s) => {
        if (!subjectMap[s]) subjectMap[s] = 0;
        subjectMap[s]++;
      });
    });

    res.status(200).json({
      success: true,
      department: department || "All",
      stats: {
        totalApplications: total,
        approvedApplications: approved,
        pendingApplications: pending,
        rejectedApplications: rejected,
        totalStudents: approved,
        newStudents: newThisMonth,
        conversionRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      },
      records,
      monthlyData,
      classWiseData,
      genderData: Object.entries(genderCount).map(([k, v]) => ({
        gender: k,
        count: v,
      })),
      subjectWiseData: Object.entries(subjectMap).map(([k, v]) => ({
        subject: k,
        count: v,
      })),
    });
  } catch (error) {
    console.error("❌ Admission report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ GET ALL UNIQUE DEPARTMENTS/COURSES
// =============================================
app.get("/api/departments/all", async (req, res) => {
  try {
    console.log("📥 GET /api/departments/all");
    const studentsCollection = getCollection("students");
    const students = await studentsCollection.find({}).toArray();

    const departmentsSet = new Set();

    students.forEach((s) => {
      // Department field
      if (s.department && s.department.trim()) {
        departmentsSet.add(s.department.trim());
      }
      // Course names (split by comma)
      if (s.course) {
        String(s.course)
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .forEach((c) => departmentsSet.add(c));
      }
      // Batch
      if (s.batch && s.batch.trim()) {
        departmentsSet.add(s.batch.trim());
      }
    });

    const departments = Array.from(departmentsSet).sort();
    console.log(`✅ Found ${departments.length} unique departments/courses`);

    res.json({ success: true, total: departments.length, departments });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/departments/all", async (req, res) => {
  const studentsCollection = getCollection("students");
  const students = await studentsCollection.find({}).toArray();
  const depts = new Set();
  students.forEach((s) => {
    if (s.department) depts.add(s.department);
    if (s.course) {
      String(s.course)
        .split(",")
        .forEach((c) => depts.add(c.trim()));
    }
  });
  res.json({ success: true, departments: Array.from(depts).filter(Boolean) });
});

// ✅ Update status only (for approve/reject from Admission Report)
app.put("/api/admission-report/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log("📥 PUT /api/admission-report/status/", id, "→", status);

    if (!["Active", "Pending", "Rejected", "Inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status!" });
    }

    const studentsCollection = getCollection("students");
    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.json({ success: true, message: "✅ Status updated!" });
  } catch (error) {
    console.error("❌ Error:", error);
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
// ✅ BATCH STUDENTS — MongoDB Collection (batch_students)
// =============================================

// ✅ GET all batch students (optional filter by batchId)
app.get("/api/batch-students/all", async (req, res) => {
  try {
    const { batchId } = req.query;
    console.log("📥 GET /api/batch-students/all | batchId:", batchId || "All");

    const coll = getCollection("batch_students");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const query = batchId ? { batchId: String(batchId) } : {};
    const students = await coll.find(query).sort({ createdAt: -1 }).toArray();

    console.log(`✅ Found ${students.length} students`);
    res.status(200).json({ success: true, total: students.length, students });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ BATCH STUDENTS — MongoDB Collection (batch_students)
// =============================================

// ✅ GET all batch students (optional filter by batchId)
app.get("/api/batch-students/all", async (req, res) => {
  try {
    const { batchId } = req.query;
    console.log("📥 GET /api/batch-students/all | batchId:", batchId || "All");

    const coll = getCollection("batch_students");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const query = batchId ? { batchId: String(batchId) } : {};
    const students = await coll.find(query).sort({ createdAt: -1 }).toArray();

    console.log(`✅ Found ${students.length} students`);
    res.status(200).json({ success: true, total: students.length, students });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE batch student
app.put("/api/batch-students/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/batch-students/update/", id);

    const coll = getCollection("batch_students");
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updated = await coll.findOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, student: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE batch student
app.delete("/api/batch-students/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/batch-students/delete/", id);

    const coll = getCollection("batch_students");
    const result = await coll.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "✅ Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE ALL students of a batch (when deleting batch)
app.delete("/api/batch-students/delete-by-batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const coll = getCollection("batch_students");
    const result = await coll.deleteMany({ batchId: String(batchId) });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ API Routes
// =============================================

// =============================================
// ✅ API Routes
// =============================================

// =============================================
// ✅ BATCH CLASSES — MongoDB Collection (batch_classes)
// =============================================

// ✅ CREATE class
// ✅ CREATE class
app.post("/api/batch-classes/create", async (req, res) => {
  try {
    console.log("📥 POST /api/batch-classes/create");
    console.log("📝 Body:", req.body);

    const {
      batchId,
      name,
      password,
      classNo, // ⬅️ NEW
      classDate, // ⬅️ NEW
      day,
      time,
      gender,
      teachers,
      teacher,
      meetingLink,
    } = req.body;

    // ✅ Support both formats
    const teachersList = Array.isArray(teachers)
      ? teachers.filter(Boolean)
      : teacher
        ? [teacher]
        : [];

    const coll = getCollection("batch_classes");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const newClass = {
      batchId: String(batchId),
      name: String(name).trim(),
      classNo: classNo || "", // ⬅️ MUST
      classDate: classDate || "", // ⬅️ MUST
      day: day || "Saturday",
      time: String(time).trim(),
      gender: gender || "Male",
      teachers: teachersList, // ⬅️ array bug fix
      teacher: teachersList[0] || "",
      meetingLink: meetingLink || "",
      attendance: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await coll.insertOne(newClass);
    console.log("✅ Class created:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "✅ Class added successfully!",
      class: { ...newClass, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET all classes (filter by batchId)
app.get("/api/batch-classes/all", async (req, res) => {
  try {
    const { batchId } = req.query;
    console.log("📥 GET /api/batch-classes/all | batchId:", batchId || "All");

    const coll = getCollection("batch_classes");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const query = batchId ? { batchId: String(batchId) } : {};
    const classes = await coll.find(query).sort({ createdAt: 1 }).toArray();

    console.log(`✅ Found ${classes.length} classes`);
    res.status(200).json({ success: true, total: classes.length, classes });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE class
app.put("/api/batch-classes/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/batch-classes/update/", id);

    const coll = getCollection("batch_classes");
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;
    delete updateData.batchId;

    // ✅ Auto-sync teacher field with teachers array (backward compat)
    if (Array.isArray(updateData.teachers)) {
      updateData.teachers = updateData.teachers.filter(Boolean);
      updateData.teacher = updateData.teachers[0] || "";
    } else if (updateData.teacher) {
      // If only old teacher field sent
      updateData.teachers = [updateData.teacher];
    }

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updated = await coll.findOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, class: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE class
app.delete("/api/batch-classes/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/batch-classes/delete/", id);

    const coll = getCollection("batch_classes");
    const result = await coll.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "✅ Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE all classes of a batch
app.delete("/api/batch-classes/delete-by-batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const coll = getCollection("batch_classes");
    const result = await coll.deleteMany({ batchId: String(batchId) });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ BULK: Set same fee for all students in a batch
app.put("/api/batch-students/bulk-set-fee/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const { courseFee, monthlyFee } = req.body;

    const fee = Number(courseFee) || 0;
    const monthly = Number(monthlyFee) || fee;

    const coll = getCollection("batch_students");
    const students = await coll.find({ batchId: String(batchId) }).toArray();

    let updated = 0;
    for (const s of students) {
      const scholarship = Number(s.scholarshipAmount) || 0;
      const paid = Number(s.paidAmount) || 0;
      const due = Math.max(fee - scholarship - paid, 0);

      await coll.updateOne(
        { _id: s._id },
        {
          $set: {
            courseFee: fee,
            monthlyFee: monthly,
            dueAmount: due,
            updatedAt: new Date(),
          },
        },
      );
      updated++;
    }

    res.json({
      success: true,
      message: `✅ ${updated} students updated with fee ৳${fee}`,
      updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ SAVE attendance for a class + date
app.put("/api/batch-classes/attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, records } = req.body;

    if (!date || !records) {
      return res.status(400).json({
        success: false,
        message: "Date এবং Records আবশ্যক!",
      });
    }

    const coll = getCollection("batch_classes");
    const cls = await coll.findOne({ _id: new ObjectId(id) });
    if (!cls) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found!" });
    }

    const otherAtt = (cls.attendance || []).filter((a) => a.date !== date);
    const newAtt = [
      ...otherAtt,
      { date, records, markedAt: new Date().toISOString() },
    ];

    await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: { attendance: newAtt, updatedAt: new Date() } },
    );

    console.log("✅ Attendance saved for class:", id, "date:", date);
    res.status(200).json({ success: true, message: "✅ Attendance saved!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
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
// ✅ BATCH MATERIALS — MongoDB Collection (batch_materials)
// Exam / Quiz / PDF upload for each batch
// =============================================

// ✅ CREATE material
app.post("/api/batch-materials/create", async (req, res) => {
  try {
    console.log("📥 POST /api/batch-materials/create");
    console.log("📝 Body:", req.body);

    const { batchId, type, title, url, date, classId, marks, totalMarks } =
      req.body;

    if (!batchId || !type || !title || !url) {
      return res.status(400).json({
        success: false,
        message: "Batch ID, Type, Title এবং URL/File আবশ্যক!",
      });
    }

    if (!["exam", "quiz", "pdf"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'exam', 'quiz' or 'pdf'",
      });
    }

    const coll = getCollection("batch_materials");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const newMaterial = {
      batchId: String(batchId),
      type,
      title: String(title).trim(),
      url: String(url).trim(),
      date: date || new Date().toISOString().split("T")[0],
      classId: classId || null,
      marks:
        marks === "" || marks === null || marks === undefined
          ? null
          : Number(marks),
      totalMarks:
        totalMarks === "" || totalMarks === null || totalMarks === undefined
          ? null
          : Number(totalMarks),
      addedAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await coll.insertOne(newMaterial);
    console.log("✅ Material created:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "✅ Material uploaded successfully!",
      material: { ...newMaterial, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET all materials (filter by batchId, type, classId)
app.get("/api/batch-materials/all", async (req, res) => {
  try {
    const { batchId, type, classId } = req.query;
    console.log(
      "📥 GET /api/batch-materials/all | batchId:",
      batchId || "All",
      "| type:",
      type || "All",
    );

    const coll = getCollection("batch_materials");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const query = {};
    if (batchId) query.batchId = String(batchId);
    if (type) query.type = type;
    if (classId) query.classId = classId;

    const materials = await coll.find(query).sort({ addedAt: -1 }).toArray();

    console.log(`✅ Found ${materials.length} materials`);
    res.status(200).json({
      success: true,
      total: materials.length,
      materials,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE material
app.put("/api/batch-materials/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/batch-materials/update/", id);

    const coll = getCollection("batch_materials");
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;
    delete updateData.batchId;

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updated = await coll.findOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, material: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE single material
app.delete("/api/batch-materials/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/batch-materials/delete/", id);

    const coll = getCollection("batch_materials");
    const result = await coll.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "✅ Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// =============================================
// ✅ STUDENT ACADEMIC DATA — Get batch data by course
// =============================================
// =============================================
// ✅ STUDENT ACADEMIC DATA — Get batch data by course
// Smart matching: handle multiple courses, partial match
// =============================================
app.get("/api/student/academic/:courseName", async (req, res) => {
  try {
    const { courseName } = req.params;
    const decoded = decodeURIComponent(courseName).trim();
    console.log("════════════════════════════════════════");
    console.log("📥 GET /api/student/academic/", `"${decoded}"`);

    // ✅ Split search term by comma — handle "Qaida Nooraniya, Bakarah Hifz"
    const searchTerms = decoded
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    console.log("🔍 Search terms:", searchTerms);

    const data = readBatchesData();
    const allBatches = data.batches || [];
    console.log(`📦 Total batches: ${allBatches.length}`);

    // ✅ Match ANY search term against batch course/name
    const matchingBatches = allBatches.filter((b) => {
      const bCourse = (b.course || "").toLowerCase().trim();
      const bName = (b.name || "").toLowerCase().trim();

      return searchTerms.some((search) => {
        if (!search) return false;

        // Exact match
        if (bCourse === search || bName === search) return true;

        // Contains match
        if (bCourse && (bCourse.includes(search) || search.includes(bCourse)))
          return true;
        if (bName && (bName.includes(search) || search.includes(bName)))
          return true;

        // Word-level match (>3 chars)
        const sw = search.split(/\s+/).filter((w) => w.length > 3);
        const bw = bCourse.split(/\s+/).filter((w) => w.length > 3);
        if (sw.some((w) => bw.includes(w))) return true;

        return false;
      });
    });

    const batchIds = matchingBatches.map((b) => String(b._id));
    console.log(`✅ Matched batches: ${matchingBatches.length}`);
    matchingBatches.forEach((b) => {
      console.log(`   → "${b.name}" | course: "${b.course}" | _id: ${b._id}`);
    });

    // ────────────────────────────────────────
    // 1️⃣ Videos from batch_videos collection
    // ────────────────────────────────────────
    const videosColl = getCollection("batch_videos");
    let videos = [];
    if (videosColl && batchIds.length > 0) {
      videos = await videosColl
        .find({ batchId: { $in: batchIds } })
        .sort({ addedAt: -1 })
        .toArray();
    }

    // Legacy videos from batches.json
    const legacyVideos = [];
    matchingBatches.forEach((batch) => {
      if (batch.videoUrl && batch.videoUrl.trim()) {
        legacyVideos.push({
          _id: batch._id + "_p",
          title: `${batch.name} - Primary Video`,
          url: batch.videoUrl.trim(),
          batchName: batch.name,
          teacher: batch.teacher || "",
          addedAt: batch.createdAt || "",
        });
      }
      (batch.videos || []).forEach((v, i) => {
        if (v && v.url && v.url.trim()) {
          legacyVideos.push({
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

    const allVideos = [...videos, ...legacyVideos];
    console.log(`🎬 Videos found: ${allVideos.length}`);

    // ────────────────────────────────────────
    // 2️⃣ Materials from batch_materials
    // ────────────────────────────────────────
    const materialsColl = getCollection("batch_materials");
    let materials = [];
    if (materialsColl && batchIds.length > 0) {
      materials = await materialsColl
        .find({ batchId: { $in: batchIds } })
        .sort({ addedAt: -1 })
        .toArray();
    }

    // ────────────────────────────────────────
    // 3️⃣ Classes from batch_classes
    // ────────────────────────────────────────
    const classesColl = getCollection("batch_classes");
    let classes = [];
    if (classesColl && batchIds.length > 0) {
      classes = await classesColl
        .find({ batchId: { $in: batchIds } })
        .sort({ createdAt: 1 })
        .toArray();
    }

    // Enrich classes with batch info
    const enrichedClasses = classes.map((cls) => {
      const parent = matchingBatches.find(
        (b) => String(b._id) === String(cls.batchId),
      );
      return {
        ...cls,
        batchName: parent?.name || "",
        course: parent?.course || "",
      };
    });

    // Split materials by type
    const exams = materials.filter((m) => m.type === "exam");
    const quizzes = materials.filter((m) => m.type === "quiz");
    const pdfs = materials.filter((m) => m.type === "pdf");

    console.log(
      `🎯 Final → Videos: ${allVideos.length}, Classes: ${enrichedClasses.length}, Exams: ${exams.length}, Quizzes: ${quizzes.length}, PDFs: ${pdfs.length}`,
    );
    console.log("════════════════════════════════════════");

    res.status(200).json({
      success: true,
      searchedCourse: decoded,
      searchTerms,
      matchedBatches: matchingBatches.map((b) => ({
        _id: b._id,
        name: b.name,
        course: b.course,
        teacher: b.teacher,
        schedule: b.schedule,
        status: b.status,
      })),
      videos: allVideos,
      materials: {
        all: materials,
        exams,
        quizzes,
        pdfs,
      },
      classes: enrichedClasses,
      stats: {
        totalVideos: allVideos.length,
        totalExams: exams.length,
        totalQuizzes: quizzes.length,
        totalPdfs: pdfs.length,
        totalClasses: enrichedClasses.length,
        totalMaterials: materials.length,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// backend/index.js — পুরনো /api/student/my-academic replace করুন
app.get("/api/student/my-academic", async (req, res) => {
  try {
    const { id, studentId, phone, name, username, course } = req.query;
    console.log("════════════════════════════════════════");
    console.log("📥 GET /api/student/my-academic");
    console.log("   id:", id || "-", "| studentId:", studentId || "-");
    console.log("   phone:", phone || "-", "| name:", name || "-");

    const bsColl = getCollection("batch_students");
    if (!bsColl) {
      return res.status(500).json({
        success: false,
        message: "batch_students collection not found",
      });
    }

    // ─── Step 1: Multi-identifier OR conditions ───
    const orConditions = [];

    // (a) Main student _id → studentDbId reference
    if (id && String(id).trim()) {
      orConditions.push({ studentDbId: String(id).trim() });
    }

    // (b) Phone (exact + last-11 fallback for BD format)
    if (phone && String(phone).trim()) {
      const cleanPhone = String(phone).trim();
      orConditions.push({ phone: cleanPhone });
      const last11 = cleanPhone.replace(/\D/g, "").slice(-11);
      if (last11.length === 11) {
        orConditions.push({ phone: { $regex: last11 + "$" } });
      }
    }

    // (c) studentId (exact, case-insensitive)
    if (studentId && String(studentId).trim()) {
      const sid = String(studentId).trim();
      orConditions.push({ studentId: sid });
      orConditions.push({
        studentId: { $regex: `^${sid}$`, $options: "i" },
      });
    }

    // (d) Name (exact first, then first-word partial)
    if (name && String(name).trim() && name !== "Student") {
      const nm = String(name).trim();
      orConditions.push({ name: { $regex: `^${nm}$`, $options: "i" } });
      const firstName = nm.split(/\s+/)[0];
      if (firstName && firstName.length > 3) {
        orConditions.push({
          name: { $regex: `^${firstName}`, $options: "i" },
        });
      }
    }

    if (orConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No search criteria provided",
      });
    }

    console.log(`🔍 Search: ${orConditions.length} conditions`);
    const matchedBatchStudents = await bsColl
      .find({ $or: orConditions })
      .toArray();

    console.log(
      `🎯 Matched ${matchedBatchStudents.length} batch_student records`,
    );
    matchedBatchStudents.forEach((m) => {
      console.log(
        `   → name:"${m.name}" | studentId:"${m.studentId}" | phone:"${m.phone}" | batchId:"${m.batchId}"`,
      );
    });

    // ─── Step 2: Batch IDs ───
    const batchIds = [
      ...new Set(
        matchedBatchStudents.map((m) => String(m.batchId)).filter(Boolean),
      ),
    ];
    console.log(`📦 Batch IDs:`, batchIds);

    // ─── Step 3: Content from MongoDB (only this student's batches) ───
    let videos = [];
    let materials = [];
    let classes = [];

    if (batchIds.length > 0) {
      const videosColl = getCollection("batch_videos");
      const materialsColl = getCollection("batch_materials");
      const classesColl = getCollection("batch_classes");

      if (videosColl) {
        videos = await videosColl
          .find({ batchId: { $in: batchIds } })
          .sort({ addedAt: -1 })
          .toArray();
      }
      if (materialsColl) {
        materials = await materialsColl
          .find({ batchId: { $in: batchIds } })
          .sort({ addedAt: -1 })
          .toArray();
      }
      if (classesColl) {
        classes = await classesColl
          .find({ batchId: { $in: batchIds } })
          .sort({ createdAt: 1 })
          .toArray();
      }
    }

    // ─── Step 4: Batch info + LEGACY videos from batches.json ───
    const allBatches = readBatchesData().batches || [];
    const studentBatches = allBatches.filter((b) =>
      batchIds.includes(String(b._id)),
    );

    // ⬅️ এইটাই MISSING ছিল — পুরনো batches.json এর videos
    const legacyVideos = [];
    studentBatches.forEach((batch) => {
      if (batch.videoUrl && batch.videoUrl.trim()) {
        legacyVideos.push({
          _id: batch._id + "_p",
          title: `${batch.name} - Primary Video`,
          url: batch.videoUrl.trim(),
          batchName: batch.name,
          course: batch.course || "",
          teacher: batch.teacher || "",
          addedAt: batch.createdAt || "",
        });
      }
      (batch.videos || []).forEach((v, i) => {
        if (v && v.url && v.url.trim()) {
          legacyVideos.push({
            _id: `${batch._id}_v${i}`,
            title: v.title || `Video ${i + 1}`,
            url: v.url.trim(),
            batchName: batch.name,
            course: batch.course || "",
            teacher: batch.teacher || "",
            addedAt: v.addedAt || batch.createdAt || "",
          });
        }
      });
    });

    // ─── Combine + dedupe videos (URL-based) ───
    const seenUrls = new Set();
    const allVideos = [];
    [...videos, ...legacyVideos].forEach((v) => {
      if (v.url && !seenUrls.has(v.url)) {
        seenUrls.add(v.url);
        allVideos.push(v);
      }
    });

    // ─── Enrich classes with batch info ───
    const enrichedClasses = classes.map((cls) => {
      const parent = studentBatches.find(
        (b) => String(b._id) === String(cls.batchId),
      );
      return {
        ...cls,
        batchName: parent?.name || "",
        course: parent?.course || "",
      };
    });

    const exams = materials.filter((m) => m.type === "exam");
    const quizzes = materials.filter((m) => m.type === "quiz");
    const pdfs = materials.filter((m) => m.type === "pdf");

    console.log(
      `✅ Final → Videos: ${allVideos.length}, Classes: ${enrichedClasses.length}, Exams: ${exams.length}, Quizzes: ${quizzes.length}, PDFs: ${pdfs.length}`,
    );
    console.log("════════════════════════════════════════");

    res.status(200).json({
      success: true,
      matchedBatchStudents: matchedBatchStudents.map((m) => ({
        name: m.name,
        studentId: m.studentId,
        phone: m.phone,
        batchId: m.batchId,
      })),
      batchIds,
      batches: studentBatches.map((b) => ({
        _id: b._id,
        name: b.name,
        course: b.course,
        teacher: b.teacher,
        schedule: b.schedule,
        status: b.status,
      })),
      videos: allVideos,
      materials: { all: materials, exams, quizzes, pdfs },
      classes: enrichedClasses,
      stats: {
        totalVideos: allVideos.length,
        totalExams: exams.length,
        totalQuizzes: quizzes.length,
        totalPdfs: pdfs.length,
        totalClasses: enrichedClasses.length,
        totalMaterials: materials.length,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// =============================================
// ✅ STUDENT ACADEMIC — ALL DATA (No filter — সব student সব দেখবে)
// =============================================
app.get("/api/student/academic-all", async (req, res) => {
  try {
    console.log("════════════════════════════════════════");
    console.log("📥 GET /api/student/academic-all (ALL data)");

    // 1️⃣ Get ALL batches
    const data = readBatchesData();
    const allBatches = data.batches || [];
    const batchIds = allBatches.map((b) => String(b._id));
    console.log(`📦 Total batches: ${allBatches.length}`);

    // 2️⃣ Videos from batch_videos collection
    const videosColl = getCollection("batch_videos");
    let videos = [];
    if (videosColl && batchIds.length > 0) {
      videos = await videosColl
        .find({ batchId: { $in: batchIds } })
        .sort({ addedAt: -1 })
        .toArray();
    }

    // Legacy videos from batches.json
    const legacyVideos = [];
    allBatches.forEach((batch) => {
      if (batch.videoUrl && batch.videoUrl.trim()) {
        legacyVideos.push({
          _id: batch._id + "_p",
          title: `${batch.name} - Primary Video`,
          url: batch.videoUrl.trim(),
          batchName: batch.name,
          course: batch.course || "",
          teacher: batch.teacher || "",
          addedAt: batch.createdAt || "",
        });
      }
      (batch.videos || []).forEach((v, i) => {
        if (v && v.url && v.url.trim()) {
          legacyVideos.push({
            _id: `${batch._id}_v${i}`,
            title: v.title || `Video ${i + 1}`,
            url: v.url.trim(),
            batchName: batch.name,
            course: batch.course || "",
            teacher: batch.teacher || "",
            addedAt: v.addedAt || batch.createdAt || "",
          });
        }
      });
    });

    // 3️⃣ Materials from batch_materials collection
    const materialsColl = getCollection("batch_materials");
    let materials = [];
    if (materialsColl && batchIds.length > 0) {
      materials = await materialsColl
        .find({ batchId: { $in: batchIds } })
        .sort({ addedAt: -1 })
        .toArray();
    }

    // 4️⃣ Classes from batch_classes collection
    const classesColl = getCollection("batch_classes");
    let classes = [];
    if (classesColl && batchIds.length > 0) {
      classes = await classesColl
        .find({ batchId: { $in: batchIds } })
        .sort({ createdAt: 1 })
        .toArray();
    }

    // Enrich classes with batch info (course name)
    const enrichedClasses = classes.map((cls) => {
      const parentBatch = allBatches.find(
        (b) => String(b._id) === String(cls.batchId),
      );
      return {
        ...cls,
        batchName: parentBatch?.name || "",
        course: parentBatch?.course || "",
      };
    });

    // Combine videos
    const allVideos = [...videos, ...legacyVideos];

    // Separate materials
    const exams = materials.filter((m) => m.type === "exam");
    const quizzes = materials.filter((m) => m.type === "quiz");
    const pdfs = materials.filter((m) => m.type === "pdf");

    console.log(
      `🎯 Videos: ${allVideos.length}, Exams: ${exams.length}, Quizzes: ${quizzes.length}, PDFs: ${pdfs.length}, Classes: ${enrichedClasses.length}`,
    );
    console.log("════════════════════════════════════════");

    res.status(200).json({
      success: true,
      batches: allBatches.map((b) => ({
        _id: b._id,
        name: b.name,
        course: b.course,
        teacher: b.teacher,
        schedule: b.schedule,
        status: b.status,
      })),
      videos: allVideos,
      materials: {
        all: materials,
        exams,
        quizzes,
        pdfs,
      },
      classes: enrichedClasses,
      stats: {
        totalVideos: allVideos.length,
        totalExams: exams.length,
        totalQuizzes: quizzes.length,
        totalPdfs: pdfs.length,
        totalClasses: enrichedClasses.length,
        totalMaterials: materials.length,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE all materials of a batch (cascade delete)
app.delete(
  "/api/batch-materials/delete-by-batch/:batchId",
  async (req, res) => {
    try {
      const { batchId } = req.params;
      const coll = getCollection("batch_materials");
      const result = await coll.deleteMany({ batchId: String(batchId) });
      console.log(
        `✅ Deleted ${result.deletedCount} materials for batch ${batchId}`,
      );
      res.status(200).json({ success: true, deleted: result.deletedCount });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// ✅ STATS — count by type for a batch
app.get("/api/batch-materials/stats/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const coll = getCollection("batch_materials");

    const [pdfCount, quizCount, examCount] = await Promise.all([
      coll.countDocuments({ batchId: String(batchId), type: "pdf" }),
      coll.countDocuments({ batchId: String(batchId), type: "quiz" }),
      coll.countDocuments({ batchId: String(batchId), type: "exam" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        pdf: pdfCount,
        quiz: quizCount,
        exam: examCount,
        total: pdfCount + quizCount + examCount,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ✅ STUDENT DASHBOARD — Academic এর exact search logic দিয়ে
// studentDbId, phone, studentId, name — 4টাই search করে
// ============================================================
app.get("/api/student/dashboard-full", async (req, res) => {
  try {
    const { id, studentId, phone, name, username } = req.query;
    console.log("════════════════════════════════════════");
    console.log("📥 GET /api/student/dashboard-full");
    console.log("   id:", id || "-", "| studentId:", studentId || "-");
    console.log("   phone:", phone || "-", "| name:", name || "-");

    const bsColl = getCollection("batch_students");
    if (!bsColl) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    // ✅ Academic এর মতো same OR conditions
    const orConditions = [];

    // (a) studentDbId ← id থেকে
    if (id && String(id).trim()) {
      orConditions.push({ studentDbId: String(id).trim() });
    }

    // (b) phone — exact + last 11
    if (phone && String(phone).trim()) {
      const cleanPhone = String(phone).trim();
      orConditions.push({ phone: cleanPhone });
      const last11 = cleanPhone.replace(/\D/g, "").slice(-11);
      if (last11.length === 11) {
        orConditions.push({ phone: { $regex: last11 + "$" } });
      }
    }

    // (c) studentId — exact + case insensitive
    if (studentId && String(studentId).trim()) {
      const sid = String(studentId).trim();
      orConditions.push({ studentId: sid });
      orConditions.push({
        studentId: { $regex: `^${sid}$`, $options: "i" },
      });
    }

    // (d) name — exact + first word
    if (name && String(name).trim() && name !== "Student") {
      const nm = String(name).trim();
      orConditions.push({ name: { $regex: `^${nm}$`, $options: "i" } });
      const firstName = nm.split(/\s+/)[0];
      if (firstName && firstName.length > 3) {
        orConditions.push({
          name: { $regex: `^${firstName}`, $options: "i" },
        });
      }
    }

    if (orConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No search criteria provided",
      });
    }

    console.log(
      `🔍 Searching batch_students with ${orConditions.length} conditions`,
    );

    // ✅ STEP 1: batch_students এ খুঁজো
    let studentData = await bsColl.findOne({ $or: orConditions });
    let sourceCollection = studentData ? "batch_students" : null;

    // ✅ STEP 2: না পেলে students collection
    if (!studentData) {
      console.log("⚠️ Not in batch_students, trying students...");
      const sColl = getCollection("students");
      if (sColl) {
        const sOr = [];
        if (id) {
          try {
            sOr.push({ _id: new ObjectId(String(id).trim()) });
          } catch {}
        }
        if (studentId) {
          sOr.push({
            studentId: {
              $regex: `^${String(studentId).trim()}$`,
              $options: "i",
            },
          });
        }
        if (phone) sOr.push({ phone: String(phone).trim() });
        if (username) sOr.push({ username: String(username).trim() });

        if (sOr.length > 0) {
          studentData = await sColl.findOne({ $or: sOr });
          if (studentData) {
            sourceCollection = "students";
            console.log(`✅ Found in students: ${studentData.name}`);
          }
        }
      }
    }

    // ✅ STEP 3: না পেলে tazweed/najera
    if (!studentData) {
      for (const cn of ["basic_tazweed_students", "najera_batch_students"]) {
        const c = getCollection(cn);
        if (!c) continue;
        const sOr = [];
        if (id) {
          try {
            sOr.push({ _id: new ObjectId(String(id).trim()) });
          } catch {}
        }
        if (studentId) sOr.push({ studentId: String(studentId).trim() });
        if (phone) sOr.push({ phone: String(phone).trim() });
        if (sOr.length > 0) {
          studentData = await c.findOne({ $or: sOr });
          if (studentData) {
            sourceCollection = cn;
            console.log(`✅ Found in ${cn}: ${studentData.name}`);
            break;
          }
        }
      }
    }

    if (!studentData) {
      console.log("❌ Not found in any collection");
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    console.log(`✅ Found: ${studentData.name} in ${sourceCollection}`);

    // ✅ STEP 4: Parent batch info (batch_students হলে)
    let batchInfo = null;
    let batchClasses = [];

    if (sourceCollection === "batch_students" && studentData.batchId) {
      const batchesData = readBatchesData();
      batchInfo = (batchesData.batches || []).find(
        (b) => String(b._id) === String(studentData.batchId),
      );

      const classesColl = getCollection("batch_classes");
      if (classesColl) {
        batchClasses = await classesColl
          .find({ batchId: String(studentData.batchId) })
          .sort({ createdAt: 1 })
          .toArray();
      }
    }

    // ✅ STEP 5: Payment calculation
    const fromMonths = (studentData.paidMonths || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const paid =
      fromMonths > 0 ? fromMonths : Number(studentData.paidAmount) || 0;
    const fee =
      Number(studentData.courseFee) || Number(studentData.monthlyFee) || 0;
    const scholarship = Number(studentData.scholarshipAmount) || 0;
    const due = Math.max(fee - scholarship - paid, 0);

    let autoStatus = studentData.paymentStatus;
    if (!autoStatus) {
      if (due === 0 && paid > 0) autoStatus = "Paid";
      else if (paid > 0) autoStatus = "Partial";
      else autoStatus = "Unpaid";
    }

    const { password: _, ...safeStudent } = studentData;

    console.log(`💰 Fee: ${fee} | Paid: ${paid} | Due: ${due}`);
    console.log("════════════════════════════════════════");

    res.status(200).json({
      success: true,
      source: sourceCollection,
      student: {
        ...safeStudent,
        paidAmount: paid,
        dueAmount: due,
        courseFee: fee,
        scholarshipAmount: scholarship,
        paymentStatus: autoStatus,
        // Batch info
        batchName: batchInfo?.name || "",
        batchCourse: batchInfo?.course || "",
        batchTeacher: batchInfo?.teacher || "",
        batchSchedule: batchInfo?.schedule || "",
        batchStatus: batchInfo?.status || "",
        batchClasses,
      },
    });
  } catch (error) {
    console.error("❌ Dashboard-full error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// ✅ CREATE batch student
// ✅ CREATE batch student — with scholarship + auto due
app.post("/api/batch-students/create", async (req, res) => {
  try {
    console.log("📥 POST /api/batch-students/create");
    console.log("📝 Body:", req.body);

    const {
      batchId,
      name,
      studentId,
      phone,
      country,
      course,
      paymentStatus,

      // ⬇️ নতুন ফিল্ড
      scholarshipAmount,
      scholarshipNote,
      courseFee,
      monthlyFee,
      paidAmount,
      admissionDate,
      paymentMethod,
      transactionId,
      notes,
    } = req.body;

    if (!batchId || !name) {
      return res.status(400).json({
        success: false,
        message: "Batch ID এবং Student Name আবশ্যক!",
      });
    }

    const coll = getCollection("batch_students");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    // ✅ Auto calculate
    const fee = Number(courseFee) || 0;
    const scholarship = Number(scholarshipAmount) || 0;
    const paid = Number(paidAmount) || 0;
    const due = Math.max(fee - scholarship - paid, 0);

    // ✅ Auto status
    let autoStatus = paymentStatus || "Unpaid";
    if (!paymentStatus) {
      if (due === 0 && paid > 0) autoStatus = "Paid";
      else if (paid > 0) autoStatus = "Partial";
      else autoStatus = "Unpaid";
    }

    // ✅ First payment history entry
    const paidMonths = [];
    if (paid > 0) {
      paidMonths.push({
        _id: "pay_" + Date.now(),
        month: admissionDate
          ? String(admissionDate).slice(0, 7)
          : new Date().toISOString().slice(0, 7),
        amount: paid,
        method: paymentMethod || "Cash",
        note: notes || "Initial payment",
        paidAt: new Date().toISOString(),
      });
    }

    const newStudent = {
      batchId: String(batchId),
      name: String(name).trim(),
      studentId:
        (studentId && String(studentId).trim()) ||
        `S-${Date.now().toString().slice(-5)}`,
      phone: phone || "",
      country: country || "BD",
      course: course || "",
      password: password || "",

      // ⬇️ নতুন
      scholarshipAmount: scholarship,
      scholarshipNote: scholarshipNote || "",
      courseFee: fee,
      monthlyFee: Number(monthlyFee) || fee,
      paidAmount: paid,
      dueAmount: due,
      paymentStatus: autoStatus,
      paymentMethod: paymentMethod || "",
      transactionId: transactionId || "",
      notes: notes || "",
      admissionDate: admissionDate || new Date().toISOString(),

      status: "Active",
      paidMonths,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await coll.insertOne(newStudent);
    console.log("✅ Batch student created:", result.insertedId);
    console.log(
      `💰 Fee: ${fee} | Scholarship: ${scholarship} | Paid: ${paid} | Due: ${due}`,
    );

    res.status(201).json({
      success: true,
      message: "✅ Student added with auto-calculated due!",
      student: { ...newStudent, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ FIND batch_student by identifiers (for student dashboard)
app.get("/api/batch-students/find-by-identifier", async (req, res) => {
  try {
    const { id, studentId, phone, name } = req.query;
    console.log("📥 GET /api/batch-students/find-by-identifier");
    console.log("   id:", id || "-", "| studentId:", studentId || "-");

    const coll = getCollection("batch_students");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const orConditions = [];

    // (a) MongoDB _id
    if (id && String(id).trim()) {
      try {
        orConditions.push({ _id: new ObjectId(id.trim()) });
      } catch (e) {}
    }

    // (b) studentId — exact + case insensitive
    if (studentId && String(studentId).trim()) {
      const sid = String(studentId).trim();
      orConditions.push({ studentId: sid });
      orConditions.push({ studentId: { $regex: `^${sid}$`, $options: "i" } });
    }

    // (c) phone — exact + last 11
    if (phone && String(phone).trim()) {
      const p = String(phone).trim();
      orConditions.push({ phone: p });
      const last11 = p.replace(/\D/g, "").slice(-11);
      if (last11.length === 11) {
        orConditions.push({ phone: { $regex: last11 + "$" } });
      }
    }

    // (d) name
    if (name && String(name).trim()) {
      orConditions.push({
        name: { $regex: `^${String(name).trim()}$`, $options: "i" },
      });
    }

    if (orConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No search criteria provided",
      });
    }

    const found = await coll.findOne({ $or: orConditions });
    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Student not found in batch_students",
      });
    }

    // ✅ Also fetch the parent batch
    const batchesData = readBatchesData();
    const parentBatch = (batchesData.batches || []).find(
      (b) => String(b._id) === String(found.batchId),
    );

    console.log("✅ Found:", found.name, "| Batch:", parentBatch?.name);

    res.status(200).json({
      success: true,
      student: {
        ...found,
        batchName: parentBatch?.name || "",
        batchCourse: parentBatch?.course || "",
        batchTeacher: parentBatch?.teacher || "",
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ✅ ADD PAYMENT — Student pays → update batch_students
// Frontend Online Payment থেকে call হবে
// ============================================================
app.post("/api/batch-students/add-payment", async (req, res) => {
  try {
    console.log("════════════════════════════════════════");
    console.log("📥 POST /api/batch-students/add-payment");
    console.log("📝 Body:", req.body);

    const { id, studentId, phone, name, amount, method, note, month } =
      req.body;

    // ✅ Validate amount
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "সঠিক amount দিন (0 এর বেশি)",
      });
    }

    const coll = getCollection("batch_students");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    // ✅ Multi-identifier search (same as Academic)
    const orConditions = [];

    if (id && String(id).trim()) {
      try {
        orConditions.push({ _id: new ObjectId(String(id).trim()) });
      } catch (e) {}
      orConditions.push({ studentDbId: String(id).trim() });
    }

    if (studentId && String(studentId).trim()) {
      const sid = String(studentId).trim();
      orConditions.push({ studentId: sid });
      orConditions.push({
        studentId: { $regex: `^${sid}$`, $options: "i" },
      });
    }

    if (phone && String(phone).trim()) {
      const p = String(phone).trim();
      orConditions.push({ phone: p });
      const last11 = p.replace(/\D/g, "").slice(-11);
      if (last11.length === 11) {
        orConditions.push({ phone: { $regex: last11 + "$" } });
      }
    }

    if (name && String(name).trim() && name !== "Student") {
      const nm = String(name).trim();
      orConditions.push({ name: { $regex: `^${nm}$`, $options: "i" } });
    }

    if (orConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No search criteria provided",
      });
    }

    // ✅ Find student
    const student = await coll.findOne({ $or: orConditions });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in batch_students",
      });
    }

    console.log(`✅ Found student: ${student.name} (${student._id})`);

    // ✅ Build payment record
    const paymentRecord = {
      _id: "pay_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      month: month || new Date().toISOString().slice(0, 7),
      amount: payAmount,
      method: method || "bKash",
      note: note || "",
      paidAt: new Date().toISOString(),
    };

    // ✅ Add to paidMonths
    const updatedPaidMonths = [...(student.paidMonths || []), paymentRecord];

    // ✅ Recalculate paid/due
    const totalPaid = updatedPaidMonths.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const fee = Number(student.courseFee) || Number(student.monthlyFee) || 0;
    const scholarship = Number(student.scholarshipAmount) || 0;
    const due = Math.max(fee - scholarship - totalPaid, 0);

    // ✅ Auto payment status
    let autoStatus = "Unpaid";
    if (due === 0 && totalPaid > 0) autoStatus = "Paid";
    else if (totalPaid > 0) autoStatus = "Partial";

    // ✅ Update student
    await coll.updateOne(
      { _id: student._id },
      {
        $set: {
          paidMonths: updatedPaidMonths,
          paidAmount: totalPaid,
          dueAmount: due,
          paymentStatus: autoStatus,
          paymentMethod: method || student.paymentMethod || "",
          updatedAt: new Date(),
        },
      },
    );

    const updated = await coll.findOne({ _id: student._id });

    console.log(
      `💰 Payment added: ৳${payAmount} | Total Paid: ৳${totalPaid} | Due: ৳${due} | Status: ${autoStatus}`,
    );
    console.log("════════════════════════════════════════");

    res.status(201).json({
      success: true,
      message: `✅ Payment of ৳${payAmount} recorded successfully!`,
      payment: paymentRecord,
      student: {
        _id: updated._id,
        name: updated.name,
        paidAmount: updated.paidAmount,
        dueAmount: updated.dueAmount,
        paymentStatus: updated.paymentStatus,
        paidMonths: updated.paidMonths,
      },
    });
  } catch (error) {
    console.error("❌ Payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// ✅ STUDENT FULL PROFILE — Multi-source unified endpoint
// Academic এর মতো multi-identifier search করে সম্পূর্ণ data দেয়
// ============================================================
app.get("/api/student/full-profile", async (req, res) => {
  try {
    const { id, studentId, phone, name, username, course } = req.query;

    console.log("════════════════════════════════════════");
    console.log("📥 GET /api/student/full-profile");
    console.log("   id:", id || "-", "| studentId:", studentId || "-");
    console.log("   phone:", phone || "-", "| name:", name || "-");
    console.log("   username:", username || "-");

    let studentData = null;
    let sourceCollection = null;

    // ─── STEP 1: batch_students collection এ খোঁজো ───
    const bsColl = getCollection("batch_students");
    if (bsColl) {
      const orConditions = [];

      if (id && String(id).trim()) {
        try {
          orConditions.push({ _id: new ObjectId(String(id).trim()) });
        } catch (e) {}
      }

      if (studentId && String(studentId).trim()) {
        const sid = String(studentId).trim();
        orConditions.push({ studentId: sid });
        orConditions.push({
          studentId: { $regex: `^${sid}$`, $options: "i" },
        });
      }

      if (phone && String(phone).trim()) {
        const p = String(phone).trim();
        orConditions.push({ phone: p });
        const last11 = p.replace(/\D/g, "").slice(-11);
        if (last11.length === 11) {
          orConditions.push({ phone: { $regex: last11 + "$" } });
        }
      }

      if (name && String(name).trim() && name !== "Student") {
        const nm = String(name).trim();
        orConditions.push({
          name: { $regex: `^${nm}$`, $options: "i" },
        });
        const firstName = nm.split(/\s+/)[0];
        if (firstName && firstName.length > 3) {
          orConditions.push({
            name: { $regex: `^${firstName}`, $options: "i" },
          });
        }
      }

      if (orConditions.length > 0) {
        const found = await bsColl.findOne({ $or: orConditions });
        if (found) {
          studentData = found;
          sourceCollection = "batch_students";
          console.log(`✅ Found in batch_students: ${found.name}`);
        }
      }
    }

    // ─── STEP 2: না পেলে students collection ───
    if (!studentData) {
      const sColl = getCollection("students");
      if (sColl) {
        const orConditions = [];
        if (id && String(id).trim()) {
          try {
            orConditions.push({ _id: new ObjectId(String(id).trim()) });
          } catch (e) {}
        }
        if (studentId && String(studentId).trim()) {
          orConditions.push({
            studentId: {
              $regex: `^${String(studentId).trim()}$`,
              $options: "i",
            },
          });
        }
        if (phone && String(phone).trim()) {
          orConditions.push({ phone: String(phone).trim() });
        }
        if (username && String(username).trim()) {
          orConditions.push({ username: String(username).trim() });
        }

        if (orConditions.length > 0) {
          const found = await sColl.findOne({ $or: orConditions });
          if (found) {
            studentData = found;
            sourceCollection = "students";
            console.log(`✅ Found in students: ${found.name}`);
          }
        }
      }
    }

    // ─── STEP 3: না পেলে basic_tazweed / najera ───
    if (!studentData) {
      for (const collName of [
        "basic_tazweed_students",
        "najera_batch_students",
      ]) {
        const c = getCollection(collName);
        if (!c) continue;
        const orConditions = [];
        if (id && String(id).trim()) {
          try {
            orConditions.push({ _id: new ObjectId(String(id).trim()) });
          } catch (e) {}
        }
        if (studentId && String(studentId).trim()) {
          orConditions.push({ studentId: String(studentId).trim() });
        }
        if (phone && String(phone).trim()) {
          orConditions.push({ phone: String(phone).trim() });
        }
        if (orConditions.length > 0) {
          const found = await c.findOne({ $or: orConditions });
          if (found) {
            studentData = found;
            sourceCollection = collName;
            console.log(`✅ Found in ${collName}: ${found.name}`);
            break;
          }
        }
      }
    }

    if (!studentData) {
      console.log("❌ Student not found in any collection");
      return res.status(404).json({
        success: false,
        message: "Student not found in any collection",
      });
    }

    // ─── STEP 4: Batch info (batch_students হলে) ───
    let batchInfo = null;
    let batchClasses = [];

    if (sourceCollection === "batch_students" && studentData.batchId) {
      const batchesData = readBatchesData();
      batchInfo = (batchesData.batches || []).find(
        (b) => String(b._id) === String(studentData.batchId),
      );

      const classesColl = getCollection("batch_classes");
      if (classesColl) {
        batchClasses = await classesColl
          .find({ batchId: String(studentData.batchId) })
          .sort({ createdAt: 1 })
          .toArray();
      }
    }

    // ─── STEP 5: Payment calculation ───
    const fromMonths = (studentData.paidMonths || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const paid =
      fromMonths > 0 ? fromMonths : Number(studentData.paidAmount) || 0;
    const fee =
      Number(studentData.courseFee) || Number(studentData.monthlyFee) || 0;
    const scholarship = Number(studentData.scholarshipAmount) || 0;
    const due = Math.max(fee - scholarship - paid, 0);

    // Auto payment status
    let autoStatus = studentData.paymentStatus;
    if (!autoStatus) {
      if (due === 0 && paid > 0) autoStatus = "Paid";
      else if (paid > 0) autoStatus = "Partial";
      else autoStatus = "Unpaid";
    }

    const { password: _, ...safeStudent } = studentData;

    console.log(
      `✅ Final → ${studentData.name} | Fee: ${fee} | Paid: ${paid} | Due: ${due}`,
    );
    console.log("════════════════════════════════════════");

    res.status(200).json({
      success: true,
      source: sourceCollection,
      student: {
        ...safeStudent,
        paidAmount: paid,
        dueAmount: due,
        courseFee: fee,
        scholarshipAmount: scholarship,
        paymentStatus: autoStatus,
        // Batch info
        batchName: batchInfo?.name || "",
        batchCourse: batchInfo?.course || "",
        batchTeacher: batchInfo?.teacher || "",
        batchSchedule: batchInfo?.schedule || "",
        batchStatus: batchInfo?.status || "",
        batchClasses,
      },
    });
  } catch (error) {
    console.error("❌ Full profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// ✅ STUDENT ACADEMIC BY BATCH — Query param version (multi-identifier)
// =============================================

// =============================================
// ✅ BATCH VIDEOS — MongoDB Collection (batch_videos)
// =============================================

// ✅ CREATE video
app.post("/api/batch-videos/create", async (req, res) => {
  try {
    console.log("📥 POST /api/batch-videos/create");
    console.log("📝 Body:", req.body);

    const { batchId, title, url } = req.body;

    if (!batchId || !title || !url) {
      return res.status(400).json({
        success: false,
        message: "Batch ID, Title এবং URL আবশ্যক!",
      });
    }

    const coll = getCollection("batch_videos");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const newVideo = {
      batchId: String(batchId),
      title: String(title).trim(),
      url: String(url).trim(),
      addedAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await coll.insertOne(newVideo);
    console.log("✅ Video created:", result.insertedId);

    res.status(201).json({
      success: true,
      message: "✅ Video added successfully!",
      video: { ...newVideo, _id: result.insertedId },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET all videos (filter by batchId)
app.get("/api/batch-videos/all", async (req, res) => {
  try {
    const { batchId } = req.query;
    console.log("📥 GET /api/batch-videos/all | batchId:", batchId || "All");

    const coll = getCollection("batch_videos");
    if (!coll) {
      return res.status(500).json({ success: false, message: "DB not found!" });
    }

    const query = batchId ? { batchId: String(batchId) } : {};
    const videos = await coll.find(query).sort({ addedAt: -1 }).toArray();

    console.log(`✅ Found ${videos.length} videos`);
    res.status(200).json({ success: true, total: videos.length, videos });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE video
app.put("/api/batch-videos/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PUT /api/batch-videos/update/", id);

    const coll = getCollection("batch_videos");
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;
    delete updateData.batchId;

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    const updated = await coll.findOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, video: updated });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE single video
app.delete("/api/batch-videos/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 DELETE /api/batch-videos/delete/", id);

    const coll = getCollection("batch_videos");
    const result = await coll.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found!" });
    }

    res.status(200).json({ success: true, message: "✅ Deleted!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE all videos of a batch
app.delete("/api/batch-videos/delete-by-batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;
    const coll = getCollection("batch_videos");
    const result = await coll.deleteMany({ batchId: String(batchId) });
    console.log(
      `✅ Deleted ${result.deletedCount} videos for batch ${batchId}`,
    );
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
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
