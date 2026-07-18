const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");

// @desc    অ্যাসাইনমেন্ট সাবমিট করা (শুধু স্টুডেন্ট)
// @route   POST /api/assignments/:id/submit
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "অ্যাসাইনমেন্ট পাওয়া যায়নি।",
      });
    }

    // চেক করুন এই স্টুডেন্ট কোর্সে এনরোল করেছে কিনা
    const course = await Course.findById(assignment.course);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সে এনরোল করেননি।",
      });
    }

    const { fileUrl } = req.body; // ফ্রন্টএন্ড থেকে ফাইলের ইউআরল পাঠাবে

    const submission = await Submission.create({
      assignment: assignment._id,
      student: req.user.id,
      fileUrl,
    });

    res.status(201).json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    অ্যাসাইনমেন্ট গ্রেড দেওয়া (শুধু টিচার)
// @route   PUT /api/assignments/submission/:id/grade
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.id).populate(
      "assignment",
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "সাবমিশন পাওয়া যায়নি।",
      });
    }

    // চেক করুন এই টিচারই কোর্সের ইনস্ট্রাক্টর কিনা
    const course = await Course.findById(submission.assignment.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সের ইনস্ট্রাক্টর নন।",
      });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = "graded";
    await submission.save();

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
