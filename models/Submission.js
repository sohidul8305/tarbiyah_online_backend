const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true, // আপলোড করা ফাইলের লিংক
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: String,
    status: {
      type: String,
      enum: ["pending", "graded", "resubmit"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Submission", submissionSchema);
