const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboard,
  getMyCourses,
  getMyClasses,
  addClass,
  deleteClass,
  getStudents,
  getHomework,
  addHomework,
  deleteHomework,
  getVideos,
  addVideo,
  deleteVideo,
  getAssignments,
  addAssignment,
  deleteAssignment,
  getQuizzes,
  addQuiz,
  getShortQuestions,
  addShortQuestion,
  getLeaves,
  applyLeave,
  getSalary,
  getResults,
  addResult,
} = require("../controllers/teacherController");

router.use(protect);
router.use(authorize("teacher", "admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// Courses
router.get("/courses", getMyCourses);

// Classes
router.get("/classes", getMyClasses);
router.post("/classes", addClass);
router.delete("/classes/:id", deleteClass);

// Students
router.get("/students", getStudents);

// Homework
router.get("/homework", getHomework);
router.post("/homework", addHomework);
router.delete("/homework/:id", deleteHomework);

// Videos
router.get("/videos", getVideos);
router.post("/videos", addVideo);
router.delete("/videos/:id", deleteVideo);

// Assignments
router.get("/assignments", getAssignments);
router.post("/assignments", addAssignment);
router.delete("/assignments/:id", deleteAssignment);

// Quizzes
router.get("/quizzes", getQuizzes);
router.post("/quizzes", addQuiz);

// Short Questions
router.get("/short-questions", getShortQuestions);
router.post("/short-questions", addShortQuestion);

// Leave
router.get("/leaves", getLeaves);
router.post("/leaves", applyLeave);

// Salary
router.get("/salary", getSalary);

// Results
router.get("/results", getResults);
router.post("/results", addResult);

module.exports = router;
