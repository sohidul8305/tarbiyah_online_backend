const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    dueDate: Date,
    totalMarks: {
      type: Number,
      default: 100,
    },
    attachments: [String], // প্রয়োজনে ফাইল
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Assignment", assignmentSchema);
