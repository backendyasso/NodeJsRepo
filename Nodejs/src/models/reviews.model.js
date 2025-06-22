import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    artistId : {
        type: mongoose.Types.ObjectId, 
        ref: "User"
      },
    Reviews: {
        _id: false,
        type:[ {
          clientId: { 
            type: mongoose.Types.ObjectId, 
            ref: "User" 
          },
           comment : String ,
           createdAt: {
            type: Date, default: Date.now 
          }
          }]
        },
  },
  {
    timestamps: true,
  }
);

  

const reviewsModel = mongoose.model("reviews", reviewSchema);
export default reviewsModel;
