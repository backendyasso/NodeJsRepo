import { Router } from "express";

import { auth } from "../middlewares/auth.js";
import { endpoints } from "../validation/auth.endpoints.js";
import {
  CartDeleterPerioder,
  ItemsDeleter,
  cartDeleter,
  createCart,
  getHerCart,
  getHerItems,
  updateCart,
} from "../controllers/cart.controller.js";
const router = Router();
router.route("/").post(auth(endpoints.Carter), createCart);
router.route("/update/:id").post(auth(endpoints.Carter), updateCart);
router.route("/delete/:id").delete(auth(endpoints.Carter), cartDeleter);
router.route("/deleteItems/:id").delete(auth(endpoints.Carter), ItemsDeleter);
router.route("/getter").get(auth(endpoints.Carter), getHerCart);
router.route("/ItemsGetter/:id").get(auth(endpoints.Carter), getHerItems);
router
  .route("/deletePeriod/:id")
  .delete(auth(endpoints.Carter), CartDeleterPerioder);

export default router;
