import express from "express";
import {
    createPost,
    getAllPosts,
    getFuturePosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    joinPost,
} from "../controller/postController";
import { auth } from "../controller/userController";

const router = express.Router();

router.post("/", auth, createPost);

router.get("/", getAllPosts);

router.get("/future", getFuturePosts);

router.get("/:id", getPostById);

router.patch("/:id", auth, updatePost);

router.delete("/:id", auth, deletePost);

router.post("/:id/like", auth, likePost);

router.post("/:id/join", auth, joinPost);

export default router;
