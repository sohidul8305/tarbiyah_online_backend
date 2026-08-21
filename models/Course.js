const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "কোর্সের শিরোনাম দিন"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "কোর্স কোড দিন"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Islamic Studies",
    },
    department: {
      type: String,
      default: "Islamic Studies",
    },
    className: {
      type: String,
      required: [true, "ক্লাস নির্বাচন করুন"],
    },
    teacher: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    duration: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Completed", "Archived"],
      default: "Draft",
    },
    startDate: {
      type: String,
      required: [true, "শুরুর তারিখ দিন"],
    },
    endDate: {
      type: String,
      default: "",
    },
    schedule: {
      type: String,
      default: "",
    },
    students: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
    },
    videos: {
      type: Number,
      default: 0,
    },
    assignments: {
      type: Number,
      default: 0,
    },
    quizzes: {
      type: Number,
      default: 0,
    },
    materials: {
      type: Number,
      default: 0,
    },
    sessions: {
      type: Number,
      default: 0,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ teacherId: 1 });
courseSchema.index({ className: 1 });
courseSchema.index({ status: 1 });

module.exports = mongoose.model("Course", courseSchema);
