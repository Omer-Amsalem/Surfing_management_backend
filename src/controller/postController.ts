import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Post from "../models/postModel";
import User from "../models/userModel";
import Comment from "../models/commentModel";

// Create Post (Host Only)
export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const { date, time, minimumWaveHeight, maximumWaveHeight, averageWindSpeed, description, photoUrl } = req.body;

    if (!user.isHost) {
        res.status(403);
        throw new Error("Only hosts can create posts");
    }

    if (!date || !time || !minimumWaveHeight || !maximumWaveHeight || !description) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const formattedDate = convertIsraeliDateToDate(date);

    const post = new Post({
        date: formattedDate, 
        time,
        minimumWaveHeight,
        maximumWaveHeight,
        averageWindSpeed,
        description,
        photoUrl,
        createdBy: user._id,
    });

    await post.save();
    res.status(201).json({
        message: "Post created successfully",
        post
    });
});


// Get All Posts
export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
    const posts = await Post.find().sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => ({
        ...post.toObject(), // Convert the post to a plain object
        date: convertDateToIsraeliDate(post.date), // Add a formatted date
    }));

    res.status(200).json(formattedPosts); // Return the updated list of posts
});

// Get Future Posts Only
export const getFuturePosts = asyncHandler(async (req: Request, res: Response) => {
    const today = new Date();

    const posts = await Post.find({ date: { $gte: today } }).sort({ date: 1 });

    const formattedPosts = posts.map(post => ({
        ...post.toObject(),
        date: convertDateToIsraeliDate(post.date), 
    }));

    res.status(200).json(formattedPosts);
});

// Get Post By ID
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    const formattedPost = {
        ...post.toObject(), 
        date: convertDateToIsraeliDate(post.date), 
    };

    res.status(200).json(formattedPost); 
});



// Update Post (Host Only)
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const { id } = req.params;
    const { date, time, minimumWaveHeight, maximumWaveHeight, averageWindSpeed, description, photoUrl } = req.body;

    if (!user.isHost) {
        res.status(403);
        throw new Error("Only hosts can update posts");
    }

    const post = await Post.findById(id);

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    const formattedDate = date ? convertIsraeliDateToDate(date) : undefined;

    post.date = formattedDate || post.date;
    post.time = time || post.time;
    post.minimumWaveHeight = minimumWaveHeight || post.minimumWaveHeight;
    post.maximumWaveHeight = maximumWaveHeight || post.maximumWaveHeight;
    post.averageWindSpeed = averageWindSpeed || post.averageWindSpeed;
    post.description = description || post.description;
    post.photoUrl = photoUrl || post.photoUrl;

    const updatedPost = await post.save();

    const formattedPost = {
        ...updatedPost.toObject(), 
        date: convertDateToIsraeliDate(updatedPost.date),
    };

    res.status(200).json({
        message: "Post updated successfully",
        updatedPost: formattedPost,
    });
});



// Delete Post (Host Only)
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

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
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
        // if user alrady did a like it will be - unlike
        post.likes = post.likes.filter((like) => like !== userId);
        post.likeCount = post.likes.length;
        await post.save();

        res.status(200).json({ 
            message: "Like removed successfully", 
            likeCount: post.likeCount 
        });
    }
    else{
    // if the user did not push like, the like will be added
        post.likes.push(userId);
        post.likeCount = post.likes.length;
        await post.save();

        res.status(200).json({
            message: "Post liked successfully",
            likeCount: post.likeCount
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
        // If the user is already a participant, remove hem (unjoin)
        post.participants = post.participants.filter((participant) => participant !== userId);
        post.participantCount = post.participants.length;
        user.activityCount = user.activityCount - 1;
        await post.save();

        res.status(200).json({ 
            message: "Participation removed successfully", 
            participantCount: post.participantCount 
        });
    } else {
        // If the user is not a participant yet, add them (join)
        post.participants.push(userId);
        post.participantCount = post.participants.length;
        user.activityCount = user.activityCount + 1;
        await post.save();

        res.status(200).json({ 
            message: "Participation confirmed successfully", 
            participantCount: post.participantCount 
        });
    }
});


/////////////////////---helpers---///////////////////////////


//Change an israeli date fotmat to a valid Mongo date format - YYYY/MM/DD
function convertIsraeliDateToDate(dateString: string): Date | null {
    if (!dateString) return null; 

    const [day, month, year] = dateString.split("/"); 
    const parsedDate = new Date(`${year}-${month}-${day}`); 

    if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format. Expected format: DD/MM/YYYY");
    }

    return parsedDate; 
}


// Change a valid Mongo date format to an israeli date fotmat - DD/MM/YYYY
function convertDateToIsraeliDate(date: Date): string | null {

    const day = date.getDate().toString().padStart(2, "0"); 
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); 
    const year = date.getFullYear(); 

    return `${day}/${month}/${year}`;
}
