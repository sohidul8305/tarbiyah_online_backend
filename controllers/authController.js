const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/db");

// Helper: Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, className, roll } =
      req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password and phone number",
      });
    }

    const usersCollection = getCollection("users");

    // Check if email exists
    const existingEmail = await usersCollection.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Check if phone exists
    const existingPhone = await usersCollection.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this phone number",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "student",
      address: address || "",
      className: className || "",
      roll: roll || "",
      isVerified: false, // Phone verification pending
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
    };

    const result = await usersCollection.insertOne(newUser);

    const user = {
      _id: result.insertedId,
      name,
      email,
      phone,
      role: newUser.role,
      className: newUser.className,
      roll: newUser.roll,
      isVerified: newUser.isVerified,
    };

    // Generate token
    const token = generateToken(result.insertedId, newUser.role);

    res.status(201).json({
      success: true,
      token,
      user,
      message: "Registration successful! Please verify your phone number.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login User (Email or Phone)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;

    // Validate
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide password",
      });
    }

    // Check if email or phone provided
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone number",
      });
    }

    const usersCollection = getCollection("users");

    // Find user by email or phone
    let user;
    if (email) {
      user = await usersCollection.findOne({ email });
    } else if (phone) {
      user = await usersCollection.findOne({ phone });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. User not found.",
      });
    }

    // Check if active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact admin.",
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } },
    );

    // Generate token
    const token = generateToken(user._id, user.role);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      className: user.className || "",
      roll: user.roll || "",
      isVerified: user.isVerified || false,
      lastLogin: user.lastLogin,
    };

    res.json({
      success: true,
      token,
      user: userData,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Phone Number
// @route   POST /api/auth/verify-phone
// @access  Private
const verifyPhone = async (req, res, next) => {
  try {
    const { phone, verificationCode } = req.body;

    if (!phone || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Please provide phone number and verification code",
      });
    }

    const usersCollection = getCollection("users");

    // In real scenario, you'd check against an OTP table
    // For now, we'll use a simple code: 123456
    if (verificationCode !== "123456") {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    const user = await usersCollection.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number",
      });
    }

    await usersCollection.updateOne(
      { phone },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
      },
    );

    res.json({
      success: true,
      message: "Phone number verified successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne({ _id: req.user._id });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await usersCollection.updateOne(
      { _id: req.user._id },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
    );

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by phone number (For dashboard)
// @route   GET /api/auth/user-by-phone/:phone
// @access  Private (Admin/Teacher)
const getUserByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;

    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne(
      { phone },
      { projection: { password: 0 } },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student by phone (for student dashboard)
// @route   GET /api/auth/student/:phone
// @access  Private
const getStudentByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;

    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne(
      { phone, role: "student" },
      { projection: { password: 0 } },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found with this phone number",
      });
    }

    res.json({
      success: true,
      student: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyPhone,
  updatePassword,
  getUserByPhone,
  getStudentByPhone,
};
