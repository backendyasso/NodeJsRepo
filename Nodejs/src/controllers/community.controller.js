import mongoose from "mongoose";
import CommunityModel from "../models/community.model.js";
import CommentsModel from "../models/comments.model.js";
import UserModel from "../models/user.model.js";
import { json } from "express";

export const createArtistPost = async (req, res) => {
  try {
    const author = req.user._id;
    let { images, title, description, shareType, postCollection } = req.body;

    if (shareType === "event") {
      let { eventDate, eventLocation, eventPlace, eventTime, eventCity } =
        req.body;
      let event = new CommunityModel({
        title,
        description,
        images,
        author,
        eventDate,
        eventPlace,
        eventTime,
        eventCity,
        eventLocation,
        shareType,
      });
      event.populate({
        path: "author",
        select: "username profilePic userType",
      });

      let savedEvent = await event.save();

      if (!savedEvent) {
        res
          .status(400)
          .json({ message: "Error while inserting to the Database" });
      } else {
        res
          .status(201)
          .json({ message: "Event Added successfully", savedEvent });
      }
    } else {
      const { paid } = req.body;

      if (paid === true) {
        let { price } = req.body;

        let post = new CommunityModel({
          title,
          description,
          author,
          postCollection,
          price,
          paid,
          shareType,
        });

        post.populate({
          path: "author",
          select: "username profilePic userType",
        });

        let savedPost1 = await post.save();

        if (!savedPost1) {
          res
            .status(400)
            .json({ message: "Error while inserting to the Database" });
        } else {
          res
            .status(201)
            .json({ message: "Post Added successfully", savedPost1 });
        }
      } else {
        let post = new CommunityModel({
          title,
          description,
          author,
          images,
          shareType,
        });
        post.populate({
          path: "author",
          select: "username profilePic userType",
        });

        let savedPost2 = await post.save();

        if (!savedPost2) {
          res
            .status(400)
            .json({ message: "Error while inserting to the Database" });
        } else {
          res
            .status(201)
            .json({ message: "Post Added successfully", savedPost2 });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const like = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CommunityModel.findOneAndUpdate(
      { _id: id, likes: { $nin: [req.user._id] } },
      {
        $push: { likes: req.user._id },
        $pull: { unlikes: req.user._id },
        $inc: { totalCount: 1 },
        likedDate: Date.now(),
      },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Post not found or you've already liked the post" });
    }

    // Create a new object with the desired response format
    const response = {
      message: "liked",
      updated: {
        ...updated.toObject(), // Convert Mongoose document to plain JavaScript object
        LikedDate: new Date(), // Add LikedDate field
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
};

export const unlike = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CommunityModel.findOneAndUpdate(
      { _id: id, unlikes: { $nin: [req.user._id] } },
      {
        $push: { unlikes: req.user._id },
        $pull: { likes: req.user._id },
        $inc: { totalCount: -1 },
      },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Post not found or you've already unliked the post" });
    }

    // Create a new object with the desired response format
    const response = {
      message: "unliked",
      updated: {
        ...updated.toObject(), // Convert Mongoose document to plain JavaScript object
        unlikedDate: new Date(), // Add unlikedDate field
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const find = await CommunityModel.findById(id);
    if (find.shareType === "event") {
      const { eventDate, eventLocation, images, title } = req.body;
      //const event = await CommunityModel.findById(id);

      if (find) {
        if (find.author.toString() === req.user._id.toString()) {
          const updatedEvent = await CommunityModel.findByIdAndUpdate(
            id,
            { eventDate, eventLocation, images, title },
            { new: true }
          );
          res.json({ message: "Done", updatedEvent });
        } else {
          res.json({ message: "You are not authorized to edit this event" });
        }
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } else {
      //const { paid } = req.body;

      if (find.paid === true) {
        res.json({ message: "Not authorized to edit" });
      } else {
        const { title, images, description } = req.body;
        /*const post = await CommunityModel.findById(id);*/

        if (find) {
          if (find.author.toString() === req.user._id.toString()) {
            const updatedPost = await CommunityModel.findByIdAndUpdate(
              id,
              { title, images, description },
              { new: true }
            );
            res.json({ message: "Done", updatedPost });
          } else {
            res.json({ message: "You are not authorized to edit this post" });
          }
        } else {
          res.status(404).json({ message: "Post not found" });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};

export const DeletepostOrEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const find = await CommunityModel.findById(id);
    if (find.author.toString() == req.user._id.toString()) {
      const deleted = await CommunityModel.findByIdAndDelete(
        { _id: id },
        { find }
      );
      res.json({ message: "deleted", deleted });
    } else {
      res.json({ message: "You are not the author", error });
    }
  } catch (error) {
    res.json({ message: "not deleted", error });
  }
};

export const addComment = async (req, res) => {
  try {
    let { text } = req.body;
    let UserId = req.user._id;
    let { id } = req.params;
    const find = await CommunityModel.findById(id, UserId);
    if (!find) {
      return res.status(404).json({ message: "Post not found" });
    } else {
      let comment = await CommentsModel({ text, UserId });
      let savedComment = await comment.save();
      const data = await CommunityModel.findByIdAndUpdate(
        id,
        {
          $push: { comments: savedComment._id },
        },
        { new: true }
      )
        .populate({
          path: "comments",
          select: "text UserId likes unlikes createdAt",
          populate: {
            path: "UserId",
            select: "username profilePic userType",
          },
        })
        .populate({
          path: "author",
          select: "username profilePic userType",
        })
        .populate({
          path: "likes",
          select: "username profilePic userType",
        })
        .populate({
          path: "unlikes",
          select: "username profilePic userType",
        });
      return res.status(201).json({ message: "Added", data: data });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error" });
  }
};

export const likecomment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CommentsModel.findOneAndUpdate(
      { _id: id, likes: { $nin: [req.user._id] } },
      {
        $push: { likes: req.user._id },
        $pull: { unlikes: req.user._id },
        $inc: { totalCount: 1 },
      },
      { new: true }
    );
    res.json({ message: "success", updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
};

export const unlikecomment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CommentsModel.findOneAndUpdate(
      { _id: id, unlikes: { $nin: [req.user._id] } },
      {
        $push: { unlikes: req.user._id },
        $pull: { likes: req.user._id },
        $inc: { totalCount: -1 },
      },
      { new: true }
    );
    res.json({ message: "unliked", updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
};

export const updatecomment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id } = req.params;
    const find = await CommentsModel.findById(id);

    if (find) {
      if (find.UserId.toString() === req.user._id.toString()) {
        const updatedcomment = await CommentsModel.findByIdAndUpdate(
          id,
          { text },
          { new: true }
        );
        res.json({ message: "Done", updatedcomment });
      } else {
        res.json({ message: "You are not authorized to edit this comment" });
      }
    } else {
      res.status(404).json({ message: "comment not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
};

export const deletecomment = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await CommentsModel.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.UserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    const deleted = await CommentsModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "deleted", deleted });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the comment", error });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await CommunityModel.findById(req.params.id)
      .populate({
        path: "comments",
        select: "text UserId likes unlikes createdAt",
        populate: {
          path: "UserId",
          select: "username profilePic userType",
        },
      })
      .populate({
        path: "author",
        select: "username profilePic userType",
      })
      .populate({
        path: "likes",
        select: "username profilePic userType",
      })
      .populate({
        path: "unlikes",
        select: "username profilePic userType",
      });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "An error" });
  }
};

export const GetAll = async (req, res) => {
  try {
    const All = await CommunityModel.find({})
      .populate({
        path: "comments",
        select: "text UserId likes unlikes createdAt",
        populate: {
          path: "UserId",
          select: "username profilePic userType",
        },
      })
      .populate({
        path: "author",
        select: "username profilePic userType",
      })
      .populate({
        path: "likes",
        select: "username profilePic userType",
      })
      .populate({
        path: "unlikes",
        select: "username profilePic userType",
      });

    res.status(200).json({ data: All });
  } catch (error) {
    res.status(500).json({ error: "An error" });
  }
};



