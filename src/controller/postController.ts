import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Post from "../models/postModel";
import User from "../models/userModel";
import Comment from "../models/commentModel";

// Create Post (Host Only)
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    date,
    time,
    minimumWaveHeight,
    maximumWaveHeight,
    averageWindSpeed,
    description,
  } = req.body;

  if (!user.isHost) {
    res.status(403);
    throw new Error("Only hosts can create posts");
  }

  if (
    !date ||
    !time ||
    !minimumWaveHeight ||
    !maximumWaveHeight ||
    !description
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const post = new Post({
    date,
    time,
    minimumWaveHeight,
    maximumWaveHeight,
    averageWindSpeed,
    description,
    photoUrl: req.file ? req.file.path : undefined,
    createdBy: user._id,
  });

  await post.save();
  res.status(201).json({
    message: "Post created successfully",
    post,
  });
});

// Get All Posts
export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.status(200).json(posts);
});

// Get Future Posts Only
export const getFuturePosts = asyncHandler(
  async (req: Request, res: Response) => {
    const today = new Date();
    const posts = await Post.find({ date: { $gte: today } }).sort({ date: 1 });
    res.status(200).json(posts);
  }
);

// Get Post By ID
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.status(200).json(post);
});

// Get participants by post id
export const getParticipantsByPostId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await Post.findById(id).populate(
      "participants",
      "_id firstName lastName role profilePicture"
    );

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    res.status(200).json(post.participants);
  }
);

// Update Post (Host Only)
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const {
    date,
    time,
    minimumWaveHeight,
    maximumWaveHeight,
    averageWindSpeed,
    description,
    photoUrl,
  } = req.body;

  if (!user.isHost) {
    res.status(403);
    throw new Error("Only hosts can update posts");
  }

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.date = date || post.date;
  post.time = time || post.time;
  post.minimumWaveHeight = minimumWaveHeight || post.minimumWaveHeight;
  post.maximumWaveHeight = maximumWaveHeight || post.maximumWaveHeight;
  post.averageWindSpeed = averageWindSpeed || post.averageWindSpeed;
  post.description = description || post.description;
  post.photoUrl = photoUrl || req.file?.path || post.photoUrl;

  const updatedPost = await post.save();

  res.status(200).json({
    message: "Post updated successfully",
    updatedPost,
  });
});

// Like or unlike a Post
export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const userId = user.id.toString();

  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter((like) => like !== userId);
    post.likeCount = post.likes.length;
    await post.save();

    res.status(200).json({
      message: "Like removed successfully",
      likeCount: post.likeCount,
      likes: post.likes,
    });
  } else {
    post.likes.push(userId);
    post.likeCount = post.likes.length;
    await post.save();

    res.status(200).json({
      message: "Post liked successfully",
      likeCount: post.likeCount,
      likes: post.likes,
    });
  }
});

// Join or Unjoin a Post
export const joinPost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const userId = user.id.toString();

  if (post.participants.includes(userId)) {
    post.participants = post.participants.filter(
      (participant) => participant.toString() !== userId
    );
    user.userActivity = user.userActivity.filter(
      (activity) => activity.toString() !== post.id
    );

    await post.save();
    await user.save();

    const populatedParticipants = await Post.findById(id).populate(
      "participants",
      "_id firstName lastName role profilePicture"
    );

    res.status(200).json({
      message: "Participation removed successfully",
      participants: populatedParticipants?.participants || [],
      participantCount: post.participants.length,
      userActivity: user.userActivity,
      userActivityCount: user.userActivity.length,
    });
  } else {
    post.participants.push(userId);
    user.userActivity.push(post.id);

    await post.save();
    await user.save();

    const populatedParticipants = await Post.findById(id).populate(
      "participants",
      "_id firstName lastName role profilePicture"
    );

    res.status(200).json({
      message: "Participation confirmed successfully",
      participants: populatedParticipants?.participants || [],
      participantCount: post.participants.length,
      userActivity: user.userActivity,
      userActivityCount: user.userActivity.length,
    });
  }
});

// Delete All Likes
export const deleteAllLikes = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;
    const { id } = req.params;

    if (!user.isHost) {
      res.status(403);
      throw new Error("Only hosts can delete likes");
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    post.likes = [];
    post.likeCount = 0;
    await post.save();

    res.status(200).json({
      message: "All likes deleted successfully",
      likeCount: post.likeCount,
    });
  }
);

// Delete All Participants
export const deleteAllParticipants = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user!;
    const { id } = req.params;

    if (!user.isHost) {
      res.status(403);
      throw new Error("Only hosts can delete participants");
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    post.participants = [];
    await post.save();

    res.status(200).json({
      message: "All participants deleted successfully",
      participantCount: post.participants.length,
    });
  }
);

// Delete Post deeply (Host Only)
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  if (!user.isHost) {
    res.status(403);
    throw new Error("Only hosts can delete posts");
  }

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  await Comment.deleteMany({ _id: { $in: post.comments } });

  await post.deleteOne();

  res
    .status(200)
    .json({ message: "Post and its comments deleted successfully" });
});

/////////////////////---helpers---///////////////////////////
//Change an israeli date fotmat to a valid Mongo date format - YYYY/MM/DD
export function convertIsraeliDateToDate(dateString: string): Date | null {
  if (!dateString) return null;

  const [day, month, year] = dateString.split("/");
  const parsedDate = new Date(`${year}-${month}-${day}`);

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format. Expected format: DD/MM/YYYY");
  }

  return parsedDate;
}

// Change a valid Mongo date format to an israeli date fotmat - DD/MM/YYYY
export function convertDateToIsraeliDate(date: Date): string | null {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}