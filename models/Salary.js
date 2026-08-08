const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    paidDate: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Salary", salarySchema);
