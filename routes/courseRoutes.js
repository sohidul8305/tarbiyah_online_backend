const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  enrollCourse,
} = require("../controllers/courseController");

router.get("/", getAllCourses);
router.get("/:id", getCourseDetails);
router.post("/", protect, authorize("teacher", "admin"), createCourse);
router.post("/:id/enroll", protect, authorize("student"), enrollCourse);

module.exports = router;
