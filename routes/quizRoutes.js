const express = require("express");
const router = express.Router();
const { submitQuiz } = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/auth");

router.post("/:id/submit", protect, authorize("student"), submitQuiz);

module.exports = router;
