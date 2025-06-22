import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { endpoints } from "../validation/order.endpoints.js";
import * as orderController from "../controllers/order.controller.js";
import { setPaid } from "../controllers/payment.controller.js";
const router = Router();

router
  .route("/createOrder/")
  .post(auth(endpoints.createOrder), orderController.createOrder);
router
  .route("/applyForProject/:orderId")
  .post(auth(endpoints.applyForProject), orderController.applyForProject);
router
  .route("/acceptArtistProposal/:orderId")
  .post(auth(endpoints.createOrder), orderController.acceptArtistProposal);
router
  .route("/artistContractDecision/:contractId")
  .post(
    auth(endpoints.applyForProject),
    orderController.artistContractDecision
  );
router
  .route("/createProject/:contractId/:orderId")
  .post(auth(endpoints.applyForProject), orderController.createProject);
router
  .route("/reviewArtist/:artistId")
  .post(auth(endpoints.createOrder), orderController.reviewArtist);
router
  .route("/rateProject")
  .post(auth(endpoints.createOrder), orderController.rateProject);
router
  .route("/allContracts/:artistId")
  .get(auth(endpoints.applyForProject), orderController.viewAllArtistContracts);
router
  .route("/specContract/:contractId")
  .get(auth(endpoints.applyForProject), orderController.viewSpecificContract);
//router.route("/homePage").get(auth(endpoints.homepage),orderController.homePage)
router
  .route("/clientProfile/:clientId")
  .get(auth(endpoints.homepage), orderController.clientProfile);
router
  .route("/projectDetails/:orderId")
  .get(auth(endpoints.homepage), orderController.viewProjectDetails);
router
  .route("/orderProposals/:clientId/:orderId")
  .get(auth(endpoints.homepage), orderController.viewProjectProposals);
router
  .route("/AllOrders")
  .get(auth(endpoints.homepage), orderController.viewAllOrders);
router
  .route("/AllArtists")
  .get(auth(endpoints.homepage), orderController.viewAllArtists);
router
  .route("/viewArtistReviews/:artistId")
  .get(auth(endpoints.homepage), orderController.viewArtistReviews);
router
  .route("/createContract/:orderId")
  .post(auth(endpoints.createOrder), orderController.createContract);
router.route("/set").get(setPaid);
router
  .route("/viewChatProjectsForArtist/:chatId")
  .get(
    auth(endpoints.applyForProject),
    orderController.viewChatProjectsForArtist
  );
router
  .route("/viewChatProjectsForClient/:chatId")
  .get(auth(endpoints.createOrder), orderController.viewChatProjectsForClient);

export default router;
