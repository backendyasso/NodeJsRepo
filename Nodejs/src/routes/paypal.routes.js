import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { endpoints } from "../validation/auth.endpoints.js";
import {
  getCancel,
  getCapture,
  // accessCourse,
  getSucess,
  paypost,
  world,
} from "../controllers/payment.controller.js";
const router = new Router();

router.post("/pay", auth(endpoints.Carter), paypost);
router.get("/capture", getCapture);
router.get("/success", getSucess);
router.get("/cancel", getCancel);
router.get("/", world);
// router.patch("/access:authToken", auth(), accessCourse);

export default router;
