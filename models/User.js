// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    class: {
      type: String,
      default: "",
    },
    roll: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    guardianName: {
      type: String,
      default: "",
    },
    guardianPhone: {
      type: String,
      default: "",
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    progress: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        completedLessons: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
          },
        ],
        quizScores: [
          {
            quizId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Quiz",
            },
            score: Number,
            total: Number,
          },
        ],
      },
    ],
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", UserSchema);
