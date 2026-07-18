const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "কোর্সের শিরোনাম দিন"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "কোর্সের বিবরণ দিন"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "ডিপ্লোমা ইন ইসলামিক স্টুডিজ",
        "তারবিয়াহ আলেমাইয়াহ প্রোগ্রাম",
        "তারবিয়াহ স্টুডিস ফর কিডস",
        "কুরআন ফর এল্ডার্স",
      ],
    },
    thumbnail: {
      type: String, // ছবির ইউআরএল
      default: "default-course.jpg",
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    price: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Course", courseSchema);
