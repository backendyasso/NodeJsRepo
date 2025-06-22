import mongoose from "mongoose";
import ChatModel from "./chat.model.js";

const contractSchema = new mongoose.Schema(
  {
      artistId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "Artist ID required"]
      },
      artistContracts: [
        {
          orderId: {
            type: mongoose.Types.ObjectId,
            ref: "Order",
            required: [true, "orderId is required"]
          },
          chatId: {
            type: mongoose.Types.ObjectId,
            ref: "chat",
            required: [true, "chatId is required"]
          },
          clientId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Client ID required"]
          },
          clientApproval : {
            type : Boolean,
            default : false ,
            required: [true, "Client approval required"]
          },
          artistApproval : {
            type : Boolean,
            default : false ,
            required: [true, "Artist approval required"]
          },
          requirements : {
            type : String ,
            required: [true, "Requirements is required"]
          },
          artistSign: {
            type: String,
            required: function () {
              return this.artistApproval === true;
            }
          },
          paid: {
            type: Boolean,
            default: false,
          },
          clientSign: {
            type: String,
            required: function () {
              return this.clientApproval === true;
            },
          },
          description : {
            type : String ,
            ref : "Order" ,
            required : true
          },
          price : {
            type : Number ,
            ref : "Order" ,
            required : true
          },
          contractType: {
            type: String,
            required: true,
            enum: ["Pending", "Accepted", "Rejected"],
            default: "Pending",
          },
        },
      ],
  },
  {
    timestamps: true,
  }
);
// contractSchema.pre('save', async function(next) {
//   const contracts = this.artistContracts.filter(contract => !contract.Modified); 
//   for (let contract of contracts) {
//     if (contract.Modified = false)
//     if (contract.paid) {
//       const chat = await ChatModel.findOne({ "contracts.contractId": contract._id });
//       if (chat) {
//         const chatContractIndex = chat.contracts.findIndex(c => c.contractId.equals(contract._id));
//         if (chatContractIndex !== -1) {
//           if (!chat.contracts[chatContractIndex].approvedProject) {
//             chat.contracts[chatContractIndex].approvedProject = chat.contracts[chatContractIndex].pendingProject;
//             chat.contracts[chatContractIndex].pendingProject = null;
//             chat.contracts[chatContractIndex].projectType = "Approved";
//             chat.markModified('contracts');
//             await chat.save();
//           } else {
//             console.log("approvedProject already exists");
//           }
//         } else {
//           console.log("Wrong Index");
//         }
//       } else {
//         console.log("Chat is not found");
//       }
//     }
//     contract.Modified = true; 
//   }
//   next();
// });


// contractSchema.pre('save', async function(next) {
//   if (!this.isNew) {
//       const contracts = this.artistContracts.filter(contract => contract.isModified('paid') && contract.paid === true);
//       for (let contract of contracts) {
//           if (contract.)
//           const chat = await ChatModel.findOne({ "contracts.contractId": contract._id });
//           if (chat) {
//               const chatContractIndex = chat.contracts.findIndex(c => c.contractId.equals(contract._id));
//               if (chatContractIndex !== -1) {
//                   if (!chat.contracts[chatContractIndex].approvedProject) {
//                       chat.contracts[chatContractIndex].approvedProject = chat.contracts[chatContractIndex].pendingProject;
//                       chat.contracts[chatContractIndex].pendingProject = null;
//                       chat.contracts[chatContractIndex].projectType = "Approved";
//                       chat.markModified('contracts');
//                       await chat.save();
//                       contract.isModified = true
//                       await contract.save()
//                   } else {
//                       console.log("approvedProject already exists");
//                   }
//               } else {
//                   console.log("Wrong Index");
//               }
//           } else {
//               console.log("Chat is not found");
//           }
//       }
//   }
//   next();
// });



// contractSchema.pre('updateMany', async function(next) {
//   const contractsToUpdate = await this.model.find(this.getFilter());
  
//   for (let contract of contractsToUpdate) {
//       if (contract.artistContracts) {
//           for (let artistContract of contract.artistContracts) {
//               if (artistContract.paid === true) {
//                   const chat = await ChatModel.findOne({ "contracts.contractId": artistContract._id });

//                   if (chat) {
//                       const chatContractIndex = chat.contracts.findIndex(c => c.contractId.equals(artistContract._id));
//                       if (chatContractIndex !== -1) {
//                           if (!chat.contracts[chatContractIndex].approvedProject) {
//                               chat.contracts[chatContractIndex].approvedProject = chat.contracts[chatContractIndex].pendingProject;
//                               chat.contracts[chatContractIndex].pendingProject = null;
//                               chat.contracts[chatContractIndex].projectType = "Approved";
//                               chat.markModified('contracts');
//                               await chat.save();
//                           } else {
//                               console.log("approvedProject already exists");
//                           }
//                       } else {
//                           console.log("Wrong Index");
//                       }
//                   } else {
//                       console.log("Chat is not found");
//                   }
//               }
//           }
//       }
//   }

//   next();
// });

const contractModel = mongoose.model("contract", contractSchema);
export default contractModel;
