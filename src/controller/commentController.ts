import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel";
import Post from "../models/postModel";
import mongoose from "mongoose";

//create a comment
export const createComment = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId;

    if (!postId || postId.trim() == "") {
      res.status(400);
      throw new Error("Post ID is required");
    }

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const { content } = req.body;

    if (!content) {
      res.status(400);
      throw new Error("Content is required");
    }

    // Create a new comment
    const comment = await Comment.create({
      postId,
      userId: req.user!.id,
      content,
      timestamp: new Date(),
    });

    post.comments.push(comment._id.toString());
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "firstName lastName profilePicture"
    );

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  }
);

// Get all comments for a specific post
export const getCommentsByPostId = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const comments = await Comment.find({ postId }).populate(
      "userId",
      "firstName lastName profilePicture"
    );

    res.status(200).json({
      comments,
      message:
        comments.length === 0
          ? "No comments found for this post."
          : "Comments retrieved successfully.",
    });
  }
);

// Get a single comment by its ID
export const getCommentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params;
  

    if (!commentId || commentId.trim() === "") {
      res.status(400);
      throw new Error("Comment ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400);
      throw new Error("Invalid Comment ID");
    }

    const comment = await Comment.findById(commentId).populate(
      "userId",
      "firstName lastName profilePicture"
    );

    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }

    res.status(200).json(comment);
  }
);

// Get all comments by a specific user
export const getCommentsByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const comments = await Comment.find({ userId }).populate(
      "userId",
      "firstName lastName profilePicture"
    );

    if (!comments || comments.length === 0) {
      res.status(404);
      throw new Error("No comments found for this user");
    }

    res.status(200).json(comments);
  }
);

// Update an existing comment
export const updateComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params;

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }

    const userId = req.user!.id;

    // Check if the logged-in user is the author of the comment
    if (comment.userId.toString() !== userId) {
      res.status(403);
      throw new Error("Unauthorized to update this comment");
    }

    const { content } = req.body;

    if (!content) {
      res.status(400);
      throw new Error("Content is required");
    }

    // Update the comment's content and timestamp
    comment.content = content;
    comment.timestamp = new Date();
    await comment.save();

    const updatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "firstName lastName profilePicture"
    );

    res.status(200).json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  }
);

// Delete a comment
export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user!.id.toString();

    console.log("🔹 Deleting comment with ID:", commentId);
    console.log("🔹 Requesting user ID:", userId);

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }

    // Check if the logged-in user is the author of the comment
    if (comment.userId.toString() !== userId.toString()) {
      res.status(403);
      throw new Error("Unauthorized to delete this comment");
    }

    // Delete the comment
    await comment.deleteOne();

    // Remove the comment ID from the associated post and update the comment count
    await Post.findByIdAndUpdate(
      comment.postId,
      {
        $pull: { comments: commentId },
      },
      { new: true }
    );

    const updatedPost = await Post.findById(comment.postId);

    res.status(200).json({
      message: "Comment deleted successfully",
      numOfComments: updatedPost?.comments.length,
    });
  }
);

// Delete all comments by post ID
export const deleteAllComments = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params;

    // Validate if user is a host
    if (!req.user?.id || req.user?.isHost === false) {
      res.status(403);
      throw new Error("Unauthorized: Only hosts can perform this action");
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    // Clear the comments array and reset comment count
    post.comments = [];
    await post.save();

    res.status(200).json({
      message: "All comments deleted successfully",
      post,
      commentAmount: post.comments.length,
    });
  }
);
