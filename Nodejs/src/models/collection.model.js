import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, 'ArtistId is required'],
      unique: true,
    },
    artistCollections: [
      {
        year: { type: Number, required: true },
        projects: [
          {
            projectId: {
              type: mongoose.Types.ObjectId,
              ref: "Project",
              required: [true, 'ProjectId is required'],
            },
            title: { type: String, required: true },
            projectImage: { type: String, ref: "Project" },
            price: { type: Number, ref: "Project" },
            rate : {
              type: Number,
              min: 0,
              max: 5,
              required: true,
              default : 0 ,
              ref: "Project",
            },
            category: { type: String, ref: "Project" },
          },
        ],
        averageRate: { type: Number, default: 0 },
        collectionImage: { type: String, default: null },
      },
    ],
  },
  {
    timestamps: true,
  }
);


const CollectionModel = mongoose.model("Collection", collectionSchema);
export default CollectionModel;
