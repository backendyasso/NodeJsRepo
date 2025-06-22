import dotenv from "dotenv";
import UserModel from "./src/models/user.model.js";
import mongoose from "mongoose";
dotenv.config();

const start = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      await UserModel.deleteMany();
      console.log("MongoDB Connected...");
      process.exit(0);
    })
    .catch((err) => console.log(err));
};

start();
