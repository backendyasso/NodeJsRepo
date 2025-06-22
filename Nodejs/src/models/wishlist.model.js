import mongoose from "mongoose";
const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    paintingId: {
      type: mongoose.Types.ObjectId,
      ref: "painting",
    },
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
  },
  {
    timestamps: true,
  }
);

const WishlistModel = mongoose.model("wishlist", wishlistSchema);
export default WishlistModel;
