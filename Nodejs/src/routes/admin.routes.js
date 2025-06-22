import { Router } from "express";
import { auth } from "../middlewares/auth";
import { endpoints } from "../validation/auth.endpoints.js";
const router = express.Router();

export default router;
