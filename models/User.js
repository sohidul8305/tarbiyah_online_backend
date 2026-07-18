const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "নাম দেওয়া আবশ্যক"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "ইমেইল দেওয়া আবশ্যক"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "সঠিক ইমেইল দিন"],
    },
    password: {
      type: String,
      required: [true, "পাসওয়ার্ড দেওয়া আবশ্যক"],
      minlength: 6,
      select: false, // কুয়েরি করলে পাসওয়ার্ড দেখাবে না
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    // স্টুডেন্টের জন্য বিশেষ ফিল্ড
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
    // টিচারের জন্য বিশেষ ফিল্ড
    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // পাসওয়ার্ড রিসেটের জন্য (ভবিষ্যতে কাজে লাগবে)
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt অটো অ্যাড হবে
  },
);

// পাসওয়ার্ড সেভ হওয়ার আগে হ্যাশ করা
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// পাসওয়ার্ড মিলানোর মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
