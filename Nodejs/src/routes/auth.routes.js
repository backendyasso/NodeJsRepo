import { Router } from "express";
import {
  // confirmEmail,
  forgetPassword,
  sendcode,
  signIn,
  signUp,
} from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";
import { endpoints } from "../validation/auth.endpoints.js";
const router = Router();
router.route("/signUp").post(signUp);
// router.route("/confirmEmail/:token").get(confirmEmail);
router.route("/signIn").post(signIn);
router.route("/forgetPass").post(forgetPassword);
router.route("/coder").post(sendcode);

export default router;
