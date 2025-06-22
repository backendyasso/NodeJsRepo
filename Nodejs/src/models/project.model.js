import mongoose from "mongoose";
import CollectionModel from "./collection.model.js";
import UserModel from "./user.model.js";
import ChatModel from "./chat.model.js";
import contractModel from "./contract.model.js";

const projectSchema = new mongoose.Schema(
  {
    artistId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    clientId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Types.ObjectId, ref: "Order" , required: true},
    contractId: { type: mongoose.Types.ObjectId, ref: "Contract", required: true },
    title: { type: String, required: true },
    price: { type: Number, ref: "Order" },
    description: { type: String, required: true, ref: "Order" },
    year: Number,
    image: { type: String, required: true },
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
      ref: "Order",
    },
    rate: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
      default: 0,
    },
    artistLevel: {
      type: String,
      ref: "Order",
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


projectSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const artist = await UserModel.findById(this.artistId);
      if (artist) {
        artist.ArtistInfo[0].ordersCount = parseInt(artist.ArtistInfo[0].ordersCount || 0) + 1;
        await artist.save();
      const existingCollection = await CollectionModel.findOne({ artistId: this.artistId });
      if (!existingCollection) {
        const newCollection = new CollectionModel({
          artistId: this.artistId,
          artistCollections: [{
            year: this.year,
            projects: [{
              projectId: this._id,
              title: this.title,
              projectImage: this.image,
              price: this.price,
              rate: this.rate || 0,
              category: this.category
            }],
            collectionImage: this.image || null,
            averageRate: 0
          }],
          category: this.category
        });
        await newCollection.save();
      } else {
        const collectionIndex = existingCollection.artistCollections.findIndex(
          collection => collection.year === this.year
        );
        if (collectionIndex !== -1) {
          existingCollection.artistCollections[collectionIndex].projects.push({
            projectId: this._id,
            title: this.title,
            projectImage: this.image,
            price: this.price,
            rate: this.rate || 0,
            category: this.category
          });
          const totalRate = existingCollection.artistCollections[collectionIndex].projects.reduce((sum, project) => sum + project.rate, 0);
          const totalProjects = existingCollection.artistCollections[collectionIndex].projects.length;
          const averageRate = Math.round(totalRate / totalProjects);
          existingCollection.artistCollections[collectionIndex].averageRate = averageRate;
          existingCollection.artistCollections[collectionIndex].collectionImage = this.image;
        } else {
          existingCollection.artistCollections.push({
            year: this.year,
            projects: [{
              projectId: this._id,
              title: this.title,
              projectImage: this.image,
              price: this.price,
              rate: this.rate || 0,
              category: this.category
            }],
            collectionImage: this.image || null,
            averageRate: 0
          });
        }
        await existingCollection.save();
        const allCollections = await CollectionModel.find({ artistId: this.artistId });
        let totalRate = 0;
        let totalCollections = 0;
    
        allCollections.forEach(collection => {
          totalRate += collection.artistCollections.reduce((acc, curr) => acc + curr.averageRate, 0);
          totalCollections += collection.artistCollections.length;
        });
        
        const averageRate = Math.round(totalRate / totalCollections);

        await UserModel.findOneAndUpdate(
          { _id: this.artistId },
          { $set: { "ArtistInfo.0.rate": averageRate } }
        );
      }
    }
      }
    
    next();
  } catch (error) {
    console.error(error);
    throw error;
  }
});

// projectSchema.post('save', async function (doc, next) {
//   try {
//     if (this.paid && this.paid !== this.isNew) {
//       const contract = await contractModel.findOne({ "artistContracts.orderId": this.orderId });
//       if (contract) {
//         const index = contract.artistContracts.findIndex(contract => contract.orderId.equals(this.orderId));
//         if (index !== -1) {
//           const chatId = contract.artistContracts[index].chatId;
//           const chat = await ChatModel.findById(chatId);
//           if (chat && chat.pendingProject) {
//             chat.CustomizedProject = chat.pendingProject;
//             chat.pendingProject = undefined;
//             await chat.save();
//           }
//         }
//       }
//     }
//     next();
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// });

// contractSchema.post('save', async function (doc, next) {
//   try {
//     if (this.paid && this.paid !== this.isNew) {
//       const chat = await ChatModel.findById(this.artistContracts[0].chatId);
//       if (chat && chat.pendingProject) {
//         chat.customizedProject = chat.pendingProject;
//         chat.pendingProject = undefined;
//         await chat.save();
//       }
//     }
//     next();
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// });

// contractSchema.post('save', async function (doc , next) {
//   try {
//     const index = this.artistContracts.findIndex(contract => contract._id.equals(this._id));
//     if (index !== -1 ){
//     if (this.artistContracts[index].paid && this.artistContracts[index].paid !== this.isNew) {
//         const chat = await ChatModel.findById(this.artistContracts[index].chatId);
//         if (chat && chat.pendingProject) {
//           chat.CustomizedProject = chat.pendingProject;
//           chat.pendingProject = undefined;
//           await chat.save();
//       }
//     }
//     }
    
//     next();
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// });

//   try {
//     if (this.paid && this.paid !== this.isNew) {
//       const contract = await contractModel.findOne({ "artistContracts.orderId": this.orderId });
//       if (contract) {
//         const index = contract.artistContracts.findIndex(contract => contract.orderId.equals(this.orderId));
//         if (index !== -1) {
//           const chatId = contract.artistContracts[index].chatId;
//           const chat = await ChatModel.findById(chatId);
//           if (chat && chat.pendingProject) {
//             chat.CustomizedProject = chat.pendingProject;
//             chat.pendingProject = undefined;
//             await chat.save();
//           }
//         }
//       }
//     }
//     next();
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// });


const ProjectModel = mongoose.model("Project", projectSchema);
export default ProjectModel;
