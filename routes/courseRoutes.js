const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  enrollCourse,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/auth");

// পাবলিক রাউটস
router.get("/", getAllCourses);
router.get("/:id", getCourseDetails);

// প্রাইভেট রাউটস
router.post("/", protect, authorize("teacher", "admin"), createCourse);
router.post("/:id/enroll", protect, authorize("student"), enrollCourse);

module.exports = router;
