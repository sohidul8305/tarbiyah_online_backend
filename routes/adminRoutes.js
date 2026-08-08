const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getCollection } = require("../config/db");
const { ObjectId } = require("mongodb");

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const usersCollection = getCollection("users");
    const coursesCollection = getCollection("courses");
    const assignmentsCollection = getCollection("assignments");
    const quizzesCollection = getCollection("quizzes");

    const [totalUsers, totalCourses, totalAssignments, totalQuizzes] =
      await Promise.all([
        usersCollection.countDocuments(),
        coursesCollection.countDocuments(),
        assignmentsCollection.countDocuments(),
        quizzesCollection.countDocuments(),
      ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalAssignments,
        totalQuizzes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const usersCollection = getCollection("users");
    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = getCollection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    if (error.name === "BSONError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
router.put("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid role (student, teacher, admin)",
      });
    }

    const usersCollection = getCollection("users");

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User role updated successfully",
    });
  } catch (error) {
    if (error.name === "BSONError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
router.put("/users/:id/toggle-active", async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = getCollection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newStatus = !user.isActive;

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: newStatus,
          updatedAt: new Date(),
        },
      },
    );

    res.json({
      success: true,
      message: `User ${newStatus ? "activated" : "deactivated"} successfully`,
      isActive: newStatus,
    });
  } catch (error) {
    if (error.name === "BSONError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get all courses (admin view)
// @route   GET /api/admin/courses
router.get("/courses", async (req, res) => {
  try {
    const coursesCollection = getCollection("courses");
    const courses = await coursesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Approve course
// @route   PUT /api/admin/courses/:id/approve
router.put("/courses/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const coursesCollection = getCollection("courses");

    const course = await coursesCollection.findOne({ _id: new ObjectId(id) });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await coursesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isApproved: true,
          isPublished: true,
          updatedAt: new Date(),
        },
      },
    );

    res.json({
      success: true,
      message: "Course approved and published successfully",
    });
  } catch (error) {
    if (error.name === "BSONError") {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
