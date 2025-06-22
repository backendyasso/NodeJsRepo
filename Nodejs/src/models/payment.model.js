import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paypalTransactionId: { type: Number, required: true, unique: true },
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enums: ["pending", "paid", "delivered"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModel = mongoose.model("Payment", paymentSchema);
export default PaymentModel;
