import mongoose, { mongo } from "mongoose";

const portfolioSchema = new mongoose.Schema({
  artistId: { type: mongoose.Types.ObjectId, ref: "User" },
  portraits: [
    {
      title: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: [
          "Landscape",
          "Calligraphy",
          "3D",
          "Anime/Manga",
          "Graffiti",
          "Digital",
          "Sketching",
          "Surreal",
          "abstract",
        ],
      },
      date: {
        type: Date,
        default: Date.now,
      },
      image: {
        type: String,
        required: true,
      },
    },
  ],
});

const PortfolioModel = mongoose.model("Portfolio", portfolioSchema);
export default PortfolioModel;
