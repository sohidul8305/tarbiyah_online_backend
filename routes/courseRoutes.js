const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getTeacherCourses,
  getTeacherStats,
  updateCourse,
  deleteCourse,
  enrollCourse,
} = require("../controllers/courseController");

// ✅ Public Routes (No Auth Required)
router.get("/", getAllCourses);
router.get("/:id", getCourseDetails);

// ✅ Teacher Routes (No Auth Required - for testing)
router.get("/teacher/:teacherId", getTeacherCourses);
router.get("/stats/:teacherId", getTeacherStats);

// ✅ CRUD Routes - গুরুত্বপূর্ণ: POST route ঠিক আছে কিনা চেক করুন
router.post("/create", createCourse);
router.put("/update/:id", updateCourse);
router.delete("/delete/:id", deleteCourse);

// ✅ Enroll Route
router.post("/:id/enroll", enrollCourse);

module.exports = router;
