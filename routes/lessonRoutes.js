const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");

router.post(
  "/courses/:courseId/lessons",
  protect,
  authorize("teacher", "admin"),
  createLesson,
);
router.get("/lessons/:id", getLesson);
router.put(
  "/lessons/:id",
  protect,
  authorize("teacher", "admin"),
  updateLesson,
);
router.delete(
  "/lessons/:id",
  protect,
  authorize("teacher", "admin"),
  deleteLesson,
);

module.exports = router;
