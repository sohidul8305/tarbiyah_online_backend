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
app.post("/api/students/register/student", async (req, res) => {
  try {
    console.log("📥 POST /api/students/register/student called");
    console.log("📝 Request body:", req.body);

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
          "এই ফোন নম্বর অথবা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রেজিস্টার্ড করা আছে!",
      });
    }

    const newStudent = {
      name,
      email,
      phone,
      password,
      course,
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
    console.log("✅ Student registered successfully:", result.insertedId);

    res.status(201).json({
      success: true,
      message:
        "রেজিস্ট্রেশন সফল হয়েছে! অ্যাডমিন অ্যাপ্রুভ করার পর আপনি লগইন করতে পারবেন।",
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

// APPROVE STUDENT
app.put("/api/students/approve/:id", async (req, res) => {
  try {
    console.log("📥 PUT /api/students/approve/:id called");
    const { id } = req.params;
    const { username, password } = req.body;

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
          status: "Active",
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

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

// STUDENT LOGIN
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
// ✅ API Routes
// =============================================
app.use("/api/auth", authRoutes);
// app.use("/api/courses", courseRoutes); // ❌ কমেন্ট করুন
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
