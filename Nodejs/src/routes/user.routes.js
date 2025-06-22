import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { endpoints } from "../validation/auth.endpoints.js";
import {
  changePassword,
  updateProfileInfo,
  getAllUsers,
  getUserByID,
  report,
  getAllReports,
  userBlocker,
  userUpgrader,
  adminChecker,
} from "../controllers/user.controller.js";
const router = Router();

router.route("/updatePass").patch(auth(endpoints.addUser), changePassword);
router
  .route("/updateProfile")
  .patch(auth(endpoints.addUser), updateProfileInfo);
router.route("/userGetter").get(getAllUsers);
router.route("/userID/:id").get(getUserByID);
router.route("/reporter").post(auth(endpoints.addrepo), report);
router.route("/getAllreports").get(auth(endpoints.adminOnly), getAllReports);
router.route("/blocker/:id").patch(auth(endpoints.adminOnly), userBlocker);
router.route("/upgrader/:id").patch(auth(endpoints.adminOnly), userUpgrader);
router.route("/manageAdmin/:id").patch(auth(endpoints.adminOnly), adminChecker);
//router.route("/userID/:id").get(auth(endpoints.adminOnly), getUserByID);
//router.route("/userGetter").get(auth(endpoints.adminOnly), getAllUsers);

export default router;
