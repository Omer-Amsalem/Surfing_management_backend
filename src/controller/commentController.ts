import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel"; 
import Post from "../models/postModel"; 
import { timeStamp } from "console";


// Create a new comment
export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id; 
    const { postId, content } = req.body;

    if (!postId || !content) {
        res.status(400);
        throw new Error("Post ID and content are required");
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400);
        throw new Error("Invalid Post ID");
    }

    const post = await Post.findById(postId);

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    const comment = await Comment.create({
        postId,
        userId,
        content,
        timestamp: new Date(),
    });

    post.comments.push(comment._id.toString()); 
    post.commentCount = post.comments.length; 
    await post.save(); 

    res.status(201).json({
        message: "Comment added successfully",
        comment,
        newCommentsNum: post.commentCount
    });
});


// Get all comments for a specific post
export const getCommentsByPostId = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;

    const comments = await Comment.find({ postId });
    const post = await Post.findById(postId);

    if (!postId) {
        res.status(400);
        throw new Error("Post ID is required");
    }

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    if (!comments || comments.length === 0) {
        res.status(404);
        throw new Error("No comments found for this post");
    }

    res.status(200).json(comments);
});

// Get a single comment by its ID
export const getCommentById = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;

    console.log("commentId:", commentId)

    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }

    res.status(200).json(comment);
});

// Get all comments by a specific user
export const getCommentsByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const comments = await Comment.find({ userId });

    if (!comments || comments.length === 0) {
        res.status(404);
        throw new Error("No comments found for this user");
    }

    res.status(200).json(comments);
});

// Update an existing comment
export const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }

    // Check if the logged-in user is the author of the comment
    if (comment.userId !== userId) {
        res.status(403);
        throw new Error("Unauthorized to update this comment");
    }

    // Update the comment's content and timestamp
    comment.content = content;
    comment.timestamp = new Date();
    await comment.save();

    res.status(200).json({
        message: "Comment updated successfully",
        comment,
        timeStamp: new Date()
    });
});

// Delete a comment
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user!.id;

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }

    // Check if the logged-in user is the author of the comment
    if (comment.userId !== userId) {
        res.status(403);
        throw new Error("Unauthorized to delete this comment");
    }

    // Delete the comment
    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully" });
});


// Delete all comments by post ID
export const deleteAllComments = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;

    // Validate if user is a host
    if (!req.user || req.user.role !== "host") {
        res.status(403);
        throw new Error("Unauthorized: Only hosts can perform this action");
    }

    // Validate Post ID
    if (!postId) {
        res.status(400);
        throw new Error("Post ID is required");
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    // Clear the comments array and reset comment count
    post.comments = []; 
    post.commentCount = 0; 
    await post.save();

    res.status(200).json({
        message: "All comments deleted successfully",
        post,
        commentAmount: post.commentCount
    });
});

