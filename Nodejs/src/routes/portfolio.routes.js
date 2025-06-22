import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { endpoints } from "../validation/projects.endpoint.js";
import * as portfolioController from '../controllers/portfolio.controller.js'

const router = Router();

router.route("/createPortfolio").post(auth(endpoints.CreateProject),portfolioController.createPortfolio)
router.route("/:artistId").get(auth(endpoints.view),portfolioController.viewArtistPortfolio)
router.route("/deletePortfolio/:portfolioId").delete(auth(endpoints.CreateProject),portfolioController.deletePortfolio)
router.route("/deletePortrait/:portraitId").delete(auth(endpoints.CreateProject),portfolioController.deletePortrait)
router.route("/updatePortfolio/:portfolioId").patch(auth(endpoints.CreateProject),portfolioController.addToPortfolio)
router.route("/updateSpecificPortrait/:portraitId").patch(auth(endpoints.CreateProject),portfolioController.updateSpecificPortrait)
export default router;
