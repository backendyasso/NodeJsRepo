import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import user from "./user.model.js";
// const courseSchema = new mongoose.Schema(
//   {
//     artistId: { type: mongoose.Types.ObjectId, ref: "User" },
//     title: { type: String, required: true },
//     description: { type: String },
//     imageUrl: { type: String },
//     price: { type: Number, required: true },
//     rate: {
//       type: Number,
//       default: 0,
//     },
//     category: {
//       type: String,
//       enums: ["digital art", "manga", "anime", "3D"],
//       required: true,
//       default: "anime",
//     },
//     requirements: {
//       type: String,
//     },
//     duration: {
//       type: Number,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const CourseModel = mongoose.model("Course", courseSchema);
// export default CourseModel;

const courseSchema = new mongoose.Schema(
  {
    artistId: { type: mongoose.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    video: { type: String },
    price: { type: Number, required: true },
    rate: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5, default: 0 },
      },
    ],
    //   rate: [{
    //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    //     value: { type: Number, min: 1, max: 5 }
    // }],
    totalAverageRate: { type: Number, default: 0 },
    // rate: {
    //   type: Number,
    //   default: 0,
    // },

    category: {
      type: String,
      enums: ["digital art", "manga", "anime", "3D"],
      required: true,
      default: "anime",
    },
    successPayment: { type: Boolean, default: false }, // Add a field to track payment success

    requirements: {
      type: String,
    },
    duration: {
      type: String,
      required: true,
    },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    totalEnrolledStudents: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);
// courseSchema.pre("save", async function (next) {
//   this.totalEnrolledStudents = this.enrolledStudents.length;
//   next();
// });

courseSchema.methods.grantAccessAfterPayment = async function (
  userId,
  courseId
) {
  try {
    // Update the successPayment attribute to true
    this.successPayment = true;
    // Push the userId into enrolledStudents array
    if (!this.enrolledStudents.includes(userId)) {
      this.enrolledStudents.push(userId);
    }

    // Push the courseId into courseEnrolled array
    await user.findByIdAndUpdate(
      userId,
      { $push: { enrolledCourses: courseId } },
      { new: true }
    );
    await this.save();
    return true; // Indicate success
  } catch (error) {
    console.error("Error granting access to the course after payment:", error);
    throw error;
  }
};

const CourseModel = mongoose.model("Course", courseSchema);
export default CourseModel;
