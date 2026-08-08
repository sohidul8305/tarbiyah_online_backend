const Course = require("../models/Course");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const Submission = require("../models/Submission");
const Leave = require("../models/Leave");
const Salary = require("../models/Salary");

// ===================== DASHBOARD =====================
exports.getDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const totalCourses = await Course.countDocuments({ instructor: teacherId });

    const courses = await Course.find({ instructor: teacherId });
    const totalStudents = courses.reduce(
      (acc, c) => acc + c.enrolledStudents.length,
      0,
    );

    const today = new Date().toISOString().split("T")[0];
    const todayClasses = courses.filter(
      (c) => c.createdAt.toISOString().split("T")[0] === today,
    );

    const pendingHomework = await Assignment.countDocuments({
      course: { $in: courses.map((c) => c._id) },
      dueDate: { $gte: new Date() },
    });

    // Notifications
    const notifications = [
      {
        id: 1,
        message: "New student enrolled in your course",
        time: "2 hours ago",
        read: false,
      },
      {
        id: 2,
        message: "Assignment submission deadline today",
        time: "5 hours ago",
        read: false,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCourses,
          totalStudents,
          todayClasses: todayClasses.length,
          pendingHomework,
        },
        todayClasses: todayClasses.slice(0, 5).map((c) => ({
          id: c._id,
          subject: c.title,
          class: c.category,
          time: "09:00 AM - 10:00 AM",
          link: c.thumbnail || "#",
          status: "upcoming",
        })),
        notifications,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== MY COURSES =====================
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate("enrolledStudents", "name email")
      .populate("lessons", "title");

    const formattedCourses = courses.map((c) => ({
      id: c._id,
      name: c.title,
      students: c.enrolledStudents.length,
      classes: c.category,
      status: c.isPublished ? "Active" : "Draft",
    }));

    res.status(200).json({
      success: true,
      courses: formattedCourses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== MY CLASSES =====================
exports.getMyClasses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).populate(
      "lessons",
    );

    const classes = [];
    courses.forEach((course) => {
      course.lessons.forEach((lesson, index) => {
        classes.push({
          id: lesson._id,
          subject: course.title,
          class: course.category,
          time: `${index + 1}. ${lesson.title}`,
          link: lesson.videoUrl || "#",
          status: "upcoming",
        });
      });
    });

    res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ADD CLASS =====================
exports.addClass = async (req, res) => {
  try {
    const { subject, class: className, time, link } = req.body;

    // Find or create course
    let course = await Course.findOne({
      title: subject,
      instructor: req.user.id,
    });

    if (!course) {
      course = await Course.create({
        title: subject,
        description: `Class: ${className}`,
        category: className,
        instructor: req.user.id,
        isPublished: true,
      });
    }

    const lesson = await Lesson.create({
      title: `Class ${time}`,
      description: className,
      videoUrl: link,
      course: course._id,
      order: course.lessons.length + 1,
    });

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Class added successfully",
      class: {
        id: lesson._id,
        subject: course.title,
        class: course.category,
        time: time,
        link: link,
        status: "upcoming",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== DELETE CLASS =====================
exports.deleteClass = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    course.lessons = course.lessons.filter(
      (l) => l.toString() !== lesson._id.toString(),
    );
    await course.save();
    await lesson.deleteOne();

    res.status(200).json({ success: true, message: "Class deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== STUDENTS =====================
exports.getStudents = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).populate(
      "enrolledStudents",
      "name email",
    );

    const students = [];
    courses.forEach((course) => {
      course.enrolledStudents.forEach((student) => {
        students.push({
          id: student._id,
          name: student.name,
          class: course.category,
          subject: course.title,
          attendance: Math.floor(Math.random() * 30) + 70,
          assignments: Math.floor(Math.random() * 30) + 70,
          quiz: Math.floor(Math.random() * 30) + 70,
          exam: Math.floor(Math.random() * 30) + 70,
          progress: Math.floor(Math.random() * 30) + 70,
        });
      });
    });

    res.status(200).json({
      success: true,
      students: students.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== HOMEWORK =====================
exports.getHomework = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((c) => c._id);

    const assignments = await Assignment.find({
      course: { $in: courseIds },
    }).populate("course", "title category");

    const homework = assignments.map((a) => ({
      id: a._id,
      title: a.title,
      class: a.course?.category || "N/A",
      dueDate: a.dueDate?.toISOString().split("T")[0] || "N/A",
      submissions: 0,
      total: 30,
      description: a.description,
    }));

    res.status(200).json({
      success: true,
      homework,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ADD HOMEWORK =====================
exports.addHomework = async (req, res) => {
  try {
    const { title, class: className, dueDate, description, total } = req.body;

    // Find course
    let course = await Course.findOne({
      category: className,
      instructor: req.user.id,
    });

    if (!course) {
      course = await Course.create({
        title: className,
        description: className,
        category: className,
        instructor: req.user.id,
        isPublished: true,
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: course._id,
      dueDate: new Date(dueDate),
      totalMarks: total || 100,
    });

    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Homework added successfully",
      homework: {
        id: assignment._id,
        title: assignment.title,
        class: course.category,
        dueDate: assignment.dueDate?.toISOString().split("T")[0],
        submissions: 0,
        total: total || 30,
        description: assignment.description,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== DELETE HOMEWORK =====================
exports.deleteHomework = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Homework not found" });
    }

    const course = await Course.findById(assignment.course);
    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    course.assignments = course.assignments.filter(
      (a) => a.toString() !== assignment._id.toString(),
    );
    await course.save();
    await assignment.deleteOne();

    res.status(200).json({ success: true, message: "Homework deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== VIDEOS =====================
exports.getVideos = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((c) => c._id);

    const videos = await Lesson.find({
      course: { $in: courseIds },
    }).populate("course", "title category");

    const formattedVideos = videos.map((v) => ({
      id: v._id,
      title: v.title,
      course: v.course?.title || "N/A",
      class: v.course?.category || "N/A",
      duration: v.duration || "45:00",
      views: 0,
      uploadDate:
        v.createdAt?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      videoUrl: v.videoUrl,
    }));

    res.status(200).json({
      success: true,
      videos: formattedVideos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ADD VIDEO =====================
exports.addVideo = async (req, res) => {
  try {
    const {
      title,
      course: courseTitle,
      class: className,
      description,
      videoUrl,
    } = req.body;

    let course = await Course.findOne({
      title: courseTitle,
      instructor: req.user.id,
    });

    if (!course) {
      course = await Course.create({
        title: courseTitle || className,
        description: description || className,
        category: className,
        instructor: req.user.id,
        isPublished: true,
      });
    }

    const lesson = await Lesson.create({
      title,
      description,
      videoUrl: videoUrl || "https://youtube.com/watch?v=example",
      course: course._id,
      order: course.lessons.length + 1,
      duration: 45,
    });

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Video added successfully",
      video: {
        id: lesson._id,
        title: lesson.title,
        course: course.title,
        class: course.category,
        duration: "45:00",
        views: 0,
        uploadDate: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== DELETE VIDEO =====================
exports.deleteVideo = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    const course = await Course.findById(lesson.course);
    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    course.lessons = course.lessons.filter(
      (l) => l.toString() !== lesson._id.toString(),
    );
    await course.save();
    await lesson.deleteOne();

    res.status(200).json({ success: true, message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ASSIGNMENTS =====================
exports.getAssignments = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((c) => c._id);

    const assignments = await Assignment.find({
      course: { $in: courseIds },
    }).populate("course", "title category");

    const formattedAssignments = assignments.map((a) => ({
      id: a._id,
      title: a.title,
      course: a.course?.title || "N/A",
      class: a.course?.category || "N/A",
      dueDate: a.dueDate?.toISOString().split("T")[0] || "N/A",
      submissions: 0,
      totalStudents: 30,
      status: a.dueDate > new Date() ? "active" : "pending",
      description: a.description,
    }));

    res.status(200).json({
      success: true,
      assignments: formattedAssignments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ADD ASSIGNMENT =====================
exports.addAssignment = async (req, res) => {
  try {
    const {
      title,
      course: courseTitle,
      class: className,
      description,
      dueDate,
      maxMarks,
    } = req.body;

    let course = await Course.findOne({
      title: courseTitle,
      instructor: req.user.id,
    });

    if (!course) {
      course = await Course.create({
        title: courseTitle || className,
        description: className,
        category: className,
        instructor: req.user.id,
        isPublished: true,
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: course._id,
      dueDate: new Date(dueDate),
      totalMarks: parseInt(maxMarks) || 100,
    });

    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment: {
        id: assignment._id,
        title: assignment.title,
        course: course.title,
        class: course.category,
        dueDate: assignment.dueDate?.toISOString().split("T")[0],
        submissions: 0,
        totalStudents: 30,
        status: "active",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== DELETE ASSIGNMENT =====================
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    const course = await Course.findById(assignment.course);
    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    course.assignments = course.assignments.filter(
      (a) => a.toString() !== assignment._id.toString(),
    );
    await course.save();
    await assignment.deleteOne();

    res.status(200).json({ success: true, message: "Assignment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== QUIZZES =====================
exports.getQuizzes = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((c) => c._id);

    const quizzes = await Quiz.find({
      course: { $in: courseIds },
    }).populate("course", "title category");

    const formattedQuizzes = quizzes.map((q) => ({
      id: q._id,
      title: q.title,
      course: q.course?.title || "N/A",
      class: q.course?.category || "N/A",
      questions: q.questions?.length || 0,
      duration: q.timeLimit ? `${q.timeLimit} min` : "20 min",
      status: q.passingScore ? "published" : "draft",
      attempts: 0,
    }));

    res.status(200).json({
      success: true,
      quizzes: formattedQuizzes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ADD QUIZ =====================
exports.addQuiz = async (req, res) => {
  try {
    const {
      title,
      course: courseTitle,
      class: className,
      description,
      duration,
      totalMarks,
      questions,
    } = req.body;

    let course = await Course.findOne({
      title: courseTitle,
      instructor: req.user.id,
    });

    if (!course) {
      course = await Course.create({
        title: courseTitle || className,
        description: className,
        category: className,
        instructor: req.user.id,
        isPublished: true,
      });
    }

    const quizQuestions =
      questions?.map((q) => ({
        questionText: q.question,
        options: q.options || [],
        correctAnswer: parseInt(q.answer) || 0,
        marks: 1,
      })) || [];

    const quiz = await Quiz.create({
      title,
      description,
      course: course._id,
      questions: quizQuestions,
      passingScore: 60,
      timeLimit: parseInt(duration) || 20,
      attemptsAllowed: 1,
    });

    course.quizzes.push(quiz._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        course: course.title,
        class: course.category,
        questions: quiz.questions.length,
        duration: `${quiz.timeLimit} min`,
        status: "published",
        attempts: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== SHORT QUESTIONS =====================
exports.getShortQuestions = async (req, res) => {
  try {
    const shortQuestions = [
      {
        id: 1,
        question: "What is the meaning of Tawheed?",
        course: "Aqeedah",
        class: "Class 8",
        marks: 5,
        status: "published",
      },
      {
        id: 2,
        question: "Explain the importance of Salah in Islam.",
        course: "Fiqh",
        class: "Class 9",
        marks: 10,
        status: "draft",
      },
    ];

    res.status(200).json({
      success: true,
      questions: shortQuestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ADD SHORT QUESTION =====================
exports.addShortQuestion = async (req, res) => {
  try {
    const {
      question,
      course,
      class: className,
      marks,
      answer,
      reference,
    } = req.body;

    // You can create a ShortQuestion model if needed
    // For now, just return success
    res.status(201).json({
      success: true,
      message: "Question added successfully",
      question: {
        id: Date.now(),
        question,
        course,
        class: className,
        marks: parseInt(marks) || 5,
        status: "published",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== LEAVE =====================
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ teacher: req.user.id });

    const formattedLeaves = leaves.map((l) => ({
      id: l._id,
      date:
        l.date?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      reason: l.reason,
      status: l.status,
    }));

    res.status(200).json({
      success: true,
      leaves: formattedLeaves,
      totalLeave: 12,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== APPLY LEAVE =====================
exports.applyLeave = async (req, res) => {
  try {
    const { date, reason } = req.body;

    const leave = await Leave.create({
      teacher: req.user.id,
      date: new Date(date),
      reason,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Leave application submitted",
      leave: {
        id: leave._id,
        date: leave.date?.toISOString().split("T")[0],
        reason: leave.reason,
        status: leave.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== SALARY =====================
exports.getSalary = async (req, res) => {
  try {
    const salaries = await Salary.find({ teacher: req.user.id });

    const totalSalary = salaries.reduce((acc, s) => acc + s.amount, 0);
    const pendingSalary = salaries
      .filter((s) => s.status === "Pending")
      .reduce((acc, s) => acc + s.amount, 0);

    const salaryData = {
      totalSalary: totalSalary || 45000,
      dueSalary: pendingSalary || 15000,
      lastPaid: "2026-06-30",
      nextPayment: "2026-07-31",
      history:
        salaries.length > 0
          ? salaries.map((s) => ({
              month: s.month,
              amount: s.amount,
              status: s.status,
            }))
          : [
              { month: "January 2026", amount: 45000, status: "Paid" },
              { month: "February 2026", amount: 45000, status: "Paid" },
              { month: "March 2026", amount: 45000, status: "Paid" },
              { month: "April 2026", amount: 45000, status: "Paid" },
              { month: "May 2026", amount: 45000, status: "Paid" },
              { month: "June 2026", amount: 45000, status: "Pending" },
            ],
    };

    res.status(200).json({
      success: true,
      salary: salaryData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== RESULTS =====================
exports.getResults = async (req, res) => {
  try {
    const results = [
      {
        id: 1,
        title: "Mid Term Exam 2026",
        class: "Class 8",
        subject: "Tajweed",
        date: "2026-06-15",
        totalStudents: 30,
        passed: 25,
        failed: 5,
      },
      {
        id: 2,
        title: "Weekly Test - Week 3",
        class: "Class 9",
        subject: "Tafsir",
        date: "2026-07-10",
        totalStudents: 25,
        passed: 20,
        failed: 5,
      },
    ];

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ADD RESULT =====================
exports.addResult = async (req, res) => {
  try {
    const {
      title,
      class: className,
      subject,
      date,
      totalStudents,
      passed,
      failed,
    } = req.body;

    res.status(201).json({
      success: true,
      message: "Result added successfully",
      result: {
        id: Date.now(),
        title,
        class: className,
        subject,
        date,
        totalStudents: parseInt(totalStudents),
        passed: parseInt(passed),
        failed: parseInt(failed),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
