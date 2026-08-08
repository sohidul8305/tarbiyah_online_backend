const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getStudentDashboard,
  getMyCourses,
  enrollCourse,
  getCourseLessons,
  completeLesson,
  submitAssignment,
  getMyAssignments,
  getMySubmissions,
  submitQuiz,
  getMyQuizzes,
  getProgress,
} = require("../controllers/studentController");

// সব রাউটে লগইন এবং স্টুডেন্ট রোল চেক
router.use(protect);
router.use(authorize("student"));

// Dashboard
router.get("/dashboard", getStudentDashboard);

// Courses
router.get("/courses", getMyCourses);
router.post("/courses/:id/enroll", enrollCourse);

// Lessons
router.get("/courses/:courseId/lessons", getCourseLessons);
router.put("/lessons/:id/complete", completeLesson);

// Assignments
router.get("/assignments", getMyAssignments);
router.post("/assignments/:id/submit", submitAssignment);
router.get("/submissions", getMySubmissions);

// Quizzes
router.get("/quizzes", getMyQuizzes);
router.post("/quizzes/:id/submit", submitQuiz);

// Progress
router.get("/progress", getProgress);

module.exports = router;
