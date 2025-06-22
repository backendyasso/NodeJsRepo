import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { globalToken } from "./auth.controller.js";
import { sendEmail } from "../services/sendEmail.js";
import jwt from "jsonwebtoken";
import CommunityModel from "../models/community.model.js";
import OrderModel from "../models/order.model.js";
import CourseModel from "../models/course.model.js";
import { Types } from "mongoose";

export const changePassword = async (req, res) => {
  let { currentPassword, Password, cpassword } = req.body;
  if (Password == cpassword) {
    let user = await UserModel.findById(req.user._id);
    let matched = await bcryptjs.compare(currentPassword, user.password);
    if (matched) {
      const hashed = await bcryptjs.hash(
        Password,
        parseInt(process.env.saltRounds)
      );
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user._id,
        { password: hashed },
        { new: true }
      );
      res.json({ message: "updated", updatedUser });
    } else {
      res.json({ message: "current password invalid" });
    }
  } else {
    res.json({ message: "password doesnt match" });
  }
};

export const getUserByID = async (req, res) => {
  const { id } = req.params;
  const UserID = await UserModel.findById({ _id: id });
  if (!UserID) {
    return res.status(404).json({ message: "No such user found." });
  }
  res.json({ Sucess: UserID, token: globalToken });
};

export const getAllUsers = (req, res) => {
  UserModel.find({})
    .then((users) => {
      res.json({ Sucess: users });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

export const updateProfileInfo = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);

    if ("username" in req.body) {
      if (req.body.username.length < 1 || req.body.username.length > 100) {
        return res.status(400).json({ error: "Invalid username length" });
      }
      user.username = req.body.username;
    }

    if ("profilePic" in req.body) {
      user.profilePic = req.body.profilePic;
    }

    if ("coverPic" in req.body) {
      user.coverPic = req.body.coverPic;
    }

    if ("hourlyRate" in req.body) {
      user.ArtistInfo[0].hourlyRate = req.body.hourlyRate;
    }

    if ("address" in req.body) {
      user.address = req.body.address;
    }

    if ("email" in req.body) {
      const existingUser = await UserModel.findOne({ email: req.body.email });
      if (existingUser && existingUser._id.toString() !== req.user._id) {
        return res.status(400).json({ error: "Email already in use" });
      } else {
        user.email = req.body.email;
      }
    }

    if ("category" in req.body) {
      const validDepartments = [
        "Landscape",
        "Calligraphy",
        "3D",
        "Anime/Manga",
        "Graffiti",
        "Digital",
        "Sketching",
        "Surreal",
        "abstract",
      ];

      if (!validDepartments.includes(req.body.category)) {
        return res.status(400).json({ error: "Invalid art category" });
      } else {
        user.ArtistInfo[0].departments = req.body.category;
      }
    }

    await user.save();
    return res
      .status(200)
      .json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const report = async (req, res) => {
  const {
    contentType,
    description,
    orderId,
    courseId,
    postId,
    evimages,
    evText,
  } = req.body;
  const user = await UserModel.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "No such user found." });
  }
  if (contentType === "Order") {
    if (!orderId) {
      return res.status(404).json({
        message: "please insert the ID of the content you wanna report",
      });
    }
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "No such order found." });
    }
    user.report.push({
      contentType,
      reportDescription: description,
      OrderId: orderId,
      ReportDate: Date.now(),
      evimages,
      evText,
    });
  } else if (contentType === "Community") {
    if (!postId) {
      return res.status(404).json({
        message: "please insert the ID of the content you wanna report pp",
      });
    }

    const post = await CommunityModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "No such post found." });
    }
    user.report.push({
      contentType,
      reportDescription: description,
      CommunityId: postId,
      ReportDate: Date.now(),
      evimages,
      evText,
    });
  } else if (contentType === "Course") {
    if (!courseId) {
      return res.status(404).json({
        message: "please insert the ID of the content you wanna report",
      });
    }

    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "No such course found." });
    }
    user.report.push({
      contentType,
      reportDescription: description,
      CourseId: courseId,
      ReportDate: Date.now(),
      evimages,
      evText,
    });
  } else {
    return res.status(404).json({ message: "No such content found." });
  }
  const Hero = await user.save();
  res
    .status(201)
    .json({ message: "report added Successfully", Success: true, Hero });
};

export const getAllReports = async (req, res) => {
  const reports = await UserModel.find({
    report: { $exists: true, $not: { $size: 0 } },
  }).select("report");
  if (!reports) {
    return res.status(404).json({ message: "No reports found" });
  }
  return res.status(200).json({ message: "successful", Reports: reports });
};

export const userBlocker = async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findOne({ _id: id, blocked: false });
  if (!user) {
    return res
      .status(404)
      .json({ message: "No such user found or the user is already blocked" });
  }
  if (user.userType === "Admin") {
    return res.status(404).json({ message: "You cannot block admin" });
  }
  user.blocked = true;
  const blocker = await user.save();
  res.json({ message: "Successfully Blocked", Success: true, blocker });
};

export const userUpgrader = async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: "No such user found." });
  }
  if (user.userType === "Admin") {
    return res.status(404).json({ message: "User is already an admin" });
  }

  user.userType = "Admin";

  const upgrader = await user.save();
  res.json({ message: "Successfully Upgraded", Success: true, upgrader });
};

export const adminChecker = async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findOne({ _id: id, isAccepted: false });
  if (!user) {
    return res.status(404).json({
      message: "No such user found or the  account is already approved",
    });
  }
  if (user.userType !== "Admin") {
    return res.status(404).json({ message: "User is not an admin" });
  }
  user.isAccepted = true;
  const savedAdmin = await user.save();
  return res
    .status(200)
    .json({ message: "Successful", Success: true, data: savedAdmin });
};
