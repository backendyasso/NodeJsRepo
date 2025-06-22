import {paginatePortraits } from "../services/pagination.js"
import ProjectModel from "../models/project.model.js"
import CollectionModel from "../models/collection.model.js"
import mongoose from "mongoose"
import UserModel from "../models/user.model.js"

export const viewAllCollections = async (req, res) => {
  try {
    let { artistId } = req.params;

    const artistCollectionsPipeline = [
      { $match: { artistId: new mongoose.Types.ObjectId(artistId) } },
      { $unwind: "$artistCollections" },
      {
        $project: {
          _id: 0,
          year: "$artistCollections.year",
          collectionImage: "$artistCollections.collectionImage",
        },
      },
    ];

    const projectCollections = await CollectionModel.aggregate(
      artistCollectionsPipeline
    );

    console.log("Project Collections:", projectCollections); 

    res.json({
      message: "Collections",
      projectCollections,
    });
  } catch (error) {
    console.error("Error:", error); 
    res.status(500).json({ error: "Internal server error" });
  }
};

export const viewSpecificCollection = async (req, res) => {
  try {
      const { collectionId } = req.params;
      //const { page, size } = req.query;

      const collection = await CollectionModel.findOne({ "artistCollections._id": collectionId });

      if (!collection) {
          return res.status(404).json({ message: "Collection not found" });
      }
      const artistCollection = collection.artistCollections.find(ac => ac._id.toString() === collectionId.toString());

      if (!artistCollection) {
          return res.status(404).json({ message: "Artist collection not found" });
      }

      const totalProjects = artistCollection.projects.length;
      const { limit, skip } = paginatePortraits(req, totalProjects);
      const projects = artistCollection.projects.slice(skip, skip + limit);
      const totalPages = Math.ceil(totalProjects / limit);

      if (totalPages < req.query.page) {
        return res.status(400).json({ 
          message: `Requested page and size are not suitable for the number of Projects found.`,
          projects, 
          currentPage: Math.floor(skip / limit) + 1,
          totalPages: totalPages,
          totalProjects: totalProjects 
        });
      }

      return res.status(200).json({ 
        projects, 
        currentPage: Math.floor(skip / limit) + 1,
        totalPages: totalPages,
        totalProjects: totalProjects 
      });

      //return res.status(200).json({ projects, totalProjects: artistCollection.projects.length });
  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const DeleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json("Project not found");
    }
    if (project.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the owner" });
    }

    const deletedProject = await ProjectModel.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(400).json("DB Error");
    }

    const collection = await CollectionModel.findOne({
      artistId: project.artistId,
      "artistCollections.projects.projectId": projectId
    });

    if (!collection) {
      return res.status(404).json("Collection not found");
    }

    const artistCollectionIndex = collection.artistCollections.findIndex(
      artistCollection => artistCollection.projects.some(project => project.projectId.equals(projectId))
    );

    if (artistCollectionIndex === -1) {
      return res.status(404).json("Artist collection not found");
    }

    collection.artistCollections[artistCollectionIndex].projects = collection.artistCollections[artistCollectionIndex].projects.filter(
      project => !project.projectId.equals(projectId)
    );

    const totalRate = collection.artistCollections[artistCollectionIndex].projects.reduce((acc, cur) => acc + cur.rate, 0);
    const totalProjects = collection.artistCollections[artistCollectionIndex].projects.length;
    const averageRate = Math.round(totalRate / totalProjects);

    collection.artistCollections[artistCollectionIndex].averageRate = averageRate;

    await collection.save();

    const allCollections = await CollectionModel.find({ artistId: project.artistId });

    let totalARate = 0;
    let totalCollections = 0;

    for (const collection of allCollections) {
      totalARate += collection.artistCollections.reduce((acc, curr) => acc + curr.averageRate, 0);
      totalCollections += collection.artistCollections.length;
    }

    const averageRateForArtist = Math.round(totalARate / totalCollections);

    await UserModel.findOneAndUpdate(
      { _id: project.artistId },
      { $set: { "ArtistInfo.0.rate": averageRateForArtist } }
    );

    res.status(200).json({
      message: "Deleted successfully from collection and project Model",
      deletedProject: deletedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};

export const DeleteCollection = async (req, res, next) => {
  try {
    const { collectionId } = req.params;
    const collection = await CollectionModel.findOne({
      "artistCollections._id": collectionId,
      artistId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json("Collection not found or you are not allowed to delete this collection");
    }

    const collectionIndex = collection.artistCollections.findIndex(
      (artistCollection) => artistCollection._id.toString() === collectionId
    );

    if (collectionIndex === -1) {
      return res.status(404).json("Collection not found");
    }

    if (collection.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the owner" });
    }

    const projectIds = collection.artistCollections[collectionIndex].projects.map(
      (project) => project.projectId
    );

    await ProjectModel.deleteMany({ _id: { $in: projectIds } });

    const deletedCollection = collection.artistCollections.splice(collectionIndex, 1)

    await collection.save();

    const allCollections = await CollectionModel.find({ artistId: req.user._id });
    const totalRate = allCollections.reduce((acc, cur) => acc + cur.artistCollections.reduce((a, c) => a + c.averageRate, 0), 0);
    const totalCollections = allCollections.reduce((acc, cur) => acc + cur.artistCollections.length, 0);
    let averageRateForArtist = totalRate / totalCollections;
    averageRateForArtist = Math.round(averageRateForArtist);

    await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { "ArtistInfo.0.rate": averageRateForArtist } }
    );

    res.status(200).json({ message: "Collection and related projects deleted successfully" , DeletedCollection : deletedCollection });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};








