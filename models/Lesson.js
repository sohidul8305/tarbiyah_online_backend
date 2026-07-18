const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    videoUrl: {
      type: String,
      required: true, // ইউটিউব বা ক্লাউডিনারির ইউআরএল
    },
    duration: Number, // মিনিটে
    order: Number, // লেসনের ক্রম
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Lesson", lessonSchema);
