// controllers/courseController.js

const Course = require("../models/Course");
const User = require("../models/User");

// ✅ Create Course - with better error handling
exports.createCourse = async (req, res) => {
  try {
    console.log("📥 POST /api/courses/create called");
    console.log("📝 Request Body:", req.body);

    const {
      title,
      code,
      description,
      category,
      department,
      className,
      teacher,
      duration,
      status,
      startDate,
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

    // Check if Course model is working
    console.log("🔍 Checking Course model...");

    // Check duplicate code with try-catch
    try {
      const existingCourse = await Course.findOne({ code });
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: "এই কোডটি ইতিমধ্যে ব্যবহার করা হচ্ছে!",
        });
      }
    } catch (findError) {
      console.error("❌ FindOne Error:", findError);
      // যদি findOne fail করে, তবুও proceed করুন
      console.log("⚠️ Could not check duplicate, proceeding anyway...");
    }

    console.log("📝 Creating course...");

    const courseData = {
      title,
      code,
      description: description || "",
      category: category || "Islamic Studies",
      department: department || "Islamic Studies",
      className,
      teacher: teacher || "Ustadh Ahmad",
      teacherId: req.user ? req.user.id : null,
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
      enrolledStudents: [],
      isPublished: status === "Active" ? true : false,
    };

    const course = await Course.create(courseData);
    console.log("✅ Course created successfully:", course._id);

    res.status(201).json({
      success: true,
      message: "কোর্স তৈরি হয়েছে!",
      course,
    });
  } catch (error) {
    console.error("❌ Create Course Error:", error);
    console.error("❌ Error Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "কোর্স তৈরি করতে ব্যর্থ হয়েছে!",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
