const User = require("../models/User");
const jwt = require("jsonwebtoken");

// টোকেন জেনারেট ফাংশন
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    ইউজার রেজিস্টার
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // চেক করুন ইউজার ইতিমধ্যে আছে কিনা
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।",
      });
    }

    // নতুন ইউজার তৈরি
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
    });

    // টোকেন তৈরি
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    ইউজার লগইন
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ইমেইল ও পাসওয়ার্ড চেক করুন
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "ইমেইল এবং পাসওয়ার্ড দিন।",
      });
    }

    // ইউজার খুঁজে বের করুন (পাসওয়ার্ড সহ)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
      });
    }

    // পাসওয়ার্ড মিলিয়ে দেখুন
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
      });
    }

    // টোকেন তৈরি
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    বর্তমান ইউজারের তথ্য
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("enrolledCourses")
      .populate("createdCourses");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
