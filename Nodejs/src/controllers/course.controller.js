import CourseModel from "../models/course.model.js";
import { paginate } from "../services/pagination.js";
import UserModel from "../models/user.model.js";
import cartModel from "../models/cart.model.js";
import { payment } from "./payment.controller.js";
//import UserModel from "../models/user.model";

export const addCourse = async (req, res, next) => {
  try {
    if (!req.body || !req.body.title || !req.body.imageUrl || !req.body.video) {
      return res
        .status(422)
        .json({ message: "You have to provide both title and image URL" });
    } else {
      let {
        title,
        imageUrl,
        video,
        description,
        category,
        price,
        requirements,
        duration,
      } = req.body;
      // Assuming you want to save the course with the provided name, image URL, current user ID, and category ID
      let course = new CourseModel({
        title,
        description,
        imageUrl,
        video,
        artistId: req.user._id, // Assuming you have user information attached to the request object
        category,
        price,
        requirements,
        duration,
      });
      let savedcourse = await course.save();
      res.status(201).json({ message: "course created", course: savedcourse });
    }
  } catch (error) {
    // If there's an error during the process, return a 500 error response
    res
      .status(500)
      .json({ message: "Error creating course", error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    let { courseid } = req.params;
    let { title, imageUrl, duration, description } = req.body; // Assuming imgUrl is sent in the request body

    let course = await CourseModel.findById(courseid);

    if (!course) {
      return res.status(404).json({ message: "course not found" });
    }
    if (course.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let updatedcourse;
    if (imageUrl) {
      // If imgUrl is provided in the request body, update the image URL
      updatedcourse = await CourseModel.findByIdAndUpdate(
        { _id: courseid },
        { title, imageUrl, duration, description }, // Update the image field with the provided imgUrl
        { new: true }
      );
    } else {
      // If imgUrl is not provided, update only the name
      updatedcourse = await CourseModel.findByIdAndUpdate(
        { _id: courseid },
        { title, duration, description },
        { new: true }
      );
    }

    res.status(200).json({ message: "Updated", updatedcourse });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
    console.log(error);
  }
};
export const deletecourse = async (req, res) => {
  try {
    let { courseid } = req.params;

    // Find the course by its ID
    let course = await CourseModel.findById(courseid);

    // Check if the course exists
    if (!course) {
      return res.status(404).json({ message: "course not found" });
    }
    if (course.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete the course
    await CourseModel.findByIdAndDelete(courseid);

    res.status(200).json({ message: "course deleted", deletedCourse: course });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting subcategory", error: error.message });
    console.error(error);
  }
};

// export const courseRate = async (req, res) => {
//     try {
//   let courseId = req.params;
//   let { rate } = req.body;

//   // Check if rating is within valid range (1 to 5)
//   if (rate < 1 || rate > 5) {
//     return res.status(400).json({ error: "Rating must be between 1 and 5." });
//   }

//     // Update the course document to add the rating
//     else{
//     let updated = await CourseModel.findByIdAndUpdate({_id: courseId, rate:{$nin:[req.user._id]}},
//       {
//        $push: { rate:req.user._id } },
//       { new: true });
//       res.status(200).json({ message: 'Rating submitted successfully.', updated });

//     if (!updated) {
//       return res.status(404).json({ error: "Course not found." });
//     }
// }

//   } catch (error) {
//     console.error("Error while updating course:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };
// export const courseRate = async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const { rate } = req.body;

//     // Check if rating is within valid range (1 to 5)
//     if (rate < 1 || rate > 5) {
//       return res.status(400).json({ error: "Rating must be between 1 and 5." });
//     }
//     let userId= req.user._id;

//     // Update the course document to add the rating
//     const updatedCourse = await CourseModel.findByIdAndUpdate(
//       courseId,
//       { $push: { rate:{userId, value: parseInt(rate) } }}, // Parse rate to ensure it's a number
//       { new: true }
//     );
//     const totalRatings = updatedCourse.rate.length;
//     const sumOfRatings = updatedCourse.rate.reduce((acc, rating) => acc + rating, 0);
//     const totalAverageRate = totalRatings ? sumOfRatings / totalRatings : 0;

//     // Update the total average rate attribute
//     updatedCourse.totalAverageRate = totalAverageRate;
//     await updatedCourse.save();

//     if (!updatedCourse) {
//       return res.status(404).json({ error: "Course not found." });
//     }

//     res.status(200).json({ message: 'Rating submitted successfully.', updatedCourse });
//   } catch (error) {
//     console.error("Error while updating course:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };

// export const averageCourseRating = async (req, res) => {
//   try {
//     const courseId = req.params.courseId;

//     // Find the course by its ID
//     const course = await CourseModel.findById(courseId);

//     if (!course) {
//       return res.status(404).json({ error: "Course not found." });
//     }

//     // Calculate the average rating
//     let rates = course.rate;
//     const totalRates = rates.length;
//     if (totalRates === 0) {
//       return res.status(200).json({ averageRating: 0 });
//     }

//     const sum = rates.reduce((acc, rate) => acc + rate, 0);
//     const averageRating = sum / totalRates;

//     res.status(200).json({course, averageRating });
//   } catch (error) {
//     console.error("Error while calculating average rating:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };

export const courseRate = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { rate } = req.body;

    // Check if rating is within valid range (1 to 5)
    if (!Array.isArray(rate) || rate.length === 0) {
      return res.status(400).json({
        error: "Rate must be an array containing at least one rating object.",
      });
    }

    // Validate each rating object in the rate array
    for (const rating of rate) {
      if (rating.value < 1 || rating.value > 5) {
        return res.status(400).json({
          error:
            "Each rating object must have a valid numeric value between 1 and 5.",
        });
      }
    }

    // Update the course document to add the ratings
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      { $push: { rate: { $each: rate } } },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Calculate total average rate
    const totalRatings = updatedCourse.rate.length;
    const sumOfRatings = updatedCourse.rate.reduce(
      (acc, rating) => acc + rating.value,
      0
    );
    const totalAverageRate = totalRatings ? sumOfRatings / totalRatings : 0;

    // Update the total average rate attribute
    updatedCourse.totalAverageRate = totalAverageRate;
    await updatedCourse.save();

    res
      .status(200)
      .json({ message: "Rating submitted successfully.", updatedCourse });
  } catch (error) {
    console.error("Error while updating course:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const courses = async (req, res) => {
  let { page, size } = req.query;
  let { skip, limit } = paginate(page, size);
  let allCourses = await CourseModel.find().skip(skip).limit(limit);

  res.status(200).json({ message: " Done", allCourses });
};

export const enrollInCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Find the user by userId
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Find the course by courseId
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Check if the user is already enrolled in the course
    if (course.enrolledStudents.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User is already enrolled in the course." });
    }

    // Add the user to the course's list of enrolled students
    course.enrolledStudents.push(userId);
    user.enrolledCourses.push(courseId);
    await course.save();
    await user.save();

    res
      .status(200)
      .json({ message: "User enrolled in the course successfully." });
  } catch (error) {
    console.error("Error while enrolling user in the course:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// // Endpoint to get average rating for a course
// export const averageRating = (req, res) => {
//   const courseId = req.params;

//   // Check if course has any ratings
//   if (!courseRatings[courseId]) {
//     return res.status(404).json({ error: 'No ratings found for this course.' });
//   }

//   // Calculate average rating
//   const ratings = courseRatings[courseId];
//   const averageRating = ratings.reduce((sum, rate) => sum + rating, 0) / ratings.length;

//   res.status(200).json({ averageRating });
// };
