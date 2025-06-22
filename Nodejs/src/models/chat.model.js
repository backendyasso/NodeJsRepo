import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    to: { type: mongoose.Types.ObjectId, ref: "User" },
    from: { type: mongoose.Types.ObjectId, ref: "User" },
    contracts: [
      {
        contractId : { type: mongoose.Types.ObjectId, ref: "contract" } ,
        approvedProject : {
          type : String ,
          default : null
        },
        pendingProject: { 
          type: String,
          default : null
        } ,
        projectType: {
          type: String,
          enum: ["Pending", "Approved"],
          default: "Pending"
        }
      }
    ],
 },
  {
    timestamps: true,
  }
);

chatSchema.index({ to: 1, from: 1 }, { unique: true });

const ChatModel = mongoose.model("Chat", chatSchema);
export default ChatModel;
