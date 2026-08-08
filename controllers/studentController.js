const User = require("../models/User");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Quiz = require("../models/Quiz");

// ===================== STUDENT DASHBOARD =====================
exports.getStudentDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "enrolledCourses",
      populate: {
        path: "instructor",
        select: "name email",
      },
    });

    const totalCourses = user.enrolledCourses.length;

    // প্রগ্রেস ক্যালকুলেশন
    const progressData = user.progress.map((p) => ({
      courseId: p.courseId,
      completedLessons: p.completedLessons.length,
      totalLessons: 0,
      percentage: 0,
    }));

    // পেন্ডিং অ্যাসাইনমেন্ট
    const pendingSubmissions = await Submission.find({
      student: req.user.id,
      status: "pending",
    }).populate("assignment", "title dueDate");

    const notifications = [
      {
        id: 1,
        message: "New assignment posted in your course",
        time: "2 hours ago",
        read: false,
      },
      {
        id: 2,
        message: "Your quiz result is available",
        time: "1 day ago",
        read: true,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        stats: {
          totalCourses,
          completedCourses: 0,
          pendingAssignments: pendingSubmissions.length,
        },
        progress: progressData,
        pendingSubmissions,
        notifications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== MY COURSES =====================
exports.getMyCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "enrolledCourses",
      populate: {
        path: "instructor",
        select: "name email",
      },
    });

    const courses = user.enrolledCourses.map((c) => ({
      id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      instructor: c.instructor?.name || "Unknown",
      thumbnail: c.thumbnail,
      progress: 0,
      totalLessons: c.lessons?.length || 0,
    }));

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== ENROLL COURSE =====================
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

    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({
        success: false,
        message: "আপনি ইতিমধ্যে এই কোর্সে এনরোল করেছেন।",
      });
    }

    user.enrolledCourses.push(course._id);
    await user.save();

    course.enrolledStudents.push(user._id);
    await course.save();

    // প্রগ্রেস তৈরি করুন
    user.progress.push({
      courseId: course._id,
      completedLessons: [],
      quizScores: [],
    });
    await user.save();

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

