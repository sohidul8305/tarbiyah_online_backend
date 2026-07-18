const express = require("express");
const router = express.Router();
const {
  submitAssignment,
  gradeSubmission,
} = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/auth");

router.post("/:id/submit", protect, authorize("student"), submitAssignment);
router.put(
  "/submission/:id/grade",
  protect,
  authorize("teacher", "admin"),
  gradeSubmission,
);

module.exports = router;
