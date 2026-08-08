const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// ===================== CREATE LESSON =====================
exports.createLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, duration, order, isFree } = req.body;
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "কোর্স পাওয়া যায়নি।",
      });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সের ইনস্ট্রাক্টর নন।",
      });
    }

    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      duration,
      order: order || course.lessons.length + 1,
      course: courseId,
      isFree: isFree || false,
    });

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({
      success: true,
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== GET LESSON =====================
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate(
      "course",
      "title instructor",
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "লেসন পাওয়া যায়নি।",
      });
    }

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== UPDATE LESSON =====================
exports.updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "লেসন পাওয়া যায়নি।",
      });
    }

    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সের ইনস্ট্রাক্টর নন।",
      });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== DELETE LESSON =====================
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "লেসন পাওয়া যায়নি।",
      });
    }

    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সের ইনস্ট্রাক্টর নন।",
      });
    }

    course.lessons = course.lessons.filter(
      (l) => l.toString() !== lesson._id.toString(),
    );
    await course.save();
    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: "লেসন ডিলিট করা হয়েছে।",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
