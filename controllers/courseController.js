const Course = require("../models/Course");
const User = require("../models/User");

exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price, thumbnail } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      price,
      thumbnail,
      instructor: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdCourses: course._id },
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate(
      "instructor",
      "name email",
    );

    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("lessons")
      .populate("assignments")
      .populate("quizzes");

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (user.enrolledCourses.includes(course._id)) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled" });
    }

    user.enrolledCourses.push(course._id);
    await user.save();

    course.enrolledStudents.push(user._id);
    await course.save();

    res.status(200).json({ success: true, message: "Enrolled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
