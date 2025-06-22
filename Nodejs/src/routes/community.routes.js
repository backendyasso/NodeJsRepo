import { Router } from "express";
import {
  createArtistPost,
  DeletepostOrEvent,
  GetAll,
  addComment,
  deletecomment,
  like,
  likecomment,
  unlike,
  unlikecomment,
  updatecomment,
  update,
  getPost,
} from "../controllers/community.controller.js";
import { endpoints } from "../validation/auth.endpoints.js";
import { auth } from "../middlewares/auth.js";
const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Community" });
});

router.post("/CreatePost", auth(endpoints.addUser), createArtistPost); // Done
//router.post("/CreateEvent", auth(endpoints.community), CreateEvent);
router.patch("/like/:id", auth(endpoints.addUser), like); // Done
router.patch("/unlike/:id", auth(endpoints.addUser), unlike); // Done
router.patch("/update/:id", auth(endpoints.addUser), update);
//router.patch("/updateEvent/:id", auth(endpoints.community), updateEvent)
router.delete("/delete/:id", auth(endpoints.addUser), DeletepostOrEvent); // Done
router.post("/addcomment/:id", auth(endpoints.addUser), addComment); // Done
router.patch("/comment/:id/like", auth(endpoints.addUser), likecomment);
router.patch("/comment/:id/unlike", auth(endpoints.addUser), unlikecomment);
router.patch("/updatecomment/:id", auth(endpoints.addUser), updatecomment);
router.delete("/deletecomment/:id", auth(endpoints.addUser), deletecomment); // Done 1/2
router.get("/getPost/:id", getPost); // Done
router.get("/get", GetAll); // Done

export default router;
