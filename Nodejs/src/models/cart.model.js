import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "clientId is required"],
      unique: true,
    },

    // artistId: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "User",
    //   required: [true, "artistId is required"],
    // },
    communityProjects: {
      type: [
        {
          projectId: {
            type: mongoose.Types.ObjectId,
            ref: "Community",
          },

          ProjectsPrice: {
            type: Number,
            ref: "Community",
          },
          cartType: {
            type: String,
            default: "ArtWork",
          },
        },
      ],
    },
    courses: {
      type: [
        {
          courseId: {
            type: mongoose.Types.ObjectId,
            ref: "Course",
          },
          coursesPrice: {
            type: Number,
            required: true,
          },
          cartType: {
            type: String,
            default: "course",
          },
        },
      ],
    },
    CourseQuantity: {
      type: Number,
      default: 1,
    },
    ProjectsQuantity: {
      type: Number,
      default: 1,
    },
    CoursesTotal: {
      type: Number,
      default: 0,
    },
    ProjectsTotal: {
      type: Number,
      default: 0,
    },
    TotalQuantity: {
      type: Number,
      default: 1,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// cartSchema
//   .path("communityProjects")
//   .schema.path("ProjectsPrice")
//   .get(function () {
//     return this.communityProjects.reduce(
//       (total, project) => total + (project.ProjectsPrice || 0),
//       0
//     );
//   });

// cartSchema
//   .path("courses")
//   .schema.path("coursesPrice")
//   .get(function () {
//     return this.courses.reduce(
//       (total, course) => total + (course.coursesPrice || 0),
//       0
//     );
//   });

// cartSchema.path("totalPrice").get(function () {
//   return this.communityProjects.ProjectsPrice + this.courses.coursesPrice;
// });

cartSchema.pre("save", function (next) {
  this.communityProjects.ProjectsPrice = 0;
  this.courses.coursesPrice = 0;
  this.totalPrice = 0;
  this.quantity = 0;

  this.communityProjects.ProjectsPrice = this.communityProjects.reduce(
    (total, project) => total + (project.ProjectsPrice || 0),
    0
  );
  this.courses.coursesPrice = this.courses.reduce(
    (total, course) => total + (course.coursesPrice || 0),
    0
  );
  this.CoursesTotal = this.courses.coursesPrice;
  this.ProjectsTotal = this.communityProjects.ProjectsPrice;
  this.totalPrice =
    this.communityProjects.ProjectsPrice + this.courses.coursesPrice;
  this.CourseQuantity = this.courses.length;
  this.ProjectsQuantity = this.communityProjects.length;

  this.TotalQuantity = this.communityProjects.length + this.courses.length;
  next();
});

const cartModel = mongoose.model("Cart", cartSchema);
export default cartModel;
