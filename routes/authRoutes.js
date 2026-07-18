const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// পাবলিক রাউটস
router.post("/register", register);
router.post("/login", login);

// প্রাইভেট রাউটস (লগইন লাগবে)
router.get("/me", protect, getMe);

module.exports = router;
