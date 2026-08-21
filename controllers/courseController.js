// routes/courseRoutes.js
const express = require("express");
const router = express.Router();

// ✅ সব route সরাসরি index.js এ আছে
// এখানে শুধু error message দিচ্ছি

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Use /api/courses/teacher/:teacherId to get courses",
    routes: {
      create: "POST /api/courses/create",
      getTeacherCourses: "GET /api/courses/teacher/:teacherId",
      getStats: "GET /api/courses/stats/:teacherId",
      update: "PUT /api/courses/update/:id",
      delete: "DELETE /api/courses/delete/:id",
    },
  });
});

router.get("/:id", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Use /api/courses/teacher/:teacherId to get courses",
  });
});

router.post("/create", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Use POST /api/courses/create directly",
  });
});

router.put("/update/:id", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Use PUT /api/courses/update/:id directly",
  });
});

router.delete("/delete/:id", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Use DELETE /api/courses/delete/:id directly",
  });
});

router.post("/:id/enroll", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Enroll functionality not implemented",
  });
});

// Teacher routes - সরাসরি index.js এ আছে
router.get("/teacher/:teacherId", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Use GET /api/courses/teacher/:teacherId directly",
  });
});

router.get("/stats/:teacherId", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Use GET /api/courses/stats/:teacherId directly",
  });
});

module.exports = router;
