const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const User = require("../models/User");

// @desc    কুইজ সাবমিট করা (শুধু স্টুডেন্ট)
// @route   POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{questionIndex: 0, selectedOption: 2}]
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "কুইজ পাওয়া যায়নি।",
      });
    }

    // চেক করুন স্টুডেন্ট এনরোল করেছে কিনা
    const course = await Course.findById(quiz.course);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "আপনি এই কোর্সে এনরোল করেননি।",
      });
    }

    // স্কোর ক্যালকুলেশন
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;

    answers.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question && question.correctAnswer === answer.selectedOption) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= quiz.passingScore;

    // ইউজারের প্রগ্রেসে সেভ করুন
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          "progress.$[elem].quizScores": {
            quizId: quiz._id,
            score: score,
            total: totalQuestions,
          },
        },
      },
      {
        arrayFilters: [{ "elem.courseId": quiz.course }],
      },
    );

    res.status(200).json({
      success: true,
      score: score,
      passed: passed,
      correctAnswers,
      totalQuestions,
      passingScore: quiz.passingScore,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
