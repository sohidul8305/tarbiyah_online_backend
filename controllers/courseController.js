const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const User = require("../models/User");

// @desc    নতুন কোর্স তৈরি (শুধু টিচার/অ্যাডমিন)
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;

    // চেক করুন ইউজার টিচার নাকি অ্যাডমিন
    if (req.user.role === "student") {
      return res.status(403).json({
        success: false,
        message: "শুধু টিচাররা কোর্স তৈরি করতে পারেন।",
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      price,
      instructor: req.user.id,
    });

    // টিচারের প্রোফাইলে কোর্সটি অ্যাড করুন
    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdCourses: course._id },
    });

    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    সব কোর্স পাওয়া
// @route   GET /api/courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name email")
      .select("-lessons -assignments -quizzes"); // সাব ডকুমেন্ট বাদ দিন

    res.status(200).json({
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
};

// @desc    একটি কোর্সের বিস্তারিত (লেসন সহ)
// @route   GET /api/courses/:id
exports.getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("lessons")
      .populate("assignments")
      .populate("quizzes");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "কোর্স পাওয়া যায়নি।",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    কোর্সে এনরোল করা (শুধু স্টুডেন্ট)
// @route   POST /api/courses/:id/enroll
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "কোর্স পাওয়া যায়নি।",
      });
    }

    // চেক করুন ইতিমধ্যে এনরোল করেছে কিনা
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({
        success: false,
        message: "আপনি ইতিমধ্যে এই কোর্সে এনরোল করেছেন।",
      });
    }

    // ইউজারের এনরোলড লিস্টে অ্যাড করুন
    user.enrolledCourses.push(course._id);
    await user.save();

    // কোর্সের এনরোলড স্টুডেন্ট লিস্টে অ্যাড করুন
    course.enrolledStudents.push(user._id);
    await course.save();

    res.status(200).json({
      success: true,
      message: "কোর্সে সফলভাবে এনরোল করা হয়েছে।",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
