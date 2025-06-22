import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Types.ObjectId, ref: "User" },
    clientOrders : [
      {
        contractId: { type: mongoose.Types.ObjectId, ref: "contract" },
        orderStatus: {
          type: String,
          required: true,
          enum: ["Pending", "Accepted", "Rejected"],
          default: "Pending",
        },
        description: { type: String, required: true },
        artistLevel: {
          type: String,
          enum: ["Beginner", "Intermediate", "professional"],
          required: true,
        },
        duration: { type: String, required: true },
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
          required: true,
        },
        attachment : String ,
        price : {
        type : Number ,
        required : true
      },
      proposals: {
        type: [
          {
            coverLetter: {
              type: String,
            },
            artistId: {
              type: mongoose.Types.ObjectId,
              ref: "User",
            },
            hired: { type: Boolean, Default: false },
          },
        ],
      },
      proposalsCount: { type: Number, default: 0 },
    },
  ], },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  this.clientOrders.forEach(order => {
    order.proposalsCount = order.proposals.length;
  });
  next();
});

const OrderModel = mongoose.model("Order", orderSchema);
export default OrderModel;