// ===================== GET COURSE LESSONS =====================
exports.getCourseLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("lessons")
      .populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "কোর্স পাওয়া যায়নি।",
      });
    }

    // চেক করুন স্টুডেন্ট এনরোল করেছে কিনা
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সে এনরোল করেননি।",
      });
    }

    const user = await User.findById(req.user.id);
    const progress = user.progress.find(
      (p) => p.courseId.toString() === course._id.toString(),
    );

    const completedLessonIds =
      progress?.completedLessons.map((id) => id.toString()) || [];

    const lessons = course.lessons.map((lesson) => ({
      id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
      isCompleted: completedLessonIds.includes(lesson._id.toString()),
      isFree: lesson.isFree,
    }));

    res.status(200).json({
      success: true,
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
      },
      lessons,
      progress: {
        completed: completedLessonIds.length,
        total: course.lessons.length,
        percentage:
          course.lessons.length > 0
            ? Math.round(
                (completedLessonIds.length / course.lessons.length) * 100,
              )
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== COMPLETE LESSON =====================
exports.completeLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const user = await User.findById(req.user.id);

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "লেসন পাওয়া যায়নি।",
      });
    }

    let progress = user.progress.find(
      (p) => p.courseId.toString() === lesson.course.toString(),
    );

    if (!progress) {
      progress = {
        courseId: lesson.course,
        completedLessons: [],
        quizScores: [],
      };
      user.progress.push(progress);
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "লেসন কমপ্লিট করা হয়েছে।",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== MY ASSIGNMENTS =====================
exports.getMyAssignments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("enrolledCourses");
    const courseIds = user.enrolledCourses.map((c) => c._id);

    const assignments = await Assignment.find({
      course: { $in: courseIds },
    }).populate("course", "title category");

    const formattedAssignments = assignments.map((a) => ({
      id: a._id,
      title: a.title,
      description: a.description,
      course: a.course?.title || "N/A",
      class: a.course?.category || "N/A",
      dueDate: a.dueDate?.toISOString().split("T")[0] || "N/A",
      totalMarks: a.totalMarks || 100,
      status: a.dueDate > new Date() ? "active" : "pending",
    }));

    res.status(200).json({
      success: true,
      assignments: formattedAssignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== SUBMIT ASSIGNMENT =====================
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "অ্যাসাইনমেন্ট পাওয়া যায়নি।",
      });
    }

    // চেক করুন স্টুডেন্ট এনরোল করেছে কিনা
    const course = await Course.findById(assignment.course);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সে এনরোল করেননি।",
      });
    }

    const { fileUrl } = req.body;

    // চেক করুন ইতিমধ্যে সাবমিট করেছে কিনা
    const existingSubmission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user.id,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "আপনি ইতিমধ্যে এই অ্যাসাইনমেন্ট সাবমিট করেছেন।",
      });
    }

    const submission = await Submission.create({
      assignment: assignment._id,
      student: req.user.id,
      fileUrl,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "অ্যাসাইনমেন্ট সফলভাবে সাবমিট করা হয়েছে।",
      submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== MY SUBMISSIONS =====================
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate("assignment", "title course")
      .populate({
        path: "assignment",
        populate: {
          path: "course",
          select: "title category",
        },
      });

    const formattedSubmissions = submissions.map((s) => ({
      id: s._id,
      assignmentTitle: s.assignment?.title || "N/A",
      course: s.assignment?.course?.title || "N/A",
      fileUrl: s.fileUrl,
      grade: s.grade,
      feedback: s.feedback,
      status: s.status,
      submittedAt: s.submittedAt?.toISOString().split("T")[0] || "N/A",
    }));

    res.status(200).json({
      success: true,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== MY QUIZZES =====================
exports.getMyQuizzes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("enrolledCourses");
    const courseIds = user.enrolledCourses.map((c) => c._id);

    const quizzes = await Quiz.find({
      course: { $in: courseIds },
    }).populate("course", "title category");

    const formattedQuizzes = quizzes.map((q) => ({
      id: q._id,
      title: q.title,
      description: q.description,
      course: q.course?.title || "N/A",
      class: q.course?.category || "N/A",
      questions: q.questions?.length || 0,
      duration: q.timeLimit ? `${q.timeLimit} min` : "20 min",
      passingScore: q.passingScore || 60,
      attemptsAllowed: q.attemptsAllowed || 1,
    }));

    res.status(200).json({
      success: true,
      quizzes: formattedQuizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== SUBMIT QUIZ =====================
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "কুইজ পাওয়া যায়নি।",
      });
    }

    const course = await Course.findById(quiz.course);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সে এনরোল করেননি।",
      });
    }

    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    answers.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question && question.correctAnswer === answer.selectedOption) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= quiz.passingScore;

    // প্রগ্রেস আপডেট
    const user = await User.findById(req.user.id);
    let progress = user.progress.find(
      (p) => p.courseId.toString() === quiz.course.toString(),
    );

    if (progress) {
      progress.quizScores.push({
        quizId: quiz._id,
        score: score,
        total: totalQuestions,
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      score: score,
      passed: passed,
      correctAnswers,
      totalQuestions,
      passingScore: quiz.passingScore,
      message: passed
        ? "কুইজে পাস করেছেন!"
        : "কুইজে ফেল করেছেন। আবার চেষ্টা করুন।",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================== GET PROGRESS =====================
exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "progress.courseId",
        select: "title category",
      })
      .populate({
        path: "progress.completedLessons",
        select: "title",
      });

    const progressData = user.progress.map((p) => ({
      courseId: p.courseId?._id,
      courseTitle: p.courseId?.title || "Unknown",
      category: p.courseId?.category || "Unknown",
      completedLessons: p.completedLessons.length,
      totalLessons: 0, // We'll calculate this
      quizScores: p.quizScores,
      percentage: 0,
    }));

    res.status(200).json({
      success: true,
      progress: progressData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
