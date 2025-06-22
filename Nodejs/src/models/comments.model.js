import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
   postEventid:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Community",
      
    },
    text: {
      type: String,
      required: true
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    },
    likes:{
      type: mongoose.Schema.Types.ObjectId,
       ref: "User" 
    },
    unlikes: { type: mongoose.Schema.Types.ObjectId,
      ref: "User" },
    totalCount: { type: Number, default: 0 },

  },
  {
    timestamps: true,
  }
);

const CommentsModel = mongoose.model("Comment", commentSchema);
export default CommentsModel;
